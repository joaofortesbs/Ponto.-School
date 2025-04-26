import React from "react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  onClick?: () => void;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick }) => {
  return (
    <HeaderIcon
      icon={
        <div className="h-5 w-5 rounded-full p-[1.5px] bg-gradient-to-br from-[#194FBF] to-[#2B6CB0] flex items-center justify-center overflow-hidden">
          <div className="w-full h-full rounded-full bg-[#0f2a4e] flex items-center justify-center overflow-hidden">
            <div className="w-full h-full rounded-full bg-gradient-to-r from-[#0c2341]/80 to-[#0f3562]/80 flex items-center justify-center text-white text-[10px] font-bold">
              JF
            </div>
          </div>
        </div>
      }
      onClick={onClick}
      label="Perfil"
    />
  );
};

export default PerfilIcon;