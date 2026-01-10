/**
 * Context Builder
 *
 * Smart context selection system that analyzes user intent and selects
 * the most relevant files for AI requests, minimizing tokens while
 * maximizing understanding.
 */

import { getProjectFileHashes, getImportGraph } from './fileHashService';
import { getFileContentOrOutline } from './astOutlineService';
import { semanticCodeSearch } from './embeddingService';
import { enhanceQueryForSearch } from './queryEnhancer';
import { getAdaptiveWeights } from './adaptiveWeights';
import { getSupabase } from './supabase';
import {
  getTaskContext,
  formatTaskContextForPrompt,
  type TaskContext,
} from './taskLedgerService';
import {
  getAssetManifest,
  formatAssetManifestForPrompt,
  formatAssetManifestCompact,
} from './assetManifestService';
import type { AssetManifest } from '../types/assets';

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

  // Task ledger (current goal, substeps, blockers, recent deltas)
  taskContext?: TaskContext;
  taskContextFormatted?: string; // Pre-formatted for prompt injection

  // Structured plan for complex tasks (Phase 4.5)
  structuredPlan?: StructuredPlan;
  structuredPlanFormatted?: string; // Pre-formatted for prompt injection

  // Asset manifest (for AI to use uploaded assets)
  assetManifest?: AssetManifest;
  assetManifestFormatted?: string; // Pre-formatted for prompt injection

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

  // Token budget used (Phase 4.4)
  tokenBudget: number;

  // Context mode used
  contextMode: 'full' | 'minimal' | 'outline';

  // Classification info (for learning/analytics)
  classification?: {
    intentType: IntentAction;
    contextMode: 'full' | 'minimal' | 'outline';
    usedSemanticSearch: boolean;
    confidence: number;
  };
}

export interface HybridRetrievalOptions {
  /** Enable semantic search using embeddings */
  enableSemanticSearch?: boolean;
  /** Voyage AI API key for embeddings */
  voyageApiKey?: string;
  /** Weight for semantic similarity score (0-1) */
  semanticWeight?: number;
  /** Weight for keyword/path matching score (0-1) */
  keywordWeight?: number;
  /** Weight for recency score (0-1) */
  recencyWeight?: number;
  /** Weight for importance score (0-1) */
  importanceWeight?: number;
  /** Minimum similarity threshold for semantic matches */
  similarityThreshold?: number;
}

// ============================================================================
// PREFLIGHT COST ESTIMATION (Phase 4.4)
// ============================================================================

export interface PreflightEstimate {
  /** Total estimated tokens for this request */
  estimatedTokens: number;
  /** Token budget based on intent */
  tokenBudget: number;
  /** Whether request fits within budget */
  withinBudget: boolean;
  /** Recommended context mode */
  recommendedMode: 'full' | 'minimal' | 'outline';
  /** Breakdown by category */
  breakdown: {
    filesTokens: number;
    memoryTokens: number;
    conversationTokens: number;
    taskContextTokens: number;
    reservedTokens: number;
  };
  /** Number of files that would be included */
  filesToInclude: number;
  /** Intent classification */
  intent: IntentAction;
}

/**
 * Estimate token cost before building full context (Phase 4.4)
 *
 * This allows the caller to:
 * 1. Warn user if request will exceed budget
 * 2. Adjust context selection strategy
 * 3. Choose between full/outline/minimal modes
 */
export function preflightEstimate(
  prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  projectMemory: ProjectMemory | null
): PreflightEstimate {
  // Analyze intent
  const intent = analyzeUserIntent(prompt);
  const tokenBudget = TOKEN_BUDGETS[intent.action];

  // Estimate file tokens (top files by rough scoring)
  const filePaths = Object.keys(files);
  const estimatedFilesCount = Math.min(
    filePaths.length,
    intent.isTrivialChange ? 2 : intent.action === 'create' ? 10 : 6
  );

  // Sample top files for size estimation
  const sortedFiles = filePaths
    .map(path => ({ path, size: files[path].length }))
    .sort((a, b) => {
      // Prioritize selected file
      if (a.path === selectedFile) return -1;
      if (b.path === selectedFile) return 1;
      // Then entry points
      if (ENTRY_POINT_FILES.includes(a.path)) return -1;
      if (ENTRY_POINT_FILES.includes(b.path)) return 1;
      return 0;
    });

  const topFiles = sortedFiles.slice(0, estimatedFilesCount);
  const filesTokens = Math.ceil(
    topFiles.reduce((sum, f) => sum + f.size, 0) / CHARS_PER_TOKEN
  );

  // Estimate memory tokens
  const memoryTokens = projectMemory
    ? Math.ceil(JSON.stringify(projectMemory).length / CHARS_PER_TOKEN)
    : 0;

  // Estimate conversation tokens (last N messages based on intent)
  const messageCount = intent.isTrivialChange ? 2 : intent.action === 'explain' ? 3 : 5;
  const recentMessages = conversationHistory.slice(-messageCount);
  const conversationTokens = Math.ceil(
    recentMessages.reduce((sum, m) => sum + m.content.length, 0) / CHARS_PER_TOKEN
  );

  // Task context is typically 200-500 tokens
  const taskContextTokens = 300;

  const totalEstimate = filesTokens + memoryTokens + conversationTokens +
                        taskContextTokens + RESERVED_TOKENS;

  // Determine recommended mode
  let recommendedMode: 'full' | 'minimal' | 'outline';
  if (intent.isTrivialChange || intent.action === 'tweak') {
    recommendedMode = 'minimal';
  } else if (totalEstimate > tokenBudget * 1.5) {
    recommendedMode = 'outline';
  } else {
    recommendedMode = 'full';
  }

  return {
    estimatedTokens: totalEstimate,
    tokenBudget,
    withinBudget: totalEstimate <= tokenBudget,
    recommendedMode,
    breakdown: {
      filesTokens,
      memoryTokens,
      conversationTokens,
      taskContextTokens,
      reservedTokens: RESERVED_TOKENS,
    },
    filesToInclude: estimatedFilesCount,
    intent: intent.action,
  };
}

// ============================================================================
// STRUCTURED PLANNER OUTPUT (Phase 4.5)
// ============================================================================

export interface PlanStep {
  /** Step number (1-indexed) */
  stepNumber: number;
  /** Description of what to do */
  description: string;
  /** Files involved in this step */
  files: string[];
  /** Type of operation */
  operation: 'create' | 'modify' | 'delete' | 'move';
  /** Estimated complexity (1-5) */
  complexity: number;
  /** Dependencies on other steps */
  dependsOn: number[];
}

export interface StructuredPlan {
  /** Overall goal */
  goal: string;
  /** Numbered steps with file assignments */
  steps: PlanStep[];
  /** Total estimated complexity */
  totalComplexity: number;
  /** Files that will be modified */
  affectedFiles: string[];
  /** Recommended execution order */
  executionOrder: number[];
}

/**
 * Generate a structured plan for complex tasks (Phase 4.5)
 *
 * This helps the AI:
 * 1. Break down complex tasks into numbered steps
 * 2. Identify specific files for each step
 * 3. Track progress through multi-turn conversations
 */
export function generateStructuredPlan(
  prompt: string,
  files: Record<string, string>,
  projectMemory: ProjectMemory | null
): StructuredPlan | null {
  const intent = analyzeUserIntent(prompt);

  // Only generate plans for complex tasks
  if (intent.isTrivialChange || intent.action === 'tweak' || intent.action === 'explain') {
    return null;
  }

  // Extract file paths
  const filePaths = Object.keys(files);

  // Use project memory to enhance plan (e.g., prioritize known important files)
  const importantFiles = projectMemory?.file_importance || {};

  // Determine affected files based on intent and keywords
  const affectedFiles = filePaths
    .filter(path => {
      // Entry points are often affected
      if (ENTRY_POINT_FILES.includes(path)) return true;

      // Check if file matches keywords
      const fileName = path.toLowerCase();
      return intent.keywords.some(kw => fileName.includes(kw));
    })
    // Sort by importance from project memory (most important first)
    .sort((a, b) => (importantFiles[b] || 0) - (importantFiles[a] || 0));

  // Build initial plan structure (to be refined by AI)
  const steps: PlanStep[] = [];

  // Create step based on action type
  switch (intent.action) {
    case 'create':
      steps.push({
        stepNumber: 1,
        description: 'Set up base structure and types',
        files: ['/src/pages/Index.tsx'],
        operation: 'modify',
        complexity: 3,
        dependsOn: [],
      });
      steps.push({
        stepNumber: 2,
        description: 'Implement core game logic',
        files: affectedFiles.length > 0 ? affectedFiles : ['/src/pages/Index.tsx'],
        operation: 'modify',
        complexity: 4,
        dependsOn: [1],
      });
      steps.push({
        stepNumber: 3,
        description: 'Add styling and polish',
        files: ['/src/index.css'],
        operation: 'modify',
        complexity: 2,
        dependsOn: [2],
      });
      break;

    case 'add':
      steps.push({
        stepNumber: 1,
        description: 'Add feature implementation',
        files: affectedFiles.length > 0 ? affectedFiles : ['/src/pages/Index.tsx'],
        operation: 'modify',
        complexity: 3,
        dependsOn: [],
      });
      if (intent.isVisualChange) {
        steps.push({
          stepNumber: 2,
          description: 'Update styles for new feature',
          files: ['/src/index.css'],
          operation: 'modify',
          complexity: 2,
          dependsOn: [1],
        });
      }
      break;

    case 'debug':
      steps.push({
        stepNumber: 1,
        description: 'Identify and fix the issue',
        files: affectedFiles.length > 0 ? affectedFiles : ['/src/pages/Index.tsx'],
        operation: 'modify',
        complexity: 3,
        dependsOn: [],
      });
      steps.push({
        stepNumber: 2,
        description: 'Verify fix and add error handling',
        files: affectedFiles,
        operation: 'modify',
        complexity: 2,
        dependsOn: [1],
      });
      break;

    case 'modify':
    case 'remove':
    case 'style':
    case 'rename':
      steps.push({
        stepNumber: 1,
        description: `${intent.action} requested changes`,
        files: affectedFiles.length > 0 ? affectedFiles : ['/src/pages/Index.tsx'],
        operation: intent.action === 'remove' ? 'delete' : 'modify',
        complexity: intent.action === 'style' ? 2 : 3,
        dependsOn: [],
      });
      break;
  }

  // Calculate execution order (topological sort based on dependencies)
  const executionOrder = steps.map(s => s.stepNumber);

  // Calculate total complexity
  const totalComplexity = steps.reduce((sum, s) => sum + s.complexity, 0);

  return {
    goal: prompt.substring(0, 200),
    steps,
    totalComplexity,
    affectedFiles: [...new Set(steps.flatMap(s => s.files))],
    executionOrder,
  };
}

/**
 * Format structured plan for AI prompt injection
 */
export function formatPlanForPrompt(plan: StructuredPlan): string {
  const lines: string[] = [
    '## Execution Plan',
    `Goal: ${plan.goal}`,
    '',
    '### Steps:',
  ];

  for (const step of plan.steps) {
    lines.push(`${step.stepNumber}. ${step.description}`);
    lines.push(`   Files: ${step.files.join(', ')}`);
    lines.push(`   Operation: ${step.operation}`);
    if (step.dependsOn.length > 0) {
      lines.push(`   After: step ${step.dependsOn.join(', ')}`);
    }
    lines.push('');
  }

  return lines.join('\n');
}

interface FileScore {
  path: string;
  score: number;
  reasons: string[];
  semanticScore?: number; // Score from embedding similarity
  keywordScore?: number; // Score from keyword matching
  recencyScore?: number; // Score from modification time
  importanceScore?: number; // Score from file importance
}

// Default weights for hybrid retrieval
const DEFAULT_HYBRID_WEIGHTS = {
  semanticWeight: 0.4,
  keywordWeight: 0.2,
  recencyWeight: 0.25,
  importanceWeight: 0.15,
  similarityThreshold: 0.4,
};

// ============================================================================
// CONSTANTS
// ============================================================================

const CHARS_PER_TOKEN = 4; // Approximate characters per token

// Intent-based token budgets (Phase 4.4)
const TOKEN_BUDGETS: Record<IntentAction, number> = {
  create: 15000,   // New projects need more context
  add: 12000,      // Adding features needs good context
  modify: 10000,   // General modifications
  debug: 8000,     // Debugging needs focused context
  remove: 6000,    // Removing features needs less
  style: 10000,    // Style changes need full context to preserve existing design
  explain: 4000,   // Explanations don't need as much code
  rename: 3000,    // Renaming is very targeted
  tweak: 5000,     // Tweaks need some context to avoid breaking things
};

// Reserved tokens for system prompt, response buffer, etc.
const RESERVED_TOKENS = 2000;

// Relevance score weights
const SCORE_MENTIONED_IN_PROMPT = 1.0;
const SCORE_SELECTED_FILE = 0.9;
const SCORE_RECENTLY_MODIFIED = 0.8;
const SCORE_DIRECT_DEPENDENCY = 0.8;    // File is imported by target
const SCORE_IMPORTED_BY_RELEVANT = 0.7;
const SCORE_REVERSE_DEPENDENCY = 0.6;   // File imports the target
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
// DEPENDENCY CONTEXT
// ============================================================================

interface DependencyContext {
  imports: string[];      // Files this file imports (dependencies)
  importers: string[];    // Files that import this file (dependents)
}

/**
 * Get dependency context for target files from the database
 * Returns both direct dependencies and reverse dependents
 */
async function getDependencyContext(
  projectId: string,
  targetFiles: string[]
): Promise<Map<string, DependencyContext>> {
  const result = new Map<string, DependencyContext>();

  if (targetFiles.length === 0) {
    return result;
  }

  const supabase = getSupabase();

  for (const filePath of targetFiles) {
    if (!filePath) continue;

    try {
      // Get files this file imports (dependencies)
      const { data: deps } = await supabase
        .rpc('get_file_dependencies', {
          p_project_id: projectId,
          p_file_path: filePath,
        });

      // Get files that import this file (dependents/importers)
      const { data: dependents } = await supabase
        .rpc('get_file_dependents', {
          p_project_id: projectId,
          p_file_path: filePath,
        });

      result.set(filePath, {
        imports: deps?.map((d: { dependency_file: string }) => d.dependency_file) || [],
        importers: dependents?.map((d: { dependent_file: string }) => d.dependent_file) || [],
      });
    } catch (error) {
      console.warn(`[ContextBuilder] Error getting dependency context for ${filePath}:`, error);
      result.set(filePath, { imports: [], importers: [] });
    }
  }

  console.log(`[ContextBuilder] Dependency context for ${targetFiles.length} files:`,
    Array.from(result.entries()).map(([f, ctx]) => ({
      file: f.split('/').pop(),
      imports: ctx.imports.length,
      importers: ctx.importers.length,
    }))
  );

  return result;
}

/**
 * Apply dependency boosts to file scores (used even without semantic search)
 */
function applyDependencyBoosts(
  fileScores: FileScore[],
  dependencyContext: Map<string, DependencyContext>
): void {
  if (dependencyContext.size === 0) return;

  for (const [targetFile, ctx] of dependencyContext) {
    const targetName = targetFile.split('/').pop() || targetFile;

    // Direct dependencies (imports)
    for (const dep of ctx.imports) {
      const entry = fileScores.find(s => s.path === dep);
      if (entry) {
        entry.score += SCORE_DIRECT_DEPENDENCY;
        entry.reasons.push(`dependency of ${targetName}`);
      }
    }

    // Reverse dependencies (importers)
    for (const importer of ctx.importers) {
      const entry = fileScores.find(s => s.path === importer);
      if (entry) {
        entry.score += SCORE_REVERSE_DEPENDENCY;
        entry.reasons.push(`imports ${targetName}`);
      }
    }
  }
}

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

export interface UserIntent {
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
export function analyzeUserIntent(prompt: string): UserIntent {
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
  const importGraph = await getImportGraph(projectId); // Map of file -> importers
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

  // Third pass: Score files that depend on relevant files (reverse deps)
  for (const relevant of directlyRelevant) {
    const importers = importGraph.get(relevant) || [];
    for (const importer of importers) {
      const importerScore = scores.find(s => s.path === importer);
      if (importerScore) {
        importerScore.score += SCORE_REVERSE_DEPENDENCY;
        importerScore.reasons.push(`imports ${relevant.split('/').pop()}`);
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
// HYBRID RETRIEVAL
// ============================================================================

/**
 * Perform hybrid retrieval combining semantic search with keyword matching
 *
 * This function:
 * 1. Runs semantic search on the query to find relevant code chunks
 * 2. Maps chunk relevance back to files
 * 3. Combines with keyword/path scores
 * 4. Returns weighted final scores
 */
async function hybridRetrieve(
  projectId: string,
  prompt: string,
  fileScores: FileScore[],
  options: HybridRetrievalOptions,
  selectedFile?: string,
  changedFiles?: string[]
): Promise<FileScore[]> {
  const {
    voyageApiKey,
    similarityThreshold = DEFAULT_HYBRID_WEIGHTS.similarityThreshold,
  } = options;

  if (!voyageApiKey) {
    console.log('[HybridRetrieval] No Voyage API key, using keyword-only scoring');
    return fileScores;
  }

  try {
    // Get adaptive weights based on past performance
    const { weights: adaptiveWeights, confidence } = await getAdaptiveWeights(projectId);
    const {
      semanticWeight,
      keywordWeight,
      recencyWeight,
      importanceWeight,
    } = adaptiveWeights;

    console.log(`[HybridRetrieval] Using adaptive weights (confidence: ${(confidence * 100).toFixed(0)}%): semantic=${semanticWeight}, keyword=${keywordWeight}, recency=${recencyWeight}, importance=${importanceWeight}`);

    // Get dependency context for target files
    const targetFiles = [selectedFile, ...(changedFiles || [])].filter(Boolean) as string[];
    const dependencyContext = await getDependencyContext(projectId, targetFiles);

    // Collect all related files from dependencies
    const relatedByDependency = new Map<string, { boost: number; reason: string }>();
    for (const [targetFile, ctx] of dependencyContext) {
      const targetName = targetFile.split('/').pop();
      // Direct dependencies (files the target imports) - higher boost
      for (const dep of ctx.imports) {
        if (!relatedByDependency.has(dep)) {
          relatedByDependency.set(dep, {
            boost: SCORE_DIRECT_DEPENDENCY,
            reason: `dependency of ${targetName}`,
          });
        }
      }
      // Reverse dependencies (files that import the target) - lower boost
      for (const importer of ctx.importers) {
        if (!relatedByDependency.has(importer)) {
          relatedByDependency.set(importer, {
            boost: SCORE_REVERSE_DEPENDENCY,
            reason: `imports ${targetName}`,
          });
        }
      }
    }

    if (relatedByDependency.size > 0) {
      console.log(`[HybridRetrieval] Found ${relatedByDependency.size} related files via dependencies`);
    }

    // Enhance query for better semantic search
    const enhancedQuery = enhanceQueryForSearch(prompt, selectedFile, changedFiles);
    console.log(`[HybridRetrieval] Enhanced query: "${enhancedQuery.slice(0, 100)}..."`);

    // Perform semantic search with enhanced query
    console.log('[HybridRetrieval] Running semantic search...');
    const similarChunks = await semanticCodeSearch(
      projectId,
      enhancedQuery,
      voyageApiKey,
      { limit: 10, similarityThreshold }
    );

    if (similarChunks.length === 0) {
      console.log('[HybridRetrieval] No semantic matches found');
      return fileScores;
    }

    console.log(`[HybridRetrieval] Found ${similarChunks.length} semantic matches`);

    // Map chunk similarities to files (aggregate by file)
    const fileSemanticScores = new Map<string, number>();
    for (const chunk of similarChunks) {
      const existing = fileSemanticScores.get(chunk.filePath) || 0;
      // Take the max similarity for each file
      fileSemanticScores.set(chunk.filePath, Math.max(existing, chunk.similarity));
    }

    // Normalize existing scores to 0-1 range
    const maxKeywordScore = Math.max(...fileScores.map(s => s.score), 1);

    // Combine scores with weights
    const enhancedScores: FileScore[] = fileScores.map(fileScore => {
      const normalizedKeywordScore = fileScore.score / maxKeywordScore;
      const semanticScore = fileSemanticScores.get(fileScore.path) || 0;

      // Check for dependency boost
      const depInfo = relatedByDependency.get(fileScore.path);
      const dependencyBoost = depInfo?.boost || 0;

      // Combine with weights
      const combinedScore =
        semanticScore * semanticWeight +
        normalizedKeywordScore * keywordWeight +
        (fileScore.reasons.includes('recently modified') ? 1 : 0) * recencyWeight +
        (fileScore.reasons.includes('high importance') ? 1 : 0) * importanceWeight +
        dependencyBoost;

      const enhancedReasons = [...fileScore.reasons];
      if (semanticScore > 0) {
        enhancedReasons.push(`semantic: ${(semanticScore * 100).toFixed(0)}%`);
      }
      if (depInfo) {
        enhancedReasons.push(depInfo.reason);
      }

      return {
        ...fileScore,
        score: combinedScore,
        reasons: enhancedReasons,
        semanticScore,
        keywordScore: normalizedKeywordScore,
      };
    });

    // Add files that only appeared in semantic search (not in keyword scores)
    for (const [filePath, similarity] of fileSemanticScores) {
      if (!enhancedScores.find(s => s.path === filePath)) {
        const depInfo = relatedByDependency.get(filePath);
        const dependencyBoost = depInfo?.boost || 0;
        const reasons = [`semantic match: ${(similarity * 100).toFixed(0)}%`];
        if (depInfo) {
          reasons.push(depInfo.reason);
        }
        enhancedScores.push({
          path: filePath,
          score: similarity * semanticWeight + dependencyBoost,
          reasons,
          semanticScore: similarity,
          keywordScore: 0,
        });
      }
    }

    // Add dependency-related files that weren't found by keyword or semantic search
    for (const [filePath, depInfo] of relatedByDependency) {
      if (!enhancedScores.find(s => s.path === filePath)) {
        enhancedScores.push({
          path: filePath,
          score: depInfo.boost,
          reasons: [depInfo.reason],
          semanticScore: 0,
          keywordScore: 0,
        });
      }
    }

    // Sort by combined score
    enhancedScores.sort((a, b) => b.score - a.score);

    console.log('[HybridRetrieval] Top files:', enhancedScores.slice(0, 5).map(s =>
      `${s.path.split('/').pop()} (${(s.score * 100).toFixed(0)}%)`
    ).join(', '));

    return enhancedScores;
  } catch (error) {
    console.error('[HybridRetrieval] Error:', error);
    // Fallback to keyword-only scores
    return fileScores;
  }
}

// ============================================================================
// CONTEXT BUILDING
// ============================================================================

/**
 * Build a smart context package for AI request
 *
 * @param projectId - The project ID
 * @param prompt - User's prompt/request
 * @param files - All project files (path -> content)
 * @param selectedFile - Currently selected file in editor
 * @param conversationHistory - Recent conversation messages
 * @param changedFiles - Files that changed since last request
 * @param projectMemory - Project memory (summary, entities, etc.)
 * @param conversationSummaries - Summaries of older conversation
 * @param hybridOptions - Options for hybrid retrieval (optional)
 */
export async function buildContext(
  projectId: string,
  prompt: string,
  files: Record<string, string>,
  selectedFile: string | undefined,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }>,
  changedFiles: string[],
  projectMemory: ProjectMemory | null,
  conversationSummaries: ConversationSummary[],
  hybridOptions?: HybridRetrievalOptions
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
  // OUTLINE MODE - only for explain actions
  // Style changes need FULL context to preserve existing colors/design
  // ============================================
  const useOutlines = intent.action === 'explain';

  // Score all files with keyword matching
  let fileScores = await scoreFiles(
    projectId,
    files,
    selectedFile,
    changedFiles,
    intent,
    projectMemory
  );

  // Apply dependency boosts even without semantic search (selected/changed files)
  const targetFilesForDeps = [selectedFile, ...changedFiles].filter(Boolean) as string[];
  if (targetFilesForDeps.length > 0) {
    const dependencyContext = await getDependencyContext(projectId, targetFilesForDeps);
    applyDependencyBoosts(fileScores, dependencyContext);
  }

  // ============================================
  // HYBRID RETRIEVAL (when enabled)
  // ============================================
  let usedSemanticSearch = false;
  if (hybridOptions?.enableSemanticSearch && hybridOptions.voyageApiKey) {
    console.log('[ContextBuilder] Using hybrid retrieval with semantic search');
    fileScores = await hybridRetrieve(
      projectId,
      prompt,
      fileScores,
      hybridOptions,
      selectedFile,
      changedFiles
    );
    usedSemanticSearch = true;
  }

  // Select files within token budget
  const relevantFiles: RelevantFile[] = [];
  let tokenEstimate = 0;

  // Use intent-based token budget (Phase 4.4)
  const tokenBudget = TOKEN_BUDGETS[intent.action];
  const fileTokenBudget = tokenBudget - RESERVED_TOKENS;

  console.log(`[ContextBuilder] Token budget for "${intent.action}": ${tokenBudget} (${fileTokenBudget} for files)`);

  // Determine max files based on action
  // Style changes need MORE files to see the full design context
  const maxFiles = intent.action === 'debug' ? 5 :
                   intent.action === 'explain' ? 2 : 8;

  // Track if we've included the main game file with full content
  const mustIncludeFull = new Set([
    '/src/pages/Index.tsx',
    '/src/pages/GameplayPage.tsx',
    selectedFile,
  ].filter(Boolean));

  for (const scored of fileScores) {
    if (scored.score <= 0) continue;

    const content = files[scored.path];
    if (!content) continue;

    // Use outline for large files when appropriate
    // BUT: ALWAYS include full content for main game files (critical for iteration)
    let fileContent: string;
    let isOutline = false;
    const isMainGameFile = mustIncludeFull.has(scored.path) || scored.score >= 0.9;

    if (!isMainGameFile && (useOutlines || content.split('\n').length > 150)) {
      const result = getFileContentOrOutline(scored.path, content);
      fileContent = result.content;
      isOutline = result.isOutline;
    } else {
      // Always use full content for main game files
      fileContent = content;
    }

    const fileTokens = Math.ceil(fileContent.length / CHARS_PER_TOKEN);

    // For main game files, include even if over budget (critical for iteration)
    const includeAnyway = isMainGameFile && relevantFiles.length < 3;

    if (tokenEstimate + fileTokens <= fileTokenBudget || includeAnyway) {
      relevantFiles.push({
        path: scored.path,
        content: fileContent,
        relevanceScore: Math.min(scored.score, 1),
        relevanceReason: scored.reasons.slice(0, 3).join(', ') + (isOutline ? ' [outline]' : '') + (isMainGameFile ? ' [full]' : ''),
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

  // Get task context (current goal, substeps, blockers, recent deltas)
  let taskContext: TaskContext | undefined;
  let taskContextFormatted: string | undefined;
  try {
    taskContext = await getTaskContext(projectId, 3); // Last 3 deltas
    taskContextFormatted = formatTaskContextForPrompt(taskContext);
    if (taskContextFormatted) {
      console.log(`[ContextBuilder] Task context: goal=${!!taskContext.ledger.currentGoal}, deltas=${taskContext.recentDeltas.length}`);
    }
  } catch (error) {
    console.warn('[ContextBuilder] Failed to get task context:', error);
  }

  // Generate structured plan for complex tasks (Phase 4.5)
  let structuredPlan: StructuredPlan | undefined;
  let structuredPlanFormatted: string | undefined;
  if (!intent.isTrivialChange && intent.action !== 'tweak' && intent.action !== 'explain') {
    structuredPlan = generateStructuredPlan(prompt, files, projectMemory) || undefined;
    if (structuredPlan) {
      structuredPlanFormatted = formatPlanForPrompt(structuredPlan);
      console.log(`[ContextBuilder] Generated plan: ${structuredPlan.steps.length} steps, complexity ${structuredPlan.totalComplexity}`);
    }
  }

  // Get asset manifest for AI to use uploaded assets
  let assetManifest: AssetManifest | undefined;
  let assetManifestFormatted: string | undefined;
  try {
    assetManifest = await getAssetManifest(projectId);
    if (assetManifest && assetManifest.totalCount > 0) {
      // Use compact format for minimal context, full format otherwise
      assetManifestFormatted = intent.isTrivialChange
        ? formatAssetManifestCompact(assetManifest)
        : formatAssetManifestForPrompt(assetManifest);
      console.log(`[ContextBuilder] Asset manifest: ${assetManifest.totalCount} assets`);
    }
  } catch (error) {
    console.warn('[ContextBuilder] Failed to get asset manifest:', error);
  }

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
  const taskContextTokens = taskContextFormatted
    ? Math.ceil(taskContextFormatted.length / CHARS_PER_TOKEN)
    : 0;
  const planTokens = structuredPlanFormatted
    ? Math.ceil(structuredPlanFormatted.length / CHARS_PER_TOKEN)
    : 0;
  const assetTokens = assetManifestFormatted
    ? Math.ceil(assetManifestFormatted.length / CHARS_PER_TOKEN)
    : 0;

  const totalTokens = tokenEstimate + memoryTokens + summaryTokens + messageTokens + taskContextTokens + planTokens + assetTokens + 500;

  const contextMode = useOutlines ? 'outline' : 'full';
  console.log(`[ContextBuilder] Built ${contextMode} context: ${relevantFiles.length} files, ~${totalTokens}/${tokenBudget} tokens${usedSemanticSearch ? ' (with semantic search)' : ''}`);

  return {
    projectMemory,
    taskContext,
    taskContextFormatted,
    structuredPlan,
    structuredPlanFormatted,
    assetManifest,
    assetManifestFormatted,
    conversationSummaries: summaryTexts,
    recentMessages,
    relevantFiles,
    contextMode,
    changedSinceLastRequest: changedFiles,
    fileTree,
    estimatedTokens: totalTokens,
    tokenBudget,
    classification: {
      intentType: intent.action,
      contextMode,
      usedSemanticSearch,
      confidence: intent.confidence,
    },
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

  // Use minimal token budget for tweak actions
  const tokenBudget = TOKEN_BUDGETS['tweak'];

  console.log(`[ContextBuilder] MINIMAL context: ${relevantFiles.length} file(s), ~${tokenEstimate}/${tokenBudget} tokens`);

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
    classification: {
      intentType: 'tweak' as IntentAction,
      contextMode: 'minimal' as const,
      usedSemanticSearch: false,
      confidence: 0.9,
    },
    relevantFiles,
    changedSinceLastRequest: [],
    fileTree: [], // Skip file tree for minimal
    estimatedTokens: tokenEstimate,
    tokenBudget,
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

// ============================================================================
// EDIT MODE CLASSIFICATION
// ============================================================================

export type ResponseMode = 'edit' | 'file' | 'hybrid';

export interface ResponseModeRecommendation {
  mode: ResponseMode;
  confidence: number;
  reason: string;
}

/**
 * Recommend whether AI should use edit mode or file mode for response
 *
 * Edit mode (search/replace): Better for small, targeted changes
 * File mode (full replacement): Better for new features, structural changes
 */
export function getRecommendedResponseMode(prompt: string): ResponseModeRecommendation {
  const intent = analyzeUserIntent(prompt);

  // ============================================
  // EDIT MODE - Small, targeted changes
  // ============================================
  const editModePatterns = [
    // Color changes
    /^(change|make|set|update)\s+(?:the\s+)?(?:\w+\s+)?(?:color|colour)/i,
    /(?:to\s+)?(?:red|blue|green|yellow|purple|orange|pink|white|black|gray|grey|#[0-9a-f]{3,8})\b/i,
    // Value changes
    /^(change|set|update|make)\s+(?:the\s+)?(?:speed|size|width|height|delay|duration|timeout|interval)\s+(?:to\s+)?\d/i,
    // Text/label changes
    /^(change|update|fix)\s+(?:the\s+)?(?:text|title|label|button\s+text|heading|message)\s+(?:to|from)/i,
    // Simple CSS tweaks
    /^(make|change)\s+(?:it|this|the\s+\w+)\s+(bigger|smaller|larger|wider|taller|shorter|bolder|lighter)/i,
    // Typo fixes
    /^fix\s+(?:the\s+)?(?:typo|spelling)/i,
    // Simple visibility
    /^(show|hide|toggle)\s+(?:the\s+)?/i,
    // Border/margin/padding tweaks
    /^(add|remove|change|increase|decrease)\s+(?:the\s+)?(?:border|margin|padding|shadow|radius)/i,
    // Simple replacements
    /^replace\s+["']?[^"']+["']?\s+with\s+["']?[^"']+["']?/i,
  ];

  // Check for edit mode patterns
  const matchesEditPattern = editModePatterns.some(p => p.test(prompt));

  if (matchesEditPattern || intent.isTrivialChange) {
    return {
      mode: 'edit',
      confidence: 0.9,
      reason: 'Small, targeted change that can be done with search/replace',
    };
  }

  // ============================================
  // FILE MODE - Structural changes, new features
  // ============================================
  const fileModePatterns = [
    // New features/components
    /^(add|create|implement|build)\s+(a\s+)?(new\s+)?(?:feature|component|page|hook|function)/i,
    // Major refactoring
    /\b(refactor|restructure|reorganize|rewrite|redesign)\b/i,
    // Adding new game mechanics
    /\b(add|implement)\s+(?:a\s+)?(?:new\s+)?(?:level|enemy|power-?up|game\s+mode|multiplayer)/i,
    // Complex state changes
    /\b(add|implement)\s+(?:state\s+)?(?:management|context|store|reducer)/i,
    // New screens/pages
    /\b(add|create)\s+(?:a\s+)?(?:new\s+)?(?:screen|page|view|modal|dialog)/i,
    // Integration work
    /\b(integrate|connect|hook\s+up|wire\s+up)\b/i,
    // Animations (complex)
    /\b(add|create|implement)\s+(?:complex\s+)?(?:animation|transition|effect)s?\b/i,
  ];

  const matchesFilePattern = fileModePatterns.some(p => p.test(prompt));

  if (matchesFilePattern || intent.isStructuralChange) {
    return {
      mode: 'file',
      confidence: 0.85,
      reason: 'Structural change or new feature that needs full file context',
    };
  }

  // ============================================
  // INTENT-BASED CLASSIFICATION
  // ============================================

  // Actions that prefer edit mode
  if (intent.action === 'tweak' || intent.action === 'style' || intent.action === 'rename') {
    return {
      mode: 'edit',
      confidence: 0.8,
      reason: `${intent.action} action typically requires small, localized changes`,
    };
  }

  // Actions that prefer file mode
  if (intent.action === 'create' || intent.action === 'add') {
    return {
      mode: 'file',
      confidence: 0.85,
      reason: `${intent.action} action typically requires full file replacement`,
    };
  }

  // Debug mode - depends on complexity
  if (intent.action === 'debug') {
    // Simple fixes can use edit mode, complex bugs need file mode
    const isSimpleFix = /^fix\s+(?:the\s+)?(?:typo|color|text|label|value|number)/i.test(prompt);
    return {
      mode: isSimpleFix ? 'edit' : 'file',
      confidence: 0.7,
      reason: isSimpleFix ? 'Simple fix can use edit mode' : 'Complex bug fix needs full context',
    };
  }

  // Remove action - can be either depending on scope
  if (intent.action === 'remove') {
    const isSmallRemoval = /^remove\s+(?:the\s+)?(?:button|text|label|icon|class|style)/i.test(prompt);
    return {
      mode: isSmallRemoval ? 'edit' : 'file',
      confidence: 0.75,
      reason: isSmallRemoval ? 'Small removal can use edit mode' : 'Larger removal needs file mode',
    };
  }

  // ============================================
  // DEFAULT - Let AI decide (hybrid)
  // ============================================
  return {
    mode: 'hybrid',
    confidence: 0.5,
    reason: 'Ambiguous request - AI will choose appropriate format',
  };
}

/**
 * Check if prompt should trigger edit mode hint in context
 */
export function shouldSuggestEditMode(prompt: string): boolean {
  const recommendation = getRecommendedResponseMode(prompt);
  return recommendation.mode === 'edit' && recommendation.confidence >= 0.7;
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
