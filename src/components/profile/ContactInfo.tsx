import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';
import { UserProfile } from '@/types/user-profile';

interface ContactInfoProps {
  profile?: UserProfile | null;
}

const ContactInfo: React.FC<ContactInfoProps> = ({ profile }) => {
  if (!profile) {
    return (
      <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
        <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informações de Contato</h2>
        <div className="text-gray-500 dark:text-gray-400">Carregando informações...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#1E293B] rounded-xl p-6 shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-semibold mb-4 text-gray-800 dark:text-white">Informações de Contato</h2>
      <div className="space-y-4">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-[#FF6B00] mr-3" />
          <span className="text-gray-700 dark:text-gray-300">{profile.email || 'Não informado'}</span>
        </div>
        <div className="flex items-center">
          <Phone className="h-5 w-5 text-[#FF6B00] mr-3" />
          <span className="text-gray-700 dark:text-gray-300">{profile.phone || 'Não informado'}</span>
        </div>
        <div className="flex items-center">
          <MapPin className="h-5 w-5 text-[#FF6B00] mr-3" />
          <span className="text-gray-700 dark:text-gray-300">{profile.location || 'Não informado'}</span>
        </div>
      </div>
    </div>
  );
};

export default ContactInfo;