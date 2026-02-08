import type { EditorJSBlock, EditorJSData } from '../../interface-chat-producao/components/artifact-editorjs-converter';

function generateBlockId(): string {
  return 'tv-' + Math.random().toString(36).substring(2, 12);
}

function formatInlineMarkdown(text: string): string {
  let formatted = text;
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<i>$1</i>');
  formatted = formatted.replace(/`(.+?)`/g, '<mark class="cdx-marker">$1</mark>');
  return formatted;
}

function parseContentLine(line: string): EditorJSBlock | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  const headerMatch = trimmed.match(/^(#{1,6})\s+(.+)$/);
  if (headerMatch) {
    const level = Math.min(headerMatch[1].length, 6);
    return {
      id: generateBlockId(),
      type: 'header',
      data: { text: formatInlineMarkdown(headerMatch[2]), level }
    };
  }

  if (trimmed.startsWith('> ') || trimmed.startsWith('⚠️') || trimmed.startsWith('💡') || trimmed.startsWith('📌')) {
    const cleaned = trimmed
      .replace(/^>\s*/, '')
      .replace(/^[⚠️💡📌🔔✅❗📎🎯📝🚀⭐🔑📊]\s*/u, '');
    return {
      id: generateBlockId(),
      type: 'quote',
      data: { text: formatInlineMarkdown(cleaned), caption: '' }
    };
  }

  if (trimmed === '---' || trimmed === '***' || trimmed === '___') {
    return {
      id: generateBlockId(),
      type: 'delimiter',
      data: {}
    };
  }

  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4) {
    const text = trimmed.replace(/^\*\*/, '').replace(/\*\*$/, '');
    return {
      id: generateBlockId(),
      type: 'header',
      data: { text, level: 3 }
    };
  }

  return null;
}

function parseListItems(lines: string[], startIdx: number, isOrdered: boolean): { block: EditorJSBlock; endIdx: number } {
  const items: string[] = [];
  let idx = startIdx;

  while (idx < lines.length) {
    const trimmed = lines[idx].trim();
    if (isOrdered && /^\d+[.)]\s/.test(trimmed)) {
      items.push(formatInlineMarkdown(trimmed.replace(/^\d+[.)]\s*/, '')));
      idx++;
    } else if (!isOrdered && (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* '))) {
      items.push(formatInlineMarkdown(trimmed.replace(/^[-•*]\s*/, '')));
      idx++;
    } else {
      break;
    }
  }

  return {
    block: {
      id: generateBlockId(),
      type: 'list',
      data: {
        style: isOrdered ? 'ordered' : 'unordered',
        items
      }
    },
    endIdx: idx
  };
}

export function convertTextContentToBlocks(textContent: string): EditorJSData {
  const blocks: EditorJSBlock[] = [];
  const lines = textContent.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const { block, endIdx } = parseListItems(lines, i, false);
      blocks.push(block);
      i = endIdx;
      continue;
    }

    if (/^\d+[.)]\s/.test(trimmed)) {
      const { block, endIdx } = parseListItems(lines, i, true);
      blocks.push(block);
      i = endIdx;
      continue;
    }

    const specialBlock = parseContentLine(trimmed);
    if (specialBlock) {
      blocks.push(specialBlock);
      i++;
      continue;
    }

    const paragraphParts: string[] = [formatInlineMarkdown(trimmed)];
    i++;
    while (i < lines.length) {
      const nextLine = lines[i].trim();
      if (!nextLine) break;
      if (nextLine.startsWith('- ') || nextLine.startsWith('• ') || nextLine.startsWith('* ')) break;
      if (/^\d+[.)]\s/.test(nextLine)) break;
      if (parseContentLine(nextLine)) break;
      paragraphParts.push(formatInlineMarkdown(nextLine));
      i++;
    }
    blocks.push({
      id: generateBlockId(),
      type: 'paragraph',
      data: { text: paragraphParts.join(' ') }
    });
  }

  return {
    time: Date.now(),
    blocks,
    version: '2.28.0'
  };
}

export function extractTitleFromTextContent(textContent: string, fallbackTitle: string): { title: string; subtitle: string } {
  const lines = textContent.split('\n').filter(l => l.trim());
  
  let title = fallbackTitle;
  let subtitle = '';
  
  for (const line of lines) {
    const trimmed = line.trim();
    const h1Match = trimmed.match(/^#\s+(.+)$/);
    if (h1Match) {
      title = h1Match[1];
      break;
    }
    if (trimmed.startsWith('Plano de Aula:') || trimmed.startsWith('Aula:')) {
      title = trimmed;
      break;
    }
  }

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('Duração:') || trimmed.startsWith('Disciplina:') || trimmed.startsWith('Componente')) {
      subtitle = trimmed;
      break;
    }
  }

  return { title, subtitle };
}
