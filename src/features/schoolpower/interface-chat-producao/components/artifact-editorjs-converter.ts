import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

export interface EditorJSBlock {
  id: string;
  type: string;
  data: Record<string, unknown>;
}

export interface EditorJSData {
  time: number;
  blocks: EditorJSBlock[];
  version: string;
}

function generateBlockId(): string {
  return Math.random().toString(36).substring(2, 12);
}

function parseContentLine(line: string): EditorJSBlock | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('### ')) {
    return {
      id: generateBlockId(),
      type: 'header',
      data: { text: trimmed.replace('### ', ''), level: 3 }
    };
  }

  if (trimmed.startsWith('## ')) {
    return {
      id: generateBlockId(),
      type: 'header',
      data: { text: trimmed.replace('## ', ''), level: 2 }
    };
  }

  if (trimmed.startsWith('# ')) {
    return {
      id: generateBlockId(),
      type: 'header',
      data: { text: trimmed.replace('# ', ''), level: 1 }
    };
  }

  if (trimmed.startsWith('> ') || trimmed.startsWith('⚠️') || trimmed.startsWith('💡') || trimmed.startsWith('📌')) {
    const cleaned = trimmed
      .replace(/^>\s*/, '')
      .replace(/^[⚠️💡📌🔔✅❗📎🎯📝🚀⭐🔑📊]\s*/u, '');
    return {
      id: generateBlockId(),
      type: 'quote',
      data: {
        text: formatInlineMarkdown(cleaned),
        caption: ''
      }
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

function formatInlineMarkdown(text: string): string {
  let formatted = text;
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  formatted = formatted.replace(/\*(.+?)\*/g, '<i>$1</i>');
  formatted = formatted.replace(/`(.+?)`/g, '<mark class="cdx-marker">$1</mark>');
  return formatted;
}

export function convertArtifactToEditorJS(artifact: ArtifactData): EditorJSData {
  const blocks: EditorJSBlock[] = [];

  for (const section of artifact.secoes) {
    blocks.push({
      id: `section-${section.id}`,
      type: 'header',
      data: {
        text: section.titulo,
        level: 2
      }
    });

    const lines = section.conteudo.split('\n');
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

    blocks.push({
      id: generateBlockId(),
      type: 'delimiter',
      data: {}
    });
  }

  if (blocks.length > 0 && blocks[blocks.length - 1].type === 'delimiter') {
    blocks.pop();
  }

  return {
    time: Date.now(),
    blocks,
    version: '2.28.0'
  };
}

export interface TOCItem {
  id: string;
  text: string;
  level: number;
  sectionId: string;
}

export function extractTOCFromBlocks(blocks: EditorJSBlock[]): TOCItem[] {
  return blocks
    .filter(b => b.type === 'header' && (b.data.level === 1 || b.data.level === 2) && !!b.id)
    .map(b => ({
      id: b.id!,
      text: (b.data.text as string).replace(/<[^>]*>/g, ''),
      level: b.data.level as number,
      sectionId: b.id!
    }));
}
