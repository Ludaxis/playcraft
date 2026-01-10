/**
 * TanStack Query hooks for GitHub connection management
 *
 * Provides hooks for fetching and managing GitHub repository connections
 * for PlayCraft projects.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  getGitHubConnection,
  createGitHubConnection,
  updateGitHubConnection,
  deleteGitHubConnection,
  recordPush,
  recordPull,
  getGitHubUser,
  listRepositories,
  listBranches,
  pushToGitHub,
  pullFromGitHub,
  checkForRemoteChanges,
  validateGitHubConnection,
  connectionInputFromRepository,
  type GitHubRepository,
  type GitHubBranch,
} from '../lib/githubService';
import type {
  GitHubConnection,
  CreateGitHubConnectionInput,
  UpdateGitHubConnectionInput,
} from '../types';

/**
 * Fetch the GitHub connection for a project
 *
 * @param projectId - The project ID to fetch connection for
 */
export function useGitHubConnection(projectId: string | undefined) {
  return useQuery({
    queryKey: queryKeys.github.connection(projectId ?? ''),
    queryFn: () => getGitHubConnection(projectId!),
    enabled: !!projectId,
  });
}

/**
 * Fetch the current GitHub user
 */
export function useGitHubUser() {
  return useQuery({
    queryKey: queryKeys.github.user(),
    queryFn: getGitHubUser,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Validate if GitHub is connected
 */
export function useGitHubConnected() {
  return useQuery({
    queryKey: [...queryKeys.github.all, 'connected'],
    queryFn: validateGitHubConnection,
    retry: false,
    staleTime: 60 * 1000, // 1 minute
  });
}

/**
 * Fetch user's GitHub repositories
 */
export function useGitHubRepositories(enabled: boolean = true) {
  return useQuery({
    queryKey: queryKeys.github.repositories(),
    queryFn: listRepositories,
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
  });
}

/**
 * Fetch branches for a repository
 */
export function useGitHubBranches(
  owner: string | undefined,
  repo: string | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: queryKeys.github.branches(owner ?? '', repo ?? ''),
    queryFn: () => listBranches(owner!, repo!),
    enabled: enabled && !!owner && !!repo,
  });
}

/**
 * Create a new GitHub connection for a project
 */
export function useCreateGitHubConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateGitHubConnectionInput) => createGitHubConnection(input),
    onSuccess: (connection) => {
      queryClient.setQueryData(
        queryKeys.github.connection(connection.project_id),
        connection
      );
    },
  });
}

/**
 * Update an existing GitHub connection
 */
export function useUpdateGitHubConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      updates,
    }: {
      projectId: string;
      updates: UpdateGitHubConnectionInput;
    }) => updateGitHubConnection(projectId, updates),
    onSuccess: (connection) => {
      queryClient.setQueryData(
        queryKeys.github.connection(connection.project_id),
        connection
      );
    },
  });
}

/**
 * Delete a GitHub connection
 */
export function useDeleteGitHubConnection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (projectId: string) => deleteGitHubConnection(projectId),
    onSuccess: (_, projectId) => {
      queryClient.setQueryData(queryKeys.github.connection(projectId), null);
    },
  });
}

/**
 * Push files to GitHub
 */
export function usePushToGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      connection,
      files,
      message,
    }: {
      projectId: string;
      connection: GitHubConnection;
      files: Record<string, string>;
      message: string;
    }) => {
      const result = await pushToGitHub(
        connection.repository_owner,
        connection.repository_name,
        connection.current_branch,
        files,
        message
      );

      if (result.success && result.commitSha) {
        // Record the push in the database
        await recordPush(projectId, result.commitSha);
      }

      return result;
    },
    onSuccess: (result, { projectId }) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.github.connection(projectId),
        });
      }
    },
  });
}

/**
 * Pull files from GitHub
 */
export function usePullFromGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      projectId,
      connection,
    }: {
      projectId: string;
      connection: GitHubConnection;
    }) => {
      const result = await pullFromGitHub(
        connection.repository_owner,
        connection.repository_name,
        connection.current_branch
      );

      if (result) {
        // Record the pull in the database
        await recordPull(projectId, result.sha);
      }

      return result;
    },
    onSuccess: (result, { projectId }) => {
      if (result) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.github.connection(projectId),
        });
      }
    },
  });
}

/**
 * Check if remote has changes
 */
export function useCheckRemoteChanges(
  connection: GitHubConnection | null | undefined,
  enabled: boolean = true
) {
  return useQuery({
    queryKey: [
      ...queryKeys.github.all,
      'remoteChanges',
      connection?.project_id,
      connection?.last_sync_sha,
    ],
    queryFn: () =>
      checkForRemoteChanges(
        connection!.repository_owner,
        connection!.repository_name,
        connection!.current_branch,
        connection!.last_sync_sha || ''
      ),
    enabled: enabled && !!connection && !!connection.last_sync_sha,
    refetchInterval: 30000, // Poll every 30 seconds (like Bolt.new)
    staleTime: 10000, // Consider fresh for 10 seconds
  });
}

/**
 * Connect a project to a repository
 * Helper that creates connection from a repository selection
 */
export function useConnectToRepository() {
  const createConnection = useCreateGitHubConnection();

  return useMutation({
    mutationFn: async ({
      projectId,
      repository,
      owner,
    }: {
      projectId: string;
      repository: GitHubRepository;
      owner: string;
    }) => {
      const input = connectionInputFromRepository(projectId, repository, owner);
      return createConnection.mutateAsync(input);
    },
  });
}

// Re-export types for convenience
export type { GitHubRepository, GitHubBranch };
