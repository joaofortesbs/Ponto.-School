import React from 'react';
import { Edit } from 'lucide-react';
import { UserProfile } from '@/types/user-profile';

interface AboutMeProps {
  profile?: UserProfile | null;
  isCurrentUser: boolean;
}

const AboutMe: React.FC<AboutMeProps> = ({ profile, isCurrentUser }) => {
  if (!profile) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Sobre Mim</h2>
        <div className="text-gray-500 dark:text-gray-400">Carregando informações...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Sobre Mim</h2>
        {isCurrentUser && (
          <button className="text-[#FF6B00] hover:text-[#FF8C40] transition-colors">
            <Edit className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
        {profile.bio || 'Nenhuma informação disponível.'}
      </p>
    </div>
  );
};

export default AboutMe;