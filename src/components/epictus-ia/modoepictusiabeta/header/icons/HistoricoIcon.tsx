
import React from "react";
import { Clock } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface HistoricoIconProps {
  active?: boolean;
  onClick?: () => void;
}

export const HistoricoIcon: React.FC<HistoricoIconProps> = ({ active = false, onClick }) => {
  return (
    <HeaderIcon
      icon={<Clock size={20} className="text-white" />}
      label="Histórico"
      active={active}
      onClick={onClick}
    />
  );
};

export default HistoricoIcon;
