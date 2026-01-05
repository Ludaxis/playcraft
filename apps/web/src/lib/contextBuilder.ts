/**
 * Context Builder
 *
 * Smart context selection system that analyzes user intent and selects
 * the most relevant files for AI requests, minimizing tokens while
 * maximizing understanding.
 */

import { getProjectFileHashes, getImportGraph } from './fileHashService';

// ============================================================================
// TYPES
// ============================================================================

export interface ProjectMemory {
  project_summary: string | null;
  game_type: string | null;
  tech_stack: string[];
  completed_tasks: Array<{ task: string; timestamp: string }>;
  file_importance: Record<string, number>;
  key_entities: Array<{ name: string; type: string; file: string }>;
}

export interface ConversationSummary {
  summary_text: string;
  tasks_completed: string[];
  files_modified: string[];
  sequence_number: number;
}

export interface RelevantFile {
  path: string;
  content: string;
  relevanceScore: number;
  relevanceReason: string;
}

export interface ContextPackage {
  // Project understanding
  projectMemory: ProjectMemory | null;

  // Conversation context
  conversationSummaries: string[];
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>;

  // Selected files
  relevantFiles: RelevantFile[];

  // Change tracking
  changedSinceLastRequest: string[];

  // File awareness
  fileTree: string[];

  // Token usage estimate
  estimatedTokens: number;
}

interface FileScore {
  path: string;
  score: number;
  reasons: string[];
}

// ============================================================================
// CONSTANTS
// ============================================================================

const TOKEN_BUDGET = 12000; // Target token limit for context
const CHARS_PER_TOKEN = 4; // Approximate characters per token

// Relevance score weights
const SCORE_MENTIONED_IN_PROMPT = 1.0;
const SCORE_SELECTED_FILE = 0.9;
const SCORE_RECENTLY_MODIFIED = 0.8;
const SCORE_IMPORTED_BY_RELEVANT = 0.7;
const SCORE_MAIN_ENTRY_POINT = 0.6;
const SCORE_KEYWORD_MATCH = 0.5;
const SCORE_HIGH_MODIFICATION_COUNT = 0.4;
const SCORE_TYPE_MATCH = 0.3;

// Important files that should always have some priority
const ENTRY_POINT_FILES = [
  '/src/pages/Index.tsx',
  '/src/pages/GameplayPage.tsx',
  '/src/App.tsx',
];

// ============================================================================
// INTENT ANALYSIS
// ============================================================================

interface UserIntent {
  action: 'create' | 'modify' | 'debug' | 'explain' | 'add' | 'remove' | 'style';
  targetFiles: string[];
  keywords: string[];
  isVisualChange: boolean;
  isStructuralChange: boolean;
}

/**
 * Analyze user prompt to understand intent
 */
function analyzeUserIntent(prompt: string): UserIntent {
  // Determine primary action
  let action: UserIntent['action'] = 'modify';
  if (/^(create|make|build|generate|start)/i.test(prompt)) {
    action = 'create';
  } else if (/fix|debug|error|bug|issue|broken|not working/i.test(prompt)) {
    action = 'debug';
  } else if (/explain|what|how|why|understand/i.test(prompt)) {
    action = 'explain';
  } else if (/add|include|insert|put/i.test(prompt)) {
    action = 'add';
  } else if (/remove|delete|take out|get rid/i.test(prompt)) {
    action = 'remove';
  } else if (/style|color|look|appearance|design|theme|css/i.test(prompt)) {
    action = 'style';
  }

  // Extract mentioned file paths
  const targetFiles: string[] = [];
  const filePathRegex = /(?:\/src\/[\w/.-]+\.(?:tsx?|css|json))|(?:(?:Index|App|GameplayPage)\.tsx)/gi;
  let match;
  while ((match = filePathRegex.exec(prompt)) !== null) {
    let path = match[0];
    if (!path.startsWith('/')) {
      path = `/src/pages/${path}`;
    }
    targetFiles.push(path);
  }

  // Extract keywords for matching
  const keywords: string[] = [];
  const keywordPatterns = [
    // Game elements
    /\b(player|enemy|score|level|game|board|tile|piece|card)\b/gi,
    // Actions
    /\b(move|jump|shoot|collect|spawn|animate|collision)\b/gi,
    // UI elements
    /\b(button|menu|modal|header|footer|sidebar)\b/gi,
    // Technical terms
    /\b(hook|component|function|state|effect|context|store)\b/gi,
  ];

  for (const pattern of keywordPatterns) {
    let match;
    while ((match = pattern.exec(prompt)) !== null) {
      const keyword = match[1].toLowerCase();
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  // Determine change type
  const isVisualChange = /color|style|css|look|appear|theme|background|font|border|shadow|animation/i.test(prompt);
  const isStructuralChange = /add|remove|create|delete|refactor|restructure|move|rename/i.test(prompt);

  return {
    action,
    targetFiles,
    keywords,
    isVisualChange,
    isStructuralChange,
  };
}

// ============================================================================
// FILE SCORING
// ============================================================================

/**
 * Score files based on relevance to user request
 */
async function scoreFiles(
  projectId: string,
  files: Record<string, string>,
  selectedFile: string | undefined,
  recentlyModified: string[],
  intent: UserIntent,
  projectMemory: ProjectMemory | null
): Promise<FileScore[]> {
  const scores: FileScore[] = [];
  await getImportGraph(projectId); // Populate cache for later use
  const fileHashes = await getProjectFileHashes(projectId);

  // Files that are directly relevant (for import chain scoring)
  const directlyRelevant = new Set<string>();

  for (const [path, content] of Object.entries(files)) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Mentioned in prompt
    if (intent.targetFiles.includes(path)) {
      score += SCORE_MENTIONED_IN_PROMPT;
      reasons.push('mentioned in prompt');
      directlyRelevant.add(path);
    }

    // 2. Currently selected file
    if (selectedFile && path === selectedFile) {
      score += SCORE_SELECTED_FILE;
      reasons.push('currently selected');
      directlyRelevant.add(path);
    }

    // 3. Recently modified
    if (recentlyModified.includes(path)) {
      score += SCORE_RECENTLY_MODIFIED;
      reasons.push('recently modified');
    }

    // 4. Main entry point
    if (ENTRY_POINT_FILES.includes(path)) {
      score += SCORE_MAIN_ENTRY_POINT;
      reasons.push('entry point');
    }

    // 5. Keyword match in content
    const lowerContent = content.toLowerCase();
    const matchedKeywords = intent.keywords.filter(kw => lowerContent.includes(kw));
    if (matchedKeywords.length > 0) {
      score += SCORE_KEYWORD_MATCH * Math.min(matchedKeywords.length / 3, 1);
      reasons.push(`keywords: ${matchedKeywords.slice(0, 3).join(', ')}`);
    }

    // 6. High modification count (frequently edited = important)
    const hashInfo = fileHashes.get(path);
    if (hashInfo && hashInfo.modification_count > 3) {
      score += SCORE_HIGH_MODIFICATION_COUNT;
      reasons.push('frequently modified');
    }

    // 7. File importance from memory
    if (projectMemory?.file_importance?.[path]) {
      score += projectMemory.file_importance[path] * 0.3;
      reasons.push('high importance');
    }

    // 8. Type relevance based on action
    if (hashInfo?.file_type) {
      if (intent.action === 'style' && hashInfo.file_type === 'style') {
        score += SCORE_TYPE_MATCH;
        reasons.push('style file for style change');
      } else if (intent.action === 'debug' && hashInfo.file_type === 'page') {
        score += SCORE_TYPE_MATCH;
        reasons.push('page file for debugging');
      }
    }

    scores.push({ path, score, reasons });
  }

  // Second pass: Score files imported by relevant files
  for (const score of scores) {
    if (directlyRelevant.has(score.path)) {
      // Check what this file imports
      const hashInfo = fileHashes.get(score.path);
      if (hashInfo?.imports) {
        for (const importPath of hashInfo.imports) {
          const normalizedPath = normalizeImportPath(score.path, importPath);
          const importedScore = scores.find(s => s.path === normalizedPath);
          if (importedScore) {
            importedScore.score += SCORE_IMPORTED_BY_RELEVANT;
            importedScore.reasons.push(`imported by ${score.path.split('/').pop()}`);
          }
        }
      }
    }
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score);

  return scores;
}

/**
 * Normalize import path to actual file path
 */
function normalizeImportPath(fromFile: string, importPath: string): string {
  if (importPath.startsWith('@/')) {
    return '/src' + importPath.substring(1) + '.tsx';
  }

  if (importPath.startsWith('.')) {
    const dir = fromFile.substring(0, fromFile.lastIndexOf('/'));
    const parts = dir.split('/').filter(Boolean);
    const relParts = importPath.split('/');

    for (const part of relParts) {
      if (part === '..') parts.pop();
      else if (part !== '.') parts.push(part);
    }

    let result = '/' + parts.join('/');
    if (!result.includes('.')) result += '.tsx';
    return result;
  }

  return importPath;
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build a smart context package for AI request
 */
export async function buildContext(
  projectId: string,
  prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  changedFiles: string[],
  projectMemory: ProjectMemory | null,
  conversationSummaries: ConversationSummary[]
): Promise<ContextPackage> {
  // Analyze user intent
  const intent = analyzeUserIntent(prompt);

  // Score all files
  const fileScores = await scoreFiles(
    projectId,
    files,
    selectedFile,
    changedFiles,
    intent,
    projectMemory
  );

  // Select files within token budget
  const relevantFiles: RelevantFile[] = [];
  let tokenEstimate = 0;

  // Reserve tokens for: prompt + memory + summaries + recent messages
  const reservedTokens = 2000;
  const fileTokenBudget = TOKEN_BUDGET - reservedTokens;

  for (const scored of fileScores) {
    if (scored.score <= 0) continue;

    const content = files[scored.path];
    const fileTokens = Math.ceil(content.length / CHARS_PER_TOKEN);

    if (tokenEstimate + fileTokens <= fileTokenBudget) {
      relevantFiles.push({
        path: scored.path,
        content,
        relevanceScore: Math.min(scored.score, 1), // Normalize to 0-1
        relevanceReason: scored.reasons.slice(0, 3).join(', '),
      });
      tokenEstimate += fileTokens;
    }

    // Stop if we have enough files (max 8 for focused context)
    if (relevantFiles.length >= 8) break;
  }

  // Get recent messages (last 5)
  const recentMessages = conversationHistory.slice(-5);

  // Get summary texts
  const summaryTexts = conversationSummaries
    .sort((a, b) => a.sequence_number - b.sequence_number)
    .map(s => s.summary_text);

  // Build file tree (just paths)
  const fileTree = Object.keys(files).sort();

  // Calculate total token estimate
  const memoryTokens = projectMemory
    ? Math.ceil(JSON.stringify(projectMemory).length / CHARS_PER_TOKEN)
    : 0;
  const summaryTokens = Math.ceil(summaryTexts.join('\n').length / CHARS_PER_TOKEN);
  const messageTokens = Math.ceil(
    recentMessages.map(m => m.content).join('\n').length / CHARS_PER_TOKEN
  );

  const totalTokens = tokenEstimate + memoryTokens + summaryTokens + messageTokens + 500; // Buffer

  return {
    projectMemory,
    conversationSummaries: summaryTexts,
    recentMessages,
    relevantFiles,
    changedSinceLastRequest: changedFiles,
    fileTree,
    estimatedTokens: totalTokens,
  };
}

/**
 * Get a minimal context for simple requests (color changes, small tweaks)
 */
export async function buildMinimalContext(
  _projectId: string,
  _prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined
): Promise<ContextPackage> {
  // For simple visual changes, only include the selected file
  const relevantFiles: RelevantFile[] = [];

  if (selectedFile && files[selectedFile]) {
    relevantFiles.push({
      path: selectedFile,
      content: files[selectedFile],
      relevanceScore: 1.0,
      relevanceReason: 'currently selected',
    });
  }

  // Also include main entry point if not already included
  const mainFile = '/src/pages/Index.tsx';
  if (mainFile !== selectedFile && files[mainFile]) {
    relevantFiles.push({
      path: mainFile,
      content: files[mainFile],
      relevanceScore: 0.8,
      relevanceReason: 'main entry point',
    });
  }

  return {
    projectMemory: null,
    conversationSummaries: [],
    recentMessages: [],
    relevantFiles,
    changedSinceLastRequest: [],
    fileTree: Object.keys(files).sort(),
    estimatedTokens: Math.ceil(
      relevantFiles.reduce((sum, f) => sum + f.content.length, 0) / CHARS_PER_TOKEN
    ),
  };
}

/**
 * Determine if a request needs full context or minimal context
 */
export function needsFullContext(prompt: string): boolean {
  // Simple changes that don't need full context
  const simplePatterns = [
    /^(change|make|set).{0,20}(color|colour|background|font|size|text) to/i,
    /^(increase|decrease|make).{0,20}(bigger|smaller|larger|wider|taller)/i,
    /^(fix|correct).{0,20}(typo|spelling|text)/i,
    /^rename .{0,30} to/i,
  ];

  for (const pattern of simplePatterns) {
    if (pattern.test(prompt)) {
      return false;
    }
  }

  // Complex changes that need full context
  const complexPatterns = [
    /add.{0,20}(feature|system|component)/i,
    /create.{0,20}(new|game|level|mode)/i,
    /integrate|connect|combine/i,
    /refactor|restructure|reorganize/i,
    /debug|fix.{0,20}(bug|error|issue)/i,
  ];

  for (const pattern of complexPatterns) {
    if (pattern.test(prompt)) {
      return true;
    }
  }

  // Default to full context for safety
  return true;
}

/**
 * Estimate tokens for a context package
 */
export function estimateTokens(context: ContextPackage): number {
  let total = 0;

  // Files
  for (const file of context.relevantFiles) {
    total += Math.ceil(file.content.length / CHARS_PER_TOKEN);
  }

  // Memory
  if (context.projectMemory) {
    total += Math.ceil(JSON.stringify(context.projectMemory).length / CHARS_PER_TOKEN);
  }

  // Summaries
  total += Math.ceil(context.conversationSummaries.join('\n').length / CHARS_PER_TOKEN);

  // Messages
  for (const msg of context.recentMessages) {
    total += Math.ceil(msg.content.length / CHARS_PER_TOKEN);
  }

  // File tree (compact)
  total += Math.ceil(context.fileTree.join('\n').length / CHARS_PER_TOKEN);

  return total;
}
