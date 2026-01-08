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

export interface CodeError {
  file: string;
  line: number;
  column: number;
  code: string;
  message: string;
  type: 'typescript' | 'eslint' | 'build';
}

// Keep for backwards compatibility
export type TypeScriptError = CodeError;

export interface PublishResult {
  success: boolean;
  url?: string;
  error?: string;
}

// ============================================================================
// Error Check & Auto-Fix Functions
// ============================================================================

interface CheckResult {
  success: boolean;
  errors: CodeError[];
  rawOutput: string;
}

/**
 * Run TypeScript check and return any errors (with timeout)
 */
export async function runTypeScriptCheck(): Promise<CheckResult> {
  const TIMEOUT_MS = 30000; // 30 second timeout

  try {
    const process = await spawn('npx', ['tsc', '--noEmit', '--pretty', 'false']);

    let output = '';
    const outputPromise = process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    // Race between completion and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('TypeScript check timed out')), TIMEOUT_MS);
    });

    try {
      await Promise.race([outputPromise, timeoutPromise]);
      const exitCode = await Promise.race([
        process.exit,
        timeoutPromise
      ]);

      if (exitCode === 0) {
        return { success: true, errors: [], rawOutput: output };
      }
    } catch {
      console.warn('[publishService] TypeScript check timed out, skipping...');
      return { success: true, errors: [], rawOutput: 'Check timed out - skipping' };
    }

    // Parse TypeScript errors
    const errors: CodeError[] = [];
    const errorRegex = /^(.+)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/gm;
    let match;

    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5],
        type: 'typescript',
      });
    }

    return { success: false, errors, rawOutput: output };
  } catch (err) {
    console.error('[publishService] TypeScript check failed:', err);
    // Don't block publish on check failure - just skip
    return { success: true, errors: [], rawOutput: '' };
  }
}

/**
 * Run ESLint check and return any errors (with timeout)
 */
export async function runESLintCheck(): Promise<CheckResult> {
  const TIMEOUT_MS = 15000; // 15 second timeout

  try {
    const process = await spawn('npx', ['eslint', 'src', '--format', 'compact', '--quiet']);

    let output = '';
    const outputPromise = process.output.pipeTo(
      new WritableStream({
        write(data) {
          output += data;
        },
      })
    );

    // Race between completion and timeout
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('ESLint check timed out')), TIMEOUT_MS);
    });

    try {
      await Promise.race([outputPromise, timeoutPromise]);
      const exitCode = await Promise.race([process.exit, timeoutPromise]);

      if (exitCode === 0 || output.trim() === '') {
        return { success: true, errors: [], rawOutput: output };
      }
    } catch {
      console.warn('[publishService] ESLint check timed out, skipping...');
      return { success: true, errors: [], rawOutput: '' };
    }

    // Parse ESLint compact format
    const errors: CodeError[] = [];
    const errorRegex = /^(.+):\s*line\s+(\d+),\s*col\s+(\d+),\s*(?:Error|Warning)\s*-\s*(.+?)\s*\((.+?)\)$/gm;
    let match;

    while ((match = errorRegex.exec(output)) !== null) {
      errors.push({
        file: match[1],
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        message: match[4],
        code: match[5],
        type: 'eslint',
      });
    }

    return { success: false, errors, rawOutput: output };
  } catch (err) {
    console.error('[publishService] ESLint check failed:', err);
    // ESLint failure shouldn't block
    return { success: true, errors: [], rawOutput: '' };
  }
}

/**
 * Strip ANSI color codes from string
 */
function stripAnsi(str: string): string {
  // eslint-disable-next-line no-control-regex
  return str.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
}

/**
 * Parse build errors from Vite output
 */
export function parseBuildErrors(output: string): CodeError[] {
  const errors: CodeError[] = [];
  let match;

  // Strip ANSI color codes that might interfere with regex
  const cleanOutput = stripAnsi(output);
  console.log('[publishService] Parsing build output, length:', cleanOutput.length);

  // TypeScript errors - colon format: file.ts:line:col - error TSxxxx: message
  // Example: vite.config.ts:9:25 - error TS2304: Cannot find name '__dirname'.
  const tsColonRegex = /^(.+?):(\d+):(\d+)\s*-\s*error\s+(TS\d+):\s*(.+)$/gm;
  while ((match = tsColonRegex.exec(cleanOutput)) !== null) {
    const file = match[1].trim();
    // Avoid duplicates
    if (!errors.some(e => e.file === file && e.line === parseInt(match[2], 10))) {
      errors.push({
        file,
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5].trim(),
        type: 'typescript',
      });
    }
  }

  // TypeScript errors - parenthesis format: file.ts(line,col): error TSxxxx: message
  const tsParenRegex = /^(.+?)\((\d+),(\d+)\):\s*error\s+(TS\d+):\s*(.+)$/gm;
  while ((match = tsParenRegex.exec(cleanOutput)) !== null) {
    const file = match[1].trim();
    if (!errors.some(e => e.file === file && e.line === parseInt(match[2], 10))) {
      errors.push({
        file,
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: match[4],
        message: match[5].trim(),
        type: 'typescript',
      });
    }
  }

  // Vite/Rollup error format: error in /path/file.tsx:line:col
  const viteErrorRegex = /(?:error|ERROR)[:\s]+(?:in\s+)?(.+?):(\d+):(\d+)[\s\S]*?(?:error|Error)[:\s]+(.+?)(?=\n\n|\n[A-Z]|$)/gi;
  while ((match = viteErrorRegex.exec(cleanOutput)) !== null) {
    const file = match[1].trim();
    if (!errors.some(e => e.file.includes(file))) {
      errors.push({
        file,
        line: parseInt(match[2], 10),
        column: parseInt(match[3], 10),
        code: 'BUILD',
        message: match[4].trim(),
        type: 'build',
      });
    }
  }

  // Generic error messages with file paths
  const genericErrorRegex = /(?:Error|ERROR):\s*(.+?\.tsx?):?\s*(.+)/gi;
  while ((match = genericErrorRegex.exec(cleanOutput)) !== null) {
    const file = match[1].trim();
    if (!errors.some(e => e.file.includes(file))) {
      errors.push({
        file,
        line: 1,
        column: 1,
        code: 'BUILD',
        message: match[2].trim(),
        type: 'build',
      });
    }
  }

  console.log('[publishService] Parsed errors:', errors.length, errors.map(e => `${e.file}:${e.line} - ${e.code}: ${e.message.substring(0, 50)}`));
  return errors;
}

/**
 * Generate a prompt for the AI to fix errors
 */
export function generateFixPrompt(errors: CodeError[]): string {
  const tsErrors = errors.filter(e => e.type === 'typescript');
  const eslintErrors = errors.filter(e => e.type === 'eslint');
  const buildErrors = errors.filter(e => e.type === 'build');

  let prompt = 'Fix these errors in my code. Make minimal changes to fix only the errors listed:\n\n';

  if (tsErrors.length > 0) {
    prompt += '## TypeScript Errors:\n';
    prompt += tsErrors.map(e =>
      `- ${e.file}:${e.line}:${e.column} - ${e.code}: ${e.message}`
    ).join('\n');
    prompt += '\n\n';
  }

  if (eslintErrors.length > 0) {
    prompt += '## ESLint Errors:\n';
    prompt += eslintErrors.map(e =>
      `- ${e.file}:${e.line}:${e.column} - ${e.code}: ${e.message}`
    ).join('\n');
    prompt += '\n\n';
  }

  if (buildErrors.length > 0) {
    prompt += '## Build Errors:\n';
    prompt += buildErrors.map(e =>
      `- ${e.file}:${e.line}:${e.column} - ${e.message}`
    ).join('\n');
    prompt += '\n\n';
  }

  prompt += `FIXES REQUIRED (apply ALL of these):

1. UNUSED IMPORTS - Remove or comment out any unused imports:
   - If React is not used directly (only JSX), remove "import React"
   - Delete unused components like CardFooter, Gamepad2, Trophy, etc.

2. NodeJS.Timeout ERROR - Replace with browser-compatible type:
   ❌ const timerRef = useRef<NodeJS.Timeout>()
   ✅ const timerRef = useRef<ReturnType<typeof setTimeout>>()

3. vite.config.ts ERRORS (__dirname, path, url module errors):
   Replace the ENTIRE vite.config.ts with this simple version:
   \`\`\`
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'

   export default defineConfig({
     plugins: [react()],
     resolve: { alias: { '@': '/src' } },
     server: { host: true, port: 3000 },
   })
   \`\`\`

4. Type mismatches - Fix any type errors

5. External URLs blocked by COEP:
   ❌ <img src="https://lucide.dev/api/icons/gamepad-2" />
   ✅ import { Gamepad2 } from 'lucide-react'; <Gamepad2 />

Apply ALL these fixes now. Remove ALL unused imports.`;

  return prompt;
}

/**
 * Run all pre-build checks (TypeScript + ESLint)
 */
export async function runPreBuildChecks(): Promise<CheckResult> {
  const [tsResult, eslintResult] = await Promise.all([
    runTypeScriptCheck(),
    runESLintCheck(),
  ]);

  const allErrors = [...tsResult.errors, ...eslintResult.errors];
  const success = tsResult.success && eslintResult.success;

  return {
    success,
    errors: allErrors,
    rawOutput: [tsResult.rawOutput, eslintResult.rawOutput].filter(Boolean).join('\n'),
  };
}

// ============================================================================
// Build Functions
// ============================================================================

interface BuildResult {
  success: boolean;
  output: string;
  errors: CodeError[];
}

async function hasBuildArtifacts(): Promise<boolean> {
  try {
    await readFile('/dist/index.html');
    return true;
  } catch {
    return false;
  }
}

/**
 * Build the project using npm run build in WebContainer
 */
export async function buildProject(
  onProgress: (progress: PublishProgress) => void,
  onOutput: (data: string) => void
): Promise<BuildResult> {
  onProgress({ stage: 'building', progress: 10, message: 'Starting build...' });

  let fullOutput = '';
  const BUILD_TIMEOUT_MS = 120000; // 2 minute timeout

  try {
    const process = await spawn('npm', ['run', 'build']);

    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => reject(new Error('Build timed out after 2 minutes')), BUILD_TIMEOUT_MS);
    });

    // Pipe output to callback and collect it (with timeout)
    const outputPromise = process.output.pipeTo(
      new WritableStream({
        write(data) {
          fullOutput += data;
          onOutput(data);
        },
      })
    );

    try {
      await Promise.race([outputPromise, timeoutPromise]);
    } catch (err) {
      // If timeout, we still have partial output - check for errors or artifacts
      if (err instanceof Error && err.message.includes('timed out')) {
        console.warn('[publishService] Build output stream timed out, checking for errors in partial output');
        const errors = parseBuildErrors(fullOutput);
        if (errors.length > 0) {
          onProgress({ stage: 'error', progress: 0, message: 'Build failed with errors' });
          return { success: false, output: fullOutput, errors };
        }

        // If no errors parsed but dist exists, treat as success
        if (await hasBuildArtifacts()) {
          console.warn('[publishService] Build output timed out, but artifacts exist. Continuing.');
          onProgress({ stage: 'building', progress: 45, message: 'Build complete (timeout), proceeding...' });
          return { success: true, output: fullOutput, errors: [] };
        }
      }
      throw err;
    }

    onProgress({ stage: 'building', progress: 30, message: 'Building production bundle...' });

    // Wait for exit code with timeout
    let exitCode: number;
    try {
      exitCode = await Promise.race([
        process.exit,
        timeoutPromise
      ]) as number;
    } catch (err) {
      // Timeout waiting for exit - check if we have errors or artifacts
      console.warn('[publishService] Waiting for exit timed out, checking partial output');
      const errors = parseBuildErrors(fullOutput);
      if (errors.length > 0) {
        return { success: false, output: fullOutput, errors };
      }

      if (await hasBuildArtifacts()) {
        console.warn('[publishService] Exit wait timed out, but artifacts exist. Continuing.');
        onProgress({ stage: 'building', progress: 45, message: 'Build complete (timeout), proceeding...' });
        return { success: true, output: fullOutput, errors: [] };
      }
      throw err;
    }

    if (exitCode !== 0) {
      const errors = parseBuildErrors(fullOutput);
      onProgress({ stage: 'error', progress: 0, message: 'Build failed. Check the output for errors.' });
      return { success: false, output: fullOutput, errors };
    }

    onProgress({ stage: 'building', progress: 45, message: 'Build complete!' });
    return { success: true, output: fullOutput, errors: [] };
  } catch (err) {
    console.error('[publishService] Build failed:', err);
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Build error: ${errorMsg}`,
    });
    return { success: false, output: fullOutput + '\n' + errorMsg, errors: [] };
  }
}

// ============================================================================
// File Collection Functions
// ============================================================================

interface CollectedFile {
  path: string;
  content: Uint8Array | string;
}

function stripBlockedIconUrls(content: string): { sanitized: string; changed: boolean } {
  const blockedPattern = /https?:\/\/lucide\.dev\/api\/icons\/[^\s"'`>)]+/g;
  const sanitized = content.replace(blockedPattern, '');
  return { sanitized, changed: sanitized !== content };
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
      const { data: existingFiles, error: listError } = await supabase.storage
        .from('published-games')
        .list(basePath, { limit: 1000 });

      if (listError) {
        throw new Error(`Storage list failed: ${listError.message}`);
      }

      if (existingFiles && existingFiles.length > 0) {
        const filesToDelete = existingFiles
          .filter(f => !f.id)
          .map(f => `${basePath}/${f.name}`);

        if (filesToDelete.length > 0) {
          const { error: removeError } = await supabase.storage.from('published-games').remove(filesToDelete);
          if (removeError) {
            throw new Error(`Storage cleanup failed: ${removeError.message}`);
          }
          console.log(`[publishService] Deleted ${filesToDelete.length} existing files`);
        }
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown storage cleanup error';
      console.error('[publishService] Storage cleanup failed:', message);
      throw new Error(`${message}. Check Supabase Storage CORS/permissions for published-games bucket.`);
    }

    onProgress({ stage: 'uploading', progress: 50, message: `Uploading ${totalFiles} files...` });

    // Upload each file
    for (const file of distFiles) {
      const storagePath = `${basePath}/${file.path}`;
      const contentType = getContentType(file.path);

      let uploadContent = file.content;
      if (typeof uploadContent === 'string') {
        const { sanitized, changed } = stripBlockedIconUrls(uploadContent);
        if (changed) {
          console.log(`[publishService] Stripped blocked icon URLs in ${file.path}`);
        }
        uploadContent = sanitized;
      }

      // Convert string content to Uint8Array for upload
      const content = typeof uploadContent === 'string'
        ? new TextEncoder().encode(uploadContent)
        : uploadContent;

      const { error } = await supabase.storage
        .from('published-games')
        .upload(storagePath, content, {
          contentType,
          upsert: true,
        });

      if (error) {
        console.error(`[publishService] Failed to upload ${file.path}:`, error);
        throw new Error(`Failed to upload ${file.path}: ${error.message}. Ensure published-games bucket CORS allows your origin.`);
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
    const message = err instanceof Error ? err.message : 'Unknown error';
    console.error('[publishService] Upload failed:', message);
    onProgress({
      stage: 'error',
      progress: 0,
      message: `Upload error: ${message}`,
    });
    throw err instanceof Error ? err : new Error(message);
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
 * Includes automatic error fixing (TypeScript, ESLint, Build errors) before/during build
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

  const { onAutoFix, maxFixAttempts = 3 } = options;

  try {
    // Step 0: Run lint:fix to auto-clean common issues (unused imports, etc.)
    // This is best-effort with a timeout - we don't block publish on lint failures
    options.onProgress({ stage: 'checking', progress: 5, message: 'Auto-fixing lint issues...' });
    const LINT_TIMEOUT_MS = 15000; // 15 second timeout

    try {
      const lintProcess = await spawn('npm', ['run', 'lint:fix', '--if-present']);

      // Create timeout promise
      const timeoutPromise = new Promise<void>((resolve) => {
        setTimeout(() => {
          console.log('[publishService] lint:fix timed out, continuing...');
          resolve();
        }, LINT_TIMEOUT_MS);
      });

      // Race between lint completion and timeout
      const lintPromise = (async () => {
        try {
          await lintProcess.output.pipeTo(new WritableStream({
            write(data) {
              console.log('[publishService] lint:fix:', data);
            }
          }));
        } catch {
          // Ignore stream errors
        }
        // Wait for exit but don't care about exit code (lint errors are ok)
        try {
          await lintProcess.exit;
        } catch {
          // Ignore exit errors
        }
      })();

      await Promise.race([lintPromise, timeoutPromise]);
      console.log('[publishService] lint:fix step complete');
    } catch (err) {
      // lint:fix is optional, don't fail if it doesn't exist or has issues
      console.log('[publishService] lint:fix skipped:', err);
    }

    // Step 1: Build the project (with retry on failure)
    let buildAttempts = 0;
    let buildResult = await buildProject(options.onProgress, options.onBuildOutput);

    while (!buildResult.success && onAutoFix && buildAttempts < maxFixAttempts) {
      buildAttempts++;

      // Parse errors from build output
      const buildErrors = buildResult.errors.length > 0
        ? buildResult.errors
        : parseBuildErrors(buildResult.output);

      if (buildErrors.length === 0) {
        // Can't parse errors, can't fix
        options.onBuildOutput(`\nBuild failed but couldn't identify specific errors to fix.\n`);
        break;
      }

      console.log(`[publishService] Build failed with ${buildErrors.length} errors, attempting fix (${buildAttempts}/${maxFixAttempts})`);

      options.onProgress({
        stage: 'fixing',
        progress: 8,
        message: `Fixing ${buildErrors.length} build error${buildErrors.length > 1 ? 's' : ''}...`
      });
      options.onBuildOutput(`\nBuild failed. Fixing ${buildErrors.length} error(s)...\n`);

      const fixPrompt = generateFixPrompt(buildErrors);
      const fixApplied = await onAutoFix(fixPrompt);

      if (!fixApplied) {
        break;
      }

      // Wait for files to be written
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Retry build
      options.onProgress({ stage: 'building', progress: 10, message: 'Retrying build...' });
      options.onBuildOutput(`\nRetrying build...\n`);
      buildResult = await buildProject(options.onProgress, options.onBuildOutput);
    }

    if (!buildResult.success) {
      return { success: false, error: 'Build failed after auto-fix attempts' };
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
