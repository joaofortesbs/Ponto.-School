
import { useState, useEffect } from 'react';
import { supabase } from "@/lib/supabase";
import type { UserProfile } from "@/types/user-profile";

export interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  birthDate: string;
}

export interface ProfileData {
  userProfile: UserProfile | null;
  contactInfo: ContactInfo;
  aboutMe: string | null;
}

export const useProfileData = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setLoading(false);
          return;
        }

        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .single();

        if (error) {
          console.error("Error fetching user profile:", error);
          setError(new Error(error.message));
          setLoading(false);
          return;
        }

        if (!data) {
          setLoading(false);
          return;
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

        setProfileData({
          userProfile,
          contactInfo,
          aboutMe
        });
      } catch (error) {
        console.error("Error:", error);
        setError(error instanceof Error ? error : new Error('Unknown error'));
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, []);

  return { profileData, loading, error };
};

export default useProfileData;
