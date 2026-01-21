/**
 * Code Validator Service
 * Runs TypeScript checks and captures errors for AI auto-fix
 */

import { parseJsonOrNull, ESLintResultsSchema } from './jsonValidation';

export interface CodeError {
  file: string;
  line: number;
  column: number;
  message: string;
  code: string; // e.g., "TS2322"
  severity: 'error' | 'warning';
}

export interface ValidationResult {
  success: boolean;
  errors: CodeError[];
  rawOutput: string;
}

/**
 * Parse TypeScript compiler output into structured errors
 */
export function parseTypeScriptErrors(output: string): CodeError[] {
  const errors: CodeError[] = [];

  // Match TypeScript error format: src/file.ts(10,5): error TS2322: Type 'string' is not assignable...
  // Also matches: src/file.ts:10:5 - error TS2322: Type 'string'...
  const errorRegex = /([^\s(]+)[(:)](\d+)[,:](\d+)[):]?\s*[-:]?\s*(error|warning)\s+(TS\d+):\s*(.+)/g;

  let match;
  while ((match = errorRegex.exec(output)) !== null) {
    errors.push({
      file: match[1].startsWith('/') ? match[1] : `/${match[1]}`,
      line: parseInt(match[2], 10),
      column: parseInt(match[3], 10),
      severity: match[4] as 'error' | 'warning',
      code: match[5],
      message: match[6].trim(),
    });
  }

  return errors;
}

/**
 * Parse Vite/esbuild build errors
 */
export function parseBuildErrors(output: string): CodeError[] {
  const errors: CodeError[] = [];

  // Vite error format: [plugin:vite:react-babel] /src/file.tsx: Error message
  const viteRegex = /\[plugin:[^\]]+\]\s*([^\s:]+):(\d+)?:?(\d+)?\s*(.+)/g;

  let match;
  while ((match = viteRegex.exec(output)) !== null) {
    errors.push({
      file: match[1].startsWith('/') ? match[1] : `/${match[1]}`,
      line: parseInt(match[2] || '1', 10),
      column: parseInt(match[3] || '1', 10),
      severity: 'error',
      code: 'BUILD_ERROR',
      message: match[4].trim(),
    });
  }

  // esbuild error format: ✘ [ERROR] Message
  // src/file.tsx:10:5:
  const esbuildRegex = /✘\s*\[ERROR\]\s*(.+)\n\s*([^\s:]+):(\d+):(\d+)/g;

  while ((match = esbuildRegex.exec(output)) !== null) {
    errors.push({
      file: match[2].startsWith('/') ? match[2] : `/${match[2]}`,
      line: parseInt(match[3], 10),
      column: parseInt(match[4], 10),
      severity: 'error',
      code: 'ESBUILD_ERROR',
      message: match[1].trim(),
    });
  }

  return errors;
}

/**
 * Parse runtime/console errors from the preview
 */
export function parseRuntimeErrors(output: string): CodeError[] {
  const errors: CodeError[] = [];

  // Common runtime error patterns
  // TypeError: Cannot read properties of undefined (reading 'map')
  //     at Component (src/file.tsx:25:10)
  const runtimeRegex = /(TypeError|ReferenceError|SyntaxError|Error):\s*(.+)\n\s*at\s+\w+\s+\(([^:]+):(\d+):(\d+)\)/g;

  let match;
  while ((match = runtimeRegex.exec(output)) !== null) {
    errors.push({
      file: match[3].startsWith('/') ? match[3] : `/${match[3]}`,
      line: parseInt(match[4], 10),
      column: parseInt(match[5], 10),
      severity: 'error',
      code: match[1].toUpperCase(),
      message: match[2].trim(),
    });
  }

  return errors;
}

/**
 * Parse ESLint JSON output into structured errors
 */
export function parseESLintErrors(jsonOutput: string): CodeError[] {
  const errors: CodeError[] = [];

  // Use validated JSON parsing
  const results = parseJsonOrNull(jsonOutput, ESLintResultsSchema);

  if (!results) {
    // JSON parsing or validation failed
    return errors;
  }

  for (const fileResult of results) {
    for (const msg of fileResult.messages) {
      // Normalize file path
      let filePath = fileResult.filePath;
      // Remove absolute path prefix if present
      const srcIndex = filePath.indexOf('/src/');
      if (srcIndex !== -1) {
        filePath = filePath.slice(srcIndex);
      } else if (!filePath.startsWith('/')) {
        filePath = `/${filePath}`;
      }

      errors.push({
        file: filePath,
        line: msg.line || 1,
        column: msg.column || 1,
        severity: msg.severity === 2 ? 'error' : 'warning',
        code: msg.ruleId || 'ESLINT',
        message: msg.message,
      });
    }
  }

  return errors;
}

/**
 * Preview error from iframe postMessage
 */
export interface PreviewError {
  type: 'playcraft-console-error' | 'playcraft-console-warn' | 'playcraft-runtime-error' | 'playcraft-unhandled-rejection';
  level?: 'error' | 'warn';
  message: string;
  source?: string;
  line?: number;
  col?: number;
  stack?: string;
  timestamp: number;
}

/**
 * Convert preview errors to CodeError format for AI context
 */
export function parsePreviewErrors(previewErrors: PreviewError[]): CodeError[] {
  const errors: CodeError[] = [];

  for (const error of previewErrors) {
    // Try to extract file/line info from stack trace
    let file = '/src/unknown.tsx';
    let line = 1;
    let column = 1;

    if (error.source) {
      file = error.source.includes('/src/')
        ? error.source.slice(error.source.indexOf('/src/'))
        : error.source;
    }

    if (error.line) line = error.line;
    if (error.col) column = error.col;

    // Try to parse stack trace for better location
    if (error.stack) {
      const stackMatch = error.stack.match(/at\s+\S+\s+\(([^:]+):(\d+):(\d+)\)/);
      if (stackMatch) {
        const stackFile = stackMatch[1];
        if (stackFile.includes('/src/')) {
          file = stackFile.slice(stackFile.indexOf('/src/'));
        }
        line = parseInt(stackMatch[2], 10);
        column = parseInt(stackMatch[3], 10);
      }
    }

    const severity = error.type === 'playcraft-console-warn' ? 'warning' : 'error';
    const code = error.type === 'playcraft-runtime-error' ? 'RUNTIME_ERROR'
      : error.type === 'playcraft-unhandled-rejection' ? 'UNHANDLED_REJECTION'
      : 'CONSOLE_ERROR';

    errors.push({
      file,
      line,
      column,
      severity,
      code,
      message: error.message,
    });
  }

  return errors;
}

/**
 * Format errors for AI context - provides clear, actionable error descriptions
 */
export function formatErrorsForAI(errors: CodeError[], fileContents?: Record<string, string>): string {
  if (errors.length === 0) return '';

  const lines: string[] = [
    `Found ${errors.length} error${errors.length > 1 ? 's' : ''} that need to be fixed:`,
    '',
  ];

  // Group errors by file
  const errorsByFile = new Map<string, CodeError[]>();
  for (const error of errors) {
    const existing = errorsByFile.get(error.file) || [];
    existing.push(error);
    errorsByFile.set(error.file, existing);
  }

  for (const [file, fileErrors] of errorsByFile) {
    lines.push(`## ${file}`);

    for (const error of fileErrors) {
      lines.push(`- Line ${error.line}: [${error.code}] ${error.message}`);

      // Include surrounding code context if available
      if (fileContents && fileContents[file]) {
        const fileLines = fileContents[file].split('\n');
        const startLine = Math.max(0, error.line - 3);
        const endLine = Math.min(fileLines.length, error.line + 2);

        lines.push('  ```typescript');
        for (let i = startLine; i < endLine; i++) {
          const lineNum = i + 1;
          const marker = lineNum === error.line ? '>' : ' ';
          lines.push(`  ${marker} ${lineNum.toString().padStart(3)} | ${fileLines[i]}`);
        }
        lines.push('  ```');
      }
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Create a retry prompt for the AI to fix errors
 */
export function createErrorFixPrompt(
  originalPrompt: string,
  errors: CodeError[],
  fileContents: Record<string, string>
): string {
  const errorContext = formatErrorsForAI(errors, fileContents);

  return `The previous code generation resulted in errors. Please fix them while maintaining the intended functionality.

ORIGINAL REQUEST:
${originalPrompt}

ERRORS TO FIX:
${errorContext}

INSTRUCTIONS:
1. Fix ALL the errors listed above
2. Keep the original intended functionality
3. Don't make unnecessary changes beyond fixing the errors
4. Ensure the code compiles without TypeScript errors
5. Use proper type annotations to prevent type errors`;
}

/**
 * Check if errors are likely auto-fixable (vs needing user intervention)
 */
export function areErrorsAutoFixable(errors: CodeError[]): boolean {
  // Some errors likely need user input
  const needsUserInput = errors.some(error => {
    // Missing imports that might need installation
    if (error.code === 'TS2307' && error.message.includes('Cannot find module')) {
      // Check if it's a node_module vs local file
      const moduleMatch = error.message.match(/Cannot find module '([^']+)'/);
      if (moduleMatch && !moduleMatch[1].startsWith('.') && !moduleMatch[1].startsWith('/')) {
        return true; // External module - needs npm install
      }
    }
    return false;
  });

  return !needsUserInput;
}

/**
 * Deduplicate errors (same file/line/message)
 */
export function deduplicateErrors(errors: CodeError[]): CodeError[] {
  const seen = new Set<string>();
  return errors.filter(error => {
    const key = `${error.file}:${error.line}:${error.message}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Main validation function - combines all error sources
 */
export function validateCode(
  tsOutput: string,
  buildOutput?: string,
  runtimeOutput?: string
): ValidationResult {
  let errors: CodeError[] = [];

  // Parse all error sources
  errors.push(...parseTypeScriptErrors(tsOutput));

  if (buildOutput) {
    errors.push(...parseBuildErrors(buildOutput));
  }

  if (runtimeOutput) {
    errors.push(...parseRuntimeErrors(runtimeOutput));
  }

  // Remove duplicates
  errors = deduplicateErrors(errors);

  // Only count actual errors (not warnings)
  const hasErrors = errors.some(e => e.severity === 'error');

  return {
    success: !hasErrors,
    errors,
    rawOutput: [tsOutput, buildOutput, runtimeOutput].filter(Boolean).join('\n---\n'),
  };
}
