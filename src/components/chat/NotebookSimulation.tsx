
import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Preserva mais do texto original com limpeza mínima
  const cleanContent = (originalContent: string) => {
    if (!originalContent) return '';
    
    let cleaned = originalContent;
    
    // Remove apenas links markdown e URLs completas (preserva o texto do link)
    cleaned = cleaned.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '$1');
    cleaned = cleaned.replace(/(https?:\/\/[^\s]+)/g, '');
    
    // Preserva quebras de linha e espaços importantes para a estrutura
    cleaned = cleaned.replace(/\n\s*\n\s*\n+/g, '\n\n');
    cleaned = cleaned.trim();
    
    return cleaned;
  };

  // Processa o conteúdo preservando formatações especiais e ajustando para as linhas do caderno
  const processNotebookContent = (rawContent: string) => {
    // Aplicar limpeza mínima
    let processed = cleanContent(rawContent);
    
    // Padronização de símbolos
    processed = processed.replace(/^[•\-\*]\s+/gm, '• ');
    processed = processed.replace(/^(\d+\.\s+)/gm, '$1 ');
    
    // Ajustar conteúdo para garantir que palavras não sejam quebradas entre linhas
    // e que todo texto comece no início da linha
    const lines = processed.split('\n');
    let formattedLines: string[] = [];
    
    lines.forEach(line => {
      // Pular linhas em branco ou que são apenas formatação
      if (line.trim() === '' || /^(#|\*\*|\*|_|>|\d+\.|•)$/.test(line.trim())) {
        formattedLines.push(line);
        return;
      }
      
      // Estimar comprimento médio ideal por linha (aproximadamente 55-60 caracteres)
      const targetLineLength = 58;
      const words = line.split(' ');
      let currentLine = '';
      
      words.forEach(word => {
        // Verificar se adicionar a próxima palavra excederia o comprimento alvo
        if ((currentLine + ' ' + word).length > targetLineLength && currentLine !== '') {
          formattedLines.push(currentLine.trim());
          currentLine = word;
        } else {
          currentLine = currentLine === '' ? word : currentLine + ' ' + word;
        }
      });
      
      // Adicionar última linha se tiver conteúdo
      if (currentLine.trim() !== '') {
        formattedLines.push(currentLine.trim());
      }
    });
    
    return formattedLines.join('\n');
  };

  // Aplicar formatação HTML mais rica e preservar estrutura original
  const formatHtml = (text: string) => {
    if (!text) return '';
    
    // Primeiro, garantimos que todas as linhas sejam preservadas
    const preservedText = text.replace(/\n/g, '|||NEWLINE|||');
    
    let formattedHtml = preservedText
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
      
      // Nota de fechamento personalizada
      .replace(/(✅.*Anotação concluída.*|👉.*)/g, '<div class="notebook-closing">$1</div>');
    
    // Restaurar quebras de linha respeitando a estrutura HTML
    return formattedHtml.replace(/\|\|\|NEWLINE\|\|\|/g, '<br>');
  };

  return (
    <div className="notebook-simulation">
      <div className="notebook-lines">
        <div
          className="notebook-content"
          dangerouslySetInnerHTML={{ 
            __html: formatHtml(processNotebookContent(content || ''))
          }}
        />
      </div>
    </div>
  );
};

export default NotebookSimulation;
