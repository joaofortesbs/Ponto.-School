
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/hooks/useAuth";
import type { UserProfile } from "@/types/user-profile";

interface ContactInfo {
  email: string;
  phone: string;
  location: string;
  birthDate: string;
}

interface ProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  contactInfo: ContactInfo;
  aboutMe: string;
  expandedSection: string | null;
  isEditing: boolean;
  
  setContactInfo: (info: ContactInfo) => void;
  setAboutMe: (text: string) => void;
  toggleSection: (section: string | null) => void;
  setIsEditing: (editing: boolean) => void;
  saveContactInfo: () => Promise<void>;
  saveAboutMe: () => Promise<void>;
}

const defaultContactInfo = {
  email: "",
  phone: "Adicionar telefone",
  location: "Adicionar localização",
  birthDate: "Adicionar data de nascimento",
};

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function ProfileProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [contactInfo, setContactInfo] = useState<ContactInfo>(defaultContactInfo);
  const [aboutMe, setAboutMe] = useState(
    "Olá! Sou estudante de Engenharia de Software na Universidade de São Paulo. Apaixonado por tecnologia, programação e matemática. Busco constantemente novos conhecimentos e desafios para aprimorar minhas habilidades. Nas horas vagas, gosto de jogar xadrez, ler livros de ficção científica e praticar esportes."
  );
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar o perfil do usuário
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) {
        console.error("Erro ao buscar perfil:", error);
        setIsLoading(false);
        return;
      }

      if (profile) {
        setUserProfile(profile);

        // Configurar informações de contato
        setContactInfo({
          email: profile.email || "",
          phone: profile.phone || "Adicionar telefone",
          location: profile.location || "Adicionar localização",
          birthDate: profile.birth_date || "Adicionar data de nascimento",
        });

        // Configurar bio
        if (profile.bio) {
          setAboutMe(profile.bio);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar dados do perfil:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSection = (section: string | null) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const saveContactInfo = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          email: contactInfo.email,
          phone: contactInfo.phone === "Adicionar telefone" ? null : contactInfo.phone,
          location: contactInfo.location === "Adicionar localização" ? null : contactInfo.location,
          birth_date: contactInfo.birthDate === "Adicionar data de nascimento" ? null : contactInfo.birthDate,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating contact info:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    toggleSection(null);
  };

  const saveAboutMe = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          bio: aboutMe,
        })
        .eq("id", user.id);

      if (error) {
        console.error("Error updating bio:", error);
      }
    } catch (error) {
      console.error("Error:", error);
    }
    setIsEditing(false);
  };

  return (
    <ProfileContext.Provider
      value={{
        userProfile,
        isLoading,
        contactInfo,
        aboutMe,
        expandedSection,
        isEditing,
        setContactInfo,
        setAboutMe,
        toggleSection,
        setIsEditing,
        saveContactInfo,
        saveAboutMe,
      }}
    >
      {children}
    </ProfileContext.Provider>
  );
}

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}
