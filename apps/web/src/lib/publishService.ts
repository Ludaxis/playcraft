/**
 * Publishing Service for PlayCraft
 * Handles building, uploading, and publishing games to public URLs
 * Includes auto-fix for TypeScript errors before build
 */

import { getSupabase } from './supabase';
import { spawn, readFile, readDir } from './webcontainer';
import type { PublishedGame } from '../types';

// ============================================================================
// Types
// ============================================================================

export type PublishStage = 'checking' | 'fixing' | 'building' | 'uploading' | 'finalizing' | 'complete' | 'error';

export interface PublishProgress {
  stage: PublishStage;
  progress: number; // 0-100
  message: string;
}

export interface TypeScriptError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ============================================================================
// TypeScript Check & Auto-Fix Functions
// ============================================================================

/**
 * Run TypeScript check and return any errors
 */
export async function runTypeScriptCheck(): Promise<{ success: boolean; errors: TypeScriptError[]; rawOutput: string }> {
  try {
    const process = await spawn('npx', ['tsc', '--noEmit']);

    let output = '';
    await process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    const exitCode = await process.exit;

    if (exitCode === 0) {
      return { success: true, errors: [], rawOutput: output };
    }

    // Parse TypeScript errors
    const errors: TypeScriptError[] = [];
    const errorRegex = /^(.+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/gm;
    let match;

    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5],
      });
    }

    return { success: false, errors, rawOutput: output };
  } catch (err) {
    console.error('[publishService] TypeScript check failed:', err);
    return {
      success: false,
      errors: [],
      rawOutput: err instanceof Error ? err.message : 'TypeScript check failed'
    };
  }
}

/**
 * Generate a prompt for the AI to fix TypeScript errors
 */
export function generateFixPrompt(errors: TypeScriptError[]): string {
  const errorList = errors.map(e =>
    `- ${e.file}:${e.line}:${e.column} - ${e.code}: ${e.message}`
  ).join('\n');

  return `Fix these TypeScript errors in my code. Make minimal changes to fix only the errors listed:

${errorList}

Common fixes:
- Remove unused imports
- Use \`ReturnType<typeof setTimeout>\` instead of \`NodeJS.Timeout\`
- Add missing type annotations
- Fix type mismatches

Apply the fixes now.`;
}

// ============================================================================
// Build Functions
// ============================================================================

/**
 * Build the project using npm run build in WebContainer
 */
export async function buildProject(
  onProgress: (progress: PublishProgress) => void,
  onOutput: (data: string) => void
): Promise<boolean> {
  onProgress({ stage: 'building', progress: 5, message: 'Starting build...' });

  try {
    const process = await spawn('npm', ['run', 'build']);

    // Pipe output to callback
    process.output.pipeTo(
      new WritableStream({
        write(data) {
          onOutput(data);
        },
      })
    );

    onProgress({ stage: 'building', progress: 20, message: 'Building production bundle...' });

    const exitCode = await process.exit;

    if (exitCode !== 0) {
      onProgress({ stage: 'error', progress: 0, message: 'Build failed. Check the output for errors.' });
      return false;
    }

    onProgress({ stage: 'building', progress: 40, message: 'Build complete!' });
    return true;
  } catch (err) {
    console.error('[publishService] Build failed:', err);
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Build error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
    return false;
  }
}

// ============================================================================
// File Collection Functions
// ============================================================================

interface CollectedFile {
  path: string;
  content: Uint8Array | string;
}

/**
 * Recursively collect all files from the dist directory
 */
async function collectDistFiles(basePath = '/dist'): Promise<CollectedFile[]> {
  const files: CollectedFile[] = [];

  async function traverse(currentPath: string) {
    try {
      const entries = await readDir(currentPath);

      for (const entry of entries) {
        const fullPath = `${currentPath}/${entry}`;

        try {
          // Try to read as file
          const content = await readFile(fullPath);
          // Store relative path (without /dist prefix)
          const relativePath = fullPath.replace('/dist/', '');
          files.push({ path: relativePath, content });
        } catch {
          // If read fails, it might be a directory - recurse
          await traverse(fullPath);
        }
      }
    } catch (err) {
      console.warn(`[publishService] Failed to read directory ${currentPath}:`, err);
    }
  }

  await traverse(basePath);
  return files;
}

/**
 * Get content type from file extension
 */
function getContentType(filename: string): string {
  const ext = filename.split('.').pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: 'text/html',
    htm: 'text/html',
    js: 'application/javascript',
    mjs: 'application/javascript',
    css: 'text/css',
    json: 'application/json',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    gif: 'image/gif',
    svg: 'image/svg+xml',
    webp: 'image/webp',
    ico: 'image/x-icon',
    woff: 'font/woff',
    woff2: 'font/woff2',
    ttf: 'font/ttf',
    eot: 'application/vnd.ms-fontobject',
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    txt: 'text/plain',
    xml: 'application/xml',
    map: 'application/json', // Source maps
  };
  return types[ext || ''] || 'application/octet-stream';
}

// ============================================================================
// Upload Functions
// ============================================================================

/**
 * Upload built files to Supabase Storage
 */
export async function uploadToStorage(
  userId: string,
  projectId: string,
  onProgress: (progress: PublishProgress) => void
): Promise<string | null> {
  const supabase = getSupabase();

  onProgress({ stage: 'uploading', progress: 45, message: 'Collecting build files...' });

  try {
    const distFiles = await collectDistFiles();

    if (distFiles.length === 0) {
      onProgress({ stage: 'error', progress: 0, message: 'No build files found in /dist' });
      return null;
    }

    console.log(`[publishService] Collected ${distFiles.length} files from /dist`);

    const basePath = `${userId}/${projectId}`;
    let uploadedCount = 0;
    const totalFiles = distFiles.length;

    // Delete existing files first (for republishing)
    try {
      const { data: existingFiles } = await supabase.storage
        .from('published-games')
        .list(basePath, { limit: 1000 });

      if (existingFiles && existingFiles.length > 0) {
        // Need to list recursively and delete all files
        const filesToDelete = existingFiles
          .filter(f => !f.id) // Filter out folders (they have no id in some Supabase versions)
          .map(f => `${basePath}/${f.name}`);

        if (filesToDelete.length > 0) {
          await supabase.storage.from('published-games').remove(filesToDelete);
          console.log(`[publishService] Deleted ${filesToDelete.length} existing files`);
        }
      }
    } catch (err) {
      // Ignore deletion errors - folder might not exist yet
      console.log('[publishService] No existing files to delete or error:', err);
    }

    onProgress({ stage: 'uploading', progress: 50, message: `Uploading ${totalFiles} files...` });

    // Upload each file
    for (const file of distFiles) {
      const storagePath = `${basePath}/${file.path}`;
      const contentType = getContentType(file.path);

      // Convert string content to Uint8Array for upload
      const content = typeof file.content === 'string'
        ? new TextEncoder().encode(file.content)
        : file.content;

      const { error } = await supabase.storage
        .from('published-games')
        .upload(storagePath, content, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`[publishService] Failed to upload ${file.path}:`, error);
        throw new Error(`Failed to upload ${file.path}: ${error.message}`);
      }

      uploadedCount++;
      const progress = 50 + Math.floor((uploadedCount / totalFiles) * 40);
      onProgress({
        stage: 'uploading',
        progress,
        message: `Uploading ${uploadedCount}/${totalFiles} files...`,
      });
    }

    console.log(`[publishService] Successfully uploaded ${uploadedCount} files`);

    // Get public URL for index.html
    const { data: urlData } = supabase.storage
      .from('published-games')
      .getPublicUrl(`${basePath}/index.html`);

    return urlData.publicUrl;
  } catch (err) {
    console.error('[publishService] Upload failed:', err);
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Upload error: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
    return null;
  }
}

// ============================================================================
// Finalize Functions
// ============================================================================

/**
 * Update project record with published URL and status
 */
export async function finalizePublish(
  projectId: string,
  storageUrl: string,
  onProgress: (progress: PublishProgress) => void
): Promise<string | null> {
  const supabase = getSupabase();

  onProgress({ stage: 'finalizing', progress: 92, message: 'Saving publish status...' });

  try {
    // Generate the shareable URL (our custom route)
    const shareableUrl = `${window.location.origin}/play/${projectId}`;

    const { error } = await supabase
      .from('playcraft_projects')
      .update({
        status: 'published',
        published_url: shareableUrl,
        published_at: new Date().toISOString(),
      })
      .eq('id', projectId);

    if (error) {
      throw new Error(`Database update failed: ${error.message}`);
    }

    onProgress({ stage: 'complete', progress: 100, message: 'Published successfully!' });
    return shareableUrl;
  } catch (err) {
    console.error('[publishService] Finalize failed:', err);
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`,
    });
    return null;
  }
}

// ============================================================================
// Main Publish Function
// ============================================================================

export interface PublishOptions {
  userId: string;
  projectId: string;
  onProgress: (progress: PublishProgress) => void;
  onBuildOutput: (data: string) => void;
  /** Callback to auto-fix TypeScript errors. Returns true when fix is complete. */
  onAutoFix?: (fixPrompt: string) => Promise<boolean>;
  /** Maximum number of auto-fix attempts (default: 2) */
  maxFixAttempts?: number;
}

/**
 * Main publish function that orchestrates the entire flow
 * Includes automatic TypeScript error fixing before build
 */
export async function publishGame(
  userIdOrOptions: string | PublishOptions,
  projectId?: string,
  onProgress?: (progress: PublishProgress) => void,
  onBuildOutput?: (data: string) => void
): Promise<PublishResult> {
  // Support both old and new call signatures
  const options: PublishOptions = typeof userIdOrOptions === 'string'
    ? {
        userId: userIdOrOptions,
        projectId: projectId!,
        onProgress: onProgress!,
        onBuildOutput: onBuildOutput!,
      }
    : userIdOrOptions;

  const { onAutoFix, maxFixAttempts = 2 } = options;

  try {
    // Step 0: Check TypeScript errors and auto-fix if needed
    if (onAutoFix) {
      options.onProgress({ stage: 'checking', progress: 2, message: 'Checking for errors...' });

      let attempts = 0;
      let tsResult = await runTypeScriptCheck();

      while (!tsResult.success && tsResult.errors.length > 0 && attempts < maxFixAttempts) {
        attempts++;
        console.log(`[publishService] Found ${tsResult.errors.length} TypeScript errors, attempting auto-fix (${attempts}/${maxFixAttempts})`);

        options.onProgress({
          stage: 'fixing',
          progress: 3,
          message: `Fixing ${tsResult.errors.length} error${tsResult.errors.length > 1 ? 's' : ''}...`
        });
        options.onBuildOutput(`Found ${tsResult.errors.length} TypeScript error(s). Auto-fixing...`);

        // Generate fix prompt and send to AI
        const fixPrompt = generateFixPrompt(tsResult.errors);
        const fixApplied = await onAutoFix(fixPrompt);

        if (!fixApplied) {
          console.log('[publishService] Auto-fix was not applied');
          break;
        }

        // Wait a bit for files to be written
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Re-check TypeScript
        options.onProgress({ stage: 'checking', progress: 4, message: 'Verifying fix...' });
        tsResult = await runTypeScriptCheck();
      }

      if (!tsResult.success && tsResult.errors.length > 0) {
        options.onBuildOutput(`\nTypeScript errors remain after ${attempts} fix attempts:\n${tsResult.rawOutput}`);
        // Continue anyway - the build might still work or give clearer errors
      } else if (attempts > 0) {
        options.onBuildOutput(`\nTypeScript errors fixed successfully!`);
      }
    }

    // Step 1: Build the project
    const buildSuccess = await buildProject(options.onProgress, options.onBuildOutput);
    if (!buildSuccess) {
      return { success: false, error: 'Build failed' };
    }

    // Step 2: Upload to Supabase Storage
    const storageUrl = await uploadToStorage(options.userId, options.projectId, options.onProgress);
    if (!storageUrl) {
      return { success: false, error: 'Upload failed' };
    }

    // Step 3: Finalize and save to database
    const shareableUrl = await finalizePublish(options.projectId, storageUrl, options.onProgress);
    if (!shareableUrl) {
      return { success: false, error: 'Failed to save publish status' };
    }

    return { success: true, url: shareableUrl };
  } catch (err) {
    console.error('[publishService] Publish failed:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}

// ============================================================================
// Public Games Fetching
// ============================================================================

/**
 * Fetch published games for showcase (uses public RLS policy)
 */
export async function getPublishedGames(limit = 10): Promise<PublishedGame[]> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('playcraft_projects')
      .select(`
        id,
        name,
        description,
        published_url,
        published_at,
        play_count,
        user_id
      `)
      .eq('status', 'published')
      .eq('is_public', true)
      .order('published_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('[publishService] Failed to fetch published games:', error);
      return [];
    }

    // Map to PublishedGame type
    return (data || []).map((game) => ({
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_url: null, // Column doesn't exist in DB yet
      published_url: game.published_url,
      published_at: game.published_at,
      play_count: game.play_count || 0,
      user_id: game.user_id,
      // TODO: Join with user_settings to get author info
      author_name: 'PlayCraft Creator',
      author_avatar: null,
    }));
  } catch (err) {
    console.error('[publishService] Error fetching published games:', err);
    return [];
  }
}

/**
 * Get a single published game by ID (for Play page)
 */
export async function getPublishedGame(gameId: string): Promise<PublishedGame | null> {
  const supabase = getSupabase();

  try {
    const { data, error } = await supabase
      .from('playcraft_projects')
      .select(`
        id,
        name,
        description,
        published_url,
        published_at,
        play_count,
        user_id
      `)
      .eq('id', gameId)
      .eq('status', 'published')
      .single();

    if (error || !data) {
      console.error('[publishService] Failed to fetch published game:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      thumbnail_url: null, // Column doesn't exist in DB yet
      published_url: data.published_url,
      published_at: data.published_at,
      play_count: data.play_count || 0,
      user_id: data.user_id,
      author_name: 'PlayCraft Creator',
      author_avatar: null,
    };
  } catch (err) {
    console.error('[publishService] Error fetching published game:', err);
    return null;
  }
}

/**
 * Increment play count for a game (called when someone views the game)
 */
export async function incrementPlayCount(gameId: string): Promise<void> {
  const supabase = getSupabase();

  try {
    await supabase.rpc('increment_play_count', { game_id: gameId });
  } catch (err) {
    // Fire and forget - don't fail the page load if this fails
    console.warn('[publishService] Failed to increment play count:', err);
  }
}

/**
 * Get the storage URL for a published game's files
 */
export function getGameStorageUrl(userId: string, projectId: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage
    .from('published-games')
    .getPublicUrl(`${userId}/${projectId}/index.html`);
  return data.publicUrl;
}
