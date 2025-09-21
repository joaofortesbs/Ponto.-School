
import { autoSaveService } from './autoSaveService';
import { activitiesService } from '@/services/activitiesService';

interface ConstructionMonitorConfig {
  enabled: boolean;
  checkIntervalMs: number;
  maxRetries: number;
}

class ConstructionMonitorService {
  private config: ConstructionMonitorConfig = {
    enabled: true,
    checkIntervalMs: 5000, // 5 segundos
    maxRetries: 3
  };

  private intervalId: NodeJS.Timeout | null = null;
  private retryCount = new Map<string, number>();

  /**
   * Inicia o monitoramento de atividades construídas
   */
  startMonitoring() {
    if (!this.config.enabled || this.intervalId) {
      return;
    }

    console.log('🔍 Iniciando monitoramento de atividades construídas');

    this.intervalId = setInterval(() => {
      this.checkAndSaveBuiltActivities();
    }, this.config.checkIntervalMs);
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      console.log('🛑 Monitoramento de atividades parado');
    }
  }

  /**
   * Verifica e salva atividades construídas que ainda não foram salvas
   */
  private async checkAndSaveBuiltActivities() {
    try {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
      
      const savedActivityIds = new Set(savedActivities.map((item: any) => item.activityId).filter(Boolean));

      for (const [activityId, activityInfo] of Object.entries(constructedActivities) as [string, any][]) {
        // Verificar se a atividade foi construída mas não foi salva
        if (activityInfo.isBuilt && !savedActivityIds.has(activityId)) {
          console.log(`🔍 Atividade construída não salva detectada: ${activityId}`);
          
          // Verificar número de tentativas
          const currentRetries = this.retryCount.get(activityId) || 0;
          if (currentRetries >= this.config.maxRetries) {
            console.warn(`⚠️ Máximo de tentativas atingido para ${activityId}`);
            continue;
          }

          // Tentar salvar a atividade
          await this.attemptSaveActivity(activityId, activityInfo);
        }
      }

    } catch (error) {
      console.error('❌ Erro no monitoramento de atividades:', error);
    }
  }

  /**
   * Tenta salvar uma atividade específica
   */
  private async attemptSaveActivity(activityId: string, activityInfo: any) {
    try {
      // Obter dados da atividade construída
      const activityData = localStorage.getItem(`activity_${activityId}`);
      if (!activityData) {
        console.warn(`⚠️ Dados da atividade ${activityId} não encontrados`);
        return;
      }

      const parsedData = JSON.parse(activityData);
      const userId = this.getUserId();
      const activityCode = `monitor-${activityInfo.type || 'generic'}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;

      const saveData = {
        user_id: userId,
        activity_code: activityCode,
        type: activityInfo.type || 'generic',
        title: activityInfo.title || 'Atividade School Power',
        content: {
          ...parsedData,
          monitoredSave: true,
          constructedAt: activityInfo.builtAt,
          activityId: activityId,
          retryAttempt: (this.retryCount.get(activityId) || 0) + 1
        }
      };

      console.log(`💾 Tentando salvar atividade monitorada: ${activityId}`);

      const result = await activitiesService.saveActivity(saveData);

      if (result) {
        console.log(`✅ Atividade ${activityId} salva com sucesso pelo monitor`);

        // Atualizar lista de atividades salvas
        const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
        savedActivities.push({
          activityCode,
          savedAt: new Date().toISOString(),
          title: activityInfo.title,
          type: activityInfo.type,
          activityId: activityId,
          neonSaved: true,
          source: 'ConstructionMonitor'
        });
        localStorage.setItem('school_power_saved_activities', JSON.stringify(savedActivities));

        // Resetar contador de tentativas
        this.retryCount.delete(activityId);

        // Mostrar notificação
        this.showMonitorNotification(activityInfo.title || activityId);

      } else {
        throw new Error('Falha no salvamento');
      }

    } catch (error) {
      console.error(`❌ Erro ao salvar atividade monitorada ${activityId}:`, error);
      
      // Incrementar contador de tentativas
      const currentRetries = this.retryCount.get(activityId) || 0;
      this.retryCount.set(activityId, currentRetries + 1);

      console.log(`🔄 Tentativa ${currentRetries + 1}/${this.config.maxRetries} para ${activityId}`);
    }
  }

  /**
   * Obtém ID do usuário
   */
  private getUserId(): string {
    return localStorage.getItem('user_id') || 
           localStorage.getItem('current_user_id') || 
           localStorage.getItem('neon_user_id') ||
           'anonymous';
  }

  /**
   * Mostra notificação de salvamento pelo monitor
   */
  private showMonitorNotification(title: string) {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="text-sm font-medium">${title} salva pelo monitor!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        document.body.removeChild(notification);
      }
    }, 4000);
  }

  /**
   * Força verificação e salvamento imediato
   */
  async forceSaveCheck() {
    console.log('🔍 Verificação forçada de atividades não salvas');
    await this.checkAndSaveBuiltActivities();
  }

  /**
   * Obtém estatísticas do monitor
   */
  getStats() {
    return {
      isRunning: !!this.intervalId,
      retryingActivities: this.retryCount.size,
      config: this.config
    };
  }
}

// Exportar instância singleton
export const constructionMonitorService = new ConstructionMonitorService();
export default constructionMonitorService;
