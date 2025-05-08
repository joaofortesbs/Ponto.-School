import React from "react";

interface GruposEstudoInterfaceProps {
  className?: string;
}

const GruposEstudoInterface: React.FC<GruposEstudoInterfaceProps> = ({ className }) => {
  return (
    <div className={`bg-white dark:bg-[#121827] p-6 rounded-xl shadow-sm ${className}`}>
      <div className="flex justify-center items-center p-8 text-gray-500 dark:text-gray-400">
        Interface vazia
      </div>
    </div>
  );
};

export default GruposEstudoInterface;