/**
 * AI Timeout Service
 *
 * Handles timeout detection, retries, and fallback for AI code generation.
 * Provides real-time status updates during long-running operations.
 */

import { logger } from './logger';

const COMPONENT = 'aiTimeoutService';

// Timeout thresholds (in ms)
export const TIMEOUT_THRESHOLDS = {
  // Warning threshold - show "taking longer than expected" message
  WARNING: 30_000, // 30 seconds
  // Soft timeout - suggest retry or switch to simpler mode
  SOFT: 60_000, // 1 minute
  // Hard timeout - abort and suggest fallback
  HARD: 120_000, // 2 minutes
  // Maximum wait before complete abort
  MAX: 180_000, // 3 minutes
};

export type TimeoutStage = 'normal' | 'warning' | 'soft_timeout' | 'hard_timeout' | 'aborted';

export interface TimeoutStatus {
  stage: TimeoutStage;
  elapsed: number;
  message: string;
  suggestion?: string;
  canRetry: boolean;
  shouldAbort: boolean;
}

export interface TimeoutCallbacks {
  onWarning?: (status: TimeoutStatus) => void;
  onSoftTimeout?: (status: TimeoutStatus) => void;
  onHardTimeout?: (status: TimeoutStatus) => void;
  onStatusUpdate?: (status: TimeoutStatus) => void;
}

/**
 * Calculate the current timeout stage based on elapsed time
 */
export function getTimeoutStage(elapsedMs: number): TimeoutStage {
  if (elapsedMs >= TIMEOUT_THRESHOLDS.MAX) return 'aborted';
  if (elapsedMs >= TIMEOUT_THRESHOLDS.HARD) return 'hard_timeout';
  if (elapsedMs >= TIMEOUT_THRESHOLDS.SOFT) return 'soft_timeout';
  if (elapsedMs >= TIMEOUT_THRESHOLDS.WARNING) return 'warning';
  return 'normal';
}

/**
 * Get a human-readable status message based on timeout stage
 */
export function getTimeoutMessage(stage: TimeoutStage, elapsedSec: number): TimeoutStatus {
  const elapsed = elapsedSec * 1000;

  switch (stage) {
    case 'normal':
      return {
        stage,
        elapsed,
        message: 'Generating code...',
        canRetry: false,
        shouldAbort: false,
      };

    case 'warning':
      return {
        stage,
        elapsed,
        message: `Taking longer than expected (${elapsedSec}s)...`,
        suggestion: 'Complex requests may take longer. You can wait or try simplifying your request.',
        canRetry: true,
        shouldAbort: false,
      };

    case 'soft_timeout':
      return {
        stage,
        elapsed,
        message: `This is taking a while (${elapsedSec}s)...`,
        suggestion: 'The AI might be processing a complex request. You can retry with a simpler prompt.',
        canRetry: true,
        shouldAbort: false,
      };

    case 'hard_timeout':
      return {
        stage,
        elapsed,
        message: `Request is taking too long (${elapsedSec}s)`,
        suggestion: 'Consider breaking your request into smaller steps or retrying.',
        canRetry: true,
        shouldAbort: true,
      };

    case 'aborted':
      return {
        stage,
        elapsed,
        message: 'Request timed out',
        suggestion: 'The request took too long. Try a simpler request or check your connection.',
        canRetry: true,
        shouldAbort: true,
      };
  }
}

/**
 * Monitor class for tracking AI generation timeout
 */
export class TimeoutMonitor {
  private startTime: number;
  private intervalId: ReturnType<typeof setInterval> | null = null;
  private callbacks: TimeoutCallbacks;
  private lastStage: TimeoutStage = 'normal';
  private abortController: AbortController;

  constructor(callbacks: TimeoutCallbacks = {}) {
    this.startTime = Date.now();
    this.callbacks = callbacks;
    this.abortController = new AbortController();
  }

  /**
   * Start monitoring for timeout
   */
  start(): void {
    this.startTime = Date.now();
    this.lastStage = 'normal';

    // Update every second
    this.intervalId = setInterval(() => {
      this.checkStatus();
    }, 1000);

    logger.debug('Timeout monitor started', { component: COMPONENT });
  }

  /**
   * Stop monitoring
   */
  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    logger.debug('Timeout monitor stopped', {
      component: COMPONENT,
      elapsed: Date.now() - this.startTime,
    });
  }

  /**
   * Get the abort signal for fetch operations
   */
  getSignal(): AbortSignal {
    return this.abortController.signal;
  }

  /**
   * Abort the current operation
   */
  abort(): void {
    this.abortController.abort();
    this.stop();
  }

  /**
   * Check current status and trigger callbacks
   */
  private checkStatus(): void {
    const elapsed = Date.now() - this.startTime;
    const elapsedSec = Math.floor(elapsed / 1000);
    const currentStage = getTimeoutStage(elapsed);
    const status = getTimeoutMessage(currentStage, elapsedSec);

    // Always call status update
    this.callbacks.onStatusUpdate?.(status);

    // Call stage-specific callbacks when stage changes
    if (currentStage !== this.lastStage) {
      this.lastStage = currentStage;

      switch (currentStage) {
        case 'warning':
          this.callbacks.onWarning?.(status);
          break;
        case 'soft_timeout':
          this.callbacks.onSoftTimeout?.(status);
          break;
        case 'hard_timeout':
          this.callbacks.onHardTimeout?.(status);
          break;
        case 'aborted':
          this.abort();
          break;
      }
    }
  }

  /**
   * Get current elapsed time in ms
   */
  getElapsed(): number {
    return Date.now() - this.startTime;
  }

  /**
   * Get current status
   */
  getStatus(): TimeoutStatus {
    const elapsed = Date.now() - this.startTime;
    const elapsedSec = Math.floor(elapsed / 1000);
    const stage = getTimeoutStage(elapsed);
    return getTimeoutMessage(stage, elapsedSec);
  }
}

/**
 * Wrap a promise with timeout handling
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number = TIMEOUT_THRESHOLDS.HARD,
  errorMessage: string = 'Operation timed out'
): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);

    promise
      .then((result) => {
        clearTimeout(timer);
        resolve(result);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

/**
 * Retry with exponential backoff
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: {
    maxRetries?: number;
    baseDelay?: number;
    maxDelay?: number;
    onRetry?: (attempt: number, error: Error) => void;
  } = {}
): Promise<T> {
  const { maxRetries = 3, baseDelay = 1000, maxDelay = 10000, onRetry } = options;

  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err));

      if (attempt === maxRetries) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = Math.min(baseDelay * Math.pow(2, attempt), maxDelay);

      logger.warn('Retry attempt', {
        component: COMPONENT,
        attempt: attempt + 1,
        maxRetries,
        delay,
        error: lastError.message,
      });

      onRetry?.(attempt + 1, lastError);

      await new Promise((resolve) => setTimeout(resolve, delay));
    }
  }

  throw lastError;
}

/**
 * Format elapsed time for display
 */
export function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);
  if (seconds < 1) return '';
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}
