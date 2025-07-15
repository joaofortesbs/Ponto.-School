import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ChevronDown, Settings, LogOut } from 'lucide-react';

interface Profile {
  id: string;
  name: string;
  avatar?: string;
  type: 'student' | 'teacher' | 'admin';
}

const mockProfiles: Profile[] = [
  {
    id: '1',
    name: 'João Silva',
    avatar: '/images/avatar1.png',
    type: 'student'
  },
  {
    id: '2',
    name: 'Maria Santos',
    avatar: '/images/avatar2.png',
    type: 'teacher'
  }
];

export const ProfileSelector: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedProfile, setSelectedProfile] = useState<Profile>(mockProfiles[0]);

  const handleProfileSelect = (profile: Profile) => {
    setSelectedProfile(profile);
    setIsOpen(false);
  };

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="relative">
        <motion.button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-xl px-4 py-2 text-white hover:bg-white/20 transition-all duration-300"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
            {selectedProfile.avatar ? (
              <img src={selectedProfile.avatar} alt={selectedProfile.name} className="w-8 h-8 rounded-full" />
            ) : (
              <User className="w-4 h-4 text-white" />
            )}
          </div>
          <span className="font-medium">{selectedProfile.name}</span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </motion.button>

        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full right-0 mt-2 min-w-[200px] bg-white/95 backdrop-blur-md border border-white/20 rounded-xl shadow-xl overflow-hidden"
            >
              <div className="p-2">
                {mockProfiles.map((profile) => (
                  <button
                    key={profile.id}
                    onClick={() => handleProfileSelect(profile)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100/50 transition-colors ${
                      selectedProfile.id === profile.id ? 'bg-orange-100/50' : ''
                    }`}
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center">
                      {profile.avatar ? (
                        <img src={profile.avatar} alt={profile.name} className="w-8 h-8 rounded-full" />
                      ) : (
                        <User className="w-4 h-4 text-white" />
                      )}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{profile.name}</div>
                      <div className="text-xs text-gray-500 capitalize">{profile.type}</div>
                    </div>
                  </button>
                ))}
              </div>

              <div className="border-t border-gray-200/50 p-2">
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-gray-100/50 transition-colors text-gray-700">
                  <Settings className="w-4 h-4" />
                  <span className="text-sm">Configurações</span>
                </button>
                <button className="w-full flex items-center gap-3 p-3 rounded-lg text-left hover:bg-red-100/50 transition-colors text-red-600">
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Sair</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default ProfileSelector;