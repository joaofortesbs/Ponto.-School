import { useState, useCallback } from 'react';
import { ConstructionActivity } from './types';

export const useEditActivityModal = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ConstructionActivity | null>(null);

  const openModal = useCallback((activity: ConstructionActivity) => {
    console.log('Opening modal for activity:', activity.id);
    setSelectedActivity(activity);
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    console.log('Closing modal');
    setIsOpen(false);
    setSelectedActivity(null);
  }, []);

  const handleSaveActivity = useCallback((updatedActivity: ConstructionActivity) => {
    console.log('Saving activity:', updatedActivity);
    // TODO: Implement save logic here
    closeModal();
  }, [closeModal]);

  return {
    isModalOpen: isOpen,
    selectedActivity,
    openModal,
    closeModal,
    handleSaveActivity,
  };
};