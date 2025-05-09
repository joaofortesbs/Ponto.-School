
import React from "react";
import { motion } from "framer-motion";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div 
      className={`w-full ${className}`} 
      style={{ 
        maxHeight: "calc(100vh - 180px)",
        overflowY: "auto",
        overflowX: "hidden",
        paddingRight: "8px",
        paddingBottom: "16px"
      }}
    >
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-semibold mb-4 text-gray-800 dark:text-white">
          Grupos de Estudo
        </h2>
        <GruposEstudoInterface />
      </motion.div>
    </div>
  );
};

export default GruposEstudoView;
