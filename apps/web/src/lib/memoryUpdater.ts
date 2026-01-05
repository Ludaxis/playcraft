/**
 * Memory Updater
 *
 * Analyzes AI responses and code changes to automatically update
 * project memory. Extracts tasks, entities, and project understanding.
 */

import {
  addCompletedTask,
  updateGameType,
  updateTechStack,
  updateFileImportance,
  addKeyEntity,
  updateActiveContext,
  updateProjectSummary,
  initializeProjectMemory,
  getProjectMemory,
  type KeyEntity,
} from './projectMemoryService';
import { updateFileHashes, type FileChangeResult } from './fileHashService';

// ============================================================================
// TYPES
// ============================================================================

export interface AIResponse {
  message: string;
  files: Array<{ path: string; content: string }>;
  explanation: string;
}

// ============================================================================
// TASK EXTRACTION
// ============================================================================

/**
 * Extract completed task description from AI response
 */
function extractTaskFromResponse(message: string, prompt: string): string {
  // If AI message is short and descriptive, use it
  if (message.length < 200 && !message.includes('\n')) {
    return message;
  }

  // Try to extract from common patterns
  const patterns = [
    /^I've (.+?)\.?\s*$/im,
    /^(?:Done|Created|Added|Fixed|Updated|Implemented|Built)[:!]?\s*(.+?)\.?\s*$/im,
    /^(.+?) (?:has been|is now|are now) (?:created|added|implemented|fixed)/im,
  ];

  for (const pattern of patterns) {
    const match = message.match(pattern);
    if (match) {
      return match[1].charAt(0).toUpperCase() + match[1].slice(1);
    }
  }

  // Fall back to summarizing the prompt
  const promptWords = prompt.split(' ').slice(0, 8);
  return promptWords.join(' ') + (prompt.split(' ').length > 8 ? '...' : '');
}

// ============================================================================
// GAME TYPE DETECTION
// ============================================================================

const GAME_TYPE_PATTERNS: Array<{ pattern: RegExp; type: string }> = [
  { pattern: /snake|worm/i, type: 'snake' },
  { pattern: /platformer|jump|platform/i, type: 'platformer' },
  { pattern: /match[- ]?3|candy|puzzle/i, type: 'match3' },
  { pattern: /tetris|block.*fall/i, type: 'tetris' },
  { pattern: /pong|paddle/i, type: 'pong' },
  { pattern: /breakout|brick.*break/i, type: 'breakout' },
  { pattern: /space.*invader|shooter/i, type: 'shooter' },
  { pattern: /flappy|bird.*fly/i, type: 'flappy' },
  { pattern: /memory|card.*match/i, type: 'memory' },
  { pattern: /tic.*tac|x.*o/i, type: 'tictactoe' },
  { pattern: /chess/i, type: 'chess' },
  { pattern: /sudoku/i, type: 'sudoku' },
  { pattern: /2048|number.*slide/i, type: '2048' },
  { pattern: /tower.*defense/i, type: 'tower-defense' },
  { pattern: /idle|clicker|tap/i, type: 'idle' },
  { pattern: /rpg|role.*play/i, type: 'rpg' },
  { pattern: /racing|car.*race/i, type: 'racing' },
  { pattern: /word|crossword|wordle/i, type: 'word' },
  { pattern: /quiz|trivia/i, type: 'quiz' },
];

/**
 * Detect game type from content
 */
function detectGameType(content: string): string | null {
  for (const { pattern, type } of GAME_TYPE_PATTERNS) {
    if (pattern.test(content)) {
      return type;
    }
  }
  return null;
}

// ============================================================================
// TECH STACK DETECTION
// ============================================================================

const TECH_PATTERNS: Array<{ pattern: RegExp; tech: string }> = [
  { pattern: /useRef.*canvas|canvas.*useRef|getContext\(['"]2d['"]\)/i, tech: 'canvas' },
  { pattern: /@react-three|three\.js|THREE\./i, tech: 'three.js' },
  { pattern: /requestAnimationFrame/i, tech: 'animation' },
  { pattern: /WebSocket|socket\.io/i, tech: 'websocket' },
  { pattern: /localStorage|sessionStorage/i, tech: 'local-storage' },
  { pattern: /AudioContext|new Audio/i, tech: 'audio' },
  { pattern: /gamepad|navigator\.getGamepads/i, tech: 'gamepad' },
  { pattern: /touch(?:start|move|end)/i, tech: 'touch' },
  { pattern: /pointer(?:down|move|up)/i, tech: 'pointer' },
  { pattern: /useReducer|createContext/i, tech: 'context' },
  { pattern: /zustand|create\s*\(/i, tech: 'zustand' },
  { pattern: /framer-motion|motion\./i, tech: 'framer-motion' },
];

/**
 * Detect tech stack from code
 */
function detectTechStack(files: Array<{ content: string }>): string[] {
  const detected = new Set<string>();

  // Always include base tech
  detected.add('react');
  detected.add('typescript');
  detected.add('tailwind');

  for (const file of files) {
    for (const { pattern, tech } of TECH_PATTERNS) {
      if (pattern.test(file.content)) {
        detected.add(tech);
      }
    }
  }

  return Array.from(detected);
}

// ============================================================================
// ENTITY EXTRACTION
// ============================================================================

/**
 * Extract key entities from code (components, hooks, functions)
 */
function extractEntities(filePath: string, content: string): KeyEntity[] {
  const entities: KeyEntity[] = [];

  // Components (function MyComponent or const MyComponent = )
  const componentPattern = /(?:export\s+)?(?:function|const)\s+([A-Z][a-zA-Z0-9]*)\s*(?:=\s*(?:\([^)]*\)|[^=])*=>|\s*\()/g;
  let match;
  while ((match = componentPattern.exec(content)) !== null) {
    const name = match[1];
    // Skip common non-components
    if (!['React', 'String', 'Number', 'Boolean', 'Array', 'Object'].includes(name)) {
      entities.push({
        name,
        type: name.startsWith('use') ? 'hook' : 'component',
        file: filePath,
      });
    }
  }

  // Hooks
  const hookPattern = /(?:export\s+)?(?:function|const)\s+(use[A-Z][a-zA-Z0-9]*)/g;
  while ((match = hookPattern.exec(content)) !== null) {
    entities.push({
      name: match[1],
      type: 'hook',
      file: filePath,
    });
  }

  // Types and Interfaces
  const typePattern = /(?:export\s+)?(?:type|interface)\s+([A-Z][a-zA-Z0-9]*)/g;
  while ((match = typePattern.exec(content)) !== null) {
    entities.push({
      name: match[1],
      type: 'type',
      file: filePath,
    });
  }

  // Key game-related functions
  const gameFunction = /(?:const|function)\s+(handle[A-Z][a-zA-Z0-9]*|update[A-Z][a-zA-Z0-9]*|render[A-Z][a-zA-Z0-9]*|init[A-Z][a-zA-Z0-9]*)/g;
  while ((match = gameFunction.exec(content)) !== null) {
    entities.push({
      name: match[1],
      type: 'function',
      file: filePath,
    });
  }

  // Deduplicate
  const seen = new Set<string>();
  return entities.filter(e => {
    const key = `${e.name}:${e.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ============================================================================
// SUMMARY GENERATION
// ============================================================================

/**
 * Generate a project summary from conversation context
 */
function generateSummary(
  existingSummary: string | null,
  aiMessage: string,
  prompt: string,
  files: Array<{ path: string; content: string }>
): string {
  // Try to detect game type from files
  const gameType = detectGameType(files.map(f => f.content).join('\n'));

  // Extract key features from AI message
  const features: string[] = [];
  const featurePatterns = [
    /with (.+?) (?:controls?|movement)/i,
    /featuring (.+)/i,
    /includes? (.+)/i,
    /(?:has|have) (.+?) system/i,
  ];

  for (const pattern of featurePatterns) {
    const match = aiMessage.match(pattern);
    if (match) {
      features.push(match[1]);
    }
  }

  // Build summary
  if (!existingSummary) {
    // First summary
    const gameDesc = gameType ? `${gameType} game` : 'game';
    const featureDesc = features.length > 0 ? ` with ${features.slice(0, 2).join(' and ')}` : '';
    return `${gameDesc.charAt(0).toUpperCase() + gameDesc.slice(1)}${featureDesc}`;
  }

  // Append to existing (if significantly different)
  if (features.length > 0 && !existingSummary.toLowerCase().includes(features[0].toLowerCase())) {
    return `${existingSummary}. Added ${features[0]}`;
  }

  return existingSummary;
}

// ============================================================================
// MAIN UPDATE FUNCTION
// ============================================================================

/**
 * Update all memory systems after an AI response
 */
export async function updateMemoryFromResponse(
  projectId: string,
  prompt: string,
  response: AIResponse,
  selectedFile?: string
): Promise<void> {
  // Run updates in parallel where possible
  const updates: Promise<void>[] = [];

  // 1. Ensure memory exists
  const existingMemory = await getProjectMemory(projectId);
  if (!existingMemory) {
    await initializeProjectMemory(projectId);
  }

  // 2. Update file hashes and detect changes
  const filesMap: Record<string, string> = {};
  for (const file of response.files) {
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    filesMap[path] = file.content;
  }

  let changeResult: FileChangeResult | null = null;
  if (Object.keys(filesMap).length > 0) {
    changeResult = await updateFileHashes(projectId, filesMap);
  }

  // 3. Extract and add completed task
  const task = extractTaskFromResponse(response.message, prompt);
  updates.push(addCompletedTask(projectId, task));

  // 4. Update file importance
  const modifiedFiles = changeResult
    ? [...changeResult.created, ...changeResult.modified]
    : response.files.map(f => (f.path.startsWith('/') ? f.path : `/${f.path}`));

  updates.push(updateFileImportance(projectId, modifiedFiles, selectedFile));

  // 5. Detect and update game type (only if not already set)
  if (!existingMemory?.game_type) {
    const allContent = response.files.map(f => f.content).join('\n') + prompt;
    const gameType = detectGameType(allContent);
    if (gameType) {
      updates.push(updateGameType(projectId, gameType));
    }
  }

  // 6. Detect and update tech stack
  const techStack = detectTechStack(response.files);
  if (techStack.length > (existingMemory?.tech_stack?.length || 0)) {
    updates.push(updateTechStack(projectId, techStack));
  }

  // 7. Extract and add entities from modified files
  for (const file of response.files) {
    const path = file.path.startsWith('/') ? file.path : `/${file.path}`;
    const entities = extractEntities(path, file.content);
    for (const entity of entities) {
      updates.push(addKeyEntity(projectId, entity));
    }
  }

  // 8. Update active context
  updates.push(
    updateActiveContext(projectId, {
      lastModified: modifiedFiles.slice(0, 5),
      focusFiles: selectedFile ? [selectedFile] : modifiedFiles.slice(0, 3),
    })
  );

  // 9. Update project summary (after first few iterations)
  if (existingMemory?.completed_tasks && existingMemory.completed_tasks.length >= 2) {
    const newSummary = generateSummary(
      existingMemory.project_summary,
      response.message,
      prompt,
      response.files
    );
    if (newSummary !== existingMemory.project_summary) {
      updates.push(updateProjectSummary(projectId, newSummary));
    }
  }

  // Wait for all updates
  await Promise.all(updates);
}

/**
 * Quick update for file changes only (no AI response)
 */
export async function updateMemoryFromFileChange(
  projectId: string,
  files: Record<string, string>,
  selectedFile?: string
): Promise<FileChangeResult> {
  // Update file hashes
  const changeResult = await updateFileHashes(projectId, files);

  // Update file importance
  const modifiedFiles = [...changeResult.created, ...changeResult.modified];
  if (modifiedFiles.length > 0) {
    await updateFileImportance(projectId, modifiedFiles, selectedFile);
  }

  // Update active context
  await updateActiveContext(projectId, {
    lastModified: modifiedFiles.slice(0, 5),
    focusFiles: selectedFile ? [selectedFile] : modifiedFiles.slice(0, 3),
  });

  return changeResult;
}
