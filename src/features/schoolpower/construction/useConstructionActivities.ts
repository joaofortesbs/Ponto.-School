
import { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';

export function useConstructionActivities(approvedActivities: any[] = []) {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simular carregamento dos dados
    const loadActivities = async () => {
      setLoading(true);
      
      try {
        // Converter atividades aprovadas para formato de construção
        const constructionActivities: ConstructionActivity[] = approvedActivities.map((activity, index) => ({
          id: activity.id || `activity-${index}`,
          title: activity.personalizedTitle || activity.title || 'Atividade',
          description: activity.personalizedDescription || activity.description || 'Descrição da atividade',
          status: 'pending' as const,
          progress: 0, // Iniciar com 0% de progresso
          type: activity.type || 'general'
        }));

        // Simular delay de carregamento
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        setActivities(constructionActivities);
      } catch (error) {
        console.error('Erro ao carregar atividades de construção:', error);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    if (approvedActivities.length > 0) {
      loadActivities();
    } else {
      setLoading(false);
    }
  }, [approvedActivities]);

  const updateActivityProgress = (id: string, progress: number) => {
    setActivities(prev => prev.map(activity => 
      activity.id === id 
        ? { ...activity, progress, status: progress === 100 ? 'completed' : 'in_progress' }
        : activity
    ));
  };

  const updateActivityStatus = (id: string, status: ConstructionActivity['status']) => {
    setActivities(prev => prev.map(activity => 
      activity.id === id ? { ...activity, status } : activity
    ));
  };

  return {
    activities,
    loading,
    updateActivityProgress,
    updateActivityStatus
  };
}
