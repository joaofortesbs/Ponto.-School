
import React from "react";
import { motion } from "framer-motion";
import { HistoricoIcon } from "./HistoricoIcon";
import { EspacoAprendizagemIcon } from "./EspacoAprendizagemIcon";
import { ApostilaInteligenteIcon } from "./ApostilaInteligenteIcon";
import { ModoFantasmaIcon } from "./ModoFantasmaIcon";
import { GaleriaIcon } from "./GaleriaIcon";

export const HeaderIcons = () => {
  return (
    <div className="flex items-center space-x-3">
      {/* Historico */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        <HistoricoIcon />
      </motion.div>

      {/* Espaço de Aprendizagem */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        <EspacoAprendizagemIcon />
      </motion.div>

      {/* Apostila Inteligente */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        <ApostilaInteligenteIcon />
      </motion.div>

      {/* Modo Fantasma */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        <ModoFantasmaIcon />
      </motion.div>

      {/* Galeria */}
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        <GaleriaIcon />
      </motion.div>

      {/* Profile picture - a bit more spaced */}
      <div className="relative profile-icon-container ml-4">
        <motion.div
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#194FBF] to-[#2B6CB0] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full rounded-full bg-[#0f2a4e] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 flex items-center justify-center text-white text-lg font-bold">
              JF
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
