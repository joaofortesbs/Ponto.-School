/**
 * CONSTRUCTION INTERFACE - Interface de Construção de Atividades
 * 
 * Card visual que aparece quando a capability "criar_atividade" executa
 * Mostra as atividades sendo construídas com progresso em tempo real
 * 
 * INTEGRAÇÃO COM BuildController:
 * - Escuta eventos construction:build_activity
 * - Executa construção real via buildActivityFromFormData
 * - Atualiza progresso progressivamente
 * - Emite confirmações reais com chaves localStorage
 */

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Check, 
  AlertCircle, 
  Play,
  ChevronDown,
  ChevronRight,
  Sparkles,
  FileText,
  Clock,
  Zap,
  Edit3,
  Eye,
  Loader2,
  Bug
} from 'lucide-react';
import EditActivityModal, { EditActivityModalHandle } from '../../construction/EditActivityModal';
import { ActivityViewModal } from '../../construction/ActivityViewModal';
import { ActivityDebugModal } from '../../construction/components/ActivityDebugModal';
import { ConstructionActivity } from '../../construction/types';
import { createBuildController } from '../../construction/controllers/BuildController';
import { onBuildProgress, BuildProgressUpdate } from '../../construction/events/constructionEventBus';
import { ModalBridge } from '../../construction/bridge/ModalBridge';
import { useActivityDebugStore } from '../../construction/stores/activityDebugStore';

export type ActivityBuildStatus = 'waiting' | 'building' | 'completed' | 'error';

export interface ActivityToBuild {
  id: string;
  activity_id: string;
  name: string;
  type: string;
  status: ActivityBuildStatus;
  progress?: number;
  fields_completed?: number;
  fields_total?: number;
  error_message?: string;
  built_data?: Record<string, any>;
  progressMessage?: string;
}

interface ConstructionInterfaceProps {
  activities: ActivityToBuild[];
  isBuilding: boolean;
  onBuildAll: () => void;
  onBuildSingle?: (activityId: string) => void;
  onActivityStatusChange?: (activityId: string, status: ActivityBuildStatus, progress?: number, message?: string) => void;
  autoStart?: boolean;
}

/**
 * CONFIGURAÇÃO DE STATUS DAS ATIVIDADES
 * 
 * 4 estados distintos com identidade visual clara:
 * - PENDENTE (cinza): Aguardando sua vez, nenhuma ação acontecendo
 * - CONSTRUINDO (amarelo): Sistema ativo, atividade sendo construída
 * - CONSTRUÍDA (verde): Atividade pronta com conteúdo gerado
 * - FALHA (vermelho): Erro detectado que impediu a construção
 */
const STATUS_CONFIG = {
  waiting: {
    icon: Clock,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/30',
    label: 'Pendente',
    description: 'Aguardando sua vez',
    cardStyle: 'opacity-60 grayscale-[30%]'
  },
  building: {
    icon: Loader2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/15',
    border: 'border-yellow-500/40',
    label: 'Construindo',
    description: 'Sistema ativo',
    cardStyle: 'opacity-100'
  },
  completed: {
    icon: Check,
    color: 'text-green-400',
    bg: 'bg-green-500/15',
    border: 'border-green-500/40',
    label: 'Construída',
    description: 'Pronta para uso',
    cardStyle: 'opacity-100'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/15',
    border: 'border-red-500/40',
    label: 'Falha',
    description: 'Erro na construção',
    cardStyle: 'opacity-100'
  }
};

function ActivityCard({ activity, onBuild, onActivityClick, onViewClick, onDebugClick }: { 
  activity: ActivityToBuild; 
  onBuild?: () => void;
  onActivityClick?: (activity: ActivityToBuild) => void;
  onViewClick?: (activity: ActivityToBuild) => void;
  onDebugClick?: (activity: ActivityToBuild) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = STATUS_CONFIG[activity.status];
  const StatusIcon = config.icon;
  const debugStore = useActivityDebugStore();
  const activityDebug = debugStore.getActivityDebug(activity.activity_id || activity.id);
  const hasDebugLogs = activityDebug && activityDebug.entries.length > 0;

  const handleClick = () => {
    if (onActivityClick) {
      onActivityClick(activity);
    } else if (activity.built_data) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border overflow-hidden transition-all duration-300 ${config.bg} ${config.border} hover:border-orange-500/40 ${config.cardStyle}`}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} border ${config.border} transition-all duration-300`}>
              <StatusIcon className={`w-5 h-5 ${config.color} ${activity.status === 'building' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h4 className={`font-medium text-sm transition-colors ${activity.status === 'waiting' ? 'text-white/60' : 'text-white'}`}>{activity.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-medium ${config.color}`}>
                  {config.label}
                </span>
                {activity.fields_completed !== undefined && activity.fields_total && (
                  <span className="text-white/40 text-xs">
                    • {activity.fields_completed}/{activity.fields_total} campos
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {activity.status === 'waiting' && onBuild && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onBuild();
                }}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title="Construir esta atividade"
              >
                <Play className="w-4 h-4 text-white/60" />
              </button>
            )}
            {onViewClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onViewClick(activity);
                }}
                className="p-2 hover:bg-blue-500/20 rounded-lg transition-colors"
                title="Visualizar atividade"
              >
                <Eye className="w-4 h-4 text-blue-400" />
              </button>
            )}
            {onActivityClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onActivityClick(activity);
                }}
                className="p-2 hover:bg-orange-500/20 rounded-lg transition-colors"
                title="Editar atividade"
              >
                <Edit3 className="w-4 h-4 text-orange-400" />
              </button>
            )}
            {onDebugClick && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDebugClick(activity);
                }}
                className={`p-2 rounded-lg transition-colors relative ${
                  hasDebugLogs 
                    ? 'hover:bg-purple-500/20' 
                    : 'hover:bg-white/10'
                }`}
                title="Ver logs de debug"
              >
                <Bug className={`w-4 h-4 ${hasDebugLogs ? 'text-purple-400' : 'text-white/40'}`} />
                {hasDebugLogs && activityDebug && activityDebug.entries.some(e => e.level === 'error') && (
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-red-500 rounded-full" />
                )}
              </button>
            )}
            {activity.built_data && (
              isExpanded 
                ? <ChevronDown className="w-4 h-4 text-white/40" />
                : <ChevronRight className="w-4 h-4 text-white/40" />
            )}
          </div>
        </div>

        {activity.status === 'building' && activity.progress !== undefined && (
          <div className="mt-3">
            <div className="h-1.5 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${activity.progress}%` }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <p className="text-yellow-400/70 text-xs mt-1">
              {activity.progressMessage || `Construindo atividade... ${activity.progress}%`}
            </p>
          </div>
        )}

        {activity.error_message && (
          <div className="mt-2 p-2 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400 text-xs">{activity.error_message}</p>
          </div>
        )}
      </div>

      <AnimatePresence>
        {isExpanded && activity.built_data && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-white/10"
          >
            <div className="p-3 bg-black/20">
              <p className="text-white/50 text-xs uppercase tracking-wider mb-2">
                Dados Gerados
              </p>
              <div className="space-y-1">
                {Object.entries(activity.built_data).slice(0, 5).map(([key, value]) => (
                  <div key={key} className="flex gap-2 text-xs">
                    <span className="text-white/40 font-mono">{key}:</span>
                    <span className="text-white/70 truncate">
                      {typeof value === 'string' ? value : JSON.stringify(value)}
                    </span>
                  </div>
                ))}
                {Object.keys(activity.built_data).length > 5 && (
                  <p className="text-white/30 text-xs">
                    +{Object.keys(activity.built_data).length - 5} mais campos
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function convertToConstructionActivity(activity: ActivityToBuild): ConstructionActivity {
  const builtData = activity.built_data || {};
  const consolidatedFields = builtData._consolidated_fields || builtData.generated_fields || {};
  
  const getGeneratedTitle = (): string => {
    if (consolidatedFields.theme) return consolidatedFields.theme;
    if (consolidatedFields.temaRedacao) return consolidatedFields.temaRedacao;
    if (consolidatedFields.tituloTemaAssunto) return consolidatedFields.tituloTemaAssunto;
    if (consolidatedFields.centralTheme) return consolidatedFields.centralTheme;
    if (consolidatedFields.title) return consolidatedFields.title;
    return activity.name;
  };
  
  const getGeneratedDescription = (): string => {
    if (consolidatedFields.objectives) return consolidatedFields.objectives;
    if (consolidatedFields.objetivo) return consolidatedFields.objetivo;
    if (consolidatedFields.objetivosAprendizagem) return consolidatedFields.objetivosAprendizagem;
    if (consolidatedFields.generalObjective) return consolidatedFields.generalObjective;
    if (consolidatedFields.description) return consolidatedFields.description;
    return `Atividade do tipo ${activity.type}`;
  };
  
  return {
    id: activity.activity_id || activity.id,
    title: getGeneratedTitle(),
    personalizedTitle: activity.name,
    description: getGeneratedDescription(),
    personalizedDescription: getGeneratedDescription(),
    categoryId: activity.type,
    categoryName: activity.type,
    icon: 'FileText',
    tags: [],
    difficulty: consolidatedFields.difficultyLevel || consolidatedFields.nivelDificuldade || 'medium',
    estimatedTime: consolidatedFields.timeLimit || '30 min',
    customFields: consolidatedFields,
    originalData: activity,
    isBuilt: activity.status === 'completed',
    progress: activity.progress,
    status: activity.status === 'waiting' ? 'pending' : 
            activity.status === 'building' ? 'in_progress' : 
            activity.status === 'completed' ? 'completed' : 'error',
    type: activity.type
  };
}

/**
 * Ordenação por prioridade de status:
 * 1. completed (verde) - aparecem primeiro
 * 2. building (amarelo) - atividade em construção  
 * 3. error (vermelho) - atividades com falha
 * 4. waiting (cinza) - aparecem por último
 */
function sortByStatusPriority(activities: ActivityToBuild[]): ActivityToBuild[] {
  const statusPriority: Record<ActivityBuildStatus, number> = {
    'completed': 0,
    'building': 1,
    'error': 2,
    'waiting': 3
  };
  
  return [...activities].sort((a, b) => {
    return statusPriority[a.status] - statusPriority[b.status];
  });
}

export function ConstructionInterface({
  activities,
  isBuilding,
  onBuildAll,
  onBuildSingle,
  onActivityStatusChange,
  autoStart = false
}: ConstructionInterfaceProps) {
  const sortedActivities = sortByStatusPriority(activities);
  
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const errorCount = activities.filter(a => a.status === 'error').length;
  const buildingCount = activities.filter(a => a.status === 'building').length;
  
  const overallProgress = activities.length > 0 
    ? Math.round(
        activities.reduce((acc, a) => {
          if (a.status === 'completed') return acc + 100;
          if (a.status === 'building') return acc + (a.progress || 50);
          return acc;
        }, 0) / activities.length
      )
    : 0;

  const allCompleted = completedCount === activities.length && activities.length > 0;

  const hasStartedRef = useRef(false);
  const buildControllerRef = useRef<(() => void) | null>(null);
  const editModalRef = useRef<EditActivityModalHandle>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<ConstructionActivity | null>(null);
  const [isDebugModalOpen, setIsDebugModalOpen] = useState(false);
  const [debugActivityId, setDebugActivityId] = useState<string | null>(null);
  const [debugActivityName, setDebugActivityName] = useState<string>('');

  // Callback ref para registrar o modal quando ele for montado
  const setEditModalRef = useCallback((handle: EditActivityModalHandle | null) => {
    editModalRef.current = handle;
    if (handle) {
      console.log('🌉 [ConstructionInterface] Modal ref recebido, registrando no ModalBridge');
      ModalBridge.register(handle);
    }
  }, []);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      console.log('🌉 [ConstructionInterface] Desmontando, desregistrando ModalBridge');
      ModalBridge.unregister();
    };
  }, []);

  useEffect(() => {
    console.log('🎮 [ConstructionInterface] Inicializando BuildController...');
    
    buildControllerRef.current = createBuildController({
      onBuildStart: (activityId, requestId) => {
        console.log(`🔧 [ConstructionInterface] Build iniciado: ${activityId}`);
        onActivityStatusChange?.(activityId, 'building', 10, 'Iniciando construção...');
      },
      onBuildProgress: (activityId, progress, message) => {
        console.log(`📊 [ConstructionInterface] Progresso ${activityId}: ${progress}% - ${message}`);
        onActivityStatusChange?.(activityId, 'building', progress, message);
      },
      onBuildComplete: (activityId, result) => {
        console.log(`✅ [ConstructionInterface] Build concluído: ${activityId}`);
        onActivityStatusChange?.(activityId, 'completed', 100, 'Construção concluída!');
      },
      onBuildError: (activityId, error) => {
        console.error(`❌ [ConstructionInterface] Erro no build: ${activityId} - ${error}`);
        onActivityStatusChange?.(activityId, 'error', 0, error);
      }
    });

    const unsubscribeProgress = onBuildProgress((update: BuildProgressUpdate) => {
      onActivityStatusChange?.(update.activityId, 'building', update.progress, update.message);
    });

    return () => {
      if (buildControllerRef.current) {
        buildControllerRef.current();
      }
      unsubscribeProgress();
    };
  }, [onActivityStatusChange]);

  useEffect(() => {
    const handleActivityBuilding = (event: CustomEvent) => {
      const { activity_id, position, total } = event.detail;
      console.log(`🔨 [ConstructionInterface] Evento: Construindo atividade ${position}/${total}: ${activity_id}`);
      onActivityStatusChange?.(activity_id, 'building', 25, `Construindo atividade ${position}/${total}...`);
    };

    const handleActivityCompleted = (event: CustomEvent) => {
      const { activity_id, position, total } = event.detail;
      console.log(`✅ [ConstructionInterface] Evento: Atividade ${position}/${total} concluída: ${activity_id}`);
      onActivityStatusChange?.(activity_id, 'completed', 100, 'Construção concluída!');
    };

    const handleActivityError = (event: CustomEvent) => {
      const { activity_id, error } = event.detail;
      console.error(`❌ [ConstructionInterface] Evento: Erro na atividade: ${activity_id} - ${error}`);
      onActivityStatusChange?.(activity_id, 'error', 0, error || 'Erro na construção');
    };

    const handleQueueCompleted = (event: CustomEvent) => {
      console.log('🎉 [ConstructionInterface] Evento: Fila de construção concluída!', event.detail);
    };

    window.addEventListener('construction:activity_building', handleActivityBuilding as EventListener);
    window.addEventListener('construction:activity_completed', handleActivityCompleted as EventListener);
    window.addEventListener('construction:activity_error', handleActivityError as EventListener);
    window.addEventListener('construction:queue_completed', handleQueueCompleted as EventListener);

    return () => {
      window.removeEventListener('construction:activity_building', handleActivityBuilding as EventListener);
      window.removeEventListener('construction:activity_completed', handleActivityCompleted as EventListener);
      window.removeEventListener('construction:activity_error', handleActivityError as EventListener);
      window.removeEventListener('construction:queue_completed', handleQueueCompleted as EventListener);
    };
  }, [onActivityStatusChange]);

  const handleActivityClick = useCallback((activity: ActivityToBuild) => {
    console.log('🔧 [ConstructionInterface] Abrindo modal de EDIÇÃO para atividade:', activity.name);
    const constructionActivity = convertToConstructionActivity(activity);
    setSelectedActivity(constructionActivity);
    setIsEditModalOpen(true);
  }, []);

  const handleViewClick = useCallback((activity: ActivityToBuild) => {
    console.log('👁️ [ConstructionInterface] Abrindo modal de VISUALIZAÇÃO para atividade:', activity.name);
    const constructionActivity = convertToConstructionActivity(activity);
    setViewActivity(constructionActivity);
    setIsViewModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    console.log('🔧 [ConstructionInterface] Fechando modal');
    setIsEditModalOpen(false);
    setSelectedActivity(null);
  }, []);

  const handleSaveActivity = useCallback((activityData: any) => {
    console.log('💾 [ConstructionInterface] Salvando atividade:', activityData);
    handleCloseModal();
  }, [handleCloseModal]);

  const handleDebugClick = useCallback((activity: ActivityToBuild) => {
    console.log('🐛 [ConstructionInterface] Abrindo modal de DEBUG para atividade:', activity.name);
    setDebugActivityId(activity.activity_id || activity.id);
    setDebugActivityName(activity.name);
    setIsDebugModalOpen(true);
  }, []);

  useEffect(() => {
    if (
      autoStart && 
      !isBuilding && 
      activities.length > 0 &&
      activities.every(a => a.status === 'waiting') &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      console.log('🚀 [ConstructionInterface] AutoStart: iniciando construção automática');
      setTimeout(() => {
        onBuildAll();
      }, 500);
    }
  }, [autoStart, isBuilding, activities, onBuildAll]);

  const hasEmittedCompletionRef = useRef(false);
  const prevAllCompletedRef = useRef(false);

  useEffect(() => {
    if (prevAllCompletedRef.current && !allCompleted) {
      console.log(`🔄 [ConstructionInterface] Novo ciclo de construção detectado, resetando estado`);
      hasEmittedCompletionRef.current = false;
    }
    prevAllCompletedRef.current = allCompleted;
  }, [allCompleted, activities]);

  useEffect(() => {
    if (allCompleted && !hasEmittedCompletionRef.current && activities.length > 0) {
      hasEmittedCompletionRef.current = true;
      console.log(`🎉 [ConstructionInterface] Todas as ${activities.length} atividades concluídas! Emitindo evento...`);
      
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: 'construction:all_completed',
          activities: activities.map(a => ({
            id: a.id,
            activity_id: a.activity_id,
            titulo: a.name,
            tipo: a.type,
            status: a.status,
            progress: a.progress || 100,
            built_data: a.built_data
          })),
          summary: `${activities.length} atividade(s) construída(s) com sucesso`
        }
      }));
    }
  }, [allCompleted, activities]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-gradient-to-br from-orange-900/30 to-amber-900/30 backdrop-blur-xl rounded-2xl border border-orange-500/20 overflow-hidden"
    >
      <div className="p-4 border-b border-white/10 bg-black/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-white font-semibold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-400" />
                Interface de Construção
              </h3>
              <p className="text-white/50 text-sm">
                {activities.length} atividade{activities.length !== 1 ? 's' : ''} para construir
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className={`text-lg font-bold ${
              allCompleted ? 'text-green-400' : 'text-orange-400'
            }`}>
              {overallProgress}%
            </p>
            <p className="text-white/40 text-xs">
              {completedCount}/{activities.length} concluídas
            </p>
          </div>
        </div>

        {(isBuilding || buildingCount > 0) && (
          <div className="mt-4">
            <div className="h-2 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${overallProgress}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              />
            </div>
            <p className="text-white/40 text-xs mt-1 text-center">
              Progresso geral de construção
            </p>
          </div>
        )}

      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {sortedActivities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
            layout
          >
            <ActivityCard 
              activity={activity}
              onBuild={onBuildSingle ? () => onBuildSingle(activity.activity_id) : undefined}
              onActivityClick={handleActivityClick}
              onViewClick={handleViewClick}
              onDebugClick={handleDebugClick}
            />
          </motion.div>
        ))}
      </div>

      {!allCompleted && !isBuilding && activities.some(a => a.status === 'waiting') && (
        <div className="p-4 border-t border-white/10 bg-black/20">
          <button
            onClick={onBuildAll}
            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 text-white rounded-xl font-medium hover:opacity-90 transition-all"
          >
            <Zap className="w-5 h-5" />
            Construir Todas as Atividades
          </button>
        </div>
      )}

      {allCompleted && (
        <div className="p-4 border-t border-green-500/20 bg-green-500/10">
          <div className="flex items-center justify-center gap-2 text-green-400">
            <Check className="w-5 h-5" />
            <span className="font-medium">Todas as atividades foram construídas!</span>
          </div>
        </div>
      )}

      {errorCount > 0 && (
        <div className="px-4 pb-4">
          <div className="p-3 bg-red-500/10 rounded-xl border border-red-500/20">
            <div className="flex items-center gap-2 text-red-400">
              <AlertCircle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {errorCount} atividade{errorCount > 1 ? 's' : ''} com erro
              </span>
            </div>
          </div>
        </div>
      )}

      <EditActivityModal
        ref={setEditModalRef}
        isOpen={isEditModalOpen}
        activity={selectedActivity}
        onClose={handleCloseModal}
        onSave={handleSaveActivity}
      />

      <ActivityViewModal
        isOpen={isViewModalOpen}
        activity={viewActivity}
        onClose={() => {
          console.log('👁️ [ConstructionInterface] Fechando modal de visualização');
          setIsViewModalOpen(false);
          setViewActivity(null);
        }}
      />

      <ActivityDebugModal
        isOpen={isDebugModalOpen}
        activityId={debugActivityId}
        activityName={debugActivityName}
        onClose={() => {
          console.log('🐛 [ConstructionInterface] Fechando modal de debug');
          setIsDebugModalOpen(false);
          setDebugActivityId(null);
          setDebugActivityName('');
        }}
      />
    </motion.div>
  );
}

export default ConstructionInterface;
