import { getSupabase } from './supabase';
import { logger } from './logger';
import type {
  Workspace,
  WorkspaceInvite,
  WorkspaceMember,
  WorkspaceRole,
  WorkspaceWithMembership,
} from '../types';

export async function getWorkspaces(): Promise<WorkspaceWithMembership[]> {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  if (!user) return [];

  const { data, error } = await supabase
    .from('workspace_members')
    .select(
      'role, status, user_id, workspaces:workspaces (id, name, owner_id, created_at, updated_at)'
    )
    .eq('user_id', user.id)
    .eq('status', 'active')
    .order('created_at', { ascending: true });

  if (error) {
    logger.error('Failed to fetch workspaces', new Error(error.message), {
      component: 'workspaceService',
    });
    throw new Error(`Failed to fetch workspaces: ${error.message}`);
  }

  return (
    data?.map((row) => ({
      workspace: row.workspaces as Workspace,
      membership: {
        role: row.role as WorkspaceMember['role'],
        status: row.status as WorkspaceMember['status'],
        user_id: row.user_id,
      },
    })) ?? []
  );
}

export async function createWorkspace(name: string): Promise<Workspace> {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workspaces')
    .insert({ name, owner_id: user.id })
    .select()
    .single();

  if (error) {
    logger.error('Failed to create workspace', new Error(error.message), {
      component: 'workspaceService',
    });
    throw new Error(`Failed to create workspace: ${error.message}`);
  }

  return data as Workspace;
}

export async function inviteToWorkspace(params: {
  workspaceId: string;
  email: string;
  role?: WorkspaceRole;
  expiresAt?: string | null;
}): Promise<WorkspaceInvite> {
  const supabase = getSupabase();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError) {
    throw new Error(`Authentication failed: ${authError.message}`);
  }
  if (!user) throw new Error('Not authenticated');

  const { data, error } = await supabase
    .from('workspace_invites')
    .insert({
      workspace_id: params.workspaceId,
      email: params.email,
      role: params.role ?? 'editor',
      expires_at: params.expiresAt ?? null,
      invited_by: user.id,
    })
    .select()
    .single();

  if (error) {
    logger.error('Failed to invite to workspace', new Error(error.message), {
      component: 'workspaceService',
    });
    throw new Error(`Failed to invite: ${error.message}`);
  }

  return data as WorkspaceInvite;
}
