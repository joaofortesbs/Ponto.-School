
import React from "react";
import { Trophy } from "lucide-react";
import { motion } from "framer-motion";

interface CardRecompensasDisponiveisProps {
  currentPrizes: Array<{
    name: string;
    color: string;
    angle: number;
    icon: React.ReactNode;
    chance: number;
  }>;
  onRegeneratePrizes: () => void;
  regenerationCount: number;
  userSPs: number;
}

const CardRecompensasDisponiveis: React.FC<CardRecompensasDisponiveisProps> = ({ 
  currentPrizes, 
  onRegeneratePrizes, 
  regenerationCount, 
  userSPs 
}) => {
  const getRegenerationCost = (count: number) => {
    if (count === 0) return 25;
    if (count === 1) return 50;
    if (count === 2) return 99;
    return 99; // Máximo
  };

  const cost = getRegenerationCost(regenerationCount);
  const canRegenerate = userSPs >= cost && regenerationCount < 3;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.6, type: "spring", damping: 20 }}
      className="w-72 h-72 rounded-xl overflow-hidden relative bg-white/10 backdrop-blur-sm border border-orange-200/30 mt-4"
      style={{
        boxShadow: "0 4px 16px rgba(255, 107, 0, 0.1)"
      }}
    >
      {/* Efeito de brilho sutil */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/5 via-transparent to-orange-200/5 pointer-events-none" />

      <div className="relative z-10 p-4 h-full flex flex-col">
        {/* Topo - Título e Botão de Regeneração */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {/* Ícone de troféu para recompensas */}
            <div className="w-5 h-5 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center shadow-lg">
              <Trophy className="w-3 h-3 text-white drop-shadow-sm" />
            </div>
            <h3 className="text-sm font-semibold text-white">Recompensas Disponíveis</h3>
          </div>

          {/* Botão de Regeneração */}
          <motion.button
            whileHover={canRegenerate ? { scale: 1.05 } : {}}
            whileTap={canRegenerate ? { scale: 0.95 } : {}}
            onClick={canRegenerate ? onRegeneratePrizes : undefined}
            disabled={!canRegenerate}
            className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
              canRegenerate 
                ? 'bg-orange-500/20 hover:bg-orange-500/30 text-white border border-orange-300/30 cursor-pointer'
                : 'bg-gray-500/20 text-gray-400 border border-gray-500/30 cursor-not-allowed opacity-50'
            }`}
            title={!canRegenerate ? (userSPs < cost ? "SPs insuficientes" : "Limite de regenerações atingido") : ""}
          >
            <motion.div
              animate={{ rotate: canRegenerate ? [0, 360] : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            >
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
            </motion.div>
            <span>{cost} SPs</span>
          </motion.button>
        </div>

        {/* Grade de Recompensas */}
        <div className="flex-1 grid grid-cols-3 gap-3">
          {currentPrizes.map((prize, index) => (
            <motion.div
              key={`${prize.name}-${regenerationCount}-${index}`}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: index * 0.1, duration: 0.4 }}
              className="relative bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-orange-200/20 hover:border-orange-300/40 transition-all duration-200"
            >
              {/* Badge de Probabilidade */}
              <div className="absolute -top-1 -right-1 bg-gradient-to-r from-orange-500 to-orange-600 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border border-orange-300/50">
                {prize.chance}%
              </div>

              {/* Ícone da Recompensa */}
              <div className="flex items-center justify-center mb-1.5">
                <div className="w-6 h-6 flex items-center justify-center">
                  {prize.icon}
                </div>
              </div>

              {/* Nome da Recompensa */}
              <div className="text-center">
                <p className="text-[9px] text-white/90 font-medium leading-tight">
                  {prize.name.split(' ').map((word, i) => (
                    <span key={i} className="block">{word}</span>
                  ))}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CardRecompensasDisponiveis;
