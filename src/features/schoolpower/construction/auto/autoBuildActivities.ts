import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { fillActivityModalFields } from '../api/fillActivityModalFields';
import { getActivityDataFromPlan } from '../utils/getActivityDataFromPlan';

export interface AutoBuildProgress {
  total: number;
  completed: number;
  current: string;
  errors: string[];
}

export type AutoBuildCallback = (progress: AutoBuildProgress) => void;

export const autoBuildActivities = async (
  planData: ActionPlanItem[],
  onProgress?: AutoBuildCallback
): Promise<boolean> => {
  console.log('🤖 Iniciando construção automática de atividades:', planData);

  const totalActivities = planData.length;
  let completedActivities = 0;
  const errors: string[] = [];

  const updateProgress = (currentActivity: string) => {
    if (onProgress) {
      onProgress({
        total: totalActivities,
        completed: completedActivities,
        current: currentActivity,
        errors: [...errors]
      });
    }
  };

  for (const activity of planData) {
    try {
      console.log(`🔄 Processando atividade: ${activity.title}`);
      updateProgress(activity.title);

      // Extrair dados da atividade do plano
      const activityData = getActivityDataFromPlan(activity);

      if (!activityData) {
        throw new Error('Dados da atividade não encontrados no plano');
      }

      // Preencher campos do modal automaticamente
      await fillActivityModalFields(activity.id, activityData);

      // Marcar como construída
      markActivityAsBuilt(activity.id);

      completedActivities++;
      console.log(`✅ Atividade construída com EXATA MESMA LÓGICA do EditActivityModal: ${activity.title}`);

      // Salvar no localStorage com as mesmas chaves do sistema manual
      const storageKey = `schoolpower_${activityType}_content`;
      localStorage.setItem(storageKey, JSON.stringify(result.data));

      // Para plano-aula, também salvar com chave específica para visualização
      if (activityType === 'plano-aula') {
        const viewStorageKey = `constructed_plano-aula_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result.data));
        console.log('💾 Auto-build: Dados do plano-aula salvos para visualização:', viewStorageKey);
      }

      // Para flash-cards, também salvar com chave específica para visualização
      if (activityType === 'flash-cards') {
        const viewStorageKey = `constructed_flash-cards_${activity.id}`;
        localStorage.setItem(viewStorageKey, JSON.stringify(result.data));
        console.log('💾 Auto-build: Dados dos flash-cards salvos para visualização:', viewStorageKey);
      }

      // Adicionar à lista de atividades construídas
      let constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '[]');
      if (!constructedActivities.includes(activity.id)) {
        constructedActivities.push(activity.id);
        localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      }

    } catch (error) {
      const errorMessage = `Erro ao construir atividade "${activity.title}": ${error instanceof Error ? error.message : 'Erro desconhecido'}`;
      console.error('❌', errorMessage);
      errors.push(errorMessage);
      completedActivities++; // Incrementa mesmo com erro para manter o progresso
    }
  }

  // Progresso final
  updateProgress('Finalizando...');

  const success = errors.length === 0;
  console.log(success ? '🎉 Todas as atividades foram construídas com sucesso!' : '⚠️ Algumas atividades falharam na construção');

  return success;
};

// Função para marcar atividade como construída (adicionar badge visual)
const markActivityAsBuilt = (activityId: string) => {
  // Dispara evento personalizado para atualizar UI
  const event = new CustomEvent('activityBuilt', { 
    detail: { activityId } 
  });
  window.dispatchEvent(event);
};