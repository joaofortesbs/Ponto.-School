import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';
import { EditActivityModal } from './EditActivityModal';
import { ActivityViewModal } from './ActivityViewModal'; // Importar o novo modal
import { HistoricoAtividadesCriadas } from './HistoricoAtividadesCriadas'; // Importar o novo componente
import { useConstructionActivities } from './useConstructionActivities';
import { useEditActivityModal } from './useEditActivityModal';
import { ConstructionActivity } from './types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Loader2, CheckCircle, AlertCircle, Building2, History, ArrowLeft } from 'lucide-react';
import { autoBuildService, AutoBuildProgress } from './services/autoBuildService';

interface ConstructionGridProps {
  approvedActivities: any[];
  handleEditActivity?: (activity: any) => void;
  onResetFlow?: () => void;
}

export function ConstructionGrid({ approvedActivities, handleEditActivity: externalHandleEditActivity, onResetFlow }: ConstructionGridProps) {
  console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', approvedActivities);

  const { activities, loading, refreshActivities } = useConstructionActivities(approvedActivities);
  const { isModalOpen, selectedActivity, openModal, closeModal, handleSaveActivity } = useEditActivityModal();
  const [buildProgress, setBuildProgress] = useState<AutoBuildProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  // Novos estados para o modal de visualização
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<ConstructionActivity | null>(null);

  // Estado para controlar a visualização do histórico
  const [showHistorico, setShowHistorico] = useState(false);

  console.log('🎯 Estado do modal:', { isModalOpen, selectedActivity: selectedActivity?.title });

  const handleEditActivity = (activity: ConstructionActivity) => {
    console.log('🔧 Abrindo modal para editar atividade:', activity);

    if (externalHandleEditActivity) {
      externalHandleEditActivity(activity);
    } else {
      openModal(activity);
    }
  };

  const handleView = (activity: ConstructionActivity) => {
    console.log('👁️ Abrindo modal de visualização para atividade:', activity.title);
    console.log('👁️ Dados completos da atividade:', activity);
    console.log('👁️ Dados originais:', activity.originalData);
    console.log('👁️ Campos customizados:', activity.customFields);
    setViewActivity(activity);
    setIsViewModalOpen(true);
  };

  const closeViewModal = () => {
    console.log('👁️ Fechando modal de visualização');
    setIsViewModalOpen(false);
    setViewActivity(null);
  };

  const handleShowHistorico = () => {
    console.log('📚 Abrindo histórico de atividades criadas');
    setShowHistorico(true);
  };

  const handleBackFromHistorico = () => {
    console.log('🔙 Voltando do histórico para construção');
    setShowHistorico(false);
  };

  const handleShare = (id: string) => {
    console.log('📤 Compartilhando atividade:', id);
    // TODO: Implementar funcionalidade de compartilhamento
  };

  const handleBuildAll = async () => {
    if (isBuilding) {
      console.log('⚠️ Construção já em andamento, ignorando nova solicitação');
      return;
    }

    console.log('🚀 Iniciando construção automática com autoBuildService MELHORADO');

    // Filtrar atividades que precisam ser construídas
    const activitiesToBuild = activities.filter(activity => {
      const needsBuild = !activity.isBuilt &&
                        activity.status !== 'completed' &&
                        activity.title &&
                        activity.description &&
                        activity.progress < 100;

      console.log(`🔍 Atividade ${activity.title}: isBuilt=${activity.isBuilt}, status=${activity.status}, progress=${activity.progress}, needsBuild=${needsBuild}`);
      return needsBuild;
    });

    console.log('🎯 Atividades que precisam ser construídas:', activitiesToBuild.length);

    if (activitiesToBuild.length === 0) {
      console.log('⚠️ Nenhuma atividade precisa ser construída');
      alert('Todas as atividades já foram construídas ou não possuem dados suficientes para construção.');
      return;
    }

    try {
      setIsBuilding(true);
      setShowProgressModal(true);

      // Configurar callbacks CORRETOS para o serviço
      autoBuildService.setProgressCallback((progress) => {
        console.log('📊 Progresso da construção atualizado:', progress);
        setBuildProgress(progress);
      });

      autoBuildService.setOnActivityBuilt((activityId) => {
        console.log(`🎯 Atividade construída automaticamente: ${activityId}`);

        // Forçar atualização da interface
        if (refreshActivities) {
          refreshActivities();
        }

        // Disparar evento customizado para atualização
        window.dispatchEvent(new CustomEvent('activity-built', {
          detail: { activityId }
        }));
      });

      // Executar construção automática com a MESMA LÓGICA do modal
      await autoBuildService.buildAllActivities(activitiesToBuild);

      console.log('✅ Construção automática finalizada com sucesso');

    } catch (error) {
      console.error('❌ Erro na construção automática:', error);

      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';

      setBuildProgress({
        current: 0,
        total: activitiesToBuild.length,
        currentActivity: 'Erro na construção',
        status: 'error',
        errors: [errorMessage]
      });
    } finally {
      setIsBuilding(false);

      // Aguardar um pouco antes de fechar para mostrar resultado
      setTimeout(() => {
        setShowProgressModal(false);
        setBuildProgress(null);

        // Forçar refresh completo das atividades
        if (refreshActivities) {
          refreshActivities();
        }
      }, 3000);
    }
  };

  // Listener para atualizações de atividades construídas
  useEffect(() => {
    const handleActivityBuilt = (event: CustomEvent) => {
      console.log('🎯 Evento de atividade construída recebido:', event.detail);

      // Forçar atualização das atividades
      if (refreshActivities) {
        refreshActivities();
      }
    };

    window.addEventListener('activity-built', handleActivityBuilt as EventListener);

    return () => {
      window.removeEventListener('activity-built', handleActivityBuilt as EventListener);
    };
  }, [refreshActivities]);

  useEffect(() => {
    console.log('🎯 ConstructionGrid - Verificando status das atividades');

    // Verificar e atualizar status de atividades construídas do localStorage
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    let hasChanges = false;

    activities.forEach(activity => {
      if (constructedActivities[activity.id] && !activity.isBuilt) {
        console.log(`📝 Atualizando status da atividade ${activity.id} para construída`);
        activity.isBuilt = true;
        activity.builtAt = constructedActivities[activity.id].builtAt;
        activity.progress = 100;
        activity.status = 'completed';
        hasChanges = true;
      }
    });

    if (hasChanges && refreshActivities) {
      console.log('🔄 Forçando refresh das atividades devido a mudanças');
      refreshActivities();
    }
  }, [activities, refreshActivities]);

  if (loading) {
    return (
      <div className="space-y-4">
        {/* Header Skeleton */}
        <div className="flex items-center gap-3 mb-6">
          <Skeleton className="w-8 h-8 rounded-lg" />
          <div className="space-y-2">
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-72" />
          </div>
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="rounded-xl border-2 border-gray-200 dark:border-gray-700 p-4 space-y-4">
              <Skeleton className="h-32 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-2/3" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex gap-1">
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-7 w-8" />
                  <Skeleton className="h-7 w-8" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (!approvedActivities || approvedActivities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Nenhuma atividade para construir
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          Aprove algumas atividades no Plano de Ação para começar a construí-las aqui.
        </p>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
          <AlertCircle className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Processando atividades...
        </h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          As atividades aprovadas estão sendo preparadas para construção.
        </p>
      </div>
    );
  }

  const activitiesNeedingBuild = activities.filter(activity =>
    !activity.isBuilt &&
    activity.status !== 'completed' &&
    activity.title &&
    activity.description &&
    activity.progress < 100
  );

  // Se está mostrando histórico, renderizar componente de histórico
  if (showHistorico) {
    return <HistoricoAtividadesCriadas onBack={handleBackFromHistorico} />;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#D65A00] flex items-center justify-center">
            <Building2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {activities.length} {activities.length === 1 ? 'atividade aprovada' : 'atividades aprovadas'} para construção
            </p>
          </div>
        </div>

        {/* Botões de Ação */}
        <div className="flex items-center gap-2">
          {/* Botão Voltar ao Início */}
          <button
            onClick={onResetFlow}
            className="flex items-center gap-2 px-3 py-2 bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
          >
            Voltar ao início
          </button>

          {/* Botão de Histórico */}
          <Button
            onClick={handleShowHistorico}
            variant="outline"
            className="inline-flex items-center gap-2 px-4 py-2 border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/5 hover:border-[#FF6B00]/50 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md"
            title="Histórico de Atividades Criadas"
          >
            <History className="w-4 h-4" />
            Histórico
          </Button>

          {/* Botão Construir Todas */}
          {activitiesNeedingBuild.length > 0 && (
            <Button
              onClick={handleBuildAll}
              disabled={isBuilding || buildProgress?.status === 'running'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isBuilding || buildProgress?.status === 'running' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Construindo...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Construir Todas ({activitiesNeedingBuild.length})
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Grid com layout otimizado para os novos cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 p-2">
        {activities.map((activity) => (
          <ConstructionCard
            key={activity.id}
            id={activity.id}
            title={activity.title}
            description={activity.description}
            progress={activity.progress}
            type={activity.type}
            status={activity.status}
            onEdit={() => {
              console.log('🎯 Abrindo modal para atividade:', activity.title);
              openModal(activity);
            }}
            onView={(activityData) => {
              // Se receber dados da atividade, usar eles; senão, usar a atividade original
              const finalActivity = activityData || activity;
              console.log('👁️ Visualizando atividade:', finalActivity);
              handleView(finalActivity);
            }}
            onShare={handleShare}
          />
        ))}
      </div>

      {/* Modal de Edição */}
      <EditActivityModal
        isOpen={isModalOpen}
        activity={selectedActivity}
        onClose={closeModal}
        onSave={handleSaveActivity}
      />

      {/* Modal de Visualização */}
      <ActivityViewModal
        isOpen={isViewModalOpen}
        activity={viewActivity}
        onClose={closeViewModal}
      />

      {/* Modal de Progresso da Construção Automática */}
      {showProgressModal && buildProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Construção Automática com Lógica do Modal
              </h3>

              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-[#FF6B00] to-[#D65A00] h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {buildProgress.current} de {buildProgress.total} atividades processadas
                </p>
              </div>

              {buildProgress.status === 'running' && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF6B00]" />
                  <span className="text-sm">
                    {buildProgress.currentActivity}
                  </span>
                </div>
              )}

              {buildProgress.status === 'completed' && (
                <div className="flex items-center justify-center gap-2 mb-4 text-green-600">
                  <CheckCircle className="h-5 w-5" />
                  <span>Construção concluída com sucesso!</span>
                </div>
              )}

              {buildProgress.status === 'error' && (
                <div className="flex items-center justify-center gap-2 mb-4 text-red-600">
                  <AlertCircle className="h-5 w-5" />
                  <span>Construção concluída com alguns erros</span>
                </div>
              )}

              {buildProgress.errors.length > 0 && (
                <div className="text-left mb-4">
                  <p className="text-sm font-medium text-red-600 mb-2">Erros encontrados:</p>
                  <div className="max-h-32 overflow-y-auto">
                    {buildProgress.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-500 mb-1">
                        • {error}
                      </p>
                    ))}
                  </div>
                </div>
              )}

              {(buildProgress.status === 'completed' || buildProgress.status === 'error') && (
                <Button
                  onClick={() => {
                    setShowProgressModal(false);
                    setBuildProgress(null);
                  }}
                  className="w-full bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00]"
                >
                  Fechar
                </Button>
              )}
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}