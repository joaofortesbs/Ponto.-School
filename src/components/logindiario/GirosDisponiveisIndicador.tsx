
import React from "react";
import { RotateCcw, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface GirosDisponiveisIndicadorProps {
  girosDisponiveis: number;
  girosEspeciais: number;
}

const GirosDisponiveisIndicador: React.FC<GirosDisponiveisIndicadorProps> = ({
  girosDisponiveis,
  girosEspeciais,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-white/20 backdrop-blur-md border border-white/30 rounded-full px-4 py-2 flex items-center gap-3"
    >
      {/* Giros Normais */}
      <div className="flex items-center gap-1">
        <RotateCcw className="w-4 h-4 text-orange-500" />
        <span className="text-white font-semibold text-sm">{girosDisponiveis}</span>
      </div>

      {/* Divisor */}
      {girosEspeciais > 0 && (
        <div className="w-px h-4 bg-white/30" />
      )}

      {/* Giros Especiais */}
      {girosEspeciais > 0 && (
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1, repeat: Infinity }}
          className="flex items-center gap-1"
        >
          <Zap className="w-4 h-4 text-yellow-500" />
          <span className="text-yellow-500 font-semibold text-sm">{girosEspeciais}</span>
        </motion.div>
      )}
    </motion.div>
  );
};

export default GirosDisponiveisIndicador;
