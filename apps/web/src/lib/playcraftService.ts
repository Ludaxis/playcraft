import { getSupabase } from './supabase';
import { withRetry } from './retry';
import { logger } from './logger';

interface FileContent {
  path: string;
  content: string;
}

export interface GenerateResponse {
  message: string;
  files: FileContent[];
  explanation: string;
  needsThreeJs?: boolean;
}

export interface GenerateRequest {
  prompt: string;
  currentFiles?: Record<string, string>;
  selectedFile?: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  hasThreeJs?: boolean;
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
      maxAttempts: 3,
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
 * Apply generated files to the WebContainer
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
