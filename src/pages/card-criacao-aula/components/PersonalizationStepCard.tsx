import React from 'react';
import { motion } from 'framer-motion';

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
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: animationDelay, duration: 0.3 }}
      className="w-full"
    >
      {/* Título da Seção */}
      <h3 className="text-white font-semibold text-sm mb-4">
        <span className="text-[#FF6B00]">{stepNumber}°:</span> {title}
      </h3>

      {/* Card Container */}
      <div 
        className="p-6 rounded-2xl"
        style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 0, 0.1) 0%, rgba(255, 107, 0, 0.05) 100%)',
          border: '1px solid rgba(255, 107, 0, 0.25)',
          boxShadow: '0 4px 16px rgba(255, 107, 0, 0.1)'
        }}
      >
        {children}
      </div>
    </motion.div>
  );
};

export default PersonalizationStepCard;
