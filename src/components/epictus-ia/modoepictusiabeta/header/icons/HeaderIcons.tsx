
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { HistoricoIcon } from "./HistoricoIcon";
import { EspacoAprendizagemIcon } from "./EspacoAprendizagemIcon";
import { ApostilaInteligenteIcon } from "./ApostilaInteligenteIcon";
import { ModoFantasmaIcon } from "./ModoFantasmaIcon";
import { GaleriaIcon } from "./GaleriaIcon";

// Componente com ErrorBoundary interno
export const HeaderIcons = () => {
  // Estado para rastrear erros de renderização
  const [hasError, setHasError] = useState(false);
  
  // Log para depuração
  useEffect(() => {
    console.log("HeaderIcons componente renderizado");
    
    // Limpeza
    return () => {
      console.log("HeaderIcons componente desmontado");
    };
  }, []);

  // Se houver erro, mostrar fallback
  if (hasError) {
    return (
      <div className="flex items-center space-x-3 bg-blue-50 dark:bg-blue-900/30 p-2 rounded-lg">
        <span className="text-sm text-blue-800 dark:text-blue-200">Carregando ícones...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-3">
      {/* Adicionando try/catch inline para cada componente para evitar falhas */}
      <HeaderIconWrapper>
        <HistoricoIcon />
      </HeaderIconWrapper>
      
      <HeaderIconWrapper>
        <EspacoAprendizagemIcon />
      </HeaderIconWrapper>
      
      <HeaderIconWrapper>
        <ApostilaInteligenteIcon />
      </HeaderIconWrapper>
      
      <HeaderIconWrapper>
        <ModoFantasmaIcon />
      </HeaderIconWrapper>
      
      <HeaderIconWrapper>
        <GaleriaIcon />
      </HeaderIconWrapper>

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

// Componente wrapper para tratar erros individuais em cada ícone
const HeaderIconWrapper = ({ children }) => {
  const [hasError, setHasError] = useState(false);
  
  useEffect(() => {
    console.log("Ícone de cabeçalho renderizado");
  }, []);
  
  // Se ocorrer erro em um ícone específico
  if (hasError) {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-9 h-9 rounded-full bg-gray-200 dark:bg-gray-800 flex items-center justify-center"
      >
        <span className="text-xs text-gray-500">...</span>
      </motion.div>
    );
  }
  
  try {
    return (
      <motion.div
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="transition-all duration-200 cursor-pointer"
      >
        {children}
      </motion.div>
    );
  } catch (error) {
    console.error("Erro ao renderizar ícone de cabeçalho:", error);
    setHasError(true);
    return null;
  }
};

export default HeaderIcons;
