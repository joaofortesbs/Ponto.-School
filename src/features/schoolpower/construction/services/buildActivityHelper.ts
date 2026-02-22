import { ActivityFormData } from '../types/ActivityTypes';
import { generateActivityContent } from '../api/generateActivityContent';
import { safeSetJSON, cleanupOldStorage, getStorageUsagePercent } from '../../services/localStorage-manager';
import { 
  processExerciseListWithUnifiedPipeline, 
  saveExerciseListData 
} from '../../activities/lista-exercicios';
import { isTextVersionActivity as isTextVersionActivityConfig } from '../../config/activityVersionConfig';

/**
 * Helper function to build an activity from form data
 * 
 * This function replicates the exact logic of handleBuildActivity from EditActivityModal
 * and can be used by both EditActivityModal (refactored) and AutoBuildService
 * 
 * @param activityId - The ID of the activity being built
 * @param activityType - The type of activity (e.g., 'lista-exercicios', 'quadro-interativo')
 * @param formData - The form data containing activity details
 * @returns Promise with the generated content
 */
export async function buildActivityFromFormData(
  activityId: string,
  activityType: string,
  formData: ActivityFormData
): Promise<any> {
  console.log('🚀 [buildActivityHelper] Iniciando construção da atividade:', activityId);
  console.log('🎯 [buildActivityHelper] Tipo de atividade:', activityType);
  console.log('📊 [buildActivityHelper] Dados do formulário:', formData);

  // Verificar uso do localStorage antes de continuar
  const usagePercent = getStorageUsagePercent();
  if (usagePercent > 70) {
    console.log('⚠️ [buildActivityHelper] Uso alto do localStorage detectado, limpando...');
    cleanupOldStorage();
  }

  try {
    // 1. Generate content using the API
    console.log(`📌 [buildActivityHelper] Chamando generateActivityContent para tipo: ${activityType}`);
    const result = await generateActivityContent(activityType, formData);
    
    if (!result) {
      throw new Error(`generateActivityContent retornou undefined para ${activityType}`);
    }

    console.log('✅ [buildActivityHelper] Atividade construída com sucesso:', result);

    const isTextVersionActivity = isTextVersionActivityConfig(activityType);
    
    if (!isTextVersionActivity) {
      // CORREÇÃO: Extrair dados corretos do resultado (pode vir como { success, data } ou direto)
      let actualData = result?.data || result;
      
      // ============================================================================
      // PROCESSAMENTO ESPECIAL PARA LISTA DE EXERCÍCIOS - BLINDAGEM V2.0
      // ============================================================================
      if (activityType === 'lista-exercicios') {
        console.log('📝 [buildActivityHelper] Lista de Exercícios - Processando pela pipeline unificada...');
        console.log('📝 [buildActivityHelper] Dados brutos recebidos:', {
          hasQuestoes: !!actualData?.questoes,
          questoesCount: actualData?.questoes?.length || 0,
          primeiraQuestaoEnunciado: actualData?.questoes?.[0]?.enunciado?.substring(0, 100)
        });
        
        // Processar dados pela pipeline unificada para garantir normalização
        const processedResult = processExerciseListWithUnifiedPipeline(actualData, {
          id: activityId,
          tema: formData.theme || formData.tema,
          disciplina: formData.subject || formData.disciplina,
          numeroQuestoes: formData.numberOfQuestions,
          modeloQuestoes: formData.questionModel,
          nivelDificuldade: formData.difficultyLevel,
          titulo: formData.title
        });
        
        console.log('✅ [buildActivityHelper] Pipeline unificada processou:', {
          success: processedResult.success,
          questoesValidas: processedResult.metadata.validQuestoes,
          questoesTotais: processedResult.metadata.totalQuestoes,
          metodo: processedResult.metadata.extractionMethod
        });
        
        // Atualizar actualData com as questões processadas
        actualData = {
          ...actualData,
          titulo: processedResult.titulo || actualData.titulo,
          disciplina: processedResult.disciplina || actualData.disciplina,
          questoes: processedResult.questoes,
          questions: processedResult.questoes,
          content: {
            questoes: processedResult.questoes,
            questions: processedResult.questoes
          },
          _processedByPipeline: true,
          _pipelineMetadata: processedResult.metadata
        };
        
        // Usar função centralizada de storage para Lista de Exercícios
        const saved = saveExerciseListData(activityId, actualData);
        if (!saved) {
          console.warn(`⚠️ [buildActivityHelper] Falha ao salvar Lista de Exercícios: ${activityId}`);
        } else {
          console.log(`💾 [buildActivityHelper] Lista de Exercícios salva via storage centralizado: ${activityId}`);
        }
      } 
      // ============================================================================
      // PROCESSAMENTO PARA FLASH CARDS (já funcionando)
      // ============================================================================
      else if (activityType === 'flash-cards') {
        console.log(`🃏 [buildActivityHelper] Flash Cards - Dados a salvar:`, {
          hasCards: !!actualData?.cards,
          cardsCount: actualData?.cards?.length || 0,
          title: actualData?.title,
          theme: actualData?.theme
        });
        
        const storageKey = `constructed_${activityType}_${activityId}`;
        const saved = safeSetJSON(storageKey, actualData);
        if (!saved) {
          console.warn(`⚠️ [buildActivityHelper] Não foi possível salvar no localStorage: ${storageKey}`);
        } else {
          console.log(`💾 [buildActivityHelper] Dados salvos no localStorage: ${storageKey}`);
        }
      }
      // ============================================================================
      // PROCESSAMENTO PADRÃO PARA OUTRAS ATIVIDADES
      // ============================================================================
      else {
        // 2. Save to localStorage with the SAME key used in EditActivityModal (ONLY for interactive activities)
        const storageKey = `constructed_${activityType}_${activityId}`;
        
        const saved = safeSetJSON(storageKey, actualData);
        if (!saved) {
          console.warn(`⚠️ [buildActivityHelper] Não foi possível salvar no localStorage: ${storageKey}`);
        } else {
          console.log(`💾 [buildActivityHelper] Dados salvos no localStorage: ${storageKey}`);
        }
      }

      // 3. Save to constructedActivities object (used by EditActivityModal)
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activityId] = {
        generatedContent: actualData,
        timestamp: new Date().toISOString(),
        activityType: activityType
      };
      safeSetJSON('constructedActivities', constructedActivities);
      console.log('💾 [buildActivityHelper] Atividade adicionada a constructedActivities');
    } else {
      console.log('📝 [buildActivityHelper] Atividade de versão texto - salvando dados essenciais');
      
      let actualData = result?.data || result;
      
      const allLsKeys = Object.keys(localStorage);
      const textContentKey = allLsKeys.find(k => 
        k.startsWith('text_content_') && k.endsWith(`_${activityId}`)
      ) || allLsKeys.find(k =>
        k === `text_content_${activityType}_${activityId}`
      );
      let textContent = '';
      let textSections: any[] = [];
      if (textContentKey) {
        try {
          const textRaw = localStorage.getItem(textContentKey);
          if (textRaw) {
            const textData = JSON.parse(textRaw);
            textContent = textData.textContent || '';
            textSections = textData.sections || [];
          }
        } catch (e) { }
      }
      
      const textActivityData = {
        ...actualData,
        activityType: activityType,
        activityId: activityId,
        isTextVersion: true,
        versionType: 'text',
        textContent: textContent || actualData?.textContent || '',
        sections: textSections.length > 0 ? textSections : (actualData?.sections || []),
        generatedAt: new Date().toISOString(),
      };
      
      const storageKey = `constructed_${activityType}_${activityId}`;
      const saved = safeSetJSON(storageKey, { success: true, data: textActivityData });
      if (saved) {
        console.log(`💾 [buildActivityHelper] Texto salvo em: ${storageKey}`);
      }
      
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivities[activityId] = {
        generatedContent: textActivityData,
        timestamp: new Date().toISOString(),
        activityType: activityType,
        isTextVersion: true
      };
      safeSetJSON('constructedActivities', constructedActivities);
    }

    // 4. Special handling for quadro-interativo
    if (activityType === 'quadro-interativo') {
      console.log('🎯 [buildActivityHelper] Processamento especial para Quadro Interativo');

      const quadroData = {
        ...result.data || result,
        isBuilt: true,
        builtAt: new Date().toISOString(),
        generatedByModal: true
      };

      safeSetJSON(`quadro_interativo_data_${activityId}`, quadroData);
      console.log(`💾 [buildActivityHelper] Dados do Quadro Interativo salvos: quadro_interativo_data_${activityId}`);

      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
          detail: { 
            activityId: activityId, 
            data: quadroData 
          }
        }));
        console.log('📡 [buildActivityHelper] Evento quadro-interativo-auto-build disparado');
      }, 100);
    }

    // 5. Dispatch activity-data-sync event for view modal synchronization
    // CORREÇÃO: Extrair dados corretamente (pode vir como { success, data } ou direto)
    const actualData = result?.data || result;
    const isHeavyActivity = ['lista-exercicios', 'quiz-interativo', 'flash-cards'].includes(activityType);
    
    // Para Flash Cards: incluir dados completos para sincronização instantânea
    const viewSyncData = isTextVersionActivity 
      ? {
          title: formData.title || formData.tema || 'Atividade',
          type: activityType,
          isTextVersion: true,
          lastUpdate: new Date().toISOString()
        }
      : activityType === 'flash-cards'
        ? {
            title: actualData?.title || formData.title,
            description: actualData?.description || formData.description,
            type: activityType,
            subject: actualData?.subject || formData.subject,
            schoolYear: actualData?.schoolYear || formData.schoolYear,
            theme: actualData?.theme || formData.theme,
            cards: actualData?.cards || [],
            totalCards: actualData?.cards?.length || 0,
            generatedContent: actualData,
            isGeneratedByAI: actualData?.isGeneratedByAI || actualData?.generatedByAI || false,
            lastUpdate: new Date().toISOString()
          }
      : isHeavyActivity
        ? {
            title: formData.title,
            description: formData.description,
            type: activityType,
            subject: formData.subject,
            schoolYear: formData.schoolYear,
            questionsCount: actualData?.questoes?.length || actualData?.questions?.length || actualData?.cards?.length || 0,
            generatedContent: actualData,
            lastUpdate: new Date().toISOString()
          }
        : {
            title: formData.title,
            description: formData.description,
            customFields: { ...formData },
            generatedContent: actualData,
            formData,
            lastUpdate: new Date().toISOString()
          };

    // Save to activity storage key - dados mínimos para evitar quota
    const activityStorageKey = `activity_${activityId}`;
    safeSetJSON(activityStorageKey, {
      ...viewSyncData,
      lastSync: new Date().toISOString()
    });

    // Dispatch the activity-data-sync event
    window.dispatchEvent(new CustomEvent('activity-data-sync', {
      detail: {
        activityId: activityId,
        data: viewSyncData,
        timestamp: Date.now()
      }
    }));
    console.log('🔄 [buildActivityHelper] Evento activity-data-sync disparado');

    // 6. Return the generated content
    return result;

  } catch (error) {
    console.error('❌ [buildActivityHelper] Erro na construção:', error);
    throw error;
  }
}

/**
 * Helper function to retrieve constructed content from localStorage
 * 
 * @param activityId - The ID of the activity
 * @param activityType - The type of activity
 * @returns The constructed content or null if not found
 */
export function getConstructedContent(activityId: string, activityType: string): any {
  const storageKey = `constructed_${activityType}_${activityId}`;
  const content = localStorage.getItem(storageKey);
  
  if (content) {
    try {
      return JSON.parse(content);
    } catch (error) {
      console.error(`❌ [buildActivityHelper] Erro ao parsear conteúdo de ${storageKey}:`, error);
      return null;
    }
  }
  
  return null;
}

/**
 * Helper function to retrieve all constructed activities
 * 
 * @returns Object with all constructed activities indexed by activityId
 */
export function getConstructedActivities(): Record<string, any> {
  const stored = localStorage.getItem('constructedActivities');
  
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (error) {
      console.error('❌ [buildActivityHelper] Erro ao parsear constructedActivities:', error);
      return {};
    }
  }
  
  return {};
}

/**
 * Helper function to clear constructed content for an activity
 * 
 * @param activityId - The ID of the activity
 * @param activityType - The type of activity
 */
export function clearConstructedContent(activityId: string, activityType: string): void {
  const storageKey = `constructed_${activityType}_${activityId}`;
  localStorage.removeItem(storageKey);
  console.log(`🗑️  [buildActivityHelper] Conteúdo construído removido: ${storageKey}`);

  // Also remove from constructedActivities
  const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
  if (constructedActivities[activityId]) {
    delete constructedActivities[activityId];
    localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    console.log(`🗑️  [buildActivityHelper] Atividade removida de constructedActivities: ${activityId}`);
  }

  // Remove activity sync data
  const activityStorageKey = `activity_${activityId}`;
  localStorage.removeItem(activityStorageKey);
  console.log(`🗑️  [buildActivityHelper] Dados de sincronização removidos: ${activityStorageKey}`);

  // Remove quadro interativo specific data if exists
  localStorage.removeItem(`quadro_interativo_data_${activityId}`);
  console.log(`🗑️  [buildActivityHelper] Dados de quadro interativo removidos: quadro_interativo_data_${activityId}`);
}
