import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Image, User, Users, Play, MoreVertical, Share2, Download, Calendar, Lock, BarChart3 } from 'lucide-react';
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
  const [aulaImage, setAulaImage] = useState<string | null>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const formatDate = (date: Date) => {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleImageUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAulaImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleMenuItemClick = (action: string) => {
    console.log(`Ação selecionada: ${action}`);
    setIsMenuOpen(false);
  };

  const CIRCLE_SIZE = 72;
  const ACTION_CIRCLE_SIZE = 48;
  const ANALYTICS_CARD_WIDTH = 65;
  const ANALYTICS_CARD_HEIGHT = 105;

  return (
    <div className="w-full h-full flex flex-col">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleImageChange}
        accept="image/*"
        className="hidden"
      />

      <div className="flex gap-0">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="p-5 flex items-center justify-between flex-1"
          style={{
            background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.08) 0%, rgba(255, 107, 0, 0.03) 100%)',
            border: '1px solid rgba(255, 107, 0, 0.2)',
            borderRadius: '16px 16px 0 0',
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
                  background: aulaImage 
                    ? 'transparent'
                    : 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                  border: '2px solid rgba(255, 107, 0, 0.4)'
                }}
              >
                {aulaImage ? (
                  <img 
                    src={aulaImage} 
                    alt="Imagem da aula"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Image className="w-7 h-7 text-[#FF6B00]/60" />
                )}
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={handleImageUploadClick}
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

            <motion.div
              ref={menuRef}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, duration: 0.3 }}
              className="relative flex-shrink-0"
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="cursor-pointer"
              >
                <div
                  className="rounded-full flex items-center justify-center"
                  style={{
                    width: `${CIRCLE_SIZE}px`,
                    height: `${CIRCLE_SIZE}px`,
                    background: isMenuOpen 
                      ? 'rgba(255, 107, 0, 0.3)'
                      : 'rgba(255, 107, 0, 0.15)',
                    border: '2px solid rgba(255, 107, 0, 0.4)'
                  }}
                >
                  <MoreVertical className="w-6 h-6 text-[#FF6B00]" />
                </div>
              </motion.div>

              <AnimatePresence>
                {isMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    className="absolute right-0 top-full mt-2 rounded-xl overflow-hidden z-50"
                    style={{
                      background: 'linear-gradient(135deg, #0a1434 0%, #030C2A 100%)',
                      border: '1px solid rgba(255, 107, 0, 0.3)',
                      boxShadow: '0 10px 30px rgba(0, 0, 0, 0.4), 0 0 15px rgba(255, 107, 0, 0.1)',
                      minWidth: '200px'
                    }}
                  >
                    <div className="py-2">
                      <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)' }}
                        onClick={() => handleMenuItemClick('compartilhar')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Share2 className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-sm font-medium">Compartilhar</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)' }}
                        onClick={() => handleMenuItemClick('baixar')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Download className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-sm font-medium">Baixar</span>
                      </motion.button>

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)' }}
                        onClick={() => handleMenuItemClick('adicionar-calendario')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Calendar className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-sm font-medium">Add. ao calendário</span>
                      </motion.button>

                      <div className="h-px bg-gradient-to-r from-transparent via-[#FF6B00]/20 to-transparent mx-3 my-1" />

                      <motion.button
                        whileHover={{ x: 4, backgroundColor: 'rgba(255, 107, 0, 0.1)' }}
                        onClick={() => handleMenuItemClick('tornar-privada')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-white/90 hover:text-white transition-colors"
                      >
                        <Lock className="w-4 h-4 text-[#FF6B00]" />
                        <span className="text-sm font-medium">Tornar privada</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5, duration: 0.3 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="flex-shrink-0 cursor-pointer"
              title="Modo Apresentação de atividade"
            >
              <div
                className="rounded-full flex items-center justify-center"
                style={{
                  width: `${CIRCLE_SIZE}px`,
                  height: `${CIRCLE_SIZE}px`,
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  border: '2px solid rgba(255, 107, 0, 0.6)',
                  boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)'
                }}
              >
                <Play className="w-5 h-5 text-white ml-0.5" fill="white" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="flex-shrink-0"
        >
          <div
            className="flex items-end justify-center"
            style={{
              width: `${ANALYTICS_CARD_WIDTH}px`,
              height: `${ANALYTICS_CARD_HEIGHT}px`,
              background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.08) 100%)',
              border: '1px solid rgba(255, 107, 0, 0.3)',
              borderRadius: '0 0 12px 12px',
              padding: '10px',
              boxShadow: '0 4px 12px rgba(255, 107, 0, 0.1)',
              marginTop: 'auto'
            }}
          >
            <BarChart3 className="w-5 h-5 text-[#FF6B00]" />
          </div>
        </motion.div>
      </div>

      <div className="flex-1 mt-6">
      </div>
    </div>
  );
};

export default AulaResultadoContent;
