
import React from 'react';

interface SimuladorQuestoesProps {
  onClick: () => void;
}

const SimuladorQuestoes: React.FC<SimuladorQuestoesProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-[#2A3645]/70 border border-[#3A4B5C]/30 hover:border-[#FF6B00]/30 group w-full"
    >
      <div className="bg-[#1E293B]/70 rounded-full p-2 group-hover:bg-[#0D23A0]/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-500 dark:text-orange-400">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-white group-hover:text-[#FF6B00]">
          Simulador de questões
        </h3>
        <p className="text-xs text-white/60 mt-1">
          Teste seu conhecimento com questões personalizadas
        </p>
      </div>
    </button>
  );
};

export default SimuladorQuestoes;
