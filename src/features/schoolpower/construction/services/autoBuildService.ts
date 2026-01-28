import { ConstructionActivity } from '../types';
import { quadroInterativoFieldMapping, prepareQuadroInterativoDataForModal } from '../../activities/quadro-interativo';
import { activitiesApi } from '../../../../services/activitiesApiService';
import { profileService } from '../../../../services/profileService';
import { buildActivityFromFormData } from './buildActivityHelper';
import { ModalBridge } from '../bridge/ModalBridge';
import { 
  emitBuildActivityRequest, 
  waitForBuildResult,
  emitBuildProgress 
} from '../events/constructionEventBus';
import { useActivityDebugStore, logActivityDebug } from '../stores/activityDebugStore';
import { BuildQueueController, type QueueProgress } from '../queue/BuildQueueController';
import { normalizeFieldKeys, getFieldByAnyName } from '../utils/activity-fields-sync';

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

  /**
   * Salva automaticamente a atividade no banco de dados quando ela fica concluída
   */
  private async saveActivityToDatabase(activity: ConstructionActivity): Promise<void> {
    console.log('💾 [AUTO-SAVE] ==========================================');
    console.log('💾 [AUTO-SAVE] INICIANDO SALVAMENTO AUTOMÁTICO');
    console.log('💾 [AUTO-SAVE] Atividade:', activity.title);
    console.log('💾 [AUTO-SAVE] Status:', activity.status);
    console.log('💾 [AUTO-SAVE] Progress:', activity.progress);
    console.log('💾 [AUTO-SAVE] ==========================================');

    try {
      // 1. Obter o perfil do usuário atual
      console.log('🔍 [AUTO-SAVE] Tentando obter perfil do usuário...');
      const profile = await profileService.getCurrentUserProfile();
      console.log('📋 [AUTO-SAVE] Perfil retornado:', profile);

      if (!profile || !profile.id) {
        console.error('❌ [AUTO-SAVE] PROBLEMA: Usuário não encontrado ou não autenticado');
        console.error('❌ [AUTO-SAVE] Profile:', profile);

        // Salvar erro para debug
        localStorage.setItem(`auto_save_error_${activity.id}`, JSON.stringify({
          error: 'Usuário não autenticado ou perfil não encontrado',
          errorAt: new Date().toISOString(),
          profile: profile,
          activity: {
            id: activity.id,
            title: activity.title
          }
        }));
        return;
      }

      console.log('✅ [AUTO-SAVE] Usuário identificado:', profile.id);
      console.log('✅ [AUTO-SAVE] Email do usuário:', profile.email);

      // 2. Gerar código único REAL para a instância (não reusar template ID)
      console.log('🔑 [AUTO-SAVE] Gerando código único...');
      const codigoUnico = activitiesApi.generateUniqueCode();
      console.log('✅ [AUTO-SAVE] Código único gerado:', codigoUnico);
      console.log('🏷️  [AUTO-SAVE] Tipo da atividade (template ID):', activity.id);

      // 3. Preparar dados para salvamento usando syncActivity
      const activityData = {
        // Dados básicos da atividade
        id: activity.id,
        title: activity.title,
        description: activity.description,
        type: activity.id, // Template ID permanece no tipo
        progress: 100, // Sempre 100% quando salva automaticamente (atividade concluída)
        status: 'completed', // Sempre completed quando salva automaticamente
        isBuilt: activity.isBuilt,
        builtAt: activity.builtAt,

        // Campos customizados da construção
        customFields: activity.customFields,
        originalData: activity.originalData,

        // Dados do localStorage se existirem
        generatedContent: this.getGeneratedContentFromStorage(activity.id),
        constructedData: this.getConstructedDataFromStorage(activity.id),

        // Metadados do salvamento automático
        autoSaved: true,
        autoSavedAt: new Date().toISOString(),
        autoSaveSource: 'construction-interface'
      };

      console.log('📋 [AUTO-SAVE] Dados preparados para sincronização:', {
        user_id: profile.id, // Usar profile.id que é o UUID da tabela perfis
        codigo_unico: codigoUnico,
        tipo: activity.id, // Template ID
        titulo: activity.title,
        hasContent: !!activityData
      });

      // 4. Preparar dados para criação da atividade no formato correto da API
      const apiData = {
        user_id: profile.id, // Usar profile.id que é o UUID da tabela perfis
        codigo_unico: codigoUnico,
        tipo: activity.id, // Template ID 
        titulo: activity.title,
        descricao: activity.description,
        conteudo: activityData
      };

      // 5. Criar nova instância da atividade no banco
      const response = await activitiesApi.createActivity(apiData);

      if (response.success) {
        console.log('🎉 [AUTO-SAVE] ==========================================');
        console.log('🎉 [AUTO-SAVE] SUCESSO! ATIVIDADE SALVA NO BANCO!');
        console.log('🎉 [AUTO-SAVE] ID do banco:', response.data?.id);
        console.log('🎉 [AUTO-SAVE] Código único:', response.data?.codigo_unico);
        console.log('🎉 [AUTO-SAVE] Tipo:', response.data?.tipo);
        console.log('🎉 [AUTO-SAVE] Título:', response.data?.titulo);
        console.log('🎉 [AUTO-SAVE] ==========================================');

        // 5. Marcar que foi salva automaticamente
        localStorage.setItem(`auto_saved_${activity.id}`, JSON.stringify({
          saved: true,
          savedAt: new Date().toISOString(),
          codigoUnico: codigoUnico,
          databaseId: response.data?.id
        }));

        // 6. Disparar evento de salvamento automático
        window.dispatchEvent(new CustomEvent('activity-auto-saved', {
          detail: {
            activityId: activity.id,
            codigoUnico: codigoUnico,
            databaseId: response.data?.id,
            savedAt: new Date().toISOString()
          }
        }));

      } else {
        console.error('💥 [AUTO-SAVE] ==========================================');
        console.error('💥 [AUTO-SAVE] FALHA NO SALVAMENTO!');
        console.error('💥 [AUTO-SAVE] Erro:', response.error);
        console.error('💥 [AUTO-SAVE] Response completo:', response);
        console.error('💥 [AUTO-SAVE] ==========================================');

        // Marcar tentativa de salvamento falhada para retry posterior
        localStorage.setItem(`auto_save_failed_${activity.id}`, JSON.stringify({
          failed: true,
          failedAt: new Date().toISOString(),
          error: response.error,
          codigo_unico: codigoUnico,
          activityData: activityData
        }));
      }

    } catch (error) {
      console.error('❌ [AUTO-SAVE] Erro inesperado no salvamento automático:', error);

      // Salvar erro para debug
      localStorage.setItem(`auto_save_error_${activity.id}`, JSON.stringify({
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        errorAt: new Date().toISOString(),
        activity: {
          id: activity.id,
          title: activity.title,
          status: 'completed'
        }
      }));
    }
  }

  /**
   * Recupera conteúdo gerado do localStorage
   */
  private getGeneratedContentFromStorage(activityId: string): any {
    try {
      const storageKey = `activity_${activityId}`;
      const content = localStorage.getItem(storageKey);
      return content ? JSON.parse(content) : null;
    } catch (error) {
      console.warn('⚠️ [AUTO-SAVE] Erro ao recuperar conteúdo gerado:', error);
      return null;
    }
  }

  /**
   * Recupera dados construídos do localStorage
   * Busca em múltiplas chaves para garantir compatibilidade
   */
  private getConstructedDataFromStorage(activityId: string, activityType?: string): any {
    try {
      // Primeiro, tentar chave simples
      const storageKey = `constructed_${activityId}`;
      const content = localStorage.getItem(storageKey);
      if (content) return JSON.parse(content);

      // Tentar chaves com tipo de atividade (padrão novo)
      const activityTypes = activityType 
        ? [activityType]
        : ['quiz-interativo', 'flash-cards', 'plano-aula', 'sequencia-didatica', 
           'quadro-interativo', 'lista-exercicios', 'mapa-mental', 'tese-redacao'];
      
      for (const type of activityTypes) {
        const typeKey = `constructed_${type}_${activityId}`;
        const typeContent = localStorage.getItem(typeKey);
        if (typeContent) {
          console.log(`✅ [STORAGE] Encontrado em ${typeKey}`);
          return JSON.parse(typeContent);
        }
      }

      // Tentar chaves alternativas legacy
      const alternativeKeys = [
        `constructed_${activityId}_${activityId}`,
        `schoolpower_${activityId}_content`,
        `generated_content_${activityId}`,
        `activity_${activityId}`
      ];

      for (const key of alternativeKeys) {
        const altContent = localStorage.getItem(key);
        if (altContent) {
          console.log(`✅ [STORAGE] Encontrado em fallback: ${key}`);
          return JSON.parse(altContent);
        }
      }

      return null;
    } catch (error) {
      console.warn('⚠️ [AUTO-SAVE] Erro ao recuperar dados construídos:', error);
      return null;
    }
  }

  private updateProgress(progress: Partial<AutoBuildProgress>) {
    if (this.progressCallback) {
      this.progressCallback(progress as AutoBuildProgress);
    }
  }

  /**
   * Salva atividade com campos PRÉ-GERADOS diretamente no localStorage
   * Usado quando gerar_conteudo_atividades já gerou os campos via IA
   * Evita regeneração duplicada de conteúdo
   */
  private async savePreGeneratedActivityToStorage(
    activity: ConstructionActivity, 
    preGeneratedFields: Record<string, any>
  ): Promise<boolean> {
    try {
      const activityType = activity.type || activity.id || 'atividade';
      const timestamp = new Date().toISOString();
      
      console.log(`💾 [PRE-GENERATED] Salvando ${activity.title} com campos pré-gerados...`);
      console.log(`💾 [PRE-GENERATED] Tipo: ${activityType}`);
      console.log(`💾 [PRE-GENERATED] Campos:`, Object.keys(preGeneratedFields));
      
      // Criar estrutura de conteúdo baseada nos campos pré-gerados
      const generatedContent = {
        title: activity.title,
        type: activityType,
        description: activity.description,
        formData: preGeneratedFields,
        isPreGenerated: true,
        isGeneratedByAI: true,
        generatedAt: timestamp,
        source: 'gerar_conteudo_atividades'
      };
      
      // 1. Salvar em constructed_{type}_{id} E constructed_{id} (compatibilidade dupla)
      const constructedData = {
        success: true,
        data: generatedContent,
        formData: preGeneratedFields,
        timestamp,
        isPreGenerated: true
      };
      
      // Chave com tipo (novo padrão)
      const constructedKeyWithType = `constructed_${activityType}_${activity.id}`;
      localStorage.setItem(constructedKeyWithType, JSON.stringify(constructedData));
      console.log(`✅ [PRE-GENERATED] Salvo em ${constructedKeyWithType}`);
      
      // Chave simples (compatibilidade legacy)
      const constructedKeySimple = `constructed_${activity.id}`;
      localStorage.setItem(constructedKeySimple, JSON.stringify(constructedData));
      console.log(`✅ [PRE-GENERATED] Salvo em ${constructedKeySimple}`);
      
      // 2. Salvar em activity_{id} - APENAS METADADOS LEVES para evitar QuotaExceededError
      const isHeavyActivity = ['lista-exercicios', 'quiz-interativo', 'flash-cards'].includes(activityType);
      const activityMetadata = {
        title: activity.title,
        type: activityType,
        isPreGenerated: true,
        generatedAt: timestamp,
        ...(isHeavyActivity ? {
          questionsCount: preGeneratedFields?.questoes?.length || preGeneratedFields?.questions?.length || preGeneratedFields?.cards?.length || 0
        } : {})
      };
      localStorage.setItem(`activity_${activity.id}`, JSON.stringify(activityMetadata));
      console.log(`✅ [PRE-GENERATED] Salvo em activity_${activity.id} (metadados leves)`);
      
      // 3. Salvar em generated_content_{id} - APENAS para atividades NÃO pesadas
      // Para lista-exercicios, quiz-interativo, flash-cards: dados ficam APENAS em constructed_
      if (!isHeavyActivity) {
        localStorage.setItem(`generated_content_${activity.id}`, JSON.stringify(preGeneratedFields));
        console.log(`✅ [PRE-GENERATED] Salvo em generated_content_${activity.id}`);
      } else {
        console.log(`⚠️ [PRE-GENERATED] Pulando generated_content_ para ${activityType} (evitar quota)`);
      }
      
      // 4. Atualizar constructedActivities GLOBAL
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activity.id] = {
        isBuilt: true,
        builtAt: timestamp,
        formData: preGeneratedFields,
        generatedContent,
        isPreGenerated: true
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      console.log(`✅ [PRE-GENERATED] Atualizado constructedActivities global`);
      
      // 5. Atualizar status da atividade
      activity.isBuilt = true;
      activity.builtAt = timestamp;
      activity.progress = 100;
      activity.status = 'completed';
      
      // 6. Tentar salvar no banco de dados
      try {
        await this.saveActivityToDatabase(activity);
      } catch (saveError) {
        console.warn('⚠️ [PRE-GENERATED] Erro ao salvar no banco (não crítico):', saveError);
      }
      
      // 7. Callback de atividade construída
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }
      
      console.log(`🎉 [PRE-GENERATED] ${activity.title} salva com sucesso!`);
      return true;
      
    } catch (error) {
      console.error('❌ [PRE-GENERATED] Erro ao salvar atividade:', error);
      return false;
    }
  }

  private async prepareFormDataExactlyLikeModal(activity: ConstructionActivity): Promise<any> {
    console.log(`🎯 [AUTO-BUILD] Preparando formData para: ${activity.title}`);

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

      // Campos principais com fallbacks
      subject: activity.customFields?.['Disciplina'] ||
               activity.customFields?.['disciplina'] ||
               'Português',

      theme: activity.customFields?.['Tema'] ||
             activity.customFields?.['tema'] ||
             activity.customFields?.['Tema dos Flash Cards'] ||
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
              activity.customFields?.['Contexto de Uso'] ||
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
                                       'Atividade interativa no quadro',

      // CAMPOS ESPECÍFICOS PARA FLASH CARDS - MAPEAMENTO COMPLETO
      topicos: activity.customFields?.['Tópicos Principais'] ||
               activity.customFields?.['Tópicos'] ||
               activity.customFields?.['topicos'] ||
               activity.customFields?.['tópicos'] ||
               activity.description || // Usar descrição como fallback
               '',

      numberOfFlashcards: activity.customFields?.['Número de Flash Cards'] ||
                         activity.customFields?.['numeroFlashcards'] ||
                         activity.customFields?.['Quantidade de Flash Cards'] ||
                         activity.customFields?.['quantidadeFlashcards'] ||
                         '10'
    };


    console.log('📝 [AUTO-BUILD] FormData preparado:', formData);
    return formData;
  }

  


  private async buildActivityWithExactModalLogic(activity: ConstructionActivity): Promise<void> {
    console.log(`🎯 [AUTO-BUILD] Construindo: ${activity.title}`);

    // ═══════════════════════════════════════════════════════════════════════════
    // NORMALIZAÇÃO: Unificar nomenclatura de campos antes de processar
    // ═══════════════════════════════════════════════════════════════════════════
    const rawFields = activity.customFields || {};
    const normalizedFields = normalizeFieldKeys(rawFields);
    
    // Atualizar activity com campos normalizados para uso consistente
    activity.customFields = { ...rawFields, ...normalizedFields };

    // ═══════════════════════════════════════════════════════════════════════════
    // OTIMIZAÇÃO: Verificar se campos já foram pré-gerados por gerar_conteudo_atividades
    // Se sim, usar diretamente sem regenerar (evita duplicação de geração)
    // ═══════════════════════════════════════════════════════════════════════════
    const preGeneratedFields = normalizedFields;
    const preGeneratedFieldsCount = Object.keys(preGeneratedFields).filter(k => 
      preGeneratedFields[k] !== undefined && 
      preGeneratedFields[k] !== '' && 
      preGeneratedFields[k] !== null
    ).length;
    
    const hasPreGeneratedContent = preGeneratedFieldsCount >= 3; // Mínimo 3 campos preenchidos indica geração prévia
    
    console.log(`📊 [AUTO-BUILD] Campos pré-gerados detectados: ${preGeneratedFieldsCount}`);
    console.log(`📊 [AUTO-BUILD] Campos:`, Object.keys(preGeneratedFields));
    
    if (hasPreGeneratedContent) {
      console.log(`✅ [AUTO-BUILD] Usando campos PRÉ-GERADOS (sem regeneração)!`);
      
      // Salvar diretamente no localStorage usando os campos já gerados
      const activityType = activity.type || activity.id || 'atividade';
      const savedSuccessfully = await this.savePreGeneratedActivityToStorage(activity, preGeneratedFields);
      
      if (savedSuccessfully) {
        console.log(`🎉 [AUTO-BUILD] ${activity.title} salva com campos pré-gerados!`);
        return;
      }
      
      // Se falhar, continuar com o fluxo normal
      console.log(`⚠️ [AUTO-BUILD] Fallback: executar geração normal...`);
    }

    // SISTEMA EXCLUSIVO PARA QUADRO INTERATIVO
    if (activity.id === 'quadro-interativo') {
      console.log('🎯 [QUADRO INTERATIVO] Sistema exclusivo de construção');
      await this.buildQuadroInterativoExclusively(activity);
      return;
    }

    // Para Quiz Interativo, usar gerador específico com tratamento robusto
    if (activity.id === 'quiz-interativo') {
      console.log('🎮 [QUIZ INTERATIVO] Sistema exclusivo de auto-build');

      try {
        const { QuizInterativoGenerator } = await import('@/features/schoolpower/activities/quiz-interativo');
        const generator = new QuizInterativoGenerator();

        // Preparar dados do quiz com fallback robusto
        const quizData = {
          subject: activity.customFields?.['Disciplina'] || 
                  activity.customFields?.['subject'] || 
                  'Geral',
          schoolYear: activity.customFields?.['Ano de Escolaridade'] || 
                     activity.customFields?.['schoolYear'] || 
                     activity.customFields?.['anoEscolaridade'] ||
                     'Ensino Médio',
          theme: activity.customFields?.['Tema'] || 
                activity.customFields?.['theme'] || 
                activity.title || 
                'Tema Geral',
          objectives: activity.customFields?.['Objetivos'] || 
                     activity.customFields?.['objectives'] || 
                     activity.description ||
                     'Avaliação de conhecimentos',
          difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 
                          activity.customFields?.['difficultyLevel'] || 
                          'Médio',
          format: activity.customFields?.['Formato'] || 
                 activity.customFields?.['format'] || 
                 'multipla-escolha',
          numberOfQuestions: activity.customFields?.['Número de Questões'] || 
                            activity.customFields?.['numberOfQuestions'] || 
                            activity.customFields?.['quantidadeQuestoes'] ||
                            '5',
          timePerQuestion: activity.customFields?.['Tempo por Questão'] || 
                          activity.customFields?.['timePerQuestion'] || 
                          '60',
          instructions: activity.customFields?.['Instruções'] || 
                       activity.customFields?.['instructions'] || 
                       'Responda as questões com atenção',
          evaluation: activity.customFields?.['Avaliação'] || 
                     activity.customFields?.['evaluation'] || 
                     'Avaliação automática'
        };

        console.log('🎮 [QUIZ INTERATIVO] Dados preparados:', quizData);

        const result = await generator.generateQuizContent(quizData);

        // Validar e sanitizar questões
        const sanitizedQuestions = this.sanitizeQuizQuestions(result?.questions || [], activity.title);

        if (sanitizedQuestions.length > 0) {
          console.log(`✅ [QUIZ INTERATIVO] ${sanitizedQuestions.length} questões geradas com sucesso`);

          const finalResult = {
            ...result,
            questions: sanitizedQuestions,
            totalQuestions: sanitizedQuestions.length
          };

          // Salvar dados gerados com múltiplas chaves para compatibilidade
          const storageKey = `constructed_quiz-interativo_${activity.id}`;
          const constructedData = {
            success: true,
            data: finalResult,
            timestamp: new Date().toISOString()
          };

          localStorage.setItem(storageKey, JSON.stringify(constructedData));
          localStorage.setItem(`activity_${activity.id}`, JSON.stringify(finalResult));

          // Salvar no constructedActivities GLOBAL
          const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
          constructedActivities[activity.id] = {
            isBuilt: true,
            builtAt: new Date().toISOString(),
            formData: quizData,
            generatedContent: finalResult
          };
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
          console.log('✅ [QUIZ INTERATIVO] Salvo em constructedActivities global');

          activity.isBuilt = true;
          activity.builtAt = new Date().toISOString();
          activity.progress = 100;
          activity.status = 'completed';

          // Salvamento automático no banco
          try {
            await this.saveActivityToDatabase(activity);
          } catch (saveError) {
            console.error('💥 [QUIZ INTERATIVO] Erro no salvamento automático:', saveError);
          }

          if (this.onActivityBuilt) {
            this.onActivityBuilt(activity.id);
          }

          console.log(`✅ [AUTO-BUILD] Quiz Interativo construído: ${activity.title}`);
          return;
        } else {
          console.error('❌ [QUIZ INTERATIVO] Resultado inválido:', result);
          throw new Error('Nenhuma questão foi gerada pela IA');
        }
      } catch (error) {
        console.error('❌ [QUIZ INTERATIVO] Erro no sistema exclusivo:', error);

        // Fallback manual em caso de erro total
        console.log('🛡️ [QUIZ INTERATIVO] Ativando fallback manual');
        const fallbackQuestions = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          question: `Questão ${i + 1} sobre ${activity.title}`,
          type: 'multipla-escolha' as const,
          options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
          correctAnswer: 'Opção A',
          explanation: `Esta é a questão ${i + 1} do quiz sobre ${activity.title}`
        }));

        const fallbackResult = {
          title: activity.title || 'Quiz Interativo',
          description: activity.description || `Quiz sobre ${activity.title}`,
          questions: fallbackQuestions,
          totalQuestions: fallbackQuestions.length,
          timePerQuestion: 60,
          isFallback: true,
          isGeneratedByAI: false,
          generatedAt: new Date().toISOString()
        };

        localStorage.setItem(`constructed_quiz-interativo_${activity.id}`, JSON.stringify({
          success: true,
          data: fallbackResult,
          isFallback: true,
          timestamp: new Date().toISOString()
        }));

        localStorage.setItem(`activity_${activity.id}`, JSON.stringify(fallbackResult));

        // Salvar no constructedActivities GLOBAL
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: { theme: activity.title },
          generatedContent: fallbackResult,
          isFallback: true
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
        console.log('✅ [QUIZ INTERATIVO FALLBACK] Salvo em constructedActivities global');

        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        // Salvamento automático no banco
        try {
          await this.saveActivityToDatabase(activity);
        } catch (saveError) {
          console.error('💥 [QUIZ INTERATIVO FALLBACK] Erro no salvamento automático:', saveError);
        }

        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ [AUTO-BUILD] Quiz Interativo construído com fallback: ${activity.title}`);
        return;
      }
    }

    // Para Flash Cards, usar gerador específico com tratamento robusto
    if (activity.id === 'flash-cards') {
      console.log('🃏 [FLASH CARDS] Sistema exclusivo de auto-build');

      try {
        const { FlashCardsGenerator } = await import('@/features/schoolpower/activities/flash-cards');
        const generator = new FlashCardsGenerator();

        // Extrair tópicos com fallback robusto
        const topicos = activity.customFields?.['Tópicos'] || 
                       activity.customFields?.['topicos'] || 
                       activity.description || 
                       activity.title || 
                       'Tópicos gerais';

        const flashCardsData = {
          title: activity.title || 'Flash Cards',
          theme: activity.customFields?.['Tema'] || activity.customFields?.['theme'] || activity.title || 'Tema Geral',
          subject: activity.customFields?.['Disciplina'] || activity.customFields?.['subject'] || 'Geral',
          schoolYear: activity.customFields?.['Ano de Escolaridade'] || activity.customFields?.['schoolYear'] || 'Ensino Médio',
          topicos: topicos,
          numberOfFlashcards: activity.customFields?.['Número de flashcards'] || 
                             activity.customFields?.['numberOfFlashcards'] || '10',
          contextoUso: activity.customFields?.['Contexto de Uso'] || activity.customFields?.['Contexto'] || activity.customFields?.['contextoUso'] || activity.customFields?.['context'] || 'Estudos e revisão',
          difficultyLevel: activity.customFields?.['Nível de Dificuldade'] || 
                          activity.customFields?.['difficultyLevel'] || 'Médio',
          objectives: activity.customFields?.['Objetivos'] || 
                     activity.customFields?.['objectives'] || 
                     `Facilitar aprendizado sobre ${activity.title}`,
          instructions: activity.customFields?.['Instruções'] || 
                       activity.customFields?.['instructions'] || 
                       'Use os flash cards para estudar',
          evaluation: activity.customFields?.['Avaliação'] || 
                     activity.customFields?.['evaluation'] || 
                     'Avalie o conhecimento através dos cards'
        };

        console.log('🃏 [FLASH CARDS] Dados preparados:', flashCardsData);

        const result = await generator.generateFlashCardsContent(flashCardsData);

        if (result && result.cards && result.cards.length > 0) {
          console.log(`✅ [FLASH CARDS] ${result.cards.length} cards gerados com sucesso`);

          // Salvar dados gerados com múltiplas chaves para compatibilidade
          const storageKey = `constructed_flash-cards_${activity.id}`;
          const constructedData = {
            success: true,
            data: result,
            timestamp: new Date().toISOString()
          };

          localStorage.setItem(storageKey, JSON.stringify(constructedData));
          localStorage.setItem(`activity_${activity.id}`, JSON.stringify(result));

          // ✅ SALVAR NO constructedActivities GLOBAL (para ConstructionGrid detectar)
          const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
          constructedActivities[activity.id] = {
            isBuilt: true,
            builtAt: new Date().toISOString(),
            formData: flashCardsData,
            generatedContent: result
          };
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
          console.log('✅ [FLASH CARDS] Salvo em constructedActivities global');

          activity.isBuilt = true;
          activity.builtAt = new Date().toISOString();
          activity.progress = 100;
          activity.status = 'completed';

          // SALVAMENTO AUTOMÁTICO NO BANCO DE DADOS
          console.log('💾 [AUTO-BUILD] ==========================================');
          console.log('💾 [AUTO-BUILD] ATIVIDADE CONCLUÍDA - SALVAMENTO AUTOMÁTICO');
          console.log('💾 [AUTO-BUILD] Título:', activity.title);
          console.log('💾 [AUTO-BUILD] ID:', activity.id);
          console.log('💾 [AUTO-BUILD] Status:', activity.status);
          console.log('💾 [AUTO-BUILD] Progress:', activity.progress);
          console.log('💾 [AUTO-BUILD] isBuilt:', activity.isBuilt);
          console.log('💾 [AUTO-BUILD] ==========================================');

          try {
            await this.saveActivityToDatabase(activity);
          } catch (saveError) {
            console.error('💥 [AUTO-BUILD] Erro crítico no salvamento automático:', saveError);
          }

          if (this.onActivityBuilt) {
            this.onActivityBuilt(activity.id);
          }

          console.log(`✅ [AUTO-BUILD] Atividade construída: ${activity.title}`);
          return; // Sai da função após construção bem-sucedida
        } else {
          console.error('❌ [FLASH CARDS] Resultado inválido:', result);
          throw new Error('Nenhum card foi gerado pela IA');
        }
      } catch (error) {
        console.error('❌ [FLASH CARDS] Erro no sistema exclusivo:', error);

        // Fallback manual em caso de erro total
        console.log('🛡️ [FLASH CARDS] Ativando fallback manual');
        const fallbackCards = Array.from({ length: 5 }, (_, i) => ({
          id: i + 1,
          front: `Conceito ${i + 1} sobre ${activity.title}`,
          back: `Este é um conceito importante relacionado a ${activity.title}`,
          category: 'Geral',
          difficulty: 'Médio'
        }));

        const fallbackResult = {
          title: activity.title,
          cards: fallbackCards,
          totalCards: fallbackCards.length,
          isFallback: true
        };

        localStorage.setItem(`constructed_flash-cards_${activity.id}`, JSON.stringify({
          success: true,
          data: fallbackResult,
          isFallback: true,
          timestamp: new Date().toISOString()
        }));

        localStorage.setItem(`activity_${activity.id}`, JSON.stringify(fallbackResult));

        // ✅ SALVAR NO constructedActivities GLOBAL (para ConstructionGrid detectar)
        const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
        constructedActivities[activity.id] = {
          isBuilt: true,
          builtAt: new Date().toISOString(),
          formData: { theme: activity.title },
          generatedContent: fallbackResult,
          isFallback: true
        };
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
        console.log('✅ [FLASH CARDS FALLBACK] Salvo em constructedActivities global');

        activity.isBuilt = true;
        activity.builtAt = new Date().toISOString();
        activity.progress = 100;
        activity.status = 'completed';

        // SALVAMENTO AUTOMÁTICO NO BANCO DE DADOS (mesmo com fallback)
        console.log('💾 [AUTO-BUILD] ==========================================');
        console.log('💾 [AUTO-BUILD] ATIVIDADE CONCLUÍDA COM FALLBACK - SALVAMENTO AUTOMÁTICO');
        console.log('💾 [AUTO-BUILD] Título:', activity.title);
        console.log('💾 [AUTO-BUILD] ID:', activity.id);
        console.log('💾 [AUTO-BUILD] Status:', activity.status);
        console.log('💾 [AUTO-BUILD] Progress:', activity.progress);
        console.log('💾 [AUTO-BUILD] isBuilt:', activity.isBuilt);
        console.log('💾 [AUTO-BUILD] ==========================================');

        try {
          await this.saveActivityToDatabase(activity);
        } catch (saveError) {
          console.error('💥 [AUTO-BUILD] Erro crítico no salvamento automático (fallback):', saveError);
        }

        if (this.onActivityBuilt) {
          this.onActivityBuilt(activity.id);
        }

        console.log(`✅ [AUTO-BUILD] Atividade construída com fallback: ${activity.title}`);
        return; // Sai da função após fallback
      }
    }

    // Lógica para outras atividades...
    try {
      // ETAPA 2: Processar a atividade com base no tipo
      if (activity.id === 'tese-redacao') {
        console.log('📝 [AUTO-BUILD] Processando Tese da Redação');

        // Preparar dados da Tese da Redação com campos corretos
        const teseFormData = {
          title: activity.title || 'Tese da Redação',
          temaRedacao: activity.customFields?.['Tema da Redação'] || activity.customFields?.temaRedacao || activity.title || 'Tema da Redação',
          objetivo: activity.customFields?.['Objetivos'] || activity.customFields?.objetivo || activity.description || 'Desenvolver habilidades argumentativas',
          nivelDificuldade: activity.customFields?.['Nível de Dificuldade'] || activity.customFields?.nivelDificuldade || 'Médio',
          competenciasENEM: activity.customFields?.['Competências ENEM'] || activity.customFields?.competenciasENEM || 'Competência II e III',
          contextoAdicional: activity.customFields?.['Contexto Adicional'] || activity.customFields?.contextoAdicional || ''
        };

        console.log('📋 [TESE REDAÇÃO] Dados preparados para geração:', teseFormData);

        try {
          // Importar o gerador
          const { TeseRedacaoGenerator } = await import('@/features/schoolpower/activities/tese-redacao');
          const generator = new TeseRedacaoGenerator();

          // Gerar conteúdo via Gemini
          const generatedContent = await generator.generateTeseRedacaoContent(teseFormData);

          console.log('✅ [TESE REDAÇÃO] Conteúdo gerado pela IA:', generatedContent);

          // Salvar no localStorage com ESTRUTURA CORRETA
          const constructedKey = `constructed_tese-redacao_${activity.id}`;
          const constructedData = {
            success: true,
            data: generatedContent, // Conteúdo completo da IA
            timestamp: new Date().toISOString(),
            activityId: activity.id,
            formData: teseFormData
          };
          localStorage.setItem(constructedKey, JSON.stringify(constructedData));
          console.log(`💾 [TESE REDAÇÃO] Salvo em ${constructedKey}`);

          // TAMBÉM salvar em activity_<id> para compatibilidade
          localStorage.setItem(`activity_${activity.id}`, JSON.stringify(generatedContent));

          // Marcar no constructedActivities GLOBAL
          const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
          constructedActivities[activity.id] = {
            isBuilt: true,
            builtAt: new Date().toISOString(),
            formData: teseFormData,
            generatedContent: generatedContent
          };
          localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

          // Atualizar status da atividade
          activity.isBuilt = true;
          activity.builtAt = new Date().toISOString();
          activity.progress = 100;
          activity.status = 'completed';

          // Salvamento automático no banco
          await this.saveActivityToDatabase(activity);

          console.log('✅ [AUTO-BUILD] Tese da Redação construída com sucesso');

        } catch (error) {
          console.error('❌ [TESE REDAÇÃO] Erro na geração:', error);
          throw error;
        }
      } else if (activity.id === 'quadro-interativo') {
        console.log('🎯 [AUTO-BUILD] Processando Quadro Interativo');

        // Preparar dados do Quadro Interativo
        const quadroData = await this.prepareFormDataExactlyLikeModal(activity);
        // Lógica para quadro interativo continua aqui...
      } else {
        // Lógica padrão para outras atividades que não sejam Tese da Redação ou Quadro Interativo
        const formData = await this.prepareFormDataExactlyLikeModal(activity);
        const activityType = activity.type || activity.id || 'lista-exercicios';

        console.log(`🤖 [AUTO-BUILD] Chamando buildActivityFromFormData: ${activityType}`);
        
        const result = await buildActivityFromFormData(activity.id, activityType, formData);

        if (result) {
          // Update activity properties
          activity.isBuilt = true;
          activity.builtAt = new Date().toISOString();
          activity.progress = 100;
          activity.status = 'completed';

          // SALVAMENTO AUTOMÁTICO NO BANCO DE DADOS
          console.log('💾 [AUTO-BUILD] ==========================================');
          console.log('💾 [AUTO-BUILD] ATIVIDADE CONCLUÍDA - SALVAMENTO AUTOMÁTICO');
          console.log('💾 [AUTO-BUILD] Título:', activity.title);
          console.log('💾 [AUTO-BUILD] ID:', activity.id);
          console.log('💾 [AUTO-BUILD] Status:', activity.status);
          console.log('💾 [AUTO-BUILD] Progress:', activity.progress);
          console.log('💾 [AUTO-BUILD] isBuilt:', activity.isBuilt);
          console.log('💾 [AUTO-BUILD] ==========================================');

          try {
            await this.saveActivityToDatabase(activity);
          } catch (saveError) {
            console.error('💥 [AUTO-BUILD] Erro crítico no salvamento automático:', saveError);
          }

          if (this.onActivityBuilt) {
            this.onActivityBuilt(activity.id);
          }

          console.log(`✅ [AUTO-BUILD] Atividade construída: ${activity.title}`);
        } else {
          throw new Error('Falha na geração do conteúdo pela IA');
        }
      }
    } catch (error) {
      console.error(`❌ [AUTO-BUILD] Erro na construção de ${activity.title}:`, error);
      activity.status = 'error';
      activity.progress = 0;
      throw error;
    }
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

      // ETAPA 3.5: SALVAMENTO AUTOMÁTICO NO BANCO DE DADOS
      console.log('💾 [QUADRO INTERATIVO] Atividade concluída, iniciando salvamento automático...');
      await this.saveActivityToDatabase(activity);

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
   * Sanitiza e normaliza questões de quiz para garantir estrutura válida
   */
  private sanitizeQuizQuestions(questions: any[], activityTitle: string): any[] {
    if (!questions || !Array.isArray(questions)) {
      console.warn('⚠️ [QUIZ] questions não é um array válido');
      return [];
    }

    return questions
      .filter(q => q && (q.question || q.text || q.pergunta))
      .map((q, index) => {
        // Extrair texto da questão
        const questionText = q.question || q.text || q.pergunta || `Questão ${index + 1}`;
        
        // Extrair opções com fallback
        let options = q.options || q.alternativas || q.opcoes || ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
        if (!Array.isArray(options) || options.length === 0) {
          options = ['Opção A', 'Opção B', 'Opção C', 'Opção D'];
        }
        
        // Extrair resposta correta
        let correctAnswer = q.correctAnswer || q.correct || q.answer || q.resposta || q.respostaCorreta;
        if (!correctAnswer || (typeof correctAnswer !== 'string')) {
          correctAnswer = options[0]; // Fallback para primeira opção
        }
        
        // Determinar tipo
        let type: 'multipla-escolha' | 'verdadeiro-falso' = 'multipla-escolha';
        if (q.type === 'verdadeiro-falso' || q.tipo === 'verdadeiro-falso' || 
            (options.length === 2 && options.every(o => ['Verdadeiro', 'Falso', 'V', 'F', 'true', 'false'].includes(String(o))))) {
          type = 'verdadeiro-falso';
        }

        return {
          id: q.id || index + 1,
          question: questionText,
          type,
          options,
          correctAnswer,
          explanation: q.explanation || q.explicacao || `Explicação da questão ${index + 1}`
        };
      });
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

  /**
   * Constrói uma atividade via ModalBridge (modal real)
   */
  private async buildViaModalBridge(activity: ConstructionActivity): Promise<boolean> {
    const requestId = `modal-build-${activity.id}-${Date.now()}`;
    const debugStore = useActivityDebugStore.getState();
    
    console.log(`\n🌉 ════════════════════════════════════════════════════════`);
    console.log(`🌉 [AUTO-BUILD] CONSTRUÇÃO VIA MODAL_BRIDGE`);
    console.log(`🌉 ════════════════════════════════════════════════════════`);
    console.log(`🌉 [AUTO-BUILD] Atividade: ${activity.id}`);
    console.log(`🌉 [AUTO-BUILD] Título: ${activity.title}`);
    console.log(`🌉 [AUTO-BUILD] ModalBridge.isReady(): ${ModalBridge.isReady()}`);

    debugStore.log(activity.id, 'action', 'ModalBridge', 'Iniciando construção via ModalBridge', {
      requestId,
      modalBridgeReady: ModalBridge.isReady()
    });
    debugStore.setStatus(activity.id, 'building');
    debugStore.setProgress(activity.id, 10, 'Preparando campos...');

    // Preparar campos do formulário
    const formData = await this.prepareFormDataExactlyLikeModal(activity);
    debugStore.log(activity.id, 'info', 'FormData', 'Campos preparados', { 
      fieldCount: Object.keys(formData).length 
    });
    debugStore.setProgress(activity.id, 25, 'Campos preparados');
    
    // Emitir evento para BuildController
    const buildRequest = {
      activityId: activity.id,
      activityType: activity.type || activity.id,
      fields: {
        ...formData,
        ...activity.customFields,
        title: activity.title,
        tema: activity.title,
        theme: activity.title,
        subject: activity.categoryName || 'Geral',
        disciplina: activity.categoryName || 'Geral',
        objectives: activity.description,
        objetivo: activity.description
      },
      requestId
    };

    console.log(`📡 [AUTO-BUILD] Emitindo evento construction:build_activity...`);
    console.log(`📡 [AUTO-BUILD] Campos:`, Object.keys(buildRequest.fields));
    
    debugStore.log(activity.id, 'api', 'EventEmitter', 'Emitindo construction:build_activity', {
      requestId,
      fieldKeys: Object.keys(buildRequest.fields)
    });
    debugStore.setProgress(activity.id, 40, 'Enviando para BuildController...');
    
    emitBuildActivityRequest(buildRequest);

    try {
      console.log(`⏳ [AUTO-BUILD] Aguardando confirmação (timeout: 90s)...`);
      debugStore.log(activity.id, 'info', 'WaitResult', 'Aguardando confirmação do BuildController (timeout: 90s)');
      debugStore.setProgress(activity.id, 50, 'Aguardando resposta...');
      
      const result = await waitForBuildResult(requestId, 90000);
      
      console.log(`\n🎉 ════════════════════════════════════════════════════════`);
      console.log(`🎉 [AUTO-BUILD] CONSTRUÇÃO VIA MODAL CONFIRMADA!`);
      console.log(`🎉 ════════════════════════════════════════════════════════`);
      console.log(`🎉 [AUTO-BUILD] Activity ID: ${result.activityId}`);
      console.log(`🎉 [AUTO-BUILD] Sucesso: ${result.success}`);
      console.log(`🎉 [AUTO-BUILD] Chaves localStorage:`);
      result.storageKeys.forEach(key => console.log(`   💾 ${key}`));

      debugStore.log(activity.id, 'success', 'BuildResult', 'Construção concluída com sucesso', {
        activityId: result.activityId,
        success: result.success,
        storageKeys: result.storageKeys
      });

      // Atualizar estado da atividade
      activity.isBuilt = true;
      activity.builtAt = new Date().toISOString();
      activity.progress = 100;
      activity.status = 'completed';

      debugStore.markCompleted(activity.id);

      // Callback de conclusão
      if (this.onActivityBuilt) {
        this.onActivityBuilt(activity.id);
      }

      return true;
    } catch (error) {
      console.error(`❌ [AUTO-BUILD] Erro na construção via ModalBridge:`, error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      debugStore.log(activity.id, 'error', 'BuildError', `Falha na construção: ${errorMessage}`, {
        error: errorMessage
      });
      debugStore.setError(activity.id, errorMessage);
      return false;
    }
  }

  /**
   * Constrói uma única atividade (usado pelo BuildQueueController)
   * @returns true se sucesso, false se falha
   */
  async buildSingleActivity(activity: ConstructionActivity): Promise<boolean> {
    const debugStore = useActivityDebugStore.getState();
    const useModalBridge = ModalBridge.isReady();

    try {
      let buildSuccess = false;

      if (useModalBridge || ModalBridge.isReady()) {
        debugStore.log(activity.id, 'info', 'Strategy', 'Tentando ModalBridge (modal real)');
        buildSuccess = await this.buildViaModalBridge(activity);
      }

      if (!buildSuccess) {
        debugStore.log(activity.id, 'warning', 'Fallback', 'ModalBridge falhou, usando lógica interna');
        debugStore.setProgress(activity.id, 60, 'Usando lógica alternativa...');
        await this.buildActivityWithExactModalLogic(activity);
        debugStore.markCompleted(activity.id);
        return true;
      }

      return buildSuccess;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido';
      debugStore.log(activity.id, 'error', 'BuildFail', `Erro crítico: ${errorMessage}`);
      debugStore.setError(activity.id, errorMessage);
      throw error;
    }
  }

  /**
   * Constrói todas as atividades usando o BuildQueueController
   * Processamento SEQUENCIAL: uma atividade por vez, em ordem
   */
  async buildAllActivities(activities: ConstructionActivity[]): Promise<void> {
    console.log(`
═══════════════════════════════════════════════════════════════════════
🚀 [AUTO-BUILD] INICIANDO CONSTRUÇÃO SEQUENCIAL ORDENADA
═══════════════════════════════════════════════════════════════════════
Total de atividades: ${activities.length}
ModalBridge disponível: ${ModalBridge.isReady()}
Modo: SEQUENCIAL (1 por vez, em ordem)
═══════════════════════════════════════════════════════════════════════`);

    const errors: string[] = [];

    const queueController = BuildQueueController.getInstance({
      delayBetweenActivities: 800,
      maxRetries: 2,
      timeout: 120000,
      onProgress: (progress: QueueProgress) => {
        this.updateProgress({
          current: progress.completedCount + progress.failedCount + progress.skippedCount,
          total: progress.totalActivities,
          currentActivity: progress.currentActivity 
            ? `${progress.status === 'running' ? 'Construindo' : 'Processando'}: ${progress.currentActivity.activity.title}`
            : 'Processando...',
          status: progress.status === 'completed' ? 'completed' : 
                  progress.status === 'error' ? 'error' : 'running',
          errors
        });
      },
      onActivityStart: (queuedItem) => {
        console.log(`🔨 [AUTO-BUILD] Iniciando: ${queuedItem.activity.title} (${queuedItem.position}/${activities.length})`);
      },
      onActivityComplete: (queuedItem, success) => {
        if (!success && queuedItem.error) {
          errors.push(`Erro em "${queuedItem.activity.title}": ${queuedItem.error}`);
        }
        console.log(`${success ? '✅' : '❌'} [AUTO-BUILD] ${queuedItem.activity.title}: ${success ? 'Concluída' : 'Falhou'}`);
      },
      onQueueComplete: (summary) => {
        console.log(`
═══════════════════════════════════════════════════════════════════════
🎉 [AUTO-BUILD] CONSTRUÇÃO SEQUENCIAL FINALIZADA
═══════════════════════════════════════════════════════════════════════
Concluídas: ${summary.completedCount}/${summary.totalActivities}
Falhas: ${summary.failedCount}
Puladas: ${summary.skippedCount}
Duração total: ${summary.totalDuration}ms
═══════════════════════════════════════════════════════════════════════`);
      }
    });

    queueController.setBuildFunction(async (activity) => {
      return this.buildSingleActivity(activity);
    });

    queueController.initQueue(activities);

    this.updateProgress({
      current: 0,
      total: activities.length,
      currentActivity: 'Iniciando fila de construção sequencial...',
      status: 'running',
      errors: []
    });

    const summary = await queueController.start();

    this.updateProgress({
      current: activities.length,
      total: activities.length,
      currentActivity: 'Construção sequencial finalizada!',
      status: errors.length > 0 && summary.completedCount === 0 ? 'error' : 'completed',
      errors
    });

    console.log(`📊 [AUTO-BUILD] Resultado: ${summary.completedCount}/${summary.totalActivities} atividades construídas`);

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