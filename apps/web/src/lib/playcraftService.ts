import { getSupabase } from './supabase';
import { withRetry } from './retry';
import { logger } from './logger';
import type { ProjectMemory, RelevantFile } from './contextBuilder';
import { applyEdits, type FileEdit } from './editApplyService';
import type { ResponseMode, ImplementationPlan, DebugAnalysis, GenerationProgress } from '../types';
import {
  TimeoutMonitor,
  TIMEOUT_THRESHOLDS,
  type TimeoutStatus,
} from './aiTimeoutService';

interface FileContent {
  path: string;
  content: string;
}

// Image attachment for vision AI
export interface ImageAttachment {
  data: string; // base64 encoded image data
  mimeType: string; // image/png, image/jpeg, image/webp, image/gif
  name?: string; // optional filename for reference
}

export interface GenerateResponse {
  message: string;
  files: FileContent[];
  edits?: FileEdit[]; // For small changes - search/replace blocks
  explanation: string;
  needsThreeJs?: boolean;
  useEditMode?: boolean; // Indicates response uses edit mode
  mode?: ResponseMode; // Response format chosen by AI
  plan?: ImplementationPlan; // For 'plan' mode responses
  debugAnalysis?: DebugAnalysis; // For 'debug' mode responses
}

// Legacy request format (for backwards compatibility)
export interface GenerateRequest {
  prompt: string;
  currentFiles?: Record<string, string>;
  selectedFile?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  hasThreeJs?: boolean;
  images?: ImageAttachment[]; // Images to analyze with vision AI
}

// New context-aware request format
export interface ContextAwareRequest {
  prompt: string;
  projectId: string;
  templateId?: string;
  hasThreeJs?: boolean;
  images?: ImageAttachment[]; // Images to analyze with vision AI

  // Smart context (from contextBuilder)
  contextPackage: {
    projectMemory: ProjectMemory | null;
    // Task Ledger context (Phase 4.2)
    taskContextFormatted?: string;
    // Structured execution plan (Phase 4.5)
    structuredPlanFormatted?: string;
    conversationSummaries: string[];
    recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;
    relevantFiles: RelevantFile[];
    changedSinceLastRequest: string[];
    fileTree: string[];
    estimatedTokens: number;
    tokenBudget?: number;
  };
}

/**
 * Generate code using the PlayCraft AI service.
 * This calls the generate-playcraft edge function to modify/create files
 * within the Next.js template structure.
 */
export async function generateCode(
  request: GenerateRequest
): Promise<GenerateResponse> {
  const supabase = getSupabase();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  return withRetry(
    async () => {
      // Use Supabase's built-in function invocation (handles auth automatically)
      const { data, error } = await supabase.functions.invoke('generate-playcraft', {
        body: request,
      });

      if (error) {
        throw new Error(error.message || 'Generation failed');
      }

      return data as GenerateResponse;
    },
    {
      // Fail fast so UI can surface errors instead of hanging for minutes
      maxAttempts: 1,
      onRetry: (attempt, error) => {
        logger.warn('Generation retry', {
          component: 'playcraftService',
          action: 'generateCode',
          attempt,
          error: error.message,
        });
      },
    }
  );
}

/**
 * Generate code using the PlayCraft AI service with smart context.
 * Uses the new context package for minimal token usage and precise iterations.
 */
export async function generateCodeWithContext(
  request: ContextAwareRequest
): Promise<GenerateResponse> {
  const supabase = getSupabase();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  return withRetry(
    async () => {
      const { data, error } = await supabase.functions.invoke('generate-playcraft', {
        body: {
          prompt: request.prompt,
          projectId: request.projectId,
          templateId: request.templateId,
          hasThreeJs: request.hasThreeJs,
          // New context package format
          useSmartContext: true,
          contextPackage: request.contextPackage,
        },
      });

      if (error) {
        // Log full error details for debugging
        console.error('[playcraftService] Edge function error:', {
          message: error.message,
          context: error.context,
          details: error.details,
          name: error.name,
          fullError: error,
          data, // Sometimes error details are in data
        });
        throw new Error(error.message || 'Generation failed');
      }

      return data as GenerateResponse;
    },
    {
      // Fail fast so UI can show the real error (e.g., CORS/504) instead of retrying for minutes
      maxAttempts: 1,
      onRetry: (attempt, error) => {
        logger.warn('Context-aware generation retry', {
          component: 'playcraftService',
          action: 'generateCodeWithContext',
          attempt,
          error: error.message,
        });
      },
    }
  );
}

/**
 * Options for generating code with timeout monitoring
 */
export interface GenerateWithTimeoutOptions {
  request: ContextAwareRequest;
  onProgress?: (progress: Partial<GenerationProgress>) => void;
  onTimeout?: (status: TimeoutStatus) => void;
  timeoutMs?: number;
}

/**
 * Generate code with timeout monitoring and progress callbacks.
 * Provides real-time feedback about generation status.
 */
export async function generateCodeWithTimeout(
  options: GenerateWithTimeoutOptions
): Promise<GenerateResponse> {
  const { request, onProgress, onTimeout, timeoutMs = TIMEOUT_THRESHOLDS.HARD } = options;
  const supabase = getSupabase();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  // Create timeout monitor
  const monitor = new TimeoutMonitor({
    onWarning: (status) => {
      onProgress?.({
        timeoutWarning: true,
        timeoutMessage: status.message,
        canRetry: status.canRetry,
      });
      onTimeout?.(status);
    },
    onSoftTimeout: (status) => {
      onProgress?.({
        timeoutWarning: true,
        timeoutMessage: status.message,
        detail: status.suggestion,
        canRetry: status.canRetry,
      });
      onTimeout?.(status);
    },
    onHardTimeout: (status) => {
      onProgress?.({
        timeoutWarning: true,
        timeoutMessage: status.message,
        detail: status.suggestion,
        canRetry: true,
      });
      onTimeout?.(status);
    },
    onStatusUpdate: (status) => {
      // Update progress message periodically
      if (status.stage !== 'normal' || Math.floor(status.elapsed / 1000) % 5 === 0) {
        onProgress?.({
          timeoutMessage: status.message,
          timeoutWarning: status.stage !== 'normal',
        });
      }
    },
  });

  try {
    monitor.start();

    // Create the API call promise
    const apiCall = supabase.functions.invoke('generate-playcraft', {
      body: {
        prompt: request.prompt,
        projectId: request.projectId,
        templateId: request.templateId,
        hasThreeJs: request.hasThreeJs,
        images: request.images,
        useSmartContext: true,
        contextPackage: request.contextPackage,
      },
    });

    // Race between API call and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`Request timed out after ${timeoutMs / 1000} seconds`));
      }, timeoutMs);
    });

    const { data, error } = await Promise.race([apiCall, timeoutPromise]) as Awaited<typeof apiCall>;

    if (error) {
      logger.error('Edge function error', error instanceof Error ? error : new Error(String(error)), {
        component: 'playcraftService',
        action: 'generateCodeWithTimeout',
      });
      throw new Error(error.message || 'Generation failed');
    }

    return data as GenerateResponse;
  } finally {
    monitor.stop();
  }
}

/**
 * Retry generation with a simpler context (fallback mode)
 * Used when the full context request times out
 */
export async function generateCodeSimplified(
  request: ContextAwareRequest,
  onProgress?: (progress: Partial<GenerationProgress>) => void
): Promise<GenerateResponse> {
  const supabase = getSupabase();

  // Verify user is authenticated
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    throw new Error('Not authenticated');
  }

  onProgress?.({
    message: 'Retrying with simplified context...',
    detail: 'Using minimal context to avoid timeout',
  });

  // Simplify the context - only include recent messages and essential files
  const simplifiedContext = {
    ...request.contextPackage,
    // Keep only the 3 most recent messages
    recentMessages: request.contextPackage.recentMessages.slice(-3),
    // Keep only the 5 most relevant files
    relevantFiles: request.contextPackage.relevantFiles.slice(0, 5),
    // Clear summaries to reduce tokens
    conversationSummaries: request.contextPackage.conversationSummaries.slice(-1),
  };

  try {
    const { data, error } = await supabase.functions.invoke('generate-playcraft', {
      body: {
        prompt: request.prompt,
        projectId: request.projectId,
        templateId: request.templateId,
        hasThreeJs: request.hasThreeJs,
        useSmartContext: true,
        contextPackage: simplifiedContext,
        // Signal to backend that this is a retry with simplified context
        isRetry: true,
        simplifiedMode: true,
      },
    });

    if (error) {
      throw new Error(error.message || 'Simplified generation failed');
    }

    return data as GenerateResponse;
  } catch (err) {
    logger.error('Simplified generation failed', err instanceof Error ? err : new Error(String(err)), {
      component: 'playcraftService',
      action: 'generateCodeSimplified',
    });
    throw err;
  }
}

/**
 * Apply generated files to the WebContainer (full file replacement)
 */
export async function applyGeneratedFiles(
  files: FileContent[],
  writeFile: (path: string, content: string) => Promise<void>
): Promise<void> {
  for (const file of files) {
    // Ensure path starts with /
    const normalizedPath = file.path.startsWith('/') ? file.path : `/${file.path}`;
    await writeFile(normalizedPath, file.content);
  }
}

/**
 * Apply generated edits to the WebContainer (search/replace mode)
 */
export async function applyGeneratedEdits(
  edits: FileEdit[],
  readFile: (path: string) => Promise<string | null>,
  writeFile: (path: string, content: string) => Promise<void>
): Promise<{ success: boolean; errors: string[] }> {
  const result = await applyEdits(edits, readFile, writeFile);

  if (!result.success) {
    logger.warn('Some edits failed to apply', {
      component: 'playcraftService',
      action: 'applyGeneratedEdits',
      errors: result.errors,
    });
  } else {
    logger.info('Edits applied successfully', {
      component: 'playcraftService',
      action: 'applyGeneratedEdits',
      editCount: edits.length,
      filesModified: result.results.filter(r => r.success).length,
    });
  }

  return {
    success: result.success,
    errors: result.errors,
  };
}

/**
 * Apply generated response - handles both files and edits
 */
export async function applyGeneratedResponse(
  response: GenerateResponse,
  readFile: (path: string) => Promise<string | null>,
  writeFile: (path: string, content: string) => Promise<void>
): Promise<{ success: boolean; errors: string[]; mode: 'files' | 'edits' | 'both' }> {
  const errors: string[] = [];
  let mode: 'files' | 'edits' | 'both' = 'files';

  // Apply edits if present
  if (response.edits && response.edits.length > 0) {
    mode = 'edits';
    const editResult = await applyGeneratedEdits(response.edits, readFile, writeFile);
    if (!editResult.success) {
      errors.push(...editResult.errors);
    }
  }

  // Apply files if present
  if (response.files && response.files.length > 0) {
    mode = response.edits && response.edits.length > 0 ? 'both' : 'files';
    try {
      await applyGeneratedFiles(response.files, writeFile);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to apply files';
      errors.push(errorMsg);
    }
  }

  return {
    success: errors.length === 0,
    errors,
    mode,
  };
}
