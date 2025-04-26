
import React from "react";
import HeaderIcon from "./HeaderIcon";

interface PerfilIconProps {
  onClick?: () => void;
  isActive?: boolean;
  userInitials?: string;
}

const PerfilIcon: React.FC<PerfilIconProps> = ({ onClick, isActive, userInitials = "JF" }) => {
  return (
    <HeaderIcon
      icon={
        <div className="flex items-center justify-center w-full h-full text-sm font-semibold">
          {userInitials}
        </div>
      }
      label="Perfil"
      onClick={onClick}
      isActive={isActive}
    />
  );
};

export { PerfilIcon };
