import React from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from './ProfileHeader';
import AboutMe from './AboutMe';
import Skills from './Skills';
import Education from './Education';
import ContactInfo from './ContactInfo';
import Interests from './Interests';
import Achievements from './Achievements';
import { UserProfile } from '@/types/user-profile';

interface ProfilePageProps {
  profile?: UserProfile | null;
  isCurrentUser: boolean;
  isLoading?: boolean;
  error?: any;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ profile, isCurrentUser, isLoading, error }) => {
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12">
          <div className="animate-pulse h-32 bg-gray-200 dark:bg-gray-700 rounded-lg mb-6"></div>
          <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12 bg-red-50 dark:bg-red-900/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-2">Erro ao carregar perfil</h2>
          <p className="text-gray-600 dark:text-gray-300">Ocorreu um problema ao carregar os dados do perfil. Por favor, tente novamente mais tarde.</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="text-center py-12 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-6">
          <h2 className="text-xl font-bold text-yellow-600 dark:text-yellow-400 mb-2">Perfil não encontrado</h2>
          <p className="text-gray-600 dark:text-gray-300">Não foi possível encontrar as informações deste perfil.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }} 
      animate={{ opacity: 1 }} 
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 py-8 max-w-6xl"
    >
      <ProfileHeader profile={profile} isCurrentUser={isCurrentUser} />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        <div className="md:col-span-2 space-y-6">
          <AboutMe profile={profile} isCurrentUser={isCurrentUser} />
          <Skills profile={profile} isCurrentUser={isCurrentUser} />
          <Education profile={profile} isCurrentUser={isCurrentUser} />
          <Achievements profile={profile} isCurrentUser={isCurrentUser} />
        </div>

        <div className="space-y-6">
          <ContactInfo profile={profile} />
          <Interests profile={profile} isCurrentUser={isCurrentUser} />
        </div>
      </div>
    </motion.div>
  );
};

export default ProfilePage;