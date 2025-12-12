import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface PersonalizationStepCardProps {
  stepNumber: number;
  title: string;
  children: React.ReactNode;
  animationDelay?: number;
  icon: React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
}

const PersonalizationStepCard: React.FC<PersonalizationStepCardProps> = ({
  stepNumber,
  title,
  children,
  animationDelay = 0,
  icon,
  isOpen,
  onToggle
}) => {
  const handleHeaderClick = () => {
    onToggle();
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="w-full flex gap-3 items-stretch justify-center relative"
    >
      {/* Bolinha ao lado esquerdo */}
      <motion.div
        initial={{ opacity: 0, x: -15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: animationDelay + 0.1, duration: 0.3 }}
        className="flex-shrink-0 flex items-center"
        style={{
          width: '24px',
          minWidth: '24px'
        }}
      >
        <div
          className="rounded-full"
          style={{
            width: '24px',
            height: '24px',
            border: '2px solid #FF6B00',
            background: 'rgba(255, 107, 0, 0.1)',
            zIndex: 10
          }}
        />
      </motion.div>

      {/* Card Container */}
      <div 
        className="rounded-2xl overflow-hidden flex-1"
        style={{
          width: '100%',
          maxWidth: '1000px',
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.25)',
          boxShadow: '0 4px 16px rgba(255, 107, 0, 0.1)',
          position: 'relative',
          zIndex: 1
        }}
      >
        {/* Título dentro do Card - TODO O CABEÇALHO É CLICÁVEL */}
        <button
          onClick={handleHeaderClick}
          className="w-full px-6 py-4 border-b border-[#FF6B00]/15 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer"
          style={{
            background: 'transparent'
          }}
        >
          <div className="flex items-center gap-3 flex-1 text-left">
            <div className="text-[#FF6B00] flex-shrink-0">
              {icon}
            </div>
            <h3 className="text-white font-bold text-lg">
              {title}
            </h3>
          </div>
          
          <motion.div
            animate={{ rotate: isOpen ? 0 : 180 }}
            transition={{ duration: 0.3 }}
            className="flex-shrink-0 p-2 rounded-lg"
            style={{
              background: 'rgba(255, 107, 0, 0.15)',
              color: '#FF6B00'
            }}
          >
            <ChevronDown className="w-5 h-5" />
          </motion.div>
        </button>

        {/* Conteúdo dentro do Card com Animação de Minimização */}
        <motion.div
          initial={{ opacity: 1, height: 'auto' }}
          animate={{ 
            opacity: isOpen ? 1 : 0,
            height: isOpen ? 'auto' : 0
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
