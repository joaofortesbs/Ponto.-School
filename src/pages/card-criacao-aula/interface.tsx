import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, BookOpen, Sparkles } from 'lucide-react';

interface CriacaoAulaPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

const CriacaoAulaPanel: React.FC<CriacaoAulaPanelProps> = ({
  isOpen,
  onClose
}) => {
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
            <div className="flex flex-col items-center justify-center h-full">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center max-w-md"
              >
                <div 
                  className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                  style={{ background: 'rgba(255, 107, 0, 0.15)' }}
                >
                  <BookOpen className="w-10 h-10 text-[#FF6B00]" />
                </div>
                
                <h3 className="text-2xl font-bold text-white mb-3">
                  Crie sua aula personalizada
                </h3>
                
                <p className="text-white/60 text-sm mb-8">
                  Configure todos os detalhes da sua aula: tema, objetivos, 
                  materiais didáticos e muito mais. Use a IA para gerar 
                  conteúdo automaticamente.
                </p>
                
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-8 py-4 rounded-2xl text-white font-semibold transition-all"
                  style={{
                    background: 'linear-gradient(135deg, #FF6B00 0%, #FF8533 100%)',
                    boxShadow: '0 8px 24px rgba(255, 107, 0, 0.4)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-5 h-5" />
                    <span>Começar a criar</span>
                  </div>
                </motion.button>
              </motion.div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CriacaoAulaPanel;
