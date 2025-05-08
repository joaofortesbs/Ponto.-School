
import React from "react";
import GruposEstudoInterface from "./interface/GruposEstudoInterface";

const GruposEstudoView: React.FC = () => {
  return (
    <div className="w-full h-full bg-gray-50 dark:bg-[#0A101E] p-4">
      <GruposEstudoInterface className="h-full" />
    </div>
  );
};

export default GruposEstudoView;
