"use client";
import React, { useRef, useEffect, useCallback } from "react";
import type { PromptNode } from "./promptNodes";

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function nodesToHtml(nodes: PromptNode[]): string {
  return nodes.map((node) => {
    if (node.type === 'text') {
      return escapeHtml(node.value);
    }
    const filled = node.value.trim().length > 0;
    const displayText = filled ? escapeHtml(node.value) : '';
    return `<span class="inline-chip-editable" data-slot-id="${escapeHtml(node.id)}" data-slot-name="${escapeHtml(node.name)}" data-placeholder="${escapeHtml(node.placeholder)}" contenteditable="false" style="display:inline-block;background:${filled ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.08)'};border:1px ${filled ? 'solid rgba(249,115,22,0.5)' : 'dashed rgba(249,115,22,0.35)'};border-radius:8px;padding:2px 10px;margin:0 2px;color:${filled ? '#fb923c' : 'rgba(249,115,22,0.65)'};font-weight:${filled ? '500' : '400'};font-style:${filled ? 'normal' : 'italic'};vertical-align:baseline;outline:none;caret-color:#f97316;cursor:text;min-width:40px;word-break:break-word;white-space:pre-wrap">${displayText}</span>`;
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

interface TemplateRendererProps {
  nodes: PromptNode[];
  onNodesChange: (nodes: PromptNode[]) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ nodes, onNodesChange }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const lastExternalSlotIds = useRef<string>('');
  const mountedNodesRef = useRef<PromptNode[]>(nodes);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const currentSlotIds = getSlotIds(nodes);

    if (hasMounted.current && currentSlotIds === lastExternalSlotIds.current) {
      mountedNodesRef.current = nodes;
      return;
    }

    containerRef.current.innerHTML = nodesToHtml(nodes);
    mountedNodesRef.current = nodes;
    lastExternalSlotIds.current = currentSlotIds;
    hasMounted.current = true;
    bindChipClicks(containerRef.current);
  }, [nodes]);

  const bindChipClicks = useCallback((container: HTMLElement) => {
    const chips = container.querySelectorAll<HTMLSpanElement>('.inline-chip-editable');
    chips.forEach((chip) => {
      chip.onclick = (e) => {
        e.stopPropagation();
        chip.setAttribute('contenteditable', 'true');
        chip.focus();

        const sel = window.getSelection();
        if (sel) {
          const range = document.createRange();
          range.selectNodeContents(chip);
          range.collapse(false);
          sel.removeAllRanges();
          sel.addRange(range);
        }
      };

      chip.onblur = () => {
        const text = (chip.textContent || '').trim();
        chip.setAttribute('contenteditable', 'false');

        const filled = text.length > 0;
        chip.style.background = filled ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.08)';
        chip.style.border = filled
          ? '1px solid rgba(249,115,22,0.5)'
          : '1px dashed rgba(249,115,22,0.35)';
        chip.style.color = filled ? '#fb923c' : 'rgba(249,115,22,0.65)';
        chip.style.fontWeight = filled ? '500' : '400';
        chip.style.fontStyle = filled ? 'normal' : 'italic';

        if (!filled) {
          chip.textContent = '';
        }

        syncDomToModel();
      };

      chip.onkeydown = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();

          const allChips = container.querySelectorAll<HTMLSpanElement>('.inline-chip-editable');
          const arr = Array.from(allChips);
          const idx = arr.indexOf(chip);
          if (idx >= 0 && idx < arr.length - 1) {
            arr[idx + 1].click();
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
            arr[nextIdx].click();
          } else {
            chip.blur();
          }
        }
      };

      chip.oninput = () => {
        const filled = (chip.textContent || '').trim().length > 0;
        chip.style.background = filled ? 'rgba(249,115,22,0.2)' : 'rgba(249,115,22,0.08)';
        chip.style.border = filled
          ? '1px solid rgba(249,115,22,0.5)'
          : '1px dashed rgba(249,115,22,0.35)';
        chip.style.color = filled ? '#fb923c' : 'rgba(249,115,22,0.65)';
        chip.style.fontWeight = filled ? '500' : '400';
        chip.style.fontStyle = filled ? 'normal' : 'italic';

        syncDomToModel();
      };

      chip.onpaste = (e) => {
        e.preventDefault();
        const text = e.clipboardData?.getData('text/plain') || '';
        document.execCommand('insertText', false, text);
      };
    });
  }, []);

  const syncDomToModel = useCallback(() => {
    if (!containerRef.current) return;
    const parsed = htmlToNodes(containerRef.current, mountedNodesRef.current);
    mountedNodesRef.current = parsed;
    onNodesChange(parsed);
  }, [onNodesChange]);

  const handleContainerInput = useCallback(() => {
    syncDomToModel();
  }, [syncDomToModel]);

  const handleContainerPaste = useCallback((e: React.ClipboardEvent) => {
    const activeEl = document.activeElement;
    if (activeEl && activeEl.classList.contains('inline-chip-editable')) {
      return;
    }
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  const handleContainerKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
    }
  }, []);

  return (
    <div
      ref={containerRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleContainerInput}
      onPaste={handleContainerPaste}
      onKeyDown={handleContainerKeyDown}
      className="w-full template-renderer-container"
      style={{
        color: "#e0e0e0",
        fontSize: "16px",
        lineHeight: "26px",
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        minHeight: "20px",
        maxHeight: "200px",
        overflowY: "auto",
        overflowX: "hidden",
        wordBreak: "break-word",
        scrollbarWidth: "none",
        msOverflowStyle: "none",
        outline: "none",
        caretColor: "#e0e0e0",
        whiteSpace: "pre-wrap",
      }}
    />
  );
};

export default TemplateRenderer;
