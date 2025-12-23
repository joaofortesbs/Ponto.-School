/**
 * ====================================================================
 * MODAL DE VISUALIZAÇÃO DO WORKFLOW DE CRIAÇÃO DE AULA v2.0
 * ====================================================================
 * 
 * Modal com logs detalhados por etapa, validação visual e
 * sistema de diagnóstico integrado.
 * 
 * VERSÃO: 2.0.0 - Com dropdown de logs e validação
 * ====================================================================
 */

import React, { useState, useEffect } from 'react';
import { 
  X, Check, Loader2, AlertCircle, Clock, Zap, FileText, 
  Lightbulb, Settings, Save, Link, CheckCircle, ChevronDown,
  ChevronUp, Info, AlertTriangle, RefreshCw, Bug
} from 'lucide-react';
import { WorkflowState, WORKFLOW_STEPS, StepLogs, LogEvent, LogEventType } from '../types';

interface WorkflowModalProps {
  isOpen: boolean;
  onClose: () => void;
  workflowState: WorkflowState | null;
  isLoading?: boolean;
  stepLogs?: Record<number, StepLogs>;
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

const LOG_TYPE_COLORS: Record<LogEventType, string> = {
  INFO: 'text-blue-400',
  SUCCESS: 'text-green-400',
  WARNING: 'text-yellow-400',
  ERROR: 'text-red-400',
  RETRY: 'text-orange-400',
  DEBUG: 'text-gray-400'
};

const LOG_TYPE_ICONS: Record<LogEventType, React.ReactNode> = {
  INFO: <Info className="w-3 h-3" />,
  SUCCESS: <Check className="w-3 h-3" />,
  WARNING: <AlertTriangle className="w-3 h-3" />,
  ERROR: <AlertCircle className="w-3 h-3" />,
  RETRY: <RefreshCw className="w-3 h-3" />,
  DEBUG: <Bug className="w-3 h-3" />
};

const StepLogsDropdown: React.FC<{ logs: StepLogs | undefined; isOpen: boolean }> = ({ logs, isOpen }) => {
  if (!isOpen || !logs) return null;

  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    const base = date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit'
    });
    const ms = date.getMilliseconds().toString().padStart(3, '0');
    return `${base}.${ms}`;
  };

  return (
    <div className="mt-3 bg-gray-900/80 rounded-lg border border-gray-700 overflow-hidden">
      <div className="p-3 border-b border-gray-700 flex items-center justify-between">
        <span className="text-sm font-medium text-gray-300">Logs da Etapa</span>
        <div className="flex items-center gap-2 text-xs">
          {logs.retryCount > 0 && (
            <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 rounded">
              {logs.retryCount} retry(s)
            </span>
          )}
          {logs.validationChecks?.length > 0 && (
            <span className="px-2 py-0.5 bg-blue-500/20 text-blue-400 rounded">
              {logs.validationChecks.filter(c => c.passed).length}/{logs.validationChecks.length} validações
            </span>
          )}
        </div>
      </div>
      
      <div className="max-h-48 overflow-y-auto">
        {logs.events?.length > 0 ? (
          <div className="divide-y divide-gray-800">
            {logs.events.map((event, idx) => (
              <div key={idx} className="p-2 hover:bg-gray-800/50">
                <div className="flex items-start gap-2">
                  <span className={`flex-shrink-0 mt-0.5 ${LOG_TYPE_COLORS[event.type]}`}>
                    {LOG_TYPE_ICONS[event.type]}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`text-xs font-medium ${LOG_TYPE_COLORS[event.type]}`}>
                        {event.type}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(event.timestamp)}
                      </span>
                      <span className="text-xs text-gray-600">
                        +{event.relativeTime}ms
                      </span>
                    </div>
                    <p className="text-sm text-gray-300 mt-0.5 break-words">
                      {event.message}
                    </p>
                    {event.data && Object.keys(event.data).length > 0 && (
                      <pre className="mt-1 text-xs text-gray-500 bg-gray-900 p-1 rounded overflow-x-auto">
                        {JSON.stringify(event.data, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500 text-sm">
            Nenhum log registrado ainda
          </div>
        )}
      </div>

      {logs.lastError && (
        <div className="p-3 bg-red-500/10 border-t border-red-500/30">
          <div className="flex items-center gap-2 text-red-400 text-sm">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">Último Erro:</span>
          </div>
          <p className="text-sm text-red-300 mt-1">{logs.lastError.message}</p>
        </div>
      )}

      {logs.validationChecks && logs.validationChecks.length > 0 && (
        <div className="p-3 border-t border-gray-700">
          <p className="text-xs font-medium text-gray-400 mb-2">Validações:</p>
          <div className="flex flex-wrap gap-1">
            {logs.validationChecks.map((check, idx) => (
              <span
                key={idx}
                className={`px-2 py-0.5 text-xs rounded ${
                  check.passed 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}
              >
                {check.passed ? '✓' : '✗'} {check.name}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const WorkflowModal: React.FC<WorkflowModalProps> = ({
  isOpen,
  onClose,
  workflowState,
  isLoading = false,
  stepLogs = {}
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [expandedSteps, setExpandedSteps] = useState<Record<number, boolean>>({});

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
      case 'retrying': return 'bg-yellow-500';
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
      case 'retrying':
        return <RefreshCw className="w-4 h-4 text-white animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
    }
  };

  const toggleStepLogs = (stepNumber: number) => {
    setExpandedSteps(prev => ({
      ...prev,
      [stepNumber]: !prev[stepNumber]
    }));
  };

  const getStepLogs = (stepNumber: number): StepLogs | undefined => {
    if (stepLogs && stepLogs[stepNumber]) {
      return stepLogs[stepNumber];
    }
    const step = workflowState?.steps[stepNumber];
    return step?.logs;
  };

  const hasLogs = (stepNumber: number): boolean => {
    const logs = getStepLogs(stepNumber);
    return !!logs && (logs.events?.length > 0 || logs.lastError !== null);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative w-full max-w-2xl mx-4 bg-[#1a1a2e] rounded-2xl shadow-2xl border border-orange-500/20 overflow-hidden max-h-[90vh] flex flex-col">
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

        <div className="px-6 py-4 flex-1 overflow-y-auto">
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
              const isExpanded = expandedSteps[stepNumber];
              const logs = getStepLogs(stepNumber);
              const showLogIndicator = hasLogs(stepNumber) || status === 'running' || status === 'error' || status === 'retrying';

              return (
                <div key={stepNumber}>
                  <div
                    className={`flex items-center gap-4 p-4 rounded-xl border transition-all duration-300 ${
                      status === 'running'
                        ? 'bg-orange-500/10 border-orange-500/40 shadow-lg shadow-orange-500/10'
                        : status === 'completed'
                        ? 'bg-green-500/10 border-green-500/30'
                        : status === 'error'
                        ? 'bg-red-500/10 border-red-500/30'
                        : status === 'retrying'
                        ? 'bg-yellow-500/10 border-yellow-500/30'
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
                          status === 'retrying' ? 'text-yellow-400' :
                          'text-gray-400'
                        }`}>
                          Etapa {stepNumber}
                        </span>
                        <span className="text-gray-300">{name}</span>
                      </div>
                      {status === 'running' && (
                        <p className="text-sm text-orange-400/70 mt-1">Processando...</p>
                      )}
                      {status === 'retrying' && logs?.retryCount && (
                        <p className="text-sm text-yellow-400/70 mt-1">
                          Tentativa {logs.retryCount + 1} de 3...
                        </p>
                      )}
                      {status === 'error' && workflowState?.steps[stepNumber]?.error && (
                        <p className="text-sm text-red-400/70 mt-1">
                          {workflowState.steps[stepNumber].error}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      {duration !== null && (
                        <span className="text-sm text-gray-500">{formatDuration(duration)}</span>
                      )}
                      
                      {showLogIndicator && (
                        <button
                          onClick={() => toggleStepLogs(stepNumber)}
                          className={`p-1.5 rounded-lg transition-colors ${
                            isExpanded 
                              ? 'bg-orange-500/20 text-orange-400' 
                              : 'hover:bg-white/10 text-gray-400'
                          }`}
                          title="Ver logs da etapa"
                        >
                          {status === 'error' ? (
                            <AlertCircle className="w-4 h-4 text-red-400" />
                          ) : (
                            <Info className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      <div className="text-gray-500/50">
                        {STEP_ICONS[stepNumber]}
                      </div>

                      {showLogIndicator && (
                        <button
                          onClick={() => toggleStepLogs(stepNumber)}
                          className="p-1 text-gray-500 hover:text-gray-300"
                        >
                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <StepLogsDropdown logs={logs} isOpen={isExpanded} />
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
