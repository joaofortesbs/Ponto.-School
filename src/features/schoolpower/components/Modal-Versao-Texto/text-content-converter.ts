import type { EditorJSBlock, EditorJSData } from '../../interface-chat-producao/components/artifact-editorjs-converter';
import { formatInlineMarkdown } from '../../interface-chat-producao/components/artifact-editorjs-converter';

function generateBlockId(): string {
  return 'tv-' + Math.random().toString(36).substring(2, 12);
}

const CALLOUT_EMOJI_MAP: Record<string, { type: string; icon: string }> = {
  '💡': { type: 'tip', icon: '💡' },
  '⚠️': { type: 'warning', icon: '⚠️' },
  '📌': { type: 'important', icon: '📌' },
  '❗': { type: 'danger', icon: '❗' },
  '✅': { type: 'success', icon: '✅' },
  '🔔': { type: 'info', icon: '🔔' },
  '📎': { type: 'info', icon: '📎' },
  '🎯': { type: 'important', icon: '🎯' },
  '📝': { type: 'tip', icon: '📝' },
  '🚀': { type: 'success', icon: '🚀' },
  '⭐': { type: 'important', icon: '⭐' },
  '🔑': { type: 'important', icon: '🔑' },
  '📊': { type: 'info', icon: '📊' },
  '⚡': { type: 'warning', icon: '⚡' },
  '🧠': { type: 'tip', icon: '🧠' },
  '📚': { type: 'info', icon: '📚' },
};

const CALLOUT_EMOJI_PATTERN = new RegExp(
  `^(${Object.keys(CALLOUT_EMOJI_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*`
);

function isTableSeparatorRow(line: string): boolean {
  return /^\|[\s:]*-{2,}[\s:]*(\|[\s:]*-{2,}[\s:]*)+\|?\s*$/.test(line.trim());
}

function isTableRow(line: string): boolean {
  const trimmed = line.trim();
  return trimmed.startsWith('|') && trimmed.includes('|', 1);
}

function parseTableRow(line: string): string[] {
  const trimmed = line.trim();
  const withoutOuter = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
  const cleaned = withoutOuter.endsWith('|') ? withoutOuter.slice(0, -1) : withoutOuter;
  return cleaned.split('|').map(cell => cell.trim());
}

function isChecklistItem(line: string): boolean {
  return /^[-*]\s*\[([ xX])\]\s/.test(line.trim());
}

function isCodeFenceStart(line: string): boolean {
  return /^```/.test(line.trim());
}

function isHorizontalRule(line: string): boolean {
  return /^(-{3,}|\*{3,}|_{3,})$/.test(line.trim());
}

function parseContentLine(line: string): EditorJSBlock | null {
  const trimmed = line.trim();
  if (!trimmed) return null;

  if (trimmed.startsWith('###### ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(7)), level: 6 } };
  }
  if (trimmed.startsWith('##### ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(6)), level: 5 } };
  }
  if (trimmed.startsWith('#### ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(5)), level: 4 } };
  }
  if (trimmed.startsWith('### ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(4)), level: 3 } };
  }
  if (trimmed.startsWith('## ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(3)), level: 2 } };
  }
  if (trimmed.startsWith('# ')) {
    return { id: generateBlockId(), type: 'header', data: { text: formatInlineMarkdown(trimmed.slice(2)), level: 1 } };
  }

  if (trimmed.startsWith('**') && trimmed.endsWith('**') && trimmed.length > 4 && !trimmed.slice(2, -2).includes('**')) {
    const text = trimmed.slice(2, -2);
    return { id: generateBlockId(), type: 'header', data: { text, level: 3 } };
  }

  return null;
}

function preprocessCallouts(text: string): string {
  const calloutEmojis = Object.keys(CALLOUT_EMOJI_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|');
  const inlineCalloutPattern = new RegExp(`([.!?;:)"'])\\s*>\\s*(${calloutEmojis})\\s`, 'g');
  return text.replace(inlineCalloutPattern, '$1\n\n> $2 ');
}

export function convertTextContentToBlocks(textContent: string): EditorJSData {
  const blocks: EditorJSBlock[] = [];
  const preprocessed = preprocessCallouts(textContent);
  const lines = preprocessed.split('\n');
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      i++;
      continue;
    }

    if (isCodeFenceStart(trimmed)) {
      const langMatch = trimmed.match(/^```(\w*)/);
      const language = langMatch ? langMatch[1] || 'text' : 'text';
      const codeLines: string[] = [];
      i++;
      while (i < lines.length) {
        if (lines[i].trim() === '```') { i++; break; }
        codeLines.push(lines[i]);
        i++;
      }
      blocks.push({
        id: generateBlockId(),
        type: 'code',
        data: { code: codeLines.join('\n'), language }
      });
      continue;
    }

    if (isTableRow(trimmed)) {
      const rows: string[][] = [];
      let hasHeader = false;
      while (i < lines.length) {
        const tl = lines[i].trim();
        if (!tl) { if (rows.length > 0) break; i++; continue; }
        if (isTableSeparatorRow(tl)) { hasHeader = rows.length > 0; i++; continue; }
        if (isTableRow(tl)) { rows.push(parseTableRow(tl).map(c => formatInlineMarkdown(c))); i++; }
        else break;
      }
      if (rows.length >= 2) {
        blocks.push({ id: generateBlockId(), type: 'table', data: { content: rows, withHeadings: hasHeader } });
      }
      continue;
    }

    if (isChecklistItem(trimmed)) {
      const items: { text: string; checked: boolean }[] = [];
      while (i < lines.length) {
        const match = lines[i].trim().match(/^[-*]\s*\[([ xX])\]\s*(.*)/);
        if (match) { items.push({ text: formatInlineMarkdown(match[2]), checked: match[1].toLowerCase() === 'x' }); i++; }
        else break;
      }
      blocks.push({ id: generateBlockId(), type: 'checklist', data: { items } });
      continue;
    }

    if (isHorizontalRule(trimmed)) {
      blocks.push({ id: generateBlockId(), type: 'delimiter', data: {} });
      i++;
      continue;
    }

    if (trimmed.startsWith('> ')) {
      const contentAfterArrow = trimmed.replace(/^>\s*/, '');
      const calloutInfo = CALLOUT_EMOJI_PATTERN.test(contentAfterArrow) ? (() => {
        const match = contentAfterArrow.match(CALLOUT_EMOJI_PATTERN);
        return match ? CALLOUT_EMOJI_MAP[match[1]] : null;
      })() : null;

      const contentParts: string[] = [];
      const firstContent = contentAfterArrow.replace(CALLOUT_EMOJI_PATTERN, '');
      contentParts.push(formatInlineMarkdown(firstContent));
      i++;
      while (i < lines.length && lines[i].trim().startsWith('> ')) {
        contentParts.push(formatInlineMarkdown(lines[i].trim().replace(/^>\s*/, '')));
        i++;
      }

      if (calloutInfo) {
        blocks.push({ id: generateBlockId(), type: 'callout', data: { text: contentParts.join('<br>'), type: calloutInfo.type, icon: calloutInfo.icon } });
      } else {
        blocks.push({ id: generateBlockId(), type: 'quote', data: { text: contentParts.join('<br>'), caption: '' } });
      }
      continue;
    }

    if (CALLOUT_EMOJI_PATTERN.test(trimmed)) {
      const match = trimmed.match(CALLOUT_EMOJI_PATTERN);
      const info = match ? CALLOUT_EMOJI_MAP[match[1]] : { type: 'info', icon: '💡' };
      blocks.push({ id: generateBlockId(), type: 'callout', data: { text: formatInlineMarkdown(trimmed.replace(CALLOUT_EMOJI_PATTERN, '')), type: info?.type || 'info', icon: info?.icon || '💡' } });
      i++;
      continue;
    }

    if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if ((t.startsWith('- ') || t.startsWith('• ') || t.startsWith('* ')) && !isChecklistItem(t)) {
          items.push(formatInlineMarkdown(t.replace(/^[-•*]\s*/, '')));
          i++;
        } else break;
      }
      blocks.push({ id: generateBlockId(), type: 'list', data: { style: 'unordered', items } });
      continue;
    }

    if (/^\d+[.)]\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length) {
        const t = lines[i].trim();
        if (/^\d+[.)]\s/.test(t)) { items.push(formatInlineMarkdown(t.replace(/^\d+[.)]\s*/, ''))); i++; }
        else break;
      }
      blocks.push({ id: generateBlockId(), type: 'list', data: { style: 'ordered', items } });
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
      if (isTableRow(nextLine)) break;
      if (isCodeFenceStart(nextLine)) break;
      if (isHorizontalRule(nextLine)) break;
      if (isChecklistItem(nextLine)) break;
      if (nextLine.startsWith('#')) break;
      if (nextLine.startsWith('> ')) break;
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
