/**
 * File Hash Service
 *
 * Tracks file content hashes to detect changes between AI requests.
 * Uses SHA-256 for reliable change detection.
 */

import { getSupabase } from './supabase';

// ============================================================================
// TYPES
// ============================================================================

export interface FileHash {
  file_path: string;
  content_hash: string;
  file_size: number;
  last_modified: string;
  file_type: string | null;
  exports: string[];
  imports: string[];
  modification_count: number;
}

export interface FileChangeResult {
  created: string[];
  modified: string[];
  deleted: string[];
  unchanged: string[];
}

interface FileAnalysis {
  type: string;
  exports: string[];
  imports: string[];
}

// ============================================================================
// HASH COMPUTATION
// ============================================================================

/**
 * Compute SHA-256 hash of content using Web Crypto API
 */
export async function computeHash(content: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(content);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Analyze a file to extract type, exports, and imports
 */
function analyzeFile(path: string, content: string): FileAnalysis {
  // Determine file type from path
  let type = 'unknown';
  if (path.includes('/pages/')) type = 'page';
  else if (path.includes('/components/')) type = 'component';
  else if (path.includes('/hooks/')) type = 'hook';
  else if (path.includes('/lib/') || path.includes('/utils/')) type = 'util';
  else if (path.includes('/store/') || path.includes('/context/')) type = 'store';
  else if (path.includes('/types/')) type = 'type';
  else if (path.endsWith('.css')) type = 'style';
  else if (path.endsWith('.json')) type = 'config';
  else if (path.includes('/config/')) type = 'config';

  // Extract exports (basic regex - catches most common patterns)
  const exports: string[] = [];
  const exportPatterns = [
    /export\s+(?:default\s+)?(?:function|const|class|interface|type|enum)\s+(\w+)/g,
    /export\s+\{\s*([^}]+)\s*\}/g,
  ];

  for (const pattern of exportPatterns) {
    let match;
    while ((match = pattern.exec(content)) !== null) {
      const exported = match[1];
      if (exported.includes(',')) {
        // Multiple exports like { A, B, C }
        exported.split(',').forEach(e => {
          const name = e.trim().split(/\s+as\s+/)[0].trim();
          if (name && !exports.includes(name)) exports.push(name);
        });
      } else if (exported && !exports.includes(exported)) {
        exports.push(exported);
      }
    }
  }

  // Extract imports (file paths)
  const imports: string[] = [];
  const importPattern = /import\s+(?:[\w{},\s*]+\s+from\s+)?['"]([^'"]+)['"]/g;
  let match;
  while ((match = importPattern.exec(content)) !== null) {
    const importPath = match[1];
    if (!imports.includes(importPath)) {
      imports.push(importPath);
    }
  }

  return { type, exports, imports };
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get all stored file hashes for a project
 */
export async function getProjectFileHashes(projectId: string): Promise<Map<string, FileHash>> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_file_hashes')
    .select('*')
    .eq('project_id', projectId);

  if (error) {
    console.error('[FileHashService] Failed to get hashes:', error);
    return new Map();
  }

  const hashMap = new Map<string, FileHash>();
  for (const row of data || []) {
    hashMap.set(row.file_path, {
      file_path: row.file_path,
      content_hash: row.content_hash,
      file_size: row.file_size,
      last_modified: row.last_modified,
      file_type: row.file_type,
      exports: row.exports || [],
      imports: row.imports || [],
      modification_count: row.modification_count,
    });
  }

  return hashMap;
}

/**
 * Update file hashes in the database
 */
export async function updateFileHashes(
  projectId: string,
  files: Record<string, string>
): Promise<FileChangeResult> {
  const supabase = getSupabase();

  // Get existing hashes
  const existingHashes = await getProjectFileHashes(projectId);

  const result: FileChangeResult = {
    created: [],
    modified: [],
    deleted: [],
    unchanged: [],
  };

  const updates: Array<{
    project_id: string;
    file_path: string;
    content_hash: string;
    file_size: number;
    last_modified: string;
    file_type: string;
    exports: string[];
    imports: string[];
    modification_count: number;
  }> = [];

  // Process each file
  for (const [path, content] of Object.entries(files)) {
    const newHash = await computeHash(content);
    const existing = existingHashes.get(path);
    const analysis = analyzeFile(path, content);

    if (!existing) {
      // New file
      result.created.push(path);
      updates.push({
        project_id: projectId,
        file_path: path,
        content_hash: newHash,
        file_size: content.length,
        last_modified: new Date().toISOString(),
        file_type: analysis.type,
        exports: analysis.exports,
        imports: analysis.imports,
        modification_count: 1,
      });
    } else if (existing.content_hash !== newHash) {
      // Modified file
      result.modified.push(path);
      updates.push({
        project_id: projectId,
        file_path: path,
        content_hash: newHash,
        file_size: content.length,
        last_modified: new Date().toISOString(),
        file_type: analysis.type,
        exports: analysis.exports,
        imports: analysis.imports,
        modification_count: existing.modification_count + 1,
      });
    } else {
      // Unchanged
      result.unchanged.push(path);
    }

    // Remove from existing to track deletions
    existingHashes.delete(path);
  }

  // Remaining files in existingHashes are deleted
  result.deleted = Array.from(existingHashes.keys());

  // Batch upsert updates
  if (updates.length > 0) {
    const { error } = await supabase
      .from('playcraft_file_hashes')
      .upsert(updates, { onConflict: 'project_id,file_path' });

    if (error) {
      console.error('[FileHashService] Failed to update hashes:', error);
    }
  }

  // Delete removed files
  if (result.deleted.length > 0) {
    const { error } = await supabase
      .from('playcraft_file_hashes')
      .delete()
      .eq('project_id', projectId)
      .in('file_path', result.deleted);

    if (error) {
      console.error('[FileHashService] Failed to delete hashes:', error);
    }
  }

  return result;
}

/**
 * Get files that changed since last sync
 * Returns the changed file paths without updating the database
 */
export async function detectChanges(
  projectId: string,
  currentFiles: Record<string, string>
): Promise<FileChangeResult> {
  const existingHashes = await getProjectFileHashes(projectId);

  const result: FileChangeResult = {
    created: [],
    modified: [],
    deleted: [],
    unchanged: [],
  };

  // Check current files
  for (const [path, content] of Object.entries(currentFiles)) {
    const newHash = await computeHash(content);
    const existing = existingHashes.get(path);

    if (!existing) {
      result.created.push(path);
    } else if (existing.content_hash !== newHash) {
      result.modified.push(path);
    } else {
      result.unchanged.push(path);
    }

    existingHashes.delete(path);
  }

  // Remaining are deleted
  result.deleted = Array.from(existingHashes.keys());

  return result;
}

/**
 * Get import relationships for a project
 * Returns a map of file -> files that import it
 */
export async function getImportGraph(projectId: string): Promise<Map<string, string[]>> {
  const hashes = await getProjectFileHashes(projectId);
  const importedBy = new Map<string, string[]>();

  for (const [filePath, fileHash] of hashes) {
    for (const importPath of fileHash.imports) {
      // Normalize import paths to file paths
      let normalizedPath = importPath;

      // Handle relative imports
      if (importPath.startsWith('.')) {
        const dir = filePath.substring(0, filePath.lastIndexOf('/'));
        normalizedPath = resolveRelativePath(dir, importPath);
      }
      // Handle alias imports (e.g., @/components)
      else if (importPath.startsWith('@/')) {
        normalizedPath = '/src' + importPath.substring(1);
      }

      // Add extensions if missing
      if (!normalizedPath.includes('.')) {
        normalizedPath += '.tsx';
      }

      const importers = importedBy.get(normalizedPath) || [];
      if (!importers.includes(filePath)) {
        importers.push(filePath);
      }
      importedBy.set(normalizedPath, importers);
    }
  }

  return importedBy;
}

/**
 * Resolve relative path from a directory
 */
function resolveRelativePath(fromDir: string, relativePath: string): string {
  const parts = fromDir.split('/').filter(Boolean);
  const relParts = relativePath.split('/');

  for (const part of relParts) {
    if (part === '..') {
      parts.pop();
    } else if (part !== '.') {
      parts.push(part);
    }
  }

  return '/' + parts.join('/');
}

/**
 * Get files sorted by modification frequency (most modified first)
 */
export async function getFilesByImportance(projectId: string): Promise<string[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_file_hashes')
    .select('file_path, modification_count')
    .eq('project_id', projectId)
    .order('modification_count', { ascending: false });

  if (error) {
    console.error('[FileHashService] Failed to get files by importance:', error);
    return [];
  }

  return (data || []).map(row => row.file_path);
}

/**
 * Clear all hashes for a project (e.g., when resetting)
 */
export async function clearProjectHashes(projectId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_file_hashes')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    console.error('[FileHashService] Failed to clear hashes:', error);
  }
}
