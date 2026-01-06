/**
 * Query Enhancer
 *
 * Enhances user queries for better semantic search results.
 * - Expands common abbreviations
 * - Adds context from selected files
 * - Includes related action terms
 *
 * All rule-based (no AI calls) for speed and cost efficiency.
 */

// ============================================================================
// CONFIGURATION
// ============================================================================

/**
 * Common abbreviations and their expansions
 */
const ABBREVIATION_EXPANSIONS: Record<string, string> = {
  // UI Elements
  btn: 'button',
  msg: 'message',
  nav: 'navigation navigate',
  hdr: 'header',
  ftr: 'footer',
  dlg: 'dialog modal',
  mdl: 'modal dialog',
  txt: 'text',
  img: 'image',
  lbl: 'label',
  inp: 'input',

  // Technical
  err: 'error',
  cfg: 'config configuration',
  auth: 'authentication authorize',
  api: 'API endpoint',
  db: 'database',
  req: 'request',
  res: 'response',
  fn: 'function',
  cb: 'callback',
  ctx: 'context',
  ref: 'reference',
  var: 'variable',
  obj: 'object',
  arr: 'array',
  str: 'string',
  num: 'number',
  bool: 'boolean',

  // Styling
  bg: 'background',
  fg: 'foreground',
  clr: 'color',
  sz: 'size',
  wd: 'width',
  ht: 'height',
  mrgn: 'margin',
  pdng: 'padding',

  // Game-specific
  plyr: 'player',
  scr: 'score',
  lvl: 'level',
  gm: 'game',
  anim: 'animation',
  spr: 'sprite',
  coll: 'collision',
  phys: 'physics',
  ctrl: 'control controller',
};

/**
 * Action verbs and related search terms
 */
const ACTION_TERMS: Record<string, string[]> = {
  fix: ['bug', 'error', 'issue', 'debug', 'problem'],
  debug: ['bug', 'error', 'issue', 'fix', 'problem', 'console'],
  add: ['create', 'implement', 'new', 'feature'],
  create: ['add', 'implement', 'new', 'generate'],
  remove: ['delete', 'cleanup', 'drop', 'clear'],
  delete: ['remove', 'cleanup', 'drop', 'clear'],
  change: ['modify', 'update', 'edit', 'alter'],
  update: ['modify', 'change', 'edit', 'refresh'],
  style: ['css', 'tailwind', 'design', 'layout', 'appearance'],
  refactor: ['restructure', 'reorganize', 'cleanup', 'optimize'],
  optimize: ['performance', 'speed', 'efficiency', 'improve'],
  move: ['relocate', 'transfer', 'position'],
  rename: ['change name', 'update name'],
  test: ['testing', 'spec', 'unit', 'validate'],
};

/**
 * Game-related term expansions
 */
const GAME_TERM_EXPANSIONS: Record<string, string[]> = {
  player: ['character', 'hero', 'avatar', 'user'],
  enemy: ['opponent', 'npc', 'mob', 'foe'],
  score: ['points', 'counter', 'tally'],
  level: ['stage', 'map', 'world', 'scene'],
  collision: ['hit', 'overlap', 'intersect', 'detect'],
  movement: ['motion', 'position', 'velocity', 'direction'],
  input: ['keyboard', 'mouse', 'touch', 'controls'],
  audio: ['sound', 'music', 'sfx', 'effects'],
  visual: ['graphics', 'render', 'display', 'draw'],
};

// ============================================================================
// PUBLIC API
// ============================================================================

/**
 * Enhance a user query for better semantic search results
 *
 * @param query - The original user query
 * @param selectedFile - Currently selected file (optional)
 * @param recentFiles - Recently modified files (optional)
 * @returns Enhanced query with expanded terms
 */
export function enhanceQueryForSearch(
  query: string,
  selectedFile?: string,
  recentFiles?: string[]
): string {
  let enhanced = query;

  // 1. Add file context if not already mentioned
  if (selectedFile) {
    const fileName = extractFileName(selectedFile);
    if (fileName && !query.toLowerCase().includes(fileName.toLowerCase())) {
      enhanced = `${enhanced} (in ${fileName})`;
    }
  }

  // 2. Expand abbreviations
  enhanced = expandAbbreviations(enhanced);

  // 3. Add action-related terms
  enhanced = addActionTerms(enhanced);

  // 4. Add game-specific terms
  enhanced = addGameTerms(enhanced);

  // 5. Add context from recent files (if relevant)
  if (recentFiles && recentFiles.length > 0) {
    const recentFileHints = extractRelevantFileHints(query, recentFiles);
    if (recentFileHints) {
      enhanced = `${enhanced} ${recentFileHints}`;
    }
  }

  return enhanced.trim();
}

/**
 * Get a simpler enhanced query (less aggressive expansion)
 * Use when you want minimal changes
 */
export function enhanceQueryMinimal(query: string): string {
  return expandAbbreviations(query);
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

/**
 * Extract just the file name (without path and extension)
 */
function extractFileName(filePath: string): string | null {
  const parts = filePath.split('/');
  const fileName = parts[parts.length - 1];
  return fileName?.replace(/\.(tsx?|jsx?|css|json)$/, '') || null;
}

/**
 * Expand common abbreviations in the query
 */
function expandAbbreviations(query: string): string {
  let result = query;

  for (const [abbr, expansion] of Object.entries(ABBREVIATION_EXPANSIONS)) {
    // Match word boundaries to avoid partial matches
    const regex = new RegExp(`\\b${abbr}\\b`, 'gi');
    if (regex.test(result)) {
      // Keep original + add expansion
      result = result.replace(regex, `${abbr} ${expansion}`);
    }
  }

  return result;
}

/**
 * Add related terms based on action verbs in the query
 */
function addActionTerms(query: string): string {
  const queryLower = query.toLowerCase();
  const addedTerms: string[] = [];

  for (const [action, terms] of Object.entries(ACTION_TERMS)) {
    if (queryLower.includes(action)) {
      // Add terms not already in query
      const newTerms = terms.filter(
        (t) => !queryLower.includes(t) && !addedTerms.includes(t)
      );
      // Limit to 2 terms per action
      addedTerms.push(...newTerms.slice(0, 2));
      break; // Only match first action
    }
  }

  if (addedTerms.length > 0) {
    return `${query} ${addedTerms.join(' ')}`;
  }

  return query;
}

/**
 * Add game-specific related terms
 */
function addGameTerms(query: string): string {
  const queryLower = query.toLowerCase();
  const addedTerms: string[] = [];

  for (const [term, expansions] of Object.entries(GAME_TERM_EXPANSIONS)) {
    if (queryLower.includes(term)) {
      // Add one expansion not already in query
      const newTerm = expansions.find(
        (t) => !queryLower.includes(t) && !addedTerms.includes(t)
      );
      if (newTerm) {
        addedTerms.push(newTerm);
      }
    }
  }

  if (addedTerms.length > 0) {
    return `${query} ${addedTerms.slice(0, 3).join(' ')}`;
  }

  return query;
}

/**
 * Extract relevant hints from recent files based on query
 */
function extractRelevantFileHints(
  query: string,
  recentFiles: string[]
): string | null {
  const queryLower = query.toLowerCase();

  // Look for file names that might be related to the query
  const relevantFileNames: string[] = [];

  for (const file of recentFiles.slice(0, 5)) {
    const fileName = extractFileName(file);
    if (!fileName) continue;

    // Check if file name contains any query words
    const queryWords = queryLower.split(/\s+/).filter((w) => w.length > 2);
    const fileNameLower = fileName.toLowerCase();

    for (const word of queryWords) {
      if (fileNameLower.includes(word) && !queryLower.includes(fileName)) {
        relevantFileNames.push(fileName);
        break;
      }
    }
  }

  if (relevantFileNames.length > 0) {
    return `related: ${relevantFileNames.slice(0, 2).join(', ')}`;
  }

  return null;
}
