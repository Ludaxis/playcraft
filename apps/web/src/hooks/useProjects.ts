/**
 * TanStack Query hooks for project management
 *
 * Replaces the manual caching in projectStore with React Query's
 * built-in caching, deduplication, and background refetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  getProjects,
  getProject,
  createProject,
  updateProject,
  deleteProject,
} from '../lib/projectService';
import type {
  PlayCraftProject,
  CreateProjectInput,
  UpdateProjectInput,
} from '../types';

/**
 * Fetch all projects for the current user
 *
 * Features:
 * - Automatic caching (2 min stale time)
 * - Background refetching
 * - Deduplication of concurrent requests
 *
 * @example
 * const { data: projects, isLoading, error } = useProjects();
 */
export function useProjects() {
  return useQuery({
    queryKey: queryKeys.projects.all,
    queryFn: getProjects,
  });
}

/**
 * Fetch a single project by ID
 *
 * @param projectId - The project ID to fetch
 * @param options - Additional query options
 *
 * @example
 * const { data: project } = useProject('abc123');
 */
export function useProject(
  projectId: string | undefined,
  options?: { enabled?: boolean }
) {
  return useQuery({
    queryKey: queryKeys.projects.detail(projectId ?? ''),
    queryFn: () => getProject(projectId!),
    enabled: !!projectId && (options?.enabled ?? true),
  });
}

/**
 * Create a new project
 *
 * Optimistically adds the project to the cache on success.
 *
 * @example
 * const createMutation = useCreateProject();
 * await createMutation.mutateAsync({ name: 'My Project' });
 */
export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: (newProject) => {
      // Add to the projects list cache
      queryClient.setQueryData<PlayCraftProject[]>(
        queryKeys.projects.all,
        (oldProjects) => {
          if (!oldProjects) return [newProject];
          return [newProject, ...oldProjects];
        }
      );
      // Also cache the individual project
      queryClient.setQueryData(
        queryKeys.projects.detail(newProject.id),
        newProject
      );
    },
  });
}

/**
 * Update an existing project
 *
 * Optimistically updates the cache with the new data.
 *
 * @example
 * const updateMutation = useUpdateProject();
 * await updateMutation.mutateAsync({
 *   id: 'abc123',
 *   updates: { name: 'New Name' }
 * });
 */
export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      updates,
    }: {
      id: string;
      updates: UpdateProjectInput;
    }) => updateProject(id, updates),
    onSuccess: (updatedProject) => {
      // Update in the projects list
      queryClient.setQueryData<PlayCraftProject[]>(
        queryKeys.projects.all,
        (oldProjects) => {
          if (!oldProjects) return [updatedProject];
          return oldProjects.map((p) =>
            p.id === updatedProject.id ? updatedProject : p
          );
        }
      );
      // Update individual project cache
      queryClient.setQueryData(
        queryKeys.projects.detail(updatedProject.id),
        updatedProject
      );
    },
  });
}

/**
 * Delete a project
 *
 * Removes the project from the cache on success.
 *
 * @example
 * const deleteMutation = useDeleteProject();
 * await deleteMutation.mutateAsync('abc123');
 */
export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteProject(projectId),
    onSuccess: (_, deletedId) => {
      // Remove from projects list
      queryClient.setQueryData<PlayCraftProject[]>(
        queryKeys.projects.all,
        (oldProjects) => {
          if (!oldProjects) return [];
          return oldProjects.filter((p) => p.id !== deletedId);
        }
      );
      // Remove individual project cache
      queryClient.removeQueries({
        queryKey: queryKeys.projects.detail(deletedId),
      });
    },
  });
}

/**
 * Invalidate the projects cache
 *
 * Forces a refetch of the projects list.
 *
 * @example
 * const invalidate = useInvalidateProjects();
 * invalidate();
 */
export function useInvalidateProjects() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
  };
}

/**
 * Selector for recent projects (last 5)
 *
 * @param projects - Full projects array
 * @returns First 5 projects
 */
export function selectRecentProjects(
  projects: PlayCraftProject[] | undefined
): PlayCraftProject[] {
  if (!projects) return [];
  return projects.slice(0, 5);
}
