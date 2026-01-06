/**
 * Edit Apply Service
 *
 * Handles applying search/replace edits to files.
 * Used for small, targeted changes to reduce token usage and improve accuracy.
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FileEdit {
  file: string;
  find: string;
  replace: string;
}

export interface EditResult {
  file: string;
  success: boolean;
  error?: string;
  originalContent?: string;
  newContent?: string;
}

export interface ApplyEditsResult {
  success: boolean;
  results: EditResult[];
  errors: string[];
}

// ============================================================================
// EDIT APPLICATION
// ============================================================================

/**
 * Apply a single edit to file content
 */
export function applyEdit(
  content: string,
  edit: FileEdit
): { success: boolean; newContent: string; error?: string } {
  const { find, replace } = edit;

  // Check if the find string exists in the content
  if (!content.includes(find)) {
    // Try fuzzy matching - normalize whitespace and check again
    const normalizedContent = normalizeWhitespace(content);
    const normalizedFind = normalizeWhitespace(find);

    if (normalizedContent.includes(normalizedFind)) {
      // Find the actual position using fuzzy match
      const fuzzyResult = fuzzyReplace(content, find, replace);
      if (fuzzyResult.success) {
        return { success: true, newContent: fuzzyResult.content };
      }
    }

    return {
      success: false,
      newContent: content,
      error: `Could not find the search string in file. Expected:\n"${find.slice(0, 100)}${find.length > 100 ? '...' : ''}"`,
    };
  }

  // Count occurrences
  const occurrences = countOccurrences(content, find);

  if (occurrences > 1) {
    // Multiple matches - try to find most likely match using context
    const contextResult = replaceWithContext(content, find, replace);
    if (contextResult.success) {
      return { success: true, newContent: contextResult.content };
    }

    return {
      success: false,
      newContent: content,
      error: `Found ${occurrences} matches for the search string. Please provide more context to make the match unique.`,
    };
  }

  // Single match - straightforward replace
  const newContent = content.replace(find, replace);
  return { success: true, newContent };
}

/**
 * Apply multiple edits to files
 */
export async function applyEdits(
  edits: FileEdit[],
  readFile: (path: string) => Promise<string | null>,
  writeFile: (path: string, content: string) => Promise<void>
): Promise<ApplyEditsResult> {
  const results: EditResult[] = [];
  const errors: string[] = [];

  // Group edits by file
  const editsByFile = new Map<string, FileEdit[]>();
  for (const edit of edits) {
    const normalizedPath = normalizePath(edit.file);
    const existing = editsByFile.get(normalizedPath) || [];
    existing.push(edit);
    editsByFile.set(normalizedPath, existing);
  }

  // Process each file
  for (const [filePath, fileEdits] of editsByFile) {
    // Read current content
    const content = await readFile(filePath);
    if (content === null) {
      errors.push(`File not found: ${filePath}`);
      results.push({
        file: filePath,
        success: false,
        error: 'File not found',
      });
      continue;
    }

    // Apply edits sequentially to this file
    let currentContent = content;
    let allSuccess = true;

    for (const edit of fileEdits) {
      const result = applyEdit(currentContent, edit);
      if (result.success) {
        currentContent = result.newContent;
      } else {
        allSuccess = false;
        errors.push(`Failed to apply edit to ${filePath}: ${result.error}`);
      }
    }

    // Write the modified content
    if (currentContent !== content) {
      try {
        await writeFile(filePath, currentContent);
        results.push({
          file: filePath,
          success: allSuccess,
          originalContent: content,
          newContent: currentContent,
        });
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Write failed';
        errors.push(`Failed to write ${filePath}: ${errorMsg}`);
        results.push({
          file: filePath,
          success: false,
          error: errorMsg,
        });
      }
    } else {
      results.push({
        file: filePath,
        success: false,
        error: 'No changes applied',
      });
    }
  }

  return {
    success: errors.length === 0,
    results,
    errors,
  };
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Normalize path to ensure consistency
 */
function normalizePath(path: string): string {
  // Ensure path starts with /
  const normalized = path.startsWith('/') ? path : `/${path}`;
  // Remove any double slashes
  return normalized.replace(/\/+/g, '/');
}

/**
 * Normalize whitespace for fuzzy matching
 */
function normalizeWhitespace(str: string): string {
  return str
    .replace(/\r\n/g, '\n') // Normalize line endings
    .replace(/\t/g, '  ') // Convert tabs to spaces
    .replace(/[ ]+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * Count occurrences of a substring
 */
function countOccurrences(content: string, search: string): number {
  let count = 0;
  let pos = 0;
  while ((pos = content.indexOf(search, pos)) !== -1) {
    count++;
    pos += search.length;
  }
  return count;
}

/**
 * Try to replace with fuzzy whitespace matching
 */
function fuzzyReplace(
  content: string,
  find: string,
  replace: string
): { success: boolean; content: string } {
  // Build a regex that matches the find string with flexible whitespace
  const escapedFind = find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const flexiblePattern = escapedFind
    .replace(/\\n/g, '\\s*\\n\\s*')
    .replace(/ +/g, '\\s+');

  try {
    const regex = new RegExp(flexiblePattern);
    const match = content.match(regex);

    if (match) {
      // Replace the matched text
      const newContent = content.replace(regex, replace);
      return { success: true, content: newContent };
    }
  } catch {
    // Regex failed, return failure
  }

  return { success: false, content };
}

/**
 * Replace with context when there are multiple matches
 * Try to find the match that appears in similar surrounding context
 */
function replaceWithContext(
  content: string,
  find: string,
  replace: string
): { success: boolean; content: string } {
  // Split content into lines
  const lines = content.split('\n');
  const findLines = find.split('\n');

  // Look for the first line of find
  const firstLine = findLines[0].trim();
  const matchingLineIndices: number[] = [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes(firstLine)) {
      matchingLineIndices.push(i);
    }
  }

  if (matchingLineIndices.length === 1) {
    // Only one match by first line - use it
    return { success: true, content: content.replace(find, replace) };
  }

  // Multiple matches - can't resolve
  return { success: false, content };
}

/**
 * Validate that an edit response is properly formatted
 */
export function validateEditResponse(response: unknown): response is { edits: FileEdit[] } {
  if (!response || typeof response !== 'object') return false;

  const obj = response as Record<string, unknown>;
  if (!Array.isArray(obj.edits)) return false;

  for (const edit of obj.edits) {
    if (typeof edit !== 'object' || edit === null) return false;
    const e = edit as Record<string, unknown>;
    if (typeof e.file !== 'string') return false;
    if (typeof e.find !== 'string') return false;
    if (typeof e.replace !== 'string') return false;
  }

  return true;
}

/**
 * Check if a response contains edits (as opposed to full files)
 */
export function isEditResponse(response: unknown): boolean {
  if (!response || typeof response !== 'object') return false;
  const obj = response as Record<string, unknown>;
  return Array.isArray(obj.edits) && obj.edits.length > 0;
}
