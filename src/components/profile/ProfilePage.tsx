import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import ProfileHeader from "./ProfileHeader";
import AboutMe from "./AboutMe";
import Skills from "./Skills";
import Interests from "./Interests";
import Education from "./Education";
import ContactInfo from "./ContactInfo";
import { getUserProfile } from "@/services/profileService";
import { UserProfile } from "@/types/user-profile";

interface ProfilePageProps {
  isOwnProfile?: boolean;
  userId?: string;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ 
  isOwnProfile = true,
  userId
}) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const profileData = await getUserProfile(userId);
        setProfile(profileData);
        setError(null);
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setError("Não foi possível carregar os dados do perfil");
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin h-10 w-10 border-4 border-[#FF6B00] border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
        <h3 className="text-lg font-medium text-red-800 dark:text-red-200 mb-2">Erro</h3>
        <p className="text-red-600 dark:text-red-300">{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-md transition-colors"
        >
          Tentar novamente
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl p-4 space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="profile-3d-container"
      >
        <ProfileHeader profile={profile} isOwnProfile={isOwnProfile} />
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="md:col-span-2 space-y-6"
        >
          <AboutMe profile={profile} isOwnProfile={isOwnProfile} />
          <Education userProfile={profile} isEditing={false} />
          <Skills userProfile={profile} isEditing={false} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <ContactInfo userProfile={profile} isEditing={false} />
          <Interests userProfile={profile} isEditing={false} />
        </motion.div>
      </div>
    </div>
  );
};

export default ProfilePage;