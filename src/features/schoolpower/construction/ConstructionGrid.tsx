
import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';
import { EditActivityModal } from './EditActivityModal';
import { useConstructionActivities } from './useConstructionActivities';
import { useEditActivityModal } from './useEditActivityModal';
import { ConstructionActivity } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Building2 } from 'lucide-react';

interface ConstructionGridProps {
  approvedActivities: any[];
}

export function ConstructionGrid({ approvedActivities }: ConstructionGridProps) {
  console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', approvedActivities);

  const { activities, loading, setActivities } = useConstructionActivities(approvedActivities);
  const { isModalOpen, selectedActivity, openModal, closeModal, handleSaveActivity } = useEditActivityModal();

  console.log('🎯 Estado do modal:', { isModalOpen, selectedActivity: selectedActivity?.title });

  const handleEditActivity = (activity: ConstructionActivity) => {
    console.log('🔧 Abrindo modal para editar atividade:', activity);
    openModal(activity);
  };

  const handleView = (id: string) => {
    console.log('👁️ Visualizando atividade:', id);
    // TODO: Implementar visualização da atividade
  };

  const handleShare = (id: string) => {
    console.log('📤 Compartilhando atividade:', id);
    // TODO: Implementar funcionalidade de compartilhamento
  };

  const handleEdit = (activityId: string) => {
    console.log('Editar materiais da atividade:', activityId);
    // TODO: Implementar lógica de edição de materiais
  };

  useEffect(() => {
    const loadActivitiesFromPlan = async () => {
      console.log('🔄 ConstructionGrid: Carregando atividades do plano aprovado...', approvedActivities);

      if (!approvedActivities || approvedActivities.length === 0) {
        console.log('⚠️ Nenhuma atividade aprovada encontrada');
        setActivities([]);
        setLoading(false);
        return;
      }

      try {
        // Converter atividades aprovadas para o formato de construção
        const constructionActivities: ConstructionActivity[] = approvedActivities.map((activity: any) => ({
          id: activity.id,
          title: activity.title,
          description: activity.description,
          progress: 0, // Começar com 0% de progresso
          type: activity.category || 'atividade',
          status: 'in-progress' as const, // Marcar como em progresso para mostrar geração
          originalData: activity
        }));

        console.log('🏗️ Atividades de construção criadas:', constructionActivities);
        setActivities(constructionActivities);

        // Simular progresso de geração para cada atividade
        constructionActivities.forEach((activity, index) => {
          setTimeout(() => {
            simulateActivityGeneration(activity.id);
          }, index * 2000); // Espaçar as gerações
        });

      } catch (error) {
        console.error('❌ Erro ao carregar atividades do plano:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    const simulateActivityGeneration = (activityId: string) => {
      let currentProgress = 0;
      const progressInterval = setInterval(() => {
        currentProgress += Math.random() * 20 + 10; // Incremento aleatório entre 10-30%

        if (currentProgress >= 100) {
          currentProgress = 100;
          clearInterval(progressInterval);

          // Atualizar status para completed
          setActivities(prev => prev.map(activity => 
            activity.id === activityId 
              ? { ...activity, progress: 100, status: 'completed' as const }
              : activity
          ));
        } else {
          // Atualizar progresso
          setActivities(prev => prev.map(activity => 
            activity.id === activityId 
              ? { ...activity, progress: Math.min(currentProgress, 100) }
              : activity
          ));
        }
      }, 800); // Atualizar a cada 800ms
    };

    loadActivitiesFromPlan();
  }, [approvedActivities, setActivities]);

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
      <div className="flex items-center gap-3 mb-6">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#FF6B00] to-[#D65A00] flex items-center justify-center">
          <Building2 className="w-5 h-5 text-white" />
        </div>
        <div>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {activities.length} {activities.length === 1 ? 'atividade aprovada' : 'atividades aprovadas'} para construção
          </p>
        </div>
      </div>

      {/* Grid centralizado para card único */}
      <div className="flex justify-center">
        <div className="w-full max-w-md">
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
      </div>

      {/* Modal de Edição */}
      <EditActivityModal
        isOpen={isModalOpen}
        onClose={closeModal}
        activity={selectedActivity}
        onSave={handleSaveActivity}
      />
    </motion.div>
  );
}
