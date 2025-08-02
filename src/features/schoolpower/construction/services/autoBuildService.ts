
import { ConstructionActivity } from '../types';

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
      disciplina: originalData.disciplina || originalData.subject || activity.customFields?.disciplina || 'Matemática',
      nivel: originalData.nivel || originalData.level || activity.customFields?.nivel || 'Ensino Médio',
      duracao: originalData.duracao || originalData.duration || activity.customFields?.duracao || '50 minutos',
      objetivo: originalData.objetivo || originalData.objective || activity.customFields?.objetivo || activity.description,
      conteudo: originalData.conteudo || originalData.content || activity.customFields?.conteudo || activity.description,
      metodologia: originalData.metodologia || originalData.methodology || activity.customFields?.metodologia || 'Prática',
      recursos: originalData.recursos || originalData.resources || activity.customFields?.recursos || 'Quadro, computador',
      avaliacao: originalData.avaliacao || originalData.evaluation || activity.customFields?.avaliacao || 'Participação e exercícios',
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

      // Preparar dados de contexto para a IA (mesmo formato usado no modal)
      const contextData = {
        // Dados em português para o prompt
        titulo: formData.title || 'Atividade',
        descricao: formData.description || '',
        disciplina: formData.subject || 'Português',
        tema: formData.theme || 'Conteúdo Geral',
        anoEscolaridade: formData.schoolYear || '6º ano',
        numeroQuestoes: parseInt(formData.numberOfQuestions || '10'),
        nivelDificuldade: formData.difficultyLevel || 'Médio',
        modeloQuestoes: formData.questionModel || 'Múltipla escolha e complete as frases',
        fontes: formData.sources || 'Gramática básica para concursos e exercícios online Brasil Escola',
        objetivos: formData.objectives || '',
        materiais: formData.materials || '',
        instrucoes: formData.instructions || '',
        tempoLimite: formData.timeLimit || '',
        contextoAplicacao: formData.context || '',

        // Dados alternativos em inglês para compatibilidade
        title: formData.title,
        description: formData.description,
        subject: formData.subject,
        theme: formData.theme,
        schoolYear: formData.schoolYear,
        numberOfQuestions: formData.numberOfQuestions,
        difficultyLevel: formData.difficultyLevel,
        questionModel: formData.questionModel,
        sources: formData.sources,
        objectives: formData.objectives,
        materials: formData.materials,
        instructions: formData.instructions,
        timeLimit: formData.timeLimit,
        context: formData.context
      };

      console.log('📊 Context data preparado para IA:', contextData);

      // Usar a mesma função que o modal usa para gerar conteúdo
      const { generateActivityContent } = await import('../api/generateActivity');
      const result = await generateActivityContent(activity.type || 'lista-exercicios', contextData);

      if (result) {
        // Processar resultado da mesma forma que o modal
        const generatedContent = {
          ...result,
          generatedAt: new Date().toISOString(),
          formData: formData,
          isBuilt: true,
          builtAt: new Date().toISOString(),
          activityType: activity.type,
          activityId: activity.id
        };

        // Salvar conteúdo gerado
        localStorage.setItem(`activity_${activity.id}`, JSON.stringify(generatedContent));

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
    console.log('📋 Lista de atividades para construir:', activities.map(a => ({ id: a.id, title: a.title, isBuilt: a.isBuilt, status: a.status })));

    const errors: string[] = [];
    let processedCount = 0;

    this.updateProgress({
      current: 0,
      total: activities.length,
      currentActivity: 'Iniciando...',
      status: 'running',
      errors: []
    });

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      // Pular atividades já construídas
      if (activity.isBuilt || activity.status === 'completed') {
        console.log(`⏭️ Pulando atividade já construída: ${activity.title}`);
        processedCount++;
        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Pulando: ${activity.title}`,
          status: 'running',
          errors
        });
        continue;
      }

      this.updateProgress({
        current: processedCount,
        total: activities.length,
        currentActivity: `Construindo: ${activity.title}`,
        status: 'running',
        errors
      });

      console.log(`🔨 Construindo com lógica REAL (${i + 1}/${activities.length}): ${activity.title}`);

      try {
        // Usar a lógica REAL de geração (mesma do modal individual)
        await this.generateActivityWithRealLogic(activity);

        processedCount++;
        console.log(`✅ Atividade ${i + 1}/${activities.length} construída com LÓGICA REAL: ${activity.title}`);

        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Concluída: ${activity.title}`,
          status: 'running',
          errors
        });

        // Pequeno delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 2000));

      } catch (error) {
        console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
        const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
        errors.push(`Erro em "${activity.title}": ${errorMessage}`);
        
        processedCount++;
        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Erro em: ${activity.title}`,
          status: 'running',
          errors
        });
      }
    }

    // Progresso final
    this.updateProgress({
      current: activities.length,
      total: activities.length,
      currentActivity: 'Processo concluído!',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    console.log('🎉 Processo de construção automática finalizado com lógica REAL');
    console.log(`📊 Resultado: ${activities.length - errors.length}/${activities.length} atividades construídas com sucesso`);

    if (errors.length > 0) {
      console.warn('⚠️ Alguns erros ocorreram:', errors);
      // Não fazer throw para permitir que atividades construídas com sucesso sejam salvas
    }
  }
}

export const autoBuildService = AutoBuildService.getInstance();
