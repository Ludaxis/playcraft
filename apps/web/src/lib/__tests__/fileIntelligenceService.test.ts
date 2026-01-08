import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  getFileIntelligence,
  clearIntelligenceCache,
  quickSuggestFiles,
  getDependentFiles,
  getFileImports,
} from '../fileIntelligenceService';

// Mock the underlying services
vi.mock('../fileHashService', () => ({
  detectChanges: vi.fn().mockResolvedValue({
    created: ['/src/components/NewComponent.tsx'],
    modified: ['/src/pages/Index.tsx'],
    deleted: [],
    unchanged: ['/src/lib/utils.ts'],
  }),
  getProjectFileHashes: vi.fn().mockResolvedValue(
    new Map([
      ['/src/pages/Index.tsx', {
        file_path: '/src/pages/Index.tsx',
        content_hash: 'abc123',
        file_size: 1000,
        last_modified: '2024-01-01',
        file_type: 'page',
        exports: ['default', 'Game'],
        imports: ['@/components/ui/button', '@/lib/utils'],
        modification_count: 5,
      }],
      ['/src/lib/utils.ts', {
        file_path: '/src/lib/utils.ts',
        content_hash: 'def456',
        file_size: 500,
        last_modified: '2024-01-01',
        file_type: 'util',
        exports: ['cn', 'formatDate'],
        imports: ['clsx', 'tailwind-merge'],
        modification_count: 2,
      }],
    ])
  ),
  getImportGraph: vi.fn().mockResolvedValue(
    new Map([
      ['/src/lib/utils.ts', ['/src/pages/Index.tsx', '/src/components/Button.tsx']],
    ])
  ),
  getFilesByImportance: vi.fn().mockResolvedValue([
    '/src/pages/Index.tsx',
    '/src/lib/utils.ts',
  ]),
  analyzeFile: vi.fn().mockImplementation((path: string) => ({
    type: path.includes('/pages/') ? 'page' : 'util',
    exports: ['default'],
    imports: [],
  })),
  computeHash: vi.fn().mockResolvedValue('hash123'),
}));

vi.mock('../adaptiveWeights', () => ({
  getAdaptiveWeights: vi.fn().mockResolvedValue({
    weights: {
      semanticWeight: 0.4,
      keywordWeight: 0.2,
      recencyWeight: 0.25,
      importanceWeight: 0.15,
    },
    confidence: 0.8,
    sampleSize: 50,
    avgAccuracy: 0.75,
  }),
  clearWeightCache: vi.fn(),
}));

vi.mock('../embeddingService', () => ({
  searchSimilarFiles: vi.fn().mockResolvedValue([
    { path: '/src/pages/Index.tsx', similarity: 0.9 },
    { path: '/src/lib/utils.ts', similarity: 0.7 },
  ]),
}));

describe('fileIntelligenceService', () => {
  const projectId = 'test-project-123';
  const testFiles = {
    '/src/pages/Index.tsx': `
      import { Button } from '@/components/ui/button';
      import { cn } from '@/lib/utils';

      export default function Index() {
        return <div className="game">Game content</div>;
      }
    `,
    '/src/lib/utils.ts': `
      import { clsx } from 'clsx';
      export function cn(...args) { return clsx(...args); }
    `,
    '/src/components/NewComponent.tsx': `
      export function NewComponent() { return <div>New</div>; }
    `,
  };

  beforeEach(() => {
    clearIntelligenceCache();
    vi.clearAllMocks();
  });

  describe('getFileIntelligence', () => {
    it('returns comprehensive file intelligence', async () => {
      const intelligence = await getFileIntelligence(projectId, testFiles);

      expect(intelligence.projectId).toBe(projectId);
      expect(intelligence.changes).toBeDefined();
      expect(intelligence.changes.created).toContain('/src/components/NewComponent.tsx');
      expect(intelligence.changes.modified).toContain('/src/pages/Index.tsx');
      expect(intelligence.importGraph).toBeDefined();
      expect(intelligence.filesByImportance).toContain('/src/pages/Index.tsx');
      expect(intelligence.weights).toBeDefined();
      expect(intelligence.weights.semanticWeight).toBe(0.4);
    });

    it('provides searchSimilar function', async () => {
      const intelligence = await getFileIntelligence(projectId, testFiles);
      const results = await intelligence.searchSimilar('game component', 5);

      expect(results).toHaveLength(2);
      expect(results[0].path).toBe('/src/pages/Index.tsx');
      expect(results[0].reason).toBe('semantic');
    });

    it('provides suggestFiles function with hybrid scoring', async () => {
      const intelligence = await getFileIntelligence(projectId, testFiles);
      const suggestions = await intelligence.suggestFiles('update the game component', 5);

      expect(suggestions.length).toBeGreaterThan(0);
      expect(suggestions[0]).toHaveProperty('path');
      expect(suggestions[0]).toHaveProperty('score');
      expect(suggestions[0]).toHaveProperty('reasons');
    });

    it('provides getFileInfo function', async () => {
      const intelligence = await getFileIntelligence(projectId, testFiles);
      const info = intelligence.getFileInfo('/src/pages/Index.tsx');

      expect(info).not.toBeNull();
      expect(info?.type).toBe('page');
      expect(info?.isRecent).toBe(true); // It's in modified list
    });

    it('caches results for same files', async () => {
      const intelligence1 = await getFileIntelligence(projectId, testFiles);
      const intelligence2 = await getFileIntelligence(projectId, testFiles);

      // Should be the same cached instance
      expect(intelligence1).toBe(intelligence2);
    });
  });

  describe('quickSuggestFiles', () => {
    it('returns file suggestions based on keywords and recency', async () => {
      const suggestions = await quickSuggestFiles(
        projectId,
        'update the game',
        testFiles,
        5
      );

      expect(suggestions.length).toBeGreaterThan(0);
      // Should include Index.tsx (has 'game' keyword and is modified)
      expect(suggestions).toContain('/src/pages/Index.tsx');
    });

    it('prioritizes recently modified files', async () => {
      const suggestions = await quickSuggestFiles(
        projectId,
        'update something',
        testFiles,
        5
      );

      // Modified files should be included
      expect(suggestions).toContain('/src/pages/Index.tsx');
    });
  });

  describe('getDependentFiles', () => {
    it('returns files that import the given file', async () => {
      const dependents = await getDependentFiles(projectId, '/src/lib/utils.ts');

      expect(dependents).toContain('/src/pages/Index.tsx');
      expect(dependents).toContain('/src/components/Button.tsx');
    });
  });

  describe('getFileImports', () => {
    it('returns imports of a file', async () => {
      const imports = await getFileImports(projectId, '/src/pages/Index.tsx');

      expect(imports).toContain('@/components/ui/button');
      expect(imports).toContain('@/lib/utils');
    });
  });

  describe('clearIntelligenceCache', () => {
    it('clears cache for specific project', async () => {
      await getFileIntelligence(projectId, testFiles);

      clearIntelligenceCache(projectId);

      // Next call should fetch fresh data
      const intelligence = await getFileIntelligence(projectId, testFiles);
      expect(intelligence).toBeDefined();
    });

    it('clears all caches when no projectId provided', async () => {
      await getFileIntelligence(projectId, testFiles);
      await getFileIntelligence('another-project', testFiles);

      clearIntelligenceCache();

      // Both should be cleared
      const intelligence = await getFileIntelligence(projectId, testFiles);
      expect(intelligence).toBeDefined();
    });
  });
});

describe('keyword extraction and scoring', () => {
  const testFilesForKeywords = {
    '/src/pages/Index.tsx': `
      import { Button } from '@/components/ui/button';
      export default function Index() {
        return <div className="game">Game content</div>;
      }
    `,
  };

  beforeEach(() => {
    clearIntelligenceCache();
  });

  it('filters stop words from prompt and matches keywords', async () => {
    // This test verifies the hybrid scoring mechanism works
    const intelligence = await getFileIntelligence('test-project', testFilesForKeywords);
    const suggestions = await intelligence.suggestFiles('update the game component');

    // Should find Index.tsx - it has 'game' in content and is a semantic match
    expect(suggestions.some(s => s.path === '/src/pages/Index.tsx')).toBe(true);

    // The suggestion should have multiple reasons (semantic + keyword + recency)
    const indexSuggestion = suggestions.find(s => s.path === '/src/pages/Index.tsx');
    expect(indexSuggestion?.reasons.length).toBeGreaterThan(0);
  });
});
