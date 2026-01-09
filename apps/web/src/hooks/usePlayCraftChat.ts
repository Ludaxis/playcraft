import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import {
  generateCode,
  generateCodeWithContext,
  type GenerateRequest,
  type ContextAwareRequest,
  type ImageAttachment,
} from '../lib/playcraftService';
import { buildContext, preflightEstimate, type ContextPackage } from '../lib/contextBuilder';
import type { FileEdit } from '../lib/editApplyService';
import { getProjectMemory, initializeProjectMemory } from '../lib/projectMemoryService';
import { updateMemoryFromResponse } from '../lib/memoryUpdater';
import { getConversationContext, summarizeInBackground } from '../lib/conversationSummarizer';
import { detectChanges } from '../lib/fileHashService';
import {
  validateCode,
  createErrorFixPrompt,
  areErrorsAutoFixable,
  parseESLintErrors,
  parsePreviewErrors,
  type CodeError,
  type PreviewError,
} from '../lib/codeValidator';
import { recordGenerationOutcome } from '../lib/outcomeService';
import { indexProjectFiles } from '../lib/embeddingIndexer';
import {
  recordTurnComplete,
  extractGoalFromPrompt,
  setNewGoal,
} from '../lib/taskLedgerService';
import {
  predictNextSteps,
  extractPredictionContext,
  getInitialSuggestions,
} from '../lib/nextStepPredictionService';
import type { ChatMessage, GenerationStage, GenerationProgress } from '../types';

// Re-export ChatMessage for backwards compatibility
export type { ChatMessage } from '../types';
export type { GenerationStage, GenerationProgress } from '../types';

// Helper to parse AI response and extract features
function parseAIResponse(message: string): {
  content: string;
  features: string[];
} {
  const features: string[] = [];
  const content = message;

  // Extract bullet points that start with common bullet characters
  const bulletRegex = /^[\s]*[-•*]\s*(.+)$/gmu;
  const bullets = message.match(bulletRegex);
  if (bullets) {
    bullets.forEach(bullet => {
      const cleaned = bullet.replace(/^[\s]*[-•*]\s*/, '').trim();
      if (cleaned.length > 0 && cleaned.length < 100) {
        features.push(cleaned);
      }
    });
  }

  return {
    content,
    features: features.slice(0, 5),
  };
}

interface UsePlayCraftChatOptions {
  projectId?: string; // Project ID for context tracking
  templateId?: string; // Template being used
  onFilesGenerated?: (files: Array<{ path: string; content: string }>) => Promise<void>;
  onEditsGenerated?: (edits: FileEdit[], readFile: (path: string) => Promise<string | null>) => Promise<{ success: boolean; errors: string[] }>;
  onNeedsThreeJs?: () => Promise<void>; // Called when AI requests Three.js
  onFirstPrompt?: (prompt: string) => void; // Called immediately when first prompt is sent (for naming)
  onGameNameDetected?: (name: string) => void; // Called when AI generates a game with a title
  readFile?: (path: string) => Promise<string>;
  readAllFiles?: () => Promise<Record<string, string>>; // Read all project files
  hasThreeJs?: boolean; // Whether Three.js template is already loaded
  useSmartContext?: boolean; // Enable smart context system (default: true if projectId provided)
  initialMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; // Restore previous conversation
  runTypeCheck?: () => Promise<string>; // Run TypeScript check, return error output
  runESLint?: () => Promise<string>; // Run ESLint, return JSON output
  enableAutoFix?: boolean; // Enable automatic error fixing (default: true)
  maxRetries?: number; // Max auto-fix attempts (default: 3)
  voyageApiKey?: string; // Voyage AI API key for semantic search
  previewErrors?: PreviewError[]; // Runtime errors from preview iframe
  clearPreviewErrors?: () => void; // Clear preview errors after fix
}

export interface UsePlayCraftChatReturn {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  error: string | null;
  /** Send a message to the AI. Set chatOnly=true for discussion without code edits. images for vision analysis. */
  sendMessage: (prompt: string, selectedFile?: string, chatOnly?: boolean, images?: ImageAttachment[]) => Promise<void>;
  clearMessages: () => void;
  addSystemMessage: (content: string) => void;
  /** Current suggestions for the chatbox (from last assistant message or initial) */
  suggestions: Array<{ label: string; prompt: string }>;
}

// Default welcome message
const DEFAULT_WELCOME_MESSAGE: ChatMessage = {
  id: '1',
  role: 'assistant',
  content:
    "Hi! I'm PlayCraft, your AI game builder. Describe the game you want to create and I'll build it for you!",
  timestamp: new Date(),
  nextSteps: [
    { label: 'Create a snake game', prompt: 'Create a classic snake game with arrow key controls, food collection, and score tracking' },
    { label: 'Build a platformer', prompt: 'Create a 2D platformer game with a jumping character, platforms, and collectible coins' },
    { label: 'Make a puzzle game', prompt: 'Create a match-3 puzzle game like Candy Crush with colorful tiles and scoring' },
  ],
};

// Convert stored messages to ChatMessage format
function convertToDisplayMessages(
  storedMessages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>
): ChatMessage[] {
  if (!storedMessages || storedMessages.length === 0) {
    return [DEFAULT_WELCOME_MESSAGE];
  }

  return storedMessages.map((m, i) => ({
    id: `restored-${i}-${Date.now()}`,
    role: m.role,
    content: m.content,
    timestamp: new Date(),
  }));
}

/**
 * Extract game name from generated files
 * Looks for: <title> tag, h1 headings, component titles, comments
 */
function extractGameName(files: Array<{ path: string; content: string }>): string | null {
  // Skip default/placeholder titles
  const defaultTitles = [
    'PlayCraft Game', 'Vite + React + TS', 'Vite App', 'React App',
    'Game', 'My Game', 'New Game', 'Untitled', 'Untitled Game'
  ];

  const isValidTitle = (title: string) => {
    const trimmed = title.trim();
    return trimmed.length >= 3 &&
           trimmed.length <= 60 &&
           !defaultTitles.includes(trimmed) &&
           !/^(index|app|main|game)$/i.test(trimmed);
  };

  // 1. Look for index.html <title> tag
  const indexHtml = files.find(f => f.path.includes('index.html'));
  if (indexHtml) {
    const titleMatch = indexHtml.content.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1] && isValidTitle(titleMatch[1])) {
      return titleMatch[1].trim();
    }
  }

  // 2. Look for h1 in main component (Index.tsx, App.tsx, Game.tsx)
  const mainFiles = files.filter(f =>
    /\/(Index|App|Game|Main)\.tsx$/i.test(f.path)
  );

  for (const file of mainFiles) {
    // Look for <h1>Game Title</h1> or className="title">Game Title<
    const h1Match = file.content.match(/<h1[^>]*>([^<]+)<\/h1>/i);
    if (h1Match && h1Match[1] && isValidTitle(h1Match[1])) {
      return h1Match[1].trim();
    }

    // Look for title in JSX: title="Game Name" or gameTitle="..."
    const titlePropMatch = file.content.match(/(?:title|gameTitle|gameName)\s*[=:]\s*["']([^"']+)["']/i);
    if (titlePropMatch && titlePropMatch[1] && isValidTitle(titlePropMatch[1])) {
      return titlePropMatch[1].trim();
    }

    // Look for GAME_TITLE constant
    const constMatch = file.content.match(/(?:GAME_TITLE|GAME_NAME|APP_TITLE)\s*=\s*["']([^"']+)["']/i);
    if (constMatch && constMatch[1] && isValidTitle(constMatch[1])) {
      return constMatch[1].trim();
    }
  }

  // 3. Look for title in comments: /* Game: GameName */ or // GameName - A game
  for (const file of mainFiles) {
    const commentMatch = file.content.match(/\/[/*]\s*(?:Game:|Title:)?\s*([A-Z][^*\n]+?)(?:\s*[-–—]\s*|\s*\*\/|\n)/);
    if (commentMatch && commentMatch[1] && isValidTitle(commentMatch[1])) {
      return commentMatch[1].trim();
    }
  }

  return null;
}

export function usePlayCraftChat(options: UsePlayCraftChatOptions = {}): UsePlayCraftChatReturn {
  const {
    projectId,
    templateId,
    onFilesGenerated,
    onEditsGenerated,
    onNeedsThreeJs,
    onFirstPrompt,
    onGameNameDetected,
    readFile,
    readAllFiles,
    hasThreeJs = false,
    useSmartContext,
    initialMessages,
    runTypeCheck,
    runESLint,
    enableAutoFix = true,
    maxRetries = 3,
    voyageApiKey,
    previewErrors = [],
    clearPreviewErrors,
  } = options;

  // Determine if we should use smart context
  const enableSmartContext = useSmartContext ?? !!projectId;

  // Initialize messages from stored conversation or default welcome
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    convertToDisplayMessages(initialMessages || [])
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<GenerationProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Helper to update progress stage with rich detail/logging
  const updateProgress = useCallback(
    (
      stage: GenerationStage,
      detail?: string,
      meta?: { activeItem?: string; completed?: number; total?: number; etaMs?: number }
    ) => {
      const messages: Record<GenerationStage, string> = {
        idle: '',
        preparing: 'Preparing context...',
        analyzing: 'Analyzing your request...',
        generating: 'Writing code...',
        processing: 'Processing response...',
        applying: 'Applying changes...',
        validating: 'Checking for errors...',
        retrying: 'Auto-fixing errors...',
        complete: 'Done!',
        error: 'Something went wrong',
      };

      if (stage === 'idle') {
        setGenerationProgress(null);
        return;
      }

      setGenerationProgress(prev => {
        const isSameStage = prev?.stage === stage;
        const log = [...(prev?.log || [])];
        if (detail && (!log.length || log[log.length - 1] !== detail)) {
          log.push(detail);
        }

        return {
          stage,
          message: messages[stage],
          startedAt: isSameStage && prev ? prev.startedAt : Date.now(),
          detail,
          log: log.slice(-6), // keep recent ticks
          activeItem: meta?.activeItem ?? prev?.activeItem,
          completed: meta?.completed ?? prev?.completed,
          total: meta?.total ?? prev?.total,
          etaMs: meta?.etaMs ?? prev?.etaMs,
        };
      });
    },
    []
  );

  // Track if initial messages were provided to avoid re-initialization
  const initializedRef = useRef(false);

  // Update messages when initialMessages changes (e.g., switching chat sessions)
  useEffect(() => {
    // Skip the first render since useState already handles it
    if (!initializedRef.current) {
      initializedRef.current = true;
      return;
    }

    // Only update if we have new initial messages
    if (initialMessages && initialMessages.length > 0) {
      console.log('[usePlayCraftChat] Restoring', initialMessages.length, 'messages from session');
      setMessages(convertToDisplayMessages(initialMessages));
    }
  }, [initialMessages]);

  // Keep track of generated files for context
  const filesRef = useRef<Record<string, string>>({});

  // Track message count for summarization
  const messageCountRef = useRef(0);

  // Initialize project memory when project ID is set
  useEffect(() => {
    if (projectId && enableSmartContext) {
      initializeProjectMemory(projectId).catch(err => {
        console.warn('[usePlayCraftChat] Failed to initialize memory:', err);
      });
    }
  }, [projectId, enableSmartContext]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id'> & { timestamp?: Date }) => {
    const newMessage: ChatMessage = {
      ...message,
      id: Date.now().toString() + Math.random().toString(36).slice(2),
      timestamp: message.timestamp || new Date(),
    };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  }, []);

  const addSystemMessage = useCallback((content: string) => {
    addMessage({ role: 'system', content });
  }, [addMessage]);

  const clearMessages = useCallback(() => {
    setMessages([DEFAULT_WELCOME_MESSAGE]);
    filesRef.current = {};
  }, []);

  // Backfill nextSteps for restored assistant messages when missing
  useEffect(() => {
    // Find last assistant message without nextSteps
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant') {
        if (msg.nextSteps && msg.nextSteps.length > 0) return; // already present
        const context = extractPredictionContext(messages, filesRef.current, hasThreeJs, undefined);
        const nextSteps = predictNextSteps({ ...context, lastAssistantResponse: msg.content });
        setMessages((prev) => {
          const cloned = [...prev];
          const idx = cloned.findIndex((m) => m.id === msg.id);
          if (idx === -1) return prev;
          cloned[idx] = { ...cloned[idx], nextSteps };
          return cloned;
        });
        return;
      }
    }
  }, [messages, hasThreeJs]);

  const sendMessage = useCallback(
    async (prompt: string, selectedFile?: string, chatOnly?: boolean, images?: ImageAttachment[]) => {
      if (!prompt.trim() || isGenerating) return;

      // Call onFirstPrompt immediately when first message is sent (for AI naming)
      const isFirstMessage = messageCountRef.current === 0;
      if (isFirstMessage && onFirstPrompt) {
        onFirstPrompt(prompt);
      }

      setError(null);
      setIsGenerating(true);
      updateProgress('preparing', 'Building context...');

      // Track generation timing
      const generationStartTime = Date.now();

      // Modify prompt for chat-only mode (discussion without code edits)
      let effectivePrompt = prompt;
      if (chatOnly) {
        effectivePrompt = `[CHAT MODE - Do NOT generate or modify any code files. Respond with explanation/discussion only.]\n\n${prompt}`;
      }

      // Add user message (show original prompt to user, not the modified one)
      addMessage({ role: 'user', content: prompt });
      messageCountRef.current++;

      try {
        let response;
        let contextPackage: ContextPackage | undefined;

        // Use smart context if enabled and we have a project ID
        if (enableSmartContext && projectId) {
          // Get all current files
          let currentFiles: Record<string, string> = { ...filesRef.current };

          // Try to read all files from WebContainer
          if (readAllFiles) {
            try {
              updateProgress('preparing', 'Reading project files...');
              const allFiles = await readAllFiles();
              currentFiles = { ...currentFiles, ...allFiles };
              updateProgress('preparing', `Loaded ${Object.keys(currentFiles).length} files`, {
                total: Object.keys(currentFiles).length,
                completed: 0,
              });
            } catch {
              // Fall back to cached files
            }
          } else if (selectedFile && readFile) {
            // At minimum, read the selected file
            try {
              const content = await readFile(selectedFile);
              currentFiles[selectedFile] = content;
            } catch {
              // File might not exist yet
            }
          }

          // Detect what changed since last request
          const changes = await detectChanges(projectId, currentFiles);
          const changedFiles = [...changes.created, ...changes.modified];
          updateProgress(
            'preparing',
            `Detected ${changedFiles.length} change${changedFiles.length === 1 ? '' : 's'} since last turn`,
            { total: Object.keys(currentFiles).length, completed: changedFiles.length }
          );

          // Get project memory
          const projectMemory = await getProjectMemory(projectId);

          // Get conversation context (summaries + recent messages)
          const { summaries, recentMessages } = await getConversationContext(
            projectId,
            messages.map(m => ({ role: m.role, content: m.content }))
          );

          // Preflight estimate (Phase 4.4) - estimate tokens before building full context
          const estimate = preflightEstimate(
            effectivePrompt,
            currentFiles,
            selectedFile,
            recentMessages,
            projectMemory
          );
          console.log(
            `[usePlayCraftChat] Preflight: intent=${estimate.intent}, budget=${estimate.tokenBudget}, ` +
            `est=${estimate.estimatedTokens}, mode=${estimate.recommendedMode}`
          );
          updateProgress(
            'preparing',
            `Plan: ${estimate.recommendedMode} mode, ~${estimate.estimatedTokens}/${estimate.tokenBudget} tokens`,
            { activeItem: selectedFile }
          );

          // Build smart context package with optional semantic search
          contextPackage = await buildContext(
            projectId,
            effectivePrompt,
            currentFiles,
            selectedFile,
            recentMessages,
            changedFiles,
            projectMemory,
            summaries.map((s, i) => ({
              summary_text: s,
              tasks_completed: [],
              files_modified: [],
              sequence_number: i,
            })),
            // Enable hybrid retrieval if Voyage API key is available
            voyageApiKey ? {
              enableSemanticSearch: true,
              voyageApiKey,
            } : undefined
          );

          // Log context efficiency
          console.log(
            `[usePlayCraftChat] Smart context: ${contextPackage.relevantFiles.length} files, ~${contextPackage.estimatedTokens} tokens`
          );

          // Update progress to analyzing (Gemini)
          updateProgress(
            'analyzing',
            `Context: ${contextPackage.relevantFiles.length} file${contextPackage.relevantFiles.length === 1 ? '' : 's'} (${contextPackage.contextMode})`,
            {
              completed: contextPackage.relevantFiles.length,
              total: Object.keys(currentFiles).length,
              activeItem: contextPackage.relevantFiles[0]?.path,
            }
          );

          // Make context-aware request (Gemini on server)
          const request: ContextAwareRequest = {
            prompt: effectivePrompt,
            projectId,
            templateId,
            hasThreeJs,
            images, // Include attached images for vision AI
            contextPackage,
          };

          updateProgress('generating', 'AI is drafting code...');
          response = await generateCodeWithContext(request);
          updateProgress('processing', 'Parsing AI response...');

          // Update memory from response (background)
          updateMemoryFromResponse(projectId, prompt, response, selectedFile).catch(err => {
            console.warn('[usePlayCraftChat] Failed to update memory:', err);
          });

          // Index new/modified files for semantic search (background)
          if (voyageApiKey && response.files?.length) {
            const filesToIndex = response.files.reduce((acc, f) => {
              acc[f.path] = f.content;
              return acc;
            }, {} as Record<string, string>);

            indexProjectFiles(projectId, filesToIndex, voyageApiKey)
              .then(result => {
                if (result.chunksCreated > 0) {
                  console.log(`[usePlayCraftChat] Indexed ${result.filesIndexed} files, ${result.chunksCreated} chunks`);
                }
              })
              .catch(err => {
                console.warn('[usePlayCraftChat] Failed to index files:', err);
              });
          }

          // Trigger background summarization
          summarizeInBackground(
            projectId,
            messages.map(m => ({ role: m.role, content: m.content })),
            messageCountRef.current
          );
        } else {
          // Legacy mode: Use old context system
          updateProgress('generating', 'Using basic context mode...');
          const currentFiles: Record<string, string> = { ...filesRef.current };

          if (selectedFile && readFile) {
            try {
              const content = await readFile(selectedFile);
              currentFiles[selectedFile] = content;
            } catch {
              // File might not exist yet
            }
          }

          const conversationHistory = messages
            .filter((m) => m.role === 'user' || m.role === 'assistant')
            .slice(-10)
            .map((m) => ({
              role: m.role as 'user' | 'assistant',
              content: m.content,
            }));

          const request: GenerateRequest = {
            prompt: effectivePrompt,
            currentFiles,
            selectedFile,
            conversationHistory,
            hasThreeJs,
            images, // Include attached images for vision AI
          };

          response = await generateCode(request);
          updateProgress('processing', 'Parsing AI response...');
        }

        // Check if AI requested Three.js
        if (response.needsThreeJs && !hasThreeJs && onNeedsThreeJs) {
          addMessage({
            role: 'system',
            content: 'This game needs 3D graphics. Installing Three.js...',
          });
          await onNeedsThreeJs();
        }

        // Handle plan/explanation modes (no file changes)
        const responseMode = response.mode || 'edit';
        if (responseMode === 'plan' || responseMode === 'explanation') {
          updateProgress('complete', responseMode === 'plan' ? 'Plan ready' : 'Explanation ready');

          // Format plan for display
          let formattedContent = response.message;
          if (responseMode === 'plan' && response.plan) {
            const plan = response.plan;
            formattedContent = `## ${plan.summary}\n\n`;
            formattedContent += '### Steps:\n';
            for (const step of plan.steps) {
              formattedContent += `${step.step}. ${step.description}`;
              if (step.files?.length) {
                formattedContent += ` (${step.files.join(', ')})`;
              }
              if (step.complexity) {
                formattedContent += ` [${step.complexity}]`;
              }
              formattedContent += '\n';
            }
            if (plan.considerations?.length) {
              formattedContent += '\n### Considerations:\n';
              for (const consideration of plan.considerations) {
                formattedContent += `- ${consideration}\n`;
              }
            }
            if (plan.estimatedEffort) {
              formattedContent += `\n**Estimated effort:** ${plan.estimatedEffort}`;
            }
          } else if (response.explanation) {
            formattedContent = response.explanation;
          }

          addMessage({
            role: 'assistant',
            content: formattedContent,
          });

          updateProgress('complete', 'Done!');
          return;
        }

        // Handle debug mode (show analysis + apply fixes)
        if (responseMode === 'debug' && response.debugAnalysis) {
          const debug = response.debugAnalysis;
          let debugContent = `## Debug Analysis\n\n`;
          debugContent += `**Issue:** ${debug.issue}\n\n`;
          debugContent += `**Root Cause:** ${debug.rootCause}\n\n`;
          debugContent += `**Affected Files:** ${debug.affectedFiles.join(', ')}\n\n`;
          debugContent += `**Fix:** ${debug.suggestedFix}\n\n`;
          if (debug.steps?.length) {
            debugContent += '**Steps to fix:**\n';
            for (const step of debug.steps) {
              debugContent += `- ${step}\n`;
            }
          }
          addMessage({
            role: 'assistant',
            content: debugContent,
          });
          // Continue to apply any fixes (edits) if provided
        }

        // Track what was applied
        let filesApplied = 0;
        let editsApplied = 0;

        // Handle edits (search/replace mode)
        if (response.edits && response.edits.length > 0 && onEditsGenerated && readFile) {
          updateProgress('applying', `Applying ${response.edits.length} edit(s)...`);
          console.log('[Chat] Applying', response.edits.length, 'edits in edit mode');
          const editResult = await onEditsGenerated(response.edits, async (path: string) => {
            return await readFile(path);
          });

          if (editResult.success) {
            editsApplied = response.edits.length;
            // Update file cache with edited content - need to re-read from source
            for (const edit of response.edits) {
              const normalizedPath = edit.file.startsWith('/') ? edit.file : `/${edit.file}`;
              try {
                const updatedContent = await readFile(normalizedPath);
                filesRef.current[normalizedPath] = updatedContent;
              } catch {
                // File might not exist, continue
              }
            }
          } else {
            console.warn('[Chat] Some edits failed:', editResult.errors);
            addMessage({
              role: 'system',
              content: `Warning: Some edits could not be applied: ${editResult.errors.join(', ')}`,
            });
          }
        }

        // Handle full file replacements
        if (response.files && response.files.length > 0) {
          updateProgress('applying', `Writing ${response.files.length} file(s)...`, {
            completed: response.files.length,
            total: response.files.length,
          });
          // Update our file cache
          for (const file of response.files) {
            const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
            filesRef.current[normalizedPath] = file.content;
          }

          // Apply files if callback provided
          if (onFilesGenerated) {
            await onFilesGenerated(response.files);
            filesApplied = response.files.length;

            // Try to detect game name from generated files
            if (onGameNameDetected) {
              const detectedName = extractGameName(response.files);
              if (detectedName) {
                console.log('[usePlayCraftChat] Detected game name:', detectedName);
                onGameNameDetected(detectedName);
              }
            }
          }
        }

        // Run validation and auto-fix if enabled
        let validationErrors: CodeError[] = [];
        let eslintErrors: CodeError[] = [];
        let runtimeErrors: CodeError[] = [];
        let autoFixAttempts = 0;
        let autoFixSucceeded = false;

        if (enableAutoFix && (filesApplied > 0 || editsApplied > 0)) {
          updateProgress('validating', 'Checking for errors...');

          try {
            // Collect TypeScript errors if runTypeCheck available
            if (runTypeCheck) {
              const tsOutput = await runTypeCheck();
              const validationResult = validateCode(tsOutput);
              validationErrors = validationResult.errors;
            }

            // Collect ESLint errors if available
            if (runESLint) {
              try {
                const eslintOutput = await runESLint();
                eslintErrors = parseESLintErrors(eslintOutput).filter(e => e.severity === 'error');
                if (eslintErrors.length > 0) {
                  console.log('[Chat] Found', eslintErrors.length, 'ESLint errors');
                }
              } catch (eslintErr) {
                console.warn('[Chat] ESLint check failed:', eslintErr);
              }
            }

            // Collect runtime/preview errors
            if (previewErrors.length > 0) {
              runtimeErrors = parsePreviewErrors(previewErrors).filter(e => e.severity === 'error');
              if (runtimeErrors.length > 0) {
                console.log('[Chat] Found', runtimeErrors.length, 'runtime errors');
              }
            }

            // Combine all errors for auto-fix
            const allErrors = [...validationErrors, ...eslintErrors, ...runtimeErrors];

            if (allErrors.length > 0) {
              const tsCount = validationErrors.length;
              const eslintCount = eslintErrors.length;
              const runtimeCount = runtimeErrors.length;

              const errorParts: string[] = [];
              if (tsCount > 0) errorParts.push(`${tsCount} TypeScript`);
              if (eslintCount > 0) errorParts.push(`${eslintCount} ESLint`);
              if (runtimeCount > 0) errorParts.push(`${runtimeCount} runtime`);

              updateProgress('validating', `Found ${errorParts.join(', ')} error${allErrors.length === 1 ? '' : 's'}`, {
                completed: 0,
                total: allErrors.length,
              });
              console.log('[Chat] Found', allErrors.length, 'total errors, attempting auto-fix...');

              // Check if errors are auto-fixable
              if (areErrorsAutoFixable(allErrors)) {
                let currentErrors = allErrors;

                while (currentErrors.length > 0 && autoFixAttempts < maxRetries) {
                  autoFixAttempts++;
                  updateProgress('retrying', `Auto-fix attempt ${autoFixAttempts}/${maxRetries}...`);

                  // Create error fix prompt
                  const fixPrompt = createErrorFixPrompt(prompt, currentErrors, filesRef.current);

                  // Call AI to fix errors (use simple generation, not full context rebuild)
                  const fixRequest: GenerateRequest = {
                    prompt: fixPrompt,
                    currentFiles: filesRef.current,
                    selectedFile: currentErrors[0]?.file,
                    conversationHistory: [],
                    hasThreeJs,
                  };

                  const fixResponse = await generateCode(fixRequest);
                  updateProgress('applying', 'Applying fixes...');

                  // Apply fixed files
                  if (fixResponse.files && fixResponse.files.length > 0) {
                    for (const file of fixResponse.files) {
                      const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
                      filesRef.current[normalizedPath] = file.content;
                    }
                    if (onFilesGenerated) {
                      await onFilesGenerated(fixResponse.files);
                    }
                  }

                  // Apply fixed edits
                  if (fixResponse.edits && fixResponse.edits.length > 0 && onEditsGenerated && readFile) {
                    await onEditsGenerated(fixResponse.edits, async (path: string) => {
                      return await readFile(path);
                    });
                    for (const edit of fixResponse.edits) {
                      const normalizedPath = edit.file.startsWith('/') ? edit.file : `/${edit.file}`;
                      try {
                        const updatedContent = await readFile(normalizedPath);
                        filesRef.current[normalizedPath] = updatedContent;
                      } catch {
                        // File might not exist
                      }
                    }
                  }

                  // Clear preview errors after applying fixes (they may be stale)
                  clearPreviewErrors?.();

                  // Re-validate TypeScript
                  updateProgress('validating', `Verifying fix ${autoFixAttempts}...`);
                  let revalidateErrors: CodeError[] = [];

                  if (runTypeCheck) {
                    const revalidateOutput = await runTypeCheck();
                    const revalidateResult = validateCode(revalidateOutput);
                    revalidateErrors = revalidateResult.errors;
                  }

                  if (revalidateErrors.length === 0) {
                    currentErrors = [];
                    autoFixSucceeded = true;
                    addMessage({
                      role: 'system',
                      content: `Auto-fixed ${allErrors.length} error${allErrors.length > 1 ? 's' : ''} in ${autoFixAttempts} attempt${autoFixAttempts > 1 ? 's' : ''}`,
                    });
                  } else {
                    currentErrors = revalidateErrors;
                    console.log('[Chat] Still have', currentErrors.length, 'errors after fix attempt', autoFixAttempts);
                  }
                }

                // If we still have errors after all retries, notify user
                if (currentErrors.length > 0) {
                  const errorSummary = currentErrors.slice(0, 3).map(e => `${e.file}:${e.line} - ${e.message}`).join('\n');
                  addMessage({
                    role: 'system',
                    content: `Could not auto-fix all errors after ${maxRetries} attempts. Remaining issues:\n${errorSummary}`,
                  });
                }
              } else {
                // Errors need user intervention (e.g., missing npm packages)
                const errorSummary = allErrors.slice(0, 3).map(e => `${e.file}:${e.line} - ${e.message}`).join('\n');
                addMessage({
                  role: 'system',
                  content: `Some errors need manual intervention:\n${errorSummary}`,
                });
              }
            }
          } catch (validationErr) {
            console.warn('[Chat] Validation failed:', validationErr);
          }
        }

        // Record generation outcome for learning system (async, non-blocking)
        if (projectId) {
          const durationMs = Date.now() - generationStartTime;
          const filesChanged = [
            ...(response.files?.map(f => f.path) || []),
            ...(response.edits?.map(e => e.file) || []),
          ];

          // Calculate selection quality metrics
          const filesSelectedForContext = contextPackage?.relevantFiles.map(f => f.path) || [];
          const filesActuallyModified = filesChanged;
          const hitCount = filesActuallyModified.filter(f => filesSelectedForContext.includes(f)).length;
          const selectionAccuracy = filesActuallyModified.length > 0
            ? hitCount / filesActuallyModified.length
            : 1;
          const missedFiles = filesActuallyModified.filter(f => !filesSelectedForContext.includes(f));

          recordGenerationOutcome({
            projectId,
            prompt,
            responseMode: response.edits && response.edits.length > 0 ? 'edit' : 'file',
            filesChanged,
            durationMs,
            hadTsErrors: validationErrors.length > 0,
            hadEslintErrors: eslintErrors.length > 0,
            hadRuntimeErrors: runtimeErrors.length > 0,
            errorCount: validationErrors.length + eslintErrors.length + runtimeErrors.length,
            autoFixAttempts,
            autoFixSucceeded: autoFixAttempts > 0 ? autoFixSucceeded : undefined,
            filesSelectedForContext,
            filesActuallyModified,
            selectionAccuracy,
            missedFiles,
          }).catch(err => {
            console.warn('[Chat] Failed to record outcome:', err);
          });

          // Record task delta for task ledger (async, non-blocking)
          const goalExtraction = extractGoalFromPrompt(prompt);

          // If this looks like a new goal, set it
          if (goalExtraction.isNewGoal && goalExtraction.goal) {
            setNewGoal(projectId, goalExtraction.goal).catch(err => {
              console.warn('[Chat] Failed to set new goal:', err);
            });
          }

          // Record what happened in this turn
          recordTurnComplete(projectId, {
            userRequest: prompt.substring(0, 200), // Truncate for storage
            whatTried: response.message?.substring(0, 200) || 'Generated code',
            whatChanged: filesChanged,
            whatSucceeded: autoFixSucceeded || validationErrors.length === 0
              ? `Applied ${filesApplied} file(s), ${editsApplied} edit(s)`
              : undefined,
            whatFailed: validationErrors.length > 0 && !autoFixSucceeded
              ? `${validationErrors.length} TypeScript error(s)`
              : undefined,
            whatNext: response.explanation?.substring(0, 200),
            newState: filesChanged.length > 0
              ? `Modified: ${filesChanged.slice(0, 3).map(f => f.split('/').pop()).join(', ')}`
              : undefined,
            tokensUsed: contextPackage?.estimatedTokens,
            durationMs,
          }).catch(err => {
            console.warn('[Chat] Failed to record task delta:', err);
          });
        }

        // Mark complete briefly before resetting
        updateProgress('complete');

        // Parse the AI response to extract features
        const fullContent = response.message + (response.explanation ? `\n\n${response.explanation}` : '');
        const parsed = parseAIResponse(fullContent);

        // Generate next step predictions using hybrid service
        const filesModified = [
          ...(response.files?.map(f => f.path) || []),
          ...(response.edits?.map(e => e.file) || []),
        ];
        const predictionContext = extractPredictionContext(
          messages,
          filesRef.current,
          hasThreeJs,
          validationErrors.length > 0
            ? validationErrors.map(e => `${e.file}:${e.line} - ${e.message}`)
            : undefined
        );
        predictionContext.lastUserPrompt = prompt;
        predictionContext.lastAssistantResponse = parsed.content;
        predictionContext.filesModified = filesModified;

        const nextSteps = predictNextSteps(predictionContext);

        // Add assistant response with parsed features and predictions
        addMessage({
          role: 'assistant',
          content: parsed.content,
          files: response.files,
          features: parsed.features,
          nextSteps,
        });
        messageCountRef.current++;

        // Add system message about changes made
        if (filesApplied > 0 || editsApplied > 0) {
          const parts: string[] = [];
          if (editsApplied > 0) {
            parts.push(`${editsApplied} edit${editsApplied > 1 ? 's' : ''}`);
          }
          if (filesApplied > 0) {
            const fileNames = response.files.map((f) => f.path.split('/').pop()).join(', ');
            parts.push(`${filesApplied} file${filesApplied > 1 ? 's' : ''}: ${fileNames}`);
          }
          addMessage({
            role: 'system',
            content: `Applied ${parts.join(' and ')}`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate code';
        setError(errorMessage);
        updateProgress('error', errorMessage);
        addMessage({
          role: 'system',
          content: `Error: ${errorMessage}. If this keeps happening, check CORS/network and Supabase function logs.`,
        });
      } finally {
        setIsGenerating(false);
        // Reset progress after a brief delay to show completion
        setTimeout(() => {
          updateProgress('idle');
        }, 1000);
      }
    },
    [isGenerating, messages, addMessage, onFilesGenerated, onEditsGenerated, onFirstPrompt, onGameNameDetected, readFile, readAllFiles, projectId, templateId, hasThreeJs, enableSmartContext, onNeedsThreeJs, updateProgress, runTypeCheck, runESLint, enableAutoFix, maxRetries, previewErrors, clearPreviewErrors]
  );

  // Compute current suggestions for the chatbox
  // Uses last assistant message's nextSteps or initial suggestions
  const suggestions = useMemo(() => {
    // Find the last assistant message with nextSteps
    for (let i = messages.length - 1; i >= 0; i--) {
      const msg = messages[i];
      if (msg.role === 'assistant' && msg.nextSteps && msg.nextSteps.length > 0) {
        return msg.nextSteps;
      }
    }
    // Fallback to initial suggestions
    return getInitialSuggestions();
  }, [messages]);

  return {
    messages,
    isGenerating,
    generationProgress,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
    suggestions,
  };
}
