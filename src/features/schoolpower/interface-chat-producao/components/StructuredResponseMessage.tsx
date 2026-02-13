import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { JotaAvatarChat } from './JotaAvatarChat';
import { RichTextMessage } from './RichTextMessage';
import { FileText, ChevronRight, ChevronDown, Brain, Layers, Search, PenLine, TextCursorInput, Link2, ClipboardList, Sparkles, BookOpen, Target, CheckCircle2, FolderOpen } from 'lucide-react';
import type { StructuredResponseBlock, ActivitySummaryUI } from '../types/message-types';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

interface StructuredResponseMessageProps {
  blocks: StructuredResponseBlock[];
  onOpenArtifact?: (artifact: ArtifactData) => void;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}

interface PhaseSection {
  phaseTitle: string;
  phaseEmoji: string;
  phaseDescription?: string;
  children: StructuredResponseBlock[];
}

function getActivityLucideIcon(tipo: string) {
  const t = tipo?.toLowerCase() || '';
  if (t.includes('quiz')) return Brain;
  if (t.includes('flash') || t.includes('card')) return Layers;
  if (t.includes('caça') || t.includes('caca')) return Search;
  if (t.includes('cruzada')) return PenLine;
  if (t.includes('complete') || t.includes('lacuna')) return TextCursorInput;
  if (t.includes('associa')) return Link2;
  if (t.includes('texto') || t.includes('text')) return FileText;
  if (t.includes('lista') || t.includes('exerc')) return ClipboardList;
  return ClipboardList;
}

function getActivityTypeLabel(tipo: string): string {
  const t = tipo?.toLowerCase() || '';
  if (t.includes('quiz')) return 'Quiz Interativo';
  if (t.includes('flash') || t.includes('card')) return 'Flash Cards';
  if (t.includes('caça') || t.includes('caca')) return 'Caça-palavras';
  if (t.includes('cruzada')) return 'Palavras Cruzadas';
  if (t.includes('complete') || t.includes('lacuna')) return 'Complete as Lacunas';
  if (t.includes('associa')) return 'Associação';
  if (t.includes('texto') || t.includes('text')) return 'Versão Texto';
  if (t.includes('lista') || t.includes('exerc')) return 'Lista de Exercícios';
  return tipo?.replace(/[-_]/g, ' ') || 'Atividade';
}

function getPhaseIcon(emoji: string) {
  switch (emoji) {
    case '🎯': return Target;
    case '🧠': return Brain;
    case '📝': return BookOpen;
    case '✅': return CheckCircle2;
    case '📂': return FolderOpen;
    case '📦': return FolderOpen;
    default: return BookOpen;
  }
}

function getPhaseColor(emoji: string): string {
  switch (emoji) {
    case '🎯': return '#f59e0b';
    case '🧠': return '#8b5cf6';
    case '📝': return '#3b82f6';
    case '✅': return '#10b981';
    case '📂': return '#6366f1';
    case '📦': return '#6366f1';
    default: return '#6366f1';
  }
}

function countPhaseItems(children: StructuredResponseBlock[]): { activities: number; artifacts: number } {
  let activities = 0;
  let artifacts = 0;
  for (const block of children) {
    if (block.type === 'activities_card' && block.activities) {
      activities += block.activities.length;
    } else if (block.type === 'single_activity_card' && block.activity) {
      activities += 1;
    } else if (block.type === 'artifact_card' && block.artifact) {
      artifacts += 1;
    }
  }
  return { activities, artifacts };
}

function formatItemCount(activities: number, artifacts: number): string {
  const parts: string[] = [];
  if (activities > 0) parts.push(`${activities} ${activities === 1 ? 'atividade' : 'atividades'}`);
  if (artifacts > 0) parts.push(`${artifacts} ${artifacts === 1 ? 'documento' : 'documentos'}`);
  return parts.join(' + ');
}

function groupBlocksIntoPhases(blocks: StructuredResponseBlock[]): {
  prePhaseBlocks: StructuredResponseBlock[];
  phases: PhaseSection[];
  postPhaseBlocks: StructuredResponseBlock[];
} {
  const prePhaseBlocks: StructuredResponseBlock[] = [];
  const phases: PhaseSection[] = [];
  const postPhaseBlocks: StructuredResponseBlock[] = [];
  let currentPhase: PhaseSection | null = null;
  let foundFirstPhase = false;

  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];
    if (block.type === 'phase_separator' && block.phaseTitle) {
      foundFirstPhase = true;
      if (currentPhase) {
        phases.push(currentPhase);
      }
      currentPhase = {
        phaseTitle: block.phaseTitle,
        phaseEmoji: block.phaseEmoji || '📋',
        phaseDescription: block.phaseDescription,
        children: [],
      };
    } else if (!foundFirstPhase) {
      prePhaseBlocks.push(block);
    } else if (currentPhase) {
      currentPhase.children.push(block);
    }
  }

  if (currentPhase) {
    phases.push(currentPhase);
  }

  if (phases.length > 0) {
    const lastPhase = phases[phases.length - 1];
    let lastCardIndex = -1;
    for (let i = lastPhase.children.length - 1; i >= 0; i--) {
      const child = lastPhase.children[i];
      if (child.type === 'artifact_card' || child.type === 'activities_card' || child.type === 'single_activity_card') {
        lastCardIndex = i;
        break;
      }
    }
    if (lastCardIndex >= 0 && lastCardIndex < lastPhase.children.length - 1) {
      const extracted = lastPhase.children.splice(lastCardIndex + 1);
      postPhaseBlocks.push(...extracted);
    }
  }

  return { prePhaseBlocks, phases, postPhaseBlocks };
}

function CollapsiblePhaseSection({ 
  phase, 
  isOpen, 
  onToggle, 
  phaseIndex,
  onOpenArtifact,
  onOpenActivity,
}: { 
  phase: PhaseSection; 
  isOpen: boolean; 
  onToggle: () => void;
  phaseIndex: number;
  onOpenArtifact?: (artifact: ArtifactData) => void;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  const color = getPhaseColor(phase.phaseEmoji);
  const IconComponent = getPhaseIcon(phase.phaseEmoji);
  const { activities, artifacts } = countPhaseItems(phase.children);
  const itemCountLabel = formatItemCount(activities, artifacts);

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: phaseIndex * 0.1, duration: 0.3 }}
      className="mb-2"
    >
      <button
        onClick={onToggle}
        className="w-full text-left group cursor-pointer"
        style={{ 
          maxWidth: '460px',
          padding: '12px 4px',
          minHeight: '48px',
          background: 'transparent',
          border: 'none',
          outline: 'none',
          WebkitTapHighlightColor: 'transparent',
        }}
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
            style={{
              background: isOpen ? `${color}20` : `${color}10`,
              border: `1px solid ${isOpen ? `${color}40` : `${color}20`}`,
            }}
          >
            <IconComponent className="w-4 h-4" style={{ color }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <p
                className="font-semibold leading-tight"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '13.5px',
                  color: `${color}dd`,
                  letterSpacing: '-0.005em',
                }}
              >
                {phase.phaseTitle}
              </p>
              {!isOpen && itemCountLabel && (
                <span
                  className="inline-flex items-center rounded-full px-2 py-0.5 flex-shrink-0"
                  style={{
                    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                    fontSize: '10.5px',
                    fontWeight: 500,
                    color: `${color}aa`,
                    background: `${color}0d`,
                    border: `1px solid ${color}18`,
                  }}
                >
                  {itemCountLabel}
                </span>
              )}
            </div>
            {isOpen && phase.phaseDescription && (
              <p
                className="mt-0.5 leading-snug"
                style={{
                  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                  fontSize: '12px',
                  color: 'rgba(255, 255, 255, 0.45)',
                }}
              >
                {phase.phaseDescription}
              </p>
            )}
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 0 : -90 }}
            transition={{ duration: 0.2 }}
            className="flex-shrink-0"
          >
            <ChevronDown 
              className="w-4 h-4 transition-colors duration-200" 
              style={{ color: isOpen ? `${color}90` : 'rgba(255,255,255,0.25)' }} 
            />
          </motion.div>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="pb-2" style={{ paddingLeft: '4px' }}>
              {phase.children.map((block, idx) => (
                <BlockRenderer
                  key={`phase-child-${idx}`}
                  block={block}
                  idx={idx}
                  onOpenArtifact={onOpenArtifact}
                  onOpenActivity={onOpenActivity}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function InlineActivitiesCard({ activities, onOpenActivity }: { 
  activities: ActivitySummaryUI[]; 
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  const showHeader = activities.length >= 2;

  return (
    <div
      className="my-2 rounded-xl overflow-hidden"
      style={{
        background: '#040b2a',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        maxWidth: '340px',
      }}
    >
      {showHeader && (
        <div className="px-4 py-2.5 flex items-center gap-2" style={{ borderBottom: '1px solid rgba(99, 102, 241, 0.1)' }}>
          <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-xs font-semibold text-white/70 tracking-wide">
            Suas {activities.length} atividades:
          </span>
        </div>
      )}
      <div className={showHeader ? 'divide-y divide-white/5' : ''}>
        {activities.map((activity, idx) => {
          const IconComponent = getActivityLucideIcon(activity.tipo);
          const subtitle = activity.descricao || getActivityTypeLabel(activity.tipo);

          return (
            <button
              key={activity.id || idx}
              onClick={() => onOpenActivity?.(activity)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
            >
              <div
                className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
                style={{ background: 'rgba(99, 102, 241, 0.12)' }}
              >
                <IconComponent className="w-4 h-4 text-indigo-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors leading-tight">
                  {activity.titulo}
                </p>
                <p className="text-xs text-slate-500 truncate mt-0.5 leading-tight">
                  {subtitle}
                </p>
              </div>
              <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
            </button>
          );
        })}
      </div>
    </div>
  );
}

function InlineSingleActivityCard({ activity, onOpenActivity }: {
  activity: ActivitySummaryUI;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  const IconComponent = getActivityLucideIcon(activity.tipo);
  const subtitle = activity.descricao || getActivityTypeLabel(activity.tipo);

  return (
    <div
      className="my-2 rounded-xl overflow-hidden"
      style={{
        background: '#040b2a',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        maxWidth: '340px',
      }}
    >
      <button
        onClick={() => onOpenActivity?.(activity)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(99, 102, 241, 0.12)' }}
        >
          <IconComponent className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors leading-tight">
            {activity.titulo}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5 leading-tight">
            {subtitle}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </button>
    </div>
  );
}

function InlineArtifactCard({ artifact, onOpen }: { artifact: ArtifactData; onOpen?: (artifact: ArtifactData) => void }) {
  const titulo = artifact.metadata?.titulo || 'Documento';
  const secoesCount = artifact.secoes?.length || 0;

  return (
    <div
      className="my-2 rounded-xl overflow-hidden"
      style={{
        background: '#040b2a',
        border: '1px solid rgba(99, 102, 241, 0.15)',
        maxWidth: '340px',
      }}
    >
      <button
        onClick={() => onOpen?.(artifact)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-white/[0.04] transition-all duration-200 group cursor-pointer"
      >
        <div
          className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ background: 'rgba(99, 102, 241, 0.12)' }}
        >
          <FileText className="w-4 h-4 text-indigo-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-slate-200 truncate group-hover:text-white transition-colors leading-tight">
            {titulo}
          </p>
          <p className="text-xs text-slate-500 truncate mt-0.5 leading-tight">
            {secoesCount} {secoesCount === 1 ? 'seção' : 'seções'}
          </p>
        </div>
        <ChevronRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-slate-400 transition-colors flex-shrink-0" />
      </button>
    </div>
  );
}

function BlockRenderer({ block, idx, onOpenArtifact, onOpenActivity }: {
  block: StructuredResponseBlock;
  idx: number;
  onOpenArtifact?: (artifact: ArtifactData) => void;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  if (block.type === 'text' && block.content) {
    return (
      <div className="mb-2">
        <RichTextMessage content={block.content} />
      </div>
    );
  }

  if (block.type === 'activities_card' && block.activities && block.activities.length > 0) {
    return (
      <InlineActivitiesCard 
        activities={block.activities} 
        onOpenActivity={onOpenActivity}
      />
    );
  }

  if (block.type === 'single_activity_card' && block.activity) {
    return (
      <InlineSingleActivityCard
        activity={block.activity}
        onOpenActivity={onOpenActivity}
      />
    );
  }

  if (block.type === 'artifact_card' && block.artifact) {
    return (
      <InlineArtifactCard
        artifact={block.artifact}
        onOpen={onOpenArtifact}
      />
    );
  }

  return null;
}

export function StructuredResponseMessage({ blocks, onOpenArtifact, onOpenActivity }: StructuredResponseMessageProps) {
  const { prePhaseBlocks, phases, postPhaseBlocks } = useMemo(() => groupBlocksIntoPhases(blocks), [blocks]);
  const hasPhases = phases.length > 0;

  const [openPhases, setOpenPhases] = useState<Set<number>>(() => {
    return new Set(hasPhases ? [0] : []);
  });

  const togglePhase = (index: number) => {
    setOpenPhases(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  };

  return (
    <motion.div 
      className="flex justify-start"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex gap-3 max-w-[85%]">
        <div className="flex flex-col items-center flex-shrink-0">
          <JotaAvatarChat size="md" showAnimation={true} />
        </div>
        
        <div className="flex flex-col min-h-[48px] py-1 flex-1">
          <span
            className="leading-tight mb-2"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '14px',
              fontWeight: '700',
              color: 'rgba(255, 255, 255, 0.95)',
              letterSpacing: '-0.01em',
            }}
          >
            Jota
          </span>
          
          <div className="mt-auto">
            {hasPhases ? (
              <>
                {prePhaseBlocks.map((block, idx) => (
                  <motion.div
                    key={`pre-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    className="mb-2"
                  >
                    <BlockRenderer
                      block={block}
                      idx={idx}
                      onOpenArtifact={onOpenArtifact}
                      onOpenActivity={onOpenActivity}
                    />
                  </motion.div>
                ))}

                {phases.map((phase, phaseIdx) => (
                  <CollapsiblePhaseSection
                    key={`phase-${phaseIdx}`}
                    phase={phase}
                    isOpen={openPhases.has(phaseIdx)}
                    onToggle={() => togglePhase(phaseIdx)}
                    phaseIndex={phaseIdx}
                    onOpenArtifact={onOpenArtifact}
                    onOpenActivity={onOpenActivity}
                  />
                ))}

                {postPhaseBlocks.map((block, idx) => (
                  <motion.div
                    key={`post-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: (phases.length + idx) * 0.08, duration: 0.3 }}
                    className="mb-2"
                  >
                    <BlockRenderer
                      block={block}
                      idx={idx}
                      onOpenArtifact={onOpenArtifact}
                      onOpenActivity={onOpenActivity}
                    />
                  </motion.div>
                ))}
              </>
            ) : (
              blocks.map((block, idx) => (
                <motion.div
                  key={`flat-${idx}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.08, duration: 0.3 }}
                  className="mb-2"
                >
                  <BlockRenderer
                    block={block}
                    idx={idx}
                    onOpenArtifact={onOpenArtifact}
                    onOpenActivity={onOpenActivity}
                  />
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StructuredResponseMessage;
