
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
      console.log(`✅ Atividade construída: ${activity.title}`);
      
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
import { ConstructionActivity } from '../useConstructionActivities';
import { generateActivityByType } from '../generationStrategies/generateActivityByType';
import { modalBinderEngine } from '../modalBinder/modalBinderEngine';

/**
 * Sistema de auto-construção de atividades
 * Constrói automaticamente todas as atividades aprovadas sem intervenção do usuário
 */
export async function autoBuildActivities(
  activities: ConstructionActivity[],
  setActivities: React.Dispatch<React.SetStateAction<ConstructionActivity[]>>
): Promise<void> {
  console.log('🤖 AutoBuildActivities: Iniciando construção automática...');
  console.log('📋 Atividades para construir:', activities.length);

  // Processa cada atividade sequencialmente para evitar sobrecarga
  for (const activity of activities) {
    if (activity.autoBuilt) {
      console.log(`⏭️ Atividade ${activity.id} já foi construída automaticamente`);
      continue;
    }

    try {
      console.log(`🔧 Construindo automaticamente: ${activity.title}`);
      
      // Atualiza status para "building"
      setActivities(prev => prev.map(item => 
        item.id === activity.id 
          ? { ...item, status: 'building', progress: 10 }
          : item
      ));

      // Simula preenchimento de dados da atividade
      await simulateActivityDataFill(activity);
      
      // Atualiza progresso
      setActivities(prev => prev.map(item => 
        item.id === activity.id 
          ? { ...item, progress: 50 }
          : item
      ));

      // Gera conteúdo da atividade
      const generatedContent = await generateActivityByType(activity.id, activity.originalData);
      
      // Atualiza progresso
      setActivities(prev => prev.map(item => 
        item.id === activity.id 
          ? { ...item, progress: 80 }
          : item
      ));

      // Simula processamento final
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Marca como concluída
      setActivities(prev => prev.map(item => 
        item.id === activity.id 
          ? { 
              ...item, 
              status: 'completed', 
              progress: 100,
              autoBuilt: true
            }
          : item
      ));

      console.log(`✅ Atividade ${activity.title} construída com sucesso!`);

    } catch (error) {
      console.error(`❌ Erro ao construir atividade ${activity.title}:`, error);
      
      // Marca como erro
      setActivities(prev => prev.map(item => 
        item.id === activity.id 
          ? { ...item, status: 'error', progress: 0 }
          : item
      ));
    }

    // Pequena pausa entre construções para melhor UX
    await new Promise(resolve => setTimeout(resolve, 500));
  }

  console.log('🎉 Auto-construção de todas as atividades concluída!');
}

/**
 * Simula o preenchimento automático dos dados da atividade
 */
async function simulateActivityDataFill(activity: ConstructionActivity): Promise<void> {
  console.log(`📝 Preenchendo dados automaticamente para: ${activity.title}`);
  
  try {
    // Usa o modal binder engine para preencher os campos automaticamente
    const fieldsData = activity.originalData.customFields || {};
    
    // Simula o preenchimento dos campos como se fosse feito manualmente
    await modalBinderEngine.fillActivityFields(activity.id, fieldsData);
    
    console.log(`✅ Dados preenchidos automaticamente para: ${activity.title}`);
  } catch (error) {
    console.warn(`⚠️ Falha no preenchimento automático para ${activity.title}:`, error);
    // Continua mesmo se houver erro no preenchimento
  }
}

/**
 * Verifica se uma atividade está pronta para auto-construção
 */
export function isActivityReadyForAutoBuild(activity: ConstructionActivity): boolean {
  return (
    activity.originalData.approved === true &&
    !activity.autoBuilt &&
    activity.status === 'draft'
  );
}

/**
 * Obtém estatísticas da auto-construção
 */
export function getAutoBuildStats(activities: ConstructionActivity[]) {
  const total = activities.length;
  const autoBuilt = activities.filter(a => a.autoBuilt).length;
  const building = activities.filter(a => a.status === 'building').length;
  const completed = activities.filter(a => a.status === 'completed').length;
  const errors = activities.filter(a => a.status === 'error').length;

  return {
    total,
    autoBuilt,
    building,
    completed,
    errors,
    progress: total > 0 ? Math.round((completed / total) * 100) : 0
  };
}
