
import React from "react";
import { motion } from "framer-motion";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

export const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={className} style={{
      overflowY: 'auto',
      overflowX: 'hidden'
    }}>
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
