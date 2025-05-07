
import React from "react";
import HeaderIcon from "../HeaderIcon";
import { motion } from "framer-motion";
import { User } from "lucide-react";

interface PersonalidadesIconProps {
  onClick?: () => void;
}

const PersonalidadesIcon: React.FC<PersonalidadesIconProps> = ({ onClick }) => {
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
          
          <User className="h-5 w-5 text-white relative z-10" />
        </motion.div>
      }
      onClick={onClick}
      label="Personalidades"
    />
  );
};

export default PersonalidadesIcon;
