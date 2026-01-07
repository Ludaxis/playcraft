import { getSupabase } from './supabase';
import type { UserProfile } from '../types';

/**
 * Fetches the current authenticated user's profile.
 * @returns The user's profile, or null if not found.
 */
export async function getProfile(): Promise<UserProfile | null> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 = 'exact one row not found'
    console.error('Error fetching profile:', error);
    throw new Error(error.message);
  }

  return data;
}

/**
 * Updates the current authenticated user's profile.
 * @param updates The profile data to update.
 * @returns The updated profile data.
 */
export async function updateProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
  const supabase = getSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error('User not authenticated');
  }

  // Ensure the id is not part of the updates object
  const { id, ...updateData } = updates;

  const { data, error } = await supabase
    .from('user_profiles')
    .update({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Error updating profile:', error);
    throw new Error(error.message);
  }

  return data;
}
