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

          // Verificar se a atividade já foi construída
          const constructedData = localStorage.getItem(`generated_content_${activity.id}`);
          const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
          const isBuilt = !!constructedData || !!constructedActivities[activity.id];

          // Preparar campos personalizados baseados no tipo de atividade
          const customFields = {
            disciplina: activity.disciplina || activity.subject || 'Matemática',
            nivel: activity.nivel || activity.level || 'Ensino Médio',
            duracao: activity.duracao || activity.duration || '50 minutos',
            objetivo: activity.objetivo || activity.objective || activity.description,
            conteudo: activity.conteudo || activity.content || activity.description,
            metodologia: activity.metodologia || activity.methodology || 'Prática',
            recursos: activity.recursos || activity.resources || 'Quadro, computador',
            avaliacao: activity.avaliacao || activity.evaluation || 'Participação e exercícios',
            ...activity.customFields
          };

          return {
            id: activity.id,
            title: activity.title || activity.name || `Atividade ${activity.id}`,
            description: activity.description || activity.summary || 'Atividade do plano de ação',
            progress: isBuilt ? 100 : 0,
            type: activity.type || activity.category || 'default',
            status: isBuilt ? 'completed' : 'draft',
            originalData: activity,
            isBuilt,
            builtAt: isBuilt ? (constructedActivities[activity.id]?.builtAt || new Date().toISOString()) : null,
            customFields
          } as ConstructionActivity;
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