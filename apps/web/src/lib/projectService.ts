import { getSupabase } from './supabase';
import { withRetry } from './retry';
import { logger } from './logger';
import {
  uploadProjectFiles,
  downloadProjectFiles,
  deleteAllProjectFiles,
} from './fileStorageService';

export interface PlayCraftProject {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  has_three_js: boolean;
  status: 'draft' | 'building' | 'ready' | 'published';
  files: Record<string, string>;
  conversation: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  active_chat_session_id: string | null;
  published_url?: string | null;
  published_at?: string | null;
  is_public?: boolean;
  play_count?: number;
  is_starred?: boolean;
  use_storage?: boolean; // If true, files are in Supabase Storage instead of JSON blob
  created_at: string;
  updated_at: string;
  last_opened_at: string;
}

export interface CreateProjectInput {
  name: string;
  description?: string;
}

export interface UpdateProjectInput {
  name?: string;
  description?: string;
  has_three_js?: boolean;
  status?: PlayCraftProject['status'];
  files?: Record<string, string>;
  conversation?: PlayCraftProject['conversation'];
  active_chat_session_id?: string | null;
}

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<PlayCraftProject[]> {
  const supabase = getSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    logger.error('Auth error', authError, { component: 'projectService', action: 'getProjects' });
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  if (!user) {
    logger.warn('No authenticated user', { component: 'projectService', action: 'getProjects' });
    return [];
  }

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('*')
    .order('updated_at', { ascending: false });

  if (error) {
    logger.error('Database error', new Error(error.message), { component: 'projectService', action: 'getProjects' });
    throw new Error(`Failed to fetch projects: ${error.message}`);
  }

  logger.debug(`Found ${data?.length || 0} projects`, { component: 'projectService', userId: user.id });
  return data || [];
}

/**
 * Get a single project by ID
 * If use_storage is true, fetches files from Supabase Storage
 */
export async function getProject(id: string): Promise<PlayCraftProject | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  // If using Storage, fetch files from there instead of JSON blob
  if (data.use_storage) {
    try {
      logger.debug('Fetching files from Storage', {
        component: 'projectService',
        action: 'getProject',
        projectId: id,
      });

      const files = await downloadProjectFiles(data.user_id, id);
      data.files = files;

      logger.debug(`Loaded ${Object.keys(files).length} files from Storage`, {
        component: 'projectService',
        projectId: id,
      });
    } catch (err) {
      logger.error('Failed to fetch files from Storage, falling back to JSON', err instanceof Error ? err : new Error(String(err)), {
        component: 'projectService',
        action: 'getProject',
        projectId: id,
      });
      // Fall back to JSON blob if Storage fails
      // data.files already has the JSON blob value
    }
  }

  // Update last_opened_at
  await supabase
    .from('playcraft_projects')
    .update({ last_opened_at: new Date().toISOString() })
    .eq('id', id);

  return data;
}

/**
 * Create a new project
 */
export async function createProject(input: CreateProjectInput): Promise<PlayCraftProject> {
  const supabase = getSupabase();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError) {
    logger.error('Auth error', authError, { component: 'projectService', action: 'createProject' });
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  if (!user) {
    logger.error('No authenticated user', undefined, { component: 'projectService', action: 'createProject' });
    throw new Error('Not authenticated');
  }

  logger.info(`Creating project "${input.name}"`, { component: 'projectService', userId: user.id });

  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('playcraft_projects')
        .insert({
          user_id: user.id,
          name: input.name,
          description: input.description || null,
          has_three_js: false,
          status: 'draft',
          files: {}, // Empty JSON for backward compatibility
          conversation: [],
          use_storage: true, // New projects use Supabase Storage
        })
        .select()
        .single();

      if (error) {
        logger.error('Database error', new Error(error.message), { component: 'projectService', action: 'createProject' });
        throw new Error(`Failed to create project: ${error.message}`);
      }

      logger.info(`Created project ${data.id} with storage mode`, { component: 'projectService' });
      return data;
    },
    {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        logger.warn('Create project retry', { component: 'projectService', attempt, error: error.message });
      },
    }
  );
}

/**
 * Update a project
 */
export async function updateProject(id: string, input: UpdateProjectInput): Promise<PlayCraftProject> {
  const supabase = getSupabase();

  return withRetry(
    async () => {
      const { data, error } = await supabase
        .from('playcraft_projects')
        .update(input)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        throw new Error(`Failed to update project: ${error.message}`);
      }

      return data;
    },
    {
      maxAttempts: 3,
      onRetry: (attempt, error) => {
        logger.warn('Update project retry', { component: 'projectService', projectId: id, attempt, error: error.message });
      },
    }
  );
}

/**
 * Delete a project and all related data
 * This includes: project memory, file hashes, conversation summaries, published games, Storage files
 */
export async function deleteProject(id: string): Promise<void> {
  const supabase = getSupabase();

  // First, get the project to check if it uses Storage and get user_id
  const { data: project, error: fetchError } = await supabase
    .from('playcraft_projects')
    .select('user_id, use_storage')
    .eq('id', id)
    .single();

  if (fetchError && fetchError.code !== 'PGRST116') {
    throw new Error(`Failed to fetch project for deletion: ${fetchError.message}`);
  }

  // Delete in order due to foreign key constraints (cascade should handle most, but being explicit)
  // 1. Delete conversation summaries
  await supabase
    .from('playcraft_conversation_summaries')
    .delete()
    .eq('project_id', id);

  // 2. Delete file hashes
  await supabase
    .from('playcraft_file_hashes')
    .delete()
    .eq('project_id', id);

  // 3. Delete project memory
  await supabase
    .from('playcraft_project_memory')
    .delete()
    .eq('project_id', id);

  // 4. Delete project files (per-file storage table)
  await supabase
    .from('playcraft_project_files')
    .delete()
    .eq('project_id', id);

  // 5. Delete files from Supabase Storage (if project uses storage)
  if (project?.use_storage && project.user_id) {
    try {
      await deleteAllProjectFiles(project.user_id, id);
      logger.debug('Deleted Storage files', { component: 'projectService', projectId: id });
    } catch (err) {
      // Log but don't fail - DB deletion is more important
      logger.warn('Failed to delete Storage files', {
        component: 'projectService',
        projectId: id,
        error: err instanceof Error ? err.message : 'Unknown error',
      });
    }
  }

  // 6. Finally delete the project itself
  const { error } = await supabase
    .from('playcraft_projects')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete project: ${error.message}`);
  }

  logger.info(`Deleted project ${id} and all related data`, { component: 'projectService' });
}

// =============================================================================
// SAVE THROTTLING
// =============================================================================
// Prevents excessive saves by throttling requests per project

interface ThrottleState {
  lastSave: number;
  pendingFiles: Record<string, string> | null;
  timeoutId: ReturnType<typeof setTimeout> | null;
}

const saveThrottleMap = new Map<string, ThrottleState>();
const SAVE_THROTTLE_MS = 3000; // Minimum 3 seconds between saves

/**
 * Save project files with throttling to prevent excessive database writes
 */
export async function saveProjectFiles(
  id: string,
  files: Record<string, string>
): Promise<void> {
  const now = Date.now();
  let state = saveThrottleMap.get(id);

  if (!state) {
    state = { lastSave: 0, pendingFiles: null, timeoutId: null };
    saveThrottleMap.set(id, state);
  }

  const timeSinceLastSave = now - state.lastSave;

  // If enough time has passed, save immediately
  if (timeSinceLastSave >= SAVE_THROTTLE_MS) {
    await doSaveProjectFiles(id, files);
    state.lastSave = Date.now();
    state.pendingFiles = null;
    return;
  }

  // Otherwise, schedule a delayed save
  state.pendingFiles = files;

  if (!state.timeoutId) {
    const delay = SAVE_THROTTLE_MS - timeSinceLastSave;
    state.timeoutId = setTimeout(async () => {
      const currentState = saveThrottleMap.get(id);
      if (currentState?.pendingFiles) {
        try {
          await doSaveProjectFiles(id, currentState.pendingFiles);
          currentState.lastSave = Date.now();
          currentState.pendingFiles = null;
        } catch (error) {
          logger.error('Throttled save failed', error instanceof Error ? error : new Error(String(error)), {
            component: 'projectService',
            projectId: id,
          });
        }
      }
      if (currentState) {
        currentState.timeoutId = null;
      }
    }, delay);
  }
}

/**
 * Internal: Actually save files (routes to Storage or JSON blob based on project settings)
 */
async function doSaveProjectFiles(
  id: string,
  files: Record<string, string>
): Promise<void> {
  const supabase = getSupabase();

  // Check if project uses Storage
  const { data: project, error: fetchError } = await supabase
    .from('playcraft_projects')
    .select('user_id, use_storage')
    .eq('id', id)
    .single();

  if (fetchError) {
    throw new Error(`Failed to fetch project: ${fetchError.message}`);
  }

  if (project.use_storage) {
    // Save to Supabase Storage
    try {
      await uploadProjectFiles(project.user_id, id, files);
      logger.debug(`Saved ${Object.keys(files).length} files to Storage`, {
        component: 'projectService',
        action: 'doSaveProjectFiles',
        projectId: id,
      });
    } catch (err) {
      logger.error('Failed to save files to Storage', err instanceof Error ? err : new Error(String(err)), {
        component: 'projectService',
        projectId: id,
      });
      throw err;
    }
  } else {
    // Save to JSON blob (legacy mode)
    const { error } = await supabase
      .from('playcraft_projects')
      .update({ files })
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to save files: ${error.message}`);
    }
  }
}

/**
 * Force immediate save (bypasses throttle) - use for critical saves
 */
export async function saveProjectFilesImmediate(
  id: string,
  files: Record<string, string>
): Promise<void> {
  // Clear any pending throttled save
  const state = saveThrottleMap.get(id);
  if (state?.timeoutId) {
    clearTimeout(state.timeoutId);
    state.timeoutId = null;
  }

  await doSaveProjectFiles(id, files);

  if (state) {
    state.lastSave = Date.now();
    state.pendingFiles = null;
  }
}

// =============================================================================
// PER-FILE STORAGE (New API - for future migration)
// =============================================================================
// These functions use the new per-file storage table for better scalability

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string | null;
  is_directory: boolean;
  size_bytes: number;
  version: number;
  created_at: string;
  updated_at: string;
}

/**
 * Get all files for a project (per-file storage)
 */
export async function getProjectFilesV2(projectId: string): Promise<ProjectFile[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_project_files')
    .select('*')
    .eq('project_id', projectId)
    .order('path');

  if (error) {
    throw new Error(`Failed to fetch project files: ${error.message}`);
  }

  return data || [];
}

/**
 * Save a single file (per-file storage with optimistic locking)
 */
export async function saveProjectFileV2(
  projectId: string,
  path: string,
  content: string,
  expectedVersion?: number
): Promise<ProjectFile> {
  const supabase = getSupabase();

  // Check if file exists
  const { data: existing } = await supabase
    .from('playcraft_project_files')
    .select('id, version')
    .eq('project_id', projectId)
    .eq('path', path)
    .single();

  if (existing) {
    // Update existing file with optimistic locking
    if (expectedVersion !== undefined && existing.version !== expectedVersion) {
      throw new Error(`Conflict: File "${path}" was modified. Expected version ${expectedVersion}, got ${existing.version}`);
    }

    const { data, error } = await supabase
      .from('playcraft_project_files')
      .update({
        content,
        size_bytes: content.length,
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update file: ${error.message}`);
    }

    return data;
  } else {
    // Insert new file
    const { data, error } = await supabase
      .from('playcraft_project_files')
      .insert({
        project_id: projectId,
        path,
        content,
        is_directory: false,
        size_bytes: content.length,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create file: ${error.message}`);
    }

    return data;
  }
}

/**
 * Delete a file (per-file storage)
 */
export async function deleteProjectFileV2(projectId: string, path: string): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_project_files')
    .delete()
    .eq('project_id', projectId)
    .eq('path', path);

  if (error) {
    throw new Error(`Failed to delete file: ${error.message}`);
  }
}

/**
 * Convert per-file storage to Record format (for compatibility)
 */
export function filesToRecord(files: ProjectFile[]): Record<string, string> {
  const result: Record<string, string> = {};
  for (const file of files) {
    if (!file.is_directory && file.content !== null) {
      result[file.path] = file.content;
    }
  }
  return result;
}

/**
 * Get project with version for optimistic locking
 */
export async function getProjectWithVersion(id: string): Promise<(PlayCraftProject & { version: number }) | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('*, version')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null;
    }
    throw new Error(`Failed to fetch project: ${error.message}`);
  }

  return data;
}

/**
 * Update project with optimistic locking
 */
export async function updateProjectWithVersion(
  id: string,
  input: UpdateProjectInput,
  expectedVersion: number
): Promise<PlayCraftProject & { version: number }> {
  const supabase = getSupabase();

  // First verify the version matches
  const { data: current, error: checkError } = await supabase
    .from('playcraft_projects')
    .select('version')
    .eq('id', id)
    .single();

  if (checkError) {
    throw new Error(`Failed to check project version: ${checkError.message}`);
  }

  if (current.version !== expectedVersion) {
    throw new Error(
      `Conflict: Project was modified by another session. ` +
      `Expected version ${expectedVersion}, got ${current.version}. ` +
      `Please refresh and try again.`
    );
  }

  // Perform the update
  const { data, error } = await supabase
    .from('playcraft_projects')
    .update(input)
    .eq('id', id)
    .select('*, version')
    .single();

  if (error) {
    throw new Error(`Failed to update project: ${error.message}`);
  }

  return data;
}

/**
 * Save project conversation
 */
export async function saveProjectConversation(
  id: string,
  conversation: PlayCraftProject['conversation']
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_projects')
    .update({ conversation })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to save conversation: ${error.message}`);
  }
}

/**
 * Update project status
 */
export async function updateProjectStatus(
  id: string,
  status: PlayCraftProject['status']
): Promise<void> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_projects')
    .update({ status })
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to update status: ${error.message}`);
  }
}
