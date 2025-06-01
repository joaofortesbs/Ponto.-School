
import React from "react";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      {/* Mini-seção de Grupos de Estudos - Completamente vazia e preparada para novos componentes */}
    </div>
  );
};

export default GruposEstudoView;
