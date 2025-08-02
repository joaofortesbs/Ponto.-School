import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';
import { EditActivityModal } from './EditActivityModal';
import { useConstructionActivities } from './useConstructionActivities';
import { useEditActivityModal } from './useEditActivityModal';
import { ConstructionActivity } from './types';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Zap, Loader2, CheckCircle, AlertCircle, Building2 } from 'lucide-react';
import { autoBuildService, AutoBuildProgress } from './services/autoBuildService';

interface ConstructionGridProps {
  approvedActivities: any[];
  handleEditActivity?: (activity: any) => void;
}

export function ConstructionGrid({ approvedActivities, handleEditActivity: externalHandleEditActivity }: ConstructionGridProps) {
  console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', approvedActivities);

  const { activities, loading } = useConstructionActivities(approvedActivities);
  const { isModalOpen, selectedActivity, openModal, closeModal, handleSaveActivity } = useEditActivityModal();
  const [buildProgress, setBuildProgress] = useState<AutoBuildProgress | null>(null);
  const [showProgressModal, setShowProgressModal] = useState(false);

  console.log('🎯 Estado do modal:', { isModalOpen, selectedActivity: selectedActivity?.title });

  const handleEditActivity = (activity: ConstructionActivity) => {
    console.log('🔧 Abrindo modal para editar atividade:', activity);

    if (externalHandleEditActivity) {
      // Usar a função externa se disponível
      externalHandleEditActivity(activity);
    } else {
      // Fallback para a lógica interna
      openModal(activity);
    }
  };

  const handleView = (id: string) => {
    console.log('👁️ Visualizando atividade:', id);
    // TODO: Implementar visualização da atividade
  };

  const handleShare = (id: string) => {
    console.log('📤 Compartilhando atividade:', id);
    // TODO: Implementar funcionalidade de compartilhamento
  };

  const handleBuildAll = async () => {
    console.log('🚀 Iniciando construção automática com lógica REAL de todas as atividades');
    console.log('📋 Atividades disponíveis:', activities);

    // Filtrar apenas atividades que precisam ser construídas
    const activitiesToBuild = activities.filter(activity => {
      const needsBuild = !activity.isBuilt && 
                        activity.status !== 'completed' && 
                        activity.title && 
                        activity.description &&
                        activity.progress < 100;
      
      console.log(`🔍 Atividade ${activity.title}: isBuilt=${activity.isBuilt}, status=${activity.status}, progress=${activity.progress}, needsBuild=${needsBuild}`);
      return needsBuild;
    });

    console.log('🎯 Atividades que precisam ser construídas:', activitiesToBuild);

    if (activitiesToBuild.length === 0) {
      console.log('⚠️ Nenhuma atividade precisa ser construída');
      alert('Todas as atividades já foram construídas ou não possuem dados suficientes para construção.');
      return;
    }

    try {
      setShowProgressModal(true);

      // Inicializar progresso
      setBuildProgress({
        current: 0,
        total: activitiesToBuild.length,
        currentActivity: 'Preparando construção com lógica REAL...',
        status: 'running',
        errors: []
      });

      // Configurar callbacks
      autoBuildService.setProgressCallback((progress) => {
        console.log('📊 Progresso atualizado:', progress);
        setBuildProgress(progress);
      });

      autoBuildService.setOnActivityBuilt((activityId) => {
        console.log(`🎯 Atividade construída automaticamente com lógica REAL: ${activityId}`);
        
        // Forçar re-render para mostrar atividade construída
        window.dispatchEvent(new CustomEvent('activity-built', { detail: { activityId } }));
      });

      console.log('🔥 Iniciando processo de construção para', activitiesToBuild.length, 'atividades');

      // Executar construção automática com lógica REAL
      await autoBuildService.buildAllActivities(activitiesToBuild);

      console.log('✅ Construção automática finalizada com sucesso');

      // Aguardar um pouco para mostrar o progresso completo
      setTimeout(() => {
        setShowProgressModal(false);
        setBuildProgress({
          current: activitiesToBuild.length,
          total: activitiesToBuild.length,
          currentActivity: 'Todas as atividades construídas com lógica REAL!',
          status: 'completed',
          errors: []
        });

        console.log('🎉 Processo de construção automática com lógica REAL finalizado');
        
        // Forçar re-render da interface
        window.location.reload();
      }, 2000);

    } catch (error) {
      console.error('❌ Erro na construção automática com lógica REAL:', error);
      
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      console.error('🔍 Detalhes do erro:', {
        message: errorMessage,
        stack: error instanceof Error ? error.stack : undefined,
        activitiesToBuild: activitiesToBuild.length
      });

      setBuildProgress({
        current: 0,
        total: activitiesToBuild.length,
        currentActivity: 'Erro na construção',
        status: 'error',
        errors: [errorMessage]
      });

      // Manter modal aberto para mostrar erro
      setTimeout(() => {
        setShowProgressModal(false);
        setBuildProgress(null);
      }, 5000);
    }
  };

  const handleEdit = (activityId: string) => {
    console.log('Editar materiais da atividade:', activityId);
    // TODO: Implementar lógica de edição de materiais
  };

  useEffect(() => {
    console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', activities);
    console.log('🎯 Estado do modal:', { isModalOpen });

    // Verificar e atualizar status de atividades construídas
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    activities.forEach(activity => {
      if (constructedActivities[activity.id] && !activity.isBuilt) {
        activity.isBuilt = true;
        activity.builtAt = constructedActivities[activity.id].builtAt;
      }
    });
  }, [activities, isModalOpen]);

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

        {/* Botão Construir Todas */}
        {activities.filter(activity => !activity.isBuilt && activity.status !== 'completed' && activity.title && activity.description && activity.progress < 100).length > 0 && (
          <div className="flex items-center gap-2">
            <Button
              onClick={handleBuildAll}
              disabled={buildProgress?.status === 'running'}
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-[#FF6B00] to-[#D65A00] hover:from-[#E55A00] hover:to-[#B54A00] text-white text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {buildProgress?.status === 'running' ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Construindo...
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Construir Todas
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
              console.log('🎯 Dados da atividade:', activity);
              openModal(activity);
            }}
            onView={handleView}
            onShare={handleShare}
          />
        ))}
      </div>

      {/* Modal de Edição */}
      <EditActivityModal
        activity={selectedActivity}
        isOpen={isModalOpen}
        onClose={closeModal}
        onSave={handleSaveActivity}
      />

      {/* Modal de Progresso da Construção Automática */}
      {showProgressModal && buildProgress && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="text-center">
              <h3 className="text-lg font-semibold mb-4">
                Construção Automática em Andamento
              </h3>

              <div className="mb-4">
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(buildProgress.current / buildProgress.total) * 100}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
                  {buildProgress.current} de {buildProgress.total} atividades
                </p>
              </div>

              {buildProgress.status === 'running' && (
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">
                    Construindo: {buildProgress.currentActivity}
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
                  className="w-full"
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