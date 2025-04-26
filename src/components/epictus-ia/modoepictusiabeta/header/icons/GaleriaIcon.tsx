
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface GaleriaIconProps {
  onClick?: () => void;
}

const GaleriaIcon: React.FC<GaleriaIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <polyline points="21 15 16 10 5 21" />
        </svg>
      }
      onClick={onClick}
      label="Galeria"
    />
  );
};

export default GaleriaIcon;
