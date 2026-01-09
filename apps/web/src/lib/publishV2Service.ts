/**
 * Publishing v2 client types and stubbed service calls.
 *
 * These mirror the proposed server-managed pipeline (see docs/publishing-v2-architecture.md).
 * Once the API endpoints are live, wire these to Supabase Functions or an /api/publish route.
 */

import { getSupabase } from './supabase';

export type PublishTarget = 'preview' | 'production';
export type PublishJobStatus = 'queued' | 'building' | 'uploading' | 'finalizing' | 'published' | 'failed';

export interface PublishJob {
  id: string;
  project_id: string;
  status: PublishJobStatus;
  progress: number;
  message?: string | null;
  log_url?: string | null;
  version_id?: string | null;
  created_at: string;
  updated_at: string;
}

export interface PublishVersion {
  id: string;
  project_id: string;
  version_tag: string;
  storage_prefix: string;
  entrypoint: string;
  built_at: string;
  is_preview: boolean;
  checksum?: string | null;
  size_bytes?: number | null;
}

export interface ProjectPublishState {
  primary_version_id?: string | null;
  preview_version_id?: string | null;
  domains: Array<{
    id: string;
    domain: string;
    type: 'slug' | 'custom';
    verification_status: 'pending' | 'verified' | 'failed';
    ssl_status: 'pending' | 'active' | 'failed';
    target_version?: string | null;
  }>;
}

/**
 * Enqueue a publish job. Currently a stub that hits Supabase RPC placeholder.
 */
export async function enqueuePublishJob(projectId: string, target: PublishTarget): Promise<PublishJob | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase.functions.invoke<{
    success: boolean;
    jobId?: string;
    error?: string;
  }>('publish-enqueue', {
    body: { projectId, target },
  });

  if (error || !data?.success || !data.jobId) {
    console.error('[publishV2] enqueue failed:', error || data?.error);
    return null;
  }

  // Only id is known at enqueue time; caller should poll for status
  return {
    id: data.jobId,
    project_id: projectId,
    status: 'queued',
    progress: 0,
    message: `Queued for ${target}`,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  } as PublishJob;
}

/**
 * Fetch publish job status. Stubbed to query Supabase table directly for now.
 */
export async function getPublishJobStatus(jobId: string): Promise<PublishJob | null> {
  const supabase = getSupabase();

  // TODO: replace with API route that handles auth + service role
  const { data, error } = await supabase
    .from('publish_jobs')
    .select('*')
    .eq('id', jobId)
    .maybeSingle();

  if (error || !data) {
    console.error('[publishV2] status lookup failed:', error);
    return null;
  }

  return data as PublishJob;
}

/**
 * Lightweight project publish state lookup (version pointers + domains).
 */
export async function getProjectPublishState(projectId: string): Promise<ProjectPublishState | null> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('playcraft_projects')
    .select('primary_version_id, preview_version_id')
    .eq('id', projectId)
    .maybeSingle();

  if (error || !data) {
    console.error('[publishV2] failed to fetch project publish state:', error);
    return null;
  }

  const { data: domains, error: domainsError } = await supabase
    .from('game_domains')
    .select('id, domain, type, verification_status, ssl_status, target_version')
    .eq('project_id', projectId);

  if (domainsError) {
    console.error('[publishV2] failed to fetch domains:', domainsError);
  }

  return {
    primary_version_id: (data as Record<string, unknown>).primary_version_id as string | null,
    preview_version_id: (data as Record<string, unknown>).preview_version_id as string | null,
    domains: (domains || []) as ProjectPublishState['domains'],
  };
}

export async function listPublishVersions(projectId: string): Promise<PublishVersion[]> {
  const supabase = getSupabase();

  const { data, error } = await supabase
    .from('publish_versions')
    .select('*')
    .eq('project_id', projectId)
    .order('built_at', { ascending: false });

  if (error || !data) {
    console.error('[publishV2] failed to list versions:', error);
    return [];
  }

  return data as PublishVersion[];
}

export async function promoteVersion(projectId: string, versionId: string): Promise<boolean> {
  const supabase = getSupabase();

  const { data, error } = await supabase.functions.invoke<{ success: boolean; error?: string }>(
    'publish-promote',
    {
      body: { projectId, versionId },
    }
  );

  if (error || !data?.success) {
    console.error('[publishV2] promote failed:', error || data?.error);
    return false;
  }

  return true;
}
