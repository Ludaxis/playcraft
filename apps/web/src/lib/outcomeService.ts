/**
 * Outcome Service
 * Tracks generation outcomes for learning and analytics
 */

import { getSupabase } from './supabase';

export interface GenerationOutcomeInput {
  projectId?: string;
  jobId?: string;
  prompt: string;
  intentType?: string;
  contextMode?: string;
  responseMode?: 'edit' | 'file';
  filesChanged?: string[];
  tokensUsed?: number;
  durationMs?: number;
  hadTsErrors?: boolean;
  hadEslintErrors?: boolean;
  hadRuntimeErrors?: boolean;
  errorCount?: number;
  warningCount?: number;
  autoFixAttempts?: number;
  autoFixSucceeded?: boolean;
  // Selection quality metrics
  filesSelectedForContext?: string[];
  filesActuallyModified?: string[];
  selectionAccuracy?: number;
  missedFiles?: string[];
}

export interface OutcomeFeedback {
  wasAccepted?: boolean;
  wasReverted?: boolean;
  userEditedAfter?: boolean;
  userCorrections?: string[];
}

export interface GenerationOutcome extends GenerationOutcomeInput {
  id: string;
  userId: string;
  wasAccepted?: boolean;
  wasReverted: boolean;
  userEditedAfter: boolean;
  userCorrections?: string[];
  createdAt: string;
  feedbackAt?: string;
}

export interface OutcomeStats {
  totalGenerations: number;
  successfulGenerations: number;
  autoFixedCount: number;
  userAcceptedCount: number;
  userRevertedCount: number;
  avgDurationMs: number;
  errorRate: number;
}

export interface ErrorPattern {
  intentType: string;
  errorCount: number;
  successCount: number;
  autoFixRate: number;
}

/**
 * Record a new generation outcome
 */
export async function recordGenerationOutcome(input: GenerationOutcomeInput): Promise<string | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    console.warn('[outcomeService] No user logged in, skipping outcome recording');
    return null;
  }

  const outcomeData = {
    user_id: user.id,
    project_id: input.projectId || null,
    job_id: input.jobId || null,
    prompt: input.prompt,
    intent_type: input.intentType || null,
    context_mode: input.contextMode || null,
    response_mode: input.responseMode || null,
    files_changed: input.filesChanged || [],
    tokens_used: input.tokensUsed || null,
    duration_ms: input.durationMs || null,
    had_ts_errors: input.hadTsErrors ?? false,
    had_eslint_errors: input.hadEslintErrors ?? false,
    had_runtime_errors: input.hadRuntimeErrors ?? false,
    error_count: input.errorCount ?? 0,
    warning_count: input.warningCount ?? 0,
    auto_fix_attempts: input.autoFixAttempts ?? 0,
    auto_fix_succeeded: input.autoFixSucceeded ?? null,
    // Selection quality metrics
    files_selected_for_context: input.filesSelectedForContext || [],
    files_actually_modified: input.filesActuallyModified || [],
    selection_accuracy: input.selectionAccuracy ?? null,
    missed_files: input.missedFiles || [],
  };

  const { data, error } = await supabase
    .from('playcraft_generation_outcomes')
    .insert(outcomeData)
    .select('id')
    .single();

  if (error) {
    console.error('[outcomeService] Failed to record outcome:', error);
    return null;
  }

  return data?.id || null;
}

/**
 * Update outcome with user feedback
 */
export async function updateOutcomeFeedback(
  outcomeId: string,
  feedback: OutcomeFeedback
): Promise<void> {
  const supabase = getSupabase();

  const updateData: Record<string, unknown> = {
    feedback_at: new Date().toISOString(),
  };

  if (feedback.wasAccepted !== undefined) {
    updateData.was_accepted = feedback.wasAccepted;
  }
  if (feedback.wasReverted !== undefined) {
    updateData.was_reverted = feedback.wasReverted;
  }
  if (feedback.userEditedAfter !== undefined) {
    updateData.user_edited_after = feedback.userEditedAfter;
  }
  if (feedback.userCorrections !== undefined) {
    updateData.user_corrections = feedback.userCorrections;
  }

  const { error } = await supabase
    .from('playcraft_generation_outcomes')
    .update(updateData)
    .eq('id', outcomeId);

  if (error) {
    console.error('[outcomeService] Failed to update feedback:', error);
  }
}

/**
 * Get outcomes for a project
 */
export async function getProjectOutcomes(
  projectId: string,
  limit = 50
): Promise<GenerationOutcome[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_generation_outcomes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('[outcomeService] Failed to fetch project outcomes:', error);
    return [];
  }

  return (data || []).map(mapOutcomeFromDb);
}

/**
 * Get outcome statistics for the current user
 */
export async function getOutcomeStats(): Promise<OutcomeStats | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  const { data, error } = await supabase
    .rpc('get_outcome_stats', { p_user_id: user.id });

  if (error) {
    console.error('[outcomeService] Failed to fetch stats:', error);
    return null;
  }

  if (!data || data.length === 0) {
    return {
      totalGenerations: 0,
      successfulGenerations: 0,
      autoFixedCount: 0,
      userAcceptedCount: 0,
      userRevertedCount: 0,
      avgDurationMs: 0,
      errorRate: 0,
    };
  }

  const row = data[0];
  return {
    totalGenerations: Number(row.total_generations) || 0,
    successfulGenerations: Number(row.successful_generations) || 0,
    autoFixedCount: Number(row.auto_fixed_count) || 0,
    userAcceptedCount: Number(row.user_accepted_count) || 0,
    userRevertedCount: Number(row.user_reverted_count) || 0,
    avgDurationMs: Number(row.avg_duration_ms) || 0,
    errorRate: Number(row.error_rate) || 0,
  };
}

/**
 * Get error patterns for analysis
 */
export async function getErrorPatterns(limit = 20): Promise<ErrorPattern[]> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  const { data, error } = await supabase
    .rpc('get_error_patterns', { p_user_id: user.id, p_limit: limit });

  if (error) {
    console.error('[outcomeService] Failed to fetch error patterns:', error);
    return [];
  }

  return (data || []).map((row: Record<string, unknown>) => ({
    intentType: String(row.intent_type || ''),
    errorCount: Number(row.error_count) || 0,
    successCount: Number(row.success_count) || 0,
    autoFixRate: Number(row.auto_fix_rate) || 0,
  }));
}

/**
 * Get the most recent outcome for a project (for feedback tracking)
 */
export async function getLatestOutcome(projectId: string): Promise<GenerationOutcome | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_generation_outcomes')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return mapOutcomeFromDb(data);
}

/**
 * Map database row to GenerationOutcome
 */
function mapOutcomeFromDb(row: Record<string, unknown>): GenerationOutcome {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    projectId: row.project_id ? String(row.project_id) : undefined,
    jobId: row.job_id ? String(row.job_id) : undefined,
    prompt: String(row.prompt || ''),
    intentType: row.intent_type ? String(row.intent_type) : undefined,
    contextMode: row.context_mode ? String(row.context_mode) : undefined,
    responseMode: row.response_mode as 'edit' | 'file' | undefined,
    filesChanged: Array.isArray(row.files_changed) ? row.files_changed as string[] : [],
    tokensUsed: row.tokens_used ? Number(row.tokens_used) : undefined,
    durationMs: row.duration_ms ? Number(row.duration_ms) : undefined,
    hadTsErrors: Boolean(row.had_ts_errors),
    hadEslintErrors: Boolean(row.had_eslint_errors),
    hadRuntimeErrors: Boolean(row.had_runtime_errors),
    errorCount: Number(row.error_count) || 0,
    warningCount: Number(row.warning_count) || 0,
    autoFixAttempts: Number(row.auto_fix_attempts) || 0,
    autoFixSucceeded: row.auto_fix_succeeded === null ? undefined : Boolean(row.auto_fix_succeeded),
    wasAccepted: row.was_accepted === null ? undefined : Boolean(row.was_accepted),
    wasReverted: Boolean(row.was_reverted),
    userEditedAfter: Boolean(row.user_edited_after),
    userCorrections: Array.isArray(row.user_corrections) ? row.user_corrections as string[] : undefined,
    createdAt: String(row.created_at),
    feedbackAt: row.feedback_at ? String(row.feedback_at) : undefined,
  };
}
