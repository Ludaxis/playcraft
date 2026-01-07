import { describe, it, expect, beforeEach, vi } from 'vitest';
import { analyzeFile, detectChanges, getImportGraph, type FileHash } from '../fileHashService';

// In-memory Supabase mock focused on playcraft_file_hashes.
const tableData = {
  fileHashes: [] as Array<FileHash & { project_id: string }>,
};

const supabaseMock = {
  from: (table: string) => {
    if (table === 'playcraft_file_hashes') {
      return {
        select: () => ({
          eq: (col: string, projectId: string) => {
            void col; // Used by real API
            return {
              data: tableData.fileHashes.filter(fh => fh.project_id === projectId),
              error: null,
            };
          },
        }),
        upsert: (rows: Array<FileHash & { project_id: string }>) => {
          rows.forEach(row => {
            const idx = tableData.fileHashes.findIndex(
              fh => fh.project_id === row.project_id && fh.file_path === row.file_path
            );
            if (idx >= 0) {
              tableData.fileHashes[idx] = row;
            } else {
              tableData.fileHashes.push(row);
            }
          });
          return { error: null };
        },
        delete: () => ({
          eq: () => ({
            in: (field: string, paths: string[]) => {
              void field; // Used by real API
              tableData.fileHashes = tableData.fileHashes.filter(
                fh => !paths.includes(fh.file_path)
              );
              return { error: null };
            },
          }),
        }),
      };
    }

    throw new Error(`Unexpected table ${table}`);
  },
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseMock,
}));

describe('fileHashService (Phase 1 - file hash diffing)', () => {
  beforeEach(() => {
    tableData.fileHashes = [];
  });

  it('analyzes file type, exports, and imports correctly', () => {
    const content = `
      import Button from './components/Button';
      import type { Player } from '@/types';
      export function Game() { return null; }
      export const score = 0;
      export { Player as MainPlayer };
    `;

    const analysis = analyzeFile('/src/pages/Index.tsx', content);
    expect(analysis.type).toBe('page');
    expect(analysis.exports).toEqual(expect.arrayContaining(['Game', 'score']));
    expect(analysis.exports.join(' ')).toMatch(/Player/i);
    expect(analysis.imports).toEqual(
      expect.arrayContaining(['./components/Button', '@/types'])
    );
  });

  it('detects created and modified files based on hashes', async () => {
    // Existing file hash to detect modification
    tableData.fileHashes.push({
      project_id: 'project-1',
      file_path: '/src/pages/Index.tsx',
      content_hash: 'old',
      file_size: 3,
      last_modified: new Date().toISOString(),
      file_type: 'page',
      exports: [],
      imports: [],
      modification_count: 1,
    });

    const result = await detectChanges('project-1', {
      '/src/pages/Index.tsx': 'new content',
      '/src/utils/helpers.ts': 'helper content',
    });

    expect(result.modified).toEqual(['/src/pages/Index.tsx']);
    expect(result.created).toEqual(['/src/utils/helpers.ts']);
    expect(result.deleted).toEqual([]);
  });

  it('builds an import graph with normalized paths', async () => {
    tableData.fileHashes = [
      {
        project_id: 'project-1',
        file_path: '/src/pages/Index.tsx',
        content_hash: 'hash1',
        file_size: 1,
        last_modified: new Date().toISOString(),
        file_type: 'page',
        exports: [],
        imports: ['./components/Button', '@/utils/math'],
        modification_count: 1,
      },
      {
        project_id: 'project-1',
        file_path: '/src/components/Button.tsx',
        content_hash: 'hash2',
        file_size: 1,
        last_modified: new Date().toISOString(),
        file_type: 'component',
        exports: [],
        imports: [],
        modification_count: 1,
      },
      {
        project_id: 'project-1',
        file_path: '/src/utils/math.ts',
        content_hash: 'hash3',
        file_size: 1,
        last_modified: new Date().toISOString(),
        file_type: 'util',
        exports: [],
        imports: [],
        modification_count: 1,
      },
    ];

    const graph = await getImportGraph('project-1');

    expect(graph.get('/src/components/Button.tsx')).toEqual([
      '/src/pages/Index.tsx',
    ]);
    expect(graph.get('/src/utils/math.ts')).toEqual(['/src/pages/Index.tsx']);
  });
});
