
import React from "react";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`}>
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
