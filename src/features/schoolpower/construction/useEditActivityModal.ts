import { useState, useCallback } from 'react';
import { ConstructionActivity } from '../../api/models/constructionTypes';

interface UseEditActivityModal {
  isModalOpen: boolean;
  selectedActivity: ConstructionActivity | null;
  openModal: (activity: ConstructionActivity) => void;
  closeModal: () => void;
  handleSaveActivity: (updatedActivity: ConstructionActivity) => void;
}

export function useEditActivityModal(): UseEditActivityModal {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

  const openModal = (activity: ConstructionActivity) => {
    setSelectedActivity(activity);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedActivity(null);
  };

  const handleSaveActivity = (updatedActivity: ConstructionActivity) => {
    console.log('💾 Salvando atividade editada:', updatedActivity);
    // Aqui você pode adicionar lógica para salvar a atividade
    closeModal();
  };

  return {
    isModalOpen,
    selectedActivity,
    openModal,
    closeModal,
    handleSaveActivity,
  };
}