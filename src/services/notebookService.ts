/**
 * This service handles the transformation of regular content into notebook-style format
 */

export function convertToNotebookFormat(content: string): string {
  // Verifica se o conteúdo já está no formato de caderno
  if (content.includes('notebook-title') || content.includes('notebook-bullet')) {
    return content;
  }

  // Extrai um título do conteúdo (primeira linha ou até 50 caracteres)
  let title = '';

  // Tenta extrair a primeira linha como título
  const firstLineMatch = content.match(/^(.+)(\n|$)/);
  if (firstLineMatch && firstLineMatch[1]) {
    title = firstLineMatch[1].trim();

    // Limita o tamanho do título
    if (title.length > 50) {
      title = title.substring(0, 50) + '...';
    }

    // Remove o título do conteúdo para evitar repetição
    content = content.replace(firstLineMatch[0], '').trim();
  } else {
    // Se não conseguir extrair a primeira linha, usa um título genérico
    title = 'Anotações de Estudo';
  }

  // Formata o título
  const formattedTitle = `<div class="notebook-title">${title}</div>`;

  // Processa o conteúdo para o formato de caderno
  let formattedContent = content
    // Transforma listas com marcadores em formato de caderno
    .replace(/^\s*[-•*]\s+(.+)$/gm, '<p><span class="notebook-bullet">•</span>$1</p>')
    // Destaca termos em negrito
    .replace(/\*\*([^*]+)\*\*/g, '<span class="notebook-highlight">$1</span>')
    // Formata fórmulas (texto entre ` `)
    .replace(/`([^`]+)`/g, '<span class="notebook-formula">$1</span>')
    // Formata palavras importantes (em maiúsculas)
    .replace(/\b([A-Z]{2,})\b/g, '<span class="notebook-important">$1</span>')
    // Quebra de parágrafos
    .replace(/\n\n/g, '</p><p>')
    // Quebra de linha
    .replace(/\n/g, '<br />');

  // Adiciona os parágrafos iniciais e finais se necessário
  if (!formattedContent.startsWith('<p>')) {
    formattedContent = '<p>' + formattedContent;
  }
  if (!formattedContent.endsWith('</p>')) {
    formattedContent += '</p>';
  }

  // Adiciona um fechamento
  const closing = '<div class="notebook-closing">Fim das anotações</div>';

  // Combina tudo
  return formattedTitle + formattedContent + closing;
}

export function extractTextFromNotebook(notebookHtml: string): string {
  if (!notebookHtml) return '';

  // Cria um elemento temporário
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = notebookHtml;

  // Retorna o texto puro
  return tempDiv.textContent || tempDiv.innerText || '';
}