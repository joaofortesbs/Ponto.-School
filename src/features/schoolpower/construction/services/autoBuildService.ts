import { ConstructionActivity } from '../types';
import { quadroInterativoFieldMapping, prepareQuadroInterativoDataForModal } from '../../activities/quadro-interativo';
import activitiesApi from '../../../../services/activitiesApiService';
import { profileService } from '../../../../services/profileService';
import { supabase } from '@/lib/supabase';

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

  /**
   * Obtém o token de autenticação do Supabase
   */
  private async getAuthToken(): Promise<string | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      return session?.access_token || null;
    } catch (error) {
      console.error('❌ [AUTO-SAVE] Erro ao obter token de autenticação:', error);
      return null;
    }
  }

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
        
        // 5. Atualizar coluna de ligação na tabela perfis
        try {
          console.log('🔗 [AUTO-SAVE] Atualizando coluna de ligação no perfil...');
          
          // Obter token de autenticação
          const authToken = await this.getAuthToken();
          const headers: HeadersInit = {
            'Content-Type': 'application/json'
          };
          
          // Adicionar token se disponível
          if (authToken) {
            headers['Authorization'] = `Bearer ${authToken}`;
            console.log('🔒 [AUTO-SAVE] Token de autenticação incluído na atualização de perfil');
          } else {
            console.warn('⚠️ [AUTO-SAVE] Nenhum token de autenticação disponível');
          }
          
          const baseUrl = `https://${window.location.hostname}`;
          const connectionUpdate = await fetch(`${baseUrl}/api/perfis/update-connection`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              activity_id: response.data?.id,
              activity_code: response.data?.codigo_unico,
              activity_title: response.data?.titulo,
              activity_type: response.data?.tipo,
              timestamp: new Date().toISOString()
            })
          });
          
          if (connectionUpdate.ok) {
            console.log('✅ [AUTO-SAVE] Coluna de ligação atualizada com sucesso!');
          } else {
            console.warn('⚠️ [AUTO-SAVE] Falha ao atualizar coluna de ligação');
          }
        } catch (connectionError) {
          console.error('❌ [AUTO-SAVE] Erro ao atualizar coluna de ligação:', connectionError);
        }
        
        // 6. Marcar que foi salva automaticamente
        localStorage.setItem(`auto_saved_${activity.id}`, JSON.stringify({
          saved: true,
          savedAt: new Date().toISOString(),
          codigoUnico: codigoUnico,
          databaseId: response.data?.id
        }));

        // 7. Disparar evento de salvamento automático
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
   */
  private getConstructedDataFromStorage(activityId: string): any {
    try {
      const storageKey = `constructed_${activityId}`;
      const content = localStorage.getItem(storageKey);
      if (content) return JSON.parse(content);

      // Tentar chaves alternativas
      const alternativeKeys = [
        `constructed_${activityId}_${activityId}`,
        `schoolpower_${activityId}_content`,
        `generated_content_${activityId}`
      ];

      for (const key of alternativeKeys) {
        const altContent = localStorage.getItem(key);
        if (altContent) {
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

        // DISPARO DO EVENTO DE ATIVIDADE CONSTRUÍDA
        window.dispatchEvent(new CustomEvent('activity-built', {
          detail: {
            activityId: activity.id,
            activityTitle: activity.title,
            progress: activity.progress,
            status: activity.status,
            timestamp: new Date().toISOString()
          }
        }));

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

  // Método público para salvamento de atividades já construídas (chamado do modal)
  async saveConstructedActivityToDatabase(activity: ConstructionActivity): Promise<void> {
    console.log('💾 [PUBLIC-SAVE] ==========================================');
    console.log('💾 [PUBLIC-SAVE] SALVAMENTO DE ATIVIDADE JÁ CONSTRUÍDA');
    console.log('💾 [PUBLIC-SAVE] Atividade:', activity.title);
    console.log('💾 [PUBLIC-SAVE] Status:', activity.status);
    console.log('💾 [PUBLIC-SAVE] Progress:', activity.progress);
    console.log('💾 [PUBLIC-SAVE] ==========================================');
    
    // Delegar para o método privado de salvamento
    await this.saveActivityToDatabase(activity);
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