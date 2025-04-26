
import React from "react";
import { Rocket } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface EspacoAprendizagemIconProps {
  onClick?: () => void;
  isActive?: boolean;
}

const EspacoAprendizagemIcon: React.FC<EspacoAprendizagemIconProps> = ({ onClick, isActive }) => {
  return (
    <HeaderIcon
      icon={<Rocket size={18} />}
      label="Espaço de Aprendizagem"
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export { EspacoAprendizagemIcon };
