import { useState, useEffect } from 'react';
import { ActionPlanItem } from '../actionplan/ActionPlanCard';
import { isActivityRegistered } from '../activities/activityRegistry';

export interface ConstructionActivity {
  id: string;
  title: string;
  description: string;
  progress: number;
  type: string;
  status: 'draft' | 'in-progress' | 'completed';
  originalData?: any;
}

export const useConstructionActivities = (approvedActivities?: any[]) => {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadActivities = async () => {
      console.log('📚 useConstructionActivities: Carregando atividades para construção...', approvedActivities);
      setLoading(true);

      try {
        if (!approvedActivities || approvedActivities.length === 0) {
          console.log('⚠️ Nenhuma atividade aprovada encontrada');
          setActivities([]);
          setLoading(false);
          return;
        }

        const constructionActivities = approvedActivities.map((activity: any) => {
          console.log('🔄 Convertendo atividade:', activity);

          const isRegistered = isActivityRegistered(activity.id);
          console.log(`🎯 Atividade ${activity.id} - Registrada: ${isRegistered}`);

          return {
            id: activity.id,
            title: activity.title,
            description: activity.description,
            progress: 0,
            type: activity.type || 'atividade',
            status: 'draft' as const,
            originalData: activity
          };
        });

        console.log('✅ Atividades de construção criadas:', constructionActivities);
        console.log('📋 IDs das atividades:', constructionActivities.map(a => a.id));

        setActivities(constructionActivities);
      } catch (error) {
        console.error('❌ Erro ao carregar atividades de construção:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [approvedActivities]);

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
    loading,
    updateActivityProgress,
    updateActivityStatus
  };
};