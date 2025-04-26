
import React from "react";
import { BookOpen } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface ApostilaInteligenteIconProps {
  onClick?: () => void;
  isActive?: boolean;
}

const ApostilaInteligenteIcon: React.FC<ApostilaInteligenteIconProps> = ({ onClick, isActive }) => {
  return (
    <HeaderIcon
      icon={<BookOpen size={18} />}
      label="Apostila Inteligente"
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export { ApostilaInteligenteIcon };
