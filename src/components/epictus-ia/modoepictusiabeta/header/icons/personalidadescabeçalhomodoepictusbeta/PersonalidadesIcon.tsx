import React from "react";
import HeaderIcon from "../HeaderIcon";
import { motion } from "framer-motion";
import { User, ChevronDown } from "lucide-react";

interface PersonalidadesIconProps {
  onClick?: () => void;
}

const PersonalidadesIcon: React.FC<PersonalidadesIconProps> = ({ onClick }) => {
  return (
    <div 
      className="flex items-center bg-[#0D23A0] px-3 py-1.5 rounded-full cursor-pointer hover:bg-[#0A1C80] transition-colors"
      onClick={onClick}
    >
      <User className="h-4 w-4 text-white mr-1.5" />
      <span className="text-white text-sm font-medium">Personalidades</span>
      <ChevronDown className="h-3.5 w-3.5 ml-1 text-white" />
    </div>
  );
};

export default PersonalidadesIcon;