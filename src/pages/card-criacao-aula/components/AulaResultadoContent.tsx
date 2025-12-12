import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Image, User, Users } from 'lucide-react';
import { Template } from './TemplateDropdown';

interface AulaResultadoContentProps {
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
  createdAt?: Date;
}

const AulaResultadoContent: React.FC<AulaResultadoContentProps> = ({
  aulaName = 'Minha Nova Aula',
  selectedTemplate = null,
  turmaImage = null,
  turmaName = null,
  createdAt = new Date()
}) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Professor');

  useEffect(() => {
    const cachedAvatar = localStorage.getItem('userAvatarUrl');
    const cachedName = localStorage.getItem('userFirstName');
    
    if (cachedAvatar) {
      setUserAvatar(cachedAvatar);
    }
    if (cachedName) {
      setUserName(cachedName);
    }
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const CIRCLE_SIZE = 72;

  return (
    <div className="w-full h-full flex flex-col">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="rounded-2xl p-5 flex items-center justify-between"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.03) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.2)',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)'
        }}
      >
        <div className="flex items-center gap-5 flex-1">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="relative flex-shrink-0"
          >
            <div
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: `${CIRCLE_SIZE}px`,
                height: `${CIRCLE_SIZE}px`,
                background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                border: '2px solid rgba(255, 107, 0, 0.4)'
              }}
            >
              <Image className="w-7 h-7 text-[#FF6B00]/60" />
            </div>
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
              style={{
                background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                border: '2px solid #030C2A',
                boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
              }}
            >
              <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
            className="flex flex-col gap-2"
          >
            <h2 className="text-white font-bold text-xl">{aulaName}</h2>
            
            <div className="flex items-center gap-2">
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.25, duration: 0.3 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                style={{
                  background: 'rgba(255, 107, 0, 0.1)',
                  border: '1px solid rgba(255, 107, 0, 0.2)'
                }}
              >
                {selectedTemplate?.icon && (
                  <selectedTemplate.icon 
                    className="w-3.5 h-3.5 text-[#FF6B00]" 
                  />
                )}
                <span className="text-white/80 text-xs font-medium">
                  {selectedTemplate?.name || 'Sem template'}
                </span>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="flex items-center gap-1.5 px-3 py-1 rounded-lg"
                style={{
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="text-white/60 text-xs font-medium">
                  {formatDate(createdAt)}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>

        <div className="flex items-center gap-3">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.35, duration: 0.3 }}
            className="relative flex-shrink-0"
          >
            <div
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: `${CIRCLE_SIZE}px`,
                height: `${CIRCLE_SIZE}px`,
                background: userAvatar 
                  ? 'transparent' 
                  : 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                border: '2px solid rgba(255, 107, 0, 0.4)'
              }}
            >
              {userAvatar ? (
                <img 
                  src={userAvatar} 
                  alt={userName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-7 h-7 text-[#FF6B00]/60" />
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="relative flex-shrink-0"
          >
            <div
              className="rounded-full flex items-center justify-center overflow-hidden"
              style={{
                width: `${CIRCLE_SIZE}px`,
                height: `${CIRCLE_SIZE}px`,
                background: turmaImage 
                  ? 'transparent' 
                  : 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                border: '2px solid rgba(255, 107, 0, 0.4)'
              }}
            >
              {turmaImage ? (
                <img 
                  src={turmaImage} 
                  alt={turmaName || 'Turma'}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Users className="w-7 h-7 text-[#FF6B00]/60" />
              )}
            </div>
            {!turmaImage && (
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full flex items-center justify-center cursor-pointer"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  border: '2px solid #030C2A',
                  boxShadow: '0 2px 8px rgba(255, 107, 0, 0.4)'
                }}
              >
                <Plus className="w-3.5 h-3.5 text-white" strokeWidth={3} />
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>

      <div className="flex-1 mt-6">
      </div>
    </div>
  );
};

export default AulaResultadoContent;
