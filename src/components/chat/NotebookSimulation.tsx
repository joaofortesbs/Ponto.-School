
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Clean up the content to remove platform references, links and greetings
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;
    
    // Remove links using regex (matches markdown links and URLs)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');
    
    // Remove greetings and salutations
    const greetings = [
      /(?:olá|oi|hey|hello|hi|bom dia|boa tarde|boa noite)(?:\s+[^,\.!]*?)(?:[,\.!])/gi,
      /(?:atenciosamente|abraços|saudações|cumprimentos|até mais|até logo|até breve)/gi
    ];
    
    greetings.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove references to the platform
    cleaned = cleaned.replace(/ponto\.school|ponto school|plataforma/gi, '');
    
    // Trim any extra whitespace created by the removals
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

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
          __html: cleanContent(content)
            .replace(/•/g, '<span class="text-[#FF6B00] text-lg">✎</span>')
            .replace(/(\*\*|__)([^*_]+)(\*\*|__)/g, '<span class="underline decoration-wavy decoration-[#FF6B00]/70 font-bold">$2</span>')
            .replace(/(^|\n)([A-Z][^:\n]+:)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold">$2</span>')
        }}
      />
    </div>
  );
};

export default NotebookSimulation;
