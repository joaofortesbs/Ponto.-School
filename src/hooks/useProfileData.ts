
import { useState } from 'react';
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

export const useProfileData = async (): Promise<ProfileData | null> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Error fetching user profile:", error);
      return null;
    }

    if (!data) {
      return null;
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

    return {
      userProfile,
      contactInfo,
      aboutMe
    };
  } catch (error) {
    console.error("Error:", error);
    return null;
  }
};

export default useProfileData;
