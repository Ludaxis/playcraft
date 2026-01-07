import { describe, it, expect } from 'vitest';
import {
  buildMinimalContext,
  needsFullContext,
  getRecommendedContextMode,
} from '../contextBuilder';

const files = {
  '/src/pages/Index.tsx': 'export function Game() { return null; }',
  '/src/components/Button.tsx': 'export const Button = () => null;',
};

describe('contextBuilder Phase 2 primitives (intent classification + minimal context)', () => {
  it('classifies trivial tweaks as not needing full context', () => {
    expect(needsFullContext('change the button color to red')).toBe(false);
    expect(getRecommendedContextMode('rename Start to Begin')).toBe('minimal');
  });

  it('classifies style/explain as outline mode and create as full', () => {
    expect(getRecommendedContextMode('explain how scoring works')).toBe('outline');
    expect(getRecommendedContextMode('style the header with gradient')).toBe('outline');
    expect(getRecommendedContextMode('create a new platformer game')).toBe('full');
  });

  it('builds minimal context with main and selected file only', async () => {
    const context = await buildMinimalContext('project-1', 'tweak color', files, '/src/components/Button.tsx');
    expect(context.contextMode).toBe('minimal');
    expect(context.relevantFiles.map(f => f.path)).toEqual(
      expect.arrayContaining(['/src/pages/Index.tsx', '/src/components/Button.tsx'])
    );
    expect(context.recentMessages).toEqual([]);
    expect(context.projectMemory).toBeNull();
  });
});
