import React from "react";
import { Clock } from "lucide-react";

interface HistoricoIconProps {
  onClick: () => void;
  isActive?: boolean;
}

const HistoricoIcon: React.FC<HistoricoIconProps> = ({ onClick, isActive = false }) => {
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center ${
        isActive ? "text-blue-500" : "text-gray-400 hover:text-white"
      } transition-colors duration-200`}
      aria-label="Abrir histórico de conversas"
      title="Histórico de Conversas"
    >
      <div className={`p-2 rounded-full ${isActive ? "bg-blue-500/20" : "hover:bg-white/10"}`}>
        <Clock className="h-5 w-5" />
      </div>
      <span className="text-[10px] mt-1">Histórico</span>
      {isActive && (
        <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1 h-1 bg-blue-500 rounded-full" />
      )}
    </button>
  );
};

export default HistoricoIcon;