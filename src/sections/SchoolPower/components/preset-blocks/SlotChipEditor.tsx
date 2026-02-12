"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { PromptNode } from "./promptNodes";

interface SlotChipProps {
  node: Extract<PromptNode, { type: 'slot' }>;
  onUpdate: (slotId: string, value: string) => void;
}

const SlotChip: React.FC<SlotChipProps> = ({ node, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editValue, setEditValue] = useState(node.value);
  const inputRef = useRef<HTMLInputElement>(null);
  const chipRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setEditValue(node.value);
  }, [node.value]);

  const handleConfirm = () => {
    onUpdate(node.id, editValue.trim());
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      e.stopPropagation();
      handleConfirm();
    }
    if (e.key === 'Escape') {
      setEditValue(node.value);
      setIsEditing(false);
    }
  };

  const isFilled = node.value.trim().length > 0;

  return (
    <>
      <span
        ref={chipRef}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setIsEditing(true);
        }}
        className="inline-flex items-center cursor-pointer select-none transition-all duration-200"
        style={{
          background: isFilled
            ? "rgba(249, 115, 22, 0.2)"
            : "rgba(249, 115, 22, 0.08)",
          border: isFilled
            ? "1px solid rgba(249, 115, 22, 0.5)"
            : "1px dashed rgba(249, 115, 22, 0.35)",
          borderRadius: "8px",
          padding: "2px 10px",
          margin: "0 2px",
          fontSize: "14px",
          lineHeight: "22px",
          color: isFilled ? "#fb923c" : "rgba(249, 115, 22, 0.65)",
          fontWeight: isFilled ? 500 : 400,
          fontStyle: isFilled ? "normal" : "italic",
          verticalAlign: "baseline",
          whiteSpace: "nowrap",
          maxWidth: "200px",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
      >
        {isFilled ? node.value : node.placeholder}
      </span>

      <AnimatePresence>
        {isEditing && (
          <>
            <div
              className="fixed inset-0 z-[99998]"
              onClick={() => {
                handleConfirm();
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 4, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 4, scale: 0.96 }}
              transition={{ duration: 0.15 }}
              className="fixed z-[99999]"
              style={{
                top: chipRef.current
                  ? chipRef.current.getBoundingClientRect().bottom + 6
                  : 0,
                left: chipRef.current
                  ? Math.min(
                      chipRef.current.getBoundingClientRect().left,
                      window.innerWidth - 260
                    )
                  : 0,
              }}
            >
              <div
                className="flex items-center gap-2"
                style={{
                  background: "linear-gradient(145deg, #1a1a2e, #16213e)",
                  border: "1px solid rgba(249, 115, 22, 0.3)",
                  borderRadius: "12px",
                  padding: "8px 12px",
                  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(249, 115, 22, 0.1)",
                  minWidth: "220px",
                }}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={node.placeholder}
                  className="flex-1 bg-transparent border-none outline-none text-white/90 text-sm placeholder:text-white/30"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    caretColor: "#f97316",
                  }}
                />
                <button
                  onClick={handleConfirm}
                  className="flex-shrink-0 flex items-center justify-center rounded-lg transition-all duration-200 hover:scale-105"
                  style={{
                    background: "linear-gradient(145deg, #f97316, #ea580c)",
                    width: "28px",
                    height: "28px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              </div>
              <div
                className="text-xs mt-1.5 px-1"
                style={{ color: "rgba(255,255,255,0.35)" }}
              >
                Enter para confirmar · Esc para cancelar
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

interface TemplateRendererProps {
  nodes: PromptNode[];
  onUpdateSlot: (slotId: string, value: string) => void;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ nodes, onUpdateSlot }) => {
  return (
    <div
      className="w-full"
      style={{
        color: "#e0e0e0",
        fontSize: "16px",
        lineHeight: "24px",
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
