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
  return (
    <div className="flex items-center justify-center z-10 relative gap-3">
      {/* History icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
        } 
      />

      {/* Favorites icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        } 
      />

      {/* Calendar icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        } 
      />

      {/* Notifications icon */}
      <HeaderIcon 
        icon={
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
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