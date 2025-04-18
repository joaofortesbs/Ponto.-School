
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Clean up the content to remove platform references, links, greetings and common phrases
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;
    
    // Remove links using regex (matches markdown links and URLs)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');
    
    // Remove all types of greetings, salutations and casual phrases
    const phrasesToRemove = [
      // Greetings and salutations
      /(?:olá|oi|hey|hello|hi|bom dia|boa tarde|boa noite|e aí|tudo bem|tudo certo|tudo sussa|como vai)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      /(?:atenciosamente|abraços|saudações|cumprimentos|até mais|até logo|até breve)/gi,
      
      // Emoji patterns
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]/g,
      
      // Understanding phrases
      /(?:compreend(?:i|endo)|entend(?:i|endo)|analise(?:i|ando)|segue|conforme|de acordo|baseado|com base|segundo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      
      // Platform integration mentions
      /(?:se liga|mesmo não podendo|você pode|poderia|na plataforma|no sistema|no ambiente|no site|na interface)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      
      // Additional resources
      /(?:recursos adicionais|para mais|para saber mais|para aprofundar|veja também|consulte|recomendo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      
      // Engagement and summary phrases
      /(?:espero|desejo|tomara|que|isso|ajude|ajudei|auxilie|contribua|dúvidas|perguntar|contato|feedback)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      
      // Opening sentences patterns
      /(?:^|\n)(?:recebi seu pedido|preparei um resumo|dá uma olhada|aqui está|segue abaixo|conforme solicitado)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      
      // Casual expressions
      /(?:super|hiper|mega|ultra|clean|maneiro|legal|bacana|show|top|incrível)/gi
    ];
    
    phrasesToRemove.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });
    
    // Remove references to the platform
    cleaned = cleaned.replace(/ponto\.school|ponto school|plataforma|site|ambiente|interface|sistema/gi, '');
    
    // Trim any extra whitespace created by the removals
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remove leading/trailing whitespace from each line
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');
    
    // Ensure content starts with a title (usually in uppercase)
    const lines = cleaned.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0 && !/^[A-Z\s]+/.test(lines[0])) {
      // Remove any text before the first title-like line
      const titleLineIndex = lines.findIndex(line => /^[A-Z\s]+/.test(line));
      if (titleLineIndex > 0) {
        cleaned = lines.slice(titleLineIndex).join('\n');
      }
    }
    
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
