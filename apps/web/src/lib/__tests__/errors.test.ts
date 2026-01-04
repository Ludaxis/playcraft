import { describe, it, expect } from 'vitest';
import {
  JoyixirError,
  NetworkError,
  ValidationError,
  isRetryable,
  formatUserMessage,
} from '../errors';

describe('JoyixirError', () => {
  it('creates error with code and cause', () => {
    const cause = new Error('original');
    const error = new JoyixirError('Something went wrong', 'TEST_ERROR', cause);

    expect(error.message).toBe('Something went wrong');
    expect(error.code).toBe('TEST_ERROR');
    expect(error.cause).toBe(cause);
    expect(error.name).toBe('JoyixirError');
  });
});

describe('NetworkError', () => {
  it('creates network error with correct code', () => {
    const error = new NetworkError('Connection failed');

    expect(error.code).toBe('NETWORK_ERROR');
    expect(error.name).toBe('NetworkError');
  });
});

describe('ValidationError', () => {
  it('creates validation error with correct code', () => {
    const error = new ValidationError('Invalid input');

    expect(error.code).toBe('VALIDATION_ERROR');
    expect(error.name).toBe('ValidationError');
  });
});

describe('isRetryable', () => {
  it('returns true for NetworkError', () => {
    expect(isRetryable(new NetworkError('fail'))).toBe(true);
  });

  it('returns true for TIMEOUT error', () => {
    expect(isRetryable(new JoyixirError('timeout', 'TIMEOUT'))).toBe(true);
  });

  it('returns true for SERVICE_UNAVAILABLE error', () => {
    expect(isRetryable(new JoyixirError('unavailable', 'SERVICE_UNAVAILABLE'))).toBe(true);
  });

  it('returns false for ValidationError', () => {
    expect(isRetryable(new ValidationError('invalid'))).toBe(false);
  });

  it('returns true for fetch TypeError', () => {
    const error = new TypeError('Failed to fetch');
    expect(isRetryable(error)).toBe(true);
  });

  it('returns false for generic Error', () => {
    expect(isRetryable(new Error('generic'))).toBe(false);
  });
});

describe('formatUserMessage', () => {
  it('returns message from JoyixirError', () => {
    const error = new JoyixirError('Custom message', 'CODE');
    expect(formatUserMessage(error)).toBe('Custom message');
  });

  it('returns friendly message for fetch errors', () => {
    const error = new Error('Failed to fetch');
    expect(formatUserMessage(error)).toBe(
      'Network error. Please check your connection and try again.'
    );
  });

  it('returns error message for generic Error', () => {
    const error = new Error('Something broke');
    expect(formatUserMessage(error)).toBe('Something broke');
  });

  it('returns default message for unknown error', () => {
    expect(formatUserMessage('string error')).toBe(
      'An unexpected error occurred. Please try again.'
    );
  });
});
