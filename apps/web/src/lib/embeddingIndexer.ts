/**
 * Embedding Indexer Service for PlayCraft
 *
 * Orchestrates the process of indexing project files for semantic search:
 * 1. Checks which files need indexing (new or modified)
 * 2. Chunks code files by function/component boundaries
 * 3. Generates embeddings using Voyage AI
 * 4. Saves chunks and embeddings to database
 *
 * Indexing runs in the background and doesn't block user interactions.
 */

import { processFileForIndexing } from './codeChunker';
import {
  generateEmbeddings,
  saveCodeChunks,
  saveFileIndex,
  fileNeedsEmbedding,
  getEmbeddingStats,
  deleteFileChunks,
  type CodeChunk,
  type FileIndex,
} from './embeddingService';
import { computeHashSync, analyzeFile } from './fileHashService';
import { getSupabase } from './supabase';

// ============================================
// Types
// ============================================

export interface IndexingResult {
  success: boolean;
  filesIndexed: number;
  chunksCreated: number;
  tokensUsed: number;
  errors: IndexingError[];
  duration: number;
}

export interface IndexingError {
  filePath: string;
  error: string;
}

export interface IndexingStatus {
  needsIndexing: boolean;
  totalFiles: number;
  indexedFiles: number;
  pendingFiles: number;
  lastIndexed: string | null;
}

export interface IndexingProgress {
  status: 'idle' | 'indexing' | 'complete' | 'error';
  currentFile?: string;
  filesProcessed: number;
  totalFiles: number;
  progress: number; // 0-100
}

// ============================================
// Constants
// ============================================

// File extensions to index
const INDEXABLE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

// Files/paths to skip
const SKIP_PATTERNS = [
  /node_modules/,
  /\.d\.ts$/,
  /vite\.config/,
  /eslint\.config/,
  /tailwind\.config/,
  /postcss\.config/,
  /tsconfig/,
  /package\.json$/,
  /package-lock\.json$/,
  /\.test\./,
  /\.spec\./,
];

// Maximum files to process in one batch
const MAX_BATCH_SIZE = 20;

// ============================================
// Import Path Normalization
// ============================================

/**
 * Normalize import path to actual file path
 * Returns null for external packages (react, lodash, etc.)
 */
function normalizeImportPath(
  fromFile: string,
  importPath: string,
  knownFiles?: Record<string, string>
): string | null {
  // Skip external packages (no leading . or @/)
  if (!importPath.startsWith('.') && !importPath.startsWith('@/')) {
    return null;
  }

  let basePath: string;

  // Handle @/ alias
  if (importPath.startsWith('@/')) {
    basePath = '/src' + importPath.substring(1);
  } else {
    // Handle relative imports
    const dir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    const parts = dir.split('/').filter(Boolean);
    const importParts = importPath.split('/');

    for (const part of importParts) {
      if (part === '.') continue;
      if (part === '..') {
        parts.pop();
      } else {
        parts.push(part);
      }
    }

    basePath = '/' + parts.join('/');
  }

  // If an extension is already present, use it
  if (/\.[a-zA-Z]+$/.test(basePath)) {
    return basePath;
  }

  const candidates = [
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.js`,
    `${basePath}.jsx`,
    `${basePath}/index.ts`,
    `${basePath}/index.tsx`,
    `${basePath}/index.js`,
    `${basePath}/index.jsx`,
  ];

  if (knownFiles) {
    const match = candidates.find(path => Object.prototype.hasOwnProperty.call(knownFiles, path));
    if (match) return match;

    const baseName = basePath.split('/').pop();
    if (baseName) {
      const fuzzy = Object.keys(knownFiles).find(path =>
        path.endsWith(`/${baseName}.ts`) ||
        path.endsWith(`/${baseName}.tsx`) ||
        path.endsWith(`/${baseName}.js`) ||
        path.endsWith(`/${baseName}.jsx`)
      );
      if (fuzzy) return fuzzy;
    }
  }

  // Fall back to first candidate
  return candidates[0];
}

// ============================================
// Dependency Storage
// ============================================

interface FileDependency {
  projectId: string;
  fromFile: string;
  toFile: string;
  dependencyType: string;
}

/**
 * Save file dependencies to database
 */
async function saveDependencies(deps: FileDependency[]): Promise<void> {
  if (deps.length === 0) return;

  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_file_dependencies')
    .upsert(
      deps.map(d => ({
        project_id: d.projectId,
        from_file: d.fromFile,
        to_file: d.toFile,
        dependency_type: d.dependencyType,
      })),
      { onConflict: 'project_id,from_file,to_file' }
    );

  if (error) {
    console.error('[Indexer] Error saving dependencies:', error);
  } else {
    console.log(`[Indexer] Saved ${deps.length} dependencies`);
  }
}

/**
 * Calculate importance scores based on fan-in (how many files import each file)
 */
async function calculateImportanceScores(projectId: string): Promise<void> {
  const supabase = getSupabase();

  // Count how many files import each file
  const { data, error } = await supabase
    .from('playcraft_file_dependencies')
    .select('to_file')
    .eq('project_id', projectId);

  if (error || !data || data.length === 0) {
    console.log('[Indexer] No dependencies to calculate importance from');
    return;
  }

  // Count occurrences (fan-in)
  const fanInCounts = new Map<string, number>();
  for (const row of data) {
    const count = fanInCounts.get(row.to_file) || 0;
    fanInCounts.set(row.to_file, count + 1);
  }

  // Normalize to 0-1 range
  const maxFanIn = Math.max(...fanInCounts.values(), 1);

  // Update importance scores in batches
  const updates: Array<{ filePath: string; importance: number }> = [];
  for (const [filePath, count] of fanInCounts) {
    updates.push({
      filePath,
      importance: count / maxFanIn,
    });
  }

  // Update each file's importance score
  for (const update of updates) {
    await supabase
      .from('playcraft_file_index')
      .update({ importance_score: update.importance })
      .eq('project_id', projectId)
      .eq('file_path', update.filePath);
  }

  console.log(`[Indexer] Calculated importance scores for ${updates.length} files`);
}

// ============================================
// Global Progress Tracking
// ============================================

const indexingProgress = new Map<string, IndexingProgress>();

export function getIndexingProgress(projectId: string): IndexingProgress {
  return indexingProgress.get(projectId) || {
    status: 'idle',
    filesProcessed: 0,
    totalFiles: 0,
    progress: 0,
  };
}

// ============================================
// Helper Functions
// ============================================

/**
 * Check if a file should be indexed
 */
function shouldIndexFile(filePath: string): boolean {
  // Check extension
  const hasValidExtension = INDEXABLE_EXTENSIONS.some(ext =>
    filePath.endsWith(ext)
  );
  if (!hasValidExtension) return false;

  // Check skip patterns
  const shouldSkip = SKIP_PATTERNS.some(pattern => pattern.test(filePath));
  if (shouldSkip) return false;

  return true;
}

/**
 * Get list of files that need indexing
 */
async function getFilesToIndex(
  projectId: string,
  files: Record<string, string>,
  forceReindex: boolean
): Promise<string[]> {
  const filesToIndex: string[] = [];

  for (const [filePath, content] of Object.entries(files)) {
    if (!shouldIndexFile(filePath)) continue;

    if (forceReindex) {
      filesToIndex.push(filePath);
      continue;
    }

    // Check if file needs embedding
    const contentHash = computeHashSync(content);
    const needsEmbedding = await fileNeedsEmbedding(projectId, filePath, contentHash);

    if (needsEmbedding) {
      filesToIndex.push(filePath);
    }
  }

  return filesToIndex;
}

// ============================================
// Main Indexing Functions
// ============================================

/**
 * Index multiple project files
 *
 * @param projectId - The project ID
 * @param files - Map of file paths to content
 * @param voyageApiKey - Voyage AI API key
 * @param options - Optional settings
 */
export async function indexProjectFiles(
  projectId: string,
  files: Record<string, string>,
  voyageApiKey: string,
  options?: { forceReindex?: boolean }
): Promise<IndexingResult> {
  const startTime = Date.now();
  const errors: IndexingError[] = [];
  let filesIndexed = 0;
  let chunksCreated = 0;
  let tokensUsed = 0;

  try {
    // Get files that need indexing
    const filesToIndex = await getFilesToIndex(
      projectId,
      files,
      options?.forceReindex || false
    );

    if (filesToIndex.length === 0) {
      console.log('[Indexer] No files need indexing');
      return {
        success: true,
        filesIndexed: 0,
        chunksCreated: 0,
        tokensUsed: 0,
        errors: [],
        duration: Date.now() - startTime,
      };
    }

    console.log(`[Indexer] Indexing ${filesToIndex.length} files...`);

    // Update progress
    indexingProgress.set(projectId, {
      status: 'indexing',
      filesProcessed: 0,
      totalFiles: filesToIndex.length,
      progress: 0,
    });

    // Collect all dependencies across batches
    const allDependencies: FileDependency[] = [];

    // Process files in batches
    for (let i = 0; i < filesToIndex.length; i += MAX_BATCH_SIZE) {
      const batch = filesToIndex.slice(i, i + MAX_BATCH_SIZE);
      const batchChunks: CodeChunk[] = [];
      const batchFileIndexes: FileIndex[] = [];

      // Process each file in batch
      for (const filePath of batch) {
        try {
          const content = files[filePath];
          if (!content) continue;

          // Update progress
          indexingProgress.set(projectId, {
            status: 'indexing',
            currentFile: filePath,
            filesProcessed: filesIndexed,
            totalFiles: filesToIndex.length,
            progress: Math.round((filesIndexed / filesToIndex.length) * 100),
          });

          // Analyze file for imports/exports
          const analysis = analyzeFile(filePath, content);

          // Process file (chunk it)
          const { chunks, lineCount } = processFileForIndexing(
            content,
            filePath,
            projectId
          );

          // Add chunks to batch
          batchChunks.push(...chunks);

          // Collect dependencies from imports
          for (const importPath of analysis.imports) {
            const normalizedPath = normalizeImportPath(filePath, importPath, files);
            if (normalizedPath) {
              allDependencies.push({
                projectId,
                fromFile: filePath,
                toFile: normalizedPath,
                dependencyType: 'import',
              });
            }
          }

          // Create file index entry
          const contentHash = computeHashSync(content);
          batchFileIndexes.push({
            projectId,
            filePath,
            contentHash,
            lineCount,
            fileType: analysis.type,
            exports: analysis.exports,
            imports: analysis.imports,
            importanceScore: 0,
            chunksCount: chunks.length,
          });

          filesIndexed++;
        } catch (error) {
          console.error(`[Indexer] Error processing ${filePath}:`, error);
          errors.push({
            filePath,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      // Generate embeddings for batch chunks
      if (batchChunks.length > 0) {
        try {
          const contents = batchChunks.map(c => c.content);
          const embeddings = await generateEmbeddings(contents, voyageApiKey);

          // Attach embeddings to chunks
          for (let j = 0; j < batchChunks.length; j++) {
            batchChunks[j].embedding = embeddings[j].embedding;
            tokensUsed += embeddings[j].tokens;
          }

          // Save chunks to database
          await saveCodeChunks(batchChunks);
          chunksCreated += batchChunks.length;

          console.log(`[Indexer] Created ${batchChunks.length} chunks with embeddings`);
        } catch (error) {
          console.error('[Indexer] Error generating embeddings:', error);
          errors.push({
            filePath: 'batch',
            error: error instanceof Error ? error.message : 'Embedding generation failed',
          });
        }
      }

      // Save file indexes
      for (const fileIndex of batchFileIndexes) {
        try {
          await saveFileIndex({
            ...fileIndex,
            lastEmbeddedAt: new Date().toISOString(),
          });
        } catch (error) {
          console.error(`[Indexer] Error saving file index:`, error);
        }
      }
    }

    // Save all dependencies to database
    if (allDependencies.length > 0) {
      await saveDependencies(allDependencies);
    }

    // Calculate importance scores based on fan-in
    await calculateImportanceScores(projectId);

    // Update progress to complete
    indexingProgress.set(projectId, {
      status: 'complete',
      filesProcessed: filesIndexed,
      totalFiles: filesToIndex.length,
      progress: 100,
    });

    console.log(`[Indexer] Complete: ${filesIndexed} files, ${chunksCreated} chunks, ${tokensUsed} tokens`);

    return {
      success: errors.length === 0,
      filesIndexed,
      chunksCreated,
      tokensUsed,
      errors,
      duration: Date.now() - startTime,
    };
  } catch (error) {
    console.error('[Indexer] Fatal error:', error);

    indexingProgress.set(projectId, {
      status: 'error',
      filesProcessed: filesIndexed,
      totalFiles: 0,
      progress: 0,
    });

    return {
      success: false,
      filesIndexed,
      chunksCreated,
      tokensUsed,
      errors: [{
        filePath: 'global',
        error: error instanceof Error ? error.message : 'Indexing failed',
      }],
      duration: Date.now() - startTime,
    };
  }
}

/**
 * Index a single file (used after AI generation)
 */
export async function indexSingleFile(
  projectId: string,
  filePath: string,
  content: string,
  voyageApiKey: string
): Promise<void> {
  if (!shouldIndexFile(filePath)) {
    return;
  }

  try {
    // Delete existing chunks for this file
    await deleteFileChunks(projectId, filePath);

    // Analyze file for imports/exports
    const analysis = analyzeFile(filePath, content);

    // Process file (chunk it)
    const { chunks, lineCount } = processFileForIndexing(
      content,
      filePath,
      projectId
    );

    if (chunks.length === 0) {
      return;
    }

    // Generate embeddings
    const contents = chunks.map(c => c.content);
    const embeddings = await generateEmbeddings(contents, voyageApiKey);

    // Attach embeddings
    for (let i = 0; i < chunks.length; i++) {
      chunks[i].embedding = embeddings[i].embedding;
    }

    // Save chunks
    await saveCodeChunks(chunks);

    // Collect and save dependencies
    const dependencies: FileDependency[] = [];
    for (const importPath of analysis.imports) {
      const normalizedPath = normalizeImportPath(filePath, importPath);
      if (normalizedPath) {
        dependencies.push({
          projectId,
          fromFile: filePath,
          toFile: normalizedPath,
          dependencyType: 'import',
        });
      }
    }
    if (dependencies.length > 0) {
      await saveDependencies(dependencies);
    }

    // Save file index
    const contentHash = computeHashSync(content);
    await saveFileIndex({
      projectId,
      filePath,
      contentHash,
      lineCount,
      fileType: analysis.type,
      exports: analysis.exports,
      imports: analysis.imports,
      importanceScore: 0,
      chunksCount: chunks.length,
      lastEmbeddedAt: new Date().toISOString(),
    });

    console.log(`[Indexer] Indexed ${filePath}: ${chunks.length} chunks`);
  } catch (error) {
    console.error(`[Indexer] Error indexing ${filePath}:`, error);
  }
}

/**
 * Get indexing status for a project
 */
export async function getIndexingStatus(projectId: string): Promise<IndexingStatus> {
  try {
    const stats = await getEmbeddingStats(projectId);

    return {
      needsIndexing: stats.embeddedFiles < stats.totalFiles,
      totalFiles: stats.totalFiles,
      indexedFiles: stats.embeddedFiles,
      pendingFiles: stats.totalFiles - stats.embeddedFiles,
      lastIndexed: stats.lastUpdated,
    };
  } catch {
    // If no stats exist, project needs indexing
    return {
      needsIndexing: true,
      totalFiles: 0,
      indexedFiles: 0,
      pendingFiles: 0,
      lastIndexed: null,
    };
  }
}

/**
 * Clear all embeddings for a project
 */
export async function clearProjectEmbeddings(projectId: string): Promise<void> {
  // This would need a bulk delete function
  // For now, let forceReindex handle it
  console.log(`[Indexer] Clearing embeddings for project ${projectId}`);
}
