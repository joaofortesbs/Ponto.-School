import React from 'react';

interface NotebookSimulationProps {
  content: string;
}

const NotebookSimulation: React.FC<NotebookSimulationProps> = ({ content }) => {
  // Processa o conteúdo para adicionar estilos de caderno
  const processNotebookContent = (text: string) => {
    // Detecta formulas e adiciona classe especial
    let processed = text
      // Formulas com $...$ 
      .replace(/\$([^$]+)\$/g, '<span class="notebook-formula">$1</span>')
      // Destaque com **texto**
      .replace(/\*\*([^*]+)\*\*/g, '<span class="notebook-highlight">$1</span>')
      // Texto importante com !importante texto
      .replace(/!importante ([^!]+)/gi, '<span class="notebook-important">$1</span>')
      // Dicas com !dica texto
      .replace(/!dica ([^!]+)/gi, '<span class="notebook-tip">$1</span>')
      // Notas com !nota texto
      .replace(/!nota ([^!]+)/gi, '<span class="notebook-note">$1</span>')
      // Lembretes com !lembre texto
      .replace(/!lembre ([^!]+)/gi, '<span class="notebook-remember">$1</span>');

    return processed;
  };

  // Divide o conteúdo para identificar título e itens
  const contentLines = content.split('\n').filter(line => line.trim() !== '');
  const title = contentLines.length > 0 ? contentLines[0] : 'Anotações de Estudo';
  const bodyContent = contentLines.slice(1).join('\n');

  return (
    <div className="notebook-simulation">
      <div className="notebook-lines">
        <div className="notebook-content">
          {/* Título formatado */}
          <h1 className="notebook-title">{title}</h1>

          {/* Conteúdo do caderno com formatação aprimorada */}
          <div 
            dangerouslySetInnerHTML={{ 
              __html: processNotebookContent(bodyContent)
                // Marcadores de lista
                .replace(/^•\s+/gm, '<span class="text-[#FF6B00] text-lg mr-2">✎</span> ')
                // Cabeçalhos secundários
                .replace(/(^|\n)([A-Z][^:\n]+:)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold text-lg">$2</span>')
                // Mensagem de fechamento
                .replace(/👉([^<]*)/g, '<div class="notebook-closing">👉$1</div>')
                // Tags especiais
                .replace(/IMPORTANTE/gi, '<span class="notebook-important">IMPORTANTE</span>')
                .replace(/DICA/gi, '<span class="notebook-tip">DICA</span>')
                .replace(/NOTA/gi, '<span class="notebook-note">NOTA</span>')
                .replace(/LEMBRE/gi, '<span class="notebook-remember">LEMBRE</span>')
                // Setas e marcações
                .replace(/->|→/g, '<span class="notebook-arrow">→</span>')
                .replace(/<-|←/g, '<span class="notebook-arrow">←</span>')
                // Tarefas
                .replace(/\[ \]/g, '<span class="notebook-checkbox"></span>')
                .replace(/\[x\]/g, '<span class="notebook-checkbox checked"></span>')
            }}
          />

          {/* Elementos decorativos */}
          <div className="notebook-decoration decoration-top-right">✍️</div>
          <div className="notebook-decoration decoration-bottom-left">📝</div>
        </div>
      </div>
    </div>
  );
};

export default NotebookSimulation;