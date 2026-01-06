/**
 * Context Builder
 *
 * Smart context selection system that analyzes user intent and selects
 * the most relevant files for AI requests, minimizing tokens while
 * maximizing understanding.
 */

import { getProjectFileHashes, getImportGraph } from './fileHashService';
import { getFileContentOrOutline, generateFileOutline } from './astOutlineService';

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
  isOutline?: boolean; // Whether content is an outline (not full code)
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

  // Context mode used
  contextMode: 'full' | 'minimal' | 'outline';
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
const TOKEN_BUDGET_MINIMAL = 3000; // Budget for simple requests
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

export type IntentAction =
  | 'create'    // New project/game from scratch
  | 'modify'    // General modifications
  | 'debug'     // Fix bugs/errors
  | 'explain'   // Answer questions
  | 'add'       // Add new features
  | 'remove'    // Remove features
  | 'style'     // Visual/CSS changes only
  | 'rename'    // Rename things
  | 'tweak';    // Small value changes (colors, sizes, text)

interface UserIntent {
  action: IntentAction;
  targetFiles: string[];
  keywords: string[];
  isVisualChange: boolean;
  isStructuralChange: boolean;
  isTrivialChange: boolean; // Can be done with minimal context
  confidence: number; // 0-1 confidence in classification
}

/**
 * Analyze user prompt to understand intent
 */
function analyzeUserIntent(prompt: string): UserIntent {
  const lowerPrompt = prompt.toLowerCase();
  let action: IntentAction = 'modify';
  let confidence = 0.5;

  // ============================================
  // TRIVIAL CHANGES - can be done with minimal context
  // ============================================
  const trivialPatterns = [
    // Color changes
    /^(change|make|set|update)\s+(?:the\s+)?(?:\w+\s+)?(?:color|colour)\s+(?:to|from)/i,
    /^(?:change|make)\s+(?:it|this|the\s+\w+)\s+(?:to\s+)?(?:red|blue|green|yellow|purple|orange|pink|white|black|gray|grey)/i,
    // Size changes
    /^(make|change)\s+(?:it|this|the\s+\w+)\s+(bigger|smaller|larger|wider|taller|shorter)/i,
    /^(increase|decrease)\s+(?:the\s+)?(?:size|width|height|font|padding|margin)/i,
    // Text changes
    /^(change|update|fix)\s+(?:the\s+)?(?:text|title|label|button\s+text)\s+(?:to|from)/i,
    /^rename\s+["']?[\w\s]+["']?\s+to\s+["']?[\w\s]+["']?/i,
    // Simple value changes
    /^(set|change)\s+(?:the\s+)?(?:speed|delay|duration|interval|timeout)\s+to\s+\d+/i,
    // Typo fixes
    /^fix\s+(?:the\s+)?(?:typo|spelling|text)/i,
  ];

  const isTrivialChange = trivialPatterns.some(p => p.test(prompt));

  // ============================================
  // ACTION CLASSIFICATION with confidence scoring
  // ============================================

  // Tweak - highest priority for trivial changes
  if (isTrivialChange) {
    action = 'tweak';
    confidence = 0.9;
  }
  // Create - new project from scratch
  else if (/^(create|make|build|generate)\s+(a\s+)?(new\s+)?/i.test(prompt) &&
           /game|app|project|component/i.test(prompt)) {
    action = 'create';
    confidence = 0.85;
  }
  // Debug - fix errors
  else if (/\b(fix|debug|error|bug|issue|broken|crash|not working|doesn't work|won't)\b/i.test(prompt)) {
    action = 'debug';
    confidence = 0.8;
  }
  // Explain - questions
  else if (/^(what|how|why|explain|tell me|can you explain|describe)/i.test(prompt)) {
    action = 'explain';
    confidence = 0.9;
  }
  // Style - visual only
  else if (/\b(style|css|look|appearance|design|theme|color|colour|font|ui|visual)\b/i.test(prompt) &&
           !/\b(add|create|new|feature|function)\b/i.test(prompt)) {
    action = 'style';
    confidence = 0.75;
  }
  // Rename
  else if (/^rename\b/i.test(prompt)) {
    action = 'rename';
    confidence = 0.9;
  }
  // Remove
  else if (/\b(remove|delete|get rid of|take out|drop)\b/i.test(prompt)) {
    action = 'remove';
    confidence = 0.8;
  }
  // Add - new features
  else if (/\b(add|include|insert|implement|create)\b/i.test(prompt)) {
    action = 'add';
    confidence = 0.7;
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
    /\b(player|enemy|score|level|game|board|tile|piece|card|ball|paddle|snake|food)\b/gi,
    // Actions
    /\b(move|jump|shoot|collect|spawn|animate|collision|click|tap|drag)\b/gi,
    // UI elements
    /\b(button|menu|modal|header|footer|sidebar|panel|screen|page)\b/gi,
    // Technical terms
    /\b(hook|component|function|state|effect|context|store|props|ref)\b/gi,
    // Visual terms
    /\b(color|size|font|border|background|shadow|margin|padding|width|height)\b/gi,
  ];

  for (const pattern of keywordPatterns) {
    let kwMatch;
    while ((kwMatch = pattern.exec(prompt)) !== null) {
      const keyword = kwMatch[1].toLowerCase();
      if (!keywords.includes(keyword)) {
        keywords.push(keyword);
      }
    }
  }

  // Determine change types
  const isVisualChange = /color|style|css|look|appear|theme|background|font|border|shadow|animation|ui|visual/i.test(prompt);
  const isStructuralChange = /add|remove|create|delete|refactor|restructure|move|new\s+(?:feature|component|function)/i.test(prompt);

  return {
    action,
    targetFiles,
    keywords,
    isVisualChange,
    isStructuralChange,
    isTrivialChange,
    confidence,
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

  console.log(`[ContextBuilder] Intent: ${intent.action} (confidence: ${intent.confidence.toFixed(2)}), trivial: ${intent.isTrivialChange}`);

  // ============================================
  // MINIMAL CONTEXT for trivial/simple changes
  // ============================================
  if (intent.isTrivialChange || intent.action === 'tweak') {
    console.log('[ContextBuilder] Using MINIMAL context mode');
    return buildMinimalContextInternal(
      files,
      selectedFile,
      conversationHistory.slice(-2), // Only last 2 messages
      projectMemory
    );
  }

  // ============================================
  // OUTLINE MODE for style/explain actions
  // ============================================
  const useOutlines = intent.action === 'style' || intent.action === 'explain';

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

  // Adjust budget based on action type
  const tokenBudget = useOutlines ? TOKEN_BUDGET_MINIMAL * 2 : TOKEN_BUDGET;
  const reservedTokens = 2000;
  const fileTokenBudget = tokenBudget - reservedTokens;

  // Determine max files based on action
  const maxFiles = intent.action === 'debug' ? 5 :
                   intent.action === 'style' ? 3 :
                   intent.action === 'explain' ? 2 : 8;

  for (const scored of fileScores) {
    if (scored.score <= 0) continue;

    const content = files[scored.path];

    // Use outline for large files when appropriate
    let fileContent: string;
    let isOutline = false;

    if (useOutlines || content.split('\n').length > 100) {
      const result = getFileContentOrOutline(scored.path, content);
      fileContent = result.content;
      isOutline = result.isOutline;
    } else {
      fileContent = content;
    }

    const fileTokens = Math.ceil(fileContent.length / CHARS_PER_TOKEN);

    if (tokenEstimate + fileTokens <= fileTokenBudget) {
      relevantFiles.push({
        path: scored.path,
        content: fileContent,
        relevanceScore: Math.min(scored.score, 1),
        relevanceReason: scored.reasons.slice(0, 3).join(', ') + (isOutline ? ' [outline]' : ''),
        isOutline,
      });
      tokenEstimate += fileTokens;
    }

    if (relevantFiles.length >= maxFiles) break;
  }

  // Get recent messages (fewer for simple actions)
  const recentMessageCount = intent.action === 'explain' ? 3 : 5;
  const recentMessages = conversationHistory.slice(-recentMessageCount);

  // Get summary texts (skip for trivial)
  const summaryTexts = intent.isTrivialChange ? [] :
    conversationSummaries
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

  const totalTokens = tokenEstimate + memoryTokens + summaryTokens + messageTokens + 500;

  const contextMode = useOutlines ? 'outline' : 'full';
  console.log(`[ContextBuilder] Built ${contextMode} context: ${relevantFiles.length} files, ~${totalTokens} tokens`);

  return {
    projectMemory,
    conversationSummaries: summaryTexts,
    recentMessages,
    relevantFiles,
    contextMode,
    changedSinceLastRequest: changedFiles,
    fileTree,
    estimatedTokens: totalTokens,
  };
}

/**
 * Internal helper for minimal context building
 */
function buildMinimalContextInternal(
  files: Record<string, string>,
  selectedFile: string | undefined,
  recentMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  projectMemory: ProjectMemory | null
): ContextPackage {
  const relevantFiles: RelevantFile[] = [];

  // Only include main entry point (where game code is)
  const mainFile = '/src/pages/Index.tsx';
  if (files[mainFile]) {
    relevantFiles.push({
      path: mainFile,
      content: files[mainFile],
      relevanceScore: 1.0,
      relevanceReason: 'main game file',
      isOutline: false,
    });
  }

  // If a different file is selected, include it too
  if (selectedFile && selectedFile !== mainFile && files[selectedFile]) {
    relevantFiles.push({
      path: selectedFile,
      content: files[selectedFile],
      relevanceScore: 0.9,
      relevanceReason: 'currently selected',
      isOutline: false,
    });
  }

  const tokenEstimate = Math.ceil(
    relevantFiles.reduce((sum, f) => sum + f.content.length, 0) / CHARS_PER_TOKEN
  );

  console.log(`[ContextBuilder] MINIMAL context: ${relevantFiles.length} file(s), ~${tokenEstimate} tokens`);

  return {
    projectMemory: projectMemory ? {
      project_summary: projectMemory.project_summary,
      game_type: projectMemory.game_type,
      tech_stack: projectMemory.tech_stack,
      completed_tasks: [], // Skip for minimal
      file_importance: {},
      key_entities: [],
    } : null,
    conversationSummaries: [], // Skip summaries for minimal
    recentMessages,
    relevantFiles,
    changedSinceLastRequest: [],
    fileTree: [], // Skip file tree for minimal
    estimatedTokens: tokenEstimate,
    contextMode: 'minimal',
  };
}

/**
 * Get a minimal context for simple requests (color changes, small tweaks)
 * @deprecated Use buildContext with proper intent detection instead
 */
export async function buildMinimalContext(
  _projectId: string,
  _prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined
): Promise<ContextPackage> {
  return buildMinimalContextInternal(files, selectedFile, [], null);
}

/**
 * Determine if a request needs full context or minimal context
 * Uses the same intent classification as buildContext
 */
export function needsFullContext(prompt: string): boolean {
  const intent = analyzeUserIntent(prompt);

  // Trivial changes don't need full context
  if (intent.isTrivialChange) {
    return false;
  }

  // Actions that need minimal/outline context
  const minimalActions: IntentAction[] = ['tweak', 'style', 'rename', 'explain'];
  if (minimalActions.includes(intent.action)) {
    return false;
  }

  // Actions that definitely need full context
  const fullContextActions: IntentAction[] = ['create', 'add', 'debug', 'remove'];
  if (fullContextActions.includes(intent.action)) {
    return true;
  }

  // Default to full context for safety
  return true;
}

/**
 * Get the recommended context mode for a prompt
 */
export function getRecommendedContextMode(prompt: string): 'full' | 'minimal' | 'outline' {
  const intent = analyzeUserIntent(prompt);

  if (intent.isTrivialChange || intent.action === 'tweak') {
    return 'minimal';
  }

  if (intent.action === 'style' || intent.action === 'explain') {
    return 'outline';
  }

  return 'full';
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
