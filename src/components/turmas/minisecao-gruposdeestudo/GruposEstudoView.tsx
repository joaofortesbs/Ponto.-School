
import React from "react";
import { motion } from "framer-motion";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

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
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
