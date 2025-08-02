
import { ConstructionActivity } from '../types';
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

  private prepareActivityFormData(activity: ConstructionActivity): any {
    console.log(`🎯 Preparando dados do formulário para: ${activity.title}`);

    // Usar dados originais da atividade aprovada se disponível
    const originalData = activity.originalData || {};
    
    // Criar formData seguindo exatamente o mesmo padrão do modal individual
    const formData = {
      typeId: activity.id,
      title: activity.title || originalData.title || '',
      description: activity.description || originalData.description || '',
      // Adicionar campos personalizados baseados no tipo de atividade
      disciplina: originalData.disciplina || originalData.subject || 'Matemática',
      nivel: originalData.nivel || originalData.level || 'Ensino Médio',
      duracao: originalData.duracao || originalData.duration || '50 minutos',
      objetivo: originalData.objetivo || originalData.objective || activity.description,
      conteudo: originalData.conteudo || originalData.content || activity.description,
      metodologia: originalData.metodologia || originalData.methodology || 'Prática',
      recursos: originalData.recursos || originalData.resources || 'Quadro, computador',
      avaliacao: originalData.avaliacao || originalData.evaluation || 'Participação e exercícios',
      ...activity.customFields,
      ...originalData
    };

    console.log('📝 FormData preparado:', formData);
    return formData;
  }

  private async generateActivityWithRealLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Usando lógica REAL de geração para: ${activity.title}`);

    try {
      // Preparar dados do formulário usando mesma lógica do modal
      const formData = this.prepareActivityFormData(activity);

      console.log('📝 Dados do formulário para geração:', formData);

      // Chamar a API de geração real (mesma usada no modal)
      const result = await generateActivity(formData);

      if (result.success && result.content) {
        // Salvar no localStorage usando mesma lógica do modal
        const generatedContent = {
          content: result.content,
          generatedAt: new Date().toISOString(),
          formData: formData,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          activityType: activity.type,
          activityId: activity.id
        };

        // Salvar conteúdo gerado
        localStorage.setItem(`generated_content_${activity.id}`, JSON.stringify(generatedContent));

        // Atualizar status de atividades construídas
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData,
          content: result.content
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        // Marcar atividade como construída
        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        // Callback de atividade construída
        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ Atividade construída com sucesso usando lógica REAL: ${activity.title}`);
      } else {
        throw new Error(result.error || 'Erro na geração da atividade');
      }

    } catch (error) {
      console.error(`❌ Erro na geração REAL da atividade ${activity.title}:`, error);
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

      // Pular atividades já construídas
      if (activity.isBuilt || activity.status === 'completed') {
        console.log(`⏭️ Pulando atividade já construída: ${activity.title}`);
        continue;
      }

      this.updateProgress({
        current: i,
        total: activities.length,
        currentActivity: activity.title,
        status: 'running',
        errors
      });

      console.log(`🔨 Construindo com lógica REAL (${i + 1}/${activities.length}): ${activity.title}`);

      try {
        // Usar a lógica REAL de geração (mesma do modal individual)
        await this.generateActivityWithRealLogic(activity);

        console.log(`✅ Atividade ${i + 1}/${activities.length} construída com LÓGICA REAL: ${activity.title}`);

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1500));

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
