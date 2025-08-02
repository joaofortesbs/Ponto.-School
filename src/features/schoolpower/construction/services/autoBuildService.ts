
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
    console.log(`🎯 Preparando dados EXATAMENTE como o modal para: ${activity.title}`);

    // Criar formData IDENTICO ao que o modal EditActivityModal usa
    const formData = {
      title: activity.title || '',
      description: activity.description || '',
      subject: activity.customFields?.['Disciplina'] || activity.customFields?.['disciplina'] || 'Português',
      theme: activity.customFields?.['Tema'] || activity.customFields?.['tema'] || '',
      schoolYear: activity.customFields?.['Ano de Escolaridade'] || activity.customFields?.['anoEscolaridade'] || '6º ano',
      numberOfQuestions: activity.customFields?.['Quantidade de Questões'] || activity.customFields?.['quantidadeQuestoes'] || '10',
      difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.['nivelDificuldade'] || 'Médio',
      questionModel: activity.customFields?.['Modelo de Questões'] || activity.customFields?.['modeloQuestoes'] || 'Múltipla escolha',
      sources: activity.customFields?.['Fontes'] || activity.customFields?.['fontes'] || '',
      objectives: activity.customFields?.['Objetivos'] || activity.customFields?.['objetivos'] || '',
      materials: activity.customFields?.['Materiais'] || activity.customFields?.['materiais'] || '',
      instructions: activity.customFields?.['Instruções'] || activity.customFields?.['instrucoes'] || '',
      evaluation: activity.customFields?.['Critérios de Correção'] || activity.customFields?.['criteriosAvaliacao'] || '',
      timeLimit: activity.customFields?.['Tempo Limite'] || activity.customFields?.['tempoLimite'] || '',
      context: activity.customFields?.['Contexto de Aplicação'] || activity.customFields?.['contexto'] || '',
      
      // Campos específicos para diferentes tipos de atividade
      textType: activity.customFields?.['Tipo de Texto'] || activity.customFields?.['tipoTexto'] || '',
      textGenre: activity.customFields?.['Gênero Textual'] || activity.customFields?.['generoTextual'] || '',
      textLength: activity.customFields?.['Extensão do Texto'] || activity.customFields?.['extensaoTexto'] || '',
      associatedQuestions: activity.customFields?.['Questões Associadas'] || activity.customFields?.['questoesAssociadas'] || '',
      competencies: activity.customFields?.['Competências'] || activity.customFields?.['competencias'] || '',
      readingStrategies: activity.customFields?.['Estratégias de Leitura'] || activity.customFields?.['estrategiasLeitura'] || '',
      visualResources: activity.customFields?.['Recursos Visuais'] || activity.customFields?.['recursosVisuais'] || '',
      practicalActivities: activity.customFields?.['Atividades Práticas'] || activity.customFields?.['atividadesPraticas'] || '',
      wordsIncluded: activity.customFields?.['Palavras Incluídas'] || activity.customFields?.['palavrasIncluidas'] || '',
      gridFormat: activity.customFields?.['Formato da Grade'] || activity.customFields?.['formatoGrade'] || '',
      providedHints: activity.customFields?.['Dicas Fornecidas'] || activity.customFields?.['dicasFornecidas'] || '',
      vocabularyContext: activity.customFields?.['Contexto do Vocabulário'] || activity.customFields?.['contextoVocabulario'] || '',
      language: activity.customFields?.['Idioma'] || activity.customFields?.['idioma'] || '',
      associatedExercises: activity.customFields?.['Exercícios Associados'] || activity.customFields?.['exerciciosAssociados'] || '',
      knowledgeArea: activity.customFields?.['Área do Conhecimento'] || activity.customFields?.['areaConhecimento'] || '',
      complexityLevel: activity.customFields?.['Nível de Complexidade'] || activity.customFields?.['nivelComplexidade'] || ''
    };

    console.log('📝 FormData preparado IDENTICO ao modal:', formData);
    return formData;
  }

  private async generateActivityWithRealLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Usando EXATAMENTE a mesma lógica do modal para: ${activity.title}`);

    try {
      // Usar o hook de geração exatamente como o modal faz
      const { useGenerateActivity } = await import('../hooks/useGenerateActivity');
      
      // Preparar formData exatamente como o modal faz
      const formData = {
        title: activity.title || '',
        description: activity.description || '',
        subject: activity.customFields?.['Disciplina'] || activity.customFields?.['disciplina'] || 'Português',
        theme: activity.customFields?.['Tema'] || activity.customFields?.['tema'] || '',
        schoolYear: activity.customFields?.['Ano de Escolaridade'] || activity.customFields?.['anoEscolaridade'] || '6º ano',
        numberOfQuestions: activity.customFields?.['Quantidade de Questões'] || activity.customFields?.['quantidadeQuestoes'] || '10',
        difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.['nivelDificuldade'] || 'Médio',
        questionModel: activity.customFields?.['Modelo de Questões'] || activity.customFields?.['modeloQuestoes'] || 'Múltipla escolha',
        sources: activity.customFields?.['Fontes'] || activity.customFields?.['fontes'] || '',
        objectives: activity.customFields?.['Objetivos'] || activity.customFields?.['objetivos'] || '',
        materials: activity.customFields?.['Materiais'] || activity.customFields?.['materiais'] || '',
        instructions: activity.customFields?.['Instruções'] || activity.customFields?.['instrucoes'] || '',
        evaluation: activity.customFields?.['Critérios de Correção'] || activity.customFields?.['criteriosAvaliacao'] || '',
        timeLimit: activity.customFields?.['Tempo Limite'] || activity.customFields?.['tempoLimite'] || '',
        context: activity.customFields?.['Contexto de Aplicação'] || activity.customFields?.['contexto'] || ''
      };

      console.log('📝 FormData preparado IGUAL ao modal:', formData);

      // Usar DIRETAMENTE a função generateActivityContent como o modal faz
      const { generateActivityContent } = await import('../api/generateActivity');
      
      // Preparar contextData EXATAMENTE como o modal faz
      const contextData = {
        // Dados em português para o prompt
        titulo: formData.title || 'Atividade',
        descricao: formData.description || '',
        disciplina: formData.subject || 'Português',
        tema: formData.theme || 'Conteúdo Geral',
        anoEscolaridade: formData.schoolYear || '6º ano',
        numeroQuestoes: parseInt(formData.numberOfQuestions || '10'),
        nivelDificuldade: formData.difficultyLevel || 'Médio',
        modeloQuestoes: formData.questionModel || 'Múltipla escolha',
        fontes: formData.sources || '',
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

      console.log('📊 Context data IGUAL ao modal:', contextData);

      // Chamar a função EXATAMENTE como o modal faz
      const result = await generateActivityContent(activity.type || activity.id || 'lista-exercicios', contextData);

      if (result) {
        console.log('✅ Resultado da IA recebido:', result);

        // Salvar EXATAMENTE como o modal faz
        const saveKey = `activity_${activity.id}`;
        const savedContent = {
          ...result,
          generatedAt: new Date().toISOString(),
          activityId: activity.id,
          activityType: activity.type || activity.id || 'lista-exercicios',
          formData: formData
        };

        localStorage.setItem(saveKey, JSON.stringify(savedContent));
        console.log(`💾 Conteúdo salvo com chave: ${saveKey}`);

        // Atualizar status de atividades construídas
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData,
          generatedContent: result
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

        console.log(`✅ Atividade construída com MESMA LÓGICA DO MODAL: ${activity.title}`);
      } else {
        throw new Error('Falha na geração do conteúdo pela IA');
      }

    } catch (error) {
      console.error(`❌ Erro na geração usando lógica do modal para ${activity.title}:`, error);
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
