
import React from "react";
import { Image } from "lucide-react";
import HeaderIcon from "./HeaderIcon";

interface GaleriaIconProps {
  onClick?: () => void;
  isActive?: boolean;
}

const GaleriaIcon: React.FC<GaleriaIconProps> = ({ onClick, isActive }) => {
  return (
    <HeaderIcon
      icon={<Image size={18} />}
      label="Galeria"
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export { GaleriaIcon };
