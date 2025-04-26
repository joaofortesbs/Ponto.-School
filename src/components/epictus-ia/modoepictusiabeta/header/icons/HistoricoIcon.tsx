
import React from "react";
import HeaderIcon from "./HeaderIcon";
import { motion } from "framer-motion";

interface HistoricoIconProps {
  onClick?: () => void;
}

const HistoricoIcon: React.FC<HistoricoIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <motion.div
          className="relative h-5 w-5 flex items-center justify-center"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* Brilho de fundo do ícone */}
          <motion.div 
            className="absolute inset-0 rounded-full opacity-0 bg-gradient-to-r from-[#0D23A0]/30 to-[#4A0D9F]/30"
            animate={{ 
              opacity: [0, 0.5, 0], 
              scale: [0.8, 1.1, 0.8],
            }}
            transition={{ 
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut" 
            }}
          />
          
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        </motion.div>
      }
      onClick={onClick}
      label="Histórico"
    />
  );
};

export default HistoricoIcon;
