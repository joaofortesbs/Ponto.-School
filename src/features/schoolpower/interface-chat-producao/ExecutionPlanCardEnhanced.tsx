/**
 * EXECUTION PLAN CARD ENHANCED - Card Visual do Plano de Execução
 * 
 * Versão melhorada com:
 * - Debug Icon em cada etapa
 * - Interface de Construção para capability criar_atividade
 * - Integração com sistema de debug narrativo
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bot, 
  Target, 
  Play, 
  Check, 
  Loader2, 
  AlertCircle,
  ChevronRight,
  Package
} from 'lucide-react';
import type { ExecutionPlan, ExecutionStep } from './types';
import { DebugIcon } from './debug-system/DebugIcon';
import { useDebugStore } from './debug-system/DebugStore';
import { ConstructionInterface } from './construction-interface';
import type { ActivityToBuild } from './construction-interface';

interface ExecutionPlanCardEnhancedProps {
  plan: ExecutionPlan;
  onExecute: () => void;
  isExecuting: boolean;
  currentStep: number | null;
  activitiesToBuild?: ActivityToBuild[];
  onBuildActivities?: () => void;
  isBuildingActivities?: boolean;
}

export function ExecutionPlanCardEnhanced({ 
  plan, 
  onExecute, 
  isExecuting, 
  currentStep,
  activitiesToBuild = [],
  onBuildActivities,
  isBuildingActivities = false
}: ExecutionPlanCardEnhancedProps) {

  const debugStore = useDebugStore();

  const getStepIcon = (step: ExecutionStep) => {
    if (step.status === 'concluida') {
      return <Check className="w-4 h-4 text-green-400" />;
    }
    if (step.status === 'executando') {
      return <Loader2 className="w-4 h-4 text-yellow-400 animate-spin" />;
    }
    if (step.status === 'erro') {
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    }
    return <span className="text-white/60 font-bold">{step.ordem}</span>;
  };

  const getStepStatusColor = (step: ExecutionStep) => {
    if (step.status === 'concluida') return 'border-green-500/30 bg-green-500/10';
    if (step.status === 'executando') return 'border-yellow-500/30 bg-yellow-500/10';
    if (step.status === 'erro') return 'border-red-500/30 bg-red-500/10';
    return 'border-white/10 bg-white/5';
  };

  const isCompleted = plan.status === 'concluido';
  const hasError = plan.status === 'erro';
  
  const shouldShowConstructionInterface = (step: ExecutionStep) => {
    return (
      step.funcao === 'criar_atividade' || 
      step.funcao === 'criar_atividades'
    ) && (
      step.status === 'executando' || 
      step.status === 'concluida'
    ) && activitiesToBuild.length > 0;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-gradient-to-br from-purple-900/40 to-blue-900/40 backdrop-blur-xl rounded-2xl border border-purple-500/20 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-white font-semibold">
              {isCompleted 
                ? 'Plano Executado' 
                : isExecuting 
                  ? 'Executando Plano...'
                  : 'Vou executar o seu plano de ação'}
            </h3>
            <p className="text-white/50 text-sm">
              {plan.etapas.length} etapas planejadas
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 border-b border-white/10">
        <div className="flex items-start gap-3">
          <Target className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" />
          <div>
            <span className="text-white/50 text-sm">Objetivo:</span>
            <p className="text-white font-medium mt-1">{plan.objetivo}</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3">
        <h4 className="text-white/70 text-sm font-medium uppercase tracking-wider">
          Etapas do Plano
        </h4>
        
        {plan.etapas.map((etapa, idx) => (
          <React.Fragment key={etapa.ordem}>
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className={`relative flex items-start gap-3 p-3 rounded-xl border transition-all ${getStepStatusColor(etapa)}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                etapa.status === 'executando' 
                  ? 'bg-yellow-500/20 border border-yellow-500/30' 
                  : etapa.status === 'concluida'
                    ? 'bg-green-500/20 border border-green-500/30'
                    : 'bg-white/10 border border-white/20'
              }`}>
                {getStepIcon(etapa)}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-medium">{etapa.descricao}</p>
                <div className="flex items-center gap-2 mt-1">
                  <ChevronRight className="w-3 h-3 text-purple-400" />
                  <span className="text-purple-400 text-sm font-mono">
                    {etapa.funcao}
                  </span>
                </div>
                {etapa.resultado && (
                  <div className="mt-2 p-2 bg-green-500/10 rounded-lg border border-green-500/20">
                    <p className="text-green-400 text-sm">
                      {typeof etapa.resultado === 'string' 
                        ? etapa.resultado 
                        : JSON.stringify(etapa.resultado)}
                    </p>
                  </div>
                )}
                {etapa.erro && (
                  <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                    <p className="text-red-400 text-sm">{etapa.erro}</p>
                  </div>
                )}
              </div>

              <DebugIcon
                capabilityId={etapa.funcao}
                capabilityName={etapa.descricao}
                entries={debugStore.getEntriesForCapability(etapa.funcao)}
                className="absolute right-3 top-3"
              />
            </motion.div>

            <AnimatePresence>
              {shouldShowConstructionInterface(etapa) && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="ml-11"
                >
                  <ConstructionInterface
                    activities={activitiesToBuild}
                    isBuilding={isBuildingActivities}
                    onBuildAll={onBuildActivities || (() => {})}
                    onActivityStatusChange={(activityId, status, progress, message) => {
                      console.log(`📊 [ExecutionPlan] Status update: ${activityId} -> ${status} (${progress}%)`);
                    }}
                    autoStart={true}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </React.Fragment>
        ))}
      </div>

      {!isCompleted && !hasError && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onExecute}
            disabled={isExecuting}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl font-medium hover:opacity-90 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Executando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Executar Plano
              </>
            )}
          </button>
        </div>
      )}

      {isCompleted && (
        <div className="p-4 border-t border-green-500/20 bg-green-500/10">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">Plano executado com sucesso!</span>
          </div>
        </div>
      )}
    </motion.div>
  );
}

export default ExecutionPlanCardEnhanced;
