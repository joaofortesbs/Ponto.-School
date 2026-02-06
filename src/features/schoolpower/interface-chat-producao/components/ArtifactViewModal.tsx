import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, Download, MoreHorizontal } from 'lucide-react';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { ARTIFACT_TYPE_CONFIGS } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { convertArtifactToEditorJS, extractTOCFromBlocks } from './artifact-editorjs-converter';
import type { EditorJSBlock, TOCItem } from './artifact-editorjs-converter';

interface ArtifactViewModalProps {
  artifact: ArtifactData;
  isOpen: boolean;
  onClose: () => void;
}

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

function EditorBlock({ block, index, accentColor, onBlockUpdate }: { block: EditorJSBlock; index: number; accentColor: string; onBlockUpdate?: (blockId: string, newText: string) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleStartEdit = useCallback((htmlText: string) => {
    setEditText(htmlText);
    setIsEditing(true);
  }, []);

  const handleFinishEdit = useCallback(() => {
    setIsEditing(false);
    if (block.id && onBlockUpdate && editText.trim()) {
      onBlockUpdate(block.id, editText);
    }
  }, [block.id, onBlockUpdate, editText]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [isEditing]);

  if (block.type === 'header') {
    const level = block.data.level as number;
    const text = block.data.text as string;
    const isSectionHeader = block.id?.startsWith('section-');

    if (level === 1 || (level === 2 && isSectionHeader)) {
      return (
        <motion.div
          custom={index}
          variants={blockAnimVariants}
          initial="hidden"
          animate="visible"
          id={block.id}
          className="mt-10 mb-4 first:mt-0"
        >
          <h2
            className="text-[1.65rem] font-bold leading-tight tracking-tight cursor-text"
            style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#e2e8f0' }}
            onClick={() => handleStartEdit(text)}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => {
                  setEditText(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = e.target.scrollHeight + 'px';
                }}
                onBlur={handleFinishEdit}
                className="w-full bg-transparent border-none outline-none resize-none text-[1.65rem] font-bold leading-tight tracking-tight"
                style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#e2e8f0' }}
              />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: text }} />
            )}
          </h2>
          <div className="mt-2 h-[1px]" style={{ background: `linear-gradient(to right, ${accentColor}40, transparent)` }} />
        </motion.div>
      );
    }

    if (level === 2) {
      return (
        <motion.div
          custom={index}
          variants={blockAnimVariants}
          initial="hidden"
          animate="visible"
          id={block.id}
          className="mt-8 mb-3"
        >
          <div
            onClick={() => handleStartEdit(text)}
            className="cursor-text text-[1.3rem] font-semibold leading-snug tracking-tight"
            style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#cbd5e1' }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => { setEditText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                onBlur={handleFinishEdit}
                className="w-full bg-transparent border-none outline-none resize-none text-[1.3rem] font-semibold leading-snug tracking-tight"
                style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#cbd5e1' }}
              />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: text }} />
            )}
          </div>
        </motion.div>
      );
    }

    if (level === 3) {
      return (
        <motion.div
          custom={index}
          variants={blockAnimVariants}
          initial="hidden"
          animate="visible"
          className="mt-6 mb-2"
        >
          <div
            onClick={() => handleStartEdit(text)}
            className="cursor-text text-base font-semibold leading-snug"
            style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#94a3b8' }}
          >
            {isEditing ? (
              <textarea
                ref={textareaRef}
                value={editText}
                onChange={(e) => { setEditText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
                onBlur={handleFinishEdit}
                className="w-full bg-transparent border-none outline-none resize-none text-base font-semibold leading-snug"
                style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif", color: '#94a3b8' }}
              />
            ) : (
              <span dangerouslySetInnerHTML={{ __html: text }} />
            )}
          </div>
        </motion.div>
      );
    }
  }

  if (block.type === 'paragraph') {
    const text = block.data.text as string;
    return (
      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
        className="mb-3"
      >
        <div
          onClick={() => handleStartEdit(text)}
          className="cursor-text text-[15px] leading-[1.8] text-slate-300"
          style={{ fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif" }}
        >
          {isEditing ? (
            <textarea
              ref={textareaRef}
              value={editText}
              onChange={(e) => { setEditText(e.target.value); e.target.style.height = 'auto'; e.target.style.height = e.target.scrollHeight + 'px'; }}
              onBlur={handleFinishEdit}
              className="w-full bg-transparent border-none outline-none resize-none text-[15px] leading-[1.8] text-slate-300"
              style={{ fontFamily: "'Georgia', 'Palatino Linotype', 'Book Antiqua', serif" }}
            />
          ) : (
            <span dangerouslySetInnerHTML={{ __html: text }} />
          )}
        </div>
      </motion.div>
    );
  }

  if (block.type === 'list') {
    const items = block.data.items as string[];
    const isOrdered = block.data.style === 'ordered';

    return (
      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
        className="mb-4 pl-1"
      >
        {isOrdered ? (
          <ol className="space-y-1.5">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[15px] leading-[1.7] text-slate-300" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
                <span className="font-semibold text-sm mt-0.5 min-w-[20px] text-right" style={{ fontFamily: "'Inter', sans-serif", color: accentColor }}>
                  {idx + 1}.
                </span>
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ol>
        ) : (
          <ul className="space-y-1.5">
            {items.map((item, idx) => (
              <li key={idx} className="flex items-start gap-3 text-[15px] leading-[1.7] text-slate-300" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
                <span className="mt-2 w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: accentColor }} />
                <span dangerouslySetInnerHTML={{ __html: item }} />
              </li>
            ))}
          </ul>
        )}
      </motion.div>
    );
  }

  if (block.type === 'quote') {
    const text = block.data.text as string;
    return (
      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
        className="mb-4 rounded-lg px-5 py-4"
        style={{
          borderLeft: `3px solid ${accentColor}`,
          background: `${accentColor}08`,
        }}
      >
        <p className="text-[14px] leading-[1.7] text-slate-300 italic" style={{ fontFamily: "'Georgia', 'Palatino Linotype', serif" }}>
          {text}
        </p>
      </motion.div>
    );
  }

  if (block.type === 'delimiter') {
    return (
      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
        className="my-8 flex items-center justify-center gap-2"
      >
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span className="w-1 h-1 rounded-full bg-slate-600" />
        <span className="w-1 h-1 rounded-full bg-slate-600" />
      </motion.div>
    );
  }

  if (block.type === 'table') {
    const content = block.data.content as string[][];
    return (
      <motion.div
        custom={index}
        variants={blockAnimVariants}
        initial="hidden"
        animate="visible"
        className="mb-4 overflow-x-auto rounded-lg border border-slate-700/50"
      >
        <table className="w-full text-sm text-slate-300" style={{ fontFamily: "'Inter', sans-serif" }}>
          <tbody>
            {content.map((row, rIdx) => (
              <tr key={rIdx} className={rIdx === 0 ? 'bg-slate-800/60' : 'bg-slate-800/20'}>
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className={`px-4 py-2.5 border-b border-slate-700/30 ${rIdx === 0 ? 'font-semibold text-slate-200' : ''}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </motion.div>
    );
  }

  return null;
}

function RightTOC({ items, activeId, onNavigate, accentColor }: {
  items: TOCItem[];
  activeId: string;
  onNavigate: (id: string) => void;
  accentColor: string;
}) {
  if (items.length === 0) return null;

  return (
    <div className="w-[180px] flex-shrink-0 py-6 pr-4 pl-2 overflow-y-auto hidden lg:block">
      <div className="sticky top-6">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3" style={{ fontFamily: "'Inter', sans-serif" }}>
          Sumário
        </p>
        <nav className="space-y-0.5">
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`block w-full text-left py-1.5 transition-all duration-200 text-[11px] leading-tight truncate ${
                activeId === item.id
                  ? 'font-medium'
                  : 'text-slate-500 hover:text-slate-300'
              }`}
              style={{
                paddingLeft: item.level === 2 && !item.sectionId.startsWith('section-') ? '12px' : '0px',
                color: activeId === item.id ? accentColor : undefined,
                borderLeft: activeId === item.id ? `2px solid ${accentColor}` : '2px solid transparent',
                fontFamily: "'Inter', sans-serif",
              }}
            >
              {item.text}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}

export function ArtifactViewModal({ artifact, isOpen, onClose }: ArtifactViewModalProps) {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const [activeTOCId, setActiveTOCId] = useState('');
  const [blocks, setBlocks] = useState<EditorJSBlock[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const config = ARTIFACT_TYPE_CONFIGS[artifact.metadata.tipo];

  const editorData = useMemo(() => convertArtifactToEditorJS(artifact), [artifact]);

  useEffect(() => {
    setBlocks(editorData.blocks);
  }, [editorData]);

  const tocItems = useMemo(() => extractTOCFromBlocks(blocks), [blocks]);

  const handleBlockUpdate = useCallback((blockId: string, newText: string) => {
    setBlocks(prev => prev.map(b =>
      b.id === blockId ? { ...b, data: { ...b.data, text: newText } } : b
    ));
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEsc);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  const handleCopyAll = useCallback(async () => {
    try {
      const fullText = artifact.secoes
        .map(s => `## ${s.titulo}\n\n${s.conteudo}`)
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

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-[2000] flex items-center justify-center"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 16 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[96vw] max-w-[1000px] h-[92vh] max-h-[860px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: '#0f1419',
            border: '1px solid rgba(56, 68, 90, 0.4)',
            boxShadow: '0 25px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.03)',
          }}
        >
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-700/40">
            <div className="flex items-center gap-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-base"
                style={{ background: `${config.cor}15` }}
              >
                {config.icone}
              </div>
              <div>
                <h2 className="text-sm font-semibold text-slate-200" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {config.nome}
                </h2>
                <p className="text-[11px] text-slate-500 mt-0.5" style={{ fontFamily: "'Inter', sans-serif" }}>
                  {artifact.metadata.subtitulo
                    ? artifact.metadata.subtitulo
                    : `Última modificação: ${formatDate(artifact.metadata.geradoEm)}`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                onClick={handleCopyAll}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
                title="Copiar tudo"
              >
                {copiedSection === 'all' ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
              </button>
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
                title="Download"
              >
                <Download className="w-4 h-4" />
              </button>
              <button
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
                title="Mais opções"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              <div className="w-px h-5 bg-slate-700/50 mx-1" />
              <button
                onClick={onClose}
                className="p-2 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-700/40 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div
              ref={scrollContainerRef}
              className="flex-1 overflow-y-auto"
              style={{
                scrollBehavior: 'smooth',
              }}
            >
              <div className="max-w-[680px] mx-auto px-8 py-8 sm:px-12 sm:py-10">
                <motion.div
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                  className="mb-8"
                >
                  <h1
                    className="text-[2rem] font-bold leading-tight tracking-tight text-white mb-2"
                    style={{ fontFamily: "'Inter', 'SF Pro Display', sans-serif" }}
                  >
                    {artifact.metadata.titulo || config.nome}
                  </h1>
                  {artifact.metadata.subtitulo && (
                    <p
                      className="text-base text-slate-400 leading-relaxed"
                      style={{ fontFamily: "'Georgia', serif" }}
                    >
                      {artifact.metadata.subtitulo}
                    </p>
                  )}
                  <div className="flex items-center gap-4 mt-4 text-[11px] text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
                    <span>{artifact.secoes.length} seções</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{artifact.metadata.estatisticas?.palavras || '—'} palavras</span>
                    <span className="w-1 h-1 rounded-full bg-slate-600" />
                    <span>{formatDate(artifact.metadata.geradoEm)}</span>
                  </div>
                  <div className="mt-5 h-[1px] bg-slate-700/50" />
                </motion.div>

                {blocks.map((block, idx) => (
                  <EditorBlock
                    key={block.id || idx}
                    block={block}
                    index={idx}
                    accentColor={config.cor}
                    onBlockUpdate={handleBlockUpdate}
                  />
                ))}

                <div className="h-16" />
              </div>
            </div>

            <RightTOC
              items={tocItems}
              activeId={activeTOCId}
              onNavigate={handleNavigateToSection}
              accentColor={config.cor}
            />
          </div>

          <div className="px-5 py-2.5 border-t border-slate-700/30 flex items-center justify-between text-[10px] text-slate-500" style={{ fontFamily: "'Inter', sans-serif" }}>
            <div className="flex items-center gap-1">
              <span>Gerado por</span>
              <span className="font-semibold text-slate-400">Agente Jota</span>
              <span>•</span>
              <span>Ponto School</span>
            </div>
            <div>
              v{artifact.metadata.versao} • {artifact.id}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ArtifactViewModal;
