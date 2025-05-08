
import React from "react";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

interface GruposEstudoViewProps {
  className?: string;
}

const GruposEstudoView: React.FC<GruposEstudoViewProps> = ({ className }) => {
  return (
    <div className={`w-full ${className}`}>
      <h1 className="text-3xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] inline-block relative">
        <span className="relative z-10">Conecte-se & Evolua</span>
        <span className="absolute -bottom-1 left-0 w-full h-0.5 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] opacity-70"></span>
      </h1>
      <GruposEstudoInterface />
    </div>
  );
};

export default GruposEstudoView;
