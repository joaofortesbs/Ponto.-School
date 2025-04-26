
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  onClick?: () => void;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <div className="h-5 w-5 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#4A0D9F] flex items-center justify-center overflow-hidden">
          <div className="w-full h-full rounded-full bg-[#0f172a] flex items-center justify-center text-white text-[10px] font-bold">
            JF
          </div>
        </div>
      }
      onClick={onClick}
      label="Perfil"
    />
  );
};

export default PerfilIcon;
