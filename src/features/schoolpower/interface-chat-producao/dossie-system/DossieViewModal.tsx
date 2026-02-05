import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, FileText, Clock, BookOpen, Copy, Check, ChevronDown, ChevronUp,
  Sparkles, Target, MessageCircle, Users, Briefcase, Download, MapPin
} from 'lucide-react';
import { useDossieStore } from './DossieStore';
import type { DossieData, RoadmapItem } from './types';

interface DossieViewModalProps {
  dossieData?: DossieData;
  isOpen?: boolean;
  onClose?: () => void;
}

export function DossieViewModal({ dossieData, isOpen: externalOpen, onClose: externalClose }: DossieViewModalProps) {
  const { dossie: storeDossie, isViewerOpen, setViewerOpen } = useDossieStore();
  const dossie = dossieData || storeDossie;
  const isOpen = externalOpen !== undefined ? externalOpen : isViewerOpen;
  const handleClose = externalClose || (() => setViewerOpen(false));

  const [activeTab, setActiveTab] = useState<'resumo' | 'roadmap' | 'ganchos' | 'pais' | 'coordenacao'>('resumo');
  const [copiedField, setCopiedField] = useState<string | null>(null);

  if (!isOpen || !dossie) return null;

  const content = dossie.content;

  const handleCopy = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopiedField(field);
      setTimeout(() => setCopiedField(null), 2000);
    }
  };

  const tabs = [
    { id: 'resumo' as const, label: 'Resumo', icon: FileText },
    { id: 'roadmap' as const, label: 'Roadmap', icon: MapPin },
    { id: 'ganchos' as const, label: 'Ganchos', icon: Target },
    { id: 'pais' as const, label: 'Pais', icon: MessageCircle },
    { id: 'coordenacao' as const, label: 'Coordenação', icon: Briefcase },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
        onClick={handleClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 30 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-[700px] max-h-[85vh] overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f0f23]/95 via-[#1a1a2e]/95 to-[#16213e]/95 backdrop-blur-xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative p-6 pb-4 border-b border-white/5">
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-blue-500/10" />
            <div className="relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-white font-bold text-lg">{dossie.titulo || 'Dossiê de Sessão'}</h2>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30">
                        <Sparkles className="w-3 h-3 text-orange-400" />
                        <span className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">Ponto. Flow</span>
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-1">
                      {dossie.materia && (
                        <span className="text-white/40 text-xs">{dossie.materia}</span>
                      )}
                      {content.estatisticas.total_atividades > 0 && (
                        <div className="flex items-center gap-1 text-white/40">
                          <BookOpen className="w-3 h-3" />
                          <span className="text-xs">{content.estatisticas.total_atividades} atividade{content.estatisticas.total_atividades !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-white/40">
                        <Clock className="w-3 h-3" />
                        <span className="text-xs">{content.estatisticas.tempo_estimado_aula}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <button onClick={handleClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors">
                  <X className="w-4 h-4 text-white/60" />
                </button>
              </div>
            </div>
          </div>

          <div className="flex gap-1 px-4 pt-3 pb-0 overflow-x-auto scrollbar-hide">
            {tabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all duration-200
                    ${isActive
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                      : 'text-white/40 hover:text-white/60 hover:bg-white/5 border border-transparent'
                    }
                  `}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          <div className="p-5 overflow-y-auto max-h-[calc(85vh-200px)] custom-scrollbar">
            {activeTab === 'resumo' && (
              <ResumoTab content={content} onCopy={handleCopy} copiedField={copiedField} />
            )}
            {activeTab === 'roadmap' && (
              <RoadmapTab roadmap={content.roadmap_aplicacao} />
            )}
            {activeTab === 'ganchos' && (
              <GanchosTab ganchos={content.ganchos_atencao} onCopy={handleCopy} copiedField={copiedField} />
            )}
            {activeTab === 'pais' && (
              <PilulaPaisTab texto={content.pilula_pais} onCopy={handleCopy} copiedField={copiedField} />
            )}
            {activeTab === 'coordenacao' && (
              <CoordenacaoTab texto={content.resumo_coordenacao} estrategia={content.estrategia_pedagogica} onCopy={handleCopy} copiedField={copiedField} />
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function CopyButton({ text, field, copiedField, onCopy }: { text: string; field: string; copiedField: string | null; onCopy: (t: string, f: string) => void }) {
  const isCopied = copiedField === field;
  return (
    <button
      onClick={() => onCopy(text, field)}
      className={`
        flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200
        ${isCopied
          ? 'bg-green-500/20 text-green-400 border border-green-500/30'
          : 'bg-white/5 text-white/50 hover:bg-white/10 hover:text-white/70 border border-white/10'
        }
      `}
    >
      {isCopied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
      {isCopied ? 'Copiado!' : 'Copiar'}
    </button>
  );
}

function ResumoTab({ content, onCopy, copiedField }: { content: any; onCopy: (t: string, f: string) => void; copiedField: string | null }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Resumo Executivo</h3>
          <CopyButton text={content.resumo_executivo} field="resumo" copiedField={copiedField} onCopy={onCopy} />
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{content.resumo_executivo}</p>
        </div>
      </div>

      {content.atividades_criadas && content.atividades_criadas.length > 0 && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Atividades Criadas</h3>
          <div className="space-y-2">
            {content.atividades_criadas.map((activity: any, idx: number) => (
              <div key={activity.id || idx} className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/5">
                <div className="w-8 h-8 rounded-lg bg-orange-500/20 flex items-center justify-center flex-shrink-0">
                  <span className="text-orange-400 text-xs font-bold">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-sm font-medium truncate">{activity.titulo}</p>
                  <p className="text-white/40 text-xs">{formatActivityType(activity.tipo)}</p>
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                  activity.status === 'salva_bd' ? 'bg-green-500/20 text-green-400' :
                  activity.status === 'conteudo_gerado' ? 'bg-blue-500/20 text-blue-400' :
                  'bg-white/10 text-white/50'
                }`}>
                  {activity.status === 'salva_bd' ? 'Salva' : activity.status === 'conteudo_gerado' ? 'Gerada' : 'Criada'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {content.estatisticas && (
        <div>
          <h3 className="text-white font-semibold text-sm mb-3">Estatísticas</h3>
          <div className="grid grid-cols-2 gap-2">
            <StatCard label="Atividades" value={String(content.estatisticas.total_atividades)} />
            <StatCard label="Tempo Estimado" value={content.estatisticas.tempo_estimado_aula} />
            <StatCard label="Capabilities" value={String(content.estatisticas.capabilities_executadas)} />
            <StatCard label="Processamento" value={content.estatisticas.tempo_processamento} />
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-3 rounded-xl bg-white/5 border border-white/5">
      <p className="text-white/40 text-[10px] uppercase tracking-wider mb-1">{label}</p>
      <p className="text-white font-semibold text-sm">{value}</p>
    </div>
  );
}

function RoadmapTab({ roadmap }: { roadmap: RoadmapItem[] }) {
  return (
    <div className="space-y-1">
      <h3 className="text-white font-semibold text-sm mb-4">Roteiro de Aplicação</h3>
      <div className="relative">
        <div className="absolute left-[22px] top-6 bottom-6 w-px bg-gradient-to-b from-orange-500/50 via-blue-500/30 to-transparent" />
        <div className="space-y-4">
          {roadmap.map((item, idx) => (
            <div key={item.ordem} className="relative flex gap-4">
              <div className="relative z-10 flex-shrink-0">
                <div className={`
                  w-11 h-11 rounded-full flex items-center justify-center text-xs font-bold
                  ${idx === 0 ? 'bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg shadow-orange-500/30' :
                    idx === roadmap.length - 1 ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white' :
                    'bg-white/10 text-white/70 border border-white/10'
                  }
                `}>
                  {item.ordem}
                </div>
              </div>
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-orange-400/80 text-xs font-mono">{item.tempo}</span>
                </div>
                <h4 className="text-white font-medium text-sm mb-1">{item.titulo}</h4>
                <p className="text-white/50 text-xs leading-relaxed">{item.descricao}</p>
                {item.dicas && item.dicas.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {item.dicas.map((dica, dIdx) => (
                      <div key={dIdx} className="flex items-start gap-1.5">
                        <span className="text-orange-400 text-[10px] mt-0.5">*</span>
                        <span className="text-white/40 text-[11px]">{dica}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function GanchosTab({ ganchos, onCopy, copiedField }: { ganchos: string[]; onCopy: (t: string, f: string) => void; copiedField: string | null }) {
  const allGanchos = ganchos.join('\n\n');
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-white font-semibold text-sm">Ganchos de Atenção</h3>
        <CopyButton text={allGanchos} field="ganchos" copiedField={copiedField} onCopy={onCopy} />
      </div>
      <p className="text-white/40 text-xs">Frases e estratégias para capturar a atenção dos alunos durante a aula.</p>
      <div className="space-y-3">
        {ganchos.map((gancho, idx) => (
          <div key={idx} className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5 group">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 flex items-center justify-center flex-shrink-0">
              <Target className="w-3.5 h-3.5 text-yellow-400" />
            </div>
            <p className="text-white/70 text-sm leading-relaxed flex-1">{gancho}</p>
            <button
              onClick={() => onCopy(gancho, `gancho-${idx}`)}
              className="opacity-0 group-hover:opacity-100 transition-opacity self-start"
            >
              {copiedField === `gancho-${idx}` ? (
                <Check className="w-3.5 h-3.5 text-green-400" />
              ) : (
                <Copy className="w-3.5 h-3.5 text-white/30 hover:text-white/60" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

function PilulaPaisTab({ texto, onCopy, copiedField }: { texto: string; onCopy: (t: string, f: string) => void; copiedField: string | null }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-white font-semibold text-sm">Mensagem para Pais</h3>
          <p className="text-white/40 text-xs mt-1">Texto pronto para enviar no WhatsApp dos pais.</p>
        </div>
        <CopyButton text={texto} field="pais" copiedField={copiedField} onCopy={onCopy} />
      </div>
      <div className="p-4 rounded-xl bg-gradient-to-br from-green-500/5 to-green-500/10 border border-green-500/20">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center">
            <MessageCircle className="w-3.5 h-3.5 text-white" />
          </div>
          <span className="text-green-400 text-xs font-medium">WhatsApp</span>
        </div>
        <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{texto}</p>
      </div>
    </div>
  );
}

function CoordenacaoTab({ texto, estrategia, onCopy, copiedField }: { texto: string; estrategia: string; onCopy: (t: string, f: string) => void; copiedField: string | null }) {
  return (
    <div className="space-y-5">
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-white font-semibold text-sm">Resumo para Coordenação</h3>
          <CopyButton text={texto} field="coordenacao" copiedField={copiedField} onCopy={onCopy} />
        </div>
        <div className="p-4 rounded-xl bg-white/5 border border-white/5">
          <p className="text-white/70 text-sm leading-relaxed whitespace-pre-wrap">{texto}</p>
        </div>
      </div>

      {estrategia && (
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-white font-semibold text-sm">Estratégia Pedagógica</h3>
            <CopyButton text={estrategia} field="estrategia" copiedField={copiedField} onCopy={onCopy} />
          </div>
          <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10">
            <p className="text-white/60 text-sm leading-relaxed whitespace-pre-wrap">{estrategia}</p>
          </div>
        </div>
      )}
    </div>
  );
}

function formatActivityType(tipo: string): string {
  const labels: Record<string, string> = {
    'lista-exercicios': 'Lista de Exercícios',
    'plano-aula': 'Plano de Aula',
    'sequencia-didatica': 'Sequência Didática',
    'quiz-interativo': 'Quiz Interativo',
    'flash-cards': 'Flash Cards',
    'redacao': 'Redação',
    'prova': 'Prova',
    'aula': 'Aula',
  };
  return labels[tipo] || tipo;
}
