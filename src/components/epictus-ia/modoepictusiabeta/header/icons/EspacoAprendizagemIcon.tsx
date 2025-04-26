
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
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      }
      onClick={onClick}
      label="Espaço de Aprendizagem"
    />
  );
};

export default EspacoAprendizagemIcon;
