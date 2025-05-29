
import React from "react";
import { motion } from "framer-motion";
import { RotateCcw } from "lucide-react";

interface GirosDisponiveisIndicadorProps {
  girosDisponiveis: number;
  girosEspeciais: number;
}

const GirosDisponiveisIndicador: React.FC<GirosDisponiveisIndicadorProps> = ({
  girosDisponiveis,
  girosEspeciais
}) => {
  const totalGiros = girosDisponiveis + girosEspeciais;

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.4, type: "spring", damping: 20 }}
      className="w-full mb-4 bg-white/10 backdrop-blur-sm border border-orange-200/30 rounded-xl p-3"
      style={{
        boxShadow: "0 2px 8px rgba(255, 107, 0, 0.1)"
      }}
    >
      <div className="flex items-center justify-between">
        {/* Lado esquerdo - Ícone e label */}
        <div className="flex items-center gap-2">
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            className="w-5 h-5 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center"
          >
            <RotateCcw className="w-3 h-3 text-white" />
          </motion.div>
          <span className="text-sm font-medium text-white/90">
            Giros Disponíveis
          </span>
        </div>

        {/* Lado direito - Contadores */}
        <div className="flex items-center gap-3">
          {/* Giros Normais */}
          {girosDisponiveis > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/70">Normal:</span>
              <motion.div
                key={girosDisponiveis}
                initial={{ scale: 1.2, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-orange-500/20 px-2 py-1 rounded-full border border-orange-300/30"
              >
                <span className="text-sm font-bold text-white">
                  {girosDisponiveis}
                </span>
              </motion.div>
            </div>
          )}

          {/* Giros Especiais */}
          {girosEspeciais > 0 && (
            <div className="flex items-center gap-1">
              <span className="text-xs text-white/70">Especial:</span>
              <motion.div
                key={girosEspeciais}
                initial={{ scale: 1.2, opacity: 0.8 }}
                animate={{ scale: 1, opacity: 1 }}
                className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 px-2 py-1 rounded-full border border-purple-300/30"
              >
                <span className="text-sm font-bold text-white">
                  {girosEspeciais}
                </span>
              </motion.div>
            </div>
          )}

          {/* Total quando há ambos os tipos */}
          {girosDisponiveis > 0 && girosEspeciais > 0 && (
            <div className="w-px h-4 bg-white/20"></div>
          )}

          {/* Contador Total */}
          <motion.div
            key={totalGiros}
            initial={{ scale: 1.1, opacity: 0.8 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gradient-to-r from-orange-500/30 to-orange-600/30 px-3 py-1 rounded-full border border-orange-300/40"
          >
            <span className="text-sm font-bold text-white">
              {totalGiros}
            </span>
          </motion.div>
        </div>
      </div>

      {/* Barra de progresso visual (opcional) */}
      {totalGiros > 0 && (
        <div className="mt-2 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${Math.min(totalGiros * 20, 100)}%` }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-orange-400 to-orange-600 rounded-full"
          />
        </div>
      )}
    </motion.div>
  );
};

export default GirosDisponiveisIndicador;
