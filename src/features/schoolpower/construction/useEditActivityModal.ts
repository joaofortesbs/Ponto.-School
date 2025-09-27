
import { useState, useCallback } from 'react';
import { ConstructionActivity } from './types';
import { autoBuildService } from './services/autoBuildService';

interface UseEditActivityModalReturn {
  isModalOpen: boolean;
  selectedActivity: ConstructionActivity | null;
  openModal: (activity: ConstructionActivity) => void;
  closeModal: () => void;
  handleSaveActivity: (activityData: any) => void;
  isViewModalOpen: boolean;
  viewActivity: ConstructionActivity | null;
  openViewModal: (activity: ConstructionActivity) => void;
  closeViewModal: () => void;
}

export const useEditActivityModal = (): UseEditActivityModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewActivity, setViewActivity] = useState<ConstructionActivity | null>(null);

  const openModal = useCallback((activity: ConstructionActivity) => {
    console.log('Opening modal for activity:', activity.id);
    setSelectedActivity(activity);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setIsModalOpen(false);
    setSelectedActivity(null);
  }, []);

  const openViewModal = useCallback((activity: ConstructionActivity) => {
    console.log('Opening view modal for activity:', activity.id);
    setViewActivity(activity);
    setIsViewModalOpen(true);
  }, []);

  const closeViewModal = useCallback(() => {
    console.log('Closing view modal');
    setIsViewModalOpen(false);
    setViewActivity(null);
  }, []);

  const handleSaveActivity = useCallback(async (activityData: any) => {
    console.log('💾 [SAVE] ==========================================');
    console.log('💾 [SAVE] SALVANDO ATIVIDADE REAL');
    console.log('💾 [SAVE] Activity ID:', selectedActivity?.id);
    console.log('💾 [SAVE] Activity Data:', activityData);
    console.log('💾 [SAVE] ==========================================');
    
    try {
      if (!selectedActivity) {
        console.error('❌ [SAVE] Nenhuma atividade selecionada');
        closeModal();
        return;
      }

      // 1. Salvar dados no localStorage
      console.log('💾 [SAVE] Salvando no localStorage...');
      localStorage.setItem(`activity_${selectedActivity.id}`, JSON.stringify(activityData));
      
      // 2. Marcar como construída no localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[selectedActivity.id] = {
        isBuilt: true,
        builtAt: new Date().toISOString(),
        progress: 100,
        status: 'completed'
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      console.log('✅ [SAVE] Dados salvos no localStorage');
      
      // 3. Criar atividade atualizada para verificação de progresso
      const updatedActivity: ConstructionActivity = {
        ...selectedActivity,
        isBuilt: true,
        progress: 100,
        status: 'completed',
        builtAt: new Date().toISOString(),
        customFields: activityData
      };
      
      // 4. VERIFICAR SE ATIVIDADE ESTÁ COMPLETA (100%) E EXECUTAR AUTO-SAVE
      if (updatedActivity.progress === 100 && updatedActivity.status === 'completed') {
        console.log('🎯 [SAVE] ==========================================');
        console.log('🎯 [SAVE] ATIVIDADE ATINGIU 100% - INICIANDO AUTO-SAVE!');
        console.log('🎯 [SAVE] ID:', updatedActivity.id);
        console.log('🎯 [SAVE] Título:', updatedActivity.title);
        console.log('🎯 [SAVE] Status:', updatedActivity.status);
        console.log('🎯 [SAVE] Progress:', updatedActivity.progress);
        console.log('🎯 [SAVE] ==========================================');
        
        try {
          // Executar salvamento automático no banco usando autoBuildService
          await autoBuildService.saveConstructedActivityToDatabase(updatedActivity);
          
          console.log('✅ [SAVE] Salvamento automático executado com sucesso!');
          
          // Disparar evento customizado para atualização da interface
          window.dispatchEvent(new CustomEvent('activity-auto-saved', {
            detail: {
              activityId: updatedActivity.id,
              activityTitle: updatedActivity.title,
              savedAt: new Date().toISOString()
            }
          }));
          
        } catch (autoSaveError) {
          console.error('❌ [SAVE] Erro no salvamento automático:', autoSaveError);
          
          // Salvar erro para debug
          localStorage.setItem(`auto_save_error_${selectedActivity.id}`, JSON.stringify({
            error: autoSaveError instanceof Error ? autoSaveError.message : 'Erro desconhecido',
            errorAt: new Date().toISOString(),
            activity: {
              id: selectedActivity.id,
              title: selectedActivity.title
            }
          }));
        }
      } else {
        console.log('⚠️ [SAVE] Atividade não está 100% completa, pulando auto-save');
        console.log('⚠️ [SAVE] Progress:', updatedActivity.progress, 'Status:', updatedActivity.status);
      }
      
      console.log('✅ [SAVE] Processo de salvamento concluído');
      
    } catch (error) {
      console.error('❌ [SAVE] Erro crítico no salvamento:', error);
    } finally {
      closeModal();
    }
  }, [selectedActivity, closeModal]);

  return {
    isModalOpen,
    selectedActivity,
    openModal,
    closeModal,
    handleSaveActivity,
    isViewModalOpen,
    viewActivity,
    openViewModal,
    closeViewModal
  };
};
