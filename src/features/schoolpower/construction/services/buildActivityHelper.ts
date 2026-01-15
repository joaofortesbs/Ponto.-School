import { ActivityFormData } from '../types/ActivityTypes';
import { generateActivityContent } from '../api/generateActivityContent';

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

  try {
    // 1. Generate content using the API
    console.log(`📌 [buildActivityHelper] Chamando generateActivityContent para tipo: ${activityType}`);
    const result = await generateActivityContent(activityType, formData);
    
    if (!result) {
      throw new Error(`generateActivityContent retornou undefined para ${activityType}`);
    }

    console.log('✅ [buildActivityHelper] Atividade construída com sucesso:', result);

    // 2. Save to localStorage with the SAME key used in EditActivityModal
    const storageKey = `constructed_${activityType}_${activityId}`;
    localStorage.setItem(storageKey, JSON.stringify(result));
    console.log(`💾 [buildActivityHelper] Dados salvos no localStorage: ${storageKey}`);

    // 3. Save to constructedActivities object (used by EditActivityModal)
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    constructedActivities[activityId] = {
      generatedContent: result,
      timestamp: new Date().toISOString(),
      activityType: activityType
    };
    localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    console.log('💾 [buildActivityHelper] Atividade adicionada a constructedActivities');

    // 4. Special handling for quadro-interativo
    if (activityType === 'quadro-interativo') {
      console.log('🎯 [buildActivityHelper] Processamento especial para Quadro Interativo');

      // Save quadro-specific data with additional metadata
      const quadroData = {
        ...result.data || result,
        isBuilt: true,
        builtAt: new Date().toISOString(),
        generatedByModal: true
      };

      localStorage.setItem(`quadro_interativo_data_${activityId}`, JSON.stringify(quadroData));
      console.log(`💾 [buildActivityHelper] Dados do Quadro Interativo salvos: quadro_interativo_data_${activityId}`);

      // Dispatch the quadro-interativo-auto-build event
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
    // This replicates the syncToViewModal function from EditActivityModal
    const viewSyncData = {
      title: formData.title,
      description: formData.description,
      customFields: {
        ...formData
      },
      generatedContent: result,
      formData,
      lastUpdate: new Date().toISOString()
    };

    // Save to activity storage key
    const activityStorageKey = `activity_${activityId}`;
    localStorage.setItem(activityStorageKey, JSON.stringify({
      ...viewSyncData,
      lastSync: new Date().toISOString()
    }));

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
