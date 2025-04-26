
import React from "react";
import { FileText } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface ApostilaInteligenteIconProps {
  active?: boolean;
  onClick?: () => void;
}

export const ApostilaInteligenteIcon: React.FC<ApostilaInteligenteIconProps> = ({ active = false, onClick }) => {
  return (
    <HeaderIcon
      icon={<FileText size={20} className="text-white" />}
      label="Apostila Inteligente"
      active={active}
      onClick={onClick}
    />
  );
};

export default ApostilaInteligenteIcon;
