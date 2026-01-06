import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateCode,
  generateCodeWithContext,
  type GenerateRequest,
  type ContextAwareRequest,
} from '../lib/playcraftService';
import { buildContext } from '../lib/contextBuilder';
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
  type CodeError,
} from '../lib/codeValidator';
import { recordGenerationOutcome } from '../lib/outcomeService';
import type { ChatMessage, NextStep, GenerationStage, GenerationProgress } from '../types';

// Re-export ChatMessage for backwards compatibility
export type { ChatMessage } from '../types';
export type { GenerationStage, GenerationProgress } from '../types';

// Helper to parse AI response and extract features/next steps
function parseAIResponse(message: string): {
  content: string;
  features: string[];
  nextSteps: NextStep[];
} {
  const features: string[] = [];
  const nextSteps: NextStep[] = [];
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

  // Generate smart next step suggestions based on content
  const lowerContent = content.toLowerCase();

  if (lowerContent.includes('game') || lowerContent.includes('created') || lowerContent.includes('built')) {
    nextSteps.push(
      { label: 'Add sound effects', prompt: 'Add sound effects for game actions like collecting items, jumping, and game over' },
      { label: 'Add animations', prompt: 'Add smooth animations for player movement and transitions' },
      { label: 'Add a leaderboard', prompt: 'Add a local leaderboard to track high scores' }
    );
  }

  if (lowerContent.includes('player') || lowerContent.includes('character')) {
    nextSteps.push(
      { label: 'Add power-ups', prompt: 'Add power-up items that give the player special abilities' },
      { label: 'Add enemies', prompt: 'Add enemies that the player must avoid or defeat' }
    );
  }

  if (lowerContent.includes('score') || lowerContent.includes('points')) {
    nextSteps.push(
      { label: 'Add combo system', prompt: 'Add a combo multiplier system for consecutive actions' }
    );
  }

  if (lowerContent.includes('level') || lowerContent.includes('stage')) {
    nextSteps.push(
      { label: 'Add more levels', prompt: 'Add 3 more levels with increasing difficulty' }
    );
  }

  // Limit to 3 suggestions
  return {
    content,
    features: features.slice(0, 5),
    nextSteps: nextSteps.slice(0, 3),
  };
}

interface UsePlayCraftChatOptions {
  projectId?: string; // Project ID for context tracking
  templateId?: string; // Template being used
  onFilesGenerated?: (files: Array<{ path: string; content: string }>) => Promise<void>;
  onEditsGenerated?: (edits: FileEdit[], readFile: (path: string) => Promise<string | null>) => Promise<{ success: boolean; errors: string[] }>;
  onNeedsThreeJs?: () => Promise<void>; // Called when AI requests Three.js
  readFile?: (path: string) => Promise<string>;
  readAllFiles?: () => Promise<Record<string, string>>; // Read all project files
  hasThreeJs?: boolean; // Whether Three.js template is already loaded
  useSmartContext?: boolean; // Enable smart context system (default: true if projectId provided)
  initialMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; // Restore previous conversation
  runTypeCheck?: () => Promise<string>; // Run TypeScript check, return error output
  runESLint?: () => Promise<string>; // Run ESLint, return JSON output
  enableAutoFix?: boolean; // Enable automatic error fixing (default: true)
  maxRetries?: number; // Max auto-fix attempts (default: 3)
}

export interface UsePlayCraftChatReturn {
  messages: ChatMessage[];
  isGenerating: boolean;
  generationProgress: GenerationProgress | null;
  error: string | null;
  sendMessage: (prompt: string, selectedFile?: string) => Promise<void>;
  clearMessages: () => void;
  addSystemMessage: (content: string) => void;
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

export function usePlayCraftChat(options: UsePlayCraftChatOptions = {}): UsePlayCraftChatReturn {
  const {
    projectId,
    templateId,
    onFilesGenerated,
    onEditsGenerated,
    onNeedsThreeJs,
    readFile,
    readAllFiles,
    hasThreeJs = false,
    useSmartContext,
    initialMessages,
    runTypeCheck,
    runESLint,
    enableAutoFix = true,
    maxRetries = 3,
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

  // Helper to update progress stage
  const updateProgress = useCallback((stage: GenerationStage, detail?: string) => {
    const messages: Record<GenerationStage, string> = {
      idle: '',
      preparing: 'Preparing context...',
      analyzing: 'Claude is understanding your request...',
      generating: 'Gemini is writing code...',
      processing: 'Processing response...',
      applying: 'Applying changes...',
      validating: 'Checking for errors...',
      retrying: 'Auto-fixing errors...',
      complete: 'Done!',
      error: 'Something went wrong',
    };

    if (stage === 'idle') {
      setGenerationProgress(null);
    } else {
      setGenerationProgress({
        stage,
        message: messages[stage],
        startedAt: Date.now(),
        detail,
      });
    }
  }, []);

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

  const sendMessage = useCallback(
    async (prompt: string, selectedFile?: string) => {
      if (!prompt.trim() || isGenerating) return;

      setError(null);
      setIsGenerating(true);
      updateProgress('preparing', 'Building context...');

      // Track generation timing
      const generationStartTime = Date.now();

      // Add user message
      addMessage({ role: 'user', content: prompt });
      messageCountRef.current++;

      try {
        let response;

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

          // Get project memory
          const projectMemory = await getProjectMemory(projectId);

          // Get conversation context (summaries + recent messages)
          const { summaries, recentMessages } = await getConversationContext(
            projectId,
            messages.map(m => ({ role: m.role, content: m.content }))
          );

          // Build smart context package
          const contextPackage = await buildContext(
            projectId,
            prompt,
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
            }))
          );

          // Log context efficiency
          console.log(
            `[usePlayCraftChat] Smart context: ${contextPackage.relevantFiles.length} files, ~${contextPackage.estimatedTokens} tokens`
          );

          // Update progress to analyzing (Claude)
          updateProgress('analyzing', `Analyzing ${contextPackage.relevantFiles.length} files...`);

          // Make context-aware request (Claude + Gemini on server)
          const request: ContextAwareRequest = {
            prompt,
            projectId,
            templateId,
            hasThreeJs,
            contextPackage,
          };

          response = await generateCodeWithContext(request);
          updateProgress('processing', 'Parsing AI response...');

          // Update memory from response (background)
          updateMemoryFromResponse(projectId, prompt, response, selectedFile).catch(err => {
            console.warn('[usePlayCraftChat] Failed to update memory:', err);
          });

          // Trigger background summarization
          summarizeInBackground(
            projectId,
            messages.map(m => ({ role: m.role, content: m.content })),
            messageCountRef.current
          );
        } else {
          // Legacy mode: Use old context system
          updateProgress('generating');
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
            prompt,
            currentFiles,
            selectedFile,
            conversationHistory,
            hasThreeJs,
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
          updateProgress('applying', `Writing ${response.files.length} file(s)...`);
          // Update our file cache
          for (const file of response.files) {
            const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
            filesRef.current[normalizedPath] = file.content;
          }

          // Apply files if callback provided
          if (onFilesGenerated) {
            await onFilesGenerated(response.files);
            filesApplied = response.files.length;
          }
        }

        // Run validation and auto-fix if enabled
        let validationErrors: CodeError[] = [];
        let eslintErrors: CodeError[] = [];
        let autoFixAttempts = 0;
        let autoFixSucceeded = false;

        if (runTypeCheck && enableAutoFix && (filesApplied > 0 || editsApplied > 0)) {
          updateProgress('validating', 'Running TypeScript check...');

          try {
            const tsOutput = await runTypeCheck();
            const validationResult = validateCode(tsOutput);

            // Also run ESLint if available
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

            if (!validationResult.success && validationResult.errors.length > 0) {
              validationErrors = validationResult.errors;
              console.log('[Chat] Found', validationErrors.length, 'errors, attempting auto-fix...');

              // Check if errors are auto-fixable
              if (areErrorsAutoFixable(validationErrors)) {
                let currentErrors = validationErrors;

                while (currentErrors.length > 0 && autoFixAttempts < maxRetries) {
                  autoFixAttempts++;
                  updateProgress('retrying', `Auto-fix attempt ${autoFixAttempts}/${maxRetries}...`);

                  // Create error fix prompt
                  const fixPrompt = createErrorFixPrompt(prompt, currentErrors, filesRef.current);

                  // Call AI to fix errors (use simple generation, not full context rebuild)
                  const fixRequest: GenerateRequest = {
                    prompt: fixPrompt,
                    currentFiles: filesRef.current,
                    selectedFile: currentErrors[0]?.file, // Focus on first file with error
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
                    // Update cache with edited files
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

                  // Re-validate
                  updateProgress('validating', `Verifying fix ${autoFixAttempts}...`);
                  const revalidateOutput = await runTypeCheck();
                  const revalidateResult = validateCode(revalidateOutput);

                  if (revalidateResult.success) {
                    currentErrors = [];
                    autoFixSucceeded = true;
                    addMessage({
                      role: 'system',
                      content: `Auto-fixed ${validationErrors.length} error${validationErrors.length > 1 ? 's' : ''} in ${autoFixAttempts} attempt${autoFixAttempts > 1 ? 's' : ''}`,
                    });
                  } else {
                    currentErrors = revalidateResult.errors;
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
                const errorSummary = validationErrors.slice(0, 3).map(e => `${e.file}:${e.line} - ${e.message}`).join('\n');
                addMessage({
                  role: 'system',
                  content: `Some errors need manual intervention:\n${errorSummary}`,
                });
              }
            }
          } catch (validationErr) {
            console.warn('[Chat] Validation failed:', validationErr);
            // Don't fail the whole generation if validation errors
          }
        }

        // Record generation outcome for learning system (async, non-blocking)
        if (projectId) {
          const durationMs = Date.now() - generationStartTime;
          const filesChanged = [
            ...(response.files?.map(f => f.path) || []),
            ...(response.edits?.map(e => e.file) || []),
          ];

          recordGenerationOutcome({
            projectId,
            prompt,
            responseMode: response.edits && response.edits.length > 0 ? 'edit' : 'file',
            filesChanged,
            durationMs,
            hadTsErrors: validationErrors.length > 0,
            hadEslintErrors: eslintErrors.length > 0,
            errorCount: validationErrors.length + eslintErrors.length,
            autoFixAttempts,
            autoFixSucceeded: autoFixAttempts > 0 ? autoFixSucceeded : undefined,
          }).catch(err => {
            console.warn('[Chat] Failed to record outcome:', err);
          });
        }

        // Mark complete briefly before resetting
        updateProgress('complete');

        // Parse the AI response to extract features and next steps
        const fullContent = response.message + (response.explanation ? `\n\n${response.explanation}` : '');
        const parsed = parseAIResponse(fullContent);

        // Add assistant response with parsed features and suggestions
        addMessage({
          role: 'assistant',
          content: parsed.content,
          files: response.files,
          features: parsed.features,
          nextSteps: parsed.nextSteps,
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
          content: `Error: ${errorMessage}`,
        });
      } finally {
        setIsGenerating(false);
        // Reset progress after a brief delay to show completion
        setTimeout(() => {
          updateProgress('idle');
        }, 1000);
      }
    },
    [isGenerating, messages, addMessage, onFilesGenerated, onEditsGenerated, readFile, readAllFiles, projectId, templateId, hasThreeJs, enableSmartContext, onNeedsThreeJs, updateProgress, runTypeCheck, runESLint, enableAutoFix, maxRetries]
  );

  return {
    messages,
    isGenerating,
    generationProgress,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
  };
}
