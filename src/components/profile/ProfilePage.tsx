
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
import { ErrorBoundary } from "@/components/ErrorBoundary";

// Componentes Mock simples para os que podem não estar implementados
const SkillsMock = ({ userProfile, isEditing }: { userProfile: UserProfile | null, isEditing: boolean }) => (
  <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm mb-6">
    <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">Habilidades</h3>
    <p className="text-[#64748B] dark:text-white/80">Programação, Design, Escrita Técnica</p>
  </div>
);

const InterestsMock = ({ userProfile, isEditing }: { userProfile: UserProfile | null, isEditing: boolean }) => (
  <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm mb-6">
    <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">Interesses</h3>
    <p className="text-[#64748B] dark:text-white/80">Tecnologia, IA, Educação, Desenvolvimento Web</p>
  </div>
);

const EducationMock = ({ userProfile, isEditing }: { userProfile: UserProfile | null, isEditing: boolean }) => (
  <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm mb-6">
    <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">Educação</h3>
    <p className="text-[#64748B] dark:text-white/80">Universidade de Tecnologia, Engenharia de Software, 2020-2024</p>
  </div>
);

const AchievementsMock = ({ userProfile, isEditing }: { userProfile: UserProfile | null, isEditing: boolean }) => (
  <div className="bg-white dark:bg-[#0A2540] rounded-xl border border-[#E0E1DD] dark:border-white/10 p-6 shadow-sm mb-6">
    <h3 className="text-lg font-bold text-[#29335C] dark:text-white mb-4">Conquistas</h3>
    <p className="text-[#64748B] dark:text-white/80">12 cursos concluídos, 5 projetos entregues</p>
  </div>
);

interface ProfilePageProps {
  isOwnProfile?: boolean;
}

export default function ProfilePage({ isOwnProfile = true }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        // Tenta buscar o perfil do usuário
        const profile = await profileService.getUserProfile();
        
        // Se o perfil existir, define-o no estado
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
          // Se nenhum perfil for retornado, criar um perfil padrão
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
        console.error("Erro ao buscar perfil do usuário:", error);
        setError(error instanceof Error ? error : new Error("Erro desconhecido ao buscar perfil"));
        
        // Em caso de erro, criar um perfil padrão para evitar UI quebrada
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
    setIsEditing(!isEditing);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">Carregando perfil...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center h-40">
        <p className="text-red-500 mb-2">Ocorreu um erro ao carregar o perfil:</p>
        <p className="text-gray-700 dark:text-gray-300">{error.message}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-[#FF6B00] text-white rounded-md hover:bg-[#FF6B00]/90"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="container mx-auto py-6 px-4"
      >
        <ProfileHeader userProfile={userProfile} isEditing={isEditing} onEdit={handleEditProfile} />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <AboutMe userProfile={userProfile} isEditing={isEditing} />
            <SkillsMock userProfile={userProfile} isEditing={isEditing} />
            <InterestsMock userProfile={userProfile} isEditing={isEditing} />
          </div>
          <div>
            <ContactInfo userProfile={userProfile} isEditing={isEditing} />
            <EducationMock userProfile={userProfile} isEditing={isEditing} />
            <AchievementsMock userProfile={userProfile} isEditing={isEditing} />
          </div>
        </div>
      </motion.div>
    </ErrorBoundary>
  );
}
