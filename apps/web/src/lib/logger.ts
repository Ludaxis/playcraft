interface LogContext {
  component?: string;
  action?: string;
  [key: string]: unknown;
}

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

// In production, only log errors to reduce console noise and improve performance
// In development, show all logs for debugging
const isProduction = import.meta.env.PROD;
const currentLevel: LogLevel = isProduction ? 'error' : 'debug';

function shouldLog(level: LogLevel): boolean {
  return LOG_LEVELS[level] >= LOG_LEVELS[currentLevel];
}

function formatMessage(level: LogLevel, message: string, context?: LogContext): string {
  const timestamp = new Date().toISOString();
  const prefix = context?.component ? `[${context.component}]` : '';
  return `${timestamp} ${level.toUpperCase()} ${prefix} ${message}`;
}

function formatContext(context?: LogContext): Record<string, unknown> | undefined {
  if (!context) return undefined;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { component, ...rest } = context;
  return Object.keys(rest).length > 0 ? rest : undefined;
}

export const logger = {
  debug(message: string, context?: LogContext): void {
    if (!shouldLog('debug')) return;
    const formatted = formatContext(context);
    if (formatted) {
      console.debug(formatMessage('debug', message, context), formatted);
    } else {
      console.debug(formatMessage('debug', message, context));
    }
  },

  info(message: string, context?: LogContext): void {
    if (!shouldLog('info')) return;
    const formatted = formatContext(context);
    if (formatted) {
      console.info(formatMessage('info', message, context), formatted);
    } else {
      console.info(formatMessage('info', message, context));
    }
  },

  warn(message: string, context?: LogContext): void {
    if (!shouldLog('warn')) return;
    const formatted = formatContext(context);
    if (formatted) {
      console.warn(formatMessage('warn', message, context), formatted);
    } else {
      console.warn(formatMessage('warn', message, context));
    }
  },

  error(message: string, error?: Error, context?: LogContext): void {
    if (!shouldLog('error')) return;
    const formatted = formatContext(context);
    if (formatted) {
      console.error(formatMessage('error', message, context), error, formatted);
    } else if (error) {
      console.error(formatMessage('error', message, context), error);
    } else {
      console.error(formatMessage('error', message, context));
    }
  },
};
