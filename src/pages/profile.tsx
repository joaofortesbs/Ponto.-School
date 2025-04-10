
import React, { useState, useEffect } from "react";
import Header from "@/components/layout/Header";
import Sidebar from "@/components/layout/Sidebar";
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

// Componente ProfilePage isolado
export function ProfilePageContent({ isOwnProfile = true }) {
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
            user_id: profile.user_id || crypto.randomUUID().substring(0, 8) // Gerar ID temporário se não existir
          });
        }
      } catch (error) {
        console.error("Error fetching user profile:", error);
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
    return <p className="p-4 text-center">Carregando perfil...</p>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto p-4"
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

// Componente principal Profile que renderiza a estrutura da página
const Profile = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = React.useState(false);

  return (
    <div className="flex h-screen bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto bg-[#f7f9fa] dark:bg-[#001427] transition-colors duration-300">
          <ProfilePageContent isOwnProfile={true} />
        </main>
      </div>
    </div>
  );
};

export default Profile;
