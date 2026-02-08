import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Download, MoreHorizontal, GripVertical, Trash2, CopyPlus, ArrowUp, ArrowDown, Bold, Italic, Strikethrough, Code, Link2, Type, ListOrdered, List as ListIcon, ChevronUp, Quote, ListChecks } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS as DndCSS } from '@dnd-kit/utilities';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { OVERLAY_CONFIG } from '@/config/overlay';
import { ARTIFACT_TYPE_CONFIGS } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { convertArtifactToEditorJS, extractTOCFromBlocks } from './artifact-editorjs-converter';
import type { EditorJSBlock, TOCItem } from './artifact-editorjs-converter';

interface ArtifactViewModalProps {
  artifact: ArtifactData;
  isOpen: boolean;
  onClose: () => void;
}

const MODAL_COLORS = {
  background: '#000822',
  header: '#040b2a',
  overlay: { opacity: OVERLAY_CONFIG.opacity, blur: OVERLAY_CONFIG.blur },
};

const blockAnimVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: 0.06 * i,
      duration: 0.35,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  }),
};

const FONT_STYLES = {
  heading: { fontFamily: "'Inter', 'SF Pro Display', -apple-system, sans-serif" },
  body: { fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif" },
  ui: { fontFamily: "'Inter', -apple-system, sans-serif" },
} as const;

function EditableContent({
  html,
  className,
  style,
  onUpdate,
}: {
  html: string;
  className?: string;
  style?: React.CSSProperties;
  onUpdate?: (newHtml: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtmlRef = useRef(html);

  useEffect(() => {
    if (ref.current && html !== lastHtmlRef.current) {
      ref.current.innerHTML = html;
      lastHtmlRef.current = html;
    }
  }, [html]);

  const handleInput = useCallback(() => {
    if (ref.current && onUpdate) {
      const newHtml = ref.current.innerHTML;
      lastHtmlRef.current = newHtml;
      onUpdate(newHtml);
    }
  }, [onUpdate]);

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      className={className}
      style={{
        ...style,
        outline: 'none',
        cursor: 'text',
        minHeight: '1em',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word',
      }}
      onInput={handleInput}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function BlockContextMenu({
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
}: {
  onDuplicate: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-lg border py-1 min-w-[170px]"
      style={{
        background: '#0a1128',
        borderColor: '#1a2444',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {[
        { icon: <CopyPlus className="w-3.5 h-3.5" />, label: 'Duplicar', onClick: onDuplicate },
        { icon: <ArrowUp className="w-3.5 h-3.5" />, label: 'Mover para cima', onClick: onMoveUp },
        { icon: <ArrowDown className="w-3.5 h-3.5" />, label: 'Mover para baixo', onClick: onMoveDown },
      ].map((item) => (
        <button
          key={item.label}
          onClick={item.onClick}
          className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-slate-300 hover:bg-white/5 transition-colors"
          style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
      <div className="my-1 h-px mx-2" style={{ background: '#1a2444' }} />
      <button
        onClick={onDelete}
        className="w-full flex items-center gap-2.5 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 transition-colors"
        style={{ fontFamily: "'Inter', -apple-system, sans-serif" }}
      >
        <Trash2 className="w-3.5 h-3.5" />
        Excluir
      </button>
    </motion.div>
  );
}

function SortableBlock({
  block,
  index,
  accentColor,
  isSelected,
  onBlockUpdate,
  onListItemUpdate,
  onTableCellUpdate,
  onBlockSelect,
  onDuplicate,
  onDelete,
  onMoveUp,
  onMoveDown,
  onTodoToggle,
  onChecklistItemToggle,
  onChecklistItemUpdate,
}: {
  block: EditorJSBlock;
  index: number;
  accentColor: string;
  isSelected?: boolean;
  onBlockUpdate?: (blockId: string, newHtml: string) => void;
  onListItemUpdate?: (blockId: string, itemIndex: number, newHtml: string) => void;
  onTableCellUpdate?: (blockId: string, rowIndex: number, colIndex: number, newText: string) => void;
  onBlockSelect?: (blockId: string) => void;
  onDuplicate?: (blockId: string) => void;
  onDelete?: (blockId: string) => void;
  onMoveUp?: (blockId: string) => void;
  onMoveDown?: (blockId: string) => void;
  onTodoToggle?: (blockId: string) => void;
  onChecklistItemToggle?: (blockId: string, itemIndex: number) => void;
  onChecklistItemUpdate?: (blockId: string, itemIndex: number, newHtml: string) => void;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const didDragRef = useRef(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: block.id });

  useEffect(() => {
    if (isDragging) didDragRef.current = true;
  }, [isDragging]);

  const handleGripClick = useCallback(
    (e: React.MouseEvent) => {
      if (!didDragRef.current) {
        e.stopPropagation();
        onBlockSelect?.(block.id);
      }
      didDragRef.current = false;
    },
    [block.id, onBlockSelect]
  );

  const dndStyle: React.CSSProperties = {
    transform: DndCSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    position: 'relative' as const,
    zIndex: isDragging ? 50 : undefined,
  };

  const handleTextUpdate = useCallback(
    (newHtml: string) => {
      if (onBlockUpdate) {
        onBlockUpdate(block.id, newHtml);
      }
    },
    [onBlockUpdate, block.id]
  );

  const handleListItemInput = useCallback(
    (idx: number, e: React.FormEvent<HTMLSpanElement>) => {
      if (onListItemUpdate) {
        onListItemUpdate(block.id, idx, (e.target as HTMLSpanElement).innerHTML);
      }
    },
    [onListItemUpdate, block.id]
  );

  const handleTableCellInput = useCallback(
    (rIdx: number, cIdx: number, e: React.FormEvent<HTMLTableCellElement>) => {
      if (onTableCellUpdate) {
        onTableCellUpdate(block.id, rIdx, cIdx, (e.target as HTMLTableCellElement).textContent || '');
      }
    },
    [onTableCellUpdate, block.id]
  );

  const renderContent = () => {
    if (block.type === 'header') {
      const level = block.data.level as number;
      const text = block.data.text as string;
      const isSectionHeader = block.id.startsWith('section-');

      if (level === 1 || (level === 2 && isSectionHeader)) {
        return (
          <div id={block.id} className="mt-10 mb-4 first:mt-0">
            <EditableContent
              html={text}
              className="text-[1.65rem] font-bold leading-tight tracking-tight"
              style={{ ...FONT_STYLES.heading, color: '#e2e8f0' }}
              onUpdate={handleTextUpdate}
            />
            <div
              className="mt-2 h-[1px]"
              style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }}
            />
          </div>
        );
      }

      if (level === 2) {
        return (
          <div id={block.id} className="mt-8 mb-3">
            <EditableContent
              html={text}
              className="text-[1.3rem] font-semibold leading-snug tracking-tight"
              style={{ ...FONT_STYLES.heading, color: '#cbd5e1' }}
              onUpdate={handleTextUpdate}
            />
          </div>
        );
      }

      if (level === 3) {
        return (
          <div className="mt-6 mb-2">
            <EditableContent
              html={text}
              className="text-base font-semibold leading-snug"
              style={{ ...FONT_STYLES.heading, color: '#94a3b8' }}
              onUpdate={handleTextUpdate}
            />
          </div>
        );
      }

      if (level === 4) {
        return (
          <div id={block.id} className="mt-5 mb-2">
            <EditableContent
              html={text}
              className="text-[15px] font-semibold leading-snug"
              style={{ ...FONT_STYLES.heading, color: '#8b95a5' }}
              onUpdate={handleTextUpdate}
            />
          </div>
        );
      }

      if (level === 5) {
        return (
          <div id={block.id} className="mt-4 mb-1.5">
            <EditableContent
              html={text}
              className="text-[14px] font-medium leading-snug"
              style={{ ...FONT_STYLES.heading, color: '#7d8899' }}
              onUpdate={handleTextUpdate}
            />
          </div>
        );
      }

      if (level === 6) {
        return (
          <div id={block.id} className="mt-4 mb-1">
            <EditableContent
              html={text}
              className="text-[13px] font-medium leading-snug uppercase tracking-wide"
              style={{ ...FONT_STYLES.heading, color: '#6b7685' }}
              onUpdate={handleTextUpdate}
            />
          </div>
        );
      }
    }

    if (block.type === 'paragraph') {
      const text = block.data.text as string;
      return (
        <div className="mb-3">
          <EditableContent
            html={text}
            className="text-[15px] leading-[1.8] text-slate-300"
            style={FONT_STYLES.body}
            onUpdate={handleTextUpdate}
          />
        </div>
      );
    }

    if (block.type === 'list') {
      const items = block.data.items as string[];
      const isOrdered = block.data.style === 'ordered';

      const renderItem = (item: string, idx: number) => (
        <li
          key={idx}
          className="flex items-start gap-3 text-[15px] leading-[1.7] text-slate-300"
          style={FONT_STYLES.body}
        >
          {isOrdered ? (
            <span
              className="font-semibold text-sm mt-0.5 min-w-[20px] text-right flex-shrink-0"
              style={{ ...FONT_STYLES.ui, color: accentColor }}
            >
              {idx + 1}.
            </span>
          ) : (
            <span
              className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0"
              style={{ background: accentColor }}
            />
          )}
          <span
            contentEditable
            suppressContentEditableWarning
            className="outline-none flex-1"
            style={{ cursor: 'text', minHeight: '1em', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
            onInput={(e) => handleListItemInput(idx, e)}
            dangerouslySetInnerHTML={{ __html: item }}
          />
        </li>
      );

      return (
        <div className="mb-4 pl-1">
          {isOrdered ? (
            <ol className="space-y-1.5">{items.map(renderItem)}</ol>
          ) : (
            <ul className="space-y-1.5">{items.map(renderItem)}</ul>
          )}
        </div>
      );
    }

    if (block.type === 'quote') {
      const text = block.data.text as string;
      return (
        <div
          className="mb-4 py-3 pl-5 pr-4"
          style={{
            borderLeft: `3px solid ${accentColor}60`,
            borderRadius: '2px',
          }}
        >
          <EditableContent
            html={text}
            className="text-[15px] leading-[1.8] text-slate-300/90"
            style={FONT_STYLES.body}
            onUpdate={handleTextUpdate}
          />
        </div>
      );
    }

    if (block.type === 'delimiter') {
      return (
        <div className="my-8 flex items-center justify-center gap-2">
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span className="w-1 h-1 rounded-full bg-slate-600" />
        </div>
      );
    }

    if (block.type === 'todo') {
      const text = block.data.text as string;
      const checked = block.data.checked as boolean;
      return (
        <div className="mb-3 flex items-start gap-3">
          <input
            type="checkbox"
            checked={checked}
            onChange={() => onTodoToggle?.(block.id)}
            className="mt-1 w-4 h-4 rounded border-slate-600 accent-blue-500 flex-shrink-0"
            style={{ cursor: 'pointer' }}
          />
          <EditableContent
            html={text}
            className={`text-[15px] leading-[1.8] ${checked ? 'line-through text-slate-500' : 'text-slate-300'}`}
            style={FONT_STYLES.body}
            onUpdate={handleTextUpdate}
          />
        </div>
      );
    }

    if (block.type === 'checklist') {
      const items = (block.data.items as { text: string; checked: boolean }[]) || [];
      return (
        <div className="mb-4 space-y-1">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-start gap-3 py-0.5">
              <input
                type="checkbox"
                checked={item.checked}
                onChange={() => onChecklistItemToggle?.(block.id, idx)}
                className="mt-1 w-4 h-4 rounded border-slate-600 flex-shrink-0"
                style={{
                  cursor: 'pointer',
                  accentColor: accentColor,
                }}
              />
              <span
                contentEditable
                suppressContentEditableWarning
                className={`outline-none flex-1 text-[15px] leading-[1.8] ${item.checked ? 'line-through opacity-40' : 'text-slate-300'}`}
                style={{
                  ...FONT_STYLES.body,
                  cursor: 'text',
                  minHeight: '1em',
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  textDecorationColor: item.checked ? 'rgba(148, 163, 184, 0.5)' : undefined,
                }}
                onInput={(e) => onChecklistItemUpdate?.(block.id, idx, (e.target as HTMLSpanElement).innerHTML)}
                dangerouslySetInnerHTML={{ __html: item.text }}
              />
            </div>
          ))}
        </div>
      );
    }

    if (block.type === 'table') {
      const content = block.data.content as string[][];
      return (
        <div className="mb-4 overflow-x-auto rounded-lg border border-slate-700/50">
          <table className="w-full text-sm text-slate-300" style={FONT_STYLES.ui}>
            <tbody>
              {content.map((row, rIdx) => (
                <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800/60' : 'bg-slate-800/20'}>
                  {row.map((cell, cIdx) => (
                    <td
                      key={cIdx}
                      contentEditable
                      suppressContentEditableWarning
                      className={`px-4 py-2.5 border-b border-slate-700/30 outline-none ${
                        rIdx === 0 ? 'font-semibold text-slate-200' : ''
                      }`}
                      style={{ cursor: 'text' }}
                      onInput={(e) => handleTableCellInput(rIdx, cIdx, e)}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }

    return null;
  };

  return (
    <div
      ref={setNodeRef}
      data-block-id={block.id}
      style={{
        ...dndStyle,
        background: isSelected ? 'rgba(56, 139, 253, 0.08)' : undefined,
        borderRadius: isSelected ? '6px' : undefined,
        padding: isSelected ? '2px 4px' : undefined,
        margin: isSelected ? '-2px -4px' : undefined,
      }}
      {...attributes}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { if (!isSelected) setIsHovered(false); }}
      className="group relative"
    >
      <div
        className="absolute -left-9 top-1/2 -translate-y-1/2 flex items-center justify-center w-6 h-6 rounded cursor-grab active:cursor-grabbing transition-all duration-150"
        style={{
          opacity: isHovered || isSelected ? 0.6 : 0,
          color: isSelected ? accentColor : '#64748b',
        }}
        onClick={handleGripClick}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </div>

      {isSelected && (
        <div
          className="absolute z-50"
          style={{ left: '-36px', top: 'calc(50% + 16px)' }}
        >
          <BlockContextMenu
            onDuplicate={() => onDuplicate?.(block.id)}
            onDelete={() => onDelete?.(block.id)}
            onMoveUp={() => onMoveUp?.(block.id)}
            onMoveDown={() => onMoveDown?.(block.id)}
          />
        </div>
      )}

      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
      >
        {renderContent()}
      </motion.div>
    </div>
  );
}

function BlockOutline({
  items,
  activeId,
  onNavigate,
}: {
  items: TOCItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  accentColor: string;
}) {
  const [isHovered, setIsHovered] = useState(false);
  const hoverTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleMouseEnter = useCallback(() => {
    if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    setIsHovered(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    hoverTimeoutRef.current = setTimeout(() => setIsHovered(false), 200);
  }, []);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  if (items.length === 0) return null;

  return (
    <div
      className="relative"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, x: 8, scale: 0.96 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          transition={{ duration: 0.18, ease: [0.4, 0, 0.2, 1] }}
          className="absolute z-20 rounded-xl border py-3 px-3"
          style={{
            right: 'calc(100% + 10px)',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'rgba(20, 22, 40, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderColor: 'rgba(255, 255, 255, 0.08)',
            boxShadow: '0 12px 40px rgba(0,0,0,0.5), 0 4px 12px rgba(0,0,0,0.3)',
            width: '220px',
            maxHeight: '380px',
            overflowY: 'auto',
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <nav className="flex flex-col gap-0.5">
            {items.map((item) => {
              const isActive = activeId === item.id;
              const truncatedText = item.text.length > 22
                ? item.text.substring(0, 22) + '...'
                : item.text;

              return (
                <button
                  key={item.id}
                  onClick={() => onNavigate(item.id)}
                  className="w-full text-left rounded-md px-2 py-1.5 transition-colors duration-150"
                  style={{
                    paddingLeft: item.level > 1 ? '20px' : '8px',
                    color: isActive ? '#4C9AFF' : '#9ca3af',
                    background: isActive ? 'rgba(29, 122, 252, 0.08)' : 'transparent',
                    fontSize: item.level === 1 ? '13px' : '12px',
                    fontWeight: item.level === 1 ? 600 : 400,
                    fontFamily: "'Inter', -apple-system, sans-serif",
                    lineHeight: '1.4',
                  }}
                  onMouseOver={(e) => {
                    if (!isActive) {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255, 255, 255, 0.04)';
                      (e.currentTarget as HTMLElement).style.color = '#e2e8f0';
                    }
                  }}
                  onMouseOut={(e) => {
                    (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(29, 122, 252, 0.08)' : 'transparent';
                    (e.currentTarget as HTMLElement).style.color = isActive ? '#4C9AFF' : '#9ca3af';
                  }}
                >
                  {truncatedText}
                </button>
              );
            })}
          </nav>
        </motion.div>
      )}

      <nav className="flex flex-col items-end gap-[6px] py-2">
        {items.map((item) => {
          const isActive = activeId === item.id;
          const isSubLevel = item.level > 1;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className="block transition-all duration-300 rounded-full"
              style={{
                width: isActive ? '22px' : isSubLevel ? '10px' : '16px',
                height: '2px',
                background: isActive ? '#1D7AFC' : 'rgba(100, 116, 139, 0.3)',
                boxShadow: isActive ? '0 0 6px rgba(29, 122, 252, 0.5)' : 'none',
                animation: isActive ? 'outlinePulse 2s ease-in-out infinite' : 'none',
              }}
              title={item.text}
            />
          );
        })}
        <style>{`
          @keyframes outlinePulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.6; }
          }
        `}</style>
      </nav>
    </div>
  );
}

interface TurnIntoOption {
  type: string;
  label: string;
  icon: React.ReactNode;
  data: Record<string, unknown>;
}

const TURN_INTO_OPTIONS: TurnIntoOption[] = [
  { type: 'header', label: 'Heading 1', icon: <span className="text-[13px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>H1</span>, data: { level: 1 } },
  { type: 'header', label: 'Heading 2', icon: <span className="text-[13px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>H2</span>, data: { level: 2 } },
  { type: 'header', label: 'Heading 3', icon: <span className="text-[13px] font-bold" style={{ fontFamily: "'Inter', sans-serif" }}>H3</span>, data: { level: 3 } },
  { type: 'header', label: 'Heading 4', icon: <span className="text-[12px] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>H4</span>, data: { level: 4 } },
  { type: 'header', label: 'Heading 5', icon: <span className="text-[12px] font-semibold" style={{ fontFamily: "'Inter', sans-serif" }}>H5</span>, data: { level: 5 } },
  { type: 'header', label: 'Heading 6', icon: <span className="text-[11px] font-medium" style={{ fontFamily: "'Inter', sans-serif" }}>H6</span>, data: { level: 6 } },
  { type: 'paragraph', label: 'Text', icon: <Type className="w-4 h-4" />, data: {} },
  { type: 'list', label: 'List', icon: <ListIcon className="w-4 h-4" />, data: { style: 'unordered' } },
  { type: 'list', label: 'Ordered List', icon: <ListOrdered className="w-4 h-4" />, data: { style: 'ordered' } },
  { type: 'checklist', label: 'Checklist', icon: <ListChecks className="w-4 h-4" />, data: {} },
  { type: 'quote', label: 'Citação', icon: <Quote className="w-4 h-4" />, data: {} },
];

function TurnIntoMenu({
  currentBlockType,
  currentBlockLevel,
  currentBlockStyle,
  onSelect,
  onClose,
  focusedIndex,
}: {
  currentBlockType: string;
  currentBlockLevel?: number;
  currentBlockStyle?: string;
  onSelect: (option: TurnIntoOption) => void;
  onClose: () => void;
  focusedIndex: number;
}) {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = menuRef.current?.children[focusedIndex] as HTMLElement | undefined;
    if (el) el.scrollIntoView({ block: 'nearest' });
  }, [focusedIndex]);

  const isActive = (opt: TurnIntoOption) => {
    if (opt.type === 'paragraph' && currentBlockType === 'paragraph') return true;
    if (opt.type === 'header' && currentBlockType === 'header' && opt.data.level === currentBlockLevel) return true;
    if (opt.type === 'list' && currentBlockType === 'list' && opt.data.style === currentBlockStyle) return true;
    if (opt.type === 'checklist' && currentBlockType === 'checklist') return true;
    if (opt.type === 'quote' && currentBlockType === 'quote') return true;
    return false;
  };

  return (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, y: -4, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="absolute left-0 top-full mt-1 rounded-lg border py-1.5 z-[70] overflow-hidden"
      style={{
        background: '#141422',
        borderColor: '#2a2a4a',
        boxShadow: '0 12px 40px rgba(0,0,0,0.6), 0 4px 12px rgba(0,0,0,0.4)',
        minWidth: '190px',
        maxHeight: '320px',
        overflowY: 'auto',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {TURN_INTO_OPTIONS.map((opt, idx) => {
        const active = isActive(opt);
        const focused = idx === focusedIndex;
        return (
          <button
            key={`${opt.type}-${opt.label}`}
            onClick={() => { onSelect(opt); onClose(); }}
            className="w-full flex items-center gap-3 px-3 py-[7px] text-[13px] transition-colors"
            style={{
              fontFamily: "'Inter', -apple-system, sans-serif",
              color: active ? '#4C9AFF' : focused ? '#e2e8f0' : '#c8cdd3',
              background: focused ? 'rgba(255,255,255,0.06)' : 'transparent',
            }}
            onMouseOver={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
            }}
            onMouseOut={(e) => {
              (e.currentTarget as HTMLElement).style.background = 'transparent';
            }}
          >
            <span className="flex items-center justify-center w-5 h-5 flex-shrink-0"
              style={{ color: active ? '#4C9AFF' : '#8b919a' }}
            >
              {opt.icon}
            </span>
            <span className="flex-1 text-left">{opt.label}</span>
            {active && <Check className="w-3.5 h-3.5 flex-shrink-0" style={{ color: '#4C9AFF' }} />}
          </button>
        );
      })}
    </motion.div>
  );
}

function FloatingToolbar({
  containerRef,
  blocks,
  onBlockTransform,
}: {
  containerRef: React.RefObject<HTMLDivElement | null>;
  blocks: EditorJSBlock[];
  onBlockTransform?: (blockId: string, newType: string, newData: Record<string, unknown>, preserveText: string) => void;
}) {
  const [position, setPosition] = useState<{ top: number; left: number } | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());
  const [showTurnInto, setShowTurnInto] = useState(false);
  const [turnIntoFocusIdx, setTurnIntoFocusIdx] = useState(0);
  const [currentBlockId, setCurrentBlockId] = useState<string | null>(null);
  const toolbarRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const currentBlock = useMemo(() => {
    if (!currentBlockId) return null;
    return blocks.find(b => b.id === currentBlockId) || null;
  }, [currentBlockId, blocks]);

  const checkFormats = useCallback(() => {
    const formats = new Set<string>();
    if (document.queryCommandState('bold')) formats.add('bold');
    if (document.queryCommandState('italic')) formats.add('italic');
    if (document.queryCommandState('strikethrough')) formats.add('strikethrough');
    setActiveFormats(formats);
  }, []);

  const findBlockIdFromSelection = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount) return null;
    const range = selection.getRangeAt(0);
    const node = range.commonAncestorContainer;
    const el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement;
    if (!el) return null;
    const blockEl = el.closest('[data-block-id]');
    return blockEl?.getAttribute('data-block-id') || null;
  }, []);

  const handleSelectionChange = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed || !selection.rangeCount) {
        setIsVisible(false);
        setPosition(null);
        setShowTurnInto(false);
        return;
      }

      const container = containerRef.current;
      if (!container) return;

      const range = selection.getRangeAt(0);
      const ancestor = range.commonAncestorContainer;
      const ancestorEl = ancestor.nodeType === Node.TEXT_NODE ? ancestor.parentElement : ancestor as HTMLElement;
      if (!ancestorEl || !container.contains(ancestorEl)) {
        setIsVisible(false);
        setPosition(null);
        setShowTurnInto(false);
        return;
      }

      const closest = ancestorEl.closest('[contenteditable="true"]');
      if (!closest) {
        setIsVisible(false);
        setPosition(null);
        setShowTurnInto(false);
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        setIsVisible(false);
        setPosition(null);
        setShowTurnInto(false);
        return;
      }

      const blockId = findBlockIdFromSelection();
      setCurrentBlockId(blockId);

      const rect = range.getBoundingClientRect();
      const containerRect = container.getBoundingClientRect();

      const toolbarWidth = 260;
      let left = rect.left + rect.width / 2 - toolbarWidth / 2 - containerRect.left;
      left = Math.max(8, Math.min(left, containerRect.width - toolbarWidth - 8));

      setPosition({
        top: rect.top - containerRect.top + container.scrollTop - 48,
        left,
      });
      setIsVisible(true);
      checkFormats();
    }, 50);
  }, [containerRef, checkFormats, findBlockIdFromSelection]);

  useEffect(() => {
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [handleSelectionChange]);

  useEffect(() => {
    if (!showTurnInto) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setTurnIntoFocusIdx(prev => Math.min(prev + 1, TURN_INTO_OPTIONS.length - 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setTurnIntoFocusIdx(prev => Math.max(prev - 1, 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const opt = TURN_INTO_OPTIONS[turnIntoFocusIdx];
        if (opt && currentBlockId && onBlockTransform) {
          const block = blocks.find(b => b.id === currentBlockId);
          const text = block ? extractBlockText(block) : '';
          onBlockTransform(currentBlockId, opt.type, opt.data, text);
        }
        setShowTurnInto(false);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        e.stopPropagation();
        setShowTurnInto(false);
      }
    };
    document.addEventListener('keydown', handleKey, true);
    return () => document.removeEventListener('keydown', handleKey, true);
  }, [showTurnInto, turnIntoFocusIdx, currentBlockId, blocks, onBlockTransform]);

  const applyFormat = useCallback((command: string, value?: string) => {
    document.execCommand(command, false, value);
    checkFormats();

    const sel = window.getSelection();
    if (sel && !sel.isCollapsed) {
      handleSelectionChange();
    }
  }, [checkFormats, handleSelectionChange]);

  const handleLinkInsert = useCallback(() => {
    const url = prompt('URL do link:');
    if (url) {
      applyFormat('createLink', url);
    }
  }, [applyFormat]);

  const handleTurnIntoSelect = useCallback((opt: TurnIntoOption) => {
    if (!currentBlockId || !onBlockTransform) return;
    const block = blocks.find(b => b.id === currentBlockId);
    const text = block ? extractBlockText(block) : '';
    onBlockTransform(currentBlockId, opt.type, opt.data, text);
    setShowTurnInto(false);
  }, [currentBlockId, blocks, onBlockTransform]);

  if (!isVisible || !position) return null;

  const buttons = [
    { icon: <Type className="w-3.5 h-3.5" />, command: 'turnInto', label: 'Transformar', isTurnInto: true },
    null,
    { icon: <Bold className="w-3.5 h-3.5" />, command: 'bold', label: 'Negrito', active: activeFormats.has('bold') },
    { icon: <Italic className="w-3.5 h-3.5" />, command: 'italic', label: 'Itálico', active: activeFormats.has('italic') },
    { icon: <Strikethrough className="w-3.5 h-3.5" />, command: 'strikethrough', label: 'Tachado', active: activeFormats.has('strikethrough') },
    { icon: <Code className="w-3.5 h-3.5" />, command: 'code', label: 'Código', isCode: true },
    { icon: <Link2 className="w-3.5 h-3.5" />, command: 'link', label: 'Link', isLink: true },
  ];

  return (
    <motion.div
      ref={toolbarRef}
      initial={{ opacity: 0, y: 4, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.15, ease: [0.4, 0, 0.2, 1] }}
      className="absolute z-[60] flex items-center rounded-lg border px-1 py-1 gap-0"
      style={{
        top: position.top,
        left: position.left,
        background: '#1a1a2e',
        borderColor: '#2a2a4a',
        boxShadow: '0 8px 32px rgba(0,0,0,0.5), 0 2px 8px rgba(0,0,0,0.3)',
      }}
      onClick={(e) => e.stopPropagation()}
      onMouseDown={(e) => e.preventDefault()}
    >
      {buttons.map((btn, idx) => {
        if (btn === null) {
          return <div key={`sep-${idx}`} className="w-px h-5 mx-0.5" style={{ background: '#2a2a4a' }} />;
        }

        const handleClick = () => {
          if (btn.isTurnInto) {
            setShowTurnInto(prev => !prev);
            setTurnIntoFocusIdx(0);
            return;
          }
          if (btn.isLink) {
            handleLinkInsert();
          } else if (btn.isCode) {
            try {
              const sel = window.getSelection();
              if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
                const range = sel.getRangeAt(0);
                const code = document.createElement('code');
                code.style.cssText = 'background: rgba(135,131,120,0.15); padding: 2px 4px; border-radius: 3px; font-family: "SFMono-Regular", Menlo, monospace; font-size: 85%; color: #eb5757;';
                const fragment = range.extractContents();
                code.appendChild(fragment);
                range.insertNode(code);
                sel.removeAllRanges();
              }
            } catch { /* multi-node edge case */ }
          } else {
            applyFormat(btn.command);
          }
        };

        return (
          <div key={btn.command} className="relative">
            <button
              onClick={handleClick}
              className="flex items-center justify-center h-7 rounded-md transition-colors"
              style={{
                color: btn.active ? '#fff' : (btn.isTurnInto && showTurnInto) ? '#fff' : '#9ca3af',
                background: btn.active ? 'rgba(255,255,255,0.1)' : (btn.isTurnInto && showTurnInto) ? 'rgba(255,255,255,0.1)' : 'transparent',
                width: btn.isTurnInto ? '38px' : '28px',
                gap: '1px',
              }}
              title={btn.label}
              onMouseOver={(e) => {
                (e.currentTarget as HTMLElement).style.color = '#fff';
                (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.08)';
              }}
              onMouseOut={(e) => {
                const isActive = btn.active || (btn.isTurnInto && showTurnInto);
                (e.currentTarget as HTMLElement).style.color = isActive ? '#fff' : '#9ca3af';
                (e.currentTarget as HTMLElement).style.background = isActive ? 'rgba(255,255,255,0.1)' : 'transparent';
              }}
            >
              {btn.icon}
              {btn.isTurnInto && (
                <ChevronUp
                  className="w-3 h-3 transition-transform duration-150"
                  style={{
                    transform: showTurnInto ? 'rotate(0deg)' : 'rotate(180deg)',
                    color: '#6b7280',
                  }}
                />
              )}
            </button>
            {btn.isTurnInto && showTurnInto && currentBlock && (
              <TurnIntoMenu
                currentBlockType={currentBlock.type}
                currentBlockLevel={
                  currentBlock.type === 'header'
                    ? (currentBlock.data.level as number)
                    : undefined
                }
                currentBlockStyle={
                  currentBlock.type === 'list'
                    ? (currentBlock.data.style as string)
                    : undefined
                }
                onSelect={handleTurnIntoSelect}
                onClose={() => setShowTurnInto(false)}
                focusedIndex={turnIntoFocusIdx}
              />
            )}
          </div>
        );
      })}
    </motion.div>
  );
}

function extractBlockText(block: EditorJSBlock): string {
  if (block.type === 'header' || block.type === 'paragraph' || block.type === 'quote') {
    return ((block.data.text as string) || '').replace(/<[^>]*>/g, '');
  }
  if (block.type === 'list') {
    return ((block.data.items as string[]) || []).map(i => i.replace(/<[^>]*>/g, '')).join('\n');
  }
  if (block.type === 'todo') {
    return ((block.data.text as string) || '').replace(/<[^>]*>/g, '');
  }
  if (block.type === 'checklist') {
    return ((block.data.items as { text: string; checked: boolean }[]) || [])
      .map(i => i.text.replace(/<[^>]*>/g, ''))
      .join('\n');
  }
  return '';
}

const ANIMATION_DURATION = 150;

export function ArtifactViewModal({ artifact, isOpen, onClose }: ArtifactViewModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTOCId, setActiveTOCId] = useState('');
  const [blocks, setBlocks] = useState<EditorJSBlock[]>([]);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const animationTimerRef = useRef<NodeJS.Timeout | null>(null);
  const config = ARTIFACT_TYPE_CONFIGS[artifact.metadata.tipo];

  const editorData = useMemo(() => convertArtifactToEditorJS(artifact), [artifact]);

  useEffect(() => {
    setBlocks(editorData.blocks);
  }, [editorData]);

  const tocItems = useMemo(() => extractTOCFromBlocks(blocks), [blocks]);

  const blockIds = useMemo(
    () => blocks.map((b) => b.id),
    [blocks]
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      setBlocks((prev) => {
        const oldIndex = prev.findIndex((b) => b.id === active.id);
        const newIndex = prev.findIndex((b) => b.id === over.id);
        if (oldIndex === -1 || newIndex === -1) return prev;
        return arrayMove(prev, oldIndex, newIndex);
      });
    },
    []
  );

  const handleBlockUpdate = useCallback((blockId: string, newHtml: string) => {
    setBlocks((prev) =>
      prev.map((b) => (b.id === blockId ? { ...b, data: { ...b.data, text: newHtml } } : b))
    );
  }, []);

  const handleListItemUpdate = useCallback((blockId: string, itemIndex: number, newHtml: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'list') return b;
        const items = [...(b.data.items as string[])];
        items[itemIndex] = newHtml;
        return { ...b, data: { ...b.data, items } };
      })
    );
  }, []);

  const handleTableCellUpdate = useCallback((blockId: string, rowIndex: number, colIndex: number, newText: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'table') return b;
        const content = (b.data.content as string[][]).map((row) => [...row]);
        if (content[rowIndex]) {
          content[rowIndex][colIndex] = newText;
        }
        return { ...b, data: { ...b.data, content } };
      })
    );
  }, []);

  const handleBlockSelect = useCallback((blockId: string) => {
    setSelectedBlockId((prev) => (prev === blockId ? null : blockId));
  }, []);

  const handleBlockDeselect = useCallback(() => {
    setSelectedBlockId(null);
  }, []);

  const handleDuplicateBlock = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx === -1) return prev;
      const original = prev[idx];
      const duplicate: EditorJSBlock = {
        ...original,
        id: `${original.id}-copy-${Date.now()}`,
        data: { ...original.data },
      };
      const next = [...prev];
      next.splice(idx + 1, 0, duplicate);
      return next;
    });
    setSelectedBlockId(null);
  }, []);

  const handleDeleteBlock = useCallback((blockId: string) => {
    setBlocks((prev) => prev.filter((b) => b.id !== blockId));
    setSelectedBlockId(null);
  }, []);

  const handleMoveBlockUp = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx <= 0) return prev;
      return arrayMove(prev, idx, idx - 1);
    });
  }, []);

  const handleMoveBlockDown = useCallback((blockId: string) => {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === blockId);
      if (idx === -1 || idx >= prev.length - 1) return prev;
      return arrayMove(prev, idx, idx + 1);
    });
  }, []);

  const handleTodoToggle = useCallback((blockId: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'todo') return b;
        return { ...b, data: { ...b.data, checked: !(b.data.checked as boolean) } };
      })
    );
  }, []);

  const handleChecklistItemToggle = useCallback((blockId: string, itemIndex: number) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'checklist') return b;
        const items = [...(b.data.items as { text: string; checked: boolean }[])];
        items[itemIndex] = { ...items[itemIndex], checked: !items[itemIndex].checked };
        return { ...b, data: { ...b.data, items } };
      })
    );
  }, []);

  const handleChecklistItemUpdate = useCallback((blockId: string, itemIndex: number, newHtml: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId || b.type !== 'checklist') return b;
        const items = [...(b.data.items as { text: string; checked: boolean }[])];
        items[itemIndex] = { ...items[itemIndex], text: newHtml };
        return { ...b, data: { ...b.data, items } };
      })
    );
  }, []);

  const handleBlockTransform = useCallback((blockId: string, newType: string, newData: Record<string, unknown>, preserveText: string) => {
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id !== blockId) return b;
        const plainText = preserveText || ((b.data.text as string) || '').replace(/<[^>]*>/g, '');

        if (newType === 'header') {
          return { ...b, type: 'header', data: { text: plainText, level: newData.level } };
        }
        if (newType === 'paragraph') {
          return { ...b, type: 'paragraph', data: { text: plainText } };
        }
        if (newType === 'list') {
          const items = b.type === 'list'
            ? (b.data.items as string[])
            : [plainText];
          return { ...b, type: 'list', data: { style: newData.style, items } };
        }
        if (newType === 'checklist') {
          const lines = plainText.split('\n').filter(l => l.trim());
          const items = lines.length > 0
            ? lines.map(l => ({ text: l, checked: false }))
            : [{ text: plainText || '', checked: false }];
          return { ...b, type: 'checklist', data: { items } };
        }
        if (newType === 'quote') {
          return { ...b, type: 'quote', data: { text: plainText, caption: '' } };
        }
        return b;
      })
    );
  }, []);

  useEffect(() => {
    if (tocItems.length > 0 && !activeTOCId) {
      setActiveTOCId(tocItems[0].id);
    }
  }, [tocItems, activeTOCId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || tocItems.length === 0) return;

    let rafId: number | null = null;
    let lastUpdate = 0;

    const observer = new IntersectionObserver(
      (entries) => {
        const now = performance.now();
        if (now - lastUpdate < 16) {
          if (rafId) cancelAnimationFrame(rafId);
          rafId = requestAnimationFrame(() => processEntries(entries));
          return;
        }
        processEntries(entries);
      },
      {
        root: container,
        rootMargin: '-10% 0px -70% 0px',
        threshold: [0, 0.25, 0.5, 0.75, 1],
      }
    );

    const visibleMap = new Map<string, number>();

    function processEntries(entries: IntersectionObserverEntry[]) {
      lastUpdate = performance.now();
      for (const entry of entries) {
        const id = entry.target.getAttribute('id');
        if (!id) continue;
        if (entry.isIntersecting) {
          visibleMap.set(id, entry.intersectionRatio);
        } else {
          visibleMap.delete(id);
        }
      }

      let bestId = tocItems[0]?.id || '';
      let bestRatio = -1;
      for (const item of tocItems) {
        const ratio = visibleMap.get(item.id);
        if (ratio !== undefined && ratio > bestRatio) {
          bestRatio = ratio;
          bestId = item.id;
        }
      }

      if (!visibleMap.size) {
        const containerRect = container.getBoundingClientRect();
        let fallbackId = tocItems[0]?.id || '';
        for (const item of tocItems) {
          const el = container.querySelector(`[id="${CSS.escape(item.id)}"]`) as HTMLElement | null;
          if (el) {
            const rect = el.getBoundingClientRect();
            if (rect.top <= containerRect.top + 120) {
              fallbackId = item.id;
            }
          }
        }
        bestId = fallbackId;
      }

      setActiveTOCId(bestId);
    }

    for (const item of tocItems) {
      const el = container.querySelector(`[id="${CSS.escape(item.id)}"]`);
      if (el) observer.observe(el);
    }

    return () => {
      observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [tocItems]);

  const clearAnimationTimer = useCallback(() => {
    if (animationTimerRef.current) {
      clearTimeout(animationTimerRef.current);
      animationTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    clearAnimationTimer();

    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsAnimating(true);
        });
      });
    } else if (isVisible) {
      setIsAnimating(false);
      setSelectedBlockId(null);
      animationTimerRef.current = setTimeout(() => {
        setIsVisible(false);
      }, ANIMATION_DURATION);
    }

    return clearAnimationTimer;
  }, [isOpen, clearAnimationTimer]);

  useEffect(() => {
    if (isVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isVisible]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (selectedBlockId) {
          setSelectedBlockId(null);
        } else {
          onClose();
        }
      }
    };
    if (isVisible) {
      document.addEventListener('keydown', handleEsc);
    }
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isVisible, onClose, selectedBlockId]);

  const handleCopyAll = useCallback(async () => {
    try {
      const fullText = artifact.secoes
        .map((s) => `## ${s.titulo}\n\n${s.conteudo}`)
        .join('\n\n---\n\n');
      await navigator.clipboard.writeText(fullText);
      setCopiedSection('all');
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      console.warn('Falha ao copiar documento completo');
    }
  }, [artifact.secoes]);

  const handleNavigateToSection = useCallback((sectionId: string) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const el = container.querySelector(`[id="${CSS.escape(sectionId)}"]`) as HTMLElement | null;
    if (el) {
      const containerRect = container.getBoundingClientRect();
      const elRect = el.getBoundingClientRect();
      const targetTop = container.scrollTop + (elRect.top - containerRect.top) - 24;
      container.scrollTo({ top: Math.max(0, targetTop), behavior: 'smooth' });
      setActiveTOCId(sectionId);
    }
  }, []);

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0" style={{ zIndex: OVERLAY_CONFIG.zIndex }}>
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${isAnimating ? MODAL_COLORS.overlay.opacity : 0})`,
          backdropFilter: isAnimating ? `blur(${MODAL_COLORS.overlay.blur}px)` : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? `blur(${MODAL_COLORS.overlay.blur}px)` : 'blur(0px)',
          transition: `all ${OVERLAY_CONFIG.transition.duration}ms ${OVERLAY_CONFIG.transition.easing}`,
          pointerEvents: isAnimating ? 'auto' : 'none',
        }}
        onClick={onClose}
      />

      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="relative w-[96vw] max-w-[1000px] h-[92vh] max-h-[860px] rounded-2xl overflow-hidden flex flex-col pointer-events-auto"
          style={{
            transform: isAnimating ? 'scale(1)' : 'scale(0.96)',
            opacity: isAnimating ? 1 : 0,
            transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
            background: MODAL_COLORS.background,
            border: '1px solid #0c1334',
            boxShadow: '0 25px 80px -12px rgba(0, 0, 0, 0.6), 0 12px 40px -8px rgba(255, 107, 0, 0.08)',
            pointerEvents: isAnimating ? 'auto' : 'none',
          }}
          onClick={(e) => e.stopPropagation()}
        >
            <div
              className="flex items-center justify-between px-5 py-3.5 border-b"
              style={{
                background: MODAL_COLORS.header,
                borderColor: '#0c1334',
              }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                  style={{ background: `${config.cor}15` }}
                >
                  {config.icone}
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-200" style={FONT_STYLES.ui}>
                    {config.nome}
                  </h2>
                  <p className="text-[11px] text-slate-500 mt-0.5" style={FONT_STYLES.ui}>
                    {artifact.metadata.subtitulo
                      ? artifact.metadata.subtitulo
                      : `Última modificação: ${formatDate(artifact.metadata.geradoEm)}`}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleCopyAll}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                  title="Copiar tudo"
                >
                  {copiedSection === 'all' ? (
                    <Check className="w-4 h-4 text-green-400" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </button>
                <button
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                  title="Mais opções"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
                <div className="w-px h-5 mx-1" style={{ background: '#0c1334' }} />
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex flex-1 overflow-hidden relative">
              <div
                ref={scrollContainerRef}
                className="flex-1 overflow-y-auto relative"
                style={{ scrollBehavior: 'smooth' }}
                onClick={handleBlockDeselect}
              >
                <FloatingToolbar
                  containerRef={scrollContainerRef}
                  blocks={blocks}
                  onBlockTransform={handleBlockTransform}
                />

                <div className="max-w-[680px] mx-auto px-8 py-8 sm:px-12 sm:py-10 relative">
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1 }}
                    className="mb-8"
                  >
                    <h1
                      className="text-[2rem] font-bold leading-tight tracking-tight text-white mb-2"
                      style={FONT_STYLES.heading}
                    >
                      {artifact.metadata.titulo || config.nome}
                    </h1>
                    {artifact.metadata.subtitulo && (
                      <p
                        className="text-base text-slate-400 leading-relaxed"
                        style={FONT_STYLES.body}
                      >
                        {artifact.metadata.subtitulo}
                      </p>
                    )}
                    <div
                      className="flex items-center gap-4 mt-4 text-[11px] text-slate-500"
                      style={FONT_STYLES.ui}
                    >
                      <span>{artifact.secoes.length} seções</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span>{artifact.metadata.estatisticas?.palavras || '—'} palavras</span>
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span>{formatDate(artifact.metadata.geradoEm)}</span>
                    </div>
                  </motion.div>

                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={blockIds}
                      strategy={verticalListSortingStrategy}
                    >
                      {blocks.map((block, idx) => (
                        <SortableBlock
                          key={block.id}
                          block={block}
                          index={idx}
                          accentColor={config.cor}
                          isSelected={selectedBlockId === block.id}
                          onBlockUpdate={handleBlockUpdate}
                          onListItemUpdate={handleListItemUpdate}
                          onTableCellUpdate={handleTableCellUpdate}
                          onBlockSelect={handleBlockSelect}
                          onDuplicate={handleDuplicateBlock}
                          onDelete={handleDeleteBlock}
                          onMoveUp={handleMoveBlockUp}
                          onMoveDown={handleMoveBlockDown}
                          onTodoToggle={handleTodoToggle}
                          onChecklistItemToggle={handleChecklistItemToggle}
                          onChecklistItemUpdate={handleChecklistItemUpdate}
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <div className="h-16" />
                </div>
              </div>

              {tocItems.length > 0 && (
                <div
                  className="absolute z-10 hidden lg:flex items-center"
                  style={{
                    right: '6px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                  }}
                >
                  <BlockOutline
                    items={tocItems}
                    activeId={activeTOCId}
                    onNavigate={handleNavigateToSection}
                    accentColor={config.cor}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
  );
}

export default ArtifactViewModal;
