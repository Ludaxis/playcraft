/**
 * Embedding Cache
 *
 * In-memory cache for Voyage AI query embeddings.
 * Reduces API calls by caching embeddings for repeated/similar queries.
 */

import { computeHashSync } from './fileHashService';

// ============================================================================
// TYPES
// ============================================================================

interface EmbeddingCacheEntry {
  queryHash: string;
  embedding: number[];
  createdAt: number;
}

interface CacheStats {
  hits: number;
  misses: number;
  size: number;
}

// ============================================================================
// CONFIGURATION
// ============================================================================

const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes
const MAX_CACHE_SIZE = 100; // Maximum entries before cleanup

// ============================================================================
// CACHE STATE
// ============================================================================

const cache = new Map<string, EmbeddingCacheEntry>();
const stats: CacheStats = {
  hits: 0,
  misses: 0,
  size: 0,
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Get a cached embedding for a query
 * Returns null if not found or expired
 */
export function getCachedEmbedding(query: string): number[] | null {
  const hash = computeHashSync(query);
  const entry = cache.get(hash);

  if (!entry) {
    stats.misses++;
    return null;
  }

  // Check if expired
  if (Date.now() - entry.createdAt > CACHE_TTL_MS) {
    cache.delete(hash);
    stats.misses++;
    stats.size = cache.size;
    return null;
  }

  stats.hits++;
  return entry.embedding;
}

/**
 * Store an embedding in the cache
 */
export function setCachedEmbedding(query: string, embedding: number[]): void {
  const hash = computeHashSync(query);

  cache.set(hash, {
    queryHash: hash,
    embedding,
    createdAt: Date.now(),
  });

  stats.size = cache.size;

  // Cleanup old entries if cache is too large
  if (cache.size > MAX_CACHE_SIZE) {
    cleanupExpiredEntries();
  }
}

/**
 * Clear all cached embeddings
 */
export function clearEmbeddingCache(): void {
  cache.clear();
  stats.size = 0;
  console.log('[EmbeddingCache] Cache cleared');
}

/**
 * Get cache statistics for debugging
 */
export function getEmbeddingCacheStats(): CacheStats & { hitRate: number } {
  const total = stats.hits + stats.misses;
  return {
    ...stats,
    hitRate: total > 0 ? stats.hits / total : 0,
  };
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Remove expired entries from cache
 */
function cleanupExpiredEntries(): void {
  const now = Date.now();
  let removed = 0;

  for (const [key, entry] of cache) {
    if (now - entry.createdAt > CACHE_TTL_MS) {
      cache.delete(key);
      removed++;
    }
  }

  // If still too large, remove oldest entries
  if (cache.size > MAX_CACHE_SIZE) {
    const entries = Array.from(cache.entries())
      .sort((a, b) => a[1].createdAt - b[1].createdAt);

    const toRemove = entries.slice(0, cache.size - MAX_CACHE_SIZE + 10);
    for (const [key] of toRemove) {
      cache.delete(key);
      removed++;
    }
  }

  stats.size = cache.size;

  if (removed > 0) {
    console.log(`[EmbeddingCache] Cleaned up ${removed} entries, ${cache.size} remaining`);
  }
}
