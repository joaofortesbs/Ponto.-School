/**
 * DEBUG MODAL - Visualização de narrativas de debug
 * 
 * Modal que exibe a narrativa completa de debug de uma capability
 * em formato de timeline com dados técnicos expansíveis
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Bug, 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Download,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Info,
  Lightbulb,
  Brain,
  Zap,
  ShieldCheck
} from 'lucide-react';
import type { AIDebugEntry, DebugEntryType } from './types';
import { SEVERITY_STYLES } from './types';

interface DebugModalProps {
  isOpen: boolean;
  onClose: () => void;
  capabilityId: string;
  capabilityName: string;
  entries: AIDebugEntry[];
}

const ENTRY_ICONS: Record<DebugEntryType, React.ReactNode> = {
  info: <Info className="w-4 h-4" />,
  action: <Zap className="w-4 h-4" />,
  decision: <Lightbulb className="w-4 h-4" />,
  discovery: <CheckCircle2 className="w-4 h-4" />,
  error: <AlertTriangle className="w-4 h-4" />,
  warning: <AlertTriangle className="w-4 h-4" />,
  reflection: <Brain className="w-4 h-4" />,
  confirmation: <ShieldCheck className="w-4 h-4" />
};

const ENTRY_COLORS: Record<DebugEntryType, string> = {
  info: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
  action: 'text-cyan-400 bg-cyan-500/20 border-cyan-500/30',
  decision: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
  discovery: 'text-green-400 bg-green-500/20 border-green-500/30',
  error: 'text-red-400 bg-red-500/20 border-red-500/30',
  warning: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
  reflection: 'text-purple-400 bg-purple-500/20 border-purple-500/30',
  confirmation: 'text-emerald-400 bg-emerald-500/20 border-emerald-500/30'
};

export function DebugModal({ 
  isOpen, 
  onClose, 
  capabilityId, 
  capabilityName, 
  entries 
}: DebugModalProps) {
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const [filter, setFilter] = useState<DebugEntryType | 'all'>('all');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedEntries);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedEntries(newExpanded);
  };

  const filteredEntries = filter === 'all' 
    ? entries 
    : entries.filter(e => e.entry_type === filter);

  const copyEntry = async (entry: AIDebugEntry) => {
    const text = `[${entry.entry_type.toUpperCase()}] ${entry.narrative}${
      entry.technical_data ? `\n\nDados: ${JSON.stringify(entry.technical_data, null, 2)}` : ''
    }`;
    await navigator.clipboard.writeText(text);
    setCopiedId(entry.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const exportAll = () => {
    let markdown = `# Debug: ${capabilityName}\n\n`;
    entries.forEach(entry => {
      const time = new Date(entry.timestamp).toLocaleTimeString('pt-BR');
      markdown += `## ${time} - ${entry.entry_type.toUpperCase()}\n\n`;
      markdown += `${entry.narrative}\n\n`;
      if (entry.technical_data) {
        markdown += `\`\`\`json\n${JSON.stringify(entry.technical_data, null, 2)}\n\`\`\`\n\n`;
      }
    });
    
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug_${capabilityId}_${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const errorCount = entries.filter(e => e.entry_type === 'error').length;
  const warningCount = entries.filter(e => e.entry_type === 'warning').length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
          className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl border border-white/10 w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col"
        >
          <div className="p-4 border-b border-white/10 bg-black/20">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                  <Bug className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-white font-semibold text-lg">
                    Debug: {capabilityName}
                  </h2>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-white/50 text-sm">
                      {entries.length} eventos
                    </span>
                    {errorCount > 0 && (
                      <span className="text-red-400 text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {errorCount} erro{errorCount > 1 ? 's' : ''}
                      </span>
                    )}
                    {warningCount > 0 && (
                      <span className="text-orange-400 text-sm flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        {warningCount} aviso{warningCount > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>

            <div className="flex gap-2 mt-4 flex-wrap">
              {(['all', 'action', 'decision', 'discovery', 'error', 'warning', 'reflection'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1 rounded-full text-sm transition-all ${
                    filter === type 
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/30' 
                      : 'bg-white/5 text-white/60 border border-white/10 hover:bg-white/10'
                  }`}
                >
                  {type === 'all' ? 'Todos' : type.charAt(0).toUpperCase() + type.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {filteredEntries.length === 0 ? (
              <div className="text-center py-8 text-white/50">
                <Bug className="w-12 h-12 mx-auto mb-3 opacity-30" />
                <p>Nenhum evento de debug registrado</p>
              </div>
            ) : (
              filteredEntries.map((entry, idx) => (
                <motion.div
                  key={entry.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.03 }}
                  className={`rounded-xl border overflow-hidden ${ENTRY_COLORS[entry.entry_type]}`}
                >
                  <div className="p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${ENTRY_COLORS[entry.entry_type]}`}>
                          {ENTRY_ICONS[entry.entry_type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-white/60 text-xs font-mono flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {new Date(entry.timestamp).toLocaleTimeString('pt-BR')}
                            </span>
                            <span className="px-2 py-0.5 rounded text-xs uppercase font-medium bg-black/20">
                              {entry.entry_type}
                            </span>
                            {entry.severity === 'high' || entry.severity === 'critical' ? (
                              <span className={`px-2 py-0.5 rounded text-xs ${SEVERITY_STYLES[entry.severity].bg} ${SEVERITY_STYLES[entry.severity].text}`}>
                                {entry.severity}
                              </span>
                            ) : null}
                          </div>
                          <p className="text-white/90 text-sm leading-relaxed">
                            {entry.narrative}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => copyEntry(entry)}
                          className="p-1.5 hover:bg-white/10 rounded transition-colors"
                          title="Copiar"
                        >
                          {copiedId === entry.id ? (
                            <CheckCircle2 className="w-4 h-4 text-green-400" />
                          ) : (
                            <Copy className="w-4 h-4 text-white/40" />
                          )}
                        </button>
                        {entry.technical_data && (
                          <button
                            onClick={() => toggleExpand(entry.id)}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors"
                            title="Ver dados técnicos"
                          >
                            {expandedEntries.has(entry.id) ? (
                              <ChevronDown className="w-4 h-4 text-white/40" />
                            ) : (
                              <ChevronRight className="w-4 h-4 text-white/40" />
                            )}
                          </button>
                        )}
                      </div>
                    </div>

                    {entry.technical_data && expandedEntries.has(entry.id) && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="mt-3 pt-3 border-t border-white/10"
                      >
                        <p className="text-white/50 text-xs mb-2 uppercase tracking-wider">
                          Dados Técnicos
                        </p>
                        <pre className="text-xs bg-black/30 rounded-lg p-3 overflow-x-auto text-white/70 font-mono">
                          {JSON.stringify(entry.technical_data, null, 2)}
                        </pre>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              ))
            )}
          </div>

          <div className="p-4 border-t border-white/10 bg-black/20 flex justify-between items-center">
            <p className="text-white/40 text-sm">
              {filteredEntries.length} de {entries.length} eventos
            </p>
            <div className="flex gap-2">
              <button
                onClick={exportAll}
                className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-white/70 text-sm transition-colors"
              >
                <Download className="w-4 h-4" />
                Exportar
              </button>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-orange-500/20 hover:bg-orange-500/30 border border-orange-500/30 rounded-lg text-orange-400 text-sm transition-colors"
              >
                Fechar
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default DebugModal;
