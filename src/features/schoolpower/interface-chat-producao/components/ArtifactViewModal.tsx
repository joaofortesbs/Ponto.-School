import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, Check, FileText, Clock, Hash, Tag, ChevronRight } from 'lucide-react';
import type { ArtifactData, ArtifactSection } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { ARTIFACT_TYPE_CONFIGS } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

interface ArtifactViewModalProps {
  artifact: ArtifactData;
  isOpen: boolean;
  onClose: () => void;
}

export function ArtifactViewModal({ artifact, isOpen, onClose }: ArtifactViewModalProps) {
  const [activeSection, setActiveSection] = useState(0);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);
  const config = ARTIFACT_TYPE_CONFIGS[artifact.metadata.tipo];
  const stats = artifact.metadata.estatisticas;

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

  const handleCopySection = useCallback(async (section: ArtifactSection) => {
    try {
      await navigator.clipboard.writeText(section.conteudo);
      setCopiedSection(section.id);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch {
      console.warn('Falha ao copiar para clipboard');
    }
  }, []);

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

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatTime = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const currentSection = artifact.secoes[activeSection];

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
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-[95vw] max-w-[1100px] h-[90vh] max-h-[800px] rounded-2xl overflow-hidden flex flex-col"
          style={{
            background: 'rgba(15, 23, 42, 0.95)',
            backdropFilter: 'blur(30px)',
            WebkitBackdropFilter: 'blur(30px)',
            border: `1px solid ${config.cor}30`,
            boxShadow: `0 25px 60px rgba(0,0,0,0.5), 0 0 40px ${config.cor}10`,
          }}
        >
          <div 
            className="flex items-center justify-between px-6 py-4 border-b"
            style={{ borderColor: `${config.cor}20` }}
          >
            <div className="flex items-center gap-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                style={{ background: `${config.cor}20`, border: `1px solid ${config.cor}30` }}
              >
                {config.icone}
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-100">
                  {config.nome}
                </h2>
                {artifact.metadata.subtitulo && (
                  <p className="text-xs text-slate-400 mt-0.5 max-w-[400px] truncate">
                    {artifact.metadata.subtitulo}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyAll}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 hover:bg-slate-700/50"
                style={{ color: config.cor }}
              >
                {copiedSection === 'all' ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Copiado!
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    Copiar tudo
                  </>
                )}
              </button>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden">
            <div className="w-[220px] flex-shrink-0 border-r border-slate-700/50 overflow-y-auto py-3 px-2">
              {artifact.secoes.map((section, idx) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(idx)}
                  className={`w-full text-left px-3 py-2.5 rounded-xl mb-1 transition-all duration-200 group flex items-center gap-2 ${
                    activeSection === idx
                      ? 'text-white'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`}
                  style={activeSection === idx ? {
                    background: `${config.cor}15`,
                    border: `1px solid ${config.cor}25`,
                  } : { border: '1px solid transparent' }}
                >
                  <span 
                    className="w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-bold flex-shrink-0"
                    style={activeSection === idx 
                      ? { background: `${config.cor}30`, color: config.cor }
                      : { background: 'rgba(100,116,139,0.2)', color: 'rgb(148,163,184)' }
                    }
                  >
                    {idx + 1}
                  </span>
                  <span className="text-xs font-medium truncate">
                    {section.titulo}
                  </span>
                  {activeSection === idx && (
                    <ChevronRight 
                      className="w-3 h-3 ml-auto flex-shrink-0" 
                      style={{ color: config.cor }}
                    />
                  )}
                </button>
              ))}

              <div className="mt-4 pt-3 mx-2 border-t border-slate-700/50 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Hash className="w-3 h-3" />
                  <span>{artifact.secoes.length} seções</span>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <FileText className="w-3 h-3" />
                  <span>{stats?.palavras || '—'} palavras</span>
                </div>
                {stats?.tempoGeracao && stats.tempoGeracao > 0 && (
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                    <Clock className="w-3 h-3" />
                    <span>{formatTime(stats.tempoGeracao)}</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5 text-[10px] text-slate-500">
                  <Tag className="w-3 h-3" />
                  <span>{formatDate(artifact.metadata.geradoEm)}</span>
                </div>
              </div>

              {artifact.metadata.tags.length > 0 && (
                <div className="mt-3 px-2 flex flex-wrap gap-1">
                  {artifact.metadata.tags.map((tag) => (
                    <span 
                      key={tag}
                      className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-800/80 text-slate-400"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {currentSection && (
                  <motion.div
                    key={currentSection.id}
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="p-6"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h3 
                        className="text-lg font-bold"
                        style={{ color: config.cor }}
                      >
                        {currentSection.titulo}
                      </h3>
                      <button
                        onClick={() => handleCopySection(currentSection)}
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-700/50 transition-all"
                      >
                        {copiedSection === currentSection.id ? (
                          <>
                            <Check className="w-3 h-3 text-green-400" />
                            <span className="text-green-400">Copiado!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3 h-3" />
                            <span>Copiar seção</span>
                          </>
                        )}
                      </button>
                    </div>

                    <div className="prose prose-invert prose-sm max-w-none">
                      {currentSection.conteudo.split('\n').map((paragraph, pIdx) => {
                        const trimmed = paragraph.trim();
                        if (!trimmed) return <div key={pIdx} className="h-3" />;
                        
                        if (trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
                          return (
                            <div key={pIdx} className="flex items-start gap-2 py-0.5 text-slate-300 text-sm leading-relaxed">
                              <span style={{ color: config.cor }} className="mt-1.5 text-xs">●</span>
                              <span>{trimmed.replace(/^[-•]\s*/, '')}</span>
                            </div>
                          );
                        }
                        
                        if (/^\d+[.)]\s/.test(trimmed)) {
                          const numMatch = trimmed.match(/^(\d+)[.)]\s*(.*)/);
                          return (
                            <div key={pIdx} className="flex items-start gap-2 py-0.5 text-slate-300 text-sm leading-relaxed">
                              <span 
                                className="font-bold text-xs mt-0.5 min-w-[16px]"
                                style={{ color: config.cor }}
                              >
                                {numMatch?.[1]}.
                              </span>
                              <span>{numMatch?.[2] || trimmed}</span>
                            </div>
                          );
                        }
                        
                        if (trimmed.startsWith('### ')) {
                          return (
                            <h4 key={pIdx} className="text-sm font-bold text-slate-200 mt-4 mb-2">
                              {trimmed.replace('### ', '')}
                            </h4>
                          );
                        }
                        
                        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                          return (
                            <p key={pIdx} className="text-sm font-semibold text-slate-200 mt-3 mb-1">
                              {trimmed.replace(/\*\*/g, '')}
                            </p>
                          );
                        }
                        
                        return (
                          <p key={pIdx} className="text-sm text-slate-300 leading-relaxed mb-2">
                            {trimmed}
                          </p>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div 
            className="px-6 py-3 border-t flex items-center justify-between text-[10px] text-slate-500"
            style={{ borderColor: `${config.cor}15` }}
          >
            <div className="flex items-center gap-1">
              <span>Gerado por</span>
              <span className="font-bold text-slate-400">Agente Jota</span>
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
