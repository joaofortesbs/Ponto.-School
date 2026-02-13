import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Check, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { NarrativeReflectionCard, LoadingReflection } from './NarrativeReflectionCard';
import { DebugIcon } from '../debug-system/DebugIcon';
import { useDebugStore } from '../debug-system/DebugStore';
import { ConstructionInterface } from '../construction-interface';
import type { ActivityToBuild } from '../construction-interface';
import { DataConfirmationBadge } from './DataConfirmationBadge';
import type { DataConfirmation } from '../../agente-jota/capabilities/shared/types';
import { useChosenActivitiesStore } from '../stores/ChosenActivitiesStore';
import { getCapabilityIcon } from './CapabilityIcons';

const CAPABILITY_CARD_HEIGHT = 32;
const OBJECTIVE_CARD_PADDING_Y = '10px';
const OBJECTIVE_CARD_BG_COLOR = 'rgba(249, 115, 22, 0.15)';
const CAPABILITY_CARD_BG_COLOR = 'rgba(249, 115, 22, 0.10)';
const CAPABILITY_ICON_COLOR = '#FF6800';

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
  const [isExpanded, setIsExpanded] = useState(true);
  const isCompleted = objective.status === 'completed';
  const isActive = objective.status === 'active';
  const showReflectionSlot = isCompleted || isLoadingReflection;

  if (!isVisible) return null;

  const handleToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -20, scale: 0.95 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="w-full pl-11"
    >
      <motion.div
        onClick={handleToggle}
        className={`
          relative flex items-center gap-4 pl-3 pr-6 rounded-full cursor-pointer
          transition-all duration-300 mb-3 select-none
          ${isCompleted 
            ? 'shadow-lg shadow-emerald-500/20' 
            : isActive 
            ? 'shadow-lg shadow-[#FF6B35]/20' 
            : ''}
          hover:scale-[1.01] active:scale-[0.99]
        `}
        style={{
          paddingTop: OBJECTIVE_CARD_PADDING_Y,
          paddingBottom: OBJECTIVE_CARD_PADDING_Y,
          background: isCompleted 
            ? 'rgba(16, 185, 129, 0.2)' 
            : `linear-gradient(${OBJECTIVE_CARD_BG_COLOR}, ${OBJECTIVE_CARD_BG_COLOR}) padding-box, linear-gradient(135deg, #FFD05A, #E3560B, #A62F00) border-box`,
          border: isCompleted 
            ? '2px solid #34d399' 
            : '2px solid transparent',
        }}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
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
                <Check className="w-4 h-4 text-white stroke-[3]" />
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
          animate={{ rotate: isExpanded ? 180 : 0 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="absolute right-4"
        >
          <ChevronDown className="w-5 h-5 text-white/80" />
        </motion.div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="overflow-hidden"
          >
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

  const [localActivities, setLocalActivities] = useState<ActivityToBuild[]>(activitiesToBuild);

  useEffect(() => {
    setLocalActivities(activitiesToBuild);
  }, [activitiesToBuild]);

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

  const shouldShowContentGeneration = isGerarConteudo && 
    (isExecuting || isCompleted) && 
    activitiesToBuild.length > 0;

  const sessionId = useChosenActivitiesStore(state => state.sessionId) || '';
  const estrategiaPedagogica = useChosenActivitiesStore(state => state.estrategiaPedagogica);

  const debugEntries = debugStore.getEntriesForCapability(capability.id);

  const iconConfig = getCapabilityIcon(capability.nome || capability.id);
  const IconComponent = iconConfig.icon;

  return (
    <motion.div
      initial={{ opacity: 0, x: -10, height: 0 }}
      animate={{ opacity: 1, x: 0, height: 'auto' }}
      exit={{ opacity: 0, x: 10, height: 0 }}
      transition={{ 
        duration: 0.3, 
        delay: index * 0.06,
        ease: 'easeOut'
      }}
      className="overflow-hidden mb-2 pl-2"
    >
      <div
        className={`
          inline-flex items-center gap-2.5 pl-2 pr-4 rounded-full
          transition-all duration-300
          ${isError ? 'border border-red-400/50 bg-red-500/10' : ''}
        `}
        style={{
          height: `${CAPABILITY_CARD_HEIGHT}px`,
          paddingTop: '4px',
          paddingBottom: '4px',
          background: isCompleted 
            ? 'rgba(16, 185, 129, 0.1)' 
            : isError 
            ? undefined 
            : `linear-gradient(${CAPABILITY_CARD_BG_COLOR}, ${CAPABILITY_CARD_BG_COLOR}) padding-box, linear-gradient(135deg, #7F5009, #772200) border-box`,
          border: isCompleted 
            ? '1px solid rgba(52, 211, 153, 0.5)' 
            : isError 
            ? undefined 
            : '1px solid transparent',
        }}
      >
        <div className="flex items-center justify-center w-5 h-5">
          <AnimatePresence mode="wait">
            {isPending && (
              <motion.div
                key="pending"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0 }}
                className="w-3 h-3 rounded-full border-2 border-gray-500/50"
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
                key="icon"
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: 'spring', stiffness: 500, damping: 25 }}
              >
                <IconComponent className="w-4 h-4" style={{ color: CAPABILITY_ICON_COLOR }} />
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
            text-sm font-medium transition-colors duration-300
            ${isCompleted 
              ? 'text-emerald-300' 
              : isError
              ? 'text-red-300'
              : isExecuting
              ? 'text-[#FF6B35]'
              : 'text-gray-400'}
          `}
        >
          {capability.displayName || capability.nome}
        </span>

        {isExecuting && (
          <motion.div
            className="flex gap-1 ml-1"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="w-1 h-1 rounded-full bg-[#FF6B35]"
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
          className="ml-1"
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
          className="mt-1 mb-2 pl-1"
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
    </motion.div>
  );
};

const NarrativeText: React.FC<{ text: string }> = ({ text }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, ease: 'easeOut' }}
    className="px-2 py-1"
  >
    <p className="text-sm text-gray-400 leading-relaxed italic">
      {text}
    </p>
  </motion.div>
);

const ReplanNotice: React.FC<{ reason: string }> = ({ reason }) => (
  <motion.div
    initial={{ opacity: 0, y: 8 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.4, ease: 'easeOut' }}
    className="px-2 py-1"
  >
    <p className="text-sm text-gray-400 leading-relaxed italic">
      {reason}
    </p>
  </motion.div>
);

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
  const [narratives, setNarratives] = useState<Map<number, string>>(new Map());
  const [replanNotices, setReplanNotices] = useState<Map<number, string>>(new Map());

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
    const handleProgressEvent = (event: CustomEvent) => {
      const update = event.detail;
      
      if (update.type === 'execution:step:started') {
        const stepIndex = update.stepIndex ?? 0;
        setVisibleObjectives(prev => new Set([...prev, stepIndex]));
      }
      
      if (update.type === 'execution:narrative' && update.narrativeText) {
        const stepIndex = update.stepIndex ?? 0;
        setNarratives(prev => new Map(prev).set(stepIndex, update.narrativeText));
      }
      
      if (update.type === 'execution:replan' && update.replanReason) {
        const stepIndex = update.stepIndex ?? 0;
        setReplanNotices(prev => new Map(prev).set(stepIndex, update.replanReason));
      }
    };

    window.addEventListener('agente-jota-progress', handleProgressEvent as EventListener);
    return () => {
      window.removeEventListener('agente-jota-progress', handleProgressEvent as EventListener);
    };
  }, []);

  return (
    <div className="w-full space-y-4">
      {objectives.map((objective, idx) => (
        <React.Fragment key={`objective-group-${idx}`}>
          <ObjectiveCard
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
          
          {narratives.has(idx) && objective.status === 'completed' && (
            <NarrativeText key={`narrative-${idx}`} text={narratives.get(idx)!} />
          )}
          
          {replanNotices.has(idx) && (
            <ReplanNotice key={`replan-${idx}`} reason={replanNotices.get(idx)!} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

export default ProgressiveExecutionCard;
