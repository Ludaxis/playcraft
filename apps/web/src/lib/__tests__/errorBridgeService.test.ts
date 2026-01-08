import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  createErrorBridge,
  generateErrorCaptureScript,
  getErrorBridge,
  resetErrorBridge,
  hasRuntimeErrors,
  formatRuntimeErrorsForAI,
  type PreviewError,
} from '../errorBridgeService';

describe('createErrorBridge', () => {
  describe('addError', () => {
    it('adds error and returns true', () => {
      const bridge = createErrorBridge();
      const error: PreviewError = {
        type: 'playcraft-runtime-error',
        message: 'Test error',
        timestamp: Date.now(),
      };

      const result = bridge.addError(error);

      expect(result).toBe(true);
      expect(bridge.getErrors()).toHaveLength(1);
      expect(bridge.getErrors()[0].message).toBe('Test error');
    });

    it('deduplicates identical errors within window', () => {
      const bridge = createErrorBridge({ dedupeWindowMs: 1000 });
      const error: PreviewError = {
        type: 'playcraft-runtime-error',
        message: 'Duplicate error',
        timestamp: Date.now(),
      };

      expect(bridge.addError(error)).toBe(true);
      expect(bridge.addError(error)).toBe(false);
      expect(bridge.getErrors()).toHaveLength(1);
    });

    it('respects maxErrors limit', () => {
      const bridge = createErrorBridge({ maxErrors: 3 });

      for (let i = 0; i < 5; i++) {
        bridge.addError({
          type: 'playcraft-runtime-error',
          message: `Error ${i}`,
          timestamp: Date.now() + i,
        });
      }

      expect(bridge.getErrors()).toHaveLength(3);
      expect(bridge.getErrors()[0].message).toBe('Error 2');
      expect(bridge.getErrors()[2].message).toBe('Error 4');
    });

    it('notifies listeners on new error', () => {
      const bridge = createErrorBridge();
      const listener = vi.fn();

      bridge.onError(listener);
      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'Test',
        timestamp: Date.now(),
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(listener).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Test' })
      );
    });

    it('does not notify listeners for duplicates', () => {
      const bridge = createErrorBridge();
      const listener = vi.fn();
      const error: PreviewError = {
        type: 'playcraft-runtime-error',
        message: 'Test',
        timestamp: Date.now(),
      };

      bridge.onError(listener);
      bridge.addError(error);
      bridge.addError(error);

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('getRuntimeErrors', () => {
    it('filters out warnings', () => {
      const bridge = createErrorBridge();

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'Error',
        timestamp: Date.now(),
      });
      bridge.addError({
        type: 'playcraft-console-warn',
        level: 'warn',
        message: 'Warning',
        timestamp: Date.now() + 1,
      });
      bridge.addError({
        type: 'playcraft-console-error',
        message: 'Console error',
        timestamp: Date.now() + 2,
      });

      const runtimeErrors = bridge.getRuntimeErrors();

      expect(runtimeErrors).toHaveLength(2);
      expect(runtimeErrors.some(e => e.message === 'Warning')).toBe(false);
    });
  });

  describe('getErrorCount', () => {
    it('counts only errors, not warnings', () => {
      const bridge = createErrorBridge();

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'Error 1',
        timestamp: Date.now(),
      });
      bridge.addError({
        type: 'playcraft-console-warn',
        message: 'Warning',
        timestamp: Date.now() + 1,
      });
      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'Error 2',
        timestamp: Date.now() + 2,
      });

      expect(bridge.getErrorCount()).toBe(2);
    });
  });

  describe('clearErrors', () => {
    it('removes all errors and resets dedupe cache', () => {
      const bridge = createErrorBridge();
      const error: PreviewError = {
        type: 'playcraft-runtime-error',
        message: 'Test',
        timestamp: Date.now(),
      };

      bridge.addError(error);
      expect(bridge.getErrors()).toHaveLength(1);

      bridge.clearErrors();
      expect(bridge.getErrors()).toHaveLength(0);

      // Should be able to add same error again
      expect(bridge.addError(error)).toBe(true);
    });
  });

  describe('onError', () => {
    it('returns unsubscribe function', () => {
      const bridge = createErrorBridge();
      const listener = vi.fn();

      const unsubscribe = bridge.onError(listener);

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'Before unsubscribe',
        timestamp: Date.now(),
      });
      expect(listener).toHaveBeenCalledTimes(1);

      unsubscribe();

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'After unsubscribe',
        timestamp: Date.now() + 1,
      });
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('toCodeErrors', () => {
    it('converts preview errors to CodeError format', () => {
      const bridge = createErrorBridge();

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'TypeError: Cannot read undefined',
        source: '/src/App.tsx',
        line: 42,
        col: 10,
        timestamp: Date.now(),
      });

      const codeErrors = bridge.toCodeErrors();

      expect(codeErrors).toHaveLength(1);
      expect(codeErrors[0]).toMatchObject({
        file: '/src/App.tsx',
        line: 42,
        column: 10,
        message: 'TypeError: Cannot read undefined',
        severity: 'error',
        code: 'RUNTIME_ERROR',
      });
    });
  });

  describe('formatForAutoFix', () => {
    it('returns empty string when no errors', () => {
      const bridge = createErrorBridge();
      expect(bridge.formatForAutoFix()).toBe('');
    });

    it('formats runtime errors for AI context', () => {
      const bridge = createErrorBridge();

      bridge.addError({
        type: 'playcraft-runtime-error',
        message: 'TypeError: Cannot read property x',
        source: '/src/index.tsx',
        line: 10,
        timestamp: Date.now(),
      });

      const formatted = bridge.formatForAutoFix();

      expect(formatted).toContain('## Runtime Errors');
      expect(formatted).toContain('TypeError: Cannot read property x');
      expect(formatted).toContain('/src/index.tsx:10');
    });

    it('limits to 5 errors in output', () => {
      const bridge = createErrorBridge();

      for (let i = 0; i < 7; i++) {
        bridge.addError({
          type: 'playcraft-runtime-error',
          message: `Error ${i}`,
          timestamp: Date.now() + i,
        });
      }

      const formatted = bridge.formatForAutoFix();

      expect(formatted).toContain('Error 0');
      expect(formatted).toContain('Error 4');
      expect(formatted).not.toContain('Error 5');
      expect(formatted).toContain('... and 2 more errors');
    });
  });
});

describe('generateErrorCaptureScript', () => {
  it('generates script with playcraft message types', () => {
    const script = generateErrorCaptureScript();

    expect(script).toContain('<script>');
    expect(script).toContain('</script>');
    expect(script).toContain('playcraft-runtime-error');
    expect(script).toContain('playcraft-unhandled-rejection');
    expect(script).toContain('playcraft-console-error');
    expect(script).toContain('playcraft-console-warn');
  });

  it('wraps console.error and console.warn', () => {
    const script = generateErrorCaptureScript();

    expect(script).toContain('var originalError = console.error');
    expect(script).toContain('var originalWarn = console.warn');
  });

  it('includes deduplication logic', () => {
    const script = generateErrorCaptureScript();

    expect(script).toContain('var seen = {}');
    expect(script).toContain('DEDUPE_MS');
  });
});

describe('global bridge functions', () => {
  beforeEach(() => {
    resetErrorBridge();
  });

  describe('getErrorBridge', () => {
    it('returns singleton instance', () => {
      const bridge1 = getErrorBridge();
      const bridge2 = getErrorBridge();

      expect(bridge1).toBe(bridge2);
    });
  });

  describe('hasRuntimeErrors', () => {
    it('returns false when no errors', () => {
      expect(hasRuntimeErrors()).toBe(false);
    });

    it('returns true when errors exist', () => {
      getErrorBridge().addError({
        type: 'playcraft-runtime-error',
        message: 'Error',
        timestamp: Date.now(),
      });

      expect(hasRuntimeErrors()).toBe(true);
    });

    it('returns false for warnings only', () => {
      getErrorBridge().addError({
        type: 'playcraft-console-warn',
        level: 'warn',
        message: 'Warning',
        timestamp: Date.now(),
      });

      expect(hasRuntimeErrors()).toBe(false);
    });
  });

  describe('formatRuntimeErrorsForAI', () => {
    it('uses global bridge', () => {
      getErrorBridge().addError({
        type: 'playcraft-runtime-error',
        message: 'Global error',
        timestamp: Date.now(),
      });

      const formatted = formatRuntimeErrorsForAI();

      expect(formatted).toContain('Global error');
    });
  });

  describe('resetErrorBridge', () => {
    it('creates new instance on next access', () => {
      const bridge1 = getErrorBridge();
      bridge1.addError({
        type: 'playcraft-runtime-error',
        message: 'Test',
        timestamp: Date.now(),
      });

      resetErrorBridge();

      const bridge2 = getErrorBridge();
      expect(bridge2.getErrors()).toHaveLength(0);
    });
  });
});
