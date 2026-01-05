/**
 * useGenerationJob Hook
 *
 * React hook for managing async AI generation jobs.
 * Provides job submission, real-time status updates, and cancellation.
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  submitGenerationJob,
  subscribeToJobWithFallback,
  getJobStatus,
  cancelJob,
  isTerminalStatus,
  type GenerationJob,
  type SubmitJobParams,
  type GenerationResult,
} from '../lib/generationQueueService';
import { logger } from '../lib/logger';

export interface UseGenerationJobOptions {
  /** Callback when job completes successfully */
  onComplete?: (result: GenerationResult) => void;
  /** Callback when job fails */
  onError?: (error: string) => void;
  /** Callback for progress updates */
  onProgress?: (progress: number, message: string | null) => void;
  /** Auto-cleanup completed jobs after this many ms (default: 5000) */
  autoCleanupDelay?: number;
}

export interface UseGenerationJobReturn {
  /** Current job being tracked (null if none) */
  job: GenerationJob | null;
  /** Whether a job submission is in progress */
  isSubmitting: boolean;
  /** Whether a job is currently being processed */
  isProcessing: boolean;
  /** Whether the current job completed successfully */
  isComplete: boolean;
  /** Whether the current job failed */
  isFailed: boolean;
  /** Current progress (0-100) */
  progress: number;
  /** Current status message */
  statusMessage: string | null;
  /** Error message if failed */
  errorMessage: string | null;
  /** Generation result if completed */
  result: GenerationResult | null;
  /** Submit a new generation job */
  submit: (params: SubmitJobParams) => Promise<string>;
  /** Cancel the current job (if queued) */
  cancel: () => Promise<void>;
  /** Reset/clear the current job state */
  reset: () => void;
}

export function useGenerationJob(options: UseGenerationJobOptions = {}): UseGenerationJobReturn {
  const {
    onComplete,
    onError,
    onProgress,
    autoCleanupDelay = 5000,
  } = options;

  const [job, setJob] = useState<GenerationJob | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Store cleanup function for subscription
  const cleanupRef = useRef<(() => void) | null>(null);

  // Derived state
  const isProcessing = job?.status === 'queued' || job?.status === 'processing';
  const isComplete = job?.status === 'completed';
  const isFailed = job?.status === 'failed';
  const progress = job?.progress ?? 0;
  const statusMessage = job?.status_message ?? null;
  const errorMessage = job?.error_message ?? null;
  const result = job?.result ?? null;

  // Cleanup subscription on unmount or when job changes to terminal state
  useEffect(() => {
    return () => {
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    };
  }, []);

  // Handle job completion/failure callbacks
  useEffect(() => {
    if (!job) return;

    if (job.status === 'completed' && job.result) {
      logger.info('Generation job completed', {
        component: 'useGenerationJob',
        jobId: job.id,
        filesCount: Object.keys(job.result.files || {}).length,
      });
      onComplete?.(job.result);

      // Cleanup subscription
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    } else if (job.status === 'failed') {
      logger.warn('Generation job failed', {
        component: 'useGenerationJob',
        jobId: job.id,
        error: job.error_message,
      });
      onError?.(job.error_message || 'Generation failed');

      // Cleanup subscription
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    } else if (job.status === 'cancelled') {
      // Cleanup subscription
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }
    }
  }, [job?.status, job?.result, job?.error_message, onComplete, onError]);

  // Handle progress updates
  useEffect(() => {
    if (job && onProgress) {
      onProgress(job.progress, job.status_message);
    }
  }, [job?.progress, job?.status_message, onProgress]);

  // Auto-cleanup after completion/failure
  useEffect(() => {
    if (!job || !isTerminalStatus(job.status) || autoCleanupDelay <= 0) return;

    const timer = setTimeout(() => {
      // Don't auto-reset, just note it's available for reset
      logger.debug('Job available for cleanup', {
        component: 'useGenerationJob',
        jobId: job.id,
      });
    }, autoCleanupDelay);

    return () => clearTimeout(timer);
  }, [job?.status, autoCleanupDelay]);

  // Submit a new job
  const submit = useCallback(async (params: SubmitJobParams): Promise<string> => {
    // Cleanup any existing subscription
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setIsSubmitting(true);
    setJob(null);

    try {
      logger.info('Submitting generation job', {
        component: 'useGenerationJob',
        action: params.action,
      });

      const { jobId } = await submitGenerationJob(params);

      // Get initial job status
      const initialJob = await getJobStatus(jobId);
      if (initialJob) {
        setJob(initialJob);
      }

      // Subscribe to updates
      const { cleanup } = subscribeToJobWithFallback(
        jobId,
        (updatedJob) => {
          setJob(updatedJob);
        },
        (error) => {
          logger.warn('Subscription error, using polling', {
            component: 'useGenerationJob',
            error: error.message,
          });
        }
      );

      cleanupRef.current = cleanup;

      logger.info('Job submitted successfully', {
        component: 'useGenerationJob',
        jobId,
      });

      return jobId;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  // Cancel the current job
  const cancel = useCallback(async (): Promise<void> => {
    if (!job || job.status !== 'queued') {
      logger.warn('Cannot cancel job', {
        component: 'useGenerationJob',
        jobId: job?.id,
        status: job?.status,
      });
      return;
    }

    try {
      await cancelJob(job.id);
      setJob((prev) => prev ? { ...prev, status: 'cancelled' } : null);

      // Cleanup subscription
      if (cleanupRef.current) {
        cleanupRef.current();
        cleanupRef.current = null;
      }

      logger.info('Job cancelled', {
        component: 'useGenerationJob',
        jobId: job.id,
      });
    } catch (error) {
      logger.error('Failed to cancel job', {
        component: 'useGenerationJob',
        jobId: job.id,
        error: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    }
  }, [job?.id, job?.status]);

  // Reset state
  const reset = useCallback((): void => {
    // Cleanup subscription
    if (cleanupRef.current) {
      cleanupRef.current();
      cleanupRef.current = null;
    }

    setJob(null);
    setIsSubmitting(false);
  }, []);

  return {
    job,
    isSubmitting,
    isProcessing,
    isComplete,
    isFailed,
    progress,
    statusMessage,
    errorMessage,
    result,
    submit,
    cancel,
    reset,
  };
}

export default useGenerationJob;
