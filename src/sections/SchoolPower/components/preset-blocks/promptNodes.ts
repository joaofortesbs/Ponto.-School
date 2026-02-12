export type PromptNode =
  | { type: 'text'; id: string; value: string }
  | { type: 'slot'; id: string; name: string; value: string; placeholder: string };

let nodeIdCounter = 0;
function generateNodeId(): string {
  return `node-${++nodeIdCounter}-${Date.now().toString(36)}`;
}

export function parsePromptToNodes(template: string): PromptNode[] {
  const regex = /\[([^\]]+)\]/g;
  const nodes: PromptNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(template)) !== null) {
    if (match.index > lastIndex) {
      nodes.push({
        type: 'text',
        id: generateNodeId(),
        value: template.slice(lastIndex, match.index),
      });
    }

    const rawSlot = match[1];
    const colonIndex = rawSlot.indexOf(':');
    const name = colonIndex >= 0 ? rawSlot.slice(0, colonIndex).trim() : rawSlot.trim();
    const placeholder = rawSlot.trim();

    nodes.push({
      type: 'slot',
      id: generateNodeId(),
      name,
      value: '',
      placeholder,
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < template.length) {
    nodes.push({
      type: 'text',
      id: generateNodeId(),
      value: template.slice(lastIndex),
    });
  }

  return nodes;
}

export function compilePrompt(nodes: PromptNode[]): string {
  return nodes
    .map((n) => {
      if (n.type === 'text') return n.value;
      return n.value.trim() || n.placeholder;
    })
    .join('');
}

export function hasUnfilledSlots(nodes: PromptNode[]): boolean {
  return nodes.some((n) => n.type === 'slot' && !n.value.trim());
}

export function updateSlotValue(
  nodes: PromptNode[],
  slotId: string,
  newValue: string
): PromptNode[] {
  return nodes.map((n) =>
    n.id === slotId && n.type === 'slot' ? { ...n, value: newValue } : n
  );
}
