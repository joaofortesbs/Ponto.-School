/**
 * ACTIVITY DEBUG MODAL - Modal de visualização de logs detalhados
 * 
 * Exibe todos os logs de debug de uma atividade específica,
 * permitindo acompanhar cada etapa do processo de construção.
 */

import React, { useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bug, 
  Clock, 
  AlertCircle, 
  CheckCircle2, 
  Info, 
  Zap, 
  Globe,
  AlertTriangle,
  ChevronDown,
  Copy,
  Download
} from 'lucide-react';
import { useActivityDebugStore, ActivityDebugEntry, DebugLogLevel } from '../stores/activityDebugStore';

interface ActivityDebugModalProps {
  isOpen: boolean;
  activityId: string | null;
  activityName: string;
  onClose: () => void;
}

const LEVEL_CONFIG: Record<DebugLogLevel, { icon: React.ElementType; color: string; bg: string; label: string }> = {
  info: { icon: Info, color: 'text-blue-400', bg: 'bg-blue-500/10', label: 'Info' },
  action: { icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10', label: 'Ação' },
  api: { icon: Globe, color: 'text-cyan-400', bg: 'bg-cyan-500/10', label: 'API' },
  success: { icon: CheckCircle2, color: 'text-green-400', bg: 'bg-green-500/10', label: 'Sucesso' },
  warning: { icon: AlertTriangle, color: 'text-yellow-400', bg: 'bg-yellow-500/10', label: 'Aviso' },
  error: { icon: AlertCircle, color: 'text-red-400', bg: 'bg-red-500/10', label: 'Erro' }
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString('pt-BR', { 
    hour: '2-digit', 
    minute: '2-digit', 
    second: '2-digit',
    fractionalSecondDigits: 3
  });
}

function formatDuration(startTime?: Date, endTime?: Date): string {
  if (!startTime) return '-';
  const end = endTime || new Date();
  const ms = end.getTime() - startTime.getTime();
  if (ms < 1000) return `${ms}ms`;
  if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
  return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
}

function DebugEntryRow({ entry }: { entry: ActivityDebugEntry }) {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const config = LEVEL_CONFIG[entry.level];
  const Icon = config.icon;

  return (
    <div className={`border-l-2 ${config.color.replace('text-', 'border-')} pl-3 py-2`}>
      <div 
        className="flex items-start gap-2 cursor-pointer"
        onClick={() => entry.data && setIsExpanded(!isExpanded)}
      >
        <div className={`p-1 rounded ${config.bg} flex-shrink-0 mt-0.5`}>
          <Icon className={`w-3 h-3 ${config.color}`} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className={`text-xs font-mono ${config.color}`}>
              [{entry.source}]
            </span>
            <span className="text-white/80 text-sm">
              {entry.message}
            </span>
            {entry.duration && (
              <span className="text-white/40 text-xs">
                ({entry.duration}ms)
              </span>
            )}
          </div>
          <div className="text-white/30 text-xs mt-0.5">
            {formatTime(entry.timestamp)}
          </div>
        </div>

        {entry.data && (
          <ChevronDown 
            className={`w-4 h-4 text-white/40 transition-transform flex-shrink-0 ${isExpanded ? 'rotate-180' : ''}`} 
          />
        )}
      </div>

      <AnimatePresence>
        {isExpanded && entry.data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="mt-2 ml-6 overflow-hidden"
          >
            <pre className="text-xs bg-black/30 rounded-lg p-3 overflow-x-auto text-white/60 font-mono">
              {JSON.stringify(entry.data, null, 2)}
            </pre>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function ActivityDebugModal({ isOpen, activityId, activityName, onClose }: ActivityDebugModalProps) {
  const activityDebug = useActivityDebugStore(state => 
    activityId ? state.activities.get(activityId) : undefined
  );
  
  const entries = activityDebug?.entries || [];
  
  const stats = useMemo(() => {
    const counts = { info: 0, action: 0, api: 0, success: 0, warning: 0, error: 0 };
    entries.forEach(e => counts[e.level]++);
    return counts;
  }, [entries]);

  const handleCopyLogs = () => {
    const logsText = entries.map(e => 
      `[${formatTime(e.timestamp)}] [${e.level.toUpperCase()}] [${e.source}] ${e.message}${e.data ? '\n' + JSON.stringify(e.data, null, 2) : ''}`
    ).join('\n\n');
    
    navigator.clipboard.writeText(logsText);
  };

  const handleDownloadLogs = () => {
    const logsText = entries.map(e => 
      `[${formatTime(e.timestamp)}] [${e.level.toUpperCase()}] [${e.source}] ${e.message}${e.data ? '\n' + JSON.stringify(e.data, null, 2) : ''}`
    ).join('\n\n');
    
    const blob = new Blob([logsText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-${activityId}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[80vh] overflow-hidden shadow-2xl"
          onClick={e => e.stopPropagation()}
        >
          <div className="p-4 border-b border-white/10 bg-black/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">Debug da Atividade</h3>
                  <p className="text-white/50 text-sm">{activityName}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyLogs}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Copiar logs"
                >
                  <Copy className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={handleDownloadLogs}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                  title="Baixar logs"
                >
                  <Download className="w-4 h-4 text-white/60" />
                </button>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
            </div>

            {activityDebug && (
              <div className="mt-4 flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-white/40" />
                  <span className="text-white/60">
                    Duração: {formatDuration(activityDebug.startTime, activityDebug.endTime)}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-white/60">Progresso: {activityDebug.progress}%</span>
                </div>
                <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  activityDebug.status === 'completed' ? 'bg-green-500/20 text-green-400' :
                  activityDebug.status === 'error' ? 'bg-red-500/20 text-red-400' :
                  activityDebug.status === 'building' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-gray-500/20 text-gray-400'
                }`}>
                  {activityDebug.status === 'completed' ? 'Construída' :
                   activityDebug.status === 'error' ? 'Falha' :
                   activityDebug.status === 'building' ? 'Construindo' : 'Pendente'}
                </div>
              </div>
            )}

            <div className="mt-3 flex items-center gap-3 flex-wrap">
              {Object.entries(stats).map(([level, count]) => {
                if (count === 0) return null;
                const config = LEVEL_CONFIG[level as DebugLogLevel];
                return (
                  <div key={level} className={`flex items-center gap-1.5 px-2 py-1 rounded-lg ${config.bg}`}>
                    <span className={`text-xs ${config.color}`}>{config.label}:</span>
                    <span className="text-white/80 text-xs font-medium">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="p-4 overflow-y-auto max-h-[50vh] space-y-1">
            {entries.length === 0 ? (
              <div className="text-center py-8">
                <Bug className="w-12 h-12 text-white/20 mx-auto mb-3" />
                <p className="text-white/40">Nenhum log registrado ainda</p>
                <p className="text-white/30 text-sm mt-1">
                  Os logs aparecerão aqui quando a construção iniciar
                </p>
              </div>
            ) : (
              entries.map(entry => (
                <DebugEntryRow key={entry.id} entry={entry} />
              ))
            )}
          </div>

          {activityDebug?.errorSummary && (
            <div className="p-4 border-t border-red-500/20 bg-red-500/10">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium text-sm">Erro na Construção</p>
                  <p className="text-red-300/80 text-sm mt-1">{activityDebug.errorSummary}</p>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
