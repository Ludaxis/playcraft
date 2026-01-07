import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useUserProfile, useUpdateUserProfile } from '../useUserProfile';
import * as profileService from '../../lib/profileService';
import { queryKeys } from '../../lib/queryClient';
import type { UserProfile } from '../../types';

// Mock the profile service
vi.mock('../../lib/profileService');

const createTestQueryClient = () => new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable retries for tests
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={createTestQueryClient()}>
    {children}
  </QueryClientProvider>
);

describe('User Profile Hooks', () => {
  const mockProfile: UserProfile = {
    id: 'user-123',
    full_name: 'Test User',
    bio: 'A test bio',
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('useUserProfile', () => {
    it('should fetch and return the user profile', async () => {
      vi.mocked(profileService.getProfile).mockResolvedValue(mockProfile);

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => expect(result.current.isSuccess).toBe(true));

      expect(profileService.getProfile).toHaveBeenCalledTimes(1);
      expect(result.current.data).toEqual(mockProfile);
    });

    it('should return an error state if fetching fails', async () => {
      const testError = new Error('Failed to fetch');
      vi.mocked(profileService.getProfile).mockRejectedValue(testError);

      const { result } = renderHook(() => useUserProfile(), { wrapper });

      await waitFor(() => expect(result.current.isError).toBe(true));

      expect(result.current.error).toBe(testError);
    });
  });

  describe('useUpdateUserProfile', () => {
    it('should call updateProfile and update cache on success', async () => {
        const queryClient = createTestQueryClient();
        queryClient.setQueryData(queryKeys.profile.details(), mockProfile);

        const updates: Partial<UserProfile> = { full_name: 'Updated Name' };
        const finalProfile = { ...mockProfile, ...updates };

        vi.mocked(profileService.updateProfile).mockResolvedValue(finalProfile);

        const { result } = renderHook(() => useUpdateUserProfile(), {
            wrapper: ({ children }) => <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
        });

        result.current.mutate(updates);

        await waitFor(() => expect(result.current.isSuccess).toBe(true));

        expect(profileService.updateProfile).toHaveBeenCalledWith(updates);
        const finalData = queryClient.getQueryData(queryKeys.profile.details());
        expect(finalData).toEqual(finalProfile);
    });
  });
});
