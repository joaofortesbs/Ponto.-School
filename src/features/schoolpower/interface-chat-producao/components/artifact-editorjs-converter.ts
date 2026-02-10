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
  '🏆': { type: 'success', icon: '🏆' },
  '💪': { type: 'success', icon: '💪' },
};

const CALLOUT_EMOJI_PATTERN = new RegExp(
  `^(${Object.keys(CALLOUT_EMOJI_MAP).map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\s*`
);

function isTableSeparatorRow(line: string): boolean {
  const trimmed = line.trim();
  return /^\|[\s:]*-{2,}[\s:]*(\|[\s:]*-{2,}[\s:]*)+\|?\s*$/.test(trimmed);
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

function parseTableBlock(lines: string[], startIdx: number): { block: EditorJSBlock; endIdx: number } | null {
  const rows: string[][] = [];
  let idx = startIdx;
  let hasHeader = false;

  while (idx < lines.length) {
    const line = lines[idx].trim();
    if (!line) {
      if (rows.length > 0) break;
      idx++;
      continue;
    }

    if (isTableSeparatorRow(line)) {
      hasHeader = rows.length > 0;
      idx++;
      continue;
    }

    if (isTableRow(line)) {
      rows.push(parseTableRow(line).map(cell => formatInlineMarkdown(cell)));
      idx++;
    } else {
      break;
    }
  }

  if (rows.length < 2) return null;

  return {
    block: {
      id: generateBlockId(),
      type: 'table',
      data: {
        content: rows,
        withHeadings: hasHeader
      }
    },
    endIdx: idx
  };
}

function isChecklistItem(line: string): boolean {
  const trimmed = line.trim();
  return /^[-*]\s*\[([ xX])\]\s/.test(trimmed);
}

function parseChecklistItems(lines: string[], startIdx: number): { block: EditorJSBlock; endIdx: number } {
  const items: { text: string; checked: boolean }[] = [];
  let idx = startIdx;

  while (idx < lines.length) {
    const trimmed = lines[idx].trim();
    const match = trimmed.match(/^[-*]\s*\[([ xX])\]\s*(.*)/);
    if (match) {
      items.push({
        text: formatInlineMarkdown(match[2]),
        checked: match[1].toLowerCase() === 'x'
      });
      idx++;
    } else {
      break;
    }
  }

  return {
    block: {
      id: generateBlockId(),
      type: 'checklist',
      data: { items }
    },
    endIdx: idx
  };
}

function isCodeFenceStart(line: string): boolean {
  return /^```/.test(line.trim());
}

function parseCodeBlock(lines: string[], startIdx: number): { block: EditorJSBlock; endIdx: number } {
  const firstLine = lines[startIdx].trim();
  const langMatch = firstLine.match(/^```(\w*)/);
  const language = langMatch ? langMatch[1] || 'text' : 'text';
  const codeLines: string[] = [];
  let idx = startIdx + 1;

  while (idx < lines.length) {
    const line = lines[idx];
    if (line.trim() === '```') {
      idx++;
      break;
    }
    codeLines.push(line);
    idx++;
  }

  return {
    block: {
      id: generateBlockId(),
      type: 'code',
      data: {
        code: codeLines.join('\n'),
        language
      }
    },
    endIdx: idx
  };
}

function isHorizontalRule(line: string): boolean {
  const trimmed = line.trim();
  return /^(-{3,}|\*{3,}|_{3,})$/.test(trimmed);
}

function detectCalloutEmoji(text: string): { type: string; icon: string } | null {
  const match = text.match(CALLOUT_EMOJI_PATTERN);
  if (match) {
    const emoji = match[1];
    return CALLOUT_EMOJI_MAP[emoji] || null;
  }
  return null;
}

function parseCalloutBlock(lines: string[], startIdx: number): { block: EditorJSBlock; endIdx: number } | null {
  const firstLine = lines[startIdx].trim();
  let content = firstLine.replace(/^>\s*/, '');

  const calloutInfo = detectCalloutEmoji(content);
  if (!calloutInfo) return null;

  content = content.replace(CALLOUT_EMOJI_PATTERN, '');
  const contentParts = [formatInlineMarkdown(content)];
  let idx = startIdx + 1;

  while (idx < lines.length) {
    const nextLine = lines[idx].trim();
    if (nextLine.startsWith('> ')) {
      contentParts.push(formatInlineMarkdown(nextLine.replace(/^>\s*/, '')));
      idx++;
    } else {
      break;
    }
  }

  return {
    block: {
      id: generateBlockId(),
      type: 'callout',
      data: {
        text: contentParts.join('<br>'),
        type: calloutInfo.type,
        icon: calloutInfo.icon
      }
    },
    endIdx: idx
  };
}

function parseQuoteBlock(lines: string[], startIdx: number): { block: EditorJSBlock; endIdx: number } {
  const firstLine = lines[startIdx].trim();
  const contentParts = [formatInlineMarkdown(firstLine.replace(/^>\s*/, ''))];
  let idx = startIdx + 1;

  while (idx < lines.length) {
    const nextLine = lines[idx].trim();
    if (nextLine.startsWith('> ')) {
      contentParts.push(formatInlineMarkdown(nextLine.replace(/^>\s*/, '')));
      idx++;
    } else {
      break;
    }
  }

  return {
    block: {
      id: generateBlockId(),
      type: 'quote',
      data: {
        text: contentParts.join('<br>'),
        caption: ''
      }
    },
    endIdx: idx
  };
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

function parseNestedListItems(
  lines: string[],
  startIdx: number,
  isOrdered: boolean,
  baseIndent: number = 0
): { items: Array<string | { text: string; children: unknown[] }>; endIdx: number } {
  const items: Array<string | { text: string; children: unknown[] }> = [];
  let idx = startIdx;

  while (idx < lines.length) {
    const rawLine = lines[idx];
    const trimmed = rawLine.trim();
    if (!trimmed) break;

    const lineIndent = rawLine.length - rawLine.trimStart().length;

    if (lineIndent > baseIndent + 1) {
      const subOrdered = /^\d+[.)]\s/.test(trimmed);
      const subUnordered = trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ');
      if (subOrdered || subUnordered) {
        const parentIdx = items.length - 1;
        if (parentIdx >= 0) {
          const { items: subItems, endIdx: subEnd } = parseNestedListItems(lines, idx, subOrdered, lineIndent);
          const parentItem = items[parentIdx];
          if (typeof parentItem === 'string') {
            items[parentIdx] = { text: parentItem, children: subItems };
          } else {
            parentItem.children.push(...subItems);
          }
          idx = subEnd;
          continue;
        }
      }
    }

    if (isOrdered && /^\d+[.)]\s/.test(trimmed)) {
      items.push(formatInlineMarkdown(trimmed.replace(/^\d+[.)]\s*/, '')));
      idx++;
    } else if (!isOrdered && (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* '))) {
      if (isChecklistItem(trimmed)) break;
      items.push(formatInlineMarkdown(trimmed.replace(/^[-•*]\s*/, '')));
      idx++;
    } else {
      break;
    }
  }

  return { items, endIdx: idx };
}

function parseListItems(lines: string[], startIdx: number, isOrdered: boolean): { block: EditorJSBlock; endIdx: number } {
  const { items, endIdx } = parseNestedListItems(lines, startIdx, isOrdered);

  const flatItems: string[] = [];
  function flattenItems(list: typeof items, depth: number = 0) {
    for (const item of list) {
      if (typeof item === 'string') {
        const indent = depth > 0 ? '&nbsp;&nbsp;'.repeat(depth) + (depth > 0 ? '↳ ' : '') : '';
        flatItems.push(indent + item);
      } else {
        const indent = depth > 0 ? '&nbsp;&nbsp;'.repeat(depth) + (depth > 0 ? '↳ ' : '') : '';
        flatItems.push(indent + item.text);
        if (item.children.length > 0) {
          flattenItems(item.children as typeof items, depth + 1);
        }
      }
    }
  }
  flattenItems(items);

  return {
    block: {
      id: generateBlockId(),
      type: 'list',
      data: {
        style: isOrdered ? 'ordered' : 'unordered',
        items: flatItems
      }
    },
    endIdx
  };
}

export function formatInlineMarkdown(text: string): string {
  let formatted = text;
  formatted = formatted.replace(/\*\*\*(.+?)\*\*\*/g, '<b><i>$1</i></b>');
  formatted = formatted.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
  formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<i>$1</i>');
  formatted = formatted.replace(/~~(.+?)~~/g, '<s>$1</s>');
  formatted = formatted.replace(/==(.+?)==/g, '<mark class="cdx-highlight">$1</mark>');
  formatted = formatted.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  formatted = formatted.replace(/`(.+?)`/g, '<code class="cdx-inline-code">$1</code>');
  return formatted;
}

function isBlockBreaker(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) return true;
  if (/^\d+[.)]\s/.test(trimmed)) return true;
  if (isChecklistItem(trimmed)) return true;
  if (isTableRow(trimmed)) return true;
  if (isCodeFenceStart(trimmed)) return true;
  if (isHorizontalRule(trimmed)) return true;
  if (trimmed.startsWith('#')) return true;
  if (trimmed.startsWith('> ')) return true;
  if (CALLOUT_EMOJI_PATTERN.test(trimmed)) return true;
  if (parseContentLine(trimmed)) return true;
  return false;
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

      if (isCodeFenceStart(trimmed)) {
        const { block, endIdx } = parseCodeBlock(lines, i);
        blocks.push(block);
        i = endIdx;
        continue;
      }

      if (isTableRow(trimmed)) {
        const result = parseTableBlock(lines, i);
        if (result) {
          blocks.push(result.block);
          i = result.endIdx;
          continue;
        }
      }

      if (isChecklistItem(trimmed)) {
        const { block, endIdx } = parseChecklistItems(lines, i);
        blocks.push(block);
        i = endIdx;
        continue;
      }

      if (isHorizontalRule(trimmed)) {
        blocks.push({
          id: generateBlockId(),
          type: 'delimiter',
          data: {}
        });
        i++;
        continue;
      }

      if (trimmed.startsWith('> ')) {
        const contentAfterArrow = trimmed.replace(/^>\s*/, '');
        const calloutInfo = detectCalloutEmoji(contentAfterArrow);
        if (calloutInfo) {
          const result = parseCalloutBlock(lines, i);
          if (result) {
            blocks.push(result.block);
            i = result.endIdx;
            continue;
          }
        }
        const quoteResult = parseQuoteBlock(lines, i);
        blocks.push(quoteResult.block);
        i = quoteResult.endIdx;
        continue;
      }

      if (CALLOUT_EMOJI_PATTERN.test(trimmed)) {
        blocks.push({
          id: generateBlockId(),
          type: 'callout',
          data: {
            text: formatInlineMarkdown(trimmed.replace(CALLOUT_EMOJI_PATTERN, '')),
            type: detectCalloutEmoji(trimmed)?.type || 'info',
            icon: detectCalloutEmoji(trimmed)?.icon || '💡'
          }
        });
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
        if (isBlockBreaker(nextLine)) break;
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
