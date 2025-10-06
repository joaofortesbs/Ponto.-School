
import React from 'react';
import { Circle, Plus } from 'lucide-react';

interface AprofundarNoTemaProps {
  onClick: () => void;
}

const AprofundarNoTema: React.FC<AprofundarNoTemaProps> = ({ onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-[#2A3645]/70 border border-[#3A4B5C]/30 hover:border-[#FF6B00]/30 group w-full"
    >
      <div className="bg-[#1E293B]/70 rounded-full p-2 group-hover:bg-[#0D23A0]/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 dark:text-blue-400">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-white group-hover:text-[#FF6B00]">
          Aprofundar no tema
        </h3>
        <p className="text-xs text-white/60 mt-1">
          Explorar o tema com explicações detalhadas e avançadas
        </p>
      </div>
    </button>
  );
};

export default AprofundarNoTema;
