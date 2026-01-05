/**
 * TanStack Query hooks for user settings management
 *
 * Replaces the manual caching in settingsStore with React Query's
 * built-in caching, deduplication, and background refetching.
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import {
  getUserSettings,
  updateUserSettings,
  getUsageStats,
  checkUsernameAvailable,
  connectGitHub,
  disconnectGitHub,
} from '../lib/settingsService';
import type { UserSettings, UpdateSettingsInput } from '../types';

/**
 * Fetch user settings
 *
 * Creates default settings if none exist.
 *
 * @example
 * const { data: settings, isLoading } = useUserSettings();
 */
export function useUserSettings() {
  return useQuery({
    queryKey: queryKeys.settings.user(),
    queryFn: getUserSettings,
    // Settings are less likely to change externally
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Fetch usage statistics
 *
 * @example
 * const { data: usage } = useUsageStats();
 */
export function useUsageStats() {
  return useQuery({
    queryKey: queryKeys.settings.usage(),
    queryFn: getUsageStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Update user settings
 *
 * Optimistically updates the cache.
 *
 * @example
 * const updateMutation = useUpdateSettings();
 * await updateMutation.mutateAsync({ display_name: 'New Name' });
 */
export function useUpdateSettings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: UpdateSettingsInput) => updateUserSettings(input),
    onMutate: async (newSettings) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.settings.user() });

      // Snapshot previous value
      const previousSettings = queryClient.getQueryData<UserSettings>(
        queryKeys.settings.user()
      );

      // Optimistically update
      if (previousSettings) {
        queryClient.setQueryData<UserSettings>(queryKeys.settings.user(), {
          ...previousSettings,
          ...newSettings,
        });
      }

      return { previousSettings };
    },
    onError: (_err, _newSettings, context) => {
      // Rollback on error
      if (context?.previousSettings) {
        queryClient.setQueryData(
          queryKeys.settings.user(),
          context.previousSettings
        );
      }
    },
    onSettled: () => {
      // Refetch to ensure server state
      queryClient.invalidateQueries({ queryKey: queryKeys.settings.user() });
    },
  });
}

/**
 * Check if a username is available
 *
 * @example
 * const { data: isAvailable } = useCheckUsername('myname');
 */
export function useCheckUsername(username: string) {
  return useQuery({
    queryKey: ['username-check', username],
    queryFn: () => checkUsernameAvailable(username),
    enabled: username.length >= 3,
    staleTime: 30 * 1000, // 30 seconds
  });
}

/**
 * Connect GitHub account
 *
 * @example
 * const connectMutation = useConnectGitHub();
 * connectMutation.mutate();
 */
export function useConnectGitHub() {
  return useMutation({
    mutationFn: connectGitHub,
  });
}

/**
 * Disconnect GitHub account
 *
 * @example
 * const disconnectMutation = useDisconnectGitHub();
 * await disconnectMutation.mutateAsync();
 */
export function useDisconnectGitHub() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: disconnectGitHub,
    onSuccess: (updatedSettings) => {
      queryClient.setQueryData(queryKeys.settings.user(), updatedSettings);
    },
  });
}

/**
 * Invalidate settings cache
 *
 * @example
 * const invalidate = useInvalidateSettings();
 * invalidate();
 */
export function useInvalidateSettings() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.settings.all });
  };
}
