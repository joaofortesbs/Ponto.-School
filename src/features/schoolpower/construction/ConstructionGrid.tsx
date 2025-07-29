import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ConstructionCard } from './ConstructionCard';
import { useConstructionActivities } from './useConstructionActivities';
import { useEditActivityModal } from './useEditActivityModal';
import { EditActivityModal } from './EditActivityModal';
import { ConstructionActivity } from './types';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Building2 } from 'lucide-react';
import AutomationController from './automationController';

interface ConstructionGridProps {
  approvedActivities: any[];
  handleEditActivity?: (activity: any) => void;
}

export function ConstructionGrid({ approvedActivities, handleEditActivity }: ConstructionGridProps) {
  console.log('🎯 ConstructionGrid renderizado com atividades aprovadas:', approvedActivities);

  const { activities, loading } = useConstructionActivities(approvedActivities);
  const { isModalOpen, selectedActivity, openModal, closeModal } = useEditActivityModal();
  const [constructionStatus, setConstructionStatus] = useState<Record<string, { built: boolean; content?: string }>>({});

  console.log('🎯 Estado do modal:', { isModalOpen, selectedActivity: selectedActivity?.title });

  // Verificar status de construção das atividades
  useEffect(() => {
    const checkConstructionStatus = () => {
      const controller = AutomationController.getInstance();
      const status: Record<string, { built: boolean; content?: string }> = {};

      activities.forEach(activity => {
        const isBuilt = controller.isActivityBuilt(activity.id);
        const content = controller.getGeneratedContent(activity.id);
        status[activity.id] = { built: isBuilt, content: content || undefined };
      });

      setConstructionStatus(status);
    };

    if (activities.length > 0) {
      checkConstructionStatus();

      // Verificar periodicamente se novas atividades foram construídas
      const interval = setInterval(checkConstructionStatus, 2000);
      return () => clearInterval(interval);
    }
  }, [activities]);

  // Listener para atualizações de construção automática
  useEffect(() => {
    const handleAutoBuilt = (event: CustomEvent) => {
      console.log('🤖 Atividades auto-construídas detectadas, atualizando interface...');
      const { results } = event.detail;

      const newStatus: Record<string, { built: boolean; content?: string }> = { ...constructionStatus };
      results.forEach((result: any) => {
        newStatus[result.activityId] = {
          built: result.success,
          content: result.generatedContent
        };
      });

      setConstructionStatus(newStatus);
    };

    window.addEventListener('activitiesAutoBuilt', handleAutoBuilt as EventListener);

    return () => {
      window.removeEventListener('activitiesAutoBuilt', handleAutoBuilt as EventListener);
    };
  }, [constructionStatus]);

  const handleEdit = (activity: ConstructionActivity) => {
    console.log('🔧 Clique no botão Editar Materiais detectado para atividade:', activity.title);
    console.log('🔧 ID da atividade:', activity.id);
    console.log('🔧 Função onEdit disponível:', typeof handleEditActivity);

    if (handleEditActivity) {
      console.log('🎯 Abrindo modal para atividade:', activity.title);
      console.log('🎯 Dados da atividade:', activity);
      handleEditActivity(activity);
    } else {
      console.log('Opening modal for activity:', activity.id);
      openModal(activity);
    }

    console.log('🔧 Função onEdit executada com sucesso!');
  };

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

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {activities && activities.length > 0 ? activities.map((activity) => {
            const status = constructionStatus[activity.id];
            const isBuilt = status?.built || false;
            const hasContent = !!status?.content;

            // Calcular progresso baseado no status de construção
            const progress = isBuilt ? (hasContent ? 100 : 80) : activity.progress;
            const activityStatus = isBuilt ? (hasContent ? 'completed' : 'in-progress') : activity.status;

            return (
              <ConstructionCard
                key={activity.id}
                id={activity.id}
                title={activity.title}
                description={activity.description}
                progress={progress}
                type={activity.type}
                status={activityStatus}
                onEdit={() => handleEdit(activity)}
                onView={() => console.log('Visualizar atividade:', activity.id)}
                onShare={() => console.log('Compartilhar atividade:', activity.id)}
              />
            );
          }) : (
        <div className="col-span-full flex flex-col items-center justify-center py-12 text-center">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Nenhuma atividade para construir
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Approve algumas atividades no plano de ação para começar a construção.
          </p>
        </div>
      )}
      </div>

      {/* Modal de Edição */}
      <EditActivityModal
        isOpen={isModalOpen}
        onClose={closeModal}
        activity={selectedActivity}
        // onSave={handleSaveActivity}  // Remove onSave prop as per the instructions
      />
    </motion.div>
  );
}