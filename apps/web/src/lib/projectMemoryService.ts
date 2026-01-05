/**
 * Project Memory Service
 *
 * Manages persistent AI knowledge about each project.
 * Stores summaries, tech stack, completed tasks, and entity tracking.
 */

import { getSupabase } from './supabase';
import type { ProjectMemory } from './contextBuilder';

// ============================================================================
// TYPES
// ============================================================================

export interface CompletedTask {
  task: string;
  timestamp: string;
}

export interface KeyEntity {
  name: string;
  type: 'component' | 'hook' | 'function' | 'class' | 'type' | 'variable';
  file: string;
}

export interface ActiveContext {
  focusFiles: string[];
  lastModified: string[];
  currentFeature: string | null;
}

// Full database row type
export interface ProjectMemoryRow {
  project_id: string;
  project_summary: string | null;
  game_type: string | null;
  tech_stack: string[];
  completed_tasks: CompletedTask[];
  file_importance: Record<string, number>;
  key_entities: KeyEntity[];
  active_context: ActiveContext;
  created_at: string;
  updated_at: string;
}

// ============================================================================
// CONSTANTS
// ============================================================================

const MAX_COMPLETED_TASKS = 50;
const MAX_KEY_ENTITIES = 100;
const IMPORTANCE_DECAY_FACTOR = 0.95; // Decay per request

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Get project memory from database
 */
export async function getProjectMemory(projectId: string): Promise<ProjectMemory | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_memory')
    .select('*')
    .eq('project_id', projectId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      // Not found - return null
      return null;
    }
    console.error('[ProjectMemoryService] Failed to get memory:', error);
    return null;
  }

  return {
    project_summary: data.project_summary,
    game_type: data.game_type,
    tech_stack: data.tech_stack || [],
    completed_tasks: data.completed_tasks || [],
    file_importance: data.file_importance || {},
    key_entities: data.key_entities || [],
  };
}

/**
 * Create or update project memory
 */
export async function upsertProjectMemory(
  projectId: string,
  memory: Partial<ProjectMemory>
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_project_memory')
    .upsert(
      {
        project_id: projectId,
        project_summary: memory.project_summary,
        game_type: memory.game_type,
        tech_stack: memory.tech_stack,
        completed_tasks: memory.completed_tasks,
        file_importance: memory.file_importance,
        key_entities: memory.key_entities,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'project_id' }
    );

  if (error) {
    console.error('[ProjectMemoryService] Failed to upsert memory:', error);
  }
}

/**
 * Initialize memory for a new project
 */
export async function initializeProjectMemory(
  projectId: string,
  initialSummary?: string
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase.from('playcraft_project_memory').insert({
    project_id: projectId,
    project_summary: initialSummary || null,
    game_type: null,
    tech_stack: [],
    completed_tasks: [],
    file_importance: {},
    key_entities: [],
    active_context: {
      focusFiles: [],
      lastModified: [],
      currentFeature: null,
    },
  });

  if (error && error.code !== '23505') {
    // Ignore duplicate key error
    console.error('[ProjectMemoryService] Failed to initialize memory:', error);
  }
}

// ============================================================================
// TASK TRACKING
// ============================================================================

/**
 * Add a completed task to memory
 */
export async function addCompletedTask(projectId: string, task: string): Promise<void> {
  const memory = await getProjectMemory(projectId);

  const tasks = memory?.completed_tasks || [];

  // Add new task at the beginning
  tasks.unshift({
    task,
    timestamp: new Date().toISOString(),
  });

  // Keep only the last N tasks
  const trimmedTasks = tasks.slice(0, MAX_COMPLETED_TASKS);

  await upsertProjectMemory(projectId, {
    completed_tasks: trimmedTasks,
  });
}

/**
 * Get recent tasks for context
 */
export async function getRecentTasks(
  projectId: string,
  limit: number = 10
): Promise<CompletedTask[]> {
  const memory = await getProjectMemory(projectId);
  return (memory?.completed_tasks || []).slice(0, limit);
}

// ============================================================================
// FILE IMPORTANCE
// ============================================================================

/**
 * Update file importance scores
 * Called when files are modified - increases their importance
 */
export async function updateFileImportance(
  projectId: string,
  modifiedFiles: string[],
  selectedFile?: string
): Promise<void> {
  const memory = await getProjectMemory(projectId);
  const importance = memory?.file_importance || {};

  // Apply decay to all existing scores
  for (const path of Object.keys(importance)) {
    importance[path] *= IMPORTANCE_DECAY_FACTOR;
    // Remove if too low
    if (importance[path] < 0.1) {
      delete importance[path];
    }
  }

  // Boost modified files
  for (const path of modifiedFiles) {
    importance[path] = Math.min((importance[path] || 0) + 0.3, 1.0);
  }

  // Extra boost for selected file
  if (selectedFile) {
    importance[selectedFile] = Math.min((importance[selectedFile] || 0) + 0.2, 1.0);
  }

  await upsertProjectMemory(projectId, {
    file_importance: importance,
  });
}

/**
 * Get most important files
 */
export async function getImportantFiles(
  projectId: string,
  limit: number = 10
): Promise<Array<{ path: string; importance: number }>> {
  const memory = await getProjectMemory(projectId);
  const importance = memory?.file_importance || {};

  return Object.entries(importance)
    .map(([path, score]) => ({ path, importance: score }))
    .sort((a, b) => b.importance - a.importance)
    .slice(0, limit);
}

// ============================================================================
// PROJECT UNDERSTANDING
// ============================================================================

/**
 * Update project summary
 */
export async function updateProjectSummary(
  projectId: string,
  summary: string
): Promise<void> {
  await upsertProjectMemory(projectId, {
    project_summary: summary,
  });
}

/**
 * Update game type classification
 */
export async function updateGameType(projectId: string, gameType: string): Promise<void> {
  await upsertProjectMemory(projectId, {
    game_type: gameType,
  });
}

/**
 * Update tech stack
 */
export async function updateTechStack(projectId: string, techStack: string[]): Promise<void> {
  await upsertProjectMemory(projectId, {
    tech_stack: techStack,
  });
}

// ============================================================================
// KEY ENTITIES
// ============================================================================

/**
 * Add or update a key entity
 */
export async function addKeyEntity(projectId: string, entity: KeyEntity): Promise<void> {
  const memory = await getProjectMemory(projectId);
  const entities = memory?.key_entities || [];

  // Check if entity already exists
  const existingIndex = entities.findIndex(
    e => e.name === entity.name && e.type === entity.type
  );

  if (existingIndex >= 0) {
    // Update existing
    entities[existingIndex] = entity;
  } else {
    // Add new
    entities.push(entity);
  }

  // Trim if too many
  const trimmedEntities = entities.slice(-MAX_KEY_ENTITIES);

  await upsertProjectMemory(projectId, {
    key_entities: trimmedEntities,
  });
}

/**
 * Get entities from a specific file
 */
export async function getFileEntities(
  projectId: string,
  filePath: string
): Promise<KeyEntity[]> {
  const memory = await getProjectMemory(projectId);
  return (memory?.key_entities || []).filter(e => e.file === filePath);
}

/**
 * Remove entities for a deleted file
 */
export async function removeFileEntities(projectId: string, filePath: string): Promise<void> {
  const memory = await getProjectMemory(projectId);
  const entities = (memory?.key_entities || []).filter(e => e.file !== filePath);

  await upsertProjectMemory(projectId, {
    key_entities: entities,
  });
}

// ============================================================================
// ACTIVE CONTEXT
// ============================================================================

/**
 * Update active context (current working focus)
 */
export async function updateActiveContext(
  projectId: string,
  context: Partial<ActiveContext>
): Promise<void> {
  const supabase = getSupabase();

  const { data: existing } = await supabase
    .from('playcraft_project_memory')
    .select('active_context')
    .eq('project_id', projectId)
    .single();

  const currentContext: ActiveContext = existing?.active_context || {
    focusFiles: [],
    lastModified: [],
    currentFeature: null,
  };

  const updatedContext = { ...currentContext, ...context };

  // Keep last 5 modified files
  if (updatedContext.lastModified.length > 5) {
    updatedContext.lastModified = updatedContext.lastModified.slice(-5);
  }

  const { error } = await supabase
    .from('playcraft_project_memory')
    .update({ active_context: updatedContext })
    .eq('project_id', projectId);

  if (error) {
    console.error('[ProjectMemoryService] Failed to update active context:', error);
  }
}

// ============================================================================
// CLEANUP
// ============================================================================

/**
 * Delete all memory for a project
 */
export async function deleteProjectMemory(projectId: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_project_memory')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    console.error('[ProjectMemoryService] Failed to delete memory:', error);
  }
}

/**
 * Reset memory to initial state (keep summary)
 */
export async function resetProjectMemory(projectId: string): Promise<void> {
  const memory = await getProjectMemory(projectId);

  await upsertProjectMemory(projectId, {
    project_summary: memory?.project_summary,
    game_type: memory?.game_type,
    tech_stack: memory?.tech_stack || [],
    completed_tasks: [],
    file_importance: {},
    key_entities: [],
  });
}
