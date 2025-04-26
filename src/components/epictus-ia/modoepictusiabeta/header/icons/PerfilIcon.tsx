
import React from "react";
import { User } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  active?: boolean;
  onClick?: () => void;
}

export const PerfilIcon: React.FC<PerfilIconProps> = ({ active = false, onClick }) => {
  return (
    <HeaderIcon
      icon={<User size={20} className="text-white" />}
      label="Perfil"
      active={active}
      onClick={onClick}
    />
  );
};

export default PerfilIcon;
