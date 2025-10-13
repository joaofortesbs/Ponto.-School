
import React from 'react';
import { ArrowUp } from 'lucide-react';
import { motion } from 'framer-motion';

interface CardPrimeiroPassosProps {
  isCollapsed?: boolean;
}

export const CardPrimeiroPassos: React.FC<CardPrimeiroPassosProps> = ({ isCollapsed = false }) => {
  if (isCollapsed) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="mx-4 mb-4 relative overflow-hidden rounded-2xl"
    >
      {/* Background com gradiente igual ao WelcomeModal */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50 via-orange-100/50 to-amber-50/60 dark:from-orange-950/30 dark:via-orange-900/20 dark:to-gray-900/40" />
      
      {/* Efeito de vidro */}
      <div className="absolute inset-0 backdrop-blur-xl border border-orange-200/50 dark:border-orange-500/30 rounded-2xl" />
      
      {/* Brilho sutil no topo */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-orange-300/50 to-transparent" />
      
      {/* Conteúdo */}
      <div className="relative p-4 flex items-center justify-center">
        {/* Container centralizado com ícone e texto */}
        <div className="flex items-center gap-3">
          {/* Ícone de notificação circular */}
          <div className="w-8 h-8 rounded-full bg-orange-500/20 dark:bg-orange-400/20 flex items-center justify-center border border-orange-500/30 dark:border-orange-400/30">
            <div className="w-2 h-2 rounded-full bg-orange-500 dark:bg-orange-400" />
          </div>
          
          {/* Texto */}
          <h3 className="text-sm font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
            Primeiros Passos
          </h3>
          
          {/* Ícone de seta à direita */}
          <ArrowUp className="w-4 h-4 text-orange-500 dark:text-orange-400" />
        </div>
      </div>

      {/* Efeito de brilho animado */}
      <motion.div
        animate={{
          opacity: [0.02, 0.04, 0.02],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute -top-32 -right-32 w-48 h-48 bg-orange-400/8 rounded-full blur-3xl pointer-events-none"
      />
    </motion.div>
  );
};
