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
    changeResult = await updateFileHashes(projectId, filesMap, { deleteMissing: false });
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
  const changeResult = await updateFileHashes(projectId, files, { deleteMissing: false });

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

// ============================================================================
// FULL PROJECT SCAN
// ============================================================================

/**
 * Scan all project files to populate memory
 * Called when a project is first loaded and has no memory
 */
export async function scanProjectForMemory(
  projectId: string,
  files: Record<string, string>
): Promise<void> {
  console.log(`[MemoryUpdater] Starting full project scan for ${projectId}`);

  try {
    // Initialize memory if not exists
    await initializeProjectMemory(projectId);

    // Get existing memory to check what needs updating
    const memory = await getProjectMemory(projectId);
    if (memory?.project_summary) {
      console.log('[MemoryUpdater] Project already has memory, skipping scan');
      return;
    }

    // Filter to code files only
    const codeFiles = Object.entries(files).filter(([path]) =>
      /\.(tsx?|jsx?)$/.test(path) && !path.includes('node_modules')
    );

    if (codeFiles.length === 0) {
      console.log('[MemoryUpdater] No code files to scan');
      return;
    }

    console.log(`[MemoryUpdater] Scanning ${codeFiles.length} code files`);

    // Combine all content for analysis
    const allContent = codeFiles.map(([, content]) => content).join('\n');

    // 1. Detect game type
    const gameType = detectGameType(allContent);
    if (gameType) {
      console.log(`[MemoryUpdater] Detected game type: ${gameType}`);
      await updateGameType(projectId, gameType);
    }

    // 2. Detect tech stack
    const techStack = detectTechStack(codeFiles.map(([, content]) => ({ content })));
    if (techStack.length > 0) {
      console.log(`[MemoryUpdater] Detected tech stack: ${techStack.join(', ')}`);
      await updateTechStack(projectId, techStack);
    }

    // 3. Extract entities from all files
    const allEntities: KeyEntity[] = [];
    for (const [path, content] of codeFiles) {
      const entities = extractEntities(path, content);
      allEntities.push(...entities);
    }

    // Deduplicate and limit entities
    const uniqueEntities = deduplicateEntities(allEntities).slice(0, 50);
    console.log(`[MemoryUpdater] Found ${uniqueEntities.length} unique entities`);

    // Add entities in batch
    for (const entity of uniqueEntities) {
      await addKeyEntity(projectId, entity);
    }

    // 4. Set initial file importance based on file type/location
    const importantFiles: string[] = [];
    for (const [path] of codeFiles) {
      // Prioritize main pages and game components
      if (
        path.includes('/pages/') ||
        path.includes('/components/game') ||
        path.includes('Index.tsx') ||
        path.includes('Game')
      ) {
        importantFiles.push(path);
      }
    }
    if (importantFiles.length > 0) {
      await updateFileImportance(projectId, importantFiles);
    }

    // 5. Generate initial project summary
    const summary = generateProjectSummary(gameType, techStack, uniqueEntities);
    if (summary) {
      console.log(`[MemoryUpdater] Generated summary: ${summary}`);
      await updateProjectSummary(projectId, summary);
    }

    console.log('[MemoryUpdater] Project scan complete');
  } catch (error) {
    console.error('[MemoryUpdater] Scan failed:', error);
  }
}

/**
 * Deduplicate entities by name
 */
function deduplicateEntities(entities: KeyEntity[]): KeyEntity[] {
  const seen = new Set<string>();
  return entities.filter((entity) => {
    const key = `${entity.name}:${entity.type}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Generate a project summary from detected info
 */
function generateProjectSummary(
  gameType: string | null,
  techStack: string[],
  entities: KeyEntity[]
): string | null {
  const parts: string[] = [];

  if (gameType) {
    const gameTypeNames: Record<string, string> = {
      snake: 'Snake game',
      platformer: 'Platformer game',
      match3: 'Match-3 puzzle game',
      tetris: 'Tetris-style game',
      pong: 'Pong game',
      breakout: 'Breakout game',
      shooter: 'Shooter game',
      flappy: 'Flappy Bird-style game',
      memory: 'Memory card game',
      tictactoe: 'Tic-Tac-Toe game',
      chess: 'Chess game',
      sudoku: 'Sudoku puzzle',
      '2048': '2048 puzzle game',
      'tower-defense': 'Tower defense game',
      idle: 'Idle/clicker game',
      rpg: 'RPG game',
      racing: 'Racing game',
      word: 'Word game',
      quiz: 'Quiz game',
    };
    parts.push(gameTypeNames[gameType] || `${gameType} game`);
  } else {
    parts.push('Game project');
  }

  // Add notable tech
  const notableTech = techStack.filter((t) =>
    ['canvas', 'three.js', 'websocket', 'audio', 'framer-motion'].includes(t)
  );
  if (notableTech.length > 0) {
    parts.push(`using ${notableTech.join(', ')}`);
  }

  // Add main components
  const components = entities
    .filter((e) => e.type === 'component')
    .slice(0, 3)
    .map((e) => e.name);
  if (components.length > 0) {
    parts.push(`with ${components.join(', ')}`);
  }

  return parts.length > 0 ? parts.join(' ') : null;
}
