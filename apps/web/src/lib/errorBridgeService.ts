/**
 * Error Bridge Service
 *
 * Provides centralized management of runtime errors from the preview iframe.
 * Handles deduplication, formatting for AI context, and integration with auto-fix.
 */

import type { PreviewError, CodeError } from './codeValidator';
import { parsePreviewErrors as convertPreviewErrors } from './codeValidator';

export type { PreviewError } from './codeValidator';

export interface ErrorBridgeConfig {
  maxErrors: number;
  dedupeWindowMs: number;
}

const DEFAULT_CONFIG: ErrorBridgeConfig = {
  maxErrors: 20,
  dedupeWindowMs: 1000,
};

interface DedupeEntry {
  key: string;
  timestamp: number;
}

/**
 * Generate the error capture script to inject into preview HTML.
 * This script captures runtime errors and sends them to the parent via postMessage.
 */
export function generateErrorCaptureScript(): string {
  return `<script>
(function() {
  'use strict';

  var seen = {};
  var DEDUPE_MS = 500;

  function send(type, payload) {
    var key = type + ':' + (payload.message || '').substring(0, 100);
    var now = Date.now();
    if (seen[key] && now - seen[key] < DEDUPE_MS) return;
    seen[key] = now;

    try {
      window.parent.postMessage({
        type: type,
        payload: payload
      }, '*');
    } catch (e) {}
  }

  function extractLocation(stack) {
    if (!stack) return {};
    var match = stack.match(/at\\s+(?:\\S+\\s+)?\\(?([^:]+):(\\d+):(\\d+)\\)?/);
    if (match) {
      return {
        source: match[1],
        line: parseInt(match[2], 10),
        col: parseInt(match[3], 10)
      };
    }
    return {};
  }

  window.onerror = function(message, source, line, col, error) {
    var payload = {
      level: 'error',
      message: String(message),
      source: source,
      line: line,
      col: col,
      stack: error && error.stack,
      timestamp: Date.now()
    };
    send('playcraft-runtime-error', payload);
  };

  window.onunhandledrejection = function(event) {
    var reason = event.reason;
    var message = reason && reason.message ? reason.message : String(reason);
    var stack = reason && reason.stack;
    var loc = extractLocation(stack);

    send('playcraft-unhandled-rejection', {
      level: 'error',
      message: message,
      source: loc.source,
      line: loc.line,
      col: loc.col,
      stack: stack,
      timestamp: Date.now()
    });
  };

  var originalError = console.error;
  console.error = function() {
    var args = Array.prototype.slice.call(arguments);
    var message = args.map(function(a) {
      if (a instanceof Error) return a.message + (a.stack ? '\\n' + a.stack : '');
      if (typeof a === 'object') {
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }
      return String(a);
    }).join(' ');

    send('playcraft-console-error', {
      level: 'error',
      message: message,
      timestamp: Date.now()
    });

    originalError.apply(console, arguments);
  };

  var originalWarn = console.warn;
  console.warn = function() {
    var args = Array.prototype.slice.call(arguments);
    var message = args.map(function(a) {
      if (typeof a === 'object') {
        try { return JSON.stringify(a); } catch (e) { return String(a); }
      }
      return String(a);
    }).join(' ');

    send('playcraft-console-warn', {
      level: 'warn',
      message: message,
      timestamp: Date.now()
    });

    originalWarn.apply(console, arguments);
  };
})();
</script>`;
}

/**
 * Creates an error bridge instance for managing preview errors.
 */
export function createErrorBridge(config: Partial<ErrorBridgeConfig> = {}) {
  const cfg: ErrorBridgeConfig = { ...DEFAULT_CONFIG, ...config };
  const errors: PreviewError[] = [];
  const dedupeCache: DedupeEntry[] = [];
  const listeners = new Set<(error: PreviewError) => void>();

  function generateDedupeKey(error: PreviewError): string {
    return `${error.type}:${error.message}:${error.source || ''}:${error.line || 0}`;
  }

  function isDuplicate(error: PreviewError): boolean {
    const key = generateDedupeKey(error);
    const now = Date.now();

    // Clean old entries
    while (dedupeCache.length > 0 && now - dedupeCache[0].timestamp > cfg.dedupeWindowMs) {
      dedupeCache.shift();
    }

    const existing = dedupeCache.find(e => e.key === key);
    if (existing) {
      return true;
    }

    dedupeCache.push({ key, timestamp: now });
    return false;
  }

  return {
    /**
     * Add an error from the preview iframe.
     * Handles deduplication and notifies listeners.
     */
    addError(error: PreviewError): boolean {
      if (isDuplicate(error)) {
        return false;
      }

      errors.push(error);

      // Trim to max errors
      while (errors.length > cfg.maxErrors) {
        errors.shift();
      }

      // Notify listeners
      for (const listener of listeners) {
        try {
          listener(error);
        } catch (e) {
          console.warn('[ErrorBridge] Listener error:', e);
        }
      }

      return true;
    },

    /**
     * Get all stored errors.
     */
    getErrors(): PreviewError[] {
      return [...errors];
    },

    /**
     * Get only actual errors (not warnings).
     */
    getRuntimeErrors(): PreviewError[] {
      return errors.filter(
        e => e.type !== 'playcraft-console-warn' && e.level !== 'warn'
      );
    },

    /**
     * Get error count (excluding warnings).
     */
    getErrorCount(): number {
      return errors.filter(
        e => e.type !== 'playcraft-console-warn' && e.level !== 'warn'
      ).length;
    },

    /**
     * Clear all errors.
     */
    clearErrors(): void {
      errors.length = 0;
      dedupeCache.length = 0;
    },

    /**
     * Subscribe to new errors.
     */
    onError(callback: (error: PreviewError) => void): () => void {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    /**
     * Convert preview errors to CodeError format for AI context.
     */
    toCodeErrors(): CodeError[] {
      return convertPreviewErrors(this.getRuntimeErrors());
    },

    /**
     * Format errors for inclusion in AI auto-fix prompt.
     */
    formatForAutoFix(): string {
      const runtimeErrors = this.getRuntimeErrors();
      if (runtimeErrors.length === 0) {
        return '';
      }

      const lines: string[] = [
        `## Runtime Errors (${runtimeErrors.length})`,
        '',
        'The following runtime errors were detected in the preview:',
        '',
      ];

      for (const error of runtimeErrors.slice(0, 5)) {
        const location = error.source && error.line
          ? ` at ${error.source}:${error.line}`
          : '';
        const errorType = error.type === 'playcraft-unhandled-rejection'
          ? 'Unhandled Promise Rejection'
          : 'Runtime Error';

        lines.push(`- **${errorType}**${location}`);
        lines.push(`  ${error.message}`);

        if (error.stack) {
          const stackLines = error.stack.split('\n').slice(0, 3);
          lines.push('  ```');
          for (const stackLine of stackLines) {
            lines.push(`  ${stackLine.trim()}`);
          }
          lines.push('  ```');
        }
        lines.push('');
      }

      if (runtimeErrors.length > 5) {
        lines.push(`... and ${runtimeErrors.length - 5} more errors`);
      }

      return lines.join('\n');
    },
  };
}

/**
 * Singleton error bridge instance for global access.
 */
let globalBridge: ReturnType<typeof createErrorBridge> | null = null;

/**
 * Get the global error bridge instance.
 */
export function getErrorBridge(): ReturnType<typeof createErrorBridge> {
  if (!globalBridge) {
    globalBridge = createErrorBridge();
  }
  return globalBridge;
}

/**
 * Reset the global error bridge (for testing).
 */
export function resetErrorBridge(): void {
  globalBridge = null;
}

/**
 * Check if there are any runtime errors (not warnings).
 */
export function hasRuntimeErrors(): boolean {
  return getErrorBridge().getErrorCount() > 0;
}

/**
 * Format runtime errors for AI context.
 */
export function formatRuntimeErrorsForAI(): string {
  return getErrorBridge().formatForAutoFix();
}
