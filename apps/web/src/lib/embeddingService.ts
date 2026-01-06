/**
 * Embedding Service for PlayCraft
 *
 * Uses Voyage AI's voyage-code-3 model for code-optimized embeddings.
 * Provides semantic search capabilities for code chunks.
 *
 * @see https://docs.voyageai.com/docs/embeddings
 */

import { getSupabase } from './supabase';
import { getCachedEmbedding, setCachedEmbedding } from './embeddingCache';

// ============================================
// Types
// ============================================

export interface CodeChunk {
  id?: string;
  projectId: string;
  filePath: string;
  chunkIndex: number;
  startLine: number;
  endLine: number;
  content: string;
  contentHash: string;
  chunkType?: 'function' | 'component' | 'class' | 'type' | 'hook' | 'constant' | 'other';
  symbolName?: string;
  embedding?: number[];
}

export interface SimilarChunk extends CodeChunk {
  similarity: number;
}

export interface EmbeddingResult {
  embedding: number[];
  tokens: number;
}

export interface FileIndex {
  id?: string;
  projectId: string;
  filePath: string;
  contentHash: string;
  lineCount: number;
  astOutline?: string;
  exports: string[];
  imports: { from: string; names: string[] }[];
  fileType?: string;
  importanceScore: number;
  chunksCount: number;
  lastEmbeddedAt?: string;
  embeddingError?: string;
}

export interface FileDependency {
  projectId: string;
  fromFile: string;
  toFile: string;
  dependencyType: 'import' | 'dynamic' | 'type-only' | 're-export';
  importedSymbols: string[];
}

// ============================================
// Configuration
// ============================================

const VOYAGE_API_URL = 'https://api.voyageai.com/v1/embeddings';
const VOYAGE_MODEL = 'voyage-code-3';
const EMBEDDING_DIMENSIONS = 1024;
const MAX_CHUNKS_PER_BATCH = 128; // Voyage batch limit (120K tokens per request)

// ============================================
// Embedding Generation
// ============================================

/**
 * Generate embeddings for text using Voyage AI
 */
export async function generateEmbedding(
  text: string,
  apiKey: string
): Promise<EmbeddingResult> {
  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: text,
      input_type: 'document', // 'document' for code chunks, 'query' for searches
      output_dimension: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return {
    embedding: data.data[0].embedding,
    tokens: data.usage?.total_tokens || 0,
  };
}

/**
 * Generate embeddings for multiple texts (batched)
 */
export async function generateEmbeddings(
  texts: string[],
  apiKey: string
): Promise<EmbeddingResult[]> {
  if (texts.length === 0) return [];

  // Split into batches if needed
  const batches: string[][] = [];
  for (let i = 0; i < texts.length; i += MAX_CHUNKS_PER_BATCH) {
    batches.push(texts.slice(i, i + MAX_CHUNKS_PER_BATCH));
  }

  const results: EmbeddingResult[] = [];

  for (const batch of batches) {
    const response = await fetch(VOYAGE_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: VOYAGE_MODEL,
        input: batch,
        input_type: 'document',
        output_dimension: EMBEDDING_DIMENSIONS,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Voyage API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const tokensPerItem = Math.ceil((data.usage?.total_tokens || 0) / batch.length);

    for (const item of data.data) {
      results.push({
        embedding: item.embedding,
        tokens: tokensPerItem,
      });
    }
  }

  return results;
}

/**
 * Generate embedding for a search query
 * Uses in-memory cache to reduce API calls
 */
export async function generateQueryEmbedding(
  query: string,
  apiKey: string
): Promise<number[]> {
  // Check cache first
  const cached = getCachedEmbedding(query);
  if (cached) {
    console.log('[Embedding] Cache hit for query');
    return cached;
  }

  // Generate new embedding
  const response = await fetch(VOYAGE_API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: VOYAGE_MODEL,
      input: query,
      input_type: 'query', // Optimized for search queries
      output_dimension: EMBEDDING_DIMENSIONS,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Voyage API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  const embedding = data.data[0].embedding;

  // Cache the result
  setCachedEmbedding(query, embedding);
  console.log('[Embedding] Cached new query embedding');

  return embedding;
}

// ============================================
// Database Operations - Code Chunks
// ============================================

/**
 * Save code chunks with embeddings to database
 */
export async function saveCodeChunks(chunks: CodeChunk[]): Promise<void> {
  if (chunks.length === 0) return;

  const { error } = await getSupabase()
    .from('playcraft_code_chunks')
    .upsert(
      chunks.map(chunk => ({
        project_id: chunk.projectId,
        file_path: chunk.filePath,
        chunk_index: chunk.chunkIndex,
        start_line: chunk.startLine,
        end_line: chunk.endLine,
        content: chunk.content,
        content_hash: chunk.contentHash,
        chunk_type: chunk.chunkType,
        symbol_name: chunk.symbolName,
        embedding: chunk.embedding ? `[${chunk.embedding.join(',')}]` : null,
        updated_at: new Date().toISOString(),
      })),
      { onConflict: 'project_id,file_path,chunk_index' }
    );

  if (error) {
    throw new Error(`Failed to save code chunks: ${error.message}`);
  }
}

/**
 * Delete chunks for a file (before re-indexing)
 */
export async function deleteFileChunks(
  projectId: string,
  filePath: string
): Promise<void> {
  const { error } = await getSupabase()
    .from('playcraft_code_chunks')
    .delete()
    .eq('project_id', projectId)
    .eq('file_path', filePath);

  if (error) {
    throw new Error(`Failed to delete file chunks: ${error.message}`);
  }
}

/**
 * Search for similar code chunks using vector similarity
 */
export async function searchSimilarChunks(
  projectId: string,
  queryEmbedding: number[],
  limit: number = 5,
  similarityThreshold: number = 0.5
): Promise<SimilarChunk[]> {
  const { data, error } = await getSupabase().rpc('search_code_chunks', {
    p_project_id: projectId,
    p_query_embedding: `[${queryEmbedding.join(',')}]`,
    p_limit: limit,
    p_similarity_threshold: similarityThreshold,
  });

  if (error) {
    throw new Error(`Failed to search chunks: ${error.message}`);
  }

  return (data || []).map((row: {
    chunk_id: string;
    file_path: string;
    chunk_index: number;
    start_line: number;
    end_line: number;
    content: string;
    chunk_type: string;
    symbol_name: string;
    similarity: number;
  }) => ({
    id: row.chunk_id,
    projectId,
    filePath: row.file_path,
    chunkIndex: row.chunk_index,
    startLine: row.start_line,
    endLine: row.end_line,
    content: row.content,
    contentHash: '',
    chunkType: row.chunk_type as CodeChunk['chunkType'],
    symbolName: row.symbol_name,
    similarity: row.similarity,
  }));
}

// ============================================
// Database Operations - File Index
// ============================================

/**
 * Save or update file index entry
 */
export async function saveFileIndex(file: FileIndex): Promise<void> {
  const { error } = await getSupabase()
    .from('playcraft_file_index')
    .upsert(
      {
        project_id: file.projectId,
        file_path: file.filePath,
        content_hash: file.contentHash,
        line_count: file.lineCount,
        ast_outline: file.astOutline,
        exports: file.exports,
        imports: file.imports,
        file_type: file.fileType,
        importance_score: file.importanceScore,
        chunks_count: file.chunksCount,
        last_embedded_at: file.lastEmbeddedAt,
        embedding_error: file.embeddingError,
        last_modified: new Date().toISOString(),
      },
      { onConflict: 'project_id,file_path' }
    );

  if (error) {
    throw new Error(`Failed to save file index: ${error.message}`);
  }
}

/**
 * Get file index for a project
 */
export async function getFileIndex(projectId: string): Promise<FileIndex[]> {
  const { data, error } = await getSupabase()
    .from('playcraft_file_index')
    .select('*')
    .eq('project_id', projectId)
    .order('importance_score', { ascending: false });

  if (error) {
    throw new Error(`Failed to get file index: ${error.message}`);
  }

  return (data || []).map((row: {
    id: string;
    project_id: string;
    file_path: string;
    content_hash: string;
    line_count: number;
    ast_outline: string;
    exports: string[];
    imports: { from: string; names: string[] }[];
    file_type: string;
    importance_score: number;
    chunks_count: number;
    last_embedded_at: string;
    embedding_error: string;
  }) => ({
    id: row.id,
    projectId: row.project_id,
    filePath: row.file_path,
    contentHash: row.content_hash,
    lineCount: row.line_count,
    astOutline: row.ast_outline,
    exports: row.exports || [],
    imports: row.imports || [],
    fileType: row.file_type,
    importanceScore: row.importance_score,
    chunksCount: row.chunks_count,
    lastEmbeddedAt: row.last_embedded_at,
    embeddingError: row.embedding_error,
  }));
}

// ============================================
// Database Operations - Dependencies
// ============================================

/**
 * Save file dependencies
 */
export async function saveFileDependencies(deps: FileDependency[]): Promise<void> {
  if (deps.length === 0) return;

  const { error } = await getSupabase()
    .from('playcraft_file_dependencies')
    .upsert(
      deps.map(dep => ({
        project_id: dep.projectId,
        from_file: dep.fromFile,
        to_file: dep.toFile,
        dependency_type: dep.dependencyType,
        imported_symbols: dep.importedSymbols,
      })),
      { onConflict: 'project_id,from_file,to_file' }
    );

  if (error) {
    throw new Error(`Failed to save dependencies: ${error.message}`);
  }
}

/**
 * Get files that depend on a given file
 */
export async function getFileDependents(
  projectId: string,
  filePath: string
): Promise<{ file: string; symbols: string[] }[]> {
  const { data, error } = await getSupabase().rpc('get_file_dependents', {
    p_project_id: projectId,
    p_file_path: filePath,
  });

  if (error) {
    throw new Error(`Failed to get dependents: ${error.message}`);
  }

  return (data || []).map((row: { dependent_file: string; imported_symbols: string[] }) => ({
    file: row.dependent_file,
    symbols: row.imported_symbols || [],
  }));
}

/**
 * Get files that a given file depends on
 */
export async function getFileDependencies(
  projectId: string,
  filePath: string
): Promise<{ file: string; symbols: string[] }[]> {
  const { data, error } = await getSupabase().rpc('get_file_dependencies', {
    p_project_id: projectId,
    p_file_path: filePath,
  });

  if (error) {
    throw new Error(`Failed to get dependencies: ${error.message}`);
  }

  return (data || []).map((row: { dependency_file: string; imported_symbols: string[] }) => ({
    file: row.dependency_file,
    symbols: row.imported_symbols || [],
  }));
}

// ============================================
// High-Level Operations
// ============================================

/**
 * Semantic search for relevant code given a user query
 * Combines embedding similarity with keyword matching
 */
export async function semanticCodeSearch(
  projectId: string,
  query: string,
  voyageApiKey: string,
  options: {
    limit?: number;
    similarityThreshold?: number;
    includeKeywordMatches?: boolean;
  } = {}
): Promise<SimilarChunk[]> {
  const {
    limit = 5,
    similarityThreshold = 0.4,
    includeKeywordMatches = true,
  } = options;

  // Generate query embedding
  const queryEmbedding = await generateQueryEmbedding(query, voyageApiKey);

  // Vector similarity search
  const similarChunks = await searchSimilarChunks(
    projectId,
    queryEmbedding,
    limit * 2, // Get more for re-ranking
    similarityThreshold
  );

  // Optionally boost chunks that contain query keywords
  if (includeKeywordMatches) {
    const keywords = query.toLowerCase().split(/\s+/).filter(w => w.length > 2);

    for (const chunk of similarChunks) {
      const contentLower = chunk.content.toLowerCase();
      const symbolLower = (chunk.symbolName || '').toLowerCase();

      let keywordBoost = 0;
      for (const keyword of keywords) {
        if (contentLower.includes(keyword)) keywordBoost += 0.1;
        if (symbolLower.includes(keyword)) keywordBoost += 0.2;
      }

      chunk.similarity = Math.min(1, chunk.similarity + keywordBoost);
    }

    // Re-sort by boosted similarity
    similarChunks.sort((a, b) => b.similarity - a.similarity);
  }

  return similarChunks.slice(0, limit);
}

/**
 * Check if a file needs re-embedding (content changed)
 */
export async function fileNeedsEmbedding(
  projectId: string,
  filePath: string,
  contentHash: string
): Promise<boolean> {
  const { data } = await getSupabase()
    .from('playcraft_file_index')
    .select('content_hash, last_embedded_at')
    .eq('project_id', projectId)
    .eq('file_path', filePath)
    .single();

  if (!data) return true; // New file
  if (data.content_hash !== contentHash) return true; // Content changed
  if (!data.last_embedded_at) return true; // Never embedded

  return false;
}

/**
 * Get embedding statistics for a project
 */
export async function getEmbeddingStats(projectId: string): Promise<{
  totalFiles: number;
  embeddedFiles: number;
  totalChunks: number;
  lastUpdated: string | null;
}> {
  const [fileResult, chunkResult] = await Promise.all([
    getSupabase()
      .from('playcraft_file_index')
      .select('last_embedded_at', { count: 'exact' })
      .eq('project_id', projectId),
    getSupabase()
      .from('playcraft_code_chunks')
      .select('id', { count: 'exact' })
      .eq('project_id', projectId),
  ]);

  const files = fileResult.data || [];
  const embeddedFiles = files.filter(f => f.last_embedded_at).length;
  const lastUpdated = files
    .map(f => f.last_embedded_at)
    .filter(Boolean)
    .sort()
    .pop() || null;

  return {
    totalFiles: fileResult.count || 0,
    embeddedFiles,
    totalChunks: chunkResult.count || 0,
    lastUpdated,
  };
}
