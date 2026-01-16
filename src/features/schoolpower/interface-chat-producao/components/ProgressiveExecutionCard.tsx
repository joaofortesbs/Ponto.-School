import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ChevronRight, AlertCircle, ShieldCheck, ShieldAlert } from 'lucide-react';
import { NarrativeReflectionCard, LoadingReflection } from './NarrativeReflectionCard';
import { DebugIcon } from '../debug-system/DebugIcon';
import { useDebugStore } from '../debug-system/DebugStore';
import { ConstructionInterface } from '../construction-interface';
import type { ActivityToBuild } from '../construction-interface';
import { DataConfirmationBadge } from './DataConfirmationBadge';
import type { DataConfirmation } from '../../agente-jota/capabilities/shared/types';
import { useChosenActivitiesStore } from '../stores/ChosenActivitiesStore';

export type CapabilityStatus = 'hidden' | 'pending' | 'executing' | 'completed' | 'error';
export type ObjectiveStatus = 'pending' | 'active' | 'completed';

export interface CapabilityItem {
  id: string;
  nome: string;
  displayName?: string;
  status: CapabilityStatus;
  dataConfirmation?: DataConfirmation;
}

export interface ObjectiveReflection {
  id: string;
  objectiveTitle: string;
  narrative: string;
  tone: 'celebratory' | 'cautious' | 'explanatory' | 'reassuring';
  highlights: string[];
  isLoading?: boolean;
}

export interface ObjectiveItem {
  ordem: number;
  titulo: string;
  descricao: string;
  status: ObjectiveStatus;
  capabilities: CapabilityItem[];
  reflection?: ObjectiveReflection;
}

interface ProgressiveExecutionCardProps {
  objectives: ObjectiveItem[];
  reflections?: Map<number, ObjectiveReflection>;
  loadingReflections?: Set<number>;
  onObjectiveComplete?: (index: number) => void;
  onAllComplete?: () => void;
  activitiesToBuild?: ActivityToBuild[];
  completedActivities?: ActivityToBuild[];
  onBuildActivities?: () => void;
  isBuildingActivities?: boolean;
}

const ObjectiveCard: React.FC<{
  objective: ObjectiveItem;
  index: number;
  isVisible: boolean;
  reflection?: ObjectiveReflection;
  isLoadingReflection?: boolean;
  activitiesToBuild?: ActivityToBuild[];
  completedActivities?: ActivityToBuild[];
  onBuildActivities?: () => void;
  isBuildingActivities?: boolean;
}> = ({ objective, index, isVisible, reflection, isLoadingReflection, activitiesToBuild = [], completedActivities = [], onBuildActivities, isBuildingActivities = false }) => {
  const isCompleted = objective.status === 'completed';
  const isActive = objective.status === 'active';
  const showReflectionSlot = isCompleted || isLoadingReflection;

  if (!isVisible) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full"
    >
      <div
        className={`
          relative flex items-center gap-4 px-6 py-4 rounded-full
          border-2 transition-all duration-500 mb-3
          ${isCompleted 
            ? 'bg-emerald-500/20 border-emerald-400 shadow-lg shadow-emerald-500/20' 
            : isActive 
            ? 'bg-[#FF6B35]/20 border-[#FF6B35] shadow-lg shadow-[#FF6B35]/20' 
            : 'bg-gray-700/30 border-gray-600/50'}
        `}
      >
        <motion.div
          className={`
            flex items-center justify-center w-8 h-8 rounded-full
            border-2 transition-all duration-300
            ${isCompleted 
              ? 'bg-emerald-500 border-emerald-400' 
              : isActive 
              ? 'bg-[#FF6B35] border-[#FF6B35]' 
              : 'bg-gray-600 border-gray-500'}
          `}
          animate={isActive ? { scale: [1, 1.1, 1] } : {}}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
        >
          <AnimatePresence mode="wait">
            {isCompleted ? (
              <motion.div
                key="check"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0 }}
                transition={{ duration: 0.3, ease: 'backOut' }}
              >
                <Check className="w-4 h-4 text-emerald-500 stroke-[3]" />
              </motion.div>
            ) : isActive ? (
              <motion.div
                key="active"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-3 h-3 rounded-full bg-white"
              />
            ) : null}
          </AnimatePresence>
        </motion.div>

        <span className="flex-1 text-white font-semibold text-sm md:text-base text-center pr-8">
          {objective.titulo}
        </span>

        <motion.div
          animate={isActive ? { x: [0, 4, 0] } : {}}
          transition={{ duration: 1, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute right-4"
        >
          <ChevronRight className="w-5 h-5 text-white/80" />
        </motion.div>
      </div>

      <AnimatePresence mode="sync">
        {objective.capabilities
          .filter(cap => cap.status !== 'hidden')
          .map((capability, capIndex) => (
            <CapabilityCard 
              key={capability.id} 
              capability={capability}
              index={capIndex}
              activitiesToBuild={activitiesToBuild}
              completedActivities={completedActivities}
              onBuildActivities={onBuildActivities}
              isBuildingActivities={isBuildingActivities}
            />
          ))}
      </AnimatePresence>

      <AnimatePresence>
        {showReflectionSlot && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="mt-2"
          >
            {isLoadingReflection && !reflection ? (
              <LoadingReflection />
            ) : reflection ? (
              <NarrativeReflectionCard
                id={reflection.id}
                objectiveTitle={reflection.objectiveTitle}
                narrative={reflection.narrative}
                tone={reflection.tone}
                highlights={reflection.highlights}
                onComplete={() => {
                  console.log(`📝 [ObjectiveCard] Reflexão ${index} exibida`);
                }}
              />
            ) : null}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

const CapabilityCard: React.FC<{
  capability: CapabilityItem;
  index: number;
  activitiesToBuild?: ActivityToBuild[];
  completedActivities?: ActivityToBuild[];
  onBuildActivities?: () => void;
  isBuildingActivities?: boolean;
}> = ({ capability, index, activitiesToBuild = [], completedActivities = [], onBuildActivities, isBuildingActivities = false }) => {
  const debugStore = useDebugStore();
  const isPending = capability.status === 'pending';
  const isExecuting = capability.status === 'executing';
  const isCompleted = capability.status === 'completed';
  const isError = capability.status === 'error';

  // Estado local para gerenciar status das atividades com eventos de progresso
  const [localActivities, setLocalActivities] = useState<ActivityToBuild[]>(activitiesToBuild);

  // Sincronizar com props quando mudarem
  useEffect(() => {
    setLocalActivities(activitiesToBuild);
  }, [activitiesToBuild]);

  // Escutar eventos de progresso do BuildController
  useEffect(() => {
    const handleProgress = (event: CustomEvent) => {
      const { activityId, progress, message } = event.detail || {};
      if (!activityId) return;
      
      setLocalActivities(prev => prev.map(a => 
        (a.activity_id === activityId || a.id === activityId)
          ? { ...a, status: 'building' as const, progress, progressMessage: message }
          : a
      ));
    };

    const handleCompleted = (event: CustomEvent) => {
      const { activityId, data } = event.detail || {};
      if (!activityId) return;
      
      setLocalActivities(prev => prev.map(a => 
        (a.activity_id === activityId || a.id === activityId)
          ? { ...a, status: 'completed' as const, progress: 100, built_data: data }
          : a
      ));
    };

    const handleError = (event: CustomEvent) => {
      const { activityId, error } = event.detail || {};
      if (!activityId) return;
      
      setLocalActivities(prev => prev.map(a => 
        (a.activity_id === activityId || a.id === activityId)
          ? { ...a, status: 'error' as const, error_message: error }
          : a
      ));
    };

    window.addEventListener('construction:activity_progress', handleProgress as EventListener);
    window.addEventListener('construction:activity_completed', handleCompleted as EventListener);
    window.addEventListener('construction:activity_error', handleError as EventListener);

    return () => {
      window.removeEventListener('construction:activity_progress', handleProgress as EventListener);
      window.removeEventListener('construction:activity_completed', handleCompleted as EventListener);
      window.removeEventListener('construction:activity_error', handleError as EventListener);
    };
  }, []);

  // Callback para atualizar status via ConstructionInterface
  const handleActivityStatusChange = (activityId: string, status: string, progress?: number, message?: string) => {
    setLocalActivities(prev => prev.map(a => 
      (a.activity_id === activityId || a.id === activityId)
        ? { 
            ...a, 
            status: status as ActivityToBuild['status'], 
            progress, 
            progressMessage: message 
          }
        : a
    ));
  };

  const isCriarAtividade = capability.nome.toLowerCase().includes('criar_atividade') || 
                           capability.nome.toLowerCase().includes('criar_atividades') ||
                           capability.id.toLowerCase().includes('criar_atividade');

  const isGerarConteudo = capability.nome.toLowerCase().includes('gerar_conteudo') ||
                          capability.id.toLowerCase().includes('gerar_conteudo');

  const shouldShowConstructionInterface = isCriarAtividade && 
    (isExecuting || isCompleted) && 
    activitiesToBuild.length > 0;

  // Usar activitiesToBuild para ContentGeneration (atividades decididas, não construídas)
  // O ContentGenerationCard é exibido DENTRO do tópico "Decidir quais atividades criar",
  // logo após a capability decidir_atividades_criar completar e ANTES da Interface de Construção
  const shouldShowContentGeneration = isGerarConteudo && 
    (isExecuting || isCompleted) && 
    activitiesToBuild.length > 0;

  const sessionId = useChosenActivitiesStore(state => state.sessionId) || '';
  const estrategiaPedagogica = useChosenActivitiesStore(state => state.estrategiaPedagogica);

  const debugEntries = debugStore.getEntriesForCapability(capability.id);

  return (
    <motion.div
      initial={{ opacity: 0, x: -20, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 20, height: 0 }}
      transition={{ 
        duration: 0.35, 
        delay: index * 0.08,
        ease: [0.25, 0.46, 0.45, 0.94]
      }}
      className="ml-8 overflow-hidden"
    >
      <div
        className={`
          relative flex items-center gap-3 px-4 py-3 rounded-2xl
          border-2 transition-all duration-300 mb-2
          ${isCompleted 
            ? 'border-emerald-400 bg-emerald-500/15 border-solid' 
            : isError
            ? 'border-red-400/60 bg-red-500/10 border-dashed'
            : isExecuting
            ? 'border-[#FF6B35]/60 bg-[#FF6B35]/10 border-dashed'
            : isPending
            ? 'border-gray-500/40 bg-gray-500/5 border-dashed'
            : 'border-[#FF6B35]/40 bg-[#FF6B35]/5 border-dashed'}
        `}
      >
        <div className="flex items-center justify-center w-6 h-6">
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-4 h-4 rounded-full border-2 border-gray-500/50"
              />
            )}
            {isExecuting && (
              <motion.div
                key="spinner"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
              >
                <Loader2 className="w-4 h-4 text-[#FF6B35] animate-spin" />
              </motion.div>
            )}
            {isCompleted && (
              <motion.div
                key="check"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <Check className="w-4 h-4 text-emerald-400 stroke-[3]" />
              </motion.div>
            )}
            {isError && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <AlertCircle className="w-4 h-4 text-red-400" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <span
          className={`
            flex-1 text-sm font-medium transition-colors duration-300
            ${isCompleted 
              ? 'text-emerald-300' 
              : isError
              ? 'text-red-300'
              : isExecuting
              ? 'text-[#FF6B35]'
              : 'text-gray-500'}
          `}
        >
          {capability.displayName || capability.nome}
        </span>

        {isExecuting && (
          <motion.div
            className="flex gap-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-[#FF6B35]"
                animate={{ opacity: [0.3, 1, 0.3] }}
                transition={{
                  duration: 1,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            ))}
          </motion.div>
        )}

        <DebugIcon
          capabilityId={capability.id}
          capabilityName={capability.displayName || capability.nome}
          entries={debugEntries}
          className="ml-2"
        />

        {isCompleted && capability.dataConfirmation && (
          <DataConfirmationBadge
            confirmation={capability.dataConfirmation}
            compact={true}
          />
        )}
      </div>

      {isCompleted && capability.dataConfirmation && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="ml-4 mt-1 mb-2"
        >
          <DataConfirmationBadge
            confirmation={capability.dataConfirmation}
            capabilityName={capability.displayName || capability.nome}
            compact={false}
            showDetails={true}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {shouldShowConstructionInterface && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-2 mb-3"
          >
            <ConstructionInterface
              activities={localActivities}
              isBuilding={isBuildingActivities}
              onBuildAll={onBuildActivities || (() => {})}
              onActivityStatusChange={handleActivityStatusChange}
              autoStart={true}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* 
        ContentGenerationCard REMOVIDO daqui - a geração de conteúdo agora é 
        exibida APENAS como sub-card retangular dentro do tópico "Decidir quais 
        atividades criar", através do sistema de capabilities (gerar_conteudo_atividades).
        Não deve haver card roxo separado.
      */}
    </motion.div>
  );
};

export function ProgressiveExecutionCard({
  objectives,
  reflections,
  loadingReflections,
  onObjectiveComplete,
  onAllComplete,
  activitiesToBuild = [],
  completedActivities = [],
  onBuildActivities,
  isBuildingActivities = false,
}: ProgressiveExecutionCardProps) {
  const [visibleObjectives, setVisibleObjectives] = useState<Set<number>>(new Set([0]));
  const [prevObjectives, setPrevObjectives] = useState<ObjectiveItem[]>(objectives);

  useEffect(() => {
    objectives.forEach((obj, idx) => {
      if (obj.status === 'active' || obj.status === 'completed') {
        setVisibleObjectives(prev => {
          if (prev.has(idx)) return prev;
          return new Set([...prev, idx]);
        });
      }

      const prevObj = prevObjectives[idx];
      if (prevObj && prevObj.status !== 'completed' && obj.status === 'completed') {
        onObjectiveComplete?.(idx);
      }
    });

    const allCompleted = objectives.length > 0 && objectives.every(obj => obj.status === 'completed');
    const wasNotAllCompleted = prevObjectives.length === 0 || !prevObjectives.every(obj => obj.status === 'completed');
    
    if (allCompleted && wasNotAllCompleted) {
      onAllComplete?.();
    }

    setPrevObjectives(objectives);
  }, [objectives, onObjectiveComplete, onAllComplete, prevObjectives]);

  useEffect(() => {
    const handleStepStarted = (event: CustomEvent) => {
      const update = event.detail;
      if (update.type === 'execution:step:started') {
        const stepIndex = update.stepIndex ?? 0;
        setVisibleObjectives(prev => new Set([...prev, stepIndex]));
      }
    };

    window.addEventListener('agente-jota-progress', handleStepStarted as EventListener);
    return () => {
      window.removeEventListener('agente-jota-progress', handleStepStarted as EventListener);
    };
  }, []);

  console.log('📊 [ProgressiveExecutionCard] Renderizando com objectives:', 
    objectives.map(o => ({
      titulo: o.titulo,
      status: o.status,
      caps: o.capabilities.map(c => ({ id: c.id, status: c.status }))
    }))
  );

  return (
    <div className="w-full space-y-4">
      <AnimatePresence mode="sync">
        {objectives.map((objective, idx) => (
          <ObjectiveCard
            key={`objective-${idx}`}
            objective={objective}
            index={idx}
            isVisible={visibleObjectives.has(idx)}
            reflection={reflections?.get(idx)}
            isLoadingReflection={loadingReflections?.has(idx)}
            activitiesToBuild={activitiesToBuild}
            completedActivities={completedActivities}
            onBuildActivities={onBuildActivities}
            isBuildingActivities={isBuildingActivities}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}

export default ProgressiveExecutionCard;
