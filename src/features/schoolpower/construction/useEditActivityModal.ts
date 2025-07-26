
import { useState, useCallback } from 'react';
import { ConstructionActivity } from './types';

interface UseEditActivityModalReturn {
  isModalOpen: boolean;
  selectedActivity: ConstructionActivity | null;
  openModal: (activity: ConstructionActivity) => void;
  closeModal: () => void;
  handleSaveActivity: (activityData: any) => void;
}

export const useEditActivityModal = (): UseEditActivityModalReturn => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

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

  const handleSaveActivity = useCallback((activityData: any) => {
    console.log('Saving activity data:', activityData);
    // Aqui você pode implementar a lógica para salvar os dados da atividade
    // Por exemplo, fazer uma chamada para API ou atualizar o estado local
    
    // Simular salvamento
    if (selectedActivity) {
      console.log(`Activity ${selectedActivity.id} updated with:`, activityData);
    }
    
    closeModal();
  }, [selectedActivity, closeModal]);

  return {
    isModalOpen,
    selectedActivity,
    openModal,
    closeModal,
    handleSaveActivity
  };
};
