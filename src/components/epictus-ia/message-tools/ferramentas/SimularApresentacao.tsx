
import React from 'react';

interface SimularApresentacaoProps {
  onClick: () => void;
}

const SimularApresentacao: React.FC<SimularApresentacaoProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-[#2A3645]/70 border border-[#3A4B5C]/30 hover:border-[#FF6B00]/30 group w-full"
    >
      <div className="bg-[#1E293B]/70 rounded-full p-2 group-hover:bg-[#0D23A0]/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500 dark:text-purple-400">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-white group-hover:text-[#FF6B00]">
          Simular Apresentação
        </h3>
        <p className="text-xs text-white/60 mt-1">
          Transforme este conteúdo em slides para apresentação
        </p>
      </div>
    </button>
  );
};

export default SimularApresentacao;
