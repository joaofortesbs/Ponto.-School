import React from "react";
import { motion } from "framer-motion";

interface HeaderIconProps {
  icon: React.ReactNode;
  onClick?: () => void;
}

export const HeaderIcon: React.FC<HeaderIconProps> = ({ icon, onClick }) => {
  return (
    <div className="relative icon-container">
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
    </div>
  );
};

export const HeaderIcons: React.FC = () => {
  // Placeholder for history modal functionality.  This needs to be implemented.
  const onHistoryClick = () => {
    console.log("History icon clicked!");
    // Add code here to open the history modal
  };

  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      {/* Histórico icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 8v4l3 3" />
            <circle cx="12" cy="12" r="10" />
          </svg>
        } 
        onClick={onHistoryClick}
      />

      {/* Espaço de Aprendizagem icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
            <circle cx="10" cy="12" r="2" />
          </svg>
        } 
      />

      {/* Apostila Inteligente icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
        } 
      />

      {/* Modo Fantasma icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 10h.01" />
            <path d="M15 10h.01" />
            <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
          </svg>
        } 
      />

      {/* Galeria icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        } 
      />

      {/* Profile picture - a bit more spaced */}
      <div className="relative profile-icon-container ml-4">
        <motion.div
          className="w-11 h-11 rounded-full bg-gradient-to-br from-[#194FBF] to-[#2B6CB0] p-[2px] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow overflow-hidden"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          initial={false}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full rounded-full bg-[#0f2a4e] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 flex items-center justify-center text-white text-lg font-bold">
              JF
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default HeaderIcons;