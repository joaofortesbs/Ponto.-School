
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface ApostilaInteligenteIconProps {
  onClick?: () => void;
}

const ApostilaInteligenteIcon: React.FC<ApostilaInteligenteIconProps> = ({ onClick }) => {
  // Usamos apenas o onClick passado como prop, sem estado interno
  return (
    <HeaderIcon
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
          <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
          <line x1="12" y1="6" x2="16" y2="6" />
          <line x1="12" y1="10" x2="16" y2="10" />
          <line x1="12" y1="14" x2="16" y2="14" />
          <rect x="8" y="6" width="2" height="2" />
          <rect x="8" y="10" width="2" height="2" />
          <rect x="8" y="14" width="2" height="2" />
        </svg>
      }
      onClick={onClick}
      label="Apostila Inteligente"
    />
  );
};

export default ApostilaInteligenteIcon;
