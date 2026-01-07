import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from '../lib/queryClient';
import { getProfile, updateProfile } from '../lib/profileService';
import type { UserProfile } from '../types';

/**
 * Fetches the current user's profile.
 *
 * @example
 * const { data: profile, isLoading } = useUserProfile();
 */
export function useUserProfile() {
  return useQuery({
    queryKey: queryKeys.profile.details(),
    queryFn: getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Updates the current user's profile.
 *
 * Optimistically updates the cache and rolls back on error.
 *
 * @example
 * const updateProfileMutation = useUpdateUserProfile();
 * await updateProfileMutation.mutateAsync({ full_name: 'New Name' });
 */
export function useUpdateUserProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (updates: Partial<UserProfile>) => updateProfile(updates),
    onMutate: async (newProfileData) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: queryKeys.profile.details() });

      // Snapshot the previous value
      const previousProfile = queryClient.getQueryData<UserProfile>(
        queryKeys.profile.details()
      );

      // Optimistically update to the new value
      if (previousProfile) {
        queryClient.setQueryData<UserProfile>(queryKeys.profile.details(), {
          ...previousProfile,
          ...newProfileData,
        });
      }

      return { previousProfile };
    },
    onError: (_err, _newProfile, context) => {
      // Rollback to the previous value on error
      if (context?.previousProfile) {
        queryClient.setQueryData(
          queryKeys.profile.details(),
          context.previousProfile
        );
      }
    },
    onSettled: () => {
      // Always refetch after error or success to ensure server state
      queryClient.invalidateQueries({ queryKey: queryKeys.profile.details() });
    },
  });
}
