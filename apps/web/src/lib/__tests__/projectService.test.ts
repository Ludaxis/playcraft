import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('../supabase', () => ({
  getSupabase: () => mockSupabase,
}));

vi.mock('../retry', () => ({
  withRetry: vi.fn((fn) => fn()),
}));

vi.mock('../logger', () => ({
  logger: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

import { getProjects, createProject, updateProject, deleteProject } from '../projectService';

describe('projectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getProjects', () => {
    it('returns empty array when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      const projects = await getProjects();
      expect(projects).toEqual([]);
    });

    it('throws on auth error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'Auth failed' },
      });

      await expect(getProjects()).rejects.toThrow('Authentication failed');
    });

    it('returns projects for authenticated user', async () => {
      const mockProjects = [{ id: '1', name: 'Test Project' }];

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: mockProjects,
            error: null,
          }),
        }),
      });

      const projects = await getProjects();
      expect(projects).toEqual(mockProjects);
    });

    it('throws on database error', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnValue({
          order: vi.fn().mockResolvedValue({
            data: null,
            error: { message: 'Database error' },
          }),
        }),
      });

      await expect(getProjects()).rejects.toThrow('Failed to fetch projects');
    });
  });

  describe('createProject', () => {
    it('throws when not authenticated', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: null,
      });

      await expect(createProject({ name: 'Test' })).rejects.toThrow('Not authenticated');
    });

    it('creates project successfully', async () => {
      const mockProject = { id: '1', name: 'Test Project' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        insert: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({
              data: mockProject,
              error: null,
            }),
          }),
        }),
      });

      const project = await createProject({ name: 'Test Project' });
      expect(project).toEqual(mockProject);
    });
  });

  describe('updateProject', () => {
    it('updates project successfully', async () => {
      const mockProject = { id: '1', name: 'Updated' };

      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: mockProject,
                error: null,
              }),
            }),
          }),
        }),
      });

      const project = await updateProject('1', { name: 'Updated' });
      expect(project).toEqual(mockProject);
    });

    it('throws on update error', async () => {
      mockSupabase.from.mockReturnValue({
        update: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            select: vi.fn().mockReturnValue({
              single: vi.fn().mockResolvedValue({
                data: null,
                error: { message: 'Update failed' },
              }),
            }),
          }),
        }),
      });

      await expect(updateProject('1', { name: 'Updated' })).rejects.toThrow('Failed to update project');
    });
  });

  describe('deleteProject', () => {
    it('deletes project successfully', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: null,
          }),
        }),
      });

      await expect(deleteProject('1')).resolves.toBeUndefined();
    });

    it('throws on delete error', async () => {
      mockSupabase.from.mockReturnValue({
        delete: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({
            error: { message: 'Delete failed' },
          }),
        }),
      });

      await expect(deleteProject('1')).rejects.toThrow('Failed to delete project');
    });
  });
});
