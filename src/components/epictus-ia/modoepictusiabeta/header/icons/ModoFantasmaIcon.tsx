
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface ModoFantasmaIconProps {
  onClick?: () => void;
  active?: boolean;
}

const ModoFantasmaIcon: React.FC<ModoFantasmaIconProps> = ({ onClick, active = false }) => {
  return (
    <HeaderIcon
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 10h.01" />
          <path d="M15 10h.01" />
          <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
        </svg>
      }
      onClick={onClick}
      label="Modo Fantasma"
    />
  );
};

export default ModoFantasmaIcon;
