
import React from "react";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] bg-clip-text text-transparent font-montserrat">
        Grupos de Estudo
      </h1>
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
