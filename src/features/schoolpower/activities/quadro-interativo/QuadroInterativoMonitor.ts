
/**
 * Sistema de Monitoramento Exclusivo para Quadro Interativo
 * Garante que a atividade seja construída e gerada corretamente
 */

export class QuadroInterativoMonitor {
  private static instance: QuadroInterativoMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;
  private lastCheck = 0;

  static getInstance(): QuadroInterativoMonitor {
    if (!QuadroInterativoMonitor.instance) {
      QuadroInterativoMonitor.instance = new QuadroInterativoMonitor();
    }
    return QuadroInterativoMonitor.instance;
  }

  /**
   * Inicia o monitoramento das atividades de Quadro Interativo
   */
  startMonitoring(): void {
    if (this.isMonitoring) return;

    console.log('🔍 [MONITOR] Iniciando monitoramento do Quadro Interativo');
    this.isMonitoring = true;

    // Verificação inicial
    setTimeout(() => {
      this.checkPendingActivities();
    }, 1000);

    // Monitoramento contínuo
    this.monitoringInterval = setInterval(() => {
      this.checkPendingActivities();
    }, 3000);

    // Listeners para eventos de construção automática
    this.setupEventListeners();
  }

  /**
   * Para o monitoramento
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.isMonitoring = false;
    this.removeEventListeners();
    console.log('🔍 [MONITOR] Monitoramento parado');
  }

  /**
   * Configurar listeners de eventos
   */
  private setupEventListeners(): void {
    window.addEventListener('schoolpower-build-all', this.handleBuildAllEvent.bind(this));
    window.addEventListener('schoolpower-build-all-completed', this.handleBuildAllCompletedEvent.bind(this));
    window.addEventListener('quadro-interativo-manual-trigger', this.handleManualTrigger.bind(this));
  }

  /**
   * Remover listeners de eventos
   */
  private removeEventListeners(): void {
    window.removeEventListener('schoolpower-build-all', this.handleBuildAllEvent.bind(this));
    window.removeEventListener('schoolpower-build-all-completed', this.handleBuildAllCompletedEvent.bind(this));
    window.removeEventListener('quadro-interativo-manual-trigger', this.handleManualTrigger.bind(this));
  }

  /**
   * Verifica atividades pendentes de construção
   */
  private checkPendingActivities(): void {
    const now = Date.now();
    if (now - this.lastCheck < 2000) return; // Evitar verificações muito frequentes
    this.lastCheck = now;

    try {
      console.log('🔍 [MONITOR] Verificando atividades pendentes');
      
      // Verificar atividades construídas mas não geradas
      const keys = Object.keys(localStorage);
      const relevantKeys = keys.filter(key => 
        key.startsWith('constructed_quadro-interativo_') || 
        key.startsWith('auto_activity_data_') && key.includes('quadro-interativo') ||
        key.startsWith('quadro_interativo_preview_')
      );

      console.log(`🔍 [MONITOR] Encontradas ${relevantKeys.length} chaves relevantes:`, relevantKeys);

      relevantKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const activityId = this.extractActivityId(key, data);
          
          if (data && activityId && this.shouldTriggerGeneration(activityId, data)) {
            console.log('🎯 [MONITOR] Atividade pendente detectada:', activityId);
            this.triggerContentGeneration(activityId, data);
          }
        } catch (e) {
          console.warn('⚠️ [MONITOR] Erro ao processar chave:', key, e);
        }
      });

      // Verificar action plan
      this.checkActionPlanActivities();

    } catch (error) {
      console.error('❌ [MONITOR] Erro no monitoramento:', error);
    }
  }

  /**
   * Extrair ID da atividade de diferentes formatos de chave
   */
  private extractActivityId(key: string, data: any): string | null {
    if (key.includes('_')) {
      const parts = key.split('_');
      return parts[parts.length - 1];
    }
    
    return data?.activityId || data?.id || null;
  }

  /**
   * Verificar se deve disparar a geração de conteúdo
   */
  private shouldTriggerGeneration(activityId: string, data: any): boolean {
    // Verificar se já tem conteúdo gerado
    if (this.hasGeneratedContent(activityId)) {
      return false;
    }

    // Verificar se a atividade está construída
    const isBuilt = data.isBuilt || data.builtAt || data.status === 'completed';
    
    // Verificar se tem dados suficientes
    const hasData = data.formData || data.customFields || (data.title && data.description);

    return isBuilt && hasData;
  }

  /**
   * Verifica se uma atividade já tem conteúdo gerado
   */
  private hasGeneratedContent(activityId: string): boolean {
    const contentKeys = [
      `quadro_interativo_content_${activityId}`,
      `quadro_interativo_generated_${activityId}`
    ];
    
    return contentKeys.some(key => !!localStorage.getItem(key));
  }

  /**
   * Verifica atividades no action plan
   */
  private checkActionPlanActivities(): void {
    try {
      const actionPlan = JSON.parse(localStorage.getItem('schoolPowerActionPlan') || '[]');
      const quadroActivities = actionPlan.filter((activity: any) => 
        activity.id === 'quadro-interativo' && 
        (activity.approved || activity.isBuilt)
      );

      quadroActivities.forEach((activity: any) => {
        const activityId = activity.id + '_' + (activity.customId || 'default');
        
        if (!this.hasGeneratedContent(activityId)) {
          console.log('🎯 [MONITOR] Atividade do action plan pendente:', activity.title);
          this.triggerContentGeneration(activityId, activity);
        }
      });
    } catch (error) {
      console.warn('⚠️ [MONITOR] Erro ao verificar action plan:', error);
    }
  }

  /**
   * Dispara a geração de conteúdo para uma atividade
   */
  private triggerContentGeneration(activityId: string, data: any): void {
    console.log('🚀 [MONITOR] Disparando geração de conteúdo para:', activityId);
    
    // Disparar múltiplos eventos para garantir que seja capturado
    const events = [
      'quadro-interativo-auto-build',
      'quadro-interativo-build-trigger',
      'quadro-interativo-force-generation'
    ];

    events.forEach((eventName, index) => {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent(eventName, {
          detail: { activityId, data }
        }));
      }, index * 200);
    });

    // Marcar como processado para evitar múltiplas tentativas
    const processedKey = `quadro_interativo_triggered_${activityId}`;
    localStorage.setItem(processedKey, JSON.stringify({
      triggered: true,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Manipula evento de "Construir Todas"
   */
  private handleBuildAllEvent(event: any): void {
    console.log('🏗️ [MONITOR] Evento "Construir Todas" detectado');
    
    setTimeout(() => {
      this.checkPendingActivities();
      this.forceGenerationCheck();
    }, 2000);
  }

  /**
   * Manipula evento de "Construir Todas Finalizado"
   */
  private handleBuildAllCompletedEvent(event: any): void {
    console.log('🎉 [MONITOR] Evento "Construir Todas Finalizado" detectado');
    
    setTimeout(() => {
      this.forceGenerationCheck();
      this.checkConstructedActivities();
      this.checkPendingActivities();
    }, 3000);
  }

  /**
   * Manipula trigger manual
   */
  private handleManualTrigger(event: any): void {
    const { activityId } = event.detail || {};
    console.log('💪 [MONITOR] Trigger manual para:', activityId);
    
    if (activityId) {
      this.forceGeneration(activityId);
    } else {
      this.forceGenerationCheck();
    }
  }

  /**
   * Verifica especificamente atividades já construídas
   */
  private checkConstructedActivities(): void {
    console.log('🔍 [MONITOR] Verificando atividades construídas');
    
    try {
      const keys = Object.keys(localStorage);
      const constructedKeys = keys.filter(key => 
        key.startsWith('constructed_quadro-interativo_') ||
        key.startsWith('constructedActivities')
      );
      
      constructedKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          
          if (key.startsWith('constructedActivities')) {
            // Verificar objetos dentro de constructedActivities
            Object.keys(data).forEach(activityKey => {
              const activityData = data[activityKey];
              if (activityKey === 'quadro-interativo' && activityData.isBuilt) {
                if (!this.hasGeneratedContent(activityKey)) {
                  console.log('🎯 [MONITOR] Atividade construída detectada:', activityKey);
                  this.triggerContentGeneration(activityKey, activityData);
                }
              }
            });
          } else {
            const activityId = this.extractActivityId(key, data);
            if (data.isBuilt && activityId && !this.hasGeneratedContent(activityId)) {
              console.log('🎯 [MONITOR] Atividade construída sem conteúdo:', activityId);
              this.triggerContentGeneration(activityId, data);
            }
          }
        } catch (e) {
          console.warn('⚠️ [MONITOR] Erro ao processar atividade construída:', key, e);
        }
      });
    } catch (error) {
      console.error('❌ [MONITOR] Erro ao verificar atividades construídas:', error);
    }
  }

  /**
   * Força uma verificação completa de geração
   */
  private forceGenerationCheck(): void {
    console.log('🔄 [MONITOR] Verificação forçada de geração');
    
    // Limpar marcadores de processamento antigos (mais de 5 minutos)
    const keys = Object.keys(localStorage);
    const triggeredKeys = keys.filter(key => key.startsWith('quadro_interativo_triggered_'));
    
    triggeredKeys.forEach(key => {
      try {
        const data = JSON.parse(localStorage.getItem(key) || '{}');
        const timestamp = new Date(data.timestamp);
        const now = new Date();
        
        if (now.getTime() - timestamp.getTime() > 5 * 60 * 1000) {
          localStorage.removeItem(key);
          console.log('🧹 [MONITOR] Removido marcador antigo:', key);
        }
      } catch (e) {
        localStorage.removeItem(key);
      }
    });

    // Forçar nova verificação
    setTimeout(() => {
      this.checkPendingActivities();
    }, 1000);
  }

  /**
   * Força a geração de uma atividade específica
   */
  forceGeneration(activityId: string): void {
    console.log('💪 [MONITOR] Força geração para atividade:', activityId);
    
    // Limpar marcador anterior se existir
    const triggeredKey = `quadro_interativo_triggered_${activityId}`;
    localStorage.removeItem(triggeredKey);
    
    // Buscar dados da atividade
    const keys = Object.keys(localStorage);
    const activityKey = keys.find(key => 
      (key.includes('quadro-interativo') || key.includes('auto_activity_data')) && 
      key.includes(activityId)
    );
    
    if (activityKey) {
      try {
        const data = JSON.parse(localStorage.getItem(activityKey) || '{}');
        this.triggerContentGeneration(activityId, data);
      } catch (error) {
        console.error('❌ [MONITOR] Erro ao forçar geração:', error);
      }
    } else {
      console.warn('⚠️ [MONITOR] Dados não encontrados para:', activityId);
    }
  }

  /**
   * Obter estatísticas do monitor
   */
  getStats(): any {
    const keys = Object.keys(localStorage);
    
    return {
      isMonitoring: this.isMonitoring,
      constructedActivities: keys.filter(k => k.startsWith('constructed_quadro-interativo_')).length,
      generatedContents: keys.filter(k => k.startsWith('quadro_interativo_content_')).length,
      triggeredActivities: keys.filter(k => k.startsWith('quadro_interativo_triggered_')).length,
      autoActivityData: keys.filter(k => k.startsWith('auto_activity_data_')).length
    };
  }
}

// Inicializar automaticamente o monitor
const monitor = QuadroInterativoMonitor.getInstance();

// Exportar funções globais para debug
(window as any).quadroInterativoMonitor = {
  start: () => monitor.startMonitoring(),
  stop: () => monitor.stopMonitoring(),
  force: (id: string) => monitor.forceGeneration(id),
  stats: () => monitor.getStats(),
  instance: monitor
};

// Iniciar automaticamente
setTimeout(() => {
  monitor.startMonitoring();
}, 1000);

export default QuadroInterativoMonitor;
