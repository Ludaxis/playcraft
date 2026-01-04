export class JoyixirError extends Error {
  constructor(
    message: string,
    public code: string,
    public cause?: unknown
  ) {
    super(message);
    this.name = 'JoyixirError';
  }
}

export class NetworkError extends JoyixirError {
  constructor(message: string, cause?: unknown) {
    super(message, 'NETWORK_ERROR', cause);
    this.name = 'NetworkError';
  }
}

export class ValidationError extends JoyixirError {
  constructor(message: string, cause?: unknown) {
    super(message, 'VALIDATION_ERROR', cause);
    this.name = 'ValidationError';
  }
}

const RETRYABLE_CODES = ['NETWORK_ERROR', 'TIMEOUT', 'SERVICE_UNAVAILABLE'];

export function isRetryable(error: unknown): boolean {
  if (error instanceof JoyixirError) {
    return RETRYABLE_CODES.includes(error.code);
  }
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return true;
  }
  return false;
}

export function formatUserMessage(error: unknown): string {
  if (error instanceof JoyixirError) {
    return error.message;
  }
  if (error instanceof Error) {
    if (error.message.includes('fetch')) {
      return 'Network error. Please check your connection and try again.';
    }
    return error.message;
  }
  return 'An unexpected error occurred. Please try again.';
}
