
import React from "react";

interface HistoricoIconProps {
  onClick?: () => void;
}

const HistoricoIcon: React.FC<HistoricoIconProps> = ({ onClick }) => {
  return (
    <div
      onClick={onClick}
      className="cursor-pointer rounded-full bg-[#0039A9]/10 p-1.5 flex items-center justify-center hover:bg-[#0039A9]/20 transition duration-300 group"
      title="Histórico"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-5 w-5 text-[#8CBAFF] group-hover:text-white transition-colors duration-300"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M12 8v4l3 3" />
        <circle cx="12" cy="12" r="10" />
      </svg>
    </div>
  );
};

export default HistoricoIcon;
