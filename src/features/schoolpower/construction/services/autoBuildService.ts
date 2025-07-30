
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

  static getInstance(): AutoBuildService {
    if (!AutoBuildService.instance) {
      AutoBuildService.instance = new AutoBuildService();
    }
    return AutoBuildService.instance;
  }

  async buildActivities(
    activities: any[],
    progressCallback: (progress: AutoBuildProgress) => void,
    errorCallback?: (error: any) => void
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
      
      progressCallback({
        current: i + 1,
        total: buildableActivities.length,
        currentActivity: activity.title,
        status: 'running',
        errors
      });

      try {
        await this.buildSingleActivity(activity);
        completed++;
        console.log(`✅ Atividade ${i + 1}/${buildableActivities.length} construída: ${activity.title}`);
      } catch (error) {
        const errorMsg = `Erro ao construir ${activity.title}: ${error}`;
        errors.push(errorMsg);
        console.error(`❌ ${errorMsg}`);
        if (errorCallback) {
          errorCallback(error);
        }
      }

      // Delay entre atividades
      if (i < buildableActivities.length - 1) {
        await this.delay(500);
      }
    }

    progressCallback({
      current: buildableActivities.length,
      total: buildableActivities.length,
      currentActivity: '',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    this.isRunning = false;
    console.log(`🎉 Construção automática concluída: ${completed}/${buildableActivities.length} atividades`);
  }

  private async buildSingleActivity(activity: any): Promise<void> {
    try {
      console.log(`🔨 Construindo: ${activity.title}`);
      
      // Preparar dados da atividade baseados nos customFields
      const activityData = this.prepareActivityData(activity);
      
      // Gerar conteúdo da atividade usando IA
      await this.generateActivityContent(activityData);
      
      console.log(`✅ Atividade construída com sucesso: ${activity.title}`);
    } catch (error) {
      console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
      throw error;
    }
  }

  private prepareActivityData(activity: any): any {
    const originalData = activity.originalData || activity;
    const customFields = originalData.customFields || {};
    
    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.type || 'atividade',
      subject: customFields['Disciplina'] || '',
      theme: customFields['Tema'] || '',
      schoolYear: customFields['Ano de Escolaridade'] || '',
      numberOfQuestions: customFields['Quantidade de Questões'] || '',
      difficultyLevel: customFields['Nível de Dificuldade'] || '',
      questionModel: customFields['Modelo de Questões'] || '',
      sources: customFields['Fontes'] || '',
      context: customFields['Contexto'] || '',
      objectives: customFields['Objetivos'] || '',
      materials: customFields['Materiais'] || '',
      instructions: customFields['Instruções'] || '',
      evaluation: customFields['Avaliação'] || '',
      timeLimit: customFields['Tempo Limite'] || '',
      customFields
    };
  }

  private async generateActivityContent(activityData: any): Promise<any> {
    try {
      // Importar o serviço de geração dinamicamente
      const { activityGenerationService } = await import('./activityGenerationService');
      
      // Gerar atividade usando o serviço especializado
      const generatedActivity = await activityGenerationService.generateActivity(activityData);
      
      // Salvar atividade gerada
      await activityGenerationService.saveGeneratedActivity(activityData.id, generatedActivity);
      
      return generatedActivity;
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      throw error;
    }
  }

  

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  isCurrentlyRunning(): boolean {
    return this.isRunning;
  }

  stop(): void {
    this.isRunning = false;
  }
}

export const autoBuildService = AutoBuildService.getInstance();
