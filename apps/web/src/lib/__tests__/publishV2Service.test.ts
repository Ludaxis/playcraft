import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  enqueuePublishJob,
  getPublishJobStatus,
  listPublishVersions,
  promoteVersion,
  getProjectPublishState,
  type PublishJob,
  type PublishVersion,
} from '../publishV2Service';

// Minimal supabase stub with table-aware responses
const invokeMock = vi.fn();

type Tables = {
  publish_jobs: PublishJob | null;
  publish_versions: PublishVersion[];
  playcraft_projects: Record<string, unknown> | null;
  game_domains: Array<Record<string, unknown>>;
};

const tables: Tables = {
  publish_jobs: null,
  publish_versions: [],
  playcraft_projects: null,
  game_domains: [],
};

const supabaseStub = {
  functions: {
    invoke: invokeMock,
  },
  from: (table: string) => {
    if (table === 'publish_jobs') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: tables.publish_jobs, error: null }),
          }),
        }),
      };
    }

    if (table === 'publish_versions') {
      return {
        select: () => ({
          eq: () => ({
            order: async () => ({ data: tables.publish_versions, error: null }),
          }),
        }),
      };
    }

    if (table === 'playcraft_projects') {
      return {
        select: () => ({
          eq: () => ({
            maybeSingle: async () => ({ data: tables.playcraft_projects, error: null }),
          }),
        }),
      };
    }

    if (table === 'game_domains') {
      return {
        select: () => ({
          eq: async () => ({ data: tables.game_domains, error: null }),
        }),
      };
    }

    return { select: () => ({}) };
  },
};

vi.mock('../supabase', () => ({
  getSupabase: () => supabaseStub,
}));

beforeEach(() => {
  tables.publish_jobs = null;
  tables.publish_versions = [];
  tables.playcraft_projects = null;
  tables.game_domains = [];
  invokeMock.mockReset();
});

describe('publishV2Service', () => {
  it('enqueues publish job via function invoke', async () => {
    invokeMock.mockResolvedValueOnce({
      data: { success: true, jobId: 'job-123' },
      error: null,
    });

    const job = await enqueuePublishJob('proj-1', 'production');
    expect(invokeMock).toHaveBeenCalledWith('publish-enqueue', {
      body: { projectId: 'proj-1', target: 'production' },
    });
    expect(job?.id).toBe('job-123');
    expect(job?.status).toBe('queued');
  });

  it('returns publish job status from table', async () => {
    tables.publish_jobs = {
      id: 'job-1',
      project_id: 'proj-1',
      status: 'published',
      progress: 100,
      message: 'done',
      log_url: 'https://example.com/log',
      version_id: 'ver-1',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    const job = await getPublishJobStatus('job-1');
    expect(job?.status).toBe('published');
    expect(job?.log_url).toContain('log');
  });

  it('lists publish versions ordered by built_at desc', async () => {
    tables.publish_versions = [
      {
        id: 'v2',
        project_id: 'proj-1',
        version_tag: '200',
        storage_prefix: 'p/s/2',
        entrypoint: 'index.html',
        built_at: '2025-01-02T00:00:00.000Z',
        is_preview: false,
      },
      {
        id: 'v1',
        project_id: 'proj-1',
        version_tag: '100',
        storage_prefix: 'p/s/1',
        entrypoint: 'index.html',
        built_at: '2025-01-01T00:00:00.000Z',
        is_preview: false,
      },
    ];

    const versions = await listPublishVersions('proj-1');
    expect(versions).toHaveLength(2);
    expect(versions[0].id).toBe('v2');
  });

  it('promotes a version via function invoke', async () => {
    invokeMock.mockResolvedValueOnce({ data: { success: true }, error: null });

    const ok = await promoteVersion('proj-1', 'ver-1');
    expect(ok).toBe(true);
    expect(invokeMock).toHaveBeenCalledWith('publish-promote', {
      body: { projectId: 'proj-1', versionId: 'ver-1' },
    });
  });

  it('returns project publish state with domains', async () => {
    tables.playcraft_projects = { primary_version_id: 'v1', preview_version_id: 'v2' };
    tables.game_domains = [
      { id: 'd1', domain: 'foo.play.playcraft.games', type: 'slug', verification_status: 'verified', ssl_status: 'active', target_version: 'v1' },
    ];

    const state = await getProjectPublishState('proj-1');
    expect(state?.primary_version_id).toBe('v1');
    expect(state?.domains[0].domain).toContain('playcraft');
  });
});
