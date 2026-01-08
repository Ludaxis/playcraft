/**
 * Publishing Service for PlayCraft
 *
 * Simplified one-click publish flow (2025 best practices):
 * 1. Build with Vite (npm run build)
 * 2. Upload to Supabase Storage
 * 3. Finalize database record
 *
 * No pre-checks, no auto-fix loops - fast and predictable.
 */

import { getSupabase } from './supabase';
import { spawn, readFile, readDir } from './webcontainer';
import type { PublishedGame } from '../types';

// ============================================================================
// Types
// ============================================================================

export type PublishStage = 'building' | 'uploading' | 'finalizing' | 'complete' | 'error';

export interface PublishProgress {
  stage: PublishStage;
  progress: number; // 0-100
  message: string;
}

export interface BuildError {
  file: string;
  line: number;
  column: number;
  message: string;
}

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
  buildErrors?: BuildError[];
}

// Legacy type exports for backwards compatibility
export type CodeError = BuildError & { code: string; type: 'typescript' | 'eslint' | 'build' };
export type TypeScriptError = CodeError;

// ============================================================================
// Build Functions
// ============================================================================

const BUILD_TIMEOUT_MS = 90000; // 90 second timeout (generous for WebContainer)

interface PublishedVersion {
  id: string;
  createdAt: string;
  path: string;
}

interface BuildResult {
  success: boolean;
  output: string;
  errors: BuildError[];
}

/**
 * Parse build errors from Vite output
 */
function parseBuildErrors(output: string): BuildError[] {
  const errors: BuildError[] = [];

  // Strip ANSI codes
  // eslint-disable-next-line no-control-regex
  const clean = output.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');

  // TypeScript colon format: file.ts:line:col - error TSxxxx: message
  const tsRegex = /^(.+?):(\d+):(\d+)\s*-\s*error\s+TS\d+:\s*(.+)$/gm;
  let match;
  while ((match = tsRegex.exec(clean)) !== null) {
    errors.push({
      file: match[1].trim(),
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      message: match[4].trim(),
    });
  }

  // Vite/Rollup errors: error in /path/file.tsx:line:col
  const viteRegex = /error\s+(?:in\s+)?(.+?):(\d+):(\d+)[\s\S]*?(?:Error|error)[:\s]+(.+?)(?=\n\n|\n[A-Z]|$)/gi;
  while ((match = viteRegex.exec(clean)) !== null) {
    const file = match[1].trim();
    if (!errors.some(e => e.file.includes(file) && e.line === parseInt(match[2], 10))) {
      errors.push({
        file,
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        message: match[4].trim(),
      });
    }
  }

  return errors;
}

/**
 * Check if dist/index.html exists
 */
async function hasBuildArtifacts(): Promise<boolean> {
  try {
    await readFile('/dist/index.html');
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the project using npm run build
 * Uses --base=./ to ensure relative paths work when served from Supabase Storage
 */
async function buildProject(
  onProgress: (progress: PublishProgress) => void,
  onOutput: (data: string) => void
): Promise<BuildResult> {
  onProgress({ stage: 'building', progress: 5, message: 'Starting build...' });

  let fullOutput = '';

  try {
    // Pass --base=./ to Vite so the build uses relative paths
    // This is critical for published games served from Supabase Storage subdirectories
    const process = await spawn('npm', ['run', 'build', '--', '--base=./']);

    // Timeout promise
    const timeout = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Build timed out')), BUILD_TIMEOUT_MS);
    });

    // Collect output
    const outputPromise = process.output.pipeTo(
      new WritableStream({
        write(data) {
          fullOutput += data;
          onOutput(data);
        },
      })
    );

    try {
      await Promise.race([outputPromise, timeout]);
    } catch (err) {
      // On timeout, check if we have artifacts anyway
      if (err instanceof Error && err.message === 'Build timed out') {
        if (await hasBuildArtifacts()) {
          console.log('[publishService] Build timed out but artifacts exist, continuing...');
          onProgress({ stage: 'building', progress: 40, message: 'Build complete!' });
          return { success: true, output: fullOutput, errors: [] };
        }
        const errors = parseBuildErrors(fullOutput);
        return { success: false, output: fullOutput, errors };
      }
      throw err;
    }

    onProgress({ stage: 'building', progress: 25, message: 'Building production bundle...' });

    // Wait for exit code
    let exitCode: number;
    try {
      exitCode = await Promise.race([process.exit, timeout]) as number;
    } catch {
      // Timeout waiting for exit - check for artifacts
      if (await hasBuildArtifacts()) {
        onProgress({ stage: 'building', progress: 40, message: 'Build complete!' });
        return { success: true, output: fullOutput, errors: [] };
      }
      return { success: false, output: fullOutput, errors: parseBuildErrors(fullOutput) };
    }

    if (exitCode !== 0) {
      const errors = parseBuildErrors(fullOutput);
      onProgress({ stage: 'error', progress: 0, message: 'Build failed' });
      return { success: false, output: fullOutput, errors };
    }

    onProgress({ stage: 'building', progress: 40, message: 'Build complete!' });
    return { success: true, output: fullOutput, errors: [] };

  } catch (err) {
    console.error('[publishService] Build error:', err);
    const msg = err instanceof Error ? err.message : 'Unknown error';
    onProgress({ stage: 'error', progress: 0, message: `Build error: ${msg}` });
    return { success: false, output: fullOutput + '\n' + msg, errors: [] };
  }
}

// ============================================================================
// File Collection & Upload
// ============================================================================

interface CollectedFile {
  path: string;
  content: Uint8Array | string;
}

/**
 * Recursively collect all files from /dist
 */
async function collectDistFiles(basePath = '/dist'): Promise<CollectedFile[]> {
  const files: CollectedFile[] = [];

  async function traverse(currentPath: string) {
    try {
      const entries = await readDir(currentPath);

      for (const entry of entries) {
        const fullPath = `${currentPath}/${entry}`;
        try {
          const content = await readFile(fullPath);
          const relativePath = fullPath.replace('/dist/', '');
          files.push({ path: relativePath, content });
        } catch {
          // Directory - recurse
          await traverse(fullPath);
        }
      }
    } catch (err) {
      console.warn(`[publishService] Failed to read ${currentPath}:`, err);
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
    mp3: 'audio/mpeg',
    wav: 'audio/wav',
    ogg: 'audio/ogg',
    mp4: 'video/mp4',
    webm: 'video/webm',
    map: 'application/json',
  };
  return types[ext || ''] || 'application/octet-stream';
}

/**
 * Upload built files to Supabase Storage
 */
async function uploadToStorage(
  userId: string,
  projectId: string,
  onProgress: (progress: PublishProgress) => void
): Promise<string | null> {
  const supabase = getSupabase();

  onProgress({ stage: 'uploading', progress: 45, message: 'Collecting build files...' });

  try {
    const distFiles = await collectDistFiles();

    if (distFiles.length === 0) {
      onProgress({ stage: 'error', progress: 0, message: 'No build files found' });
      return null;
    }

    console.log(`[publishService] Uploading ${distFiles.length} files`);

    const basePath = `${userId}/${projectId}`;
    const versionId = `${Date.now()}`;
    const versionPrefix = `${basePath}/versions/${versionId}`;

    onProgress({ stage: 'uploading', progress: 50, message: `Uploading ${distFiles.length} files...` });

    // Upload files
    let uploaded = 0;
    for (const file of distFiles) {
      const storagePath = `${versionPrefix}/${file.path}`;
      const contentType = getContentType(file.path);

      const content = typeof file.content === 'string'
        ? new TextEncoder().encode(file.content)
        : file.content;

      const { error } = await supabase.storage
        .from('published-games')
        .upload(storagePath, content, { contentType, upsert: true });

      if (error) {
        throw new Error(`Failed to upload ${file.path}: ${error.message}`);
      }

      uploaded++;
      const progress = 50 + Math.floor((uploaded / distFiles.length) * 40);
      onProgress({ stage: 'uploading', progress, message: `Uploading ${uploaded}/${distFiles.length}...` });
    }

    console.log(`[publishService] Uploaded ${uploaded} files for version ${versionId}`);

    // Update versions manifest
    let versions: PublishedVersion[] = [];
    try {
      const existing = await supabase.storage
        .from('published-games')
        .download(`${basePath}/versions.json`);
      if (existing.data) {
        const text = await existing.data.text();
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed)) {
          versions = parsed as PublishedVersion[];
        }
      }
    } catch {
      // ignore
    }

    const versionPath = `${versionPrefix}/index.html`;
    versions.push({ id: versionId, createdAt: new Date().toISOString(), path: versionPath });

    const manifestBlob = new Blob([JSON.stringify(versions, null, 2)], { type: 'application/json' });
    await supabase.storage
      .from('published-games')
      .upload(`${basePath}/versions.json`, manifestBlob, { upsert: true, contentType: 'application/json' });

    const latestBlob = new Blob([JSON.stringify({ versionId, path: versionPath })], {
      type: 'application/json',
    });
    await supabase.storage
      .from('published-games')
      .upload(`${basePath}/latest.json`, latestBlob, { upsert: true, contentType: 'application/json' });

    // Get public URL for this version
    const { data: urlData } = supabase.storage
      .from('published-games')
      .getPublicUrl(versionPath);

    return urlData.publicUrl;

  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    console.error('[publishService] Upload failed:', msg);
    onProgress({ stage: 'error', progress: 0, message: `Upload error: ${msg}` });
    return null;
  }
}

// ============================================================================
// Slug Generation
// ============================================================================

/**
 * Generate a URL-safe slug from game name
 * Format: [sanitized-name]-[short-id]
 * Example: "Neon Chess" + "abc123..." -> "neon-chess-abc123"
 */
function generateSlug(gameName: string, projectId: string): string {
  // Normalize: lowercase, remove accents
  let slug = gameName.toLowerCase();

  // Remove diacritics/accents using normalize
  slug = slug.normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  // Replace non-alphanumeric with hyphens
  slug = slug.replace(/[^a-z0-9]+/g, '-');

  // Remove leading/trailing hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  // Limit length
  slug = slug.substring(0, 40);

  // Handle empty slug
  if (!slug) {
    slug = 'game';
  }

  // Add short unique suffix from project ID
  const suffix = projectId.substring(0, 6);
  return `${slug}-${suffix}`;
}

/**
 * Get game name from WebContainer (reads the title from index.html or package.json)
 */
async function getGameName(projectId: string): Promise<string> {
  try {
    // Try to get name from index.html title tag
    const indexHtml = await readFile('/index.html');
    const titleMatch = indexHtml.match(/<title>([^<]+)<\/title>/i);
    if (titleMatch && titleMatch[1] && titleMatch[1].trim() !== 'Vite + React + TS') {
      return titleMatch[1].trim();
    }
  } catch {
    // Ignore
  }

  try {
    // Fallback to package.json name
    const packageJson = await readFile('/package.json');
    const pkg = JSON.parse(packageJson);
    if (pkg.name && pkg.name !== 'vite-project') {
      return pkg.name;
    }
  } catch {
    // Ignore
  }

  // Final fallback
  return `Game ${projectId.substring(0, 6)}`;
}

// ============================================================================
// Finalize
// ============================================================================

// Subdomain base URL - configurable for different environments
const GAME_SUBDOMAIN_BASE = 'play.playcraft.games';

/**
 * Update project record with published URL and generate subdomain
 */
async function finalizePublish(
  projectId: string,
  _storageUrl: string,
  onProgress: (progress: PublishProgress) => void
): Promise<string | null> {
  const supabase = getSupabase();

  onProgress({ stage: 'finalizing', progress: 92, message: 'Generating URL...' });

  try {
    // Get game name for slug generation
    const gameName = await getGameName(projectId);

    // Generate slug
    const slug = generateSlug(gameName, projectId);

    // Check if slug already exists for this project
    const { data: existingProject } = await supabase
      .from('playcraft_projects')
      .select('slug')
      .eq('id', projectId)
      .single();

    // Use existing slug if project was already published, otherwise use new one
    const finalSlug = existingProject?.slug || slug;

    // Generate subdomain URL
    const subdomainUrl = `https://${finalSlug}.${GAME_SUBDOMAIN_BASE}`;

    // Also keep the legacy /play/:id URL for backwards compatibility
    const legacyUrl = `${window.location.origin}/play/${projectId}`;

    onProgress({ stage: 'finalizing', progress: 95, message: 'Saving...' });

    // Build update payload - only include slug if project doesn't have one yet
    // This prevents UNIQUE constraint issues on republish
    const updatePayload: Record<string, unknown> = {
      status: 'published',
      subdomain_url: subdomainUrl,
      published_url: legacyUrl, // Keep legacy URL for backwards compat
      published_at: new Date().toISOString(),
    };

    // Only set slug on first publish (when project doesn't have one)
    if (!existingProject?.slug) {
      updatePayload.slug = finalSlug;
    }

    const { error } = await supabase
      .from('playcraft_projects')
      .update(updatePayload)
      .eq('id', projectId);

    if (error) {
      throw new Error(`Database error: ${error.message}`);
    }

    onProgress({ stage: 'complete', progress: 100, message: 'Published!' });

    // Return the subdomain URL as the primary shareable URL
    return subdomainUrl;

  } catch (err) {
    console.error('[publishService] Finalize failed:', err);
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Save failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
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
  // Legacy - kept for backwards compatibility but not used
  onAutoFix?: (fixPrompt: string) => Promise<boolean>;
  maxFixAttempts?: number;
}

/**
 * One-click publish: Build → Upload → Finalize
 *
 * No pre-checks, no auto-fix loops. Fast and predictable.
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

  try {
    // Step 1: Build
    const buildResult = await buildProject(options.onProgress, options.onBuildOutput);

    if (!buildResult.success) {
      return {
        success: false,
        error: 'Build failed. Check output for errors.',
        buildErrors: buildResult.errors,
      };
    }

    // Step 2: Upload
    const storageUrl = await uploadToStorage(options.userId, options.projectId, options.onProgress);
    if (!storageUrl) {
      return { success: false, error: 'Upload failed' };
    }

    // Step 3: Finalize
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
// Legacy exports for backwards compatibility
// ============================================================================

// These functions are no longer used but exported for compatibility
export async function runTypeScriptCheck(): Promise<{ success: boolean; errors: CodeError[]; rawOutput: string }> {
  return { success: true, errors: [], rawOutput: '' };
}

export async function runESLintCheck(): Promise<{ success: boolean; errors: CodeError[]; rawOutput: string }> {
  return { success: true, errors: [], rawOutput: '' };
}

export async function runPreBuildChecks(): Promise<{ success: boolean; errors: CodeError[]; rawOutput: string }> {
  return { success: true, errors: [], rawOutput: '' };
}

export function generateFixPrompt(errors: CodeError[]): string {
  return errors.map(e => `${e.file}:${e.line} - ${e.message}`).join('\n');
}

// ============================================================================
// Public Games Fetching (unchanged)
// ============================================================================

/**
 * Fetch published games for showcase
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

    return (data || []).map((game) => ({
      id: game.id,
      name: game.name,
      description: game.description,
      thumbnail_url: null,
      published_url: game.published_url,
      published_at: game.published_at,
      play_count: game.play_count || 0,
      user_id: game.user_id,
      author_name: 'PlayCraft Creator',
      author_avatar: null,
    }));
  } catch (err) {
    console.error('[publishService] Error fetching published games:', err);
    return [];
  }
}

/**
 * Get a single published game by ID
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
      thumbnail_url: null,
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
 * Increment play count for a game
 */
export async function incrementPlayCount(gameId: string): Promise<void> {
  const supabase = getSupabase();

  try {
    await supabase.rpc('increment_play_count', { game_id: gameId });
  } catch (err) {
    console.warn('[publishService] Failed to increment play count:', err);
  }
}

/**
 * Get the storage URL for a published game
 */
export function getGameStorageUrl(userId: string, projectId: string): string {
  const supabase = getSupabase();
  const { data } = supabase.storage
    .from('published-games')
    .getPublicUrl(`${userId}/${projectId}/index.html`);
  return data.publicUrl;
}
