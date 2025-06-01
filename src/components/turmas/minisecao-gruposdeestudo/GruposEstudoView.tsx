
import React from "react";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full h-full ${className || ""}`}>
      {/* Mini-seção de Grupos de Estudos - Interface completamente vazia */}
    </div>
  );
};

export default GruposEstudoView;
