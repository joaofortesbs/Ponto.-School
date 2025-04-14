
import { supabase } from '@/lib/supabase';
import type { UserProfile } from '@/types/user-profile';

/**
 * Retrieves the full user profile from Supabase
 * @returns The complete user profile or null if not found
 */
export async function getUserFullProfile(): Promise<UserProfile | null> {
  try {
    // Get current session
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session || !session.user) {
      console.log('No active session found');
      return null;
    }
    
    // Query the profiles table
    const { data: profileData, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', session.user.id)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
    
    return profileData as UserProfile;
  } catch (err) {
    console.error('Exception in getUserFullProfile:', err);
    return null;
  }
}

/**
 * Extracts the first name from a full name or username
 * @param nameString The full name, display name, or username
 * @returns The first name or the original string if no spaces found
 */
export function extractFirstName(nameString: string | null | undefined): string {
  if (!nameString) return 'Usuário';
  
  // First, check if it's an email and handle it
  if (nameString.includes('@')) {
    return nameString.split('@')[0];
  }
  
  // Split by space and get first part
  if (nameString.includes(' ')) {
    return nameString.split(' ')[0];
  }
  
  // Split by underscore as a fallback
  if (nameString.includes('_')) {
    return nameString.split('_')[0];
  }
  
  return nameString;
}

/**
 * Gets the user's best displayable name, prioritizing display_name, full_name, username
 * Returns first name only
 */
export async function getUserFirstName(): Promise<string> {
  try {
    const profile = await getUserFullProfile();
    
    if (profile) {
      // Try to get the best name in order of preference
      const bestName = profile.display_name || profile.full_name || profile.username || profile.email;
      return extractFirstName(bestName);
    }
    
    // Fallback to local storage or session storage if profile not found
    const localName = localStorage.getItem('username') || sessionStorage.getItem('username');
    if (localName) {
      return extractFirstName(localName);
    }
    
    return 'Usuário';
  } catch (err) {
    console.error('Error getting user first name:', err);
    return 'Usuário';
  }
}
