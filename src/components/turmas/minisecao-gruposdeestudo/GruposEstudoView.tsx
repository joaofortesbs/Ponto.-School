import React from "react";
import { motion } from "framer-motion";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className} card-container`} style={{ 
      contain: 'content',
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      {/* Conteúdo removido conforme solicitado */}
    </div>
  );
};

export default GruposEstudoView;