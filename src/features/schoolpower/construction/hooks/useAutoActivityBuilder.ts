
import { useState, useCallback } from 'react';
import { ActionPlanItem } from '../../actionplan/ActionPlanCard';
import { autoBuildActivities, AutoBuildProgress } from '../auto/autoBuildActivities';

export const useAutoActivityBuilder = () => {
  const [isBuilding, setIsBuilding] = useState(false);
  const [progress, setProgress] = useState<AutoBuildProgress | null>(null);
  const [builtActivities, setBuiltActivities] = useState<Set<string>>(new Set());

  const buildActivities = useCallback(async (planData: ActionPlanItem[]): Promise<boolean> => {
    if (isBuilding) {
      console.warn('⚠️ Construção já em andamento');
      return false;
    }

    setIsBuilding(true);
    setProgress({
      total: planData.length,
      completed: 0,
      current: 'Iniciando...',
      errors: []
    });

    try {
      const success = await autoBuildActivities(planData, (newProgress) => {
        setProgress(newProgress);
      });

      // Adicionar atividades construídas ao conjunto
      const newBuiltActivities = new Set(builtActivities);
      planData.forEach(activity => {
        newBuiltActivities.add(activity.id);
      });
      setBuiltActivities(newBuiltActivities);

      return success;
    } catch (error) {
      console.error('❌ Erro durante construção automática:', error);
      return false;
    } finally {
      setIsBuilding(false);
      // Limpar progresso após um delay
      setTimeout(() => setProgress(null), 3000);
    }
  }, [isBuilding, builtActivities]);

  const isActivityBuilt = useCallback((activityId: string): boolean => {
    return builtActivities.has(activityId) || 
           localStorage.getItem(`generated_content_${activityId}`) !== null;
  }, [builtActivities]);

  const resetBuildStatus = useCallback(() => {
    setBuiltActivities(new Set());
    setProgress(null);
  }, []);

  return {
    buildActivities,
    isBuilding,
    progress,
    isActivityBuilt,
    resetBuildStatus
  };
};
