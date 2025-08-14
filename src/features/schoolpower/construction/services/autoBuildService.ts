
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

  private prepareFormDataExactlyLikeModal(activity: ConstructionActivity): any {
    console.log(`🎯 Preparando formData EXATAMENTE como EditActivityModal para: ${activity.title}`);

    // Mapear TODOS os campos EXATAMENTE como o modal EditActivityModal faz
    const formData = {
      // Campos básicos obrigatórios
      title: activity.title || '',
      description: activity.description || '',
      
      // Campos padrão com fallbacks EXATOS do modal
      subject: activity.customFields?.['Disciplina'] || 
               activity.customFields?.['disciplina'] || 
               'Português',
      
      theme: activity.customFields?.['Tema'] || 
             activity.customFields?.['tema'] || 
             'Conteúdo Geral',
      
      schoolYear: activity.customFields?.['Ano de Escolaridade'] || 
                  activity.customFields?.['anoEscolaridade'] || 
                  '6º ano',
      
      numberOfQuestions: activity.customFields?.['Quantidade de Questões'] || 
                        activity.customFields?.['quantidadeQuestoes'] || 
                        activity.customFields?.['numeroQuestoes'] || 
                        '10',
      
      difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 
                      activity.customFields?.['nivelDificuldade'] || 
                      'Médio',
      
      questionModel: activity.customFields?.['Modelo de Questões'] || 
                    activity.customFields?.['modeloQuestoes'] || 
                    'Múltipla escolha',

      // Campos opcionais EXATOS do modal
      sources: activity.customFields?.['Fontes'] || 
               activity.customFields?.['fontes'] || 
               '',
      
      objectives: activity.customFields?.['Objetivos'] || 
                  activity.customFields?.['objetivos'] || 
                  '',
      
      materials: activity.customFields?.['Materiais'] || 
                activity.customFields?.['materiais'] || 
                '',
      
      instructions: activity.customFields?.['Instruções'] || 
                   activity.customFields?.['instrucoes'] || 
                   '',
      
      evaluation: activity.customFields?.['Critérios de Correção'] || 
                 activity.customFields?.['criteriosAvaliacao'] || 
                 activity.customFields?.['criteriosCorrecao'] || 
                 '',
      
      timeLimit: activity.customFields?.['Tempo Limite'] || 
                activity.customFields?.['tempoLimite'] || 
                '',
      
      context: activity.customFields?.['Contexto de Aplicação'] || 
              activity.customFields?.['contextoAplicacao'] || 
              activity.customFields?.['contexto'] || 
              '',

      // Campos específicos do Quadro Interativo
      quadroInterativoDisciplina: activity.customFields?.['Disciplina / Área de conhecimento'] || 
                                 activity.customFields?.['disciplina'] || 
                                 '',
      
      quadroInterativoAnoSerie: activity.customFields?.['Ano / Série'] || 
                               activity.customFields?.['anoSerie'] || 
                               '',
      
      quadroInterativoTema: activity.customFields?.['Tema ou Assunto da aula'] || 
                           activity.customFields?.['tema'] || 
                           '',
      
      quadroInterativoObjetivo: activity.customFields?.['Objetivo de aprendizagem da aula'] || 
                               activity.customFields?.['objetivo'] || 
                               '',
      
      quadroInterativoNivelDificuldade: activity.customFields?.['Nível de Dificuldade'] || 
                                       activity.customFields?.['nivelDificuldade'] || 
                                       '',
      
      quadroInterativoAtividadeMostrada: activity.customFields?.['Atividade mostrada'] || 
                                        activity.customFields?.['atividadeMostrada'] || 
                                        '',

      // Campos específicos para diferentes tipos de atividade (COMPLETOS)
      textType: activity.customFields?.['Tipo de Texto'] || 
               activity.customFields?.['tipoTexto'] || 
               '',
      
      textGenre: activity.customFields?.['Gênero Textual'] || 
                activity.customFields?.['generoTextual'] || 
                '',
      
      textLength: activity.customFields?.['Extensão do Texto'] || 
                 activity.customFields?.['extensaoTexto'] || 
                 '',
      
      associatedQuestions: activity.customFields?.['Questões Associadas'] || 
                          activity.customFields?.['questoesAssociadas'] || 
                          '',
      
      competencies: activity.customFields?.['Competências'] || 
                   activity.customFields?.['competencias'] || 
                   '',
      
      readingStrategies: activity.customFields?.['Estratégias de Leitura'] || 
                        activity.customFields?.['estrategiasLeitura'] || 
                        '',
      
      visualResources: activity.customFields?.['Recursos Visuais'] || 
                      activity.customFields?.['recursosVisuais'] || 
                      '',
      
      practicalActivities: activity.customFields?.['Atividades Práticas'] || 
                          activity.customFields?.['atividadesPraticas'] || 
                          '',
      
      wordsIncluded: activity.customFields?.['Palavras Incluídas'] || 
                    activity.customFields?.['palavrasIncluidas'] || 
                    '',
      
      gridFormat: activity.customFields?.['Formato da Grade'] || 
                 activity.customFields?.['formatoGrade'] || 
                 '',
      
      providedHints: activity.customFields?.['Dicas Fornecidas'] || 
                    activity.customFields?.['dicasFornecidas'] || 
                    '',
      
      vocabularyContext: activity.customFields?.['Contexto do Vocabulário'] || 
                        activity.customFields?.['contextoVocabulario'] || 
                        '',
      
      language: activity.customFields?.['Idioma'] || 
               activity.customFields?.['idioma'] || 
               'Português',
      
      associatedExercises: activity.customFields?.['Exercícios Associados'] || 
                          activity.customFields?.['exerciciosAssociados'] || 
                          '',
      
      knowledgeArea: activity.customFields?.['Área do Conhecimento'] || 
                    activity.customFields?.['areaConhecimento'] || 
                    '',
      
      complexityLevel: activity.customFields?.['Nível de Complexidade'] || 
                      activity.customFields?.['nivelComplexidade'] || 
                      ''
    };

    console.log('📝 FormData preparado IDENTICO ao EditActivityModal:', formData);
    return formData;
  }

  private prepareContextDataExactlyLikeHook(formData: any): any {
    console.log('🎯 Preparando contextData EXATAMENTE como useGenerateActivity hook');

    // Preparar contextData EXATAMENTE igual ao hook useGenerateActivity
    const contextData = {
      // Dados em português para o prompt (IDENTICO ao hook)
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

      // Campos específicos adicionais EXATOS do hook
      tipoTexto: formData.textType || '',
      generoTextual: formData.textGenre || '',
      extensaoTexto: formData.textLength || '',
      questoesAssociadas: formData.associatedQuestions || '',
      competencias: formData.competencies || '',
      estrategiasLeitura: formData.readingStrategies || '',
      recursosVisuais: formData.visualResources || '',
      atividadesPraticas: formData.practicalActivities || '',
      palavrasIncluidas: formData.wordsIncluded || '',
      formatoGrade: formData.gridFormat || '',
      dicasFornecidas: formData.providedHints || '',
      contextoVocabulario: formData.vocabularyContext || '',
      idioma: formData.language || 'Português',
      exerciciosAssociados: formData.associatedExercises || '',
      areaConhecimento: formData.knowledgeArea || '',
      nivelComplexidade: formData.complexityLevel || '',

      // Dados alternativos em inglês para compatibilidade (EXATOS do hook)
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
      context: formData.context,
      textType: formData.textType,
      textGenre: formData.textGenre,
      textLength: formData.textLength,
      associatedQuestions: formData.associatedQuestions,
      competencies: formData.competencies,
      readingStrategies: formData.readingStrategies,
      visualResources: formData.visualResources,
      practicalActivities: formData.practicalActivities,
      wordsIncluded: formData.wordsIncluded,
      gridFormat: formData.gridFormat,
      providedHints: formData.providedHints,
      vocabularyContext: formData.vocabularyContext,
      language: formData.language,
      associatedExercises: formData.associatedExercises,
      knowledgeArea: formData.knowledgeArea,
      complexityLevel: formData.complexityLevel
    };

    console.log('📊 ContextData preparado EXATAMENTE como useGenerateActivity hook:', contextData);
    return contextData;
  }

  private async buildActivityWithExactModalLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 Construindo com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);

    try {
      // PASSO 1: Preparar formData EXATAMENTE como o modal faz
      const formData = this.prepareFormDataExactlyLikeModal(activity);

      // PASSO 2: Preparar contextData EXATAMENTE como o hook useGenerateActivity faz
      const contextData = this.prepareContextDataExactlyLikeHook(formData);

      // PASSO 3: Importar e usar EXATAMENTE a mesma função que o modal usa
      const { generateActivityContent } = await import('../api/generateActivity');

      // PASSO 4: Determinar o tipo de atividade EXATAMENTE como o modal faz
      const activityType = activity.type || activity.id || 'lista-exercicios';

      console.log(`🤖 Chamando generateActivityContent com tipo: ${activityType}`);
      console.log('📋 ContextData COMPLETO:', contextData);

      // PASSO 5: Chamar a função EXATAMENTE como o modal EditActivityModal e o hook fazem
      const result = await generateActivityContent(activityType, contextData);

      if (result) {
        console.log('✅ Resultado da IA recebido:', result);

        // PASSO 6: Salvar EXATAMENTE como o modal EditActivityModal faz
        const saveKey = `activity_${activity.id}`;
        const savedContent = {
          ...result,
          generatedAt: new Date().toISOString(),
          activityId: activity.id,
          activityType: activityType,
          formData: formData
        };

        // Salvar no localStorage EXATAMENTE como o modal faz
        localStorage.setItem(saveKey, JSON.stringify(savedContent));
        console.log(`💾 Conteúdo salvo com chave: ${saveKey}`);

        // PASSO 7: Atualizar status EXATAMENTE como o modal faz
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData,
          generatedContent: result
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        // PASSO 8: Marcar atividade como construída EXATAMENTE como o modal faz
        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        // PASSO 9: Callback de atividade construída
        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ Atividade construída com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);
      } else {
        throw new Error('Falha na geração do conteúdo pela IA - resultado vazio');
      }

    } catch (error) {
      console.error(`❌ Erro na construção com lógica do modal para ${activity.title}:`, error);
      
      // Marcar atividade com erro
      activity.status = 'error';
      activity.progress = 0;
      
      throw error;
    }
  }

  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log('🚀 Iniciando construção automática com EXATA LÓGICA do EditActivityModal');
    console.log(`📋 ${activities.length} atividades para processar`);

    const errors: string[] = [];
    let processedCount = 0;

    this.updateProgress({
      current: 0,
      total: activities.length,
      currentActivity: 'Iniciando construção automática...',
      status: 'running',
      errors: []
    });

    for (let i = 0; i < activities.length; i++) {
      const activity = activities[i];

      // Verificar se atividade já foi construída
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

      // Verificar se atividade tem dados mínimos necessários
      if (!activity.title || !activity.description) {
        console.warn(`⚠️ Pulando atividade sem dados suficientes: ${activity.title || 'Sem título'}`);
        errors.push(`Atividade "${activity.title || 'Sem título'}" não possui dados suficientes para construção`);
        processedCount++;
        continue;
      }

      this.updateProgress({
        current: processedCount,
        total: activities.length,
        currentActivity: `Construindo: ${activity.title}`,
        status: 'running',
        errors
      });

      console.log(`🔨 Construindo (${i + 1}/${activities.length}): ${activity.title}`);

      try {
        // Usar a lógica EXATA do modal EditActivityModal
        await this.buildActivityWithExactModalLogic(activity);

        processedCount++;
        console.log(`✅ Atividade ${i + 1}/${activities.length} construída: ${activity.title}`);

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
      currentActivity: 'Construção automática finalizada!',
      status: errors.length > 0 ? 'error' : 'completed',
      errors
    });

    console.log('🎉 Construção automática finalizada');
    console.log(`📊 Resultado: ${activities.length - errors.length}/${activities.length} atividades construídas`);

    if (errors.length > 0) {
      console.warn('⚠️ Alguns erros ocorreram:', errors);
    }
  }
}

export const autoBuildService = AutoBuildService.getInstance();
