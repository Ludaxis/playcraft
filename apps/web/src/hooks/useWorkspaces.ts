import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { createWorkspace, getWorkspaces, inviteToWorkspace } from '../lib/workspaceService';
import type { Workspace, WorkspaceInvite, WorkspaceWithMembership } from '../types';

export function useWorkspaces() {
  return useQuery<WorkspaceWithMembership[]>({
    queryKey: queryKeys.workspaces.list(),
    queryFn: getWorkspaces,
    staleTime: 5 * 60 * 1000,
  });
}

export function useCreateWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<Workspace, Error, { name: string }>({
    mutationFn: ({ name }) => createWorkspace(name),
    onSuccess: (workspace) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.projects.all });
      // Optimistically add to cache
      queryClient.setQueryData<WorkspaceWithMembership[]>(
        queryKeys.workspaces.list(),
        (old = []) => [
          ...old,
          {
            workspace,
            membership: { role: 'owner', status: 'active', user_id: workspace.owner_id },
          },
        ]
      );
    },
  });
}

export function useInviteToWorkspace() {
  const queryClient = useQueryClient();

  return useMutation<WorkspaceInvite, Error, { workspaceId: string; email: string }>({
    mutationFn: ({ workspaceId, email }) => inviteToWorkspace({ workspaceId, email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.invites() });
    },
  });
}

export function useInvalidateWorkspaces() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.workspaces.all });
  };
}
