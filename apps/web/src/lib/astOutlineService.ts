/**
 * AST Outline Service
 *
 * Extracts condensed structural outlines from TypeScript/React files.
 * Reduces token usage by 80% while preserving essential information for AI.
 *
 * Example: 200 lines of code → 15 lines of outline
 */

// ============================================================================
// TYPES
// ============================================================================

export interface FileOutline {
  path: string;
  lineCount: number;
  type: 'component' | 'hook' | 'util' | 'type' | 'style' | 'config' | 'page';
  exports: string[];
  imports: ImportInfo[];
  outline: string; // Condensed structure
  estimatedTokens: number;
}

export interface ImportInfo {
  from: string;
  names: string[];
  isDefault: boolean;
}

export interface FunctionInfo {
  name: string;
  params: string[];
  returnType?: string;
  isAsync: boolean;
  isExported: boolean;
}

export interface ComponentInfo {
  name: string;
  props: string[];
  hooks: string[];
  stateVariables: string[];
  isExported: boolean;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const CHARS_PER_TOKEN = 4;

// Files that should always include full content (small configs)
const ALWAYS_FULL_CONTENT = [
  'package.json',
  'tsconfig.json',
  'tailwind.config.ts',
  'vite.config.ts',
];

// Max lines before we use outline instead of full content
const OUTLINE_THRESHOLD_LINES = 50;

// ============================================================================
// PARSING HELPERS
// ============================================================================

/**
 * Extract imports from file content
 */
function extractImports(content: string): ImportInfo[] {
  const imports: ImportInfo[] = [];
  const importRegex = /import\s+(?:(\w+)(?:\s*,\s*)?)?(?:\{([^}]+)\})?\s+from\s+['"]([^'"]+)['"]/g;

  let match;
  while ((match = importRegex.exec(content)) !== null) {
    const defaultImport = match[1];
    const namedImports = match[2];
    const from = match[3];

    const names: string[] = [];
    if (defaultImport) {
      names.push(defaultImport);
    }
    if (namedImports) {
      const named = namedImports.split(',').map(n => n.trim().split(' as ')[0].trim());
      names.push(...named);
    }

    imports.push({
      from,
      names,
      isDefault: !!defaultImport && !namedImports,
    });
  }

  return imports;
}

/**
 * Extract exports from file content
 */
function extractExports(content: string): string[] {
  const exports: string[] = [];

  // Named exports: export const/function/class/type/interface
  const namedExportRegex = /export\s+(?:const|let|var|function|class|type|interface)\s+(\w+)/g;
  let match;
  while ((match = namedExportRegex.exec(content)) !== null) {
    exports.push(match[1]);
  }

  // Default exports: export default
  if (/export\s+default\s+(?:function\s+)?(\w+)?/.test(content)) {
    const defaultMatch = content.match(/export\s+default\s+(?:function\s+)?(\w+)?/);
    if (defaultMatch?.[1]) {
      exports.push(`default:${defaultMatch[1]}`);
    } else {
      exports.push('default');
    }
  }

  return [...new Set(exports)];
}

/**
 * Extract function signatures
 */
function extractFunctions(content: string): FunctionInfo[] {
  const functions: FunctionInfo[] = [];

  // Match function declarations and arrow functions
  const funcRegex = /(?:export\s+)?(async\s+)?(?:function\s+(\w+)|const\s+(\w+)\s*=\s*(?:async\s*)?\([^)]*\)\s*(?::\s*([^=>{]+))?\s*=>)/g;

  let match;
  while ((match = funcRegex.exec(content)) !== null) {
    const isAsync = !!match[1];
    const name = match[2] || match[3];
    const returnType = match[4]?.trim();
    const isExported = match[0].startsWith('export');

    if (name && !name.startsWith('_')) {
      functions.push({
        name,
        params: [], // Could extract params but keeping simple for now
        returnType,
        isAsync,
        isExported,
      });
    }
  }

  return functions;
}

/**
 * Extract React component info
 */
function extractComponentInfo(content: string): ComponentInfo | null {
  // Check if it's a React component
  const componentMatch = content.match(
    /(?:export\s+)?(?:default\s+)?(?:function|const)\s+(\w+)\s*(?::\s*React\.FC)?[^{]*\{/
  );

  if (!componentMatch) return null;

  const name = componentMatch[1];
  if (!name || name[0] !== name[0].toUpperCase()) return null; // Components are PascalCase

  // Extract hooks used
  const hooks: string[] = [];
  const hookMatches = content.matchAll(/\buse\w+\s*\(/g);
  for (const match of hookMatches) {
    const hookName = match[0].replace('(', '').trim();
    if (!hooks.includes(hookName)) {
      hooks.push(hookName);
    }
  }

  // Extract state variables from useState
  const stateVariables: string[] = [];
  const stateMatches = content.matchAll(/const\s+\[(\w+),\s*set\w+\]\s*=\s*useState/g);
  for (const match of stateMatches) {
    stateVariables.push(match[1]);
  }

  // Extract props
  const props: string[] = [];
  const propsMatch = content.match(/(?:interface|type)\s+\w*Props\w*\s*(?:=\s*)?\{([^}]+)\}/);
  if (propsMatch) {
    const propsContent = propsMatch[1];
    const propMatches = propsContent.matchAll(/(\w+)\s*[?:]?\s*:/g);
    for (const match of propMatches) {
      props.push(match[1]);
    }
  }

  const isExported = /export\s+(?:default\s+)?(?:function|const)\s+/.test(
    content.slice(0, componentMatch.index! + componentMatch[0].length)
  );

  return {
    name,
    props,
    hooks,
    stateVariables,
    isExported,
  };
}

/**
 * Determine file type based on content and path
 */
function determineFileType(
  path: string,
  content: string
): FileOutline['type'] {
  const fileName = path.split('/').pop() || '';

  if (path.includes('/pages/')) return 'page';
  if (path.includes('/hooks/') || fileName.startsWith('use')) return 'hook';
  if (path.endsWith('.css') || path.includes('/styles/')) return 'style';
  if (path.includes('/types/') || /^(type|interface)\s+\w+/.test(content)) return 'type';
  if (
    fileName.endsWith('.config.ts') ||
    fileName.endsWith('.config.js') ||
    fileName === 'package.json'
  ) {
    return 'config';
  }

  // Check for React component
  if (/function\s+[A-Z]|const\s+[A-Z]\w+\s*[=:]/.test(content)) {
    return 'component';
  }

  return 'util';
}

// ============================================================================
// MAIN FUNCTIONS
// ============================================================================

/**
 * Generate a condensed outline for a file
 */
export function generateFileOutline(path: string, content: string): FileOutline {
  const lines = content.split('\n');
  const lineCount = lines.length;
  const fileType = determineFileType(path, content);
  const imports = extractImports(content);
  const exports = extractExports(content);
  const functions = extractFunctions(content);
  const component = extractComponentInfo(content);

  // Build outline string
  const outlineParts: string[] = [];

  // Header
  outlineParts.push(`// ${path} (${lineCount} lines, ${fileType})`);

  // Exports
  if (exports.length > 0) {
    outlineParts.push(`// Exports: ${exports.join(', ')}`);
  }

  // Key imports (skip common ones)
  const keyImports = imports.filter(
    i => !['react', 'react-dom', '@/lib/utils'].includes(i.from)
  );
  if (keyImports.length > 0) {
    const importSummary = keyImports
      .slice(0, 5)
      .map(i => `${i.names.slice(0, 3).join(', ')} from '${i.from}'`)
      .join('; ');
    outlineParts.push(`// Imports: ${importSummary}`);
  }

  // Component details
  if (component) {
    if (component.props.length > 0) {
      outlineParts.push(`// Props: { ${component.props.join(', ')} }`);
    }
    if (component.stateVariables.length > 0) {
      outlineParts.push(`// State: ${component.stateVariables.join(', ')}`);
    }
    if (component.hooks.length > 0) {
      outlineParts.push(`// Hooks: ${component.hooks.join(', ')}`);
    }
  }

  // Key functions
  const keyFunctions = functions.filter(f => f.isExported || !f.name.startsWith('handle'));
  if (keyFunctions.length > 0) {
    const funcNames = keyFunctions.slice(0, 8).map(f => `${f.name}()`);
    outlineParts.push(`// Functions: ${funcNames.join(', ')}`);
  }

  const outline = outlineParts.join('\n');

  return {
    path,
    lineCount,
    type: fileType,
    exports,
    imports,
    outline,
    estimatedTokens: Math.ceil(outline.length / CHARS_PER_TOKEN),
  };
}

/**
 * Decide whether to use full content or outline for a file
 */
export function shouldUseOutline(path: string, content: string): boolean {
  const fileName = path.split('/').pop() || '';

  // Always use full content for small config files
  if (ALWAYS_FULL_CONTENT.some(f => fileName === f)) {
    return false;
  }

  // Use outline for large files
  const lineCount = content.split('\n').length;
  return lineCount > OUTLINE_THRESHOLD_LINES;
}

/**
 * Get file content or outline based on size and type
 */
export function getFileContentOrOutline(
  path: string,
  content: string
): { content: string; isOutline: boolean; tokens: number } {
  if (shouldUseOutline(path, content)) {
    const outline = generateFileOutline(path, content);
    return {
      content: outline.outline,
      isOutline: true,
      tokens: outline.estimatedTokens,
    };
  }

  return {
    content,
    isOutline: false,
    tokens: Math.ceil(content.length / CHARS_PER_TOKEN),
  };
}

/**
 * Generate outlines for multiple files
 */
export function generateProjectOutlines(
  files: Record<string, string>
): Map<string, FileOutline> {
  const outlines = new Map<string, FileOutline>();

  for (const [path, content] of Object.entries(files)) {
    outlines.set(path, generateFileOutline(path, content));
  }

  return outlines;
}

/**
 * Get a repository map summary (all file outlines combined)
 */
export function getRepositoryMap(files: Record<string, string>): string {
  const outlines = generateProjectOutlines(files);
  const parts: string[] = ['# Repository Map\n'];

  // Group by type
  const byType = new Map<string, FileOutline[]>();
  for (const outline of outlines.values()) {
    const existing = byType.get(outline.type) || [];
    existing.push(outline);
    byType.set(outline.type, existing);
  }

  // Output by type
  const typeOrder: FileOutline['type'][] = [
    'page',
    'component',
    'hook',
    'util',
    'type',
    'style',
    'config',
  ];

  for (const type of typeOrder) {
    const filesOfType = byType.get(type);
    if (filesOfType && filesOfType.length > 0) {
      parts.push(`\n## ${type.charAt(0).toUpperCase() + type.slice(1)}s`);
      for (const outline of filesOfType) {
        parts.push(outline.outline);
      }
    }
  }

  return parts.join('\n');
}
