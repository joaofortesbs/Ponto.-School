
export interface AutoBuildProgress {
  current: number;
  total: number;
  currentActivity: string;
  status: 'running' | 'completed' | 'error';
  errors: string[];
}

export class AutoBuildService {
  private static instance: AutoBuildService;
  private isRunning = false;
  private progressCallback?: (progress: AutoBuildProgress) => void;

  static getInstance(): AutoBuildService {
    if (!AutoBuildService.instance) {
      AutoBuildService.instance = new AutoBuildService();
    }
    return AutoBuildService.instance;
  }

  setProgressCallback(callback: (progress: AutoBuildProgress) => void) {
    this.progressCallback = callback;
  }

  async buildAllActivities(
    activities: any[],
    openModalFn: (activity: any) => void,
    closeModalFn: () => void
  ): Promise<void> {
    if (this.isRunning) {
      console.warn('⚠️ Construção automática já está em execução');
      return;
    }

    this.isRunning = true;
    const buildableActivities = activities.filter(activity => 
      activity.status === 'draft' && 
      activity.title && 
      activity.description && 
      activity.progress < 100
    );

    const errors: string[] = [];
    let completed = 0;

    console.log(`🚀 Iniciando construção automática de ${buildableActivities.length} atividades`);

    for (let i = 0; i < buildableActivities.length; i++) {
      const activity = buildableActivities[i];
      
      this.progressCallback?.({
        current: i + 1,
        total: buildableActivities.length,
        currentActivity: activity.title,
        status: 'running',
        errors
      });

      try {
        await this.buildSingleActivityWithRetry(activity, openModalFn, closeModalFn);
        completed++;
        console.log(`✅ Atividade ${i + 1}/${buildableActivities.length} construída: ${activity.title}`);
      } catch (error) {
        const errorMsg = `Erro ao construir ${activity.title}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
      }

      // Delay entre atividades
      if (i < buildableActivities.length - 1) {
        await this.delay(800);
      }
    }

    this.progressCallback?.({
      current: buildableActivities.length,
      total: buildableActivities.length,
      currentActivity: '',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    this.isRunning = false;
    console.log(`🎉 Construção automática concluída: ${completed}/${buildableActivities.length} atividades`);
  }

  private async buildSingleActivityWithRetry(
    activity: any,
    openModalFn: (activity: any) => void,
    closeModalFn: () => void,
    maxRetries = 3
  ): Promise<void> {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.buildSingleActivity(activity, openModalFn, closeModalFn);
        return; // Sucesso, sair do loop
      } catch (error) {
        console.warn(`⚠️ Tentativa ${attempt}/${maxRetries} falhou para ${activity.title}: ${error}`);
        if (attempt === maxRetries) {
          throw error; // Última tentativa falhou
        }
        await this.delay(1000); // Delay antes de tentar novamente
      }
    }
  }

  private async buildSingleActivity(
    activity: any,
    openModalFn: (activity: any) => void,
    closeModalFn: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      console.log(`🔨 Construindo: ${activity.title}`);
      
      // Abrir modal
      openModalFn(activity);
      
      // Aguardar modal abrir e processar
      setTimeout(() => {
        const executeConstruction = (retries = 0) => {
          if (retries > 15) {
            closeModalFn();
            reject(new Error('Timeout: botão não encontrado'));
            return;
          }

          // Tentar múltiplas estratégias para encontrar e clicar no botão
          const strategies = [
            () => this.tryAutoBuildFunction(),
            () => this.tryFindButtonById(),
            () => this.tryFindButtonByText(),
            () => this.tryFindButtonByClass()
          ];

          let success = false;
          for (const strategy of strategies) {
            if (strategy()) {
              success = true;
              break;
            }
          }

          if (success) {
            setTimeout(() => {
              closeModalFn();
              resolve();
            }, 1200);
          } else {
            setTimeout(() => executeConstruction(retries + 1), 400);
          }
        };

        executeConstruction();
      }, 2000); // Delay inicial maior para garantir que o modal carregue
    });
  }

  private tryAutoBuildFunction(): boolean {
    if ((window as any).autoBuildCurrentActivity) {
      console.log('🎯 Usando função de automação registrada');
      (window as any).autoBuildCurrentActivity();
      return true;
    }
    return false;
  }

  private tryFindButtonById(): boolean {
    const button = document.querySelector('#build-activity-button') as HTMLButtonElement;
    if (button && !button.disabled) {
      console.log('🎯 Botão encontrado por ID');
      button.click();
      return true;
    }
    return false;
  }

  private tryFindButtonByText(): boolean {
    const buttons = Array.from(document.querySelectorAll('button'));
    const buildButton = buttons.find(btn => 
      btn.textContent?.includes('Construir Atividade') ||
      btn.textContent?.includes('Construir') ||
      btn.textContent?.includes('Gerar')
    ) as HTMLButtonElement;
    
    if (buildButton && !buildButton.disabled) {
      console.log('🎯 Botão encontrado por texto');
      buildButton.click();
      return true;
    }
    return false;
  }

  private tryFindButtonByClass(): boolean {
    const button = document.querySelector('.construir-atividade') as HTMLButtonElement ||
                  document.querySelector('[data-testid="build-activity-button"]') as HTMLButtonElement;
    
    if (button && !button.disabled) {
      console.log('🎯 Botão encontrado por classe/atributo');
      button.click();
      return true;
    }
    return false;
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  stop() {
    this.isRunning = false;
  }
}

export const autoBuildService = AutoBuildService.getInstance();
