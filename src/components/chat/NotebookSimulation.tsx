
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

export const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Versão simplificada da limpeza de conteúdo que preserva mais do texto original
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;

    // Remove links usando regex (apenas links markdown e URLs completas)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');

    // Remove saudações mais específicas para evitar perda de conteúdo
    const phrasesToRemove = [
      /^(?:olá|oi|hey|hello|hi|bom dia|boa tarde|boa noite)[,.!]?\s*/gi,
      /(?:atenciosamente|abraços|saudações|cumprimentos|até mais|até logo|até breve|fique bem|até a próxima)$/gi,
    ];

    phrasesToRemove.forEach(pattern => {
      cleaned = cleaned.replace(pattern, '');
    });

    // Remover linhas vazias extras mas preservar estrutura do texto
    cleaned = cleaned.replace(/\n\s*\n\s*\n/g, '\n\n');
    
    // Remover espaços em branco extras no início e fim
    cleaned = cleaned.trim();

    return cleaned;
  };

  // Processa o conteúdo mantendo a maioria do texto original
  const processNotebookContent = (rawContent: string) => {
    // Aplicar limpeza básica sem remover conteúdo importante
    let processed = cleanContent(rawContent);
    
    // Padronizar formatação de bullet points
    processed = processed.replace(/^[•\-\*]\s+/gm, '• ');
    processed = processed.replace(/^(\d+\.\s+)/gm, '• ');
    
    // Adicionar nota de fechamento apenas se não existir um fechamento similar
    if (!processed.includes('Anotação pronta') && !processed.includes('👉')) {
      processed += '\n\n👉 Anotação pronta! Agora é só revisar no modo caderno digital :)';
    }
    
    return processed;
  };

  // Aplicar formatação HTML
  const formatHtml = (text: string) => {
    return text
      // Bullets com estilo de lápis
      .replace(/^•\s+/gm, '<span class="notebook-bullet">✎</span> ')
      // Negrito
      .replace(/(\*\*|__)([^*_]+?)(\*\*|__)/g, '<span class="notebook-highlight">$2</span>')
      // Títulos (linhas que começam com maiúsculas ou têm : no final)
      .replace(/(^|\n)([A-Z][^:\n]+:?)($|\n)/g, '$1<span class="notebook-title">$2</span>$3')
      // Nota de fechamento
      .replace(/👉([^<]*)/g, '<span class="notebook-closing">👉$1</span>')
      // Palavras-chave
      .replace(/\b(IMPORTANTE|IMPORTANTE:)\b/gi, '<span class="notebook-important">IMPORTANTE</span>')
      .replace(/\b(DICA|DICA:)\b/gi, '<span class="notebook-tip">DICA</span>')
      .replace(/\b(OBSERVAÇÃO|OBSERVAÇÃO:|NOTA|NOTA:)\b/gi, '<span class="notebook-note">OBSERVAÇÃO</span>')
      .replace(/\b(LEMBRE-SE|LEMBRE-SE:)\b/gi, '<span class="notebook-remember">LEMBRE-SE</span>')
      // Fórmulas matemáticas
      .replace(/(\w+\s*=\s*[\w\s\+\-\*\/\(\)\^√∆]{1,40})/g, '<span class="notebook-formula">$1</span>');
  };

  return (
    <div className="notebook-simulation">
      <div className="notebook-lines">
        <div
          className="notebook-content"
          dangerouslySetInnerHTML={{ 
            __html: formatHtml(processNotebookContent(content))
          }}
        />
      </div>
    </div>
  );
};

export default NotebookSimulation;
