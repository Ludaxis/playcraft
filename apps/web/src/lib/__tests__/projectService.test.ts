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

vi.mock('../fileStorageService', () => ({
  uploadProjectFiles: vi.fn(),
  downloadProjectFiles: vi.fn(),
  deleteAllProjectFiles: vi.fn(),
}));

import { getProjects, createProject, updateProject, deleteProject, ensureDraftPool } from '../projectService';

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

    it('creates project successfully when reuseDraft is false', async () => {
      const mockProject = { id: '1', name: 'Test Project' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const insertMock = vi.fn().mockReturnValue({
        select: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: mockProject,
            error: null,
          }),
        }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return { insert: insertMock } as never;
        }
        return { insert: vi.fn() } as never;
      });

      const project = await createProject({ name: 'Test Project', reuseDraft: false });
      expect(project).toEqual(mockProject);
      expect(insertMock).toHaveBeenCalled();
    });

    it('reuses draft when available', async () => {
      const mockDraft = { id: 'draft-1', name: 'Draft workspace' };
      const updatedProject = { id: 'draft-1', name: 'Renamed' };

      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: 'user-1' } },
        error: null,
      });

      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            eq: vi.fn().mockReturnValue({
              order: vi.fn().mockReturnValue({
                limit: vi.fn().mockReturnValue({
                  maybeSingle: vi.fn().mockResolvedValue({ data: mockDraft, error: null }),
                }),
              }),
            }),
          }),
        }),
      });

      const updateMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          select: vi.fn().mockReturnValue({
            single: vi.fn().mockResolvedValue({ data: updatedProject, error: null }),
          }),
        }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return { select: selectMock, update: updateMock } as never;
        }
        return { select: vi.fn(), update: vi.fn() } as never;
      });

      const project = await createProject({ name: 'Renamed', reuseDraft: true });
      expect(project).toEqual(updatedProject);
      expect(selectMock).toHaveBeenCalled();
      expect(updateMock).toHaveBeenCalled();
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
      // Mock the select call to get project info first
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: 'user-1', use_storage: false },
            error: null,
          }),
        }),
      });

      // Mock the delete call
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({
          error: null,
        }),
      });

      // Return different mocks based on the call
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return {
            select: selectMock,
            delete: deleteMock,
          };
        }
        return {
          delete: deleteMock,
        };
      });

      await expect(deleteProject('1')).resolves.toBeUndefined();
    });

    it('throws on delete error', async () => {
      // Mock the select call to get project info first
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          single: vi.fn().mockResolvedValue({
            data: { user_id: 'user-1', use_storage: false },
            error: null,
          }),
        }),
      });

      // Mock delete to fail on the final project delete
      // Note: We have 5 delete calls (chat_sessions, chat_messages, project_memory, project_files, projects)
      let deleteCallCount = 0;
      const deleteMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockImplementation(() => {
          deleteCallCount++;
          // Fail on the last delete (the project itself - 5th call)
          if (deleteCallCount >= 5) {
            return Promise.resolve({ error: { message: 'Delete failed' } });
          }
          return Promise.resolve({ error: null });
        }),
      });

      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return {
            select: selectMock,
            delete: deleteMock,
          };
        }
        return {
          delete: deleteMock,
        };
      });

      await expect(deleteProject('1')).rejects.toThrow('Failed to delete project');
    });
  });

  describe('ensureDraftPool', () => {
    it('does nothing if draft pool exists', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: { id: 'draft' }, error: null }),
            }),
          }),
        }),
      });

      const insertMock = vi.fn();

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return { select: selectMock, insert: insertMock } as never;
        }
        return { select: vi.fn() } as never;
      });

      await ensureDraftPool();
      expect(insertMock).not.toHaveBeenCalled();
    });

    it('creates draft pool when missing', async () => {
      const selectMock = vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({
          eq: vi.fn().mockReturnValue({
            limit: vi.fn().mockReturnValue({
              maybeSingle: vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } }),
            }),
          }),
        }),
      });

      const insertMock = vi.fn().mockResolvedValue({});

      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: { id: 'user-1' } }, error: null });
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'playcraft_projects') {
          return { select: selectMock, insert: insertMock } as never;
        }
        return { select: vi.fn() } as never;
      });

      await ensureDraftPool();
      expect(insertMock).toHaveBeenCalled();
    });
  });
});
