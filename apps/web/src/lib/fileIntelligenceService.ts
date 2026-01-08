/**
 * File Intelligence Service
 *
 * Consolidated service that provides unified file analysis capabilities:
 * - Change detection (via fileHashService)
 * - Import graph analysis (via fileHashService)
 * - Semantic search (via embeddingService)
 * - Adaptive context selection (via adaptiveWeights)
 * - File importance scoring
 *
 * This service provides a single entry point for all file intelligence needs.
 */

import {
  detectChanges,
  getProjectFileHashes,
  getImportGraph,
  getFilesByImportance,
  analyzeFile,
  computeHash,
  type FileChangeResult,
  type FileHash,
} from './fileHashService';
import {
  getAdaptiveWeights,
  clearWeightCache,
  type HybridWeights,
} from './adaptiveWeights';
import { searchSimilarFiles } from './embeddingService';

// ============================================================================
// TYPES
// ============================================================================

export interface FileIntelligence {
  projectId: string;
  changes: FileChangeResult;
  importGraph: Map<string, string[]>;
  filesByImportance: string[];
  weights: HybridWeights;
  searchSimilar: (query: string, limit?: number) => Promise<SimilarFile[]>;
  suggestFiles: (prompt: string, limit?: number) => Promise<SuggestedFile[]>;
  getFileInfo: (path: string) => FileInfo | null;
}

export interface SimilarFile {
  path: string;
  score: number;
  reason: 'semantic' | 'keyword' | 'recent' | 'important';
}

export interface SuggestedFile {
  path: string;
  score: number;
  reasons: string[];
}

export interface FileInfo {
  path: string;
  type: string;
  exports: string[];
  imports: string[];
  importedBy: string[];
  modificationCount: number;
  isRecent: boolean;
}

interface FileIntelligenceCache {
  intelligence: FileIntelligence;
  cachedAt: number;
  filesHash: string;
}

// ============================================================================
// CACHE
// ============================================================================

const intelligenceCache = new Map<string, FileIntelligenceCache>();
const CACHE_TTL_MS = 60 * 1000; // 1 minute

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get comprehensive file intelligence for a project
 * Consolidates all file analysis into a single call
 */
export async function getFileIntelligence(
  projectId: string,
  currentFiles: Record<string, string>
): Promise<FileIntelligence> {
  // Check cache
  const filesHash = await computeFilesHash(currentFiles);
  const cached = intelligenceCache.get(projectId);

  if (cached && cached.filesHash === filesHash && Date.now() - cached.cachedAt < CACHE_TTL_MS) {
    return cached.intelligence;
  }

  // Gather all intelligence in parallel
  const [changes, fileHashes, importGraph, filesByImportance, weightsAnalysis] = await Promise.all([
    detectChanges(projectId, currentFiles),
    getProjectFileHashes(projectId),
    getImportGraph(projectId),
    getFilesByImportance(projectId),
    getAdaptiveWeights(projectId),
  ]);

  // Build reverse import lookup
  const importedByMap = new Map<string, string[]>();
  for (const [file, importers] of importGraph) {
    importedByMap.set(file, importers);
  }

  // Build file info lookup
  const fileInfoMap = new Map<string, FileInfo>();
  for (const [path, content] of Object.entries(currentFiles)) {
    const hash = fileHashes.get(path);
    const analysis = analyzeFile(path, content);

    fileInfoMap.set(path, {
      path,
      type: analysis.type,
      exports: analysis.exports,
      imports: analysis.imports,
      importedBy: importedByMap.get(path) || [],
      modificationCount: hash?.modification_count || 1,
      isRecent: changes.modified.includes(path) || changes.created.includes(path),
    });
  }

  // Create the intelligence object
  const intelligence: FileIntelligence = {
    projectId,
    changes,
    importGraph,
    filesByImportance,
    weights: weightsAnalysis.weights,

    searchSimilar: async (query: string, limit = 5): Promise<SimilarFile[]> => {
      try {
        const results = await searchSimilarFiles(projectId, query, limit * 2);
        return results.slice(0, limit).map(r => ({
          path: r.path,
          score: r.similarity,
          reason: 'semantic' as const,
        }));
      } catch {
        return [];
      }
    },

    suggestFiles: async (prompt: string, limit = 10): Promise<SuggestedFile[]> => {
      const suggestions = new Map<string, SuggestedFile>();
      const weights = weightsAnalysis.weights;

      // 1. Semantic search (if available)
      try {
        const semanticResults = await searchSimilarFiles(projectId, prompt, limit);
        for (const result of semanticResults) {
          const existing = suggestions.get(result.path);
          const semanticScore = result.similarity * weights.semanticWeight;
          if (existing) {
            existing.score += semanticScore;
            existing.reasons.push('semantic match');
          } else {
            suggestions.set(result.path, {
              path: result.path,
              score: semanticScore,
              reasons: ['semantic match'],
            });
          }
        }
      } catch {
        // Semantic search not available
      }

      // 2. Keyword matching
      const keywords = extractKeywords(prompt);
      for (const [path, content] of Object.entries(currentFiles)) {
        const keywordScore = calculateKeywordScore(content, keywords) * weights.keywordWeight;
        if (keywordScore > 0.1) {
          const existing = suggestions.get(path);
          if (existing) {
            existing.score += keywordScore;
            existing.reasons.push('keyword match');
          } else {
            suggestions.set(path, {
              path,
              score: keywordScore,
              reasons: ['keyword match'],
            });
          }
        }
      }

      // 3. Recency boost
      for (const path of [...changes.modified, ...changes.created]) {
        const existing = suggestions.get(path);
        const recencyScore = weights.recencyWeight;
        if (existing) {
          existing.score += recencyScore;
          existing.reasons.push('recently modified');
        } else {
          suggestions.set(path, {
            path,
            score: recencyScore,
            reasons: ['recently modified'],
          });
        }
      }

      // 4. Importance boost
      const topImportant = filesByImportance.slice(0, Math.ceil(filesByImportance.length * 0.3));
      for (const path of topImportant) {
        const existing = suggestions.get(path);
        const importanceScore = weights.importanceWeight * 0.5;
        if (existing) {
          existing.score += importanceScore;
          existing.reasons.push('frequently modified');
        }
      }

      // Sort by score and return top results
      return Array.from(suggestions.values())
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    },

    getFileInfo: (path: string): FileInfo | null => {
      return fileInfoMap.get(path) || null;
    },
  };

  // Cache the result
  intelligenceCache.set(projectId, {
    intelligence,
    cachedAt: Date.now(),
    filesHash,
  });

  return intelligence;
}

/**
 * Clear intelligence cache for a project
 */
export function clearIntelligenceCache(projectId?: string): void {
  if (projectId) {
    intelligenceCache.delete(projectId);
    clearWeightCache(projectId);
  } else {
    intelligenceCache.clear();
    clearWeightCache();
  }
}

/**
 * Get quick file suggestions without full intelligence
 * Lighter weight than full getFileIntelligence
 */
export async function quickSuggestFiles(
  projectId: string,
  prompt: string,
  currentFiles: Record<string, string>,
  limit = 5
): Promise<string[]> {
  // Fast path: keyword matching + recency
  const keywords = extractKeywords(prompt);
  const scores = new Map<string, number>();

  // Check recent changes
  const changes = await detectChanges(projectId, currentFiles);
  for (const path of [...changes.modified, ...changes.created]) {
    scores.set(path, (scores.get(path) || 0) + 0.3);
  }

  // Keyword matching
  for (const [path, content] of Object.entries(currentFiles)) {
    const keywordScore = calculateKeywordScore(content, keywords);
    if (keywordScore > 0) {
      scores.set(path, (scores.get(path) || 0) + keywordScore);
    }
  }

  // Sort and return paths
  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([path]) => path);
}

/**
 * Get files that depend on a given file (via imports)
 */
export async function getDependentFiles(
  projectId: string,
  filePath: string
): Promise<string[]> {
  const importGraph = await getImportGraph(projectId);
  return importGraph.get(filePath) || [];
}

/**
 * Get files that a given file imports
 */
export async function getFileImports(
  projectId: string,
  filePath: string
): Promise<string[]> {
  const hashes = await getProjectFileHashes(projectId);
  const fileHash = hashes.get(filePath);
  return fileHash?.imports || [];
}

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Compute a hash of all files for cache invalidation
 */
async function computeFilesHash(files: Record<string, string>): Promise<string> {
  const paths = Object.keys(files).sort();
  const content = paths.join(':');
  return computeHash(content);
}

/**
 * Extract keywords from a prompt for matching
 */
function extractKeywords(prompt: string): string[] {
  // Remove common words and extract meaningful keywords
  const stopWords = new Set([
    'the', 'a', 'an', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
    'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could',
    'should', 'may', 'might', 'must', 'can', 'to', 'of', 'in', 'for',
    'on', 'with', 'at', 'by', 'from', 'as', 'into', 'through', 'during',
    'before', 'after', 'above', 'below', 'between', 'under', 'again',
    'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why',
    'how', 'all', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
    'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very',
    'just', 'and', 'but', 'if', 'or', 'because', 'until', 'while', 'this',
    'that', 'these', 'those', 'it', 'its', 'i', 'me', 'my', 'we', 'our',
    'you', 'your', 'he', 'him', 'his', 'she', 'her', 'they', 'them', 'their',
    'what', 'which', 'who', 'whom', 'make', 'add', 'change', 'update', 'fix',
    'create', 'remove', 'delete', 'modify', 'edit', 'please', 'want', 'need',
  ]);

  return prompt
    .toLowerCase()
    .replace(/[^\w\s]/g, ' ')
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculate keyword match score for a file
 */
function calculateKeywordScore(content: string, keywords: string[]): number {
  if (keywords.length === 0) return 0;

  const contentLower = content.toLowerCase();
  let matches = 0;

  for (const keyword of keywords) {
    // Check for exact word match (not substring)
    const regex = new RegExp(`\\b${escapeRegex(keyword)}\\b`, 'i');
    if (regex.test(contentLower)) {
      matches++;
    }
  }

  return matches / keywords.length;
}

/**
 * Escape special regex characters
 */
function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// ============================================================================
// RE-EXPORTS for backwards compatibility
// ============================================================================

export {
  detectChanges,
  getProjectFileHashes,
  getImportGraph,
  getFilesByImportance,
  computeHash,
  analyzeFile,
  type FileChangeResult,
  type FileHash,
} from './fileHashService';

export {
  getAdaptiveWeights,
  clearWeightCache,
  DEFAULT_WEIGHTS,
  type HybridWeights,
} from './adaptiveWeights';
