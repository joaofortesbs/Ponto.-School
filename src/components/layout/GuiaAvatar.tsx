
import React from "react";

interface GuiaAvatarProps {
  className?: string;
}

const GuiaAvatar: React.FC<GuiaAvatarProps> = ({ className = "" }) => {
  return (
    <div className={`w-12 h-12 rounded-full border-2 border-orange-500 ${className}`}>
      {/* Este é o componente circular vazio com borda laranja - Guia Avatar */}
    </div>
  );
};

export default GuiaAvatar;
