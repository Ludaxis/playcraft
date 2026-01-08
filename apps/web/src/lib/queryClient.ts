/**
 * TanStack Query Client Configuration
 *
 * Centralized configuration for React Query with optimized defaults
 * for the PlayCraft application.
 */

import { QueryClient } from '@tanstack/react-query';

/**
 * Default stale time for queries (2 minutes)
 * Matches the previous CACHE_TIMEOUT in projectStore
 */
const DEFAULT_STALE_TIME = 2 * 60 * 1000;

/**
 * Garbage collection time (10 minutes)
 * How long inactive query data stays in cache
 */
const DEFAULT_GC_TIME = 10 * 60 * 1000;

/**
 * Create and configure the QueryClient instance
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is considered fresh for 2 minutes
      staleTime: DEFAULT_STALE_TIME,
      // Keep unused data in cache for 10 minutes
      gcTime: DEFAULT_GC_TIME,
      // Retry failed requests up to 3 times
      retry: 3,
      // Refetch when window regains focus
      refetchOnWindowFocus: true,
      // Don't refetch when component remounts if data is fresh
      refetchOnMount: true,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      // Retry failed mutations up to 3 times
      retry: 3,
      // Retry with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
  },
});

/**
 * Query key factory for type-safe query keys
 * Usage: queryKeys.projects.all() or queryKeys.projects.detail(id)
 */
export const queryKeys = {
  projects: {
    all: ['projects'] as const,
    list: (workspaceId: string | null | undefined = 'all') =>
      [...queryKeys.projects.all, 'list', workspaceId ?? 'all'] as const,
    detail: (id: string) => [...queryKeys.projects.all, 'detail', id] as const,
  },
  settings: {
    all: ['settings'] as const,
    user: () => [...queryKeys.settings.all, 'user'] as const,
    usage: () => [...queryKeys.settings.all, 'usage'] as const,
  },
  workspaces: {
    all: ['workspaces'] as const,
    list: () => [...queryKeys.workspaces.all, 'list'] as const,
    detail: (id: string) => [...queryKeys.workspaces.all, 'detail', id] as const,
    invites: () => [...queryKeys.workspaces.all, 'invites'] as const,
  },
  profile: {
    all: ['profile'] as const,
    details: () => [...queryKeys.profile.all, 'details'] as const,
  },
  chatSessions: {
    all: ['chatSessions'] as const,
    byProject: (projectId: string) =>
      [...queryKeys.chatSessions.all, 'project', projectId] as const,
    detail: (sessionId: string) =>
      [...queryKeys.chatSessions.all, 'detail', sessionId] as const,
  },
  assets: {
    all: ['assets'] as const,
    byProject: (projectId: string) =>
      [...queryKeys.assets.all, 'project', projectId] as const,
    byCategory: (projectId: string, category: string) =>
      [...queryKeys.assets.all, 'project', projectId, 'category', category] as const,
    detail: (assetId: string) =>
      [...queryKeys.assets.all, 'detail', assetId] as const,
    manifest: (projectId: string) =>
      [...queryKeys.assets.all, 'manifest', projectId] as const,
  },
} as const;
