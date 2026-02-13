import React from 'react';
import { motion } from 'framer-motion';
import { JotaAvatarChat } from './JotaAvatarChat';
import { RichTextMessage } from './RichTextMessage';
import { FileText, ChevronRight, Brain, Layers, Search, PenLine, TextCursorInput, Link2, ClipboardList, Sparkles, BookOpen, Target, CheckCircle2, FolderOpen } from 'lucide-react';
import type { StructuredResponseBlock, ActivitySummaryUI } from '../types/message-types';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';

interface StructuredResponseMessageProps {
  blocks: StructuredResponseBlock[];
  onOpenArtifact?: (artifact: ArtifactData) => void;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
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

function PhaseSeparator({ title, emoji, description }: { title: string; emoji: string; description?: string }) {
  const color = getPhaseColor(emoji);
  const IconComponent = getPhaseIcon(emoji);

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="mt-5 mb-3"
      style={{ maxWidth: '460px' }}
    >
      <div className="flex items-center gap-3">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0"
          style={{
            background: `${color}15`,
            border: `1px solid ${color}30`,
          }}
        >
          <IconComponent className="w-4 h-4" style={{ color }} />
        </div>
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold leading-tight"
            style={{
              fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              fontSize: '13.5px',
              color: `${color}dd`,
              letterSpacing: '-0.005em',
            }}
          >
            {title}
          </p>
          {description && (
            <p
              className="mt-0.5 leading-snug"
              style={{
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
                fontSize: '12px',
                color: 'rgba(255, 255, 255, 0.45)',
              }}
            >
              {description}
            </p>
          )}
        </div>
        <div
          className="flex-1 h-px"
          style={{
            background: `linear-gradient(to right, ${color}25, transparent)`,
            minWidth: '40px',
            maxWidth: '100px',
          }}
        />
      </div>
    </motion.div>
  );
}

function InlineActivitiesCard({ activities, onOpenActivity }: { 
  activities: ActivitySummaryUI[]; 
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  const showHeader = activities.length >= 2;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3 rounded-xl overflow-hidden"
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
    </motion.div>
  );
}

function InlineSingleActivityCard({ activity, onOpenActivity }: {
  activity: ActivitySummaryUI;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}) {
  const IconComponent = getActivityLucideIcon(activity.tipo);
  const subtitle = activity.descricao || getActivityTypeLabel(activity.tipo);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3 rounded-xl overflow-hidden"
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
    </motion.div>
  );
}

function InlineArtifactCard({ artifact, onOpen }: { artifact: ArtifactData; onOpen?: (artifact: ArtifactData) => void }) {
  const titulo = artifact.metadata?.titulo || 'Documento';
  const secoesCount = artifact.secoes?.length || 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="my-3 rounded-xl overflow-hidden"
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
    </motion.div>
  );
}

export function StructuredResponseMessage({ blocks, onOpenArtifact, onOpenActivity }: StructuredResponseMessageProps) {
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
            {blocks.map((block, idx) => {
              if (block.type === 'phase_separator' && block.phaseTitle) {
                return (
                  <motion.div
                    key={`phase-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                  >
                    <PhaseSeparator
                      title={block.phaseTitle}
                      emoji={block.phaseEmoji || '📋'}
                      description={block.phaseDescription}
                    />
                  </motion.div>
                );
              }

              if (block.type === 'text' && block.content) {
                return (
                  <motion.div
                    key={`text-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: idx * 0.08, duration: 0.3 }}
                    className="mb-2"
                  >
                    <RichTextMessage content={block.content} />
                  </motion.div>
                );
              }
              
              if (block.type === 'activities_card' && block.activities && block.activities.length > 0) {
                return (
                  <motion.div
                    key={`activities-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <InlineActivitiesCard 
                      activities={block.activities} 
                      onOpenActivity={onOpenActivity}
                    />
                  </motion.div>
                );
              }
              
              if (block.type === 'single_activity_card' && block.activity) {
                return (
                  <motion.div
                    key={`single-activity-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <InlineSingleActivityCard
                      activity={block.activity}
                      onOpenActivity={onOpenActivity}
                    />
                  </motion.div>
                );
              }
              
              if (block.type === 'artifact_card' && block.artifact) {
                return (
                  <motion.div
                    key={`artifact-${idx}`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.08, duration: 0.4 }}
                  >
                    <InlineArtifactCard
                      artifact={block.artifact}
                      onOpen={onOpenArtifact}
                    />
                  </motion.div>
                );
              }
              
              return null;
            })}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

export default StructuredResponseMessage;
