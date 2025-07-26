
import { useState, useCallback } from 'react';
import { EditActivityModalState } from './types';

export function useEditActivityModal() {
  const [modalState, setModalState] = useState<EditActivityModalState>({
    isOpen: false,
    activityId: null,
    activityTitle: ''
  });

  const openModal = useCallback((activityId: string, activityTitle: string) => {
    setModalState({
      isOpen: true,
      activityId,
      activityTitle
    });
  }, []);

  const closeModal = useCallback(() => {
    setModalState({
      isOpen: false,
      activityId: null,
      activityTitle: ''
    });
  }, []);

  const saveAndClose = useCallback((activityId: string, data: any) => {
    // Aqui pode ser implementada a lógica de salvamento
    console.log('Salvando dados da atividade:', activityId, data);
    
    // Fechar modal após salvar
    closeModal();
  }, [closeModal]);

  return {
    modalState,
    openModal,
    closeModal,
    saveAndClose
  };
}
