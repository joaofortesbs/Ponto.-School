
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Preserva mais do texto original com limpeza mínima
  const cleanContent = (originalContent: string) => {
    let cleaned = originalContent;
    
    // Remove apenas links markdown e URLs completas (preserva o texto do link)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');
    
    // Remove espaços extras e quebras de linha duplicadas, preservando a estrutura
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Processa o conteúdo preservando formatações especiais
  const processNotebookContent = (rawContent: string) => {
    // Aplicar limpeza mínima
    let processed = cleanContent(rawContent);
    
    // Padronização de símbolos
    processed = processed.replace(/^[•\-\*]\s+/gm, '• ');
    processed = processed.replace(/^(\d+\.\s+)/gm, '$1 ');
    
    return processed;
  };

  // Aplicar formatação HTML mais rica e preservar estrutura original
  const formatHtml = (text: string) => {
    return text
      // Títulos principais (linhas que começam com emoji e têm texto grande)
      .replace(/^(.*📖.*|.*📚.*|.*📝.*|.*📑.*|.*📔.*|.*📕.*|.*📗.*|.*📘.*|.*📙.*)$/gm, 
        '<div class="notebook-main-title">$1</div>')
      
      // Subtítulos com emojis (🧠, 🔍, ⚙️, etc.)
      .replace(/^(.*🧠.*|.*🔍.*|.*⚙️.*|.*💡.*|.*📌.*|.*🔑.*|.*⭐.*|.*📊.*)$/gm, 
        '<div class="notebook-subtitle">$1</div>')
      
      // Destaque para dicas, atenção, etc.
      .replace(/^(.*💬.*|.*✅.*|.*⚠️.*|.*📢.*|.*🎯.*|.*🎨.*|.*✏️.*|.*📝.*|.*🪄.*)$/gm, 
        '<div class="notebook-callout">$1</div>')
      
      // Listas com marcadores
      .replace(/^•\s+(.*)$/gm, '<div class="notebook-bullet"><span class="bullet-icon">✎</span> $1</div>')
      
      // Listas numeradas
      .replace(/^(\d+)\.\s+(.*)$/gm, '<div class="notebook-numbered"><span class="number-icon">$1.</span> $2</div>')
      
      // Negrito
      .replace(/\*\*([^*]+)\*\*/g, '<span class="notebook-bold">$1</span>')
      .replace(/__([^_]+)__/g, '<span class="notebook-bold">$1</span>')
      
      // Fórmulas e expressões matemáticas com destaque
      .replace(/(\b[a-zA-Z²³¹]+\s*[=+\-*/^]+\s*[\w\s+\-*/^()²³¹]+)/g, 
        '<span class="notebook-formula">$1</span>')
      
      // Destaque para termos importantes
      .replace(/\b(IMPORTANTE|ATENÇÃO|DICA|OBSERVAÇÃO|NOTA|LEMBRE-SE)\b:/gi, 
        '<span class="notebook-important">$1:</span>')
      
      // Parágrafos normais para melhor legibilidade
      .replace(/^([^<].*[^>])$/gm, '<p class="notebook-paragraph">$1</p>')
      
      // Garantir que quebras de linha sejam respeitadas
      .replace(/\n/g, '')
      
      // Nota de fechamento personalizada
      .replace(/(✅.*Anotação concluída.*|👉.*)/g, '<div class="notebook-closing">$1</div>');
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
