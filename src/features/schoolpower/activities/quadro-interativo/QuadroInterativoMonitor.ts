
/**
 * Sistema de Monitoramento Exclusivo para Quadro Interativo
 * Garante que a atividade seja construída e gerada corretamente
 */

export class QuadroInterativoMonitor {
  private static instance: QuadroInterativoMonitor;
  private monitoringInterval: NodeJS.Timeout | null = null;
  private isMonitoring = false;

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

    console.log('🔍 Iniciando monitoramento do Quadro Interativo');
    this.isMonitoring = true;

    this.monitoringInterval = setInterval(() => {
      this.checkPendingActivities();
    }, 2000);

    // Listener para eventos de construção automática
    window.addEventListener('schoolpower-build-all', this.handleBuildAllEvent.bind(this));
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
    
    window.removeEventListener('schoolpower-build-all', this.handleBuildAllEvent.bind(this));
    console.log('🔍 Monitoramento do Quadro Interativo parado');
  }

  /**
   * Verifica atividades pendentes de construção
   */
  private checkPendingActivities(): void {
    try {
      // Verificar atividades construídas mas não geradas
      const keys = Object.keys(localStorage);
      const quadroKeys = keys.filter(key => 
        key.startsWith('constructed_quadro-interativo_') || 
        key.startsWith('auto_activity_data_') ||
        key.startsWith('quadro_interativo_preview_')
      );

      quadroKeys.forEach(key => {
        try {
          const data = JSON.parse(localStorage.getItem(key) || '{}');
          const activityId = key.split('_').pop();
          
          if (data && activityId && !this.hasGeneratedContent(activityId)) {
            console.log('🎯 Atividade de Quadro Interativo pendente detectada:', activityId);
            this.triggerContentGeneration(activityId, data);
          }
        } catch (e) {
          console.warn('Erro ao processar chave:', key, e);
        }
      });
    } catch (error) {
      console.error('Erro no monitoramento:', error);
    }
  }

  /**
   * Verifica se uma atividade já tem conteúdo gerado
   */
  private hasGeneratedContent(activityId: string): boolean {
    const contentKey = `quadro_interativo_content_${activityId}`;
    return !!localStorage.getItem(contentKey);
  }

  /**
   * Dispara a geração de conteúdo para uma atividade
   */
  private triggerContentGeneration(activityId: string, data: any): void {
    console.log('🚀 Disparando geração de conteúdo para:', activityId);
    
    // Disparar evento customizado
    window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
      detail: { activityId, data }
    }));
    
    // Também disparar trigger específico
    window.dispatchEvent(new CustomEvent('quadro-interativo-build-trigger', {
      detail: { activityId, data }
    }));
  }

  /**
   * Manipula evento de "Construir Todas"
   */
  private handleBuildAllEvent(event: any): void {
    console.log('🏗️ Evento "Construir Todas" detectado, verificando Quadro Interativo');
    
    setTimeout(() => {
      this.checkPendingActivities();
      this.forceGenerationCheck();
    }, 1000);
  }

  /**
   * Força uma verificação completa de geração
   */
  private forceGenerationCheck(): void {
    console.log('🔄 Verificação forçada de geração de Quadro Interativo');
    
    // Verificar todas as atividades de Quadro Interativo no Action Plan
    const actionPlan = JSON.parse(localStorage.getItem('schoolPowerActionPlan') || '[]');
    const quadroActivities = actionPlan.filter((activity: any) => activity.id === 'quadro-interativo');
    
    quadroActivities.forEach((activity: any) => {
      if (activity.approved && !this.hasGeneratedContent(activity.id)) {
        console.log('🎯 Forçando geração para atividade aprovada:', activity.title);
        this.triggerContentGeneration(activity.id, activity);
      }
    });
  }

  /**
   * Força a geração de uma atividade específica
   */
  forceGeneration(activityId: string): void {
    console.log('💪 Forçando geração para atividade:', activityId);
    
    const keys = Object.keys(localStorage);
    const activityKey = keys.find(key => 
      (key.includes('quadro-interativo') || key.includes('auto_activity_data')) && 
      key.includes(activityId)
    );
    
    if (activityKey) {
      const data = JSON.parse(localStorage.getItem(activityKey) || '{}');
      this.triggerContentGeneration(activityId, data);
    }
  }
}

// Inicializar automaticamente o monitor
const monitor = QuadroInterativoMonitor.getInstance();

// Exportar funções globais para debug
(window as any).quadroInterativoMonitor = {
  start: () => monitor.startMonitoring(),
  stop: () => monitor.stopMonitoring(),
  force: (id: string) => monitor.forceGeneration(id),
  instance: monitor
};

export default QuadroInterativoMonitor;
