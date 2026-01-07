import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock the getSupabase function
const mockSupabaseClient = {
  auth: {
    getUser: vi.fn(),
  },
  from: vi.fn(),
};

vi.mock('../supabase', () => ({
  getSupabase: vi.fn(() => mockSupabaseClient),
}));

// Import the service AFTER the mock is set up
import { getProfile, updateProfile } from '../profileService';
import { getSupabase } from '../supabase'; // Import getSupabase to mock it

describe('profileService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Ensure getSupabase always returns our mock client
    vi.mocked(getSupabase).mockReturnValue(mockSupabaseClient as unknown as ReturnType<typeof getSupabase>);
  });

  const mockUserId = 'user-123';
  const mockProfile = {
    id: mockUserId,
    full_name: 'Test User',
    bio: 'A test bio',
  };

  // Mock authenticated user for most tests
  beforeEach(() => {
    mockSupabaseClient.auth.getUser.mockResolvedValue({
      data: { user: { id: mockUserId } },
      error: null,
    });
  });

  describe('getProfile', () => {
    it('should return a user profile on success', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: mockProfile, error: null });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      const selectMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabaseClient.from.mockReturnValue({ select: selectMock });

      const profile = await getProfile();

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      expect(selectMock).toHaveBeenCalledWith('*');
      expect(eqMock).toHaveBeenCalledWith('id', mockUserId);
      expect(profile).toEqual(mockProfile);
    });

    it('should return null if profile is not found (PGRST116 error)', async () => {
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      mockSupabaseClient.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) });

      const profile = await getProfile();
      expect(profile).toBeNull();
    });

    it('should throw an error for other database errors', async () => {
      const dbError = { message: 'Something went wrong' };
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const eqMock = vi.fn().mockReturnValue({ single: singleMock });
      mockSupabaseClient.from.mockReturnValue({ select: vi.fn().mockReturnValue({ eq: eqMock }) });

      await expect(getProfile()).rejects.toThrow(dbError.message);
    });

    it('should throw an error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      await expect(getProfile()).rejects.toThrow('User not authenticated');
    });
  });

  describe('updateProfile', () => {
    it('should return the updated profile on success', async () => {
      const updates = { full_name: 'Updated Name' };
      const updatedProfile = { ...mockProfile, ...updates };
      
      const singleMock = vi.fn().mockResolvedValue({ data: updatedProfile, error: null });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabaseClient.from.mockReturnValue({ update: updateMock });

      const result = await updateProfile(updates);

      expect(mockSupabaseClient.from).toHaveBeenCalledWith('user_profiles');
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining(updates));
      expect(eqMock).toHaveBeenCalledWith('id', mockUserId);
      expect(result).toEqual(updatedProfile);
    });

    it('should throw an error on database update error', async () => {
      const dbError = { message: 'Update failed' };
      const singleMock = vi.fn().mockResolvedValue({ data: null, error: dbError });
      const selectMock = vi.fn().mockReturnValue({ single: singleMock });
      const eqMock = vi.fn().mockReturnValue({ select: selectMock });
      const updateMock = vi.fn().mockReturnValue({ eq: eqMock });
      mockSupabaseClient.from.mockReturnValue({ update: updateMock });

      await expect(updateProfile({ full_name: 'New Name' })).rejects.toThrow(dbError.message);
    });

    it('should throw an error if user is not authenticated', async () => {
      mockSupabaseClient.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      await expect(updateProfile({ full_name: 'New Name' })).rejects.toThrow('User not authenticated');
    });
  });
});
