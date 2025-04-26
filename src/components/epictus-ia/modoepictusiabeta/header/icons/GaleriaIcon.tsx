
import React from "react";
import { Image } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface GaleriaIconProps {
  active?: boolean;
  onClick?: () => void;
}

export const GaleriaIcon: React.FC<GaleriaIconProps> = ({ active = false, onClick }) => {
  return (
    <HeaderIcon
      icon={<Image size={20} className="text-white" />}
      label="Galeria"
      active={active}
      onClick={onClick}
    />
  );
};

export default GaleriaIcon;
