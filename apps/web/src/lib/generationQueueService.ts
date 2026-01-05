/**
 * Generation Queue Service
 *
 * Handles async AI generation jobs with real-time status updates.
 * Jobs are queued in the database and processed by worker functions.
 */

import { getSupabase } from './supabase';
import { logger } from './logger';
import type { RealtimeChannel } from '@supabase/supabase-js';

// =============================================================================
// Types
// =============================================================================

export type JobStatus = 'queued' | 'processing' | 'completed' | 'failed' | 'cancelled';
export type JobAction = 'create' | 'modify' | 'fix_error';

export interface GenerationJob {
  id: string;
  user_id: string;
  project_id: string | null;
  prompt: string;
  action: JobAction;
  context: Record<string, unknown>;
  status: JobStatus;
  progress: number;
  status_message: string | null;
  result: GenerationResult | null;
  error_message: string | null;
  attempts: number;
  max_attempts: number;
  created_at: string;
  started_at: string | null;
  completed_at: string | null;
  model_used: string | null;
  tokens_used: number | null;
  duration_ms: number | null;
}

export interface GenerationResult {
  files: Record<string, string>;
  message: string;
  changes?: string[];
}

export interface SubmitJobParams {
  projectId?: string;
  prompt: string;
  action: JobAction;
  context?: Record<string, unknown>;
}

// =============================================================================
// Constants
// =============================================================================

const MAX_ACTIVE_JOBS_PER_USER = 3;
const POLL_INTERVAL_MS = 5000; // Fallback polling interval

// =============================================================================
// Job Submission
// =============================================================================

/**
 * Submit a new generation job to the queue.
 * Returns immediately with the job ID - use subscribeToJob for updates.
 */
export async function submitGenerationJob(params: SubmitJobParams): Promise<{ jobId: string }> {
  const supabase = getSupabase();

  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    throw new Error('Not authenticated');
  }

  // Check active jobs limit
  const activeCount = await getActiveJobsCount();
  if (activeCount >= MAX_ACTIVE_JOBS_PER_USER) {
    throw new Error(`Maximum ${MAX_ACTIVE_JOBS_PER_USER} concurrent jobs allowed. Please wait for current jobs to complete.`);
  }

  // Insert job
  const { data, error } = await supabase
    .from('playcraft_generation_jobs')
    .insert({
      user_id: user.id,
      project_id: params.projectId || null,
      prompt: params.prompt,
      action: params.action,
      context: params.context || {},
    })
    .select('id')
    .single();

  if (error) {
    logger.error('Failed to submit generation job', error, {
      component: 'generationQueueService',
      action: 'submitGenerationJob',
    });
    throw new Error(`Failed to submit job: ${error.message}`);
  }

  logger.info('Generation job submitted', {
    component: 'generationQueueService',
    action: 'submitGenerationJob',
    jobId: data.id,
    jobAction: params.action,
  });

  return { jobId: data.id };
}

// =============================================================================
// Real-time Subscription
// =============================================================================

/**
 * Subscribe to job status updates via Supabase Realtime.
 * Returns the channel - call channel.unsubscribe() when done.
 */
export function subscribeToJob(
  jobId: string,
  onUpdate: (job: GenerationJob) => void,
  onError?: (error: Error) => void
): RealtimeChannel {
  const supabase = getSupabase();

  const channel = supabase
    .channel(`job:${jobId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'playcraft_generation_jobs',
        filter: `id=eq.${jobId}`,
      },
      (payload) => {
        logger.debug('Job update received', {
          component: 'generationQueueService',
          jobId,
          status: (payload.new as GenerationJob).status,
        });
        onUpdate(payload.new as GenerationJob);
      }
    )
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        logger.debug('Subscribed to job updates', {
          component: 'generationQueueService',
          jobId,
        });
      } else if (status === 'CHANNEL_ERROR') {
        logger.warn('Job subscription error', {
          component: 'generationQueueService',
          jobId,
        });
        onError?.(new Error('Failed to subscribe to job updates'));
      }
    });

  return channel;
}

/**
 * Subscribe with automatic polling fallback if Realtime fails.
 */
export function subscribeToJobWithFallback(
  jobId: string,
  onUpdate: (job: GenerationJob) => void,
  onError?: (error: Error) => void
): { channel: RealtimeChannel; cleanup: () => void } {
  let pollInterval: ReturnType<typeof setInterval> | null = null;

  const channel = subscribeToJob(
    jobId,
    onUpdate,
    (error) => {
      // Start polling as fallback
      logger.warn('Falling back to polling for job updates', {
        component: 'generationQueueService',
        jobId,
      });
      startPolling();
      onError?.(error);
    }
  );

  const startPolling = () => {
    if (pollInterval) return;

    pollInterval = setInterval(async () => {
      try {
        const job = await getJobStatus(jobId);
        if (job) {
          onUpdate(job);
          // Stop polling if job is terminal
          if (['completed', 'failed', 'cancelled'].includes(job.status)) {
            cleanup();
          }
        }
      } catch (err) {
        logger.warn('Poll error', {
          component: 'generationQueueService',
          jobId,
          error: err instanceof Error ? err.message : 'Unknown error',
        });
      }
    }, POLL_INTERVAL_MS);
  };

  const cleanup = () => {
    if (pollInterval) {
      clearInterval(pollInterval);
      pollInterval = null;
    }
    channel.unsubscribe();
  };

  return { channel, cleanup };
}

// =============================================================================
// Job Status
// =============================================================================

/**
 * Get current status of a job (for polling fallback).
 */
export async function getJobStatus(jobId: string): Promise<GenerationJob | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_generation_jobs')
    .select('*')
    .eq('id', jobId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    logger.error('Failed to get job status', error, {
      component: 'generationQueueService',
      action: 'getJobStatus',
      jobId,
    });
    throw new Error(`Failed to get job status: ${error.message}`);
  }

  return data as GenerationJob;
}

/**
 * Get number of active (queued/processing) jobs for current user.
 */
export async function getActiveJobsCount(): Promise<number> {
  const supabase = getSupabase();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;

  const { data, error } = await supabase.rpc('get_user_active_jobs_count', {
    p_user_id: user.id,
  });

  if (error) {
    logger.warn('Failed to get active jobs count', {
      component: 'generationQueueService',
      error: error.message,
    });
    return 0;
  }

  return data || 0;
}

/**
 * Get recent jobs for current user.
 */
export async function getRecentJobs(limit: number = 10): Promise<GenerationJob[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_generation_jobs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    logger.error('Failed to get recent jobs', error, {
      component: 'generationQueueService',
      action: 'getRecentJobs',
    });
    throw new Error(`Failed to get recent jobs: ${error.message}`);
  }

  return (data || []) as GenerationJob[];
}

// =============================================================================
// Job Control
// =============================================================================

/**
 * Cancel a queued job. Only works for jobs still in 'queued' status.
 */
export async function cancelJob(jobId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_generation_jobs')
    .update({ status: 'cancelled' })
    .eq('id', jobId)
    .eq('status', 'queued'); // RLS policy enforces this, but belt-and-suspenders

  if (error) {
    logger.error('Failed to cancel job', error, {
      component: 'generationQueueService',
      action: 'cancelJob',
      jobId,
    });
    throw new Error(`Failed to cancel job: ${error.message}`);
  }

  logger.info('Job cancelled', {
    component: 'generationQueueService',
    action: 'cancelJob',
    jobId,
  });
}

// =============================================================================
// Utilities
// =============================================================================

/**
 * Wait for a job to complete (or fail/cancel).
 * Useful for simpler async/await usage without manual subscription management.
 */
export function waitForJobCompletion(
  jobId: string,
  onProgress?: (job: GenerationJob) => void,
  timeoutMs: number = 120000 // 2 minute default timeout
): Promise<GenerationJob> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      cleanup();
      reject(new Error('Job timed out waiting for completion'));
    }, timeoutMs);

    const { cleanup } = subscribeToJobWithFallback(
      jobId,
      (job) => {
        onProgress?.(job);

        if (job.status === 'completed') {
          clearTimeout(timeout);
          cleanup();
          resolve(job);
        } else if (job.status === 'failed') {
          clearTimeout(timeout);
          cleanup();
          reject(new Error(job.error_message || 'Job failed'));
        } else if (job.status === 'cancelled') {
          clearTimeout(timeout);
          cleanup();
          reject(new Error('Job was cancelled'));
        }
      },
      (error) => {
        // Continue with polling, don't reject yet
        logger.warn('Realtime subscription error, using polling', {
          component: 'generationQueueService',
          jobId,
          error: error.message,
        });
      }
    );
  });
}

/**
 * Check if a job status is terminal (no more updates expected).
 */
export function isTerminalStatus(status: JobStatus): boolean {
  return ['completed', 'failed', 'cancelled'].includes(status);
}

/**
 * Format job duration for display.
 */
export function formatJobDuration(durationMs: number | null): string {
  if (!durationMs) return 'N/A';
  if (durationMs < 1000) return `${durationMs}ms`;
  return `${(durationMs / 1000).toFixed(1)}s`;
}
