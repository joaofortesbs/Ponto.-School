
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  onClick?: () => void;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <div className="h-5 w-5 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden p-[2px] bg-gradient-to-br from-[#0D23A0] via-[#1230CC] to-[#4A0D9F]">
          <div className="h-full w-full rounded-full bg-gray-200 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-gray-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
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
