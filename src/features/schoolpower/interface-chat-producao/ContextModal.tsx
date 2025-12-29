/**
 * CONTEXT MODAL - Modal de Contexto de Trabalho
 * 
 * Exibe a memória de trabalho atual do agente,
 * mostrando todas as descobertas e ações realizadas
 * 
 * ATUALIZADO: Inclui seção de Debug Narrativo da IA
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Brain, Target, Lightbulb, Zap, AlertTriangle, CheckCircle, Bug, ChevronDown, ChevronUp, Download } from 'lucide-react';
import type { WorkingMemoryItem } from './types';
import { useDebugStore } from './debug-system/DebugStore';
import type { AIDebugEntry, DebugEntryType } from './debug-system/types';

interface ContextModalProps {
  workingMemory: WorkingMemoryItem[];
  onClose: () => void;
}

export function ContextModal({ workingMemory, onClose }: ContextModalProps) {
  const [activeTab, setActiveTab] = useState<'memoria' | 'debug'>('memoria');
  const [expandedEntries, setExpandedEntries] = useState<Set<string>>(new Set());
  const debugStore = useDebugStore();
  const allDebugEntries = debugStore.getAllEntries();

  const toggleEntry = (id: string) => {
    setExpandedEntries(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExportDebug = () => {
    const markdown = debugStore.exportAsMarkdown();
    const blob = new Blob([markdown], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-agente-jota-${Date.now()}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const getItemIcon = (tipo: WorkingMemoryItem['tipo']) => {
    switch (tipo) {
      case 'objetivo':
        return <Target className="w-4 h-4 text-purple-400" />;
      case 'descoberta':
        return <Lightbulb className="w-4 h-4 text-yellow-400" />;
      case 'acao':
        return <Zap className="w-4 h-4 text-blue-400" />;
      case 'erro':
        return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'resultado':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      default:
        return <Brain className="w-4 h-4 text-white/60" />;
    }
  };

  const getItemColor = (tipo: WorkingMemoryItem['tipo']) => {
    switch (tipo) {
      case 'objetivo':
        return 'border-purple-500/30 bg-purple-500/10';
      case 'descoberta':
        return 'border-yellow-500/30 bg-yellow-500/10';
      case 'acao':
        return 'border-blue-500/30 bg-blue-500/10';
      case 'erro':
        return 'border-red-500/30 bg-red-500/10';
      case 'resultado':
        return 'border-green-500/30 bg-green-500/10';
      default:
        return 'border-white/20 bg-white/5';
    }
  };

  const getDebugTypeIcon = (type: DebugEntryType) => {
    switch (type) {
      case 'info': return <Lightbulb className="w-4 h-4 text-blue-400" />;
      case 'action': return <Zap className="w-4 h-4 text-purple-400" />;
      case 'decision': return <Target className="w-4 h-4 text-yellow-400" />;
      case 'discovery': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-orange-400" />;
      case 'reflection': return <Brain className="w-4 h-4 text-pink-400" />;
      default: return <Bug className="w-4 h-4 text-white/60" />;
    }
  };

  const getDebugTypeColor = (type: DebugEntryType) => {
    switch (type) {
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      case 'action': return 'border-purple-500/30 bg-purple-500/10';
      case 'decision': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'discovery': return 'border-green-500/30 bg-green-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-orange-500/30 bg-orange-500/10';
      case 'reflection': return 'border-pink-500/30 bg-pink-500/10';
      default: return 'border-white/20 bg-white/5';
    }
  };

  const formatTime = (timestamp: number | string) => {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gradient-to-br from-gray-900 to-black rounded-2xl border border-white/20 max-w-2xl w-full max-h-[80vh] overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold">Contexto de Trabalho</h3>
              <p className="text-white/50 text-sm">
                Memória do Agente Jota
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-white/70" />
          </button>
        </div>

        <div className="flex border-b border-white/10">
          <button
            onClick={() => setActiveTab('memoria')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'memoria' 
                ? 'text-white bg-white/10 border-b-2 border-purple-500' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Brain className="w-4 h-4 inline mr-2" />
            Memória ({workingMemory.length})
          </button>
          <button
            onClick={() => setActiveTab('debug')}
            className={`flex-1 px-4 py-3 text-sm font-medium transition-colors ${
              activeTab === 'debug' 
                ? 'text-white bg-white/10 border-b-2 border-orange-500' 
                : 'text-white/50 hover:text-white hover:bg-white/5'
            }`}
          >
            <Bug className="w-4 h-4 inline mr-2" />
            Debug IA ({allDebugEntries.length})
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[55vh]">
          <AnimatePresence mode="wait">
            {activeTab === 'memoria' && (
              <motion.div
                key="memoria"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {workingMemory.length === 0 ? (
                  <div className="text-center py-12">
                    <Brain className="w-16 h-16 mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">
                      Nenhum contexto registrado ainda.
                    </p>
                    <p className="text-white/30 text-sm mt-2">
                      O contexto será preenchido conforme o agente trabalha.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {workingMemory.map((item, index) => (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`p-4 rounded-xl border ${getItemColor(item.tipo)}`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {getItemIcon(item.tipo)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2">
                              <span className="text-white/50 text-xs uppercase tracking-wider">
                                {item.tipo}
                                {item.etapa && ` (Etapa ${item.etapa})`}
                              </span>
                              <span className="text-white/30 text-xs">
                                {formatTime(item.timestamp)}
                              </span>
                            </div>
                            <p className="text-white mt-1">{item.conteudo}</p>
                            {item.funcao && (
                              <span className="text-purple-400 text-sm font-mono mt-1 block">
                                {item.funcao}
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'debug' && (
              <motion.div
                key="debug"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                {allDebugEntries.length === 0 ? (
                  <div className="text-center py-12">
                    <Bug className="w-16 h-16 mx-auto text-white/20 mb-4" />
                    <p className="text-white/40">
                      Nenhum debug registrado ainda.
                    </p>
                    <p className="text-white/30 text-sm mt-2">
                      Aqui você verá tudo que a IA fez em cada capacidade.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex justify-end mb-2">
                      <button
                        onClick={handleExportDebug}
                        className="flex items-center gap-2 px-3 py-1.5 text-xs text-white/70 hover:text-white bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                      >
                        <Download className="w-3.5 h-3.5" />
                        Exportar Debug
                      </button>
                    </div>
                    {allDebugEntries.map((entry, index) => (
                      <motion.div
                        key={entry.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.03 }}
                        className={`rounded-xl border overflow-hidden ${getDebugTypeColor(entry.entry_type)}`}
                      >
                        <div 
                          className="p-4 cursor-pointer hover:bg-white/5 transition-colors"
                          onClick={() => toggleEntry(entry.id)}
                        >
                          <div className="flex items-start gap-3">
                            <div className="mt-0.5">
                              {getDebugTypeIcon(entry.entry_type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-white/50 text-xs uppercase tracking-wider">
                                  {entry.entry_type} - {entry.capability_name}
                                </span>
                                <div className="flex items-center gap-2">
                                  <span className="text-white/30 text-xs">
                                    {formatTime(entry.timestamp)}
                                  </span>
                                  {entry.technical_data && (
                                    expandedEntries.has(entry.id) 
                                      ? <ChevronUp className="w-4 h-4 text-white/40" />
                                      : <ChevronDown className="w-4 h-4 text-white/40" />
                                  )}
                                </div>
                              </div>
                              <p className="text-white mt-1 text-sm">{entry.narrative}</p>
                            </div>
                          </div>
                        </div>
                        
                        <AnimatePresence>
                          {expandedEntries.has(entry.id) && entry.technical_data && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              className="border-t border-white/10"
                            >
                              <div className="p-3 bg-black/30">
                                <p className="text-white/40 text-xs uppercase tracking-wider mb-2">
                                  Dados Técnicos
                                </p>
                                <pre className="text-xs text-white/70 overflow-x-auto font-mono bg-black/40 p-2 rounded">
                                  {JSON.stringify(entry.technical_data, null, 2)}
                                </pre>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-black/20">
          <p className="text-white/50 text-sm text-center">
            {activeTab === 'memoria' 
              ? `${workingMemory.length} itens no contexto`
              : `${allDebugEntries.length} entradas de debug`
            }
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ContextModal;
