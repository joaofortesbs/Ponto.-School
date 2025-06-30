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
      {/* Grade completamente vazia */}
    </div>
  );
};

export default GradeGruposEstudo;