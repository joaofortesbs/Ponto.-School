import React from "react";

interface GradeGruposEstudoProps {
  selectedTopic?: string;
  topicosEstudo?: any[];
  searchQuery?: string;
  className?: string;
}

const GradeGruposEstudo: React.FC<GradeGruposEstudoProps> = ({ className }) => {
  return (
    <div className={`w-full ${className || ""}`}>
      {/* Grade de Grupos de Estudos - Preparada para receber novos componentes */}
      <div className="flex items-center justify-center min-h-[200px] text-gray-400 dark:text-gray-600">
        {/* Espaço reservado para futuros componentes */}
      </div>
    </div>
  );
};

export default GradeGruposEstudo;