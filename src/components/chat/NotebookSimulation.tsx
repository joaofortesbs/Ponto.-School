
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  return (
    <div className="notebook-simulation p-4">
      <div 
        className="w-full text-gray-800 dark:text-gray-200 whitespace-pre-line leading-loose px-3"
        style={{
          backgroundImage: 'linear-gradient(#aaa 1px, transparent 1px)',
          backgroundSize: '100% 28px',
          lineHeight: '28px',
          fontFamily: "'Architects Daughter', cursive, system-ui",
          letterSpacing: '0.5px',
          fontSize: '1.05rem',
          textShadow: '0px 0px 0.3px rgba(0,0,0,0.3)'
        }}
        dangerouslySetInnerHTML={{ 
          __html: content
            .replace(/•/g, '<span class="text-[#FF6B00] text-lg">✎</span>')
            .replace(/(\*\*|__)([^*_]+)(\*\*|__)/g, '<span class="underline decoration-wavy decoration-[#FF6B00]/70 font-bold">$2</span>')
            .replace(/(^|\n)([A-Z][^:\n]+:)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold">$2</span>')
        }}
      />
    </div>
  );
};

export default NotebookSimulation;
