import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, Copy, Check, Download, MoreHorizontal, GripVertical, Trash2, CopyPlus, ArrowUp, ArrowDown } from 'lucide-react';
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
  overlay: { opacity: 0.6, blur: 4 },
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
          className="mb-4 rounded-lg px-5 py-4"
          style={{
            borderLeft: `3px solid ${accentColor}`,
            background: `${accentColor}08`,
          }}
        >
          <EditableContent
            html={text}
            className="text-[14px] leading-[1.7] text-slate-300 italic"
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

function InlineTOC({
  items,
  activeId,
  onNavigate,
  accentColor,
}: {
  items: TOCItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  accentColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="flex flex-col items-end gap-[6px]">
      {items.map((item) => {
        const isActive = activeId === item.id;
        return (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className="transition-all duration-300 rounded-full hover:opacity-100"
            style={{
              width: isActive ? '32px' : '20px',
              height: '3px',
              background: isActive ? accentColor : 'rgba(100, 116, 139, 0.4)',
              opacity: isActive ? 1 : 0.7,
            }}
            title={item.text}
          />
        );
      })}
    </div>
  );
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

  useEffect(() => {
    if (tocItems.length > 0 && !activeTOCId) {
      setActiveTOCId(tocItems[0].id);
    }
  }, [tocItems, activeTOCId]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || tocItems.length === 0) return;

    const handleScroll = () => {
      const containerRect = container.getBoundingClientRect();
      let currentActive = tocItems[0]?.id || '';

      for (const item of tocItems) {
        const el = container.querySelector(`[id="${CSS.escape(item.id)}"]`) as HTMLElement | null;
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= containerRect.top + 120) {
            currentActive = item.id;
          }
        }
      }
      setActiveTOCId(currentActive);
    };

    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
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
      const elTop = el.offsetTop - container.offsetTop;
      container.scrollTo({ top: elTop - 20, behavior: 'smooth' });
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
    <div className="fixed inset-0 z-[2000]">
      <div
        className="absolute inset-0"
        style={{
          backgroundColor: `rgba(0, 0, 0, ${isAnimating ? MODAL_COLORS.overlay.opacity : 0})`,
          backdropFilter: isAnimating ? `blur(${MODAL_COLORS.overlay.blur}px)` : 'blur(0px)',
          WebkitBackdropFilter: isAnimating ? `blur(${MODAL_COLORS.overlay.blur}px)` : 'blur(0px)',
          transition: `all ${ANIMATION_DURATION}ms cubic-bezier(0.4, 0, 0.2, 1)`,
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
                className="flex-1 overflow-y-auto"
                style={{ scrollBehavior: 'smooth' }}
                onClick={handleBlockDeselect}
              >
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
                        />
                      ))}
                    </SortableContext>
                  </DndContext>

                  <div className="h-16" />
                </div>
              </div>

              {tocItems.length > 0 && (
                <div className="absolute right-4 top-1/2 -translate-y-1/2 z-10">
                  <InlineTOC
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
