
import { useState } from 'react';

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
interface ViewStateReturn {
  view: ViewType;
  setView: (view: ViewType) => void;
  toggleView: () => void;
  isListView: boolean;
  isGridView: boolean;
  isCalendarView: boolean;
  isKanbanView: boolean;
  isTimelineView: boolean;
}

/**
 * Hook personalizado para gerenciar o estado de visualização
 * (lista, grade, calendário, etc.)
 */
export function useViewState({
  defaultView = ViewType.LIST,
  localStorageKey,
  onViewChange
}: UseViewStateOptions = {}): ViewStateReturn {
  // Recupera o estado salvo do localStorage, se disponível
  const getInitialState = (): ViewType => {
    if (!localStorageKey || typeof window === 'undefined') {
      return defaultView;
    }
    
    const savedView = localStorage.getItem(localStorageKey);
    
    // Verifica se o valor salvo é um ViewType válido
    if (savedView && Object.values(ViewType).includes(savedView as ViewType)) {
      return savedView as ViewType;
    }
    
    return defaultView;
  };

  const [view, setViewInternal] = useState<ViewType>(getInitialState);

  // Função para alterar a visualização
  const setView = (newView: ViewType): void => {
    setViewInternal(newView);
    
    // Salva no localStorage se uma chave foi fornecida
    if (localStorageKey && typeof window !== 'undefined') {
      localStorage.setItem(localStorageKey, newView);
    }
    
    // Chama o callback, se fornecido
    if (onViewChange) {
      onViewChange(newView);
    }
  };

  // Função para alternar entre visualizações (lista/grade ou outras combinações)
  const toggleView = (): void => {
    setView(view === ViewType.LIST ? ViewType.GRID : ViewType.LIST);
  };

  return {
    view,
    setView,
    toggleView,
    isListView: view === ViewType.LIST,
    isGridView: view === ViewType.GRID,
    isCalendarView: view === ViewType.CALENDAR,
    isKanbanView: view === ViewType.KANBAN,
    isTimelineView: view === ViewType.TIMELINE
  };
}

export default useViewState;
