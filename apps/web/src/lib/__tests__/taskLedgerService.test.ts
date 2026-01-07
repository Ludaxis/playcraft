import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  from: vi.fn(),
  rpc: vi.fn(),
};

vi.mock('../supabase', () => ({
  getSupabase: () => mockSupabase,
}));

import {
  getTaskLedger,
  updateTaskLedger,
  getNextTurnNumber,
  recordDelta,
  getRecentDeltas,
  formatTaskContextForPrompt,
  extractGoalFromPrompt,
} from '../taskLedgerService';

describe('taskLedgerService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getTaskLedger', () => {
    it('returns empty ledger when not found', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: null, error: { message: 'Not found' } }),
          }),
        }),
      });

      const ledger = await getTaskLedger('project-1');
      expect(ledger).toEqual({
        currentGoal: null,
        substeps: [],
        blockers: [],
        lastKnownState: null,
      });
    });

    it('returns ledger data when found', async () => {
      const mockData = {
        current_goal: 'Add dark mode',
        goal_substeps: [{ step: 'Add toggle', done: true }],
        known_blockers: ['CSS issue'],
        last_known_state: 'Toggle added',
      };

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      });

      const ledger = await getTaskLedger('project-1');
      expect(ledger.currentGoal).toBe('Add dark mode');
      expect(ledger.substeps).toHaveLength(1);
      expect(ledger.blockers).toContain('CSS issue');
    });
  });

  describe('updateTaskLedger', () => {
    it('updates ledger fields correctly', async () => {
      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ error: null }),
      });

      mockSupabase.from.mockReturnValue({
        update: updateMock,
      });

      await updateTaskLedger('project-1', {
        currentGoal: 'New goal',
        blockers: ['blocker1'],
      });

      expect(mockSupabase.from).toHaveBeenCalledWith('playcraft_project_memory');
      expect(updateMock).toHaveBeenCalled();
    });
  });

  describe('getNextTurnNumber', () => {
    it('returns 1 when no previous turns', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: null, error: null });

      const turnNumber = await getNextTurnNumber('project-1');
      expect(turnNumber).toBe(1);
    });

    it('returns next turn number', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: 5, error: null });

      const turnNumber = await getNextTurnNumber('project-1');
      expect(turnNumber).toBe(5);
    });
  });

  describe('recordDelta', () => {
    it('records delta and returns id', async () => {
      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: { id: 'delta-123' },
              error: null,
            }),
          }),
        }),
      });

      const id = await recordDelta({
        projectId: 'project-1',
        turnNumber: 1,
        whatTried: 'Added button',
        whatChanged: ['/src/pages/Index.tsx'],
      });

      expect(id).toBe('delta-123');
    });
  });

  describe('getRecentDeltas', () => {
    it('returns empty array when no deltas', async () => {
      mockSupabase.rpc.mockResolvedValue({ data: [], error: null });

      const deltas = await getRecentDeltas('project-1');
      expect(deltas).toEqual([]);
    });

    it('returns mapped delta objects', async () => {
      mockSupabase.rpc.mockResolvedValue({
        data: [
          {
            id: 'delta-1',
            turn_number: 1,
            user_request: 'Add button',
            what_tried: 'Added button component',
            what_changed: ['/src/pages/Index.tsx'],
            created_at: '2024-01-01T00:00:00Z',
          },
        ],
        error: null,
      });

      const deltas = await getRecentDeltas('project-1', 3);
      expect(deltas).toHaveLength(1);
      expect(deltas[0].turnNumber).toBe(1);
      expect(deltas[0].whatTried).toBe('Added button component');
    });
  });

  describe('formatTaskContextForPrompt', () => {
    it('returns empty string for empty context', () => {
      const result = formatTaskContextForPrompt({
        ledger: {
          currentGoal: null,
          substeps: [],
          blockers: [],
          lastKnownState: null,
        },
        recentDeltas: [],
      });
      expect(result).toBe('');
    });

    it('formats goal and substeps correctly', () => {
      const result = formatTaskContextForPrompt({
        ledger: {
          currentGoal: 'Implement dark mode',
          substeps: [
            { step: 'Add context', done: true },
            { step: 'Add toggle', done: false },
          ],
          blockers: [],
          lastKnownState: null,
        },
        recentDeltas: [],
      });

      expect(result).toContain('Current Goal');
      expect(result).toContain('Implement dark mode');
      expect(result).toContain('[x] Add context');
      expect(result).toContain('[ ] Add toggle');
    });

    it('includes blockers', () => {
      const result = formatTaskContextForPrompt({
        ledger: {
          currentGoal: 'Fix bugs',
          substeps: [],
          blockers: ['TypeScript error', 'Missing dependency'],
          lastKnownState: null,
        },
        recentDeltas: [],
      });

      expect(result).toContain('Known Blockers');
      expect(result).toContain('TypeScript error');
      expect(result).toContain('Missing dependency');
    });

    it('includes recent deltas', () => {
      const result = formatTaskContextForPrompt({
        ledger: {
          currentGoal: null,
          substeps: [],
          blockers: [],
          lastKnownState: null,
        },
        recentDeltas: [
          {
            projectId: 'p1',
            turnNumber: 1,
            userRequest: 'Add button',
            whatTried: 'Added Button component',
            whatChanged: ['/src/Button.tsx'],
          },
        ],
      });

      expect(result).toContain('Recent History');
      expect(result).toContain('Turn 1');
      expect(result).toContain('Add button');
    });
  });

  describe('extractGoalFromPrompt', () => {
    it('recognizes new goal patterns', () => {
      const result1 = extractGoalFromPrompt('I want to add a scoring system');
      expect(result1.isNewGoal).toBe(true);

      const result2 = extractGoalFromPrompt("Let's implement multiplayer mode");
      expect(result2.isNewGoal).toBe(true);

      const result3 = extractGoalFromPrompt('Create a new level with obstacles');
      expect(result3.isNewGoal).toBe(true);
    });

    it('returns false for short prompts', () => {
      const result = extractGoalFromPrompt('fix bug');
      expect(result.isNewGoal).toBe(false);
    });

    it('returns goal text when pattern matches', () => {
      const result = extractGoalFromPrompt('Add a power-up system with multiple types');
      expect(result.isNewGoal).toBe(true);
      expect(result.goal).toContain('power-up');
    });
  });
});
