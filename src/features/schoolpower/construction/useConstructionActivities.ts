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
          
          console.log(`🔍 Verificando status de construção para ${activity.id}:`, {
            constructedData: !!constructedData,
            inConstructedActivities: !!constructedActivities[activity.id],
            isBuilt
          });

          // Preparar campos personalizados baseados no tipo de atividade
          const existingCustomFields = activity.customFields || {};
          const customFields = {
            disciplina: existingCustomFields.Disciplina || activity.disciplina || activity.subject || 'Matemática',
            nivel: existingCustomFields['Ano de Escolaridade'] || activity.nivel || activity.level || 'Ensino Médio',
            duracao: existingCustomFields.duracao || activity.duration || '50 minutos',
            objetivo: existingCustomFields.objetivo || activity.objective || activity.description,
            conteudo: existingCustomFields.conteudo || activity.content || activity.description,
            metodologia: existingCustomFields.metodologia || activity.methodology || 'Prática',
            recursos: existingCustomFields.recursos || activity.resources || 'Quadro, computador',
            avaliacao: existingCustomFields.avaliacao || activity.evaluation || 'Participação e exercícios',
            tema: existingCustomFields.Tema || activity.title,
            quantidadeQuestoes: existingCustomFields['Quantidade de Questões'] || '10 questões',
            nivelDificuldade: existingCustomFields['Nível de Dificuldade'] || 'Médio',
            modeloQuestoes: existingCustomFields['Modelo de Questões'] || 'Múltipla escolha e dissertativas',
            fontes: existingCustomFields.Fontes || 'Livro didático',
            ...existingCustomFields
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