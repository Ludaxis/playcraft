/**
 * Deploy Service
 *
 * Handles one-click deployment of projects to playcraft.games subdomains.
 */

import { getSupabase } from './supabase';

export interface DeploymentStatus {
  status: 'idle' | 'deploying' | 'published' | 'failed';
  url?: string;
  error?: string;
  deployedAt?: string;
}

export interface DeployResult {
  success: boolean;
  url?: string;
  deploymentId?: string;
  error?: string;
}

export async function deployProject(
  projectId: string,
  projectName: string,
  files: Record<string, string>,
  customSubdomain?: string
): Promise<DeployResult> {
  const supabase = getSupabase();

  const { data: { session } } = await supabase.auth.getSession();
  if (!session) {
    return { success: false, error: 'Not authenticated' };
  }

  try {
    const response = await supabase.functions.invoke('deploy-project', {
      body: {
        projectId,
        projectName,
        files,
        customSubdomain,
      },
    });

    if (response.error) {
      return { success: false, error: response.error.message };
    }

    return {
      success: response.data.success,
      url: response.data.url,
      deploymentId: response.data.deploymentId,
      error: response.data.error,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Deployment failed',
    };
  }
}

export async function getDeploymentStatus(projectId: string): Promise<DeploymentStatus> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_deployments')
    .select('status, storage_path, published_at')
    .eq('project_id', projectId)
    .single();

  if (error || !data) {
    return { status: 'idle' };
  }

  if (data.status === 'published' && data.storage_path) {
    const { data: urlData } = supabase.storage
      .from('deployments')
      .getPublicUrl(data.storage_path);

    return {
      status: 'published',
      url: urlData.publicUrl,
      deployedAt: data.published_at,
    };
  }

  return {
    status: data.status as DeploymentStatus['status'],
  };
}

export async function undeployProject(projectId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { error } = await supabase
    .from('playcraft_deployments')
    .delete()
    .eq('project_id', projectId);

  if (error) {
    console.error('Undeploy error:', error);
    return false;
  }

  // Update project status
  await supabase
    .from('playcraft_projects')
    .update({
      status: 'draft',
      published_url: null,
      published_at: null,
    })
    .eq('id', projectId);

  return true;
}

export function generateSubdomainPreview(projectName: string, projectId: string): string {
  const cleanName = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 30);

  const shortId = projectId.slice(0, 8);
  return `${cleanName}-${shortId}`;
}
