import { ConstructionActivity } from '../types';
import { activityGenerationService } from './activityGenerationService';

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

  private async simulateModalConstruction(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Simulando construção do modal para: ${activity.title}`);

    // Preparar dados do formulário baseado nos customFields da atividade
    const formData = {
      typeId: activity.id,
      title: activity.title,
      description: activity.description,
      ...activity.customFields
    };

    console.log('📝 Dados do formulário preparados:', formData);

    // Simular o preenchimento dos campos do modal
    await this.fillModalFields(activity.id, formData);

    // Aguardar um pouco para simular o processamento
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Gerar a atividade usando o serviço real
    const generatedActivity = await activityGenerationService.generateActivity(activity.id, formData);

    console.log('✅ Atividade gerada com sucesso:', generatedActivity);

    // Marcar como construída
    activity.isBuilt = true;
    activity.builtAt = new Date().toISOString();

    // Salvar no localStorage para persistir o estado
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    constructedActivities[activity.id] = {
      isBuilt: true,
      builtAt: activity.builtAt,
      title: activity.title,
      generatedContent: generatedActivity
    };
    localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

    // Salvar a atividade gerada no localStorage específico para visualização
    const activityKey = `schoolpower_activity_${activity.id}`;
    localStorage.setItem(activityKey, JSON.stringify(generatedActivity));

    console.log(`💾 Atividade ${activity.id} salva com sucesso`);

    // Notificar que a atividade foi construída
    if (this.onActivityBuilt) {
      this.onActivityBuilt(activity.id);
    }
  }

  private async fillModalFields(activityId: string, formData: any): Promise<void> {
    console.log(`📋 Preenchendo campos do modal para ${activityId}:`, formData);

    // Simular o preenchimento dos campos específicos baseado no tipo de atividade
    const fieldMappings = {
      'lista-exercicios': [
        'Quantidade de Questões',
        'Tema',
        'Disciplina',
        'Ano de Escolaridade',
        'Nível de Dificuldade',
        'Modelo de Questões',
        'Fontes'
      ],
      'prova': [
        'Quantidade de Questões',
        'Tema',
        'Disciplina',
        'Ano de Escolaridade',
        'Nível de Dificuldade',
        'Tempo de Duração'
      ],
      'jogos-educativos': [
        'Tema',
        'Disciplina',
        'Ano de Escolaridade',
        'Tipo de Jogo',
        'Nível de Dificuldade'
      ]
    };

    const fields = fieldMappings[activityId] || [];
    console.log(`🔧 Campos identificados para ${activityId}:`, fields);

    // Simular preenchimento de cada campo
    for (const field of fields) {
      if (formData[field]) {
        console.log(`✏️ Preenchendo campo "${field}" com valor "${formData[field]}"`);
      }
    }
  }

  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log('🚀 Iniciando construção automática de', activities.length, 'atividades');

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

      console.log(`🔨 Construindo: ${activity.title}`);

      try {
        // Usar a simulação de construção do modal
        await this.simulateModalConstruction(activity);

        console.log(`✅ Atividade construída com sucesso: ${activity.title}`);
        console.log(`✅ Atividade ${i + 1}/${activities.length} construída: ${activity.title}`);

      } catch (error) {
        console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
        errors.push(`Erro ao construir ${activity.title}: ${error.message}`);
      }

      // Atualizar progresso para a próxima atividade
      this.updateProgress({
        current: i + 1,
        total: activities.length,
        currentActivity: i + 1 < activities.length ? activities[i + 1].title : '',
        status: 'running',
        errors
      });

      // Pequena pausa entre as construções para simular processamento real
      await new Promise(resolve => setTimeout(resolve, 800));
    }

    this.updateProgress({
      current: activities.length,
      total: activities.length,
      currentActivity: '',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    if (errors.length === 0) {
      console.log(`🎉 Construção automática concluída: ${activities.length}/${activities.length} atividades`);
    } else {
      console.warn(`⚠️ Construção concluída com erros: ${activities.length - errors.length}/${activities.length} atividades`);
    }
  }
}

// Exportar a instância para uso direto
export const autoBuildService = AutoBuildService.getInstance();