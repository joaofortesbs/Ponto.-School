
import React from "react";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      {/* Mini-seção de Grupos de Estudos - Preparada para receber novos componentes */}
      <div className="flex flex-col items-center justify-center h-full min-h-[400px] text-center">
        <div className="text-gray-400 dark:text-gray-600">
          {/* Espaço reservado para futuros componentes de Grupos de Estudos */}
        </div>
      </div>
    </div>
  );
};

export default GruposEstudoView;
