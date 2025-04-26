
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface HistoricoIconProps {
  onClick?: () => void;
}

const HistoricoIcon: React.FC<HistoricoIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 8v4l3 3" />
          <circle cx="12" cy="12" r="10" />
        </svg>
      }
      onClick={onClick}
      label="Histórico"
    />
  );
};

export default HistoricoIcon;
