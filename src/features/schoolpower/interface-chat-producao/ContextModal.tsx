/**
 * CONTEXT MODAL - Modal de Contexto de Trabalho
 * 
 * Exibe a memória de trabalho atual do agente,
 * mostrando todas as descobertas e ações realizadas
 */

import React from 'react';
import { motion } from 'framer-motion';
import { X, Brain, Target, Lightbulb, Zap, AlertTriangle, CheckCircle } from 'lucide-react';
import type { WorkingMemoryItem } from './types';

interface ContextModalProps {
  workingMemory: WorkingMemoryItem[];
  onClose: () => void;
}

export function ContextModal({ workingMemory, onClose }: ContextModalProps) {

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

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
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

        <div className="p-6 overflow-y-auto max-h-[60vh]">
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
        </div>

        <div className="px-6 py-4 border-t border-white/10 bg-black/20">
          <p className="text-white/50 text-sm text-center">
            {workingMemory.length} itens no contexto
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default ContextModal;
