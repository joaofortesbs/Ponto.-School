import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

export const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Clean up the content to remove platform references, links, greetings and common phrases
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;

    // Remove links using regex (matches markdown links and URLs)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');

    // Remove all types of greetings, salutations and casual phrases
    const phrasesToRemove = [
      // Greetings and salutations - expanded pattern
      /(?:olá|oi|hey|hello|hi|bom dia|boa tarde|boa noite|e aí|tudo bem|tudo certo|tudo sussa|como vai|tranquilo|beleza|e então)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      /(?:atenciosamente|abraços|saudações|cumprimentos|até mais|até logo|até breve|fique bem|até a próxima)/gi,

      // Emoji patterns - expanded to catch more emojis
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|😉|😊|🙂|😄|😃|👋|✌️|👏|👍/g,

      // Understanding phrases
      /(?:compreend(?:i|endo)|entend(?:i|endo)|analise(?:i|ando)|segue|conforme|de acordo|baseado|com base|segundo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Platform integration mentions
      /(?:se liga|mesmo não podendo|você pode|poderia|na plataforma|no sistema|no ambiente|no site|na interface)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Additional resources
      /(?:recursos adicionais|para mais|para saber mais|para aprofundar|veja também|consulte|recomendo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Engagement and summary phrases
      /(?:espero|desejo|tomara|que|isso|ajude|ajudei|auxilie|contribua|dúvidas|perguntar|contato|feedback|curtiu)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Opening sentences patterns
      /(?:^|\n)(?:recebi seu pedido|preparei um resumo|dá uma olhada|aqui está|segue abaixo|conforme solicitado|bora nessa|tipo|umas anotações de caderno|né|sem problemas)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Farewell patterns
      /(?:^|\n)(?:e aí, curtiu|se precisar|só chamar|até mais|até a próxima|até logo|até breve|tchau|adeus)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Casual expressions
      /(?:super|hiper|mega|ultra|clean|maneiro|legal|bacana|show|top|incrível)/gi
    ];

    phrasesToRemove.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove references to the platform
    cleaned = cleaned.replace(/ponto\.school|ponto school|plataforma|site|ambiente|interface|sistema/gi, '');

    // Additional cleaning for specific greeting patterns
    cleaned = cleaned.replace(/e aí! tudo sussa\?/gi, '');
    cleaned = cleaned.replace(/tipo umas anotações de caderno, né\? sem problemas, bora nessa!/gi, '');
    cleaned = cleaned.replace(/## e aí, curtiu\?/gi, '');
    cleaned = cleaned.replace(/se precisar de mais alguma coisa, é só chamar!/gi, '');

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

  // Process the content to specifically handle bullet points and titles
  const processNotebookContent = (rawContent: string) => {
    let processed = cleanContent(rawContent);
    
    // Better bullet point handling (supports different formats)
    processed = processed.replace(/^[•\-\*]\s+/gm, '• ');
    processed = processed.replace(/^(\d+\.\s+)/gm, '• ');
    
    // Make sure there's a closing note for consistency
    if (!processed.includes('👉 Anotação pronta!')) {
      processed += '\n\n👉 Anotação pronta! Agora é só revisar no modo caderno digital :)';
    }
    
    // Process formulas with special styling
    processed = processed.replace(/(\w+\s*=\s*[\w\s\+\-\*\/\(\)\^√∆]{1,40})/g, '<span class="font-semibold text-blue-500 dark:text-blue-400">$1</span>');
    
    return processed;
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
          __html: processNotebookContent(content)
            .replace(/^•\s+/gm, '<span class="text-[#FF6B00] text-lg mr-1">✎</span> ')
            .replace(/(\*\*|__)([^*_]+)(\*\*|__)/g, '<span class="underline decoration-wavy decoration-[#FF6B00]/70 font-bold">$2</span>')
            .replace(/(^|\n)([A-Z][^:\n]+:?)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold text-xl">$2</span>')
            .replace(/👉([^<]*)/g, '<span class="text-[#FF6B00] font-semibold">👉$1</span>')
            .replace(/IMPORTANTE/gi, '<span class="uppercase font-bold text-red-500 dark:text-red-400">IMPORTANTE</span>')
            .replace(/DICA/gi, '<span class="uppercase font-bold text-green-500 dark:text-green-400">DICA</span>')
            .replace(/OBSERVAÇÃO/gi, '<span class="uppercase font-bold text-purple-500 dark:text-purple-400">OBSERVAÇÃO</span>')
            .replace(/LEMBRE-SE/gi, '<span class="uppercase font-bold text-amber-500 dark:text-amber-400">LEMBRE-SE</span>')
        }}
      />
    </div>
  );
};

export default NotebookSimulation;