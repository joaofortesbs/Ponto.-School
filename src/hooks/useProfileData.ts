
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  birthDate: string;
}

interface ProfileData {
  userProfile: UserProfile;
  contactInfo: ContactInfo;
  aboutMe: string | null;
}

/**
 * Hook para buscar e gerenciar dados do perfil do usuário
 * @returns Os dados do perfil, estado de carregamento e erros
 */
export const useProfileData = async (): Promise<{
  profileData: ProfileData | null;
  loading: boolean;
  error: Error | null;
}> => {
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      setLoading(false);
      return { profileData: null, loading: false, error: null };
    }

    const { data, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (profileError) {
      setError(new Error(profileError.message));
      setLoading(false);
      return { profileData: null, loading: false, error: new Error(profileError.message) };
    }

    if (!data) {
      setLoading(false);
      return { profileData: null, loading: false, error: null };
    }

    // Ensure level and rank are set with defaults if not present
    const userProfile: UserProfile = {
      ...(data as unknown as UserProfile),
      level: data.level || 1,
      rank: data.rank || "Aprendiz",
    };

    // Set contact info from user data
    const contactInfo: ContactInfo = {
      email: data.email || user.email || "",
      phone: data.phone || "Adicionar telefone",
      location: data.location || "Adicionar localização",
      birthDate: data.birth_date || 
        (user.user_metadata?.birth_date) || 
        (user.raw_user_meta_data?.birth_date) || 
        "Adicionar data de nascimento",
    };

    const aboutMe = data.bio || null;
    
    const resultData = {
      userProfile,
      contactInfo,
      aboutMe
    };
    
    setProfileData(resultData);
    setLoading(false);
    
    return { profileData: resultData, loading: false, error: null };
  } catch (error) {
    const err = error instanceof Error ? error : new Error('Unknown error occurred');
    setError(err);
    setLoading(false);
    return { profileData: null, loading: false, error: err };
  }
};

export default useProfileData;
