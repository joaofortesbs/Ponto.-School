
import { activitiesService, CreateActivityData } from '@/services/activitiesService';

export interface AutoSaveConfig {
  enabled: boolean;
  delayMs: number;
  retryAttempts: number;
  forceNeonSave: boolean;
}

export interface ActivityConstructionData {
  id: string;
  type: string;
  title: string;
  description: string;
  progress: number;
  status: 'draft' | 'in-progress' | 'completed';
  originalData: any;
  isBuilt?: boolean;
  builtAt?: string;
}

class AutoSaveService {
  private config: AutoSaveConfig = {
    enabled: true,
    delayMs: 1000, // 1 segundo de delay para ser mais rápido
    retryAttempts: 5, // Mais tentativas
    forceNeonSave: true // Força salvamento no Neon
  };

  private saveQueue = new Map<string, NodeJS.Timeout>();
  private retryCount = new Map<string, number>();

  /**
   * Configura o serviço de auto-save
   */
  configure(config: Partial<AutoSaveConfig>) {
    this.config = { ...this.config, ...config };
    console.log('🔧 AutoSaveService configurado:', this.config);
  }

  /**
   * Agenda o salvamento automático de uma atividade
   */
  scheduleAutoSave(activity: ActivityConstructionData) {
    if (!this.config.enabled) {
      return;
    }

    // Aceitar atividades completas OU construídas
    const shouldSave = activity.status === 'completed' || 
                      activity.progress >= 100 || 
                      activity.isBuilt === true;

    if (!shouldSave) {
      console.log(`⚠️ Atividade ${activity.title} não atende critérios para auto-save:`, {
        status: activity.status,
        progress: activity.progress,
        isBuilt: activity.isBuilt
      });
      return;
    }

    const activityId = activity.id;
    
    // Cancelar salvamento anterior se existir
    if (this.saveQueue.has(activityId)) {
      clearTimeout(this.saveQueue.get(activityId)!);
    }

    // Agendar novo salvamento
    const timeoutId = setTimeout(() => {
      this.performAutoSave(activity);
      this.saveQueue.delete(activityId);
    }, this.config.delayMs);

    this.saveQueue.set(activityId, timeoutId);
    
    console.log(`⏰ Auto-save agendado para ${activity.title} em ${this.config.delayMs}ms`);
  }

  /**
   * Executa o salvamento automático
   */
  private async performAutoSave(activity: ActivityConstructionData) {
    try {
      console.log('🔄 Executando auto-save para:', activity.title);
      
      const userId = this.getUserId();
      const activityCode = this.generateActivityCode(activity);
      
      // Buscar dados construídos do localStorage
      const constructedData = localStorage.getItem(`activity_${activity.id}`);
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityConstructionData = constructedActivities[activity.id];
      
      let generatedContent = {};
      if (constructedData) {
        try {
          generatedContent = JSON.parse(constructedData);
        } catch (e) {
          console.warn('⚠️ Erro ao fazer parse do conteúdo construído:', e);
        }
      }
      
      const saveData: CreateActivityData = {
        user_id: userId,
        activity_code: activityCode,
        type: activity.type,
        title: activity.title,
        content: {
          // Dados originais da atividade
          originalData: activity.originalData || {},
          
          // Conteúdo gerado pela IA
          generatedContent: generatedContent,
          
          // Dados de construção
          constructionData: activityConstructionData || {},
          
          // Metadados do School Power
          schoolPowerMetadata: {
            constructedAt: new Date().toISOString(),
            autoSaved: true,
            activityId: activity.id,
            progress: activity.progress,
            status: activity.status,
            description: activity.description,
            isBuilt: true,
            source: 'schoolpower_construction'
          }
        }
      };

      console.log('💾 Salvando atividade no Neon:', {
        activityCode,
        title: activity.title,
        type: activity.type,
        hasGeneratedContent: !!generatedContent,
        hasOriginalData: !!activity.originalData
      });

      const result = await activitiesService.saveActivity(saveData);
      
      if (result.success && result.data) {
        await this.handleSaveSuccess(activity, activityCode, result.data);
      } else {
        console.error('❌ Falha no salvamento:', result.error);
        await this.handleSaveError(activity, result.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('❌ Erro no performAutoSave:', error);
      await this.handleSaveError(activity, error instanceof Error ? error.message : 'Erro inesperado');
    }
  }

  /**
   * Trata sucesso no salvamento
   */
  private async handleSaveSuccess(activity: ActivityConstructionData, activityCode: string, savedActivity: any) {
    console.log('✅ Auto-save concluído com sucesso:', activityCode);
    
    // Armazenar referência local
    const reference = {
      activityCode,
      savedAt: new Date().toISOString(),
      title: activity.title,
      type: activity.type,
      neonSaved: true,
      activityId: activity.id
    };
    
    localStorage.setItem(`autosaved_${activity.id}`, JSON.stringify(reference));
    
    // Atualizar lista geral de atividades salvas
    this.updateSavedActivitiesList(reference);
    
    // Mostrar notificação de sucesso
    this.showSuccessNotification(activity.title);
    
    // Resetar contador de tentativas
    this.retryCount.delete(activity.id);
  }

  /**
   * Trata erro no salvamento
   */
  private async handleSaveError(activity: ActivityConstructionData, error: string) {
    console.error('❌ Erro no auto-save:', error);
    
    const activityId = activity.id;
    const currentRetries = this.retryCount.get(activityId) || 0;
    
    if (currentRetries < this.config.retryAttempts) {
      // Tentar novamente
      this.retryCount.set(activityId, currentRetries + 1);
      console.log(`🔄 Tentativa ${currentRetries + 1}/${this.config.retryAttempts} para ${activity.title}`);
      
      setTimeout(() => {
        this.performAutoSave(activity);
      }, this.config.delayMs * (currentRetries + 1)); // Delay progressivo
      
    } else {
      // Falha definitiva
      console.error(`❌ Auto-save falhou definitivamente para ${activity.title}`);
      this.showErrorNotification(activity.title);
      this.retryCount.delete(activityId);
      
      // Salvar no localStorage como fallback
      this.saveToLocalStorageFallback(activity);
    }
  }

  /**
   * Obtém ID do usuário
   */
  private getUserId(): string {
    return localStorage.getItem('user_id') || 
           localStorage.getItem('current_user_id') || 
           localStorage.getItem('neon_user_id') ||
           this.generateTempUserId();
  }

  /**
   * Gera ID temporário para usuário anônimo
   */
  private generateTempUserId(): string {
    const tempId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 8)}`;
    localStorage.setItem('temp_user_id', tempId);
    return tempId;
  }

  /**
   * Gera código único para a atividade
   */
  private generateActivityCode(activity: ActivityConstructionData): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 6);
    return `sp-${activity.type}-${timestamp}-${random}`;
  }

  /**
   * Atualiza lista de atividades salvas
   */
  private updateSavedActivitiesList(reference: any) {
    const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
    
    // Evitar duplicatas
    const existingIndex = savedActivities.findIndex((item: any) => item.activityId === reference.activityId);
    
    if (existingIndex >= 0) {
      savedActivities[existingIndex] = reference;
    } else {
      savedActivities.push(reference);
    }
    
    localStorage.setItem('school_power_saved_activities', JSON.stringify(savedActivities));
  }

  /**
   * Salva no localStorage como fallback
   */
  private saveToLocalStorageFallback(activity: ActivityConstructionData) {
    try {
      const fallbackData = {
        ...activity,
        savedAt: new Date().toISOString(),
        fallbackSave: true,
        needsSync: true
      };
      
      localStorage.setItem(`fallback_${activity.id}`, JSON.stringify(fallbackData));
      
      // Adicionar à lista de itens que precisam ser sincronizados
      const pendingSync = JSON.parse(localStorage.getItem('pending_neon_sync') || '[]');
      pendingSync.push({
        activityId: activity.id,
        title: activity.title,
        savedAt: new Date().toISOString()
      });
      localStorage.setItem('pending_neon_sync', JSON.stringify(pendingSync));
      
      console.log('💾 Atividade salva no fallback localStorage');
      
    } catch (error) {
      console.error('❌ Falha total no salvamento:', error);
    }
  }

  /**
   * Mostra notificação de sucesso
   */
  private showSuccessNotification(title: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">${title}</span>
        <span class="text-green-200">salva automaticamente!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  }

  /**
   * Mostra notificação de erro
   */
  private showErrorNotification(title: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">Erro ao salvar ${title}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 5000);
  }

  /**
   * Cancela salvamentos pendentes
   */
  cancelPendingSaves() {
    this.saveQueue.forEach((timeoutId) => {
      clearTimeout(timeoutId);
    });
    this.saveQueue.clear();
    console.log('🚫 Salvamentos pendentes cancelados');
  }

  /**
   * Sincroniza atividades em fallback
   */
  async syncPendingActivities(): Promise<number> {
    const pendingSync = JSON.parse(localStorage.getItem('pending_neon_sync') || '[]');
    
    if (pendingSync.length === 0) {
      return 0;
    }

    console.log(`🔄 Sincronizando ${pendingSync.length} atividades pendentes...`);
    
    let syncedCount = 0;
    
    for (const pending of pendingSync) {
      try {
        const fallbackData = localStorage.getItem(`fallback_${pending.activityId}`);
        
        if (fallbackData) {
          const activity = JSON.parse(fallbackData);
          await this.performAutoSave(activity);
          syncedCount++;
        }
        
      } catch (error) {
        console.error(`❌ Erro ao sincronizar ${pending.title}:`, error);
      }
    }
    
    // Limpar lista de sincronização se todas foram processadas
    if (syncedCount === pendingSync.length) {
      localStorage.removeItem('pending_neon_sync');
    }
    
    return syncedCount;
  }

  /**
   * Obtém estatísticas do auto-save
   */
  getStats() {
    const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
    const pendingSync = JSON.parse(localStorage.getItem('pending_neon_sync') || '[]');
    
    return {
      totalSaved: savedActivities.length,
      pendingSync: pendingSync.length,
      queuedSaves: this.saveQueue.size,
      retryingActivities: this.retryCount.size,
      isEnabled: this.config.enabled
    };
  }
}

// Exportar instância singleton
export const autoSaveService = new AutoSaveService();
export default autoSaveService;
