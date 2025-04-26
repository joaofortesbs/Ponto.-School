
import React from "react";

interface HeaderIconProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

const HeaderIcon: React.FC<HeaderIconProps> = ({ 
  icon, 
  label, 
  active = false,
  onClick 
}) => {
  return (
    <button
      className={`flex flex-col items-center justify-center p-2 rounded-md transition-all ${
        active 
          ? "bg-gradient-to-r from-blue-900/50 to-indigo-900/50 text-white" 
          : "hover:bg-white/5 text-gray-300 hover:text-white"
      }`}
      onClick={onClick}
    >
      <div 
        className={`w-10 h-10 rounded-full flex items-center justify-center ${
          active 
            ? "bg-gradient-to-r from-blue-700 to-indigo-700" 
            : "bg-gray-800"
        }`}
      >
        {icon}
      </div>
      <span className="mt-1 text-xs font-medium">{label}</span>
    </button>
  );
};

export default HeaderIcon;
