import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock dependencies
vi.mock('../supabase', () => ({
  getSupabase: () => ({
    rpc: vi.fn().mockResolvedValue({ data: [], error: null }),
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: null, error: null }),
      }),
    }),
  }),
}));

vi.mock('../taskLedgerService', () => ({
  getTaskContext: vi.fn().mockResolvedValue({
    ledger: { currentGoal: null, substeps: [], blockers: [], lastKnownState: null },
    recentDeltas: [],
  }),
  formatTaskContextForPrompt: vi.fn().mockReturnValue(''),
}));

vi.mock('../fileHashService', () => ({
  getProjectFileHashes: vi.fn().mockResolvedValue(new Map()),
  getImportGraph: vi.fn().mockResolvedValue(new Map()),
}));

vi.mock('../adaptiveWeights', () => ({
  getAdaptiveWeights: vi.fn().mockResolvedValue({
    weights: { semanticWeight: 0.4, keywordWeight: 0.35, recencyWeight: 0.1, importanceWeight: 0.15 },
    confidence: 0.8,
  }),
}));

vi.mock('../queryEnhancer', () => ({
  enhanceQuery: vi.fn().mockResolvedValue({ expandedTerms: [], synonyms: [] }),
}));

vi.mock('../embeddingService', () => ({
  getEmbedding: vi.fn().mockResolvedValue([]),
}));

import {
  analyzeUserIntent,
  preflightEstimate,
  generateStructuredPlan,
  formatPlanForPrompt,
} from '../contextBuilder';

describe('contextBuilder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('analyzeUserIntent', () => {
    it('classifies "create" intent correctly', () => {
      const intent = analyzeUserIntent('create a new game with space invaders');
      expect(intent.action).toBe('create');
      expect(intent.confidence).toBeGreaterThan(0.5);
    });

    it('classifies "tweak" intent for simple changes', () => {
      const intent = analyzeUserIntent('change the color to red');
      expect(intent.action).toBe('tweak');
      expect(intent.isTrivialChange).toBe(true);
    });

    it('classifies "debug" intent correctly', () => {
      const intent = analyzeUserIntent('fix the bug where player falls through floor');
      expect(intent.action).toBe('debug');
    });

    it('classifies "style" intent correctly', () => {
      const intent = analyzeUserIntent('update the css style of the header');
      expect(intent.action).toBe('style');
      expect(intent.isVisualChange).toBe(true);
    });

    it('classifies "add" intent correctly', () => {
      const intent = analyzeUserIntent('add a power-up system');
      expect(intent.action).toBe('add');
    });

    it('classifies "modify" intent correctly', () => {
      const intent = analyzeUserIntent('update the scoring system to give more points');
      expect(intent.action).toBe('modify');
    });

    it('extracts keywords from prompt', () => {
      const intent = analyzeUserIntent('add collision detection to the player');
      expect(intent.keywords).toContain('collision');
      expect(intent.keywords).toContain('player');
    });
  });

  describe('preflightEstimate', () => {
    const mockFiles = {
      '/src/pages/Index.tsx': 'const Game = () => { return <div>Game</div>; };',
      '/src/index.css': '.game { background: red; }',
      '/package.json': '{"name": "test"}',
    };

    const mockConversation = [
      { role: 'user' as const, content: 'Hello' },
      { role: 'assistant' as const, content: 'Hi there!' },
    ];

    it('returns correct intent classification', () => {
      const estimate = preflightEstimate(
        'create a puzzle game',
        mockFiles,
        undefined,
        mockConversation,
        null
      );
      expect(estimate.intent).toBe('create');
    });

    it('returns appropriate token budget for intent', () => {
      const createEstimate = preflightEstimate('create a new game', mockFiles, undefined, mockConversation, null);
      const tweakEstimate = preflightEstimate('change color', mockFiles, undefined, mockConversation, null);

      expect(createEstimate.tokenBudget).toBeGreaterThan(tweakEstimate.tokenBudget);
    });

    it('estimates tokens within reasonable range', () => {
      const estimate = preflightEstimate('add a feature', mockFiles, undefined, mockConversation, null);
      expect(estimate.estimatedTokens).toBeGreaterThan(0);
      expect(estimate.estimatedTokens).toBeLessThan(50000);
    });

    it('recommends minimal mode for trivial changes', () => {
      const estimate = preflightEstimate('change the color to blue', mockFiles, undefined, mockConversation, null);
      expect(estimate.recommendedMode).toBe('minimal');
    });

    it('recommends full mode for complex changes', () => {
      const estimate = preflightEstimate('implement multiplayer support with real-time sync', mockFiles, undefined, mockConversation, null);
      expect(estimate.recommendedMode).toBe('full');
    });

    it('includes breakdown of token usage', () => {
      const estimate = preflightEstimate('add a feature', mockFiles, undefined, mockConversation, null);
      expect(estimate.breakdown).toBeDefined();
      expect(estimate.breakdown.filesTokens).toBeGreaterThanOrEqual(0);
      expect(estimate.breakdown.reservedTokens).toBeGreaterThan(0);
    });
  });

  describe('generateStructuredPlan', () => {
    const mockFiles = {
      '/src/pages/Index.tsx': 'const Game = () => { return <div>Game</div>; };',
      '/src/index.css': '.game { background: red; }',
    };

    it('returns null for trivial changes', () => {
      const plan = generateStructuredPlan('change the color to red', mockFiles, null);
      expect(plan).toBeNull();
    });

    it('generates plan for create intent', () => {
      const plan = generateStructuredPlan('create a new platformer game', mockFiles, null);
      expect(plan).not.toBeNull();
      expect(plan!.steps.length).toBeGreaterThan(0);
      expect(plan!.goal).toContain('platformer');
    });

    it('generates plan for add intent', () => {
      const plan = generateStructuredPlan('add power-up system', mockFiles, null);
      expect(plan).not.toBeNull();
      expect(plan!.steps.length).toBeGreaterThan(0);
    });

    it('includes affected files in plan', () => {
      const plan = generateStructuredPlan('add scoring system', mockFiles, null);
      expect(plan).not.toBeNull();
      expect(plan!.affectedFiles.length).toBeGreaterThan(0);
    });

    it('includes step dependencies', () => {
      const plan = generateStructuredPlan('create a complete game with animations', mockFiles, null);
      expect(plan).not.toBeNull();
      // Create plans should have multiple steps with dependencies
      if (plan!.steps.length > 1) {
        expect(plan!.steps[1].dependsOn).toContain(1);
      }
    });

    it('calculates total complexity', () => {
      const plan = generateStructuredPlan('add collision detection', mockFiles, null);
      expect(plan).not.toBeNull();
      expect(plan!.totalComplexity).toBeGreaterThan(0);
    });
  });

  describe('formatPlanForPrompt', () => {
    it('formats plan as readable string', () => {
      const plan = {
        goal: 'Add a scoring system',
        steps: [
          {
            stepNumber: 1,
            description: 'Add score state',
            files: ['/src/pages/Index.tsx'],
            operation: 'modify' as const,
            complexity: 2,
            dependsOn: [],
          },
          {
            stepNumber: 2,
            description: 'Display score UI',
            files: ['/src/pages/Index.tsx'],
            operation: 'modify' as const,
            complexity: 2,
            dependsOn: [1],
          },
        ],
        totalComplexity: 4,
        affectedFiles: ['/src/pages/Index.tsx'],
        executionOrder: [1, 2],
      };

      const formatted = formatPlanForPrompt(plan);
      expect(formatted).toContain('Execution Plan');
      expect(formatted).toContain('Add a scoring system');
      expect(formatted).toContain('1. Add score state');
      expect(formatted).toContain('2. Display score UI');
      expect(formatted).toContain('/src/pages/Index.tsx');
    });
  });
});
