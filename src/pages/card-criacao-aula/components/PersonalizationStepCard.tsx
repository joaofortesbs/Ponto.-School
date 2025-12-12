import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface PersonalizationStepCardProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  animationDelay?: number;
}

const PersonalizationStepCard: React.FC<PersonalizationStepCardProps> = ({
  stepNumber,
  title,
  children,
  animationDelay = 0
}) => {
  const [isExpanded, setIsExpanded] = useState(true);

  const handleCardClick = () => {
    if (!isExpanded) {
      setIsExpanded(true);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="w-full"
    >
      {/* Card Container */}
      <div 
        className="rounded-2xl overflow-hidden cursor-pointer"
        onClick={handleCardClick}
        style={{
          width: '100%',
          maxWidth: '1000px',
          margin: '0 auto',
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.25)',
          boxShadow: '0 4px 16px rgba(255, 107, 0, 0.1)'
        }}
      >
        {/* Título dentro do Card com Botão de Minimizar */}
        <div className="px-6 py-4 border-b border-[#FF6B00]/15 flex items-center justify-between gap-4">
          {/* Círculo com borda laranja */}
          <div
            className="flex-shrink-0 rounded-full"
            style={{
              width: '24px',
              height: '24px',
              border: '2px solid #FF6B00',
              background: 'rgba(255, 107, 0, 0.1)'
            }}
          />
          
          <h3 className="text-white font-bold text-lg flex-1">
            {title}
          </h3>
          
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="p-2 rounded-lg transition-colors"
            style={{
              background: 'rgba(255, 107, 0, 0.15)',
              color: '#FF6B00'
            }}
          >
            <motion.div
              animate={{ rotate: isExpanded ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              <ChevronDown className="w-5 h-5" />
            </motion.div>
          </motion.button>
        </div>

        {/* Conteúdo dentro do Card com Animação de Minimização */}
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          animate={{ 
            opacity: isExpanded ? 1 : 0,
            height: isExpanded ? 'auto' : 0
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="p-6">
            {children}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PersonalizationStepCard;
