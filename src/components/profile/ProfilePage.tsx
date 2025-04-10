
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
        
        // Perfil padrão com todos os campos necessários
        const defaultProfile: UserProfile = {
          id: "1",
          user_id: generateUserId(),
          full_name: "Usuário Demonstração",
          display_name: "Usuário",
          email: "usuario@exemplo.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          level: 1,
          plan_type: "lite",
          bio: "Estudante utilizando a plataforma Epictus",
          skills: ["Aprendizado", "Organização"],
          interests: ["Educação", "Tecnologia"],
          education: [
            {
              institution: "Epictus Academy",
              degree: "Curso Online",
              years: "2024-Presente"
            }
          ],
          contact_info: {
            phone: "",
            address: "",
            social: {
              twitter: "",
              linkedin: "",
              github: ""
            }
          },
          coins: 100,
          rank: "Iniciante"
        };
        
        if (profile) {
          // Mesclar com o perfil padrão para garantir todos os campos
          setUserProfile({
            ...defaultProfile,
            ...profile,
            // Garantir que os campos essenciais estejam definidos mesmo se vierem do backend
            id: profile.id || defaultProfile.id,
            user_id: profile.user_id || defaultProfile.user_id,
            full_name: profile.full_name || defaultProfile.full_name,
            display_name: profile.display_name || defaultProfile.display_name,
            email: profile.email || defaultProfile.email,
            avatar_url: profile.avatar_url || defaultProfile.avatar_url,
            level: profile.level || defaultProfile.level,
            plan_type: profile.plan_type || defaultProfile.plan_type,
            bio: profile.bio || defaultProfile.bio,
            skills: profile.skills || defaultProfile.skills,
            interests: profile.interests || defaultProfile.interests,
            education: profile.education || defaultProfile.education,
            contact_info: profile.contact_info || defaultProfile.contact_info,
            coins: profile.coins || defaultProfile.coins,
            rank: profile.rank || defaultProfile.rank
          });
        } else {
          // Criar um perfil padrão se nenhum for retornado
          setUserProfile(defaultProfile);
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
        // Criar perfil padrão em caso de erro
        setUserProfile({
          id: "1",
          user_id: generateUserId(),
          full_name: "Usuário Demonstração",
          display_name: "Usuário",
          email: "usuario@exemplo.com",
          avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=Demo",
          level: 1,
          plan_type: "lite",
          bio: "Estudante utilizando a plataforma Epictus",
          skills: ["Aprendizado", "Organização"],
          interests: ["Educação", "Tecnologia"],
          education: [
            {
              institution: "Epictus Academy",
              degree: "Curso Online",
              years: "2024-Presente"
            }
          ],
          contact_info: {
            phone: "",
            address: "",
            social: {
              twitter: "",
              linkedin: "",
              github: ""
            }
          },
          coins: 100,
          rank: "Iniciante"
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
