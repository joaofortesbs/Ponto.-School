import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import AulaResultadoContent from './components/AulaResultadoContent';
import { Template } from './components/TemplateDropdown';

interface ConstrucaoAulaPanelProps {
  isOpen: boolean;
  onClose: () => void;
  aulaName?: string;
  selectedTemplate?: Template | null;
  turmaImage?: string | null;
  turmaName?: string | null;
}

const PANEL_PADDING_HORIZONTAL = 13;
const PANEL_BORDER_RADIUS = 24;
const PANEL_HEADER_PADDING = 16;
const PANEL_HEADER_BORDER_RADIUS = 24;

const ConstrucaoAulaPanel: React.FC<ConstrucaoAulaPanelProps> = ({
  isOpen,
  onClose,
  aulaName = 'Minha Nova Aula',
  selectedTemplate = null,
  turmaImage = null,
  turmaName = null
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
          <motion.button
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-all z-50"
          >
            <X className="w-5 h-5" />
          </motion.button>
          
          <div className="flex-1 overflow-auto p-6">
            <AulaResultadoContent
              aulaName={aulaName}
              selectedTemplate={selectedTemplate}
              turmaImage={turmaImage}
              turmaName={turmaName}
              createdAt={new Date()}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ConstrucaoAulaPanel;
