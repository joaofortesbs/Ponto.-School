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
        <div className="flex items-center bg-[#0D23A0] px-3 py-1 rounded-full">
          <User className="h-5 w-5 text-white mr-2" />
          <span className="text-white text-sm">Personalidades</span>
          <motion.div 
            animate={{ rotate: [0, 180] }}
            transition={{ duration: 0.5 }}
            className="ml-1 text-white"
          >
            ▼
          </motion.div>
        </div>
      }
      onClick={onClick}
      label=""
    />
  );
};

export default PersonalidadesIcon;