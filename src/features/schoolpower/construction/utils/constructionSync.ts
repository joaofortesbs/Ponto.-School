
export interface ConstructionSyncEvent {
  type: 'activity_built' | 'batch_completed' | 'construction_started';
  activityId?: string;
  activityTitle?: string;
  content?: string;
  success?: boolean;
  error?: string;
  batchResults?: Array<{
    activityId: string;
    activityTitle: string;
    success: boolean;
    content?: string;
    error?: string;
  }>;
}

class ConstructionSync {
  private static instance: ConstructionSync;
  private listeners: Map<string, Set<(event: ConstructionSyncEvent) => void>> = new Map();

  static getInstance(): ConstructionSync {
    if (!ConstructionSync.instance) {
      ConstructionSync.instance = new ConstructionSync();
    }
    return ConstructionSync.instance;
  }

  // Emitir evento de sincronização
  emit(event: ConstructionSyncEvent): void {
    console.log('📡 Emitindo evento de sincronização:', event.type, event);
    
    // Emitir para listeners específicos do tipo
    const typeListeners = this.listeners.get(event.type);
    if (typeListeners) {
      typeListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Erro ao executar listener de sincronização:', error);
        }
      });
    }

    // Emitir para listeners globais
    const globalListeners = this.listeners.get('*');
    if (globalListeners) {
      globalListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Erro ao executar listener global de sincronização:', error);
        }
      });
    }

    // Emitir evento DOM personalizado para compatibilidade
    window.dispatchEvent(new CustomEvent('constructionSync', {
      detail: event
    }));
  }

  // Adicionar listener para eventos de sincronização
  on(eventType: string, listener: (event: ConstructionSyncEvent) => void): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set());
    }
    
    const typeListeners = this.listeners.get(eventType)!;
    typeListeners.add(listener);

    // Retornar função para remover o listener
    return () => {
      typeListeners.delete(listener);
      if (typeListeners.size === 0) {
        this.listeners.delete(eventType);
      }
    };
  }

  // Remover todos os listeners
  clear(): void {
    this.listeners.clear();
  }

  // Notificar início da construção
  notifyConstructionStarted(activities: Array<{ id: string; title: string }>): void {
    this.emit({
      type: 'construction_started',
      batchResults: activities.map(activity => ({
        activityId: activity.id,
        activityTitle: activity.title,
        success: false
      }))
    });
  }

  // Notificar construção de uma atividade específica
  notifyActivityBuilt(activityId: string, activityTitle: string, success: boolean, content?: string, error?: string): void {
    this.emit({
      type: 'activity_built',
      activityId,
      activityTitle,
      success,
      content,
      error
    });
  }

  // Notificar conclusão de um lote de construções
  notifyBatchCompleted(results: Array<{
    activityId: string;
    activityTitle: string;
    success: boolean;
    content?: string;
    error?: string;
  }>): void {
    this.emit({
      type: 'batch_completed',
      batchResults: results
    });
  }
}

export default ConstructionSync;
