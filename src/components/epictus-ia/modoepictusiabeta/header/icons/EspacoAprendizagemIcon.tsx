
import React from "react";
import { BookOpen } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface EspacoAprendizagemIconProps {
  active?: boolean;
  onClick?: () => void;
}

export const EspacoAprendizagemIcon: React.FC<EspacoAprendizagemIconProps> = ({ active = false, onClick }) => {
  return (
    <HeaderIcon
      icon={<BookOpen size={20} className="text-white" />}
      label="Espaço de Aprendizagem"
      active={active}
      onClick={onClick}
    />
  );
};

export default EspacoAprendizagemIcon;
