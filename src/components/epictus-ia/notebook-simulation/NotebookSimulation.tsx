
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Limpa o conteúdo para remover referências à plataforma, links, saudações e frases comuns
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;

    // Remove links usando regex (corresponde a links markdown e URLs)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');

    // Remove todos os tipos de saudações, cumprimentos e frases casuais
    const phrasesToRemove = [
      // Saudações e cumprimentos - padrão expandido
      /(?:olá|oi|hey|hello|hi|bom dia|boa tarde|boa noite|e aí|tudo bem|tudo certo|tudo sussa|como vai|tranquilo|beleza|e então)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,
      /(?:atenciosamente|abraços|saudações|cumprimentos|até mais|até logo|até breve|fique bem|até a próxima)/gi,

      // Padrões de emoji - expandido para capturar mais emojis
      /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u27FF]|😉|😊|🙂|😄|😃|👋|✌️|👏|👍/g,

      // Frases de compreensão
      /(?:compreend(?:i|endo)|entend(?:i|endo)|analise(?:i|ando)|segue|conforme|de acordo|baseado|com base|segundo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Menções de integração com plataforma
      /(?:se liga|mesmo não podendo|você pode|poderia|na plataforma|no sistema|no ambiente|no site|na interface)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Recursos adicionais
      /(?:recursos adicionais|para mais|para saber mais|para aprofundar|veja também|consulte|recomendo)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Frases de engajamento e resumo
      /(?:espero|desejo|tomara|que|isso|ajude|ajudei|auxilie|contribua|dúvidas|perguntar|contato|feedback|curtiu)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Padrões de frases de abertura
      /(?:^|\n)(?:recebi seu pedido|preparei um resumo|dá uma olhada|aqui está|segue abaixo|conforme solicitado|bora nessa|tipo|umas anotações de caderno|né|sem problemas)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Padrões de despedida
      /(?:^|\n)(?:e aí, curtiu|se precisar|só chamar|até mais|até a próxima|até logo|até breve|tchau|adeus)(?:\s+[^,\.!?]*?)(?:[,\.!?])/gi,

      // Expressões casuais
      /(?:super|hiper|mega|ultra|clean|maneiro|legal|bacana|show|top|incrível)/gi
    ];

    phrasesToRemove.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remove referências à plataforma
    cleaned = cleaned.replace(/ponto\.school|ponto school|plataforma|site|ambiente|interface|sistema/gi, '');

    // Limpeza adicional para padrões específicos de saudação
    cleaned = cleaned.replace(/e aí! tudo sussa\?/gi, '');
    cleaned = cleaned.replace(/tipo umas anotações de caderno, né\? sem problemas, bora nessa!/gi, '');
    cleaned = cleaned.replace(/## e aí, curtiu\?/gi, '');
    cleaned = cleaned.replace(/se precisar de mais alguma coisa, é só chamar!/gi, '');

    // Remove espaços em branco extras criados pelas remoções
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');

    // Remove espaços em branco no início/final de cada linha
    cleaned = cleaned.split('\n').map(line => line.trim()).join('\n');

    // Verifica se o conteúdo começa com um título (geralmente em maiúsculas)
    const lines = cleaned.split('\n').filter(line => line.trim() !== '');
    if (lines.length > 0 && !/^[A-Z\s]+/.test(lines[0])) {
      // Remove qualquer texto antes da primeira linha semelhante a um título
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
