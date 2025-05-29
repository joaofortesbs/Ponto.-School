
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
      className="w-full mb-4 bg-white/10 backdrop-blur-sm border border-orange-200/30 rounded-lg p-2"
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
            className="w-4 h-4 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center"
          >
            <RotateCcw className="w-2.5 h-2.5 text-white" />
          </motion.div>
          <span className="text-xs font-medium text-white/90">
            Giros Disponíveis
          </span>
        </div>

        {/* Contador Total */}
        <motion.div
          key={totalGiros}
          initial={{ scale: 1.1, opacity: 0.8 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-gradient-to-r from-orange-500/30 to-orange-600/30 px-2 py-0.5 rounded-full border border-orange-300/40 w-6 h-6 flex items-center justify-center"
        >
          <span className="text-xs font-bold text-white">
            {totalGiros}
          </span>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default GirosDisponiveisIndicador;
