/**
 * CONSTRUCTION INTERFACE - Interface de Construção de Atividades
 * 
 * Card visual que aparece quando a capability "criar_atividade" executa
 * Mostra as atividades sendo construídas com progresso em tempo real
 */

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Package, 
  Loader2, 
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
  Eye
} from 'lucide-react';
import EditActivityModal from '../../construction/EditActivityModal';
import { ActivityViewModal } from '../../construction/ActivityViewModal';
import { ConstructionActivity } from '../../construction/types';

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
}

interface ConstructionInterfaceProps {
  activities: ActivityToBuild[];
  isBuilding: boolean;
  onBuildAll: () => void;
  onBuildSingle?: (activityId: string) => void;
  autoStart?: boolean;
}

const STATUS_CONFIG = {
  waiting: {
    icon: Clock,
    color: 'text-gray-400',
    bg: 'bg-gray-500/10',
    border: 'border-gray-500/20',
    label: 'Aguardando'
  },
  building: {
    icon: Loader2,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/10',
    border: 'border-yellow-500/20',
    label: 'Construindo'
  },
  completed: {
    icon: Check,
    color: 'text-green-400',
    bg: 'bg-green-500/10',
    border: 'border-green-500/20',
    label: 'Concluído'
  },
  error: {
    icon: AlertCircle,
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    border: 'border-red-500/20',
    label: 'Erro'
  }
};

function ActivityCard({ activity, onBuild, onActivityClick, onViewClick }: { 
  activity: ActivityToBuild; 
  onBuild?: () => void;
  onActivityClick?: (activity: ActivityToBuild) => void;
  onViewClick?: (activity: ActivityToBuild) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const config = STATUS_CONFIG[activity.status];
  const StatusIcon = config.icon;

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
      className={`rounded-xl border overflow-hidden ${config.bg} ${config.border} hover:border-orange-500/40 transition-colors`}
    >
      <div 
        className="p-3 cursor-pointer"
        onClick={handleClick}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${config.bg} border ${config.border}`}>
              <StatusIcon className={`w-5 h-5 ${config.color} ${activity.status === 'building' ? 'animate-spin' : ''}`} />
            </div>
            <div>
              <h4 className="text-white font-medium text-sm">{activity.name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs ${config.color}`}>
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
                className="h-full bg-gradient-to-r from-yellow-500 to-orange-500"
              />
            </div>
            <p className="text-yellow-400/70 text-xs mt-1">
              Preenchendo campos com IA... {activity.progress}%
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
  // Extrair campos consolidados do built_data (preparados pelo ChosenActivitiesStore)
  const builtData = activity.built_data || {};
  const consolidatedFields = builtData._consolidated_fields || builtData.generated_fields || {};
  
  // Mapear título por tipo de atividade com fallbacks apropriados
  const getGeneratedTitle = (): string => {
    if (consolidatedFields.theme) return consolidatedFields.theme;
    if (consolidatedFields.temaRedacao) return consolidatedFields.temaRedacao;
    if (consolidatedFields.tituloTemaAssunto) return consolidatedFields.tituloTemaAssunto;
    if (consolidatedFields.centralTheme) return consolidatedFields.centralTheme;
    if (consolidatedFields.title) return consolidatedFields.title;
    return activity.name;
  };
  
  // Mapear descrição por tipo de atividade com fallbacks apropriados
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
    // Passar campos consolidados para o modal (sem metadados internos)
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

export function ConstructionInterface({
  activities,
  isBuilding,
  onBuildAll,
  onBuildSingle,
  autoStart = false
}: ConstructionInterfaceProps) {
  const completedCount = activities.filter(a => a.status === 'completed').length;
  const errorCount = activities.filter(a => a.status === 'error').length;
  const buildingCount = activities.filter(a => a.status === 'building').length;
  const progress = activities.length > 0 
    ? Math.round((completedCount / activities.length) * 100) 
    : 0;

  const allCompleted = completedCount === activities.length && activities.length > 0;

  const hasStartedRef = React.useRef(false);
  
  // Estado para o modal de edição
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

  // Estado para o modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<ConstructionActivity | null>(null);

  // Estado para o auto-build automático
  const [autoBuildStatus, setAutoBuildStatus] = useState<{
    isRunning: boolean;
    currentActivity: string;
    current: number;
    total: number;
  } | null>(null);

  // Listener para eventos de auto-build
  useEffect(() => {
    const handleAutoBuildProgress = (event: CustomEvent) => {
      const { type, ...data } = event.detail;
      
      if (type === 'construction:auto_build_started') {
        console.log('🔨 [ConstructionInterface] Auto-build iniciado:', data);
        setAutoBuildStatus({
          isRunning: true,
          currentActivity: 'Iniciando...',
          current: 0,
          total: data.totalActivities || 0
        });
      } else if (type === 'construction:auto_build_progress') {
        console.log('⚙️ [ConstructionInterface] Auto-build progresso:', data);
        setAutoBuildStatus({
          isRunning: true,
          currentActivity: data.currentActivity || '',
          current: data.current || 0,
          total: data.total || 0
        });
      } else if (type === 'construction:auto_build_completed') {
        console.log('✅ [ConstructionInterface] Auto-build concluído:', data);
        setAutoBuildStatus(null);
      } else if (type === 'construction:auto_build_error') {
        console.log('❌ [ConstructionInterface] Auto-build erro:', data);
        setAutoBuildStatus(null);
      }
    };

    window.addEventListener('agente-jota-progress', handleAutoBuildProgress as EventListener);
    
    return () => {
      window.removeEventListener('agente-jota-progress', handleAutoBuildProgress as EventListener);
    };
  }, []);

  // Handler para abrir o modal de edição ao clicar no lápis
  const handleActivityClick = useCallback((activity: ActivityToBuild) => {
    console.log('🔧 [ConstructionInterface] Abrindo modal de EDIÇÃO para atividade:', activity.name);
    const constructionActivity = convertToConstructionActivity(activity);
    setSelectedActivity(constructionActivity);
    setIsEditModalOpen(true);
  }, []);

  // Handler para abrir o modal de visualização ao clicar no olho
  const handleViewClick = useCallback((activity: ActivityToBuild) => {
    console.log('👁️ [ConstructionInterface] Abrindo modal de VISUALIZAÇÃO para atividade:', activity.name);
    const constructionActivity = convertToConstructionActivity(activity);
    setViewActivity(constructionActivity);
    setIsViewModalOpen(true);
  }, []);

  // Handler para fechar o modal
  const handleCloseModal = useCallback(() => {
    console.log('🔧 [ConstructionInterface] Fechando modal');
    setIsEditModalOpen(false);
    setSelectedActivity(null);
  }, []);

  // Handler para salvar atividade
  const handleSaveActivity = useCallback((activityData: any) => {
    console.log('💾 [ConstructionInterface] Salvando atividade:', activityData);
    handleCloseModal();
  }, [handleCloseModal]);

  useEffect(() => {
    if (
      autoStart && 
      !isBuilding && 
      activities.length > 0 &&
      activities.every(a => a.status === 'waiting') &&
      !hasStartedRef.current
    ) {
      hasStartedRef.current = true;
      onBuildAll();
    }
  }, [autoStart, isBuilding, activities, onBuildAll]);

  // Ref para controlar se já emitimos o evento de conclusão
  const hasEmittedCompletionRef = React.useRef(false);
  
  // Ref para detectar estado anterior (para resetar em novos ciclos)
  const prevAllCompletedRef = React.useRef(false);

  // Resetar ref quando atividades voltarem a não-completed (novo ciclo de construção)
  useEffect(() => {
    // Se estava completo e agora NÃO está, é um novo ciclo
    if (prevAllCompletedRef.current && !allCompleted) {
      console.log(`🔄 [ConstructionInterface] Novo ciclo de construção detectado (status regrediu), resetando estado`);
      hasEmittedCompletionRef.current = false;
    }
    
    // Atualizar referência do estado anterior
    prevAllCompletedRef.current = allCompleted;
  }, [allCompleted, activities]);

  // Emitir evento construction:all_completed quando todas as atividades forem concluídas
  useEffect(() => {
    if (allCompleted && !hasEmittedCompletionRef.current && activities.length > 0) {
      hasEmittedCompletionRef.current = true;
      console.log(`🎉 [ConstructionInterface] Todas as ${activities.length} atividades concluídas! Emitindo evento...`);
      
      // Emitir evento com as atividades concluídas
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
              {progress}%
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
                animate={{ width: `${progress}%` }}
                className="h-full bg-gradient-to-r from-orange-500 to-amber-500"
              />
            </div>
          </div>
        )}

        {/* Indicador de Auto-Build em andamento */}
        {autoBuildStatus?.isRunning && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl border border-blue-500/30"
          >
            <div className="flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
              <div className="flex-1">
                <p className="text-blue-300 font-medium text-sm">
                  🔨 Construção Automática em Andamento
                </p>
                <p className="text-white/60 text-xs mt-1">
                  {autoBuildStatus.currentActivity}
                </p>
              </div>
              <div className="text-right">
                <p className="text-blue-400 font-bold text-sm">
                  {autoBuildStatus.current}/{autoBuildStatus.total}
                </p>
              </div>
            </div>
            <div className="mt-2 h-1.5 bg-black/30 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: autoBuildStatus.total > 0 ? `${(autoBuildStatus.current / autoBuildStatus.total) * 100}%` : '0%' }}
                className="h-full bg-gradient-to-r from-blue-500 to-purple-500"
              />
            </div>
          </motion.div>
        )}
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {activities.map((activity, idx) => (
          <motion.div
            key={activity.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: idx * 0.05 }}
          >
            <ActivityCard 
              activity={activity}
              onBuild={onBuildSingle ? () => onBuildSingle(activity.activity_id) : undefined}
              onActivityClick={handleActivityClick}
              onViewClick={handleViewClick}
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

      {/* Modal de Edição de Atividade */}
      <EditActivityModal
        isOpen={isEditModalOpen}
        activity={selectedActivity}
        onClose={handleCloseModal}
        onSave={handleSaveActivity}
      />

      {/* Modal de Visualização de Atividade */}
      <ActivityViewModal
        isOpen={isViewModalOpen}
        activity={viewActivity}
        onClose={() => {
          console.log('👁️ [ConstructionInterface] Fechando modal de visualização');
          setIsViewModalOpen(false);
          setViewActivity(null);
        }}
      />
    </motion.div>
  );
}

export default ConstructionInterface;
