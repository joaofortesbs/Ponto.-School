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

    // Preparar dados contextualizados exatamente como no modal
    const contextualizedData = {
      ...formData,
      numeroQuestoes: formData.numberOfQuestions || formData['Quantidade de Questões'] || '10',
      disciplina: formData.subject || formData['Disciplina'] || 'Português',
      tema: formData.theme || formData['Tema'] || activity.title || 'Conteúdo Geral',
      anoEscolaridade: formData.schoolYear || formData['Ano de Escolaridade'] || '6º ano',
      nivelDificuldade: formData.difficultyLevel || formData['Nível de Dificuldade'] || 'Médio',
      modeloQuestoes: formData.questionModel || formData['Modelo de Questões'] || 'Múltipla escolha',
      titulo: formData.title || activity.title || 'Lista de Exercícios',
      descricao: formData.description || activity.description || '',
      objetivos: formData.objectives || formData['Objetivos'] || '',
      fontes: formData.sources || formData['Fontes'] || 'Livros didáticos e exercícios educacionais',
      materiais: formData.materials || formData['Materiais'] || '',
      instrucoes: formData.instructions || formData['Instruções'] || '',
      tempoLimite: formData.timeLimit || formData['Tempo Limite'] || '',
      contextoAplicacao: formData.context || formData['Contexto de Aplicação'] || '',
      contextData: {
        titulo: formData.title || activity.title,
        descricao: formData.description || activity.description,
        disciplina: formData.subject || formData['Disciplina'] || 'Português',
        tema: formData.theme || formData['Tema'] || activity.title,
        anoEscolaridade: formData.schoolYear || formData['Ano de Escolaridade'] || '6º ano',
        numeroQuestoes: parseInt(formData.numberOfQuestions || formData['Quantidade de Questões'] || '10'),
        nivelDificuldade: formData.difficultyLevel || formData['Nível de Dificuldade'] || 'Médio',
        modeloQuestoes: formData.questionModel || formData['Modelo de Questões'] || 'Múltipla escolha',
        fontes: formData.sources || formData['Fontes'] || 'Livros didáticos e exercícios educacionais',
        objetivos: formData.objectives || formData['Objetivos'] || '',
        materiais: formData.materials || formData['Materiais'] || '',
        instrucoes: formData.instructions || formData['Instruções'] || '',
        tempoLimite: formData.timeLimit || formData['Tempo Limite'] || '',
        contextoAplicacao: formData.context || formData['Contexto de Aplicação'] || ''
      }
    };

    console.log('🤖 Dados contextualizados para IA:', contextualizedData);

    // Usar exatamente a mesma função de geração que o modal usa
    try {
      // Importar dinamicamente a função de geração de atividades
      const { generateActivityContent } = await import('../api/generateActivity');

      const generatedContent = await generateActivityContent(activity.id, contextualizedData);

      console.log('✅ Conteúdo gerado pela IA:', generatedContent);

      // Validar se as questões foram geradas corretamente
      if (activity.id === 'lista-exercicios') {
        if (!generatedContent.questoes || !Array.isArray(generatedContent.questoes) || generatedContent.questoes.length === 0) {
          throw new Error('Nenhuma questão foi gerada pela IA para a lista de exercícios');
        }
        console.log(`📝 ${generatedContent.questoes.length} questões geradas com sucesso`);
      }

      // Salvar conteúdo gerado no formato correto
      const savedContent = {
        generatedAt: new Date().toISOString(),
        activityId: activity.id,
        activityTitle: activity.title,
        isGenerated: true,
        formData: formData,
        isGeneratedByAI: true,
        ...generatedContent
      };

      localStorage.setItem(`activity_${activity.id}`, JSON.stringify(savedContent));

      // Marcar como construída
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        ...activity,
        isBuilt: true,
        builtAt: new Date().toISOString(),
        generatedContent: generatedContent
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      console.log(`✅ Conteúdo salvo com sucesso para: ${activity.title}`);

      // Notificar que a atividade foi construída
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }

    } catch (error) {
      console.error(`❌ Erro ao gerar conteúdo para ${activity.title}:`, error);
      throw error;
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