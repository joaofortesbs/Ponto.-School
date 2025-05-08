
import React from "react";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`}>
      <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] rounded-lg flex items-center justify-center shadow-lg">
          <Users className="h-5 w-5 text-white" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
            Grupos de Estudo
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Conecte-se e aprenda com seus colegas
          </p>
        </div>
      </div>
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
