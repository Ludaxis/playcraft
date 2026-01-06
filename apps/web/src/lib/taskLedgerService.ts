/**
 * Task Ledger Service for PlayCraft
 *
 * Manages persistent task tracking across conversation turns:
 * - Current goal and substeps
 * - Known blockers
 * - Delta log (what was tried, changed, next)
 *
 * This enables the AI to maintain focus across multi-turn conversations
 * and provides context about recent changes.
 */

import { getSupabase } from './supabase';

// ============================================
// Types
// ============================================

export interface TaskSubstep {
  step: string;
  done: boolean;
}

export interface TaskLedger {
  currentGoal: string | null;
  substeps: TaskSubstep[];
  blockers: string[];
  lastKnownState: string | null;
}

export interface TaskDelta {
  id?: string;
  projectId: string;
  sessionId?: string;
  turnNumber: number;
  userRequest?: string;
  whatTried?: string;
  whatChanged?: string[];
  whatSucceeded?: string;
  whatFailed?: string;
  whatNext?: string;
  tokensUsed?: number;
  durationMs?: number;
  createdAt?: string;
}

export interface TaskContext {
  ledger: TaskLedger;
  recentDeltas: TaskDelta[];
}

// ============================================
// Task Ledger Operations
// ============================================

/**
 * Get the current task ledger for a project
 */
export async function getTaskLedger(projectId: string): Promise<TaskLedger> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_memory')
    .select('current_goal, goal_substeps, known_blockers, last_known_state')
    .eq('project_id', projectId)
    .single();

  if (error || !data) {
    // Return empty ledger if not found
    return {
      currentGoal: null,
      substeps: [],
      blockers: [],
      lastKnownState: null,
    };
  }

  return {
    currentGoal: data.current_goal,
    substeps: (data.goal_substeps as TaskSubstep[]) || [],
    blockers: (data.known_blockers as string[]) || [],
    lastKnownState: data.last_known_state,
  };
}

/**
 * Update the task ledger for a project
 */
export async function updateTaskLedger(
  projectId: string,
  updates: Partial<TaskLedger>
): Promise<void> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (updates.currentGoal !== undefined) {
    updateData.current_goal = updates.currentGoal;
  }
  if (updates.substeps !== undefined) {
    updateData.goal_substeps = updates.substeps;
  }
  if (updates.blockers !== undefined) {
    updateData.known_blockers = updates.blockers;
  }
  if (updates.lastKnownState !== undefined) {
    updateData.last_known_state = updates.lastKnownState;
  }

  const { error } = await supabase
    .from('playcraft_project_memory')
    .update(updateData)
    .eq('project_id', projectId);

  if (error) {
    console.error('[TaskLedger] Failed to update ledger:', error);
    throw error;
  }
}

/**
 * Set a new goal (clears previous substeps and state)
 */
export async function setNewGoal(
  projectId: string,
  goal: string,
  substeps?: TaskSubstep[]
): Promise<void> {
  await updateTaskLedger(projectId, {
    currentGoal: goal,
    substeps: substeps || [],
    lastKnownState: null,
    // Keep blockers - they might still be relevant
  });

  console.log(`[TaskLedger] Set new goal: "${goal.substring(0, 50)}..."`);
}

/**
 * Mark a substep as done
 */
export async function markSubstepDone(
  projectId: string,
  stepIndex: number
): Promise<void> {
  const ledger = await getTaskLedger(projectId);

  if (stepIndex >= 0 && stepIndex < ledger.substeps.length) {
    ledger.substeps[stepIndex].done = true;

    await updateTaskLedger(projectId, {
      substeps: ledger.substeps,
    });

    console.log(`[TaskLedger] Marked substep ${stepIndex + 1} as done`);
  }
}

/**
 * Add a blocker
 */
export async function addBlocker(
  projectId: string,
  blocker: string
): Promise<void> {
  const ledger = await getTaskLedger(projectId);

  if (!ledger.blockers.includes(blocker)) {
    ledger.blockers.push(blocker);

    await updateTaskLedger(projectId, {
      blockers: ledger.blockers,
    });

    console.log(`[TaskLedger] Added blocker: "${blocker}"`);
  }
}

/**
 * Remove a blocker
 */
export async function removeBlocker(
  projectId: string,
  blocker: string
): Promise<void> {
  const ledger = await getTaskLedger(projectId);

  const index = ledger.blockers.indexOf(blocker);
  if (index > -1) {
    ledger.blockers.splice(index, 1);

    await updateTaskLedger(projectId, {
      blockers: ledger.blockers,
    });

    console.log(`[TaskLedger] Removed blocker: "${blocker}"`);
  }
}

/**
 * Clear all blockers
 */
export async function clearBlockers(projectId: string): Promise<void> {
  await updateTaskLedger(projectId, {
    blockers: [],
  });
}

/**
 * Complete the current goal
 */
export async function completeGoal(projectId: string): Promise<void> {
  await updateTaskLedger(projectId, {
    currentGoal: null,
    substeps: [],
    lastKnownState: null,
    blockers: [],
  });

  console.log('[TaskLedger] Goal completed and cleared');
}

// ============================================
// Task Delta Operations
// ============================================

/**
 * Get the next turn number for a project
 */
export async function getNextTurnNumber(projectId: string): Promise<number> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .rpc('get_next_turn_number', { p_project_id: projectId });

  if (error) {
    console.warn('[TaskLedger] Failed to get turn number, defaulting to 1:', error);
    return 1;
  }

  return data || 1;
}

/**
 * Record a new task delta (what happened in this turn)
 */
export async function recordDelta(delta: Omit<TaskDelta, 'id' | 'createdAt'>): Promise<string> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_task_deltas')
    .insert({
      project_id: delta.projectId,
      session_id: delta.sessionId,
      turn_number: delta.turnNumber,
      user_request: delta.userRequest,
      what_tried: delta.whatTried,
      what_changed: delta.whatChanged,
      what_succeeded: delta.whatSucceeded,
      what_failed: delta.whatFailed,
      what_next: delta.whatNext,
      tokens_used: delta.tokensUsed,
      duration_ms: delta.durationMs,
    })
    .select('id')
    .single();

  if (error) {
    console.error('[TaskLedger] Failed to record delta:', error);
    throw error;
  }

  console.log(`[TaskLedger] Recorded delta for turn ${delta.turnNumber}`);
  return data.id;
}

/**
 * Get recent deltas for a project
 */
export async function getRecentDeltas(
  projectId: string,
  limit: number = 3
): Promise<TaskDelta[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .rpc('get_recent_deltas', {
      p_project_id: projectId,
      p_limit: limit,
    });

  if (error) {
    console.warn('[TaskLedger] Failed to get recent deltas:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    id: row.id as string,
    projectId,
    turnNumber: row.turn_number as number,
    userRequest: row.user_request as string | undefined,
    whatTried: row.what_tried as string | undefined,
    whatChanged: row.what_changed as string[] | undefined,
    whatSucceeded: row.what_succeeded as string | undefined,
    whatFailed: row.what_failed as string | undefined,
    whatNext: row.what_next as string | undefined,
    createdAt: row.created_at as string,
  }));
}

/**
 * Get the latest delta for a project
 */
export async function getLatestDelta(projectId: string): Promise<TaskDelta | null> {
  const deltas = await getRecentDeltas(projectId, 1);
  return deltas.length > 0 ? deltas[0] : null;
}

// ============================================
// Combined Context Operations
// ============================================

/**
 * Get full task context (ledger + recent deltas)
 * Used when building AI prompt context
 */
export async function getTaskContext(
  projectId: string,
  deltaLimit: number = 3
): Promise<TaskContext> {
  const [ledger, recentDeltas] = await Promise.all([
    getTaskLedger(projectId),
    getRecentDeltas(projectId, deltaLimit),
  ]);

  return { ledger, recentDeltas };
}

/**
 * Format task context for prompt injection
 * Returns a string suitable for including in AI context
 */
export function formatTaskContextForPrompt(context: TaskContext): string {
  const parts: string[] = [];

  // Current goal
  if (context.ledger.currentGoal) {
    parts.push(`## Current Goal\n${context.ledger.currentGoal}`);

    // Substeps
    if (context.ledger.substeps.length > 0) {
      const substepsList = context.ledger.substeps
        .map((s, i) => `${i + 1}. [${s.done ? 'x' : ' '}] ${s.step}`)
        .join('\n');
      parts.push(`### Progress\n${substepsList}`);
    }
  }

  // Known blockers
  if (context.ledger.blockers.length > 0) {
    const blockersList = context.ledger.blockers
      .map(b => `- ${b}`)
      .join('\n');
    parts.push(`### Known Blockers\n${blockersList}`);
  }

  // Last known state
  if (context.ledger.lastKnownState) {
    parts.push(`### Current State\n${context.ledger.lastKnownState}`);
  }

  // Recent deltas (most recent first, but reversed for reading order)
  if (context.recentDeltas.length > 0) {
    const deltasList = context.recentDeltas
      .reverse() // Show oldest first for reading order
      .map(d => {
        const deltaLines: string[] = [];
        if (d.userRequest) deltaLines.push(`Request: ${d.userRequest}`);
        if (d.whatTried) deltaLines.push(`Tried: ${d.whatTried}`);
        if (d.whatChanged && d.whatChanged.length > 0) {
          deltaLines.push(`Changed: ${d.whatChanged.join(', ')}`);
        }
        if (d.whatSucceeded) deltaLines.push(`Succeeded: ${d.whatSucceeded}`);
        if (d.whatFailed) deltaLines.push(`Failed: ${d.whatFailed}`);
        if (d.whatNext) deltaLines.push(`Next: ${d.whatNext}`);
        return `Turn ${d.turnNumber}:\n${deltaLines.map(l => `  ${l}`).join('\n')}`;
      })
      .join('\n\n');
    parts.push(`## Recent History\n${deltasList}`);
  }

  return parts.join('\n\n');
}

/**
 * Quick helper to record a turn and update ledger state
 */
export async function recordTurnComplete(
  projectId: string,
  options: {
    sessionId?: string;
    userRequest: string;
    whatTried: string;
    whatChanged: string[];
    whatSucceeded?: string;
    whatFailed?: string;
    whatNext?: string;
    newState?: string;
    tokensUsed?: number;
    durationMs?: number;
  }
): Promise<void> {
  const turnNumber = await getNextTurnNumber(projectId);

  // Record the delta
  await recordDelta({
    projectId,
    sessionId: options.sessionId,
    turnNumber,
    userRequest: options.userRequest,
    whatTried: options.whatTried,
    whatChanged: options.whatChanged,
    whatSucceeded: options.whatSucceeded,
    whatFailed: options.whatFailed,
    whatNext: options.whatNext,
    tokensUsed: options.tokensUsed,
    durationMs: options.durationMs,
  });

  // Update last known state if provided
  if (options.newState) {
    await updateTaskLedger(projectId, {
      lastKnownState: options.newState,
    });
  }
}

/**
 * Extract goal from user prompt (simple heuristic)
 * Used to auto-detect when a new goal is being set
 */
export function extractGoalFromPrompt(prompt: string): {
  isNewGoal: boolean;
  goal?: string;
} {
  // Patterns that suggest a new high-level goal
  const goalPatterns = [
    /^(?:i want to|let's|please|can you|help me)\s+(.+)/i,
    /^(?:add|create|build|implement|make)\s+(.+)/i,
    /^(?:fix|update|change|modify)\s+(.+)/i,
  ];

  // Short requests are likely tweaks, not new goals
  if (prompt.length < 20) {
    return { isNewGoal: false };
  }

  for (const pattern of goalPatterns) {
    const match = prompt.match(pattern);
    if (match) {
      return {
        isNewGoal: true,
        goal: prompt.substring(0, 100), // Truncate for storage
      };
    }
  }

  return { isNewGoal: false };
}
