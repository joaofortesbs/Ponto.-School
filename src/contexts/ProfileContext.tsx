import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';
import { UserProfile } from '@/types/user-profile';

const CACHE_VERSION = 'v4.0';
const CACHE_KEY = 'profile_context_v4';
const CACHE_MAX_AGE = 5 * 60 * 1000;

interface ProfileContextType {
  profile: UserProfile | null;
  powers: number | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  refreshProfile: () => Promise<void>;
  updatePowers: (newPowers: number) => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

interface CachedData {
  version: string;
  timestamp: number;
  profile: UserProfile;
}

function getValidCache(): UserProfile | null {
  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return null;
    
    const parsed: CachedData = JSON.parse(cached);
    
    if (parsed.version !== CACHE_VERSION) {
      console.log('[ProfileContext] Cache version mismatch - invalidating');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    if (Date.now() - parsed.timestamp > CACHE_MAX_AGE) {
      console.log('[ProfileContext] Cache expired - invalidating');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    if (typeof parsed.profile.powers_carteira !== 'number') {
      console.log('[ProfileContext] Cache missing powers_carteira - invalidating');
      localStorage.removeItem(CACHE_KEY);
      return null;
    }
    
    return parsed.profile;
  } catch (e) {
    console.warn('[ProfileContext] Error reading cache:', e);
    localStorage.removeItem(CACHE_KEY);
    return null;
  }
}

function setCache(profile: UserProfile): void {
  try {
    const cacheData: CachedData = {
      version: CACHE_VERSION,
      timestamp: Date.now(),
      profile
    };
    localStorage.setItem(CACHE_KEY, JSON.stringify(cacheData));
    console.log('[ProfileContext] Cache updated with powers_carteira:', profile.powers_carteira);
  } catch (e) {
    console.warn('[ProfileContext] Error setting cache:', e);
  }
}

function cleanupLegacyCache(): void {
  try {
    const legacyKeys = [
      'userProfile',
      'userProfileCacheTime',
      'powers_balance',
      'modalGeral_powersData',
      'modalGeral_seuUso_lastFetch'
    ];
    
    legacyKeys.forEach(key => {
      if (localStorage.getItem(key)) {
        console.log('[ProfileContext] Cleaning legacy cache key:', key);
        localStorage.removeItem(key);
      }
    });
  } catch (e) {
    console.warn('[ProfileContext] Error cleaning legacy cache:', e);
  }
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [powers, setPowers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfileFromAPI = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      console.log('[ProfileContext] Fetching profile from API for:', email);
      
      const response = await fetch(`/api/perfis?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) {
        console.error('[ProfileContext] API error:', response.status);
        return null;
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        const profileData = result.data;
        
        console.log('[ProfileContext] API returned profile with powers_carteira:', profileData.powers_carteira);
        
        profileData.email = email;
        
        setCache(profileData);
        
        localStorage.setItem('powers_user_email', email);
        localStorage.setItem('userEmail', email);
        
        document.dispatchEvent(new CustomEvent('profile-updated', {
          detail: { profile: profileData }
        }));
        
        document.dispatchEvent(new CustomEvent('user-email-available', {
          detail: { email }
        }));
        
        return profileData;
      }
      
      console.warn('[ProfileContext] Profile not found in API');
      return null;
    } catch (error) {
      console.error('[ProfileContext] Error fetching profile:', error);
      return null;
    }
  }, []);

  const loadProfile = useCallback(async () => {
    console.log('[ProfileContext] === LOADING PROFILE ===');
    setIsLoading(true);

    try {
      const { data: session } = await supabase.auth.getSession();
      
      if (!session?.session?.user?.email) {
        console.log('[ProfileContext] No authenticated user');
        setIsAuthenticated(false);
        setProfile(null);
        setPowers(null);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);
      const email = session.session.user.email;
      console.log('[ProfileContext] User authenticated:', email);

      const cachedProfile = getValidCache();
      if (cachedProfile && cachedProfile.email === email) {
        console.log('[ProfileContext] Using valid cache with powers:', cachedProfile.powers_carteira);
        setProfile(cachedProfile);
        setPowers(cachedProfile.powers_carteira ?? null);
        setIsLoading(false);
        
        fetchProfileFromAPI(email).then(freshProfile => {
          if (freshProfile) {
            setProfile(freshProfile);
            setPowers(freshProfile.powers_carteira ?? null);
          }
        });
        return;
      }

      const freshProfile = await fetchProfileFromAPI(email);
      
      if (freshProfile) {
        setProfile(freshProfile);
        setPowers(freshProfile.powers_carteira ?? null);
        console.log('[ProfileContext] Profile loaded with powers:', freshProfile.powers_carteira);
      } else {
        console.warn('[ProfileContext] Could not load profile');
        setProfile(null);
        setPowers(null);
      }
    } catch (error) {
      console.error('[ProfileContext] Error in loadProfile:', error);
      setProfile(null);
      setPowers(null);
    } finally {
      setIsLoading(false);
    }
  }, [fetchProfileFromAPI]);

  const refreshProfile = useCallback(async () => {
    console.log('[ProfileContext] Manual refresh requested');
    await loadProfile();
  }, [loadProfile]);

  const updatePowers = useCallback((newPowers: number) => {
    console.log('[ProfileContext] Updating powers to:', newPowers);
    setPowers(newPowers);
    
    if (profile) {
      const updatedProfile = { ...profile, powers_carteira: newPowers };
      setProfile(updatedProfile);
      setCache(updatedProfile);
    }
    
    document.dispatchEvent(new CustomEvent('powers:updated', {
      detail: { available: newPowers }
    }));
  }, [profile]);

  useEffect(() => {
    cleanupLegacyCache();
    loadProfile();

    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('[ProfileContext] Auth state changed:', event);
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        loadProfile();
      } else if (event === 'SIGNED_OUT') {
        setProfile(null);
        setPowers(null);
        setIsAuthenticated(false);
        localStorage.removeItem(CACHE_KEY);
      }
    });

    const handlePowersCharged = (event: CustomEvent) => {
      if (typeof event.detail?.newBalance === 'number') {
        console.log('[ProfileContext] Powers charged, new balance:', event.detail.newBalance);
        updatePowers(event.detail.newBalance);
      }
    };

    const handleExternalProfileUpdate = (event: CustomEvent) => {
      const updatedProfile = event.detail?.profile;
      if (updatedProfile && profile?.email === updatedProfile.email) {
        console.log('[ProfileContext] External profile update received');
        setProfile(updatedProfile);
        if (typeof updatedProfile.powers_carteira === 'number') {
          setPowers(updatedProfile.powers_carteira);
        }
        setCache(updatedProfile);
      }
    };

    document.addEventListener('powers:charged', handlePowersCharged as EventListener);
    document.addEventListener('profile-updated-external', handleExternalProfileUpdate as EventListener);

    return () => {
      authListener?.subscription.unsubscribe();
      document.removeEventListener('powers:charged', handlePowersCharged as EventListener);
      document.removeEventListener('profile-updated-external', handleExternalProfileUpdate as EventListener);
    };
  }, [loadProfile, updatePowers, profile?.email]);

  const value: ProfileContextType = {
    profile,
    powers,
    isLoading,
    isAuthenticated,
    refreshProfile,
    updatePowers
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile(): ProfileContextType {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
  return context;
}

export function usePowers(): { powers: number | null; isLoading: boolean; updatePowers: (n: number) => void } {
  const { powers, isLoading, updatePowers } = useProfile();
  return { powers, isLoading, updatePowers };
}
