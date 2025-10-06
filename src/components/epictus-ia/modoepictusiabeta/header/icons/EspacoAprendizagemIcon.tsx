
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface EspacoAprendizagemIconProps {
  onClick?: () => void;
}

const EspacoAprendizagemIcon: React.FC<EspacoAprendizagemIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
        </svg>
      }
      onClick={onClick}
      label="Espaço de Aprendizagem"
    />
  );
};

export default EspacoAprendizagemIcon;
