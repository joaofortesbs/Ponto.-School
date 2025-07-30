import { useState, useEffect } from 'react';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { activityRegistry } from '../activities/activityRegistry';
import { autoBuildActivities } from './auto/autoBuildActivities';

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'building' | 'completed' | 'error';
  originalData: ActionPlanItem;
  autoBuilt?: boolean;
}

export function useConstructionActivities(actionPlan: ActionPlanItem[]) {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [isAutoBuilding, setIsAutoBuilding] = useState(false);

  useEffect(() => {
    console.log('📚 useConstructionActivities: Carregando atividades para construção...', actionPlan);

    const constructionActivities = actionPlan.map(item => {
      console.log('🔄 Convertendo atividade:', item);

      // Verifica se a atividade está registrada no registry
      const isRegistered = activityRegistry.hasOwnProperty(item.id);
      console.log(`🎯 Atividade ${item.id} - Registrada: ${isRegistered}`);

      return {
        id: item.id,
        title: item.title,
        description: item.description,
        progress: 0,
        type: item.type || 'atividade',
        status: 'draft' as const,
        originalData: item,
        autoBuilt: false
      };
    });

    console.log('✅ Atividades de construção criadas:', constructionActivities);
    setActivities(constructionActivities);
  }, [actionPlan]);

  // Auto-construção quando plano é aprovado
  useEffect(() => {
    const shouldAutoBuild = actionPlan.length > 0 && 
                           actionPlan.every(item => item.approved) &&
                           !isAutoBuilding &&
                           activities.length > 0 &&
                           activities.some(activity => !activity.autoBuilt);

    if (shouldAutoBuild) {
      console.log('🤖 Iniciando auto-construção de atividades...');
      setIsAutoBuilding(true);

      autoBuildActivities(activities, setActivities)
        .then(() => {
          console.log('✅ Auto-construção concluída com sucesso!');
        })
        .catch((error) => {
          console.error('❌ Erro na auto-construção:', error);
        })
        .finally(() => {
          setIsAutoBuilding(false);
        });
    }
  }, [actionPlan, activities, isAutoBuilding]);

  return { activities, setActivities, isAutoBuilding };
}