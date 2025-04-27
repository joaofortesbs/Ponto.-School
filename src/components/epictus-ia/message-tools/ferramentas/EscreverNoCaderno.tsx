
import React from 'react';

interface EscreverNoCadernoProps {
  onClick: () => void;
  content?: string;
  messageId?: number;
}

const EscreverNoCaderno: React.FC<EscreverNoCadernoProps> = ({ onClick, content, messageId }) => {
  const handleClick = () => {
    onClick();
    
    // Caso o componente seja usado fora do MessageToolsDropdown
    if (content && messageId) {
      const event = new CustomEvent('transform-to-notebook', {
        detail: { content, messageId }
      });
      document.dispatchEvent(event);
    }
  };
  
  return (
    <button
      onClick={handleClick}
      className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-[#2A3645]/70 border border-[#3A4B5C]/30 hover:border-[#FF6B00]/30 group w-full"
    >
      <div className="bg-[#1E293B]/70 rounded-full p-2 group-hover:bg-[#0D23A0]/20">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500 dark:text-green-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      </div>
      <div className="flex-1 text-left">
        <h3 className="font-medium text-white group-hover:text-[#FF6B00]">
          Escrever no Caderno
        </h3>
        <p className="text-xs text-white/60 mt-1">
          Salve este conteúdo em seu caderno de estudos
        </p>
      </div>
    </button>
  );
};

export default EscreverNoCaderno;
