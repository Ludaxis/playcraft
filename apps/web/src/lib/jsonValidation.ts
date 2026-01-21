/**
 * JSON Validation Service
 *
 * Provides safe JSON parsing with zod schema validation to prevent
 * potential security vulnerabilities from untrusted JSON data.
 */

import { z } from 'zod';

// =============================================================================
// Schemas for known JSON structures
// =============================================================================

/**
 * WebContainer project state stored in sessionStorage
 */
export const ProjectStateSchema = z.object({
  projectId: z.string(),
  isReady: z.boolean(),
  previewUrl: z.string().nullable(),
  devServerProcessId: z.string().nullable(),
});

export type ProjectState = z.infer<typeof ProjectStateSchema>;

/**
 * Latest version pointer in published-games storage
 */
export const LatestVersionSchema = z.object({
  versionTag: z.string().optional(),
  versionId: z.string().optional(),
  path: z.string().optional(),
});

export type LatestVersion = z.infer<typeof LatestVersionSchema>;

/**
 * Published version manifest entry
 */
export const PublishedVersionSchema = z.object({
  id: z.string(),
  createdAt: z.string(),
  path: z.string(),
});

export const PublishedVersionsArraySchema = z.array(PublishedVersionSchema);

export type PublishedVersion = z.infer<typeof PublishedVersionSchema>;

/**
 * ESLint message from JSON output
 */
export const ESLintMessageSchema = z.object({
  ruleId: z.string().nullable(),
  severity: z.union([z.literal(1), z.literal(2)]),
  message: z.string(),
  line: z.number(),
  column: z.number(),
  nodeType: z.string(),
  endLine: z.number().optional(),
  endColumn: z.number().optional(),
});

export const ESLintFileResultSchema = z.object({
  filePath: z.string(),
  messages: z.array(ESLintMessageSchema),
  errorCount: z.number(),
  warningCount: z.number(),
});

export const ESLintResultsSchema = z.array(ESLintFileResultSchema);

export type ESLintMessage = z.infer<typeof ESLintMessageSchema>;
export type ESLintFileResult = z.infer<typeof ESLintFileResultSchema>;

/**
 * npm outdated JSON output structure
 */
export const NpmOutdatedEntrySchema = z.object({
  current: z.string().optional(),
  wanted: z.string().optional(),
  latest: z.string().optional(),
  type: z.string().optional(),
});

export const NpmOutdatedOutputSchema = z.record(z.string(), NpmOutdatedEntrySchema);

export type NpmOutdatedEntry = z.infer<typeof NpmOutdatedEntrySchema>;

/**
 * Basic package.json structure (only fields we use)
 */
export const PackageJsonSchema = z.object({
  name: z.string().optional(),
  version: z.string().optional(),
  dependencies: z.record(z.string(), z.string()).optional(),
  devDependencies: z.record(z.string(), z.string()).optional(),
});

export type PackageJson = z.infer<typeof PackageJsonSchema>;

// =============================================================================
// Safe parsing utilities
// =============================================================================

/**
 * Result type for safe JSON parsing
 */
export type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * Safely parse JSON with schema validation.
 * Returns a result object instead of throwing.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema to validate against
 * @returns SafeParseResult with either data or error
 */
export function safeParseJson<T>(
  jsonString: string,
  schema: z.ZodType<T>
): SafeParseResult<T> {
  try {
    const parsed = JSON.parse(jsonString);
    const result = schema.safeParse(parsed);

    if (result.success) {
      return { success: true, data: result.data };
    }

    return {
      success: false,
      error: `Validation failed: ${result.error.message}`,
    };
  } catch (err) {
    return {
      success: false,
      error: `JSON parse failed: ${err instanceof Error ? err.message : 'Unknown error'}`,
    };
  }
}

/**
 * Parse JSON with schema validation, returning null on failure.
 * Useful for optional data where failure is acceptable.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema to validate against
 * @returns Validated data or null
 */
export function parseJsonOrNull<T>(
  jsonString: string,
  schema: z.ZodType<T>
): T | null {
  const result = safeParseJson(jsonString, schema);
  return result.success ? result.data : null;
}

/**
 * Parse JSON with schema validation, throwing on failure.
 * Use when the data is expected to be valid.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema to validate against
 * @param context - Optional context for error messages
 * @returns Validated data
 * @throws Error if parsing or validation fails
 */
export function parseJsonOrThrow<T>(
  jsonString: string,
  schema: z.ZodType<T>,
  context?: string
): T {
  const result = safeParseJson(jsonString, schema);
  if (result.success) {
    return result.data;
  }
  throw new Error(context ? `${context}: ${result.error}` : result.error);
}

/**
 * Parse JSON with a fallback value on failure.
 * Useful for configuration or state that has defaults.
 *
 * @param jsonString - The JSON string to parse
 * @param schema - Zod schema to validate against
 * @param fallback - Value to return if parsing fails
 * @returns Validated data or fallback
 */
export function parseJsonWithFallback<T>(
  jsonString: string,
  schema: z.ZodType<T>,
  fallback: T
): T {
  const result = safeParseJson(jsonString, schema);
  return result.success ? result.data : fallback;
}
