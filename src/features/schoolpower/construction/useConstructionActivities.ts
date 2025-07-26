
import { useState, useEffect } from 'react';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed';
}

export const useConstructionActivities = (actionPlan?: ActionPlanItem[]) => {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      console.log('📚 Carregando atividades para construção...');
      setIsLoading(true);

      try {
        // Filtrar apenas as atividades aprovadas do actionPlan
        const approvedActivities = actionPlan?.filter(item => item.approved) || [];
        
        // Converter ActionPlanItems para ConstructionActivities
        const constructionActivities: ConstructionActivity[] = approvedActivities.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description,
          progress: 0, // Progresso inicial sempre 0
          type: item.type || 'Atividade', // Usar o tipo se disponível, senão usar 'Atividade'
          status: 'draft' as const // Status inicial sempre 'draft'
        }));

        console.log('✅ Atividades carregadas:', constructionActivities);
        setActivities(constructionActivities);
      } catch (error) {
        console.error('❌ Erro ao carregar atividades:', error);
        setActivities([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadActivities();
  }, [actionPlan]);

  const updateActivityProgress = (id: string, progress: number) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, progress }
          : activity
      )
    );
  };

  const updateActivityStatus = (id: string, status: ConstructionActivity['status']) => {
    setActivities(prev => 
      prev.map(activity => 
        activity.id === id 
          ? { ...activity, status }
          : activity
      )
    );
  };

  return {
    activities,
    isLoading,
    updateActivityProgress,
    updateActivityStatus
  };
};
