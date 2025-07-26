
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

        // Converter as atividades aprovadas para o formato de construção
        const constructionActivities: ConstructionActivity[] = approvedActivities.map(activity => {
          console.log('🔄 Convertendo atividade:', activity);
          
          return {
            id: activity.id,
            title: activity.title || 'Atividade',
            description: activity.description || 'Descrição da atividade',
            progress: 0, // Progresso inicial sempre 0
            type: activity.type || 'Atividade', // Usar o tipo se disponível
            status: 'draft' as const // Status inicial sempre 'draft'
          };
        });

        console.log('✅ Atividades de construção criadas:', constructionActivities);
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
