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

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>({
    id: "1",
    full_name: "João Silva",
    display_name: "João",
    email: "joao.silva@email.com",
    avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
    level: 15,
    plan_type: "lite",
    user_id: "", // Será preenchido durante o carregamento
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const profile = await profileService.getUserProfile();
        if (profile) {
          setUserProfile({
            ...userProfile,
            ...profile,
            level: profile.level || 15,
            plan_type: profile.plan_type || "lite",
            // Gerar ID temporário se não existir
            user_id: profile.user_id || `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Em caso de erro, apenas garantir que há um ID de usuário
        setUserProfile(prev => {
          if (prev && !prev.user_id) {
            return {
              ...prev,
              user_id: `USR${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`
            };
          }
          return prev;
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