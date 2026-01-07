import { describe, it, expect } from 'vitest';
import {
  generateFileOutline,
  shouldUseOutline,
  getFileContentOrOutline,
} from '../astOutlineService';

const sampleComponent = `
import React, { useState } from 'react';
import { Button } from '@/components/Button';

type GameProps = { level: number; title?: string };

export function GameBoard({ level }: GameProps) {
  const [score, setScore] = useState(0);
  return <div>{level + score}</div>;
}
`;

const longFile = new Array(60).fill('line').join('\n');

describe('astOutlineService (Phase 2 - AST outlines)', () => {
  it('generates outlines with imports, exports, and component metadata', () => {
    const outline = generateFileOutline('/src/pages/Index.tsx', sampleComponent);

    expect(outline.type).toBe('page');
    expect(outline.lineCount).toBeGreaterThan(0);
    expect(outline.exports).toContain('GameBoard');
    expect(outline.imports.find(i => i.from === '@/components/Button')).toBeTruthy();
    expect(outline.outline).toContain('Exports:');
    expect(outline.outline).toContain('Imports: Button');
    expect(outline.outline).toContain('Hooks: useState');
    expect(outline.estimatedTokens).toBeGreaterThan(0);
  });

  it('uses outline when file exceeds threshold and full content for small configs', () => {
    expect(shouldUseOutline('/src/utils/long.ts', longFile)).toBe(true);
    expect(shouldUseOutline('/tailwind.config.ts', longFile)).toBe(false);
  });

  it('returns outline content and flags correctly', () => {
    const outlined = getFileContentOrOutline('/src/utils/long.ts', longFile);
    expect(outlined.isOutline).toBe(true);
    expect(outlined.content).toContain('// /src/utils/long.ts');

    const full = getFileContentOrOutline('/src/pages/Index.tsx', sampleComponent);
    expect(full.isOutline).toBe(false);
    expect(full.content).toContain('GameBoard');
  });
});
