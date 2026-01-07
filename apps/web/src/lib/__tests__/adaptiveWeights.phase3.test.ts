import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAdaptiveWeights, clearWeightCache } from '../adaptiveWeights';

// Use a simple in-memory outcome set to exercise adjustment logic deterministically
const outcomes = [
  { selection_accuracy: 0.9, context_mode: 'full', intent_type: 'add' },
  { selection_accuracy: 0.85, context_mode: 'full', intent_type: 'debug' },
  { selection_accuracy: 0.5, context_mode: 'full', intent_type: 'add' },
  { selection_accuracy: 0.4, context_mode: 'minimal', intent_type: 'style' },
];

const supabaseMock = {
  from: (table: string) => {
    if (table !== 'playcraft_generation_outcomes') {
      throw new Error(`Unexpected table ${table}`);
    }

    const makeResult = (data: typeof outcomes) => ({
      order: () => ({
        limit: () => ({
          data,
          error: null,
          eq: () => ({
            data,
            error: null,
          }),
        }),
      }),
    });

    return {
      select: () => ({
        not: () => makeResult(outcomes),
      }),
      eq: () => ({
        data: outcomes.filter(o => o.intent_type === 'add'),
        error: null,
      }),
    };
  },
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseMock,
}));

describe('adaptiveWeights (Phase 3 - adaptive hybrid weights)', () => {
  beforeEach(() => {
    clearWeightCache();
  });

  it('returns defaults with low confidence when sample is below threshold', async () => {
    const { weights, confidence, sampleSize, avgAccuracy } = await getAdaptiveWeights('project-1');
    expect(sampleSize).toBe(outcomes.length);
    expect(confidence).toBe(0); // below MIN_OUTCOMES_FOR_ADAPTATION (10)
    expect(weights.semanticWeight).toBeGreaterThan(0);
    expect(avgAccuracy).toBeGreaterThan(0);
  });

  it('returns weights and confidence when using all outcomes', async () => {
    const { weights, confidence, sampleSize } = await getAdaptiveWeights(undefined);
    expect(sampleSize).toBe(outcomes.length);
    // Still below threshold, so confidence 0
    expect(confidence).toBe(0);
    expect(weights.keywordWeight).toBeGreaterThan(0);
  });
});
