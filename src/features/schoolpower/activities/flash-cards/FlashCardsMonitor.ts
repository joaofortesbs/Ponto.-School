
/**
 * Sistema de Monitoramento Global para Flash Cards
 * Garante sincronização entre auto-build e interface
 */

interface FlashCardsData {
  cards: any[];
  title: string;
  theme: string;
  totalCards: number;
  isGeneratedByAI: boolean;
}

interface FlashCardsEvent {
  activityId: string;
  data: FlashCardsData;
  source: 'modal-generation' | 'auto-build' | 'generate-activity-content';
  timestamp: number;
}

class FlashCardsMonitor {
  private static instance: FlashCardsMonitor;
  private eventListeners: Map<string, Function[]> = new Map();

  static getInstance(): FlashCardsMonitor {
    if (!FlashCardsMonitor.instance) {
      FlashCardsMonitor.instance = new FlashCardsMonitor();
    }
    return FlashCardsMonitor.instance;
  }

  constructor() {
    this.setupGlobalListeners();
  }

  private setupGlobalListeners() {
    // Escutar eventos de auto-build
    window.addEventListener('flash-cards-auto-build', (event: CustomEvent) => {
      console.log('🎯 FlashCardsMonitor: Auto-build detectado', event.detail);
      this.handleFlashCardsUpdate(event.detail);
    });

    // Escutar mudanças no localStorage
    window.addEventListener('storage', (event) => {
      if (event.key && event.key.includes('constructed_flash-cards_')) {
        console.log('💾 FlashCardsMonitor: localStorage atualizado', event.key);
        this.handleStorageUpdate(event);
      }
    });
  }

  private handleFlashCardsUpdate(detail: FlashCardsEvent) {
    const { activityId, data, source } = detail;
    
    // Validar dados
    if (!data || !data.cards || !Array.isArray(data.cards)) {
      console.warn('⚠️ FlashCardsMonitor: Dados inválidos recebidos', data);
      return;
    }

    console.log(`📡 FlashCardsMonitor: Processando ${data.cards.length} cards para ${activityId} (fonte: ${source})`);

    // Notificar listeners registrados
    const listeners = this.eventListeners.get(activityId) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('❌ Erro ao notificar listener:', error);
      }
    });
  }

  private handleStorageUpdate(event: StorageEvent) {
    if (!event.newValue) return;

    try {
      const parsed = JSON.parse(event.newValue);
      const data = parsed.data || parsed;
      
      if (data && data.cards) {
        const activityId = event.key?.split('_').pop();
        if (activityId) {
          this.handleFlashCardsUpdate({
            activityId,
            data,
            source: 'auto-build',
            timestamp: Date.now()
          });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar storage update:', error);
    }
  }

  // Registrar listener para uma atividade específica
  registerListener(activityId: string, callback: Function) {
    if (!this.eventListeners.has(activityId)) {
      this.eventListeners.set(activityId, []);
    }
    this.eventListeners.get(activityId)!.push(callback);
    
    console.log(`📋 Listener registrado para Flash Cards: ${activityId}`);
  }

  // Remover listener
  unregisterListener(activityId: string, callback: Function) {
    const listeners = this.eventListeners.get(activityId);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
        console.log(`🗑️ Listener removido para Flash Cards: ${activityId}`);
      }
    }
  }

  // Verificar se há dados salvos para uma atividade
  checkSavedData(activityId: string): FlashCardsData | null {
    try {
      const saved = localStorage.getItem(`constructed_flash-cards_${activityId}`);
      if (saved) {
        const parsed = JSON.parse(saved);
        const data = parsed.data || parsed;
        
        if (data && data.cards && Array.isArray(data.cards) && data.cards.length > 0) {
          return data;
        }
      }
    } catch (error) {
      console.error('❌ Erro ao verificar dados salvos:', error);
    }
    
    return null;
  }
}

export const flashCardsMonitor = FlashCardsMonitor.getInstance();
export default FlashCardsMonitor;
