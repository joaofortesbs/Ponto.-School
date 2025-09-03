import { ConstructionActivity } from '../types';
import { quadroInterativoFieldMapping, prepareQuadroInterativoDataForModal } from '../../activities/quadro-interativo';

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

  private async prepareFormDataExactlyLikeModal(activity: ConstructionActivity): Promise<any> {
    console.log(`🎯 [AUTO-BUILD] Preparando formData para: ${activity.title}`);

    // Sistema exclusivo para Flash Cards
    if (activity.id === 'flash-cards') {
      console.log('🃏 [FLASH CARDS] Sistema exclusivo de auto-build');

      try {
        // Validar dados de entrada para Flash Cards
        if (!activity.title || !activity.description) {
          console.warn('⚠️ [FLASH CARDS] Dados insuficientes');
          throw new Error('Dados insuficientes para Flash Cards');
        }

        // Preparar dados completos para Flash Cards
        const flashCardsFormData = {
          // Campos básicos obrigatórios
          title: activity.title,
          description: activity.description,

          // Campos específicos do Flash Cards
          theme: activity.customFields?.['Tema ou Assunto da aula'] || 
                 activity.customFields?.['Tema'] || 
                 activity.title || 
                 'Tema Principal',

          topicos: activity.customFields?.['Tópicos'] || 
                   activity.customFields?.['Conteúdo'] || 
                   activity.description || 
                   'Tópicos principais do tema',

          numberOfFlashcards: activity.customFields?.['Número de Flash Cards'] || 
                              activity.customFields?.['Quantidade'] || 
                              '10',

          subject: activity.customFields?.['Disciplina / Área de conhecimento'] || 
                   activity.customFields?.['Disciplina'] || 
                   'Educação Geral',

          schoolYear: activity.customFields?.['Ano / Série'] || 
                      activity.customFields?.['Ano'] || 
                      '6º Ano',

          difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 
                           'Intermediário',

          context: activity.customFields?.['Contexto'] || 
                   activity.customFields?.['Contexto educacional'] || 
                   'Contexto educacional geral',

          // Marcar como auto-build
          isFlashCardsAutoBuild: true,
          autoBuildId: activity.id,
          autoBuildTimestamp: new Date().toISOString()
        };

        console.log('✅ [FLASH CARDS] FormData preparado:', flashCardsFormData);

        // Salvar dados para acesso posterior
        const storageKey = `auto_activity_data_${activity.id}`;
        localStorage.setItem(storageKey, JSON.stringify({
          formData: flashCardsFormData,
          activity: activity,
          timestamp: new Date().toISOString(),
          type: 'flash-cards'
        }));

        return flashCardsFormData;
      } catch (error) {
        console.error(`❌ [FLASH CARDS] Erro no sistema exclusivo:`, error);
        throw error;
      }
    }

    // Sistema exclusivo para Quadro Interativo
    if (activity.id === 'quadro-interativo') {
      console.log('🎯 [QUADRO INTERATIVO] Sistema exclusivo de auto-build');

      try {
        // Validar dados de entrada
        if (!activity.title || !activity.description) {
          console.warn('⚠️ [QUADRO INTERATIVO] Dados insuficientes');
          throw new Error('Dados insuficientes para Quadro Interativo');
        }

        // Preparar dados completos para o Quadro Interativo
        const quadroFormData = {
          // Campos básicos obrigatórios
          title: activity.title,
          description: activity.description,

          // Campos específicos do Quadro Interativo
          subject: activity.customFields?.['Disciplina / Área de conhecimento'] || 
                   activity.customFields?.['Disciplina'] || 
                   'Matemática',

          schoolYear: activity.customFields?.['Ano / Série'] || 
                      activity.customFields?.['Ano'] || 
                      '6º Ano',

          theme: activity.customFields?.['Tema ou Assunto da aula'] || 
                 activity.title || 
                 'Tema da Aula',

          objectives: activity.customFields?.['Objetivo de aprendizagem da aula'] || 
                      activity.description || 
                      'Objetivos de aprendizagem',

          difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 
                           'Intermediário',

          quadroInterativoCampoEspecifico: activity.customFields?.['Atividade mostrada'] || 
                                           'Atividade interativa no quadro',

          // Marcar como auto-build
          isQuadroInterativoAutoBuild: true,
          autoBuildId: activity.id,
          autoBuildTimestamp: new Date().toISOString()
        };

        console.log('✅ [QUADRO INTERATIVO] FormData preparado:', quadroFormData);

        // Salvar dados para acesso posterior
        const storageKey = `auto_activity_data_${activity.id}`;
        localStorage.setItem(storageKey, JSON.stringify({
          formData: quadroFormData,
          activity: activity,
          timestamp: new Date().toISOString(),
          type: 'quadro-interativo'
        }));

        return quadroFormData;
      } catch (error) {
        console.error(`❌ [QUADRO INTERATIVO] Erro no sistema exclusivo:`, error);
        throw error;
      }
    }

    // Lógica para outras atividades...
    const formData = {
      title: activity.title || '',
      description: activity.description || '',
      subject: activity.customFields?.['Disciplina'] || 'Português',
      theme: activity.customFields?.['Tema'] || 'Conteúdo Geral',
      schoolYear: activity.customFields?.['Ano de Escolaridade'] || '6º ano',
      numberOfQuestions: activity.customFields?.['Quantidade de Questões'] || '10',
      difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 'Médio',
      questionModel: activity.customFields?.['Modelo de Questões'] || 'Múltipla escolha',

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
                      '',

      // Campo específico para Quadro Interativo - mapeamento completo
      quadroInterativoCampoEspecifico: activity.customFields?.['Atividade mostrada'] ||
                                       activity.customFields?.['atividadeMostrada'] ||
                                       activity.customFields?.['quadroInterativoCampoEspecifico'] ||
                                       activity.customFields?.['Campo Específico do Quadro Interativo'] ||
                                       activity.customFields?.['campoEspecificoQuadroInterativo'] ||
                                       activity.customFields?.['Atividade'] ||
                                       activity.customFields?.['Atividades'] ||
                                       activity.customFields?.['Tipo de Atividade'] ||
                                       activity.customFields?.['Interatividade'] ||
                                       activity.customFields?.['Campo Específico'] ||
                                       'Atividade interativa no quadro'
    };


    console.log('📝 [AUTO-BUILD] FormData preparado:', formData);
    return formData;
  }

  private async buildActivityWithExactModalLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 [AUTO-BUILD] Construindo: ${activity.title}`);

    try {
      // SISTEMA EXCLUSIVO PARA FLASH CARDS
      if (activity.id === 'flash-cards') {
        console.log('🃏 [FLASH CARDS] Sistema exclusivo de construção');
        await this.buildFlashCardsExclusively(activity);
        return;
      }

      // SISTEMA EXCLUSIVO PARA QUADRO INTERATIVO
      if (activity.id === 'quadro-interativo') {
        console.log('🎯 [QUADRO INTERATIVO] Sistema exclusivo de construção');
        await this.buildQuadroInterativoExclusively(activity);
        return;
      }

      // Lógica para outras atividades...
      const formData = await this.prepareFormDataExactlyLikeModal(activity);
      const { generateActivityContent } = await import('../api/generateActivity');
      const activityType = activity.type || activity.id || 'lista-exercicios';

      console.log(`🤖 [AUTO-BUILD] Chamando generateActivityContent: ${activityType}`);
      const result = await generateActivityContent(activityType, formData);

      if (result) {
        const saveKey = `activity_${activity.id}`;
        const savedContent = {
          ...result,
          generatedAt: new Date().toISOString(),
          activityId: activity.id,
          activityType: activityType,
          formData: formData
        };

        localStorage.setItem(saveKey, JSON.stringify(savedContent));

        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: formData,
          generatedContent: result
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ [AUTO-BUILD] Atividade construída: ${activity.title}`);
      } else {
        throw new Error('Falha na geração do conteúdo pela IA');
      }

    } catch (error) {
      console.error(`❌ [AUTO-BUILD] Erro na construção de ${activity.title}:`, error);
      activity.status = 'error';
      activity.progress = 0;
      throw error;
    }
  }

  /**
   * Sistema exclusivo para construção de Flash Cards
   */
  private async buildFlashCardsExclusively(activity: ConstructionActivity): Promise<void> {
    console.log(`🃏 [FLASH CARDS] Iniciando construção exclusiva para: ${activity.title}`);
    
    try {
      // Preparar dados específicos para Flash Cards
      const flashCardsFormData = await this.prepareFormDataExactlyLikeModal(activity);
      
      // Importar o gerador específico de Flash Cards
      const { FlashCardsGenerator } = await import('../../activities/flash-cards/FlashCardsGenerator');
      
      // Criar instância do gerador
      const generator = new FlashCardsGenerator();
      
      console.log('🃏 [FLASH CARDS] Chamando API do Gemini para gerar conteúdo:', flashCardsFormData);
      
      // Gerar conteúdo usando a mesma lógica do modal
      const generatedContent = await generator.generateFlashCardsContent(flashCardsFormData);
      
      if (!generatedContent || !generatedContent.cards || !Array.isArray(generatedContent.cards) || generatedContent.cards.length === 0) {
        throw new Error('API do Gemini não gerou Flash Cards válidos');
      }
      
      // Preparar conteúdo final completo
      const finalFlashCardsContent = {
        title: flashCardsFormData.title,
        description: flashCardsFormData.description || generatedContent.description,
        theme: flashCardsFormData.theme,
        topicos: flashCardsFormData.topicos,
        numberOfFlashcards: generatedContent.cards.length,
        context: flashCardsFormData.context,
        cards: generatedContent.cards.map((card, index) => ({
          id: card.id || index + 1,
          question: card.question,
          answer: card.answer,
          category: card.category || flashCardsFormData.theme || 'Geral'
        })),
        totalCards: generatedContent.cards.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false
      };
      
      console.log('🃏 [FLASH CARDS] Conteúdo final gerado:', finalFlashCardsContent);
      
      // Salvar com as MESMAS chaves do sistema manual
      const activityKey = `activity_${activity.id}`;
      const constructedStorageKey = `constructed_flash-cards_${activity.id}`;
      
      // Salvar dados estruturados
      localStorage.setItem(activityKey, JSON.stringify(finalFlashCardsContent));
      localStorage.setItem(constructedStorageKey, JSON.stringify({
        success: true,
        data: finalFlashCardsContent
      }));
      
      // Atualizar lista de atividades construídas
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        isBuilt: true,
        builtAt: new Date().toISOString(),
        formData: flashCardsFormData,
        generatedContent: finalFlashCardsContent
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      // Atualizar propriedades da atividade
      activity.isBuilt = true;
      activity.builtAt = new Date().toISOString();
      activity.progress = 100;
      activity.status = 'completed';
      
      // Notificar conclusão
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }
      
      // Disparar evento para sincronização
      window.dispatchEvent(new CustomEvent('activity-built', {
        detail: { 
          activityId: activity.id,
          activityType: 'flash-cards',
          content: finalFlashCardsContent
        }
      }));
      
      console.log(`✅ [FLASH CARDS] Construção exclusiva concluída: ${activity.title}`);
      
    } catch (error) {
      console.error(`❌ [FLASH CARDS] Erro na construção exclusiva:`, error);
      
      // Criar fallback em caso de erro
      const fallbackContent = this.createFlashCardsFallback(activity);
      
      // Salvar fallback
      const activityKey = `activity_${activity.id}`;
      localStorage.setItem(activityKey, JSON.stringify(fallbackContent));
      
      // Atualizar propriedades da atividade como erro
      activity.status = 'error';
      activity.progress = 0;
      
      throw error;
    }
  }
  
  /**
   * Criar conteúdo de fallback para Flash Cards
   */
  private createFlashCardsFallback(activity: ConstructionActivity): any {
    const numberOfCards = 5;
    const theme = activity.title || 'Tema Geral';
    
    return {
      title: activity.title,
      description: activity.description,
      theme: theme,
      topicos: 'Conceitos básicos',
      numberOfFlashcards: numberOfCards,
      context: 'Contexto educacional',
      cards: Array.from({ length: numberOfCards }, (_, index) => ({
        id: index + 1,
        question: `Pergunta ${index + 1} sobre ${theme}`,
        answer: `Resposta ${index + 1} relacionada ao conceito de ${theme}`,
        category: theme
      })),
      totalCards: numberOfCards,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };
  }

  /**
   * Sistema exclusivo para construção de Quadro Interativo
   */
  private async buildQuadroInterativoExclusively(activity: ConstructionActivity): Promise<void> {
    console.log('🎯 [QUADRO INTERATIVO] Iniciando construção exclusiva');

    try {
      // ETAPA 1: Preparar dados específicos
      const quadroData = this.prepareQuadroInterativoData(activity);
      console.log('📊 [QUADRO INTERATIVO] Dados preparados:', quadroData);

      // ETAPA 2: Salvar dados de construção (SEM gerar conteúdo ainda)
      const constructedKey = `constructed_quadro-interativo_${activity.id}`;
      const constructedData = {
        isBuilt: true,
        builtAt: new Date().toISOString(),
        activityId: activity.id,
        formData: quadroData,
        status: 'completed',
        type: 'quadro-interativo'
      };
      localStorage.setItem(constructedKey, JSON.stringify(constructedData));

      // ETAPA 3: Atualizar status da atividade
      activity.isBuilt = true;
      activity.builtAt = new Date().toISOString();
      activity.progress = 100;
      activity.status = 'completed';

      // ETAPA 4: Marcar no constructedActivities
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = constructedData;
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      // ETAPA 5: Disparar eventos para que o Preview detecte e gere conteúdo
      setTimeout(() => {
        console.log('🚀 [QUADRO INTERATIVO] Disparando eventos de auto-geração');

        window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
          detail: { 
            activityId: activity.id, 
            data: constructedData
          }
        }));

        window.dispatchEvent(new CustomEvent('quadro-interativo-build-trigger', {
          detail: { 
            activityId: activity.id, 
            data: constructedData
          }
        }));
      }, 500);

      // ETAPA 6: Callback de atividade construída
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }

      console.log('🎉 [QUADRO INTERATIVO] Construção exclusiva concluída!');

    } catch (error) {
      console.error('❌ [QUADRO INTERATIVO] Erro na construção exclusiva:', error);

      activity.status = 'error';
      activity.progress = 0;

      throw error;
    }
  }

  /**
   * Preparar dados específicos para Quadro Interativo
   */
  private prepareQuadroInterativoData(activity: ConstructionActivity): any {
    const customFields = activity.customFields || {};

    return {
      subject: customFields['Disciplina / Área de conhecimento'] || 
               customFields['Disciplina'] || 
               'Matemática',

      schoolYear: customFields['Ano / Série'] || 
                  customFields['Ano'] || 
                  '6º Ano',

      theme: customFields['Tema ou Assunto da aula'] || 
             activity.title || 
             'Tema da Aula',

      objectives: customFields['Objetivo de aprendizagem da aula'] || 
                  activity.description || 
                  'Objetivos de aprendizagem',

      difficultyLevel: customFields['Nível de Dificuldade'] || 
                       'Intermediário',

      quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || 
                                       'Atividade interativa no quadro',

      title: activity.title,
      description: activity.description,
      activityId: activity.id
    };
  }

  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log('🚀 [AUTO-BUILD] Iniciando construção automática');
    console.log(`📋 [AUTO-BUILD] ${activities.length} atividades para processar`);

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
        console.log(`⏭️ [AUTO-BUILD] Pulando atividade já construída: ${activity.title}`);
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
        console.warn(`⚠️ [AUTO-BUILD] Pulando atividade sem dados: ${activity.title || 'Sem título'}`);
        errors.push(`Atividade "${activity.title || 'Sem título'}" não possui dados suficientes`);
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

      console.log(`🔨 [AUTO-BUILD] Construindo (${i + 1}/${activities.length}): ${activity.title}`);

      try {
        await this.buildActivityWithExactModalLogic(activity);

        processedCount++;
        console.log(`✅ [AUTO-BUILD] Atividade ${i + 1}/${activities.length} construída: ${activity.title}`);

        this.updateProgress({
          current: processedCount,
          total: activities.length,
          currentActivity: `Concluída: ${activity.title}`,
          status: 'running',
          errors
        });

        // Delay para não sobrecarregar a API
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`❌ [AUTO-BUILD] Erro ao construir ${activity.title}:`, error);
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

    console.log('🎉 [AUTO-BUILD] Construção automática finalizada');
    console.log(`📊 [AUTO-BUILD] Resultado: ${activities.length - errors.length}/${activities.length} atividades construídas`);

    // TRIGGER EXCLUSIVO PARA QUADRO INTERATIVO APÓS CONSTRUIR TODAS
    setTimeout(() => {
      console.log('🎯 [AUTO-BUILD] Disparando eventos finais');

      // Disparar evento global de construção finalizada
      window.dispatchEvent(new CustomEvent('schoolpower-build-all-completed', {
        detail: { 
          totalActivities: activities.length,
          successCount: activities.length - errors.length,
          errorCount: errors.length
        }
      }));

      // Verificar e forçar geração de Quadro Interativo construídos
      const quadroActivities = activities.filter(a => a.id === 'quadro-interativo' && a.isBuilt);
      quadroActivities.forEach(activity => {
        console.log('🚀 [QUADRO INTERATIVO] Forçando geração de conteúdo:', activity.title);

        setTimeout(() => {
          window.dispatchEvent(new CustomEvent('quadro-interativo-force-generation', {
            detail: { 
              activityId: activity.id,
              activity: activity 
            }
          }));
        }, 1000);
      });
    }, 1500);

    if (errors.length > 0) {
      console.warn('⚠️ [AUTO-BUILD] Alguns erros ocorreram:', errors);
    }
  }
}

export const autoBuildService = AutoBuildService.getInstance();

/**
 * Obter processador de atividade baseado no tipo
 */
function getActivityProcessor(activityId: string): ((activity: any) => any) | null {
  const processors: Record<string, (activity: any) => any> = {
    'sequencia-didatica': (activity) => {
      const { processSequenciaDidaticaData } = require('../../activities/sequencia-didatica');
      return processSequenciaDidaticaData(activity);
    },
    'plano-aula': (activity) => {
      const { processPlanoAulaData } = require('../../activities/plano-aula');
      return processPlanoAulaData(activity);
    },
    'quadro-interativo': (activity) => {
      const { prepareQuadroInterativoDataForModal } = require('../../activities/quadro-interativo');
      return prepareQuadroInterativoDataForModal(activity);
    }
  };

  return processors[activityId] || null;
}