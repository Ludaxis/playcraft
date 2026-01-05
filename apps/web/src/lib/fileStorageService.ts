/**
 * File Storage Service
 *
 * Handles file storage operations using Supabase Storage.
 * Files are stored at: {user_id}/{project_id}/{file_path}
 */

import { getSupabase } from './supabase';
import { logger } from './logger';

const BUCKET_NAME = 'project-files';
const MAX_CONCURRENT_UPLOADS = 5;

// MIME type mapping for common file extensions
const MIME_TYPES: Record<string, string> = {
  '.ts': 'text/typescript',
  '.tsx': 'text/tsx',
  '.js': 'application/javascript',
  '.jsx': 'text/jsx',
  '.json': 'application/json',
  '.html': 'text/html',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.md': 'text/markdown',
  '.txt': 'text/plain',
};

/**
 * Get MIME type for a file path
 */
function getMimeType(filePath: string): string {
  const ext = filePath.substring(filePath.lastIndexOf('.')).toLowerCase();
  return MIME_TYPES[ext] || 'text/plain';
}

/**
 * Compute a simple hash for content (for change detection)
 */
async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Build the storage path for a file
 * Format: {user_id}/{project_id}/{file_path_without_leading_slash}
 */
function buildStoragePath(userId: string, projectId: string, filePath: string): string {
  const normalizedPath = filePath.startsWith('/') ? filePath.substring(1) : filePath;
  return `${userId}/${projectId}/${normalizedPath}`;
}

/**
 * Extract file path from storage path
 */
function extractFilePath(storagePath: string): string {
  // Storage path: userId/projectId/path/to/file.tsx
  // We want: /path/to/file.tsx
  const parts = storagePath.split('/');
  if (parts.length < 3) return '/' + storagePath;
  return '/' + parts.slice(2).join('/');
}

export interface UploadResult {
  storagePath: string;
  size: number;
  hash: string;
  mimeType: string;
}

export interface FileMetadata {
  path: string;
  storagePath: string;
  size: number;
  hash: string;
  mimeType: string;
}

/**
 * Upload a single file to Supabase Storage
 */
export async function uploadProjectFile(
  userId: string,
  projectId: string,
  filePath: string,
  content: string
): Promise<UploadResult> {
  const supabase = getSupabase();
  const storagePath = buildStoragePath(userId, projectId, filePath);
  const mimeType = getMimeType(filePath);
  const hash = await computeHash(content);

  // Convert string to Blob for upload
  const blob = new Blob([content], { type: mimeType });

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, blob, {
      contentType: mimeType,
      upsert: true, // Overwrite if exists
    });

  if (error) {
    logger.error('Failed to upload file to storage', error, {
      component: 'fileStorageService',
      action: 'uploadProjectFile',
      filePath,
      storagePath,
    });
    throw new Error(`Failed to upload file: ${error.message}`);
  }

  return {
    storagePath,
    size: content.length,
    hash,
    mimeType,
  };
}

/**
 * Download a single file from Supabase Storage
 */
export async function downloadProjectFile(
  userId: string,
  projectId: string,
  filePath: string
): Promise<string> {
  const supabase = getSupabase();
  const storagePath = buildStoragePath(userId, projectId, filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .download(storagePath);

  if (error) {
    logger.error('Failed to download file from storage', error, {
      component: 'fileStorageService',
      action: 'downloadProjectFile',
      filePath,
      storagePath,
    });
    throw new Error(`Failed to download file: ${error.message}`);
  }

  return await data.text();
}

/**
 * Batch upload all project files to Storage
 * Uses parallel uploads with concurrency limit
 */
export async function uploadProjectFiles(
  userId: string,
  projectId: string,
  files: Record<string, string>
): Promise<FileMetadata[]> {
  const filePaths = Object.keys(files);
  const results: FileMetadata[] = [];

  logger.info('Starting batch file upload', {
    component: 'fileStorageService',
    action: 'uploadProjectFiles',
    projectId,
    fileCount: filePaths.length,
  });

  // Process files in batches for controlled concurrency
  for (let i = 0; i < filePaths.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = filePaths.slice(i, i + MAX_CONCURRENT_UPLOADS);

    const batchResults = await Promise.all(
      batch.map(async (filePath) => {
        const content = files[filePath];
        const result = await uploadProjectFile(userId, projectId, filePath, content);
        return {
          path: filePath,
          ...result,
        };
      })
    );

    results.push(...batchResults);
  }

  logger.info('Batch file upload complete', {
    component: 'fileStorageService',
    action: 'uploadProjectFiles',
    projectId,
    filesUploaded: results.length,
  });

  return results;
}

/**
 * Download all project files from Storage
 * Returns files in Record<path, content> format for compatibility
 */
export async function downloadProjectFiles(
  userId: string,
  projectId: string
): Promise<Record<string, string>> {
  const supabase = getSupabase();
  const prefix = `${userId}/${projectId}/`;

  // List all files in the project folder
  const { data: fileList, error: listError } = await supabase.storage
    .from(BUCKET_NAME)
    .list(prefix.slice(0, -1), { // Remove trailing slash for list
      limit: 1000, // Max files per project
      sortBy: { column: 'name', order: 'asc' },
    });

  if (listError) {
    logger.error('Failed to list project files', listError, {
      component: 'fileStorageService',
      action: 'downloadProjectFiles',
      projectId,
    });
    throw new Error(`Failed to list files: ${listError.message}`);
  }

  if (!fileList || fileList.length === 0) {
    return {};
  }

  // Recursively get all files (including nested folders)
  const allFiles = await listAllFilesRecursively(userId, projectId, '');

  // Download all files in parallel batches
  const files: Record<string, string> = {};

  for (let i = 0; i < allFiles.length; i += MAX_CONCURRENT_UPLOADS) {
    const batch = allFiles.slice(i, i + MAX_CONCURRENT_UPLOADS);

    await Promise.all(
      batch.map(async (storagePath) => {
        try {
          const { data, error } = await supabase.storage
            .from(BUCKET_NAME)
            .download(storagePath);

          if (error) {
            logger.warn('Failed to download file', {
              component: 'fileStorageService',
              storagePath,
              error: error.message,
            });
            return;
          }

          const filePath = extractFilePath(storagePath);
          files[filePath] = await data.text();
        } catch (err) {
          logger.warn('Error downloading file', {
            component: 'fileStorageService',
            storagePath,
            error: err instanceof Error ? err.message : 'Unknown error',
          });
        }
      })
    );
  }

  logger.info('Downloaded project files', {
    component: 'fileStorageService',
    action: 'downloadProjectFiles',
    projectId,
    fileCount: Object.keys(files).length,
  });

  return files;
}

/**
 * Recursively list all files in a project folder
 */
async function listAllFilesRecursively(
  userId: string,
  projectId: string,
  subPath: string
): Promise<string[]> {
  const supabase = getSupabase();
  const prefix = `${userId}/${projectId}${subPath ? '/' + subPath : ''}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(prefix, { limit: 1000 });

  if (error || !data) {
    return [];
  }

  const files: string[] = [];

  for (const item of data) {
    const itemPath = subPath ? `${subPath}/${item.name}` : item.name;
    const fullStoragePath = `${userId}/${projectId}/${itemPath}`;

    if (item.id === null) {
      // It's a folder, recurse
      const nestedFiles = await listAllFilesRecursively(userId, projectId, itemPath);
      files.push(...nestedFiles);
    } else {
      // It's a file
      files.push(fullStoragePath);
    }
  }

  return files;
}

/**
 * Delete a single file from Storage
 */
export async function deleteProjectFile(
  userId: string,
  projectId: string,
  filePath: string
): Promise<void> {
  const supabase = getSupabase();
  const storagePath = buildStoragePath(userId, projectId, filePath);

  const { error } = await supabase.storage
    .from(BUCKET_NAME)
    .remove([storagePath]);

  if (error) {
    logger.error('Failed to delete file from storage', error, {
      component: 'fileStorageService',
      action: 'deleteProjectFile',
      filePath,
      storagePath,
    });
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Delete all files for a project from Storage
 */
export async function deleteAllProjectFiles(
  userId: string,
  projectId: string
): Promise<void> {
  const supabase = getSupabase();

  // Get all files for this project
  const allFiles = await listAllFilesRecursively(userId, projectId, '');

  if (allFiles.length === 0) {
    return;
  }

  // Delete in batches (Supabase has limits on batch delete)
  const BATCH_SIZE = 100;

  for (let i = 0; i < allFiles.length; i += BATCH_SIZE) {
    const batch = allFiles.slice(i, i + BATCH_SIZE);

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove(batch);

    if (error) {
      logger.error('Failed to delete project files batch', error, {
        component: 'fileStorageService',
        action: 'deleteAllProjectFiles',
        projectId,
        batchStart: i,
      });
      // Continue with other batches
    }
  }

  logger.info('Deleted all project files', {
    component: 'fileStorageService',
    action: 'deleteAllProjectFiles',
    projectId,
    filesDeleted: allFiles.length,
  });
}

/**
 * Get a signed URL for a file (for direct browser access)
 */
export async function getFileSignedUrl(
  userId: string,
  projectId: string,
  filePath: string,
  expiresIn: number = 3600 // 1 hour default
): Promise<string> {
  const supabase = getSupabase();
  const storagePath = buildStoragePath(userId, projectId, filePath);

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .createSignedUrl(storagePath, expiresIn);

  if (error) {
    logger.error('Failed to create signed URL', error, {
      component: 'fileStorageService',
      action: 'getFileSignedUrl',
      filePath,
    });
    throw new Error(`Failed to create signed URL: ${error.message}`);
  }

  return data.signedUrl;
}

/**
 * Check if a project has files in Storage
 */
export async function hasStorageFiles(
  userId: string,
  projectId: string
): Promise<boolean> {
  const supabase = getSupabase();
  const prefix = `${userId}/${projectId}`;

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .list(prefix, { limit: 1 });

  if (error) {
    return false;
  }

  return data !== null && data.length > 0;
}
