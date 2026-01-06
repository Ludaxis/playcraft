/**
 * usePreviewErrors Hook
 * Listens for runtime errors from the preview iframe via postMessage
 */

import { useEffect, useCallback, useRef, useReducer } from 'react';
import type { PreviewError } from '../lib/codeValidator';

export type { PreviewError } from '../lib/codeValidator';

interface UsePreviewErrorsOptions {
  /** Maximum number of errors to keep in history */
  maxErrors?: number;
  /** Called when a new error is received */
  onError?: (error: PreviewError) => void;
  /** Whether to log errors to console */
  logToConsole?: boolean;
}

interface UsePreviewErrorsReturn {
  /** Recent errors from the preview */
  errors: PreviewError[];
  /** Clear all errors */
  clearErrors: () => void;
  /** Check if there are any errors */
  hasErrors: boolean;
  /** Get only actual errors (not warnings) */
  errorCount: number;
  /** Get only warnings */
  warningCount: number;
}

/**
 * Hook to listen for runtime errors from the preview iframe
 *
 * The preview iframe sends errors via postMessage using the errorBridge script.
 * This hook receives those messages and maintains an error history.
 */
export function usePreviewErrors(
  options: UsePreviewErrorsOptions = {}
): UsePreviewErrorsReturn {
  const {
    maxErrors = 50,
    onError,
    logToConsole = true,
  } = options;

  // Use ref to store errors to avoid re-renders on every error
  const errorsRef = useRef<PreviewError[]>([]);

  // Force update function
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);

  // Message handler
  const handleMessage = useCallback((event: MessageEvent) => {
    // Check if this is a PlayCraft error message
    const data = event.data;
    if (!data || typeof data !== 'object') return;
    if (!data.type || !String(data.type).startsWith('playcraft-')) return;

    const error: PreviewError = {
      type: data.type,
      level: data.payload?.level,
      message: data.payload?.message || 'Unknown error',
      source: data.payload?.source,
      line: data.payload?.line,
      col: data.payload?.col,
      stack: data.payload?.stack,
      timestamp: data.payload?.timestamp || Date.now(),
    };

    // Log to console if enabled
    if (logToConsole) {
      const logFn = error.type === 'playcraft-console-warn' ? console.warn : console.error;
      logFn('[Preview]', error.type, error.message);
    }

    // Call onError callback
    onError?.(error);

    // Add to error history (keep max)
    errorsRef.current = [...errorsRef.current.slice(-(maxErrors - 1)), error];
    forceUpdate();
  }, [maxErrors, onError, logToConsole]);

  // Clear errors
  const clearErrors = useCallback(() => {
    errorsRef.current = [];
    forceUpdate();
  }, []);

  // Set up message listener
  useEffect(() => {
    window.addEventListener('message', handleMessage);
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [handleMessage]);

  // Compute counts
  const errors = errorsRef.current;
  const errorCount = errors.filter(e =>
    e.type !== 'playcraft-console-warn' && e.level !== 'warn'
  ).length;
  const warningCount = errors.filter(e =>
    e.type === 'playcraft-console-warn' || e.level === 'warn'
  ).length;

  return {
    errors,
    clearErrors,
    hasErrors: errorCount > 0,
    errorCount,
    warningCount,
  };
}
