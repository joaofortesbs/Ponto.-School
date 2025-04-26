
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  onClick?: () => void;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <div className="h-5 w-5 rounded-full flex items-center justify-center overflow-hidden p-[1.5px] bg-gradient-to-r from-[#0D23A0] via-[#4A0D9F] to-[#FF6B00]">
          <div className="h-full w-full rounded-full bg-gradient-to-br from-[#0f1c6a] to-[#020829] flex items-center justify-center">
            <svg 
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              className="h-3.5 w-3.5 text-white/90"
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              strokeLinecap="round" 
              strokeLinejoin="round"
            >
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="8" r="3.5" />
            </svg>
          </div>
        </div>
      }
      onClick={onClick}
      label="Perfil"
    />
  );
};

export default PerfilIcon;
