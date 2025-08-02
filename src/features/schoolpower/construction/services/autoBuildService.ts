import { ConstructionActivity } from '../types';
import { activityGenerationService } from './activityGenerationService';
import { generateActivity } from '../api/generateActivity';

export interface AutoBuildProgress {
  current: number;
  total: number;
  currentActivity: string;
  status: 'idle' | 'running' | 'completed' | 'error';
  errors: string[];
}

export class AutoBuildService {
  private static instance: AutoBuildService;
  private progressCallback?: (progress: AutoBuildProgress) => void;
  private onActivityBuilt?: (activityId: string) => void;

  private constructor() {}

  static getInstance(): AutoBuildService {
    if (!AutoBuildService.instance) {
      AutoBuildService.instance = new AutoBuildService();
    }
    return AutoBuildService.instance;
  }

  setProgressCallback(callback: (progress: AutoBuildProgress) => void) {
    this.progressCallback = callback;
  }

  setOnActivityBuilt(callback: (activityId: string) => void) {
    this.onActivityBuilt = callback;
  }

  private updateProgress(progress: Partial<AutoBuildProgress>) {
    if (this.progressCallback) {
      this.progressCallback(progress as AutoBuildProgress);
    }
  }

  private async generateActivityWithRealLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Usando lógica real de geração para: ${activity.title}`);

    try {
      // Usar exatamente a mesma lógica do modal individual
      const formData = {
        typeId: activity.id,
        title: activity.title,
        description: activity.description,
        ...activity.customFields
      };

      console.log('📝 Dados do formulário para geração:', formData);

      // Chamar a API de geração real (mesma usada no modal)
      const result = await generateActivity(formData);

      if (result.success && result.content) {
        // Salvar no localStorage (mesma lógica do modal)
        const generatedContent = {
          content: result.content,
          generatedAt: new Date().toISOString(),
          formData: formData,
          isBuilt: true,
          builtAt: new Date().toISOString()
        };

        localStorage.setItem(`generated_content_${activity.id}`, JSON.stringify(generatedContent));

        // Atualizar constructedActivities
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        // Callback de atividade construída
        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ Atividade construída com sucesso usando lógica real: ${activity.title}`);
      } else {
        throw new Error(result.error || 'Erro na geração da atividade');
      }

    } catch (error) {
      console.error(`❌ Erro na geração real da atividade ${activity.title}:`, error);
      throw error;
    }
  }

  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log('🚀 Iniciando construção automática com lógica REAL de', activities.length, 'atividades');

    const errors: string[] = [];

    this.updateProgress({
      current: 0,
      total: activities.length,
      currentActivity: '',
      status: 'running',
      errors: []
    });

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      this.updateProgress({
        current: i,
        total: activities.length,
        currentActivity: activity.title,
        status: 'running',
        errors
      });

      console.log(`🔨 Construindo com lógica REAL: ${activity.title}`);

      try {
        // Usar a lógica REAL de geração (mesma do modal individual)
        await this.generateActivityWithRealLogic(activity);

        console.log(`✅ Atividade ${i + 1}/${activities.length} construída com LÓGICA REAL: ${activity.title}`);

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
        errors.push(`Erro em "${activity.title}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
      }
    }

    // Progresso final
    this.updateProgress({
      current: activities.length,
      total: activities.length,
      currentActivity: 'Concluído',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    console.log('🎉 Processo de construção automática finalizado com lógica REAL');

    if (errors.length > 0) {
      console.warn('⚠️ Alguns erros ocorreram:', errors);
      throw new Error(`Construção concluída com ${errors.length} erro(s)`);
    }
  }
}

export const autoBuildService = AutoBuildService.getInstance();