
import { useState, useEffect, useCallback } from 'react';

// Definindo o enum para os tipos de visualização
export enum ViewType {
  LIST = 'list',
  GRID = 'grid',
  CALENDAR = 'calendar',
  KANBAN = 'kanban',
  TIMELINE = 'timeline'
}

// Interface para as opções do hook
interface UseViewStateOptions {
  defaultView?: ViewType;
  localStorageKey?: string;
  onViewChange?: (view: ViewType) => void;
}

// Interface para o retorno do hook
interface UseViewStateReturn {
  view: ViewType;
  setView: (view: ViewType) => void;
  toggleView: (view1: ViewType, view2: ViewType) => void;
  isViewActive: (view: ViewType) => boolean;
}

// Hook personalizado para gerenciar o estado de visualização
export function useViewState({
  defaultView = ViewType.LIST,
  localStorageKey = 'app_view_preference',
  onViewChange
}: UseViewStateOptions = {}): UseViewStateReturn {
  // Inicializar estado com preferência do localStorage ou valor padrão
  const [view, setViewState] = useState<ViewType>(() => {
    if (typeof window === 'undefined') return defaultView;
    
    try {
      const savedView = localStorage.getItem(localStorageKey);
      // Verificar se o valor salvo é válido (está no enum)
      if (savedView && Object.values(ViewType).includes(savedView as ViewType)) {
        return savedView as ViewType;
      }
    } catch (error) {
      console.error('Erro ao acessar localStorage:', error);
    }
    
    return defaultView;
  });

  // Persistir a mudança de visualização no localStorage
  useEffect(() => {
    try {
      localStorage.setItem(localStorageKey, view);
    } catch (error) {
      console.error('Erro ao salvar visualização no localStorage:', error);
    }
    
    // Chamar callback de mudança, se fornecido
    if (onViewChange) {
      onViewChange(view);
    }
  }, [view, localStorageKey, onViewChange]);

  // Função para atualizar a visualização
  const setView = useCallback((newView: ViewType) => {
    setViewState(newView);
  }, []);

  // Função para alternar entre duas visualizações
  const toggleView = useCallback((view1: ViewType, view2: ViewType) => {
    setViewState(current => current === view1 ? view2 : view1);
  }, []);

  // Função para verificar se uma visualização específica está ativa
  const isViewActive = useCallback((viewToCheck: ViewType): boolean => {
    return view === viewToCheck;
  }, [view]);

  return {
    view,
    setView,
    toggleView,
    isViewActive
  };
}

export default useViewState;
