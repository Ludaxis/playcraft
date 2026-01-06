/**
 * Code Chunker for PlayCraft
 *
 * Splits TypeScript/JavaScript code files into logical chunks (functions, components, classes)
 * for embedding and semantic search.
 *
 * Chunking Strategy:
 * - Split by function/component/class boundaries (not arbitrary lines)
 * - Keep chunks 20-200 lines
 * - Overlap chunks by ~10% for context continuity
 * - Preserve imports and type definitions as separate chunks
 */

import { computeHashSync } from './fileHashService';
import type { CodeChunk } from './embeddingService';

// ============================================
// Types
// ============================================

export interface ChunkBoundary {
  type: 'function' | 'component' | 'class' | 'type' | 'hook' | 'constant' | 'import' | 'other';
  name: string;
  startLine: number;
  endLine: number;
}

export interface ChunkingResult {
  chunks: Omit<CodeChunk, 'projectId' | 'embedding'>[];
  boundaries: ChunkBoundary[];
}

// ============================================
// Constants
// ============================================

const MIN_CHUNK_LINES = 5;
const MAX_CHUNK_LINES = 200;
const OVERLAP_LINES = 5;

// ============================================
// Boundary Detection Patterns
// ============================================

// Regex patterns for detecting code boundaries
const PATTERNS = {
  // Function declarations: function foo() / async function foo()
  functionDecl: /^(?:export\s+)?(?:async\s+)?function\s+(\w+)/,

  // Arrow function with const: const foo = () => / const foo = async () =>
  arrowFunction: /^(?:export\s+)?const\s+(\w+)\s*=\s*(?:async\s+)?\([^)]*\)\s*(?::\s*[^=]+)?\s*=>/,

  // React component (starts with capital letter)
  reactComponent: /^(?:export\s+)?(?:const|function)\s+([A-Z]\w+)/,

  // Class declaration
  classDecl: /^(?:export\s+)?(?:abstract\s+)?class\s+(\w+)/,

  // Interface/Type declaration
  typeDecl: /^(?:export\s+)?(?:interface|type)\s+(\w+)/,

  // Hook (starts with use)
  hookDecl: /^(?:export\s+)?(?:const|function)\s+(use\w+)/,

  // Constant export
  constExport: /^export\s+const\s+(\w+)\s*=/,

  // Import block start
  importStart: /^import\s+/,
};

// ============================================
// Boundary Detection
// ============================================

/**
 * Detect logical boundaries in code (functions, components, classes)
 */
export function detectBoundaries(code: string): ChunkBoundary[] {
  const lines = code.split('\n');
  const boundaries: ChunkBoundary[] = [];

  let currentBoundary: Partial<ChunkBoundary> | null = null;
  let braceDepth = 0;
  let inImportBlock = false;
  let importStartLine = -1;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const lineNumber = i + 1; // 1-indexed

    // Skip empty lines and comments for boundary detection
    if (!line || line.startsWith('//') || line.startsWith('/*') || line.startsWith('*')) {
      // If in import block and hit empty line, close it
      if (inImportBlock && !line) {
        boundaries.push({
          type: 'import',
          name: 'imports',
          startLine: importStartLine,
          endLine: lineNumber - 1,
        });
        inImportBlock = false;
      }
      continue;
    }

    // Track import blocks
    if (PATTERNS.importStart.test(line)) {
      if (!inImportBlock) {
        inImportBlock = true;
        importStartLine = lineNumber;
      }
      continue;
    } else if (inImportBlock) {
      // End import block when we hit non-import code
      boundaries.push({
        type: 'import',
        name: 'imports',
        startLine: importStartLine,
        endLine: lineNumber - 1,
      });
      inImportBlock = false;
    }

    // If inside a block, track braces
    if (currentBoundary) {
      braceDepth += (line.match(/{/g) || []).length;
      braceDepth -= (line.match(/}/g) || []).length;

      if (braceDepth <= 0) {
        // Block ended
        currentBoundary.endLine = lineNumber;
        boundaries.push(currentBoundary as ChunkBoundary);
        currentBoundary = null;
        braceDepth = 0;
      }
      continue;
    }

    // Detect new boundaries
    let match: RegExpMatchArray | null;
    let boundaryType: ChunkBoundary['type'] = 'other';
    let name = '';

    if ((match = line.match(PATTERNS.hookDecl))) {
      boundaryType = 'hook';
      name = match[1];
    } else if ((match = line.match(PATTERNS.reactComponent))) {
      boundaryType = 'component';
      name = match[1];
    } else if ((match = line.match(PATTERNS.classDecl))) {
      boundaryType = 'class';
      name = match[1];
    } else if ((match = line.match(PATTERNS.typeDecl))) {
      boundaryType = 'type';
      name = match[1];
    } else if ((match = line.match(PATTERNS.functionDecl))) {
      boundaryType = 'function';
      name = match[1];
    } else if ((match = line.match(PATTERNS.arrowFunction))) {
      boundaryType = 'function';
      name = match[1];
    } else if ((match = line.match(PATTERNS.constExport))) {
      boundaryType = 'constant';
      name = match[1];
    }

    if (name) {
      currentBoundary = {
        type: boundaryType,
        name,
        startLine: lineNumber,
      };
      braceDepth = (line.match(/{/g) || []).length - (line.match(/}/g) || []).length;

      // If single-line definition
      if (braceDepth <= 0) {
        currentBoundary.endLine = lineNumber;
        boundaries.push(currentBoundary as ChunkBoundary);
        currentBoundary = null;
        braceDepth = 0;
      }
    }
  }

  // Handle unclosed boundaries
  if (currentBoundary) {
    currentBoundary.endLine = lines.length;
    boundaries.push(currentBoundary as ChunkBoundary);
  }

  return boundaries;
}

/**
 * Chunk code by detected boundaries
 */
export function chunkCode(
  code: string,
  filePath: string
): ChunkingResult {
  const lines = code.split('\n');
  const boundaries = detectBoundaries(code);
  const chunks: Omit<CodeChunk, 'projectId' | 'embedding'>[] = [];

  // If no boundaries detected, chunk by line count
  if (boundaries.length === 0) {
    return chunkByLines(code, filePath);
  }

  // Create chunks from boundaries
  let chunkIndex = 0;
  let lastEndLine = 0;

  for (const boundary of boundaries) {
    // Add any gap between boundaries as "other" chunk
    if (boundary.startLine > lastEndLine + 1) {
      const gapContent = lines.slice(lastEndLine, boundary.startLine - 1).join('\n').trim();
      if (gapContent && gapContent.split('\n').length >= MIN_CHUNK_LINES) {
        chunks.push({
          filePath,
          chunkIndex: chunkIndex++,
          startLine: lastEndLine + 1,
          endLine: boundary.startLine - 1,
          content: gapContent,
          contentHash: computeHashSync(gapContent),
          chunkType: 'other',
        });
      }
    }

    // Extract content for this boundary
    const content = lines.slice(boundary.startLine - 1, boundary.endLine).join('\n');

    // Skip very small chunks (likely just declarations)
    if (boundary.type === 'import' || content.split('\n').length < MIN_CHUNK_LINES) {
      // Combine with adjacent chunk or skip
      lastEndLine = boundary.endLine;
      continue;
    }

    // Split large chunks
    if (content.split('\n').length > MAX_CHUNK_LINES) {
      const subChunks = splitLargeChunk(
        content,
        filePath,
        boundary.startLine,
        chunkIndex,
        boundary.type,
        boundary.name
      );
      chunks.push(...subChunks);
      chunkIndex += subChunks.length;
    } else {
      chunks.push({
        filePath,
        chunkIndex: chunkIndex++,
        startLine: boundary.startLine,
        endLine: boundary.endLine,
        content,
        contentHash: computeHashSync(content),
        chunkType: boundary.type,
        symbolName: boundary.name,
      });
    }

    lastEndLine = boundary.endLine;
  }

  // Add any remaining content after last boundary
  if (lastEndLine < lines.length) {
    const remainingContent = lines.slice(lastEndLine).join('\n').trim();
    if (remainingContent && remainingContent.split('\n').length >= MIN_CHUNK_LINES) {
      chunks.push({
        filePath,
        chunkIndex: chunkIndex++,
        startLine: lastEndLine + 1,
        endLine: lines.length,
        content: remainingContent,
        contentHash: computeHashSync(remainingContent),
        chunkType: 'other',
      });
    }
  }

  return { chunks, boundaries };
}

/**
 * Split large chunks into smaller overlapping pieces
 */
function splitLargeChunk(
  content: string,
  filePath: string,
  baseStartLine: number,
  baseChunkIndex: number,
  chunkType: ChunkBoundary['type'],
  symbolName: string
): Omit<CodeChunk, 'projectId' | 'embedding'>[] {
  const lines = content.split('\n');
  const chunks: Omit<CodeChunk, 'projectId' | 'embedding'>[] = [];

  let currentStart = 0;
  let subIndex = 0;

  while (currentStart < lines.length) {
    const currentEnd = Math.min(currentStart + MAX_CHUNK_LINES, lines.length);
    const chunkLines = lines.slice(currentStart, currentEnd);
    const chunkContent = chunkLines.join('\n');

    chunks.push({
      filePath,
      chunkIndex: baseChunkIndex + subIndex,
      startLine: baseStartLine + currentStart,
      endLine: baseStartLine + currentEnd - 1,
      content: chunkContent,
      contentHash: computeHashSync(chunkContent),
      chunkType,
      symbolName: subIndex === 0 ? symbolName : `${symbolName}#${subIndex + 1}`,
    });

    subIndex++;
    currentStart = currentEnd - OVERLAP_LINES; // Overlap for context continuity

    // Prevent infinite loop
    if (currentStart >= lines.length - OVERLAP_LINES) break;
  }

  return chunks;
}

/**
 * Fallback: chunk by line count when no boundaries detected
 */
function chunkByLines(
  code: string,
  filePath: string
): ChunkingResult {
  const lines = code.split('\n');
  const chunks: Omit<CodeChunk, 'projectId' | 'embedding'>[] = [];

  let currentStart = 0;
  let chunkIndex = 0;

  while (currentStart < lines.length) {
    const currentEnd = Math.min(currentStart + MAX_CHUNK_LINES, lines.length);
    const chunkLines = lines.slice(currentStart, currentEnd);
    const chunkContent = chunkLines.join('\n');

    if (chunkContent.trim()) {
      chunks.push({
        filePath,
        chunkIndex: chunkIndex++,
        startLine: currentStart + 1,
        endLine: currentEnd,
        content: chunkContent,
        contentHash: computeHashSync(chunkContent),
        chunkType: 'other',
      });
    }

    currentStart = currentEnd - OVERLAP_LINES;
    if (currentStart >= lines.length - OVERLAP_LINES) break;
  }

  return { chunks, boundaries: [] };
}

// ============================================
// File Type Detection
// ============================================

/**
 * Detect the type of a TypeScript/JavaScript file
 */
export function detectFileType(
  code: string,
  filePath: string
): 'component' | 'hook' | 'util' | 'type' | 'style' | 'config' | 'test' | 'other' {
  const fileName = filePath.split('/').pop() || '';

  // Check file extension/name patterns
  if (fileName.includes('.test.') || fileName.includes('.spec.')) return 'test';
  if (fileName.endsWith('.css') || fileName.endsWith('.scss') || fileName.endsWith('.less')) return 'style';
  if (fileName.includes('config') || fileName === 'tsconfig.json' || fileName === 'vite.config.ts') return 'config';
  if (fileName.endsWith('.d.ts')) return 'type';

  // Check code patterns
  const boundaries = detectBoundaries(code);

  const hasHooks = boundaries.some(b => b.type === 'hook');
  const hasComponents = boundaries.some(b => b.type === 'component');
  const hasOnlyTypes = boundaries.every(b => b.type === 'type' || b.type === 'import');

  if (hasHooks && !hasComponents) return 'hook';
  if (hasComponents) return 'component';
  if (hasOnlyTypes) return 'type';

  // Check for utility patterns
  if (fileName.includes('util') || fileName.includes('helper') || fileName.includes('lib')) return 'util';

  return 'other';
}

// ============================================
// Index a Project File
// ============================================

/**
 * Process a file for indexing (chunking + metadata extraction)
 */
export function processFileForIndexing(
  code: string,
  filePath: string,
  projectId: string
): {
  chunks: CodeChunk[];
  fileType: string;
  exports: string[];
  lineCount: number;
} {
  const { chunks: rawChunks, boundaries } = chunkCode(code, filePath);
  const fileType = detectFileType(code, filePath);
  const lineCount = code.split('\n').length;

  // Extract exports from boundaries
  const exports = boundaries
    .filter(b => b.type !== 'import' && b.type !== 'other')
    .map(b => b.name);

  // Add projectId to chunks
  const chunks: CodeChunk[] = rawChunks.map(chunk => ({
    ...chunk,
    projectId,
  }));

  return {
    chunks,
    fileType,
    exports,
    lineCount,
  };
}
