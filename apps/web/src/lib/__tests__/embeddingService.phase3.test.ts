import { describe, it, expect, vi, beforeEach } from 'vitest';
import { semanticCodeSearch } from '../embeddingService';

// Minimal mock for Supabase RPC used by searchSimilarChunks
interface RpcArgs {
  p_similarity_threshold?: number;
}

const supabaseMock = {
  rpc: (fn: string, args: RpcArgs) => {
    if (fn === 'search_code_chunks') {
      const threshold = args?.p_similarity_threshold ?? 0;
      const data = [
        {
          chunk_id: '1',
          file_path: '/src/pages/Index.tsx',
          chunk_index: 0,
          start_line: 1,
          end_line: 5,
          content: 'function Game() { handleWin(); }',
          chunk_type: 'function',
          symbol_name: 'Game',
          similarity: 0.55,
        },
        {
          chunk_id: '2',
          file_path: '/src/utils/math.ts',
          chunk_index: 0,
          start_line: 1,
          end_line: 5,
          content: 'export function clamp() {}',
          chunk_type: 'function',
          symbol_name: 'clamp',
          similarity: 0.35,
        },
      ].filter(c => c.similarity >= threshold);

      return Promise.resolve({
        data,
        error: null,
      });
    }
    if (fn === 'get_file_dependencies') {
      return Promise.resolve({ data: [], error: null });
    }
    if (fn === 'get_file_dependents') {
      return Promise.resolve({ data: [], error: null });
    }
    throw new Error(`Unexpected RPC ${fn} with args ${JSON.stringify(args)}`);
  },
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseMock,
}));

// Mock Voyage embedding generation to avoid network
// Stub fetch for generateQueryEmbedding to avoid real network calls
const fakeEmbedding = new Array(1024).fill(0.01);

beforeEach(() => {
  vi.stubGlobal('fetch', vi.fn(async () => ({
    ok: true,
    json: async () => ({
      data: [{ embedding: fakeEmbedding }],
      usage: { total_tokens: 10 },
    }),
    text: async () => '',
    status: 200,
  })));
});

// Mock searchSimilarChunks to rely on the RPC data above instead of real supabase calls
vi.mock('../embeddingService', async importOriginal => {
  const actual = await importOriginal<typeof import('../embeddingService')>();
  return {
    ...actual,
    searchSimilarChunks: vi.fn(async () => {
      const { data } = await supabaseMock.rpc('search_code_chunks', {});
      return data;
    }),
  };
});

describe('embeddingService (Phase 3 - semantic search)', () => {
  it('returns semantic matches with keyword boosting and thresholding', async () => {
    const results = await semanticCodeSearch(
      'project-1',
      'handle win state',
      'fake-voyage-key',
      { limit: 2, similarityThreshold: 0.3, includeKeywordMatches: true }
    );

    expect(results).toHaveLength(2);
    // First chunk should remain top due to higher similarity and keyword boost (handle/win)
    expect(results[0].filePath).toBe('/src/pages/Index.tsx');
    expect(results[0].similarity).toBeGreaterThan(0.55);
  });

  it('filters out results below threshold', async () => {
    const results = await semanticCodeSearch(
      'project-1',
      'non matching query',
      'fake-voyage-key',
      { limit: 1, similarityThreshold: 0.6, includeKeywordMatches: false }
    );

    // Both mock chunks are below 0.6, expect empty
    expect(results).toEqual([]);
  });
});
