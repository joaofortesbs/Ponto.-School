
import React from "react";
import { motion } from "framer-motion";

interface HeaderIconProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  isActive?: boolean;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ 
  icon, 
  label, 
  onClick, 
  isActive = false 
}) => {
  return (
    <motion.div
      className={`relative flex items-center justify-center w-10 h-10 rounded-full ${
        isActive 
          ? "bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] text-white" 
          : "bg-[#1a2747]/50 text-[#8a9cc5] hover:bg-[#1a2747]/80 hover:text-white"
      } cursor-pointer transition-colors duration-200`}
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      title={label}
    >
      {icon}
    </motion.div>
  );
};

export default HeaderIcon;
