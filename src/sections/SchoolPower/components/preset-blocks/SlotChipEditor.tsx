"use client";
import React, { useRef, useLayoutEffect, useCallback, Component, type ErrorInfo, type ReactNode } from "react";
import type { PromptNode } from "./promptNodes";

if (typeof window !== 'undefined' && !(window as any).__domPatchApplied) {
  (window as any).__domPatchApplied = true;

  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
    if (refNode && refNode.parentNode !== this) {
      return newNode;
    }
    return origInsertBefore.call(this, newNode, refNode) as T;
  };
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

const CHIP_STYLES_FILLED = {
  background: 'rgba(249,115,22,0.2)',
  border: '1px solid rgba(249,115,22,0.5)',
  color: '#fb923c',
  fontWeight: '500',
  fontStyle: 'normal',
} as const;

const CHIP_STYLES_EMPTY = {
  background: 'rgba(249,115,22,0.08)',
  border: '1px dashed rgba(249,115,22,0.35)',
  color: 'rgba(249,115,22,0.65)',
  fontWeight: '400',
  fontStyle: 'italic',
} as const;

const CHIP_BASE_STYLES = 'display:inline-block;border-radius:6px;padding:0px 6px;margin:0 2px;vertical-align:baseline;outline:none;caret-color:#f97316;cursor:text;min-width:30px;word-break:break-word;white-space:pre-wrap;-webkit-user-modify:read-write-plaintext-only;line-height:1.4;';

function applyChipVisualState(chip: HTMLSpanElement, filled: boolean) {
  const styles = filled ? CHIP_STYLES_FILLED : CHIP_STYLES_EMPTY;
  chip.style.background = styles.background;
  chip.style.border = styles.border;
  chip.style.color = styles.color;
  chip.style.fontWeight = styles.fontWeight;
  chip.style.fontStyle = styles.fontStyle;
}

function nodesToHtml(nodes: PromptNode[]): string {
  return nodes.map((node) => {
    if (node.type === 'text') {
      return escapeHtml(node.value);
    }
    const filled = node.value.trim().length > 0;
    const displayText = filled ? escapeHtml(node.value) : '';
    const s = filled ? CHIP_STYLES_FILLED : CHIP_STYLES_EMPTY;
    return `<span class="inline-chip-editable" data-slot-id="${escapeHtml(node.id)}" data-slot-name="${escapeHtml(node.name)}" data-placeholder="${escapeHtml(node.placeholder)}" contenteditable="true" style="${CHIP_BASE_STYLES};background:${s.background};border:${s.border};color:${s.color};font-weight:${s.fontWeight};font-style:${s.fontStyle}">${displayText}</span>`;
  }).join('');
}

function getSlotIds(nodes: PromptNode[]): string {
  return nodes
    .filter(n => n.type === 'slot')
    .map(n => n.id)
    .sort()
    .join(',');
}

function htmlToNodes(container: HTMLElement, originalNodes: PromptNode[]): PromptNode[] {
  const result: PromptNode[] = [];
  let textCounter = 0;

  const originalSlots = new Map<string, Extract<PromptNode, { type: 'slot' }>>();
  originalNodes.forEach(n => {
    if (n.type === 'slot') originalSlots.set(n.id, n);
  });

  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.classList.contains('inline-chip-editable')) {
            return NodeFilter.FILTER_ACCEPT;
          }
          if (el.tagName === 'BR') {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
        if (node.nodeType === Node.TEXT_NODE) {
          const parent = node.parentElement;
          if (parent && parent.classList.contains('inline-chip-editable')) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_SKIP;
      }
    }
  );

  let current = walker.nextNode();
  while (current) {
    if (current.nodeType === Node.TEXT_NODE) {
      const text = current.textContent || '';
      if (text.length > 0) {
        result.push({
          type: 'text',
          id: `parsed-text-${textCounter++}`,
          value: text,
        });
      }
    } else if (current.nodeType === Node.ELEMENT_NODE) {
      const el = current as HTMLElement;
      if (el.tagName === 'BR') {
        result.push({
          type: 'text',
          id: `parsed-text-${textCounter++}`,
          value: '\n',
        });
      } else if (el.classList.contains('inline-chip-editable')) {
        const slotId = el.getAttribute('data-slot-id');
        if (slotId) {
          const original = originalSlots.get(slotId);
          if (original) {
            result.push({
              type: 'slot',
              id: original.id,
              name: original.name,
              value: el.textContent || '',
              placeholder: original.placeholder,
            });
          }
        }
      }
    }
    current = walker.nextNode();
  }

  return result;
}

function placeCaretAtClickPoint(chip: HTMLSpanElement, clientX: number, clientY: number) {
  const sel = window.getSelection();
  if (!sel) return;

  if ((document as any).caretRangeFromPoint) {
    const range = (document as any).caretRangeFromPoint(clientX, clientY) as Range | null;
    if (range && chip.contains(range.startContainer)) {
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
  } else if ((document as any).caretPositionFromPoint) {
    const pos = (document as any).caretPositionFromPoint(clientX, clientY);
    if (pos && chip.contains(pos.offsetNode)) {
      const range = document.createRange();
      range.setStart(pos.offsetNode, pos.offset);
      range.collapse(true);
      sel.removeAllRanges();
      sel.addRange(range);
      return;
    }
  }

  const range = document.createRange();
  range.selectNodeContents(chip);
  range.collapse(false);
  sel.removeAllRanges();
  sel.addRange(range);
}

function safeDomCleanup(container: HTMLElement) {
  try {
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
  } catch {
    try {
      container.textContent = '';
    } catch {
      // silently ignore
    }
  }
}

class TemplateErrorBoundary extends Component<{ children: ReactNode; fallback?: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode; fallback?: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (error.message?.includes('removeChild') || error.message?.includes('not a child')) {
      console.warn('[TemplateRenderer] Caught DOM reconciliation error, recovering...');
      this.setState({ hasError: false });
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || null;
    }
    return this.props.children;
  }
}

interface TemplateRendererProps {
  nodes: PromptNode[];
  onNodesChange: (nodes: PromptNode[]) => void;
}

const TemplateRendererInner: React.FC<TemplateRendererProps> = ({ nodes, onNodesChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const editorRef = useRef<HTMLDivElement | null>(null);
  const lastExternalSlotIds = useRef<string>('');
  const mountedNodesRef = useRef<PromptNode[]>(nodes);
  const onNodesChangeRef = useRef(onNodesChange);
  onNodesChangeRef.current = onNodesChange;

  const syncDomToModel = useCallback(() => {
    if (!editorRef.current) return;
    try {
      const parsed = htmlToNodes(editorRef.current, mountedNodesRef.current);
      mountedNodesRef.current = parsed;
      onNodesChangeRef.current(parsed);
    } catch {
      // ignore sync errors
    }
  }, []);

  const bindChipEvents = useCallback((container: HTMLElement) => {
    const chips = container.querySelectorAll<HTMLSpanElement>('.inline-chip-editable');
    chips.forEach((chip) => {

      chip.addEventListener('mousedown', (e) => {
        e.stopPropagation();

        requestAnimationFrame(() => {
          chip.focus();
          placeCaretAtClickPoint(chip, e.clientX, e.clientY);
        });
      });

      chip.addEventListener('focus', () => {
        const filled = (chip.textContent || '').trim().length > 0;
        applyChipVisualState(chip, filled || true);
      });

      chip.addEventListener('blur', () => {
        const text = (chip.textContent || '').trim();
        const filled = text.length > 0;
        applyChipVisualState(chip, filled);
        if (!filled) chip.textContent = '';
        syncDomToModel();
      });

      chip.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          const allChips = container.querySelectorAll<HTMLSpanElement>('.inline-chip-editable');
          const arr = Array.from(allChips);
          const idx = arr.indexOf(chip);
          if (idx >= 0 && idx < arr.length - 1) {
            arr[idx + 1].focus();
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.selectNodeContents(arr[idx + 1]);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } else {
            chip.blur();
          }
        }
        if (e.key === 'Tab') {
          e.preventDefault();
          const allChips = container.querySelectorAll<HTMLSpanElement>('.inline-chip-editable');
          const arr = Array.from(allChips);
          const idx = arr.indexOf(chip);
          const nextIdx = e.shiftKey ? idx - 1 : idx + 1;
          if (nextIdx >= 0 && nextIdx < arr.length) {
            arr[nextIdx].focus();
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.selectNodeContents(arr[nextIdx]);
              range.collapse(false);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } else {
            chip.blur();
          }
        }
      });

      chip.addEventListener('input', () => {
        const filled = (chip.textContent || '').trim().length > 0;
        applyChipVisualState(chip, filled);
        syncDomToModel();
      });

      chip.addEventListener('paste', (e) => {
        e.preventDefault();
        const text = (e as ClipboardEvent).clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
      });
    });
  }, [syncDomToModel]);

  const refCallback = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  useLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    if (editorRef.current && container.contains(editorRef.current)) {
      return;
    }

    const editor = document.createElement('div');
    editor.contentEditable = 'true';
    editor.className = 'w-full template-renderer-container';
    Object.assign(editor.style, {
      color: '#e0e0e0',
      fontSize: '16px',
      lineHeight: '26px',
      fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
      minHeight: '20px',
      maxHeight: '200px',
      overflowY: 'auto',
      overflowX: 'hidden',
      wordBreak: 'break-word',
      scrollbarWidth: 'none',
      outline: 'none',
      caretColor: '#e0e0e0',
      whiteSpace: 'pre-wrap',
    });

    editor.innerHTML = nodesToHtml(nodes);
    mountedNodesRef.current = nodes;
    lastExternalSlotIds.current = getSlotIds(nodes);

    editor.addEventListener('input', () => syncDomToModel());
    editor.addEventListener('paste', (e) => {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.classList.contains('inline-chip-editable')) return;
      e.preventDefault();
      const text = (e as ClipboardEvent).clipboardData?.getData('text/plain') || '';
      document.execCommand('insertText', false, text);
    });
    editor.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
      }
    });

    container.appendChild(editor);
    editorRef.current = editor;
    bindChipEvents(editor);

    return () => {
      safeDomCleanup(container);
      editorRef.current = null;
    };
  }, []);

  useLayoutEffect(() => {
    if (!editorRef.current) return;

    const currentSlotIds = getSlotIds(nodes);
    if (currentSlotIds === lastExternalSlotIds.current) {
      mountedNodesRef.current = nodes;
      return;
    }

    try {
      editorRef.current.innerHTML = nodesToHtml(nodes);
    } catch {
      safeDomCleanup(editorRef.current);
      editorRef.current.innerHTML = nodesToHtml(nodes);
    }
    mountedNodesRef.current = nodes;
    lastExternalSlotIds.current = currentSlotIds;
    bindChipEvents(editorRef.current);
  }, [nodes, bindChipEvents]);

  return (
    <div
      ref={refCallback}
      className="w-full"
      style={{ minHeight: '20px' }}
      suppressContentEditableWarning
    />
  );
};

export const TemplateRenderer: React.FC<TemplateRendererProps> = (props) => {
  return (
    <TemplateErrorBoundary>
      <TemplateRendererInner {...props} />
    </TemplateErrorBoundary>
  );
};

export default TemplateRenderer;
