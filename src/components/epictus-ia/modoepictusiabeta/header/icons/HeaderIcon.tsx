
import React from "react";
import { motion } from "framer-motion";

interface HeaderIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
  label?: string;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ icon, onClick, label }) => {
  return (
    <div className="relative icon-container group">
      <motion.div
        className="w-10 h-10 rounded-full bg-gradient-to-br from-[#194FBF] to-[#2B6CB0] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        initial={false}
        transition={{ duration: 0.3 }}
        onClick={onClick}
      >
        {icon}
      </motion.div>
      {label && (
        <div className="absolute -bottom-7 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          {label}
        </div>
      )}
    </div>
  );
};

export default HeaderIcon;
