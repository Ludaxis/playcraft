import { describe, it, expect } from 'vitest';
import { enhanceQueryForSearch } from '../queryEnhancer';

describe('queryEnhancer (Phase 3 - query enhancement)', () => {
  it('adds selected file and changed file hints', () => {
    const prompt = 'fix collision detection';
    const enhanced = enhanceQueryForSearch(prompt, '/src/pages/Index.tsx', ['/src/utils/collision.ts']);

    expect(enhanced).toContain('Index'); // function trims extension for brevity
    expect(enhanced.toLowerCase()).toContain('collision');
    expect(enhanced.toLowerCase()).toContain('fix collision detection');
  });

  it('falls back gracefully when no extra context provided', () => {
    const enhanced = enhanceQueryForSearch('add sound effects');
    expect(enhanced).toContain('add sound effects');
  });
});
