
import React, { useState, useEffect } from "react";
import ProfileHeader from "@/components/profile/ProfileHeader";
import AboutMe from "@/components/profile/AboutMe";
import Skills from "@/components/profile/Skills";
import Interests from "@/components/profile/Interests";
import Education from "@/components/profile/Education";
import ContactInfo from "@/components/profile/ContactInfo";
import Achievements from "@/components/profile/Achievements";
import type { UserProfile } from "@/types/user-profile";
import { motion } from "framer-motion";
import { profileService } from "@/services/profileService";
import { generateUserId } from "@/lib/generate-user-id";

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getUserProfile();
        if (profile) {
          setUserProfile({
            ...profile,
            // Garantir que os campos essenciais estejam definidos
            id: profile.id || "1",
            user_id: profile.user_id || `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            full_name: profile.full_name || "Usuário Demonstração",
            display_name: profile.display_name || "Usuário",
            email: profile.email || "usuario@exemplo.com",
            avatar_url: profile.avatar_url || "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            level: profile.level || 1,
            plan_type: profile.plan_type || "lite"
          });
        } else {
          // Criar um perfil padrão se nenhum for retornado
          setUserProfile({
            id: "1",
            user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
            full_name: "Usuário Demonstração",
            display_name: "Usuário",
            email: "usuario@exemplo.com",
            avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
            level: 1,
            plan_type: "lite"
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Em caso de erro, criar um perfil padrão
        setUserProfile({
          id: "1",
          user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`,
          full_name: "Usuário Demonstração",
          display_name: "Usuário",
          email: "usuario@exemplo.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          level: 1,
          plan_type: "lite"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  const handleEditProfile = () => {
    setIsEditing(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Carregando perfil...</div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto py-6 px-4"
    >
      <ProfileHeader userProfile={userProfile} isEditing={isEditing} onEdit={handleEditProfile} />
      <AboutMe userProfile={userProfile} isEditing={isEditing} />
      <Skills userProfile={userProfile} isEditing={isEditing} />
      <Interests userProfile={userProfile} isEditing={isEditing} />
      <Education userProfile={userProfile} isEditing={isEditing} />
      <ContactInfo userProfile={userProfile} isEditing={isEditing} />
      <Achievements userProfile={userProfile} isEditing={isEditing} />
    </motion.div>
  );
}
