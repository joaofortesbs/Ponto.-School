import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles, User } from 'lucide-react';

interface CriacaoAulaPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

const CARD_HEIGHT = 56;
const CARD_MAX_WIDTH = 280; // Largura máxima do card de personalização (em pixels)
const TEXT_PADDING_LEFT = 40; // Distância do texto "Agente Professor" a partir da esquerda (em pixels)

const CriacaoAulaPanel: React.FC<CriacaoAulaPanelProps> = ({
  isOpen,
  onClose
}) => {
  const [userAvatar, setUserAvatar] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>('Professor');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const cachedAvatar = localStorage.getItem('userAvatarUrl');
        const cachedName = localStorage.getItem('userFirstName');
        
        if (cachedAvatar) {
          setUserAvatar(cachedAvatar);
        }
        if (cachedName) {
          setUserName(cachedName);
        }

        const userId = localStorage.getItem('user_id');
        if (userId) {
          const response = await fetch(`/api/perfis?id=${userId}`);
          if (response.ok) {
            const result = await response.json();
            if (result.success && result.data) {
              if (result.data.imagem_avatar) {
                setUserAvatar(result.data.imagem_avatar);
                localStorage.setItem('userAvatarUrl', result.data.imagem_avatar);
              }
              if (result.data.nome_completo) {
                const firstName = result.data.nome_completo.split(' ')[0];
                setUserName(firstName);
              }
            }
          }
        }
      } catch (error) {
        console.error('Erro ao buscar perfil do usuário:', error);
      }
    };

    if (isOpen) {
      fetchUserProfile();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring',
            damping: 30,
            stiffness: 300,
            mass: 0.8
          }}
          className="absolute inset-0 z-40 flex flex-col"
          style={{ 
            background: '#030C2A',
            borderRadius: `${PANEL_BORDER_RADIUS}px`,
            border: '1px solid rgba(255, 107, 0, 0.2)',
            margin: `0 ${PANEL_PADDING_HORIZONTAL}px`,
            maxWidth: `calc(100% - ${PANEL_PADDING_HORIZONTAL * 2}px)`
          }}
        >
          <div 
            className="flex items-center justify-between border-b border-[#FF6B00]/20 flex-shrink-0 relative z-50" 
            style={{ 
              padding: `${PANEL_HEADER_PADDING}px ${PANEL_PADDING_HORIZONTAL}px`, 
              background: '#0a1434', 
              borderRadius: `${PANEL_HEADER_BORDER_RADIUS}px ${PANEL_HEADER_BORDER_RADIUS}px 0 0` 
            }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(255, 107, 0, 0.15)' }}
              >
                <BookOpen className="w-5 h-5 text-[#FF6B00]" />
              </div>
              <h2 className="text-lg font-bold text-white">Personalize sua aula</h2>
            </div>
            
            <div className="flex items-center gap-3">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-white text-sm font-semibold transition-all"
                style={{
                  background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                  boxShadow: '0 4px 15px rgba(255, 107, 0, 0.3)'
                }}
              >
                <Sparkles className="w-4 h-4" />
                <span>Criar com IA</span>
              </motion.button>
              
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-5 h-5" />
              </motion.button>
            </div>
          </div>
          
          <div className="flex-1 overflow-auto p-6">
            <div className="space-y-4" style={{ maxWidth: `${CARD_MAX_WIDTH}px` }}>
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1, duration: 0.3 }}
                className="relative"
              >
                <div 
                  className="absolute -left-4 top-1/2 -translate-y-1/2 rounded-full overflow-hidden flex items-center justify-center"
                  style={{ 
                    width: `${CARD_HEIGHT}px`,
                    height: `${CARD_HEIGHT}px`,
                    zIndex: 10,
                    background: userAvatar ? 'transparent' : 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    border: '3px solid #FF6B00',
                    boxShadow: '0 4px 12px rgba(255, 107, 0, 0.4)'
                  }}
                >
                  {userAvatar ? (
                    <img 
                      src={userAvatar} 
                      alt="Avatar do Professor"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-6 h-6 text-white" />
                  )}
                </div>

                <div 
                  className="flex items-center pr-8"
                  style={{
                    height: `${CARD_HEIGHT}px`,
                    background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.15) 0%, rgba(255, 107, 0, 0.05) 100%)',
                    borderRadius: `${CARD_HEIGHT}px`,
                    border: '1px solid rgba(255, 107, 0, 0.3)',
                    paddingLeft: `${TEXT_PADDING_LEFT}px`
                  }}
                >
                  <span className="text-white font-semibold text-base">
                    Agente Professor
                  </span>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="flex items-center justify-center py-8"
              >
                <div className="text-center text-white/40">
                  <p className="text-sm">Cards 2 e 3 em desenvolvimento...</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CriacaoAulaPanel;
