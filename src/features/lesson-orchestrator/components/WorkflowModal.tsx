/**
 * ====================================================================
 * MODAL DE VISUALIZAÇÃO DO WORKFLOW DE CRIAÇÃO DE AULA
 * ====================================================================
 * 
 * Modal que exibe o fluxo de criação da aula em tempo real,
 * mostrando cada etapa com status e progresso.
 * 
 * VERSÃO: 1.0.0
 * ====================================================================
 */

import React, { useState, useEffect } from 'react';
import { X, Check, Loader2, AlertCircle, Clock, Zap, FileText, Lightbulb, Settings, Save, Link, CheckCircle } from 'lucide-react';
import { WorkflowState, WORKFLOW_STEPS } from '../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowState: WorkflowState | null;
  isLoading?: boolean;
}

const STEP_ICONS: Record<number, React.ReactNode> = {
  1: <FileText className="w-5 h-5" />,
  2: <Zap className="w-5 h-5" />,
  3: <Lightbulb className="w-5 h-5" />,
  4: <Settings className="w-5 h-5" />,
  5: <Save className="w-5 h-5" />,
  6: <Link className="w-5 h-5" />,
  7: <CheckCircle className="w-5 h-5" />
};

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  workflowState,
  isLoading = false
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);

  useEffect(() => {
    if (workflowState?.progress) {
      const timer = setTimeout(() => {
        setAnimatedProgress(workflowState.progress);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [workflowState?.progress]);

  if (!isOpen) return null;

  const getStepStatus = (stepNumber: number) => {
    if (!workflowState) return 'pending';
    return workflowState.steps[stepNumber]?.status || 'pending';
  };

  const getStepDuration = (stepNumber: number) => {
    if (!workflowState) return null;
    const step = workflowState.steps[stepNumber];
    if (step?.startTime && step?.endTime) {
      return step.endTime - step.startTime;
    }
    return null;
  };

  const formatDuration = (ms: number | null) => {
    if (ms === null) return '';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(1)}s`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'running': return 'bg-orange-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-gray-600';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <Check className="w-4 h-4 text-white" />;
      case 'running':
        return <Loader2 className="w-4 h-4 text-white animate-spin" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-white" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a2e] rounded-2xl shadow-2xl border border-orange-500/20 overflow-hidden">
        <div className="bg-gradient-to-r from-orange-500/20 to-purple-500/20 px-6 py-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center">
                <Zap className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">Fluxo de Criação da Aula</h2>
                <p className="text-sm text-gray-400">
                  {workflowState?.requestId ? `ID: ${workflowState.requestId.substring(0, 20)}...` : 'Aguardando...'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>
        </div>

        <div className="px-6 py-4">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Progresso geral</span>
              <span className="text-sm font-medium text-orange-400">{animatedProgress}%</span>
            </div>
            <div className="h-3 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 ease-out rounded-full"
                style={{ width: `${animatedProgress}%` }}
              />
            </div>
          </div>

          <div className="space-y-3">
            {Object.entries(WORKFLOW_STEPS).map(([num, name]) => {
              const stepNumber = parseInt(num);
              const status = getStepStatus(stepNumber);
              const duration = getStepDuration(stepNumber);

              return (
                <div
                  key={stepNumber}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                    status === 'running'
                      ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10'
                      : status === 'completed'
                      ? 'bg-green-500/10 border-green-500/30'
                      : status === 'error'
                      ? 'bg-red-500/10 border-red-500/30'
                      : 'bg-gray-800/50 border-gray-700/50'
                  }`}
                >
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(status)}`}>
                    {getStatusIcon(status)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className={`font-medium ${
                        status === 'running' ? 'text-orange-400' :
                        status === 'completed' ? 'text-green-400' :
                        status === 'error' ? 'text-red-400' :
                        'text-gray-400'
                      }`}>
                        Etapa {stepNumber}
                      </span>
                      <span className="text-gray-300">{name}</span>
                    </div>
                    {status === 'running' && (
                      <p className="text-sm text-orange-400/70 mt-1">Processando...</p>
                    )}
                    {status === 'error' && workflowState?.steps[stepNumber]?.error && (
                      <p className="text-sm text-red-400/70 mt-1">
                        {workflowState.steps[stepNumber].error}
                      </p>
                    )}
                  </div>

                  <div className="text-right">
                    {duration !== null && (
                      <span className="text-sm text-gray-500">{formatDuration(duration)}</span>
                    )}
                  </div>

                  <div className="text-gray-500/50">
                    {STEP_ICONS[stepNumber]}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-900/50 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              {workflowState?.totalDuration && (
                <span>Tempo total: {formatDuration(workflowState.totalDuration)}</span>
              )}
            </div>
            <div className="flex gap-2">
              {workflowState?.isComplete && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors"
                >
                  Concluído
                </button>
              )}
              {workflowState?.hasError && (
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors"
                >
                  Fechar
                </button>
              )}
              {isLoading && !workflowState?.isComplete && !workflowState?.hasError && (
                <div className="flex items-center gap-2 text-orange-400">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Processando...</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkflowModal;
