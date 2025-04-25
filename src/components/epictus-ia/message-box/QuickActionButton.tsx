
import React from "react";
import { motion } from "framer-motion";

interface QuickActionButtonProps {
  icon: React.ReactNode;
  text: string;
  onClick?: () => void;
}

const QuickActionButton: React.FC<QuickActionButtonProps> = ({ 
  icon, 
  text, 
  onClick 
}) => {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
               text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md"
      whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{text}</span>
    </motion.button>
  );
};

export default QuickActionButton;
