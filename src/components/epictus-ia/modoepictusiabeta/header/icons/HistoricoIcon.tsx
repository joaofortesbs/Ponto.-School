
import React from "react";
import { History } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface HistoricoIconProps {
  onClick?: () => void;
  isActive?: boolean;
}

const HistoricoIcon: React.FC<HistoricoIconProps> = ({ onClick, isActive }) => {
  return (
    <HeaderIcon
      icon={<History size={18} />}
      label="Histórico"
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export { HistoricoIcon };
