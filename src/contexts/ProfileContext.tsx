import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserProfile } from '@/types/user-profile';

const CACHE_VERSION = 'v4.1';
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

function getUserEmailFromLocalStorage(): string | null {
  const email = localStorage.getItem('userEmail') 
    || localStorage.getItem('powers_user_email')
    || localStorage.getItem('supabase_user_email');
  
  if (email) {
    console.log('[ProfileContext] Found email in localStorage:', email);
    return email;
  }

  const neonUser = localStorage.getItem('neon_user');
  if (neonUser) {
    try {
      const parsed = JSON.parse(neonUser);
      if (parsed.email) {
        console.log('[ProfileContext] Found email in neon_user:', parsed.email);
        return parsed.email;
      }
    } catch (e) {
      console.warn('[ProfileContext] Error parsing neon_user:', e);
    }
  }

  return null;
}

function getUserIdFromLocalStorage(): string | null {
  const userId = localStorage.getItem('user_id');
  if (userId) {
    console.log('[ProfileContext] Found user_id in localStorage:', userId);
    return userId;
  }
  
  const neonUser = localStorage.getItem('neon_user');
  if (neonUser) {
    try {
      const parsed = JSON.parse(neonUser);
      if (parsed.id) {
        console.log('[ProfileContext] Found user_id in neon_user:', parsed.id);
        return parsed.id;
      }
    } catch (e) {
      console.warn('[ProfileContext] Error parsing neon_user:', e);
    }
  }
  
  return null;
}

function isUserAuthenticated(): boolean {
  const authToken = localStorage.getItem('auth_token');
  const neonAuthenticated = localStorage.getItem('neon_authenticated');
  
  return !!(authToken || neonAuthenticated === 'true');
}

export function ProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [powers, setPowers] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const fetchProfileByEmail = useCallback(async (email: string): Promise<UserProfile | null> => {
    try {
      console.log('[ProfileContext] Fetching profile by EMAIL:', email);
      
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
        profileData.email = email;
        
        console.log('[ProfileContext] API returned profile with powers_carteira:', profileData.powers_carteira);
        
        setCache(profileData);
        
        localStorage.setItem('powers_user_email', email);
        localStorage.setItem('userEmail', email);
        
        return profileData;
      }
      
      console.warn('[ProfileContext] Profile not found by email');
      return null;
    } catch (error) {
      console.error('[ProfileContext] Error fetching profile by email:', error);
      return null;
    }
  }, []);

  const fetchProfileById = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      console.log('[ProfileContext] Fetching profile by ID:', userId);
      
      const response = await fetch(`/api/perfis?id=${encodeURIComponent(userId)}`, {
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
        
        if (profileData.email) {
          localStorage.setItem('powers_user_email', profileData.email);
          localStorage.setItem('userEmail', profileData.email);
        }
        
        setCache(profileData);
        
        return profileData;
      }
      
      console.warn('[ProfileContext] Profile not found by ID');
      return null;
    } catch (error) {
      console.error('[ProfileContext] Error fetching profile by ID:', error);
      return null;
    }
  }, []);

  const loadProfile = useCallback(async () => {
    console.log('[ProfileContext] === LOADING PROFILE ===');
    setIsLoading(true);

    try {
      const authenticated = isUserAuthenticated();
      console.log('[ProfileContext] User authenticated:', authenticated);
      
      if (!authenticated) {
        console.log('[ProfileContext] No auth token found - user not logged in');
        setIsAuthenticated(false);
        setProfile(null);
        setPowers(null);
        setIsLoading(false);
        return;
      }

      setIsAuthenticated(true);

      const email = getUserEmailFromLocalStorage();
      const userId = getUserIdFromLocalStorage();

      console.log('[ProfileContext] Auth sources - email:', email, ', userId:', userId);

      const cachedProfile = getValidCache();
      if (cachedProfile) {
        const cacheMatchesUser = 
          (email && cachedProfile.email === email) || 
          (userId && cachedProfile.id === userId);
        
        if (cacheMatchesUser) {
          console.log('[ProfileContext] Using valid cache with powers:', cachedProfile.powers_carteira);
          setProfile(cachedProfile);
          setPowers(cachedProfile.powers_carteira ?? null);
          setIsLoading(false);
          
          if (email) {
            fetchProfileByEmail(email).then(freshProfile => {
              if (freshProfile) {
                setProfile(freshProfile);
                setPowers(freshProfile.powers_carteira ?? null);
              }
            });
          } else if (userId) {
            fetchProfileById(userId).then(freshProfile => {
              if (freshProfile) {
                setProfile(freshProfile);
                setPowers(freshProfile.powers_carteira ?? null);
              }
            });
          }
          return;
        }
      }

      let freshProfile: UserProfile | null = null;

      if (email) {
        freshProfile = await fetchProfileByEmail(email);
      }
      
      if (!freshProfile && userId) {
        freshProfile = await fetchProfileById(userId);
      }
      
      if (freshProfile) {
        setProfile(freshProfile);
        setPowers(freshProfile.powers_carteira ?? null);
        console.log('[ProfileContext] ✅ Profile loaded with powers:', freshProfile.powers_carteira);
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
  }, [fetchProfileByEmail, fetchProfileById]);

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

    const handleLoginSuccess = (event: CustomEvent) => {
      console.log('[ProfileContext] 🎉 Login success event received!');
      const email = event.detail?.email;
      const profile = event.detail?.profile;
      
      if (profile && typeof profile.powers_carteira === 'number') {
        console.log('[ProfileContext] Setting profile from login event with powers:', profile.powers_carteira);
        setProfile(profile);
        setPowers(profile.powers_carteira);
        setIsAuthenticated(true);
        setCache(profile);
      } else if (email) {
        console.log('[ProfileContext] Fetching profile after login for:', email);
        fetchProfileByEmail(email).then(freshProfile => {
          if (freshProfile) {
            setProfile(freshProfile);
            setPowers(freshProfile.powers_carteira ?? null);
            setIsAuthenticated(true);
          }
        });
      } else {
        loadProfile();
      }
    };

    const handleLogout = () => {
      console.log('[ProfileContext] Logout event received');
      setProfile(null);
      setPowers(null);
      setIsAuthenticated(false);
      localStorage.removeItem(CACHE_KEY);
    };

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

    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'neon_authenticated' || event.key === 'auth_token') {
        console.log('[ProfileContext] Storage auth change detected, reloading profile');
        loadProfile();
      }
    };

    document.addEventListener('neon-login-success', handleLoginSuccess as EventListener);
    document.addEventListener('login-success', handleLoginSuccess as EventListener);
    window.addEventListener('logout', handleLogout);
    document.addEventListener('powers:charged', handlePowersCharged as EventListener);
    document.addEventListener('profile-updated-external', handleExternalProfileUpdate as EventListener);
    window.addEventListener('storage', handleStorageChange);

    return () => {
      document.removeEventListener('neon-login-success', handleLoginSuccess as EventListener);
      document.removeEventListener('login-success', handleLoginSuccess as EventListener);
      window.removeEventListener('logout', handleLogout);
      document.removeEventListener('powers:charged', handlePowersCharged as EventListener);
      document.removeEventListener('profile-updated-external', handleExternalProfileUpdate as EventListener);
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [loadProfile, updatePowers, fetchProfileByEmail, profile?.email]);

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
