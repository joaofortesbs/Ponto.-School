/**
 * AUTO BUILD ACTIVITIES
 * 
 * Sistema de construção automática de atividades que replica EXATAMENTE
 * a mesma lógica do EditActivityModal quando o usuário clica no botão
 * "Gerar Atividade" de dentro do modal de Editar.
 * 
 * FLUXO:
 * 1. Recebe atividades do ChosenActivitiesStore (com campos_preenchidos)
 * 2. Para cada atividade, usa buildActivityFromFormData (mesma lógica do modal)
 * 3. Salva no localStorage com as MESMAS chaves usadas pelo EditActivityModal
 * 4. Dispara eventos para sincronizar com ViewActivityModal
 * 
 * IMPORTANTE: Este arquivo usa buildActivityHelper.ts que replica EXATAMENTE
 * a lógica de handleBuildActivity do EditActivityModal.tsx
 */

import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { buildActivityFromFormData, getConstructedContent } from '../services/buildActivityHelper';
import { generateActivityContent } from '../api/generateActivityContent';
import { getActivityDataFromPlan } from '../utils/getActivityDataFromPlan';
import { ActivityFormData } from '../types/ActivityTypes';
import { useChosenActivitiesStore, ChosenActivity } from '../../interface-chat-producao/stores/ChosenActivitiesStore';

export interface AutoBuildProgress {
  total: number;
  completed: number;
  current: string;
  currentActivityId?: string;
  errors: string[];
  phase: 'preparing' | 'building' | 'finalizing' | 'complete';
}

export type AutoBuildCallback = (progress: AutoBuildProgress) => void;

/**
 * Constrói atividades automaticamente usando a MESMA lógica do EditActivityModal
 * 
 * @param planData - Atividades do plano de ação (formato ActionPlanItem)
 * @param onProgress - Callback para atualizar progresso na UI
 * @returns Promise<boolean> - true se todas as atividades foram construídas com sucesso
 */
export const autoBuildActivities = async (
  planData: ActionPlanItem[],
  onProgress?: AutoBuildCallback
): Promise<boolean> => {
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log('🤖 [AutoBuild] INICIANDO CONSTRUÇÃO AUTOMÁTICA');
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log('🤖 [AutoBuild] Total de atividades:', planData.length);

  const totalActivities = planData.length;
  let completedActivities = 0;
  const errors: string[] = [];

  const updateProgress = (currentActivity: string, phase: AutoBuildProgress['phase'] = 'building', activityId?: string) => {
    if (onProgress) {
      onProgress({
        total: totalActivities,
        completed: completedActivities,
        current: currentActivity,
        currentActivityId: activityId,
        errors: [...errors],
        phase
      });
    }
  };

  updateProgress('Preparando construção automática...', 'preparing');

  for (const activity of planData) {
    const activityType = activity.id;
    const activityId = `${activity.id}_${Date.now()}`;
    
    try {
      console.log(`\n🔄 [AutoBuild] ──────────────────────────────────────`);
      console.log(`🔄 [AutoBuild] Processando: ${activity.title}`);
      console.log(`🔄 [AutoBuild] Tipo: ${activityType}`);
      console.log(`🔄 [AutoBuild] ──────────────────────────────────────`);
      
      updateProgress(`Construindo: ${activity.title}`, 'building', activityId);

      // 1. Extrair dados do formulário do plano de ação
      const formData = getActivityDataFromPlan(activity);

      if (!formData) {
        throw new Error(`Não foi possível extrair dados da atividade "${activity.title}"`);
      }

      console.log('📋 [AutoBuild] FormData extraído:', formData);

      // 2. USAR A MESMA LÓGICA DO EDITACTIVITYMODAL
      // Chamar buildActivityFromFormData que replica exatamente handleBuildActivity
      console.log(`🚀 [AutoBuild] Chamando buildActivityFromFormData (MESMA LÓGICA DO MODAL)`);
      
      const result = await buildActivityFromFormData(
        activityId,
        activityType,
        formData
      );

      if (!result) {
        throw new Error(`buildActivityFromFormData retornou resultado inválido`);
      }

      console.log(`✅ [AutoBuild] Resultado da construção:`, result);

      // 3. Salvar no localStorage com as MESMAS chaves do sistema manual
      // buildActivityFromFormData já salva nas chaves corretas, mas vamos garantir
      const storageKey = `schoolpower_${activityType}_content`;
      localStorage.setItem(storageKey, JSON.stringify(result.data || result));
      console.log(`💾 [AutoBuild] Salvo em: ${storageKey}`);

      // 4. Salvar chave específica para visualização (todos os tipos)
      const viewStorageKey = `constructed_${activityType}_${activityId}`;
      localStorage.setItem(viewStorageKey, JSON.stringify(result.data || result));
      console.log(`💾 [AutoBuild] Salvo para visualização: ${viewStorageKey}`);

      // 5. Salvar também com o activity.id original para compatibilidade
      const originalIdKey = `constructed_${activityType}_${activity.id}`;
      localStorage.setItem(originalIdKey, JSON.stringify(result.data || result));
      console.log(`💾 [AutoBuild] Salvo com ID original: ${originalIdKey}`);

      // 6. Atualizar lista de atividades construídas
      let constructedActivitiesRecord = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      constructedActivitiesRecord[activity.id] = {
        generatedContent: result.data || result,
        timestamp: new Date().toISOString(),
        activityType: activityType,
        autoBuilt: true
      };
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivitiesRecord));

      // 7. Disparar evento de sincronização (mesmo evento do modal)
      window.dispatchEvent(new CustomEvent('activity-data-sync', {
        detail: {
          activityId: activity.id,
          data: {
            ...formData,
            generatedContent: result.data || result,
            lastUpdate: new Date().toISOString(),
            autoBuilt: true
          },
          timestamp: Date.now()
        }
      }));

      // 8. Marcar como construída visualmente
      markActivityAsBuilt(activity.id, activityType);

      completedActivities++;
      console.log(`✅ [AutoBuild] Atividade "${activity.title}" construída com sucesso!`);
      console.log(`✅ [AutoBuild] Progresso: ${completedActivities}/${totalActivities}`);

    } catch (error) {
      const errorMessage = `Erro ao construir "${activity.title}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error(`❌ [AutoBuild] ${errorMessage}`);
      errors.push(errorMessage);
      completedActivities++; // Incrementa mesmo com erro para manter o progresso
    }
  }

  // Progresso final
  updateProgress('Finalizando construção automática...', 'finalizing');

  const success = errors.length === 0;
  
  console.log('\n🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log(success 
    ? '🎉 [AutoBuild] TODAS AS ATIVIDADES CONSTRUÍDAS COM SUCESSO!' 
    : `⚠️ [AutoBuild] ${errors.length} ERRO(S) NA CONSTRUÇÃO`
  );
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════\n');

  updateProgress('Construção automática concluída', 'complete');

  return success;
};

/**
 * Constrói atividades automaticamente a partir do ChosenActivitiesStore
 * Esta é a função principal chamada após gerar_conteudo_atividades
 * 
 * @param chosenActivities - Atividades do ChosenActivitiesStore com campos_preenchidos
 * @param onProgress - Callback para atualizar progresso
 * @returns Promise<boolean>
 */
export const autoBuildFromChosenActivities = async (
  chosenActivities: ChosenActivity[],
  onProgress?: AutoBuildCallback
): Promise<boolean> => {
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log('🤖 [AutoBuild] CONSTRUINDO A PARTIR DO CHOSEN ACTIVITIES STORE');
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log('🤖 [AutoBuild] Total de atividades:', chosenActivities.length);

  const store = useChosenActivitiesStore.getState();
  const totalActivities = chosenActivities.length;
  let completedActivities = 0;
  const errors: string[] = [];

  const updateProgress = (currentActivity: string, phase: AutoBuildProgress['phase'] = 'building', activityId?: string) => {
    if (onProgress) {
      onProgress({
        total: totalActivities,
        completed: completedActivities,
        current: currentActivity,
        currentActivityId: activityId,
        errors: [...errors],
        phase
      });
    }
  };

  updateProgress('Preparando construção automática...', 'preparing');

  for (const activity of chosenActivities) {
    const activityType = activity.tipo;
    const activityId = activity.id;
    
    try {
      console.log(`\n🔄 [AutoBuild] ──────────────────────────────────────`);
      console.log(`🔄 [AutoBuild] Processando: ${activity.titulo}`);
      console.log(`🔄 [AutoBuild] Tipo: ${activityType}`);
      console.log(`🔄 [AutoBuild] ID: ${activityId}`);
      console.log(`🔄 [AutoBuild] Campos preenchidos:`, activity.campos_preenchidos);
      console.log(`🔄 [AutoBuild] ──────────────────────────────────────`);

      // Atualizar status no store
      store.updateActivityStatus(activityId, 'construindo', 10);
      updateProgress(`Construindo: ${activity.titulo}`, 'building', activityId);

      // 1. Preparar formData a partir dos campos_preenchidos e dados_construidos
      const generatedFields = activity.dados_construidos?.generated_fields || {};
      const camposPreenchidos = activity.campos_preenchidos || {};
      
      const formData: ActivityFormData = {
        title: activity.titulo,
        description: generatedFields.description || camposPreenchidos.description || '',
        subject: generatedFields.subject || camposPreenchidos.subject || activity.materia || '',
        theme: generatedFields.theme || camposPreenchidos.theme || activity.titulo,
        schoolYear: generatedFields.schoolYear || camposPreenchidos.schoolYear || '',
        numberOfQuestions: generatedFields.numberOfQuestions || camposPreenchidos.numberOfQuestions || '10',
        difficultyLevel: generatedFields.difficultyLevel || camposPreenchidos.difficultyLevel || activity.nivel_dificuldade || 'Médio',
        questionModel: generatedFields.questionModel || camposPreenchidos.questionModel || 'Múltipla Escolha',
        sources: generatedFields.sources || camposPreenchidos.sources || '',
        objectives: generatedFields.objectives || camposPreenchidos.objectives || '',
        materials: generatedFields.materials || camposPreenchidos.materials || '',
        instructions: generatedFields.instructions || camposPreenchidos.instructions || '',
        evaluation: generatedFields.evaluation || camposPreenchidos.evaluation || '',
        // Campos específicos para cada tipo
        ...generatedFields,
        ...camposPreenchidos
      };

      store.updateActivityProgress(activityId, 30);
      console.log('📋 [AutoBuild] FormData consolidado:', formData);

      // 2. CHAMAR buildActivityFromFormData (MESMA LÓGICA DO MODAL)
      console.log(`🚀 [AutoBuild] Chamando buildActivityFromFormData para ${activityType}`);
      store.updateActivityProgress(activityId, 50);

      const result = await buildActivityFromFormData(
        activityId,
        activityType,
        formData
      );

      store.updateActivityProgress(activityId, 80);

      if (!result) {
        throw new Error(`buildActivityFromFormData retornou resultado inválido`);
      }

      console.log(`✅ [AutoBuild] Conteúdo gerado:`, result);

      // 3. Salvar dados construídos no store
      store.setActivityBuiltData(activityId, {
        ...(result.data || result),
        formData,
        builtAt: new Date().toISOString(),
        autoBuilt: true
      });

      // 4. Marcar como construída visualmente
      markActivityAsBuilt(activityId, activityType);

      completedActivities++;
      console.log(`✅ [AutoBuild] Atividade "${activity.titulo}" construída!`);
      console.log(`✅ [AutoBuild] Progresso: ${completedActivities}/${totalActivities}`);

    } catch (error) {
      const errorMessage = `Erro ao construir "${activity.titulo}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error(`❌ [AutoBuild] ${errorMessage}`);
      errors.push(errorMessage);
      
      // Marcar erro no store
      store.updateActivityStatus(activityId, 'erro', 0, errorMessage);
      
      completedActivities++;
    }
  }

  updateProgress('Finalizando construção automática...', 'finalizing');

  const success = errors.length === 0;
  
  console.log('\n🤖 [AutoBuild] ══════════════════════════════════════════');
  console.log(success 
    ? '🎉 [AutoBuild] TODAS AS ATIVIDADES CONSTRUÍDAS COM SUCESSO!' 
    : `⚠️ [AutoBuild] ${errors.length} ERRO(S) NA CONSTRUÇÃO`
  );
  console.log('🤖 [AutoBuild] ══════════════════════════════════════════\n');

  // Marcar geração de conteúdo como completa no store
  if (success) {
    store.markContentGenerationComplete();
  }

  updateProgress('Construção automática concluída', 'complete');

  return success;
};

/**
 * Marca atividade como construída e dispara eventos para atualizar UI
 */
const markActivityAsBuilt = (activityId: string, activityType: string) => {
  console.log(`🏷️ [AutoBuild] Marcando atividade como construída: ${activityId}`);
  
  // Evento para atualizar badge visual no CardDeConstrucao
  window.dispatchEvent(new CustomEvent('activityBuilt', { 
    detail: { activityId, activityType } 
  }));

  // Evento específico para quadro-interativo (se aplicável)
  if (activityType === 'quadro-interativo') {
    const quadroData = localStorage.getItem(`constructed_${activityType}_${activityId}`);
    if (quadroData) {
      window.dispatchEvent(new CustomEvent('quadro-interativo-auto-build', {
        detail: { activityId, data: JSON.parse(quadroData) }
      }));
    }
  }
};

/**
 * Verifica se uma atividade já foi construída
 */
export const isActivityBuilt = (activityId: string, activityType: string): boolean => {
  const content = getConstructedContent(activityId, activityType);
  return content !== null;
};

/**
 * Obtém dados construídos de uma atividade (para uso no ViewActivityModal)
 */
export const getBuiltActivityData = (activityId: string, activityType: string): any => {
  return getConstructedContent(activityId, activityType);
};
