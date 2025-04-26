import React from "react";
import { motion } from "framer-motion";

interface ProfileOption {
  id: string;
  icon: React.ReactNode;
  color: string;
  name: string;
  onClick: () => void;
}

interface PersonalitiesDropdownProps {
  profileIcon: React.ReactNode;
  profileName: string;
  profileOptions: ProfileOption[];
}

const PersonalitiesDropdown: React.FC<PersonalitiesDropdownProps> = ({
  profileIcon,
  profileName,
  profileOptions
}) => {
  return (
    <div className="relative icon-container mr-5 group" style={{ zIndex: 99999, position: "relative" }}>
      <motion.div
        className="relative w-auto h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] flex items-center justify-center cursor-pointer shadow-lg hover:shadow-xl transition-shadow px-3 group"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        initial={false}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center gap-2">
          {profileIcon}
          <span className="text-white text-sm font-medium">{profileName}</span>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white transition-transform duration-300 group-hover:rotate-180" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </div>
      </motion.div>

      {/* Dropdown content - absolute positioning relative to its container */}
      <div className="fixed group-hover:opacity-100 group-hover:visible opacity-0 invisible transition-all duration-300 z-[99999] left-auto mt-2 personalidades-dropdown" style={{ top: "calc(100% + 10px)" }}>
        <div className="w-52 bg-gradient-to-r from-[#19407E] to-[#2A61B6] rounded-lg shadow-xl overflow-hidden border border-white/10 backdrop-blur-md" style={{ position: "relative", zIndex: 99999 }}>
          <div className="max-h-60 overflow-y-auto py-2">
            {profileOptions.map((item, index) => (
              <motion.div 
                key={index} 
                className="flex items-center gap-2 px-3 py-2 cursor-pointer mb-1 mx-2 rounded-lg hover:bg-white/10 transition-all"
                whileHover={{ 
                  y: -2, 
                  boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
                  scale: 1.02
                }}
                onClick={item.onClick}
              >
                <div 
                  className="w-7 h-7 rounded-md flex items-center justify-center shadow-inner"
                  style={{ 
                    background: `linear-gradient(135deg, ${item.color}30, ${item.color}50)`,
                    boxShadow: `0 0 15px ${item.color}40`
                  }}
                >
                  {item.icon}
                </div>
                <span className="text-white text-sm">{item.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalitiesDropdown;