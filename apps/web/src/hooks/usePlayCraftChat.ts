import { useState, useCallback, useRef, useEffect } from 'react';
import {
  generateCode,
  generateCodeWithContext,
  type GenerateRequest,
  type ContextAwareRequest,
} from '../lib/playcraftService';
import { buildContext, needsFullContext } from '../lib/contextBuilder';
import { getProjectMemory, initializeProjectMemory } from '../lib/projectMemoryService';
import { updateMemoryFromResponse } from '../lib/memoryUpdater';
import { getConversationContext, summarizeInBackground } from '../lib/conversationSummarizer';
import { detectChanges } from '../lib/fileHashService';
import type { ChatMessage, NextStep } from '../types';

// Re-export ChatMessage for backwards compatibility
export type { ChatMessage } from '../types';

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
  onNeedsThreeJs?: () => Promise<void>; // Called when AI requests Three.js
  readFile?: (path: string) => Promise<string>;
  readAllFiles?: () => Promise<Record<string, string>>; // Read all project files
  hasThreeJs?: boolean; // Whether Three.js template is already loaded
  useSmartContext?: boolean; // Enable smart context system (default: true if projectId provided)
  initialMessages?: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>; // Restore previous conversation
}

export interface UsePlayCraftChatReturn {
  messages: ChatMessage[];
  isGenerating: boolean;
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
    onNeedsThreeJs,
    readFile,
    readAllFiles,
    hasThreeJs = false,
    useSmartContext,
    initialMessages,
  } = options;

  // Determine if we should use smart context
  const enableSmartContext = useSmartContext ?? !!projectId;

  // Initialize messages from stored conversation or default welcome
  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    convertToDisplayMessages(initialMessages || [])
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

          // Make context-aware request
          const request: ContextAwareRequest = {
            prompt,
            projectId,
            templateId,
            hasThreeJs,
            contextPackage,
          };

          response = await generateCodeWithContext(request);

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
        }

        // Check if AI requested Three.js
        if (response.needsThreeJs && !hasThreeJs && onNeedsThreeJs) {
          addMessage({
            role: 'system',
            content: 'This game needs 3D graphics. Installing Three.js...',
          });
          await onNeedsThreeJs();
        }

        // Update our file cache
        for (const file of response.files) {
          const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
          filesRef.current[normalizedPath] = file.content;
        }

        // Apply files if callback provided
        if (onFilesGenerated && response.files.length > 0) {
          await onFilesGenerated(response.files);
        }

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

        // Add system message about files modified
        if (response.files.length > 0) {
          addMessage({
            role: 'system',
            content: `Updated ${response.files.length} file${response.files.length > 1 ? 's' : ''}: ${response.files.map((f) => f.path.split('/').pop()).join(', ')}`,
          });
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Failed to generate code';
        setError(errorMessage);
        addMessage({
          role: 'system',
          content: `Error: ${errorMessage}`,
        });
      } finally {
        setIsGenerating(false);
      }
    },
    [isGenerating, messages, addMessage, onFilesGenerated, readFile, readAllFiles, projectId, templateId, hasThreeJs, enableSmartContext, onNeedsThreeJs]
  );

  return {
    messages,
    isGenerating,
    error,
    sendMessage,
    clearMessages,
    addSystemMessage,
  };
}
