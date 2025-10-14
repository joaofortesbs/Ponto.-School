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
      <div className="relative p-4 flex items-center justify-between">
        {/* Container esquerdo com ícone de notificação */}
        <div className="flex items-center gap-3">
          {/* Ícone de notificação */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-orange-600 dark:text-orange-400"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>

          {/* Texto */}
          <h3 className="text-sm font-extrabold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
            Primeiros Passos
          </h3>
        </div>

        {/* Ícone de seta à direita */}
        <ArrowUp className="w-4 h-4 text-orange-500 dark:text-orange-400" />
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