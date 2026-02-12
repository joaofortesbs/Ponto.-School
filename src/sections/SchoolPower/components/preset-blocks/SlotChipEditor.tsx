"use client";
import React, { useRef, useEffect, useCallback } from "react";
import type { PromptNode } from "./promptNodes";

interface SlotChipProps {
  node: Extract<PromptNode, { type: 'slot' }>;
  onUpdate: (slotId: string, value: string) => void;
}

const SlotChip: React.FC<SlotChipProps> = ({ node, onUpdate }) => {
  const spanRef = useRef<HTMLSpanElement>(null);
  const lastSyncedValue = useRef(node.value);

  const isFilled = node.value.trim().length > 0;

  useEffect(() => {
    if (spanRef.current && node.value !== lastSyncedValue.current) {
      const sel = window.getSelection();
      const hadFocus = spanRef.current === document.activeElement;
      let savedOffset = 0;

      if (hadFocus && sel && sel.rangeCount > 0) {
        savedOffset = sel.getRangeAt(0).startOffset;
      }

      spanRef.current.textContent = node.value || '';
      lastSyncedValue.current = node.value;

      if (hadFocus && sel) {
        requestAnimationFrame(() => {
          if (!spanRef.current || !spanRef.current.firstChild) return;
          const range = document.createRange();
          const maxOff = Math.min(savedOffset, spanRef.current.firstChild.textContent?.length || 0);
          range.setStart(spanRef.current.firstChild, maxOff);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        });
      }
    }
  }, [node.value]);

  const handleInput = useCallback(() => {
    if (!spanRef.current) return;
    const text = spanRef.current.textContent || '';
    lastSyncedValue.current = text;
    onUpdate(node.id, text);
  }, [node.id, onUpdate]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      const el = spanRef.current;
      if (!el) return;
      const allChips = el.closest('.template-renderer-container')?.querySelectorAll('[contenteditable="true"]');
      if (allChips) {
        const arr = Array.from(allChips);
        const idx = arr.indexOf(el);
        if (idx >= 0 && idx < arr.length - 1) {
          (arr[idx + 1] as HTMLElement).focus();
          return;
        }
      }
      el.blur();
    }
  }, []);

  const handleFocus = useCallback(() => {
    if (!spanRef.current) return;
    if (!isFilled) {
      spanRef.current.textContent = '';
    }
    const sel = window.getSelection();
    if (sel && spanRef.current.childNodes.length > 0) {
      const range = document.createRange();
      range.selectNodeContents(spanRef.current);
      range.collapse(false);
      sel.removeAllRanges();
      sel.addRange(range);
    }
  }, [isFilled]);

  const handleBlur = useCallback(() => {
    if (!spanRef.current) return;
    const text = (spanRef.current.textContent || '').trim();
    lastSyncedValue.current = text;
    onUpdate(node.id, text);
    if (!text) {
      spanRef.current.textContent = '';
    }
  }, [node.id, onUpdate]);

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    document.execCommand('insertText', false, text);
  }, []);

  return (
    <span
      ref={spanRef}
      contentEditable
      suppressContentEditableWarning
      onInput={handleInput}
      onKeyDown={handleKeyDown}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onPaste={handlePaste}
      data-placeholder={node.placeholder}
      data-slot-id={node.id}
      className="inline-chip-editable"
      style={{
        display: 'inline',
        background: isFilled
          ? "rgba(249, 115, 22, 0.2)"
          : "rgba(249, 115, 22, 0.08)",
        border: isFilled
          ? "1px solid rgba(249, 115, 22, 0.5)"
          : "1px dashed rgba(249, 115, 22, 0.35)",
        borderRadius: "8px",
        padding: "2px 10px",
        margin: "0 2px",
        fontSize: "inherit",
        lineHeight: "inherit",
        color: isFilled ? "#fb923c" : "rgba(249, 115, 22, 0.65)",
        fontWeight: isFilled ? 500 : 400,
        fontStyle: isFilled ? "normal" : "italic",
        verticalAlign: "baseline",
        outline: "none",
        caretColor: "#f97316",
        cursor: "text",
        minWidth: "40px",
        wordBreak: "break-word",
        whiteSpace: "pre-wrap",
        transition: "background 0.15s, border-color 0.15s, color 0.15s",
      }}
    >
      {isFilled ? node.value : ''}
    </span>
  );
};

interface TemplateRendererProps {
  nodes: PromptNode[];
  onUpdateSlot: (slotId: string, value: string) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ nodes, onUpdateSlot }) => {
  return (
    <div
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
      }}
    >
      {nodes.map((node) => {
        if (node.type === 'text') {
          return <span key={node.id}>{node.value}</span>;
        }
        return (
          <SlotChip
            key={node.id}
            node={node}
            onUpdate={onUpdateSlot}
          />
        );
      })}
    </div>
  );
};

export default SlotChip;
