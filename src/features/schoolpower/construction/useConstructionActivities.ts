import { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';

interface UseConstructionActivitiesReturn {
  activities: ConstructionActivity[];
  loading: boolean;
  refreshActivities: () => void;
}

export function useConstructionActivities(approvedActivities: any[]): UseConstructionActivitiesReturn {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);

  const convertToConstructionActivity = (activity: any): ConstructionActivity => {
    console.log('🔄 Convertendo atividade:', activity);

    // Verificar se atividade está registrada como construída
    const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
    const isRegisteredAsBuilt = constructedActivities[activity.id];

    // Verificar se existe conteúdo salvo
    const savedContent = localStorage.getItem(`activity_${activity.id}`);
    const hasGeneratedContent = savedContent !== null;

    const isBuilt = isRegisteredAsBuilt?.isBuilt || hasGeneratedContent;

    console.log(`🎯 Atividade ${activity.id} - Registrada: ${!!isRegisteredAsBuilt}, Content: ${hasGeneratedContent}, isBuilt: ${isBuilt}`);
    console.log(`🔍 Verificando status de construção para ${activity.id}:`, {
      constructedData: !!savedContent,
      inConstructedActivities: !!isRegisteredAsBuilt,
      isBuilt
    });

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.id, // usar id como tipo para compatibilidade
      customFields: activity.customFields || {},
      approved: activity.approved || false,
      isTrilhasEligible: activity.isTrilhasEligible || false,
      isBuilt: isBuilt,
      builtAt: isRegisteredAsBuilt?.builtAt || null,
      progress: isBuilt ? 100 : 0,
      status: isBuilt ? 'completed' : 'pending'
    };
  };

  const loadActivities = () => {
    console.log('📚 useConstructionActivities: Carregando atividades para construção...', approvedActivities);

    setLoading(true);

    try {
      if (!approvedActivities || approvedActivities.length === 0) {
        console.log('⚠️ Nenhuma atividade aprovada fornecida');
        setActivities([]);
        return;
      }

      const constructionActivities = approvedActivities.map(convertToConstructionActivity);

      console.log('✅ Atividades de construção convertidas:', constructionActivities);
      setActivities(constructionActivities);

    } catch (error) {
      console.error('❌ Erro ao carregar atividades de construção:', error);
      setActivities([]);
    } finally {
      setLoading(false);
    }
  };

  const refreshActivities = () => {
    console.log('🔄 Refresh manual das atividades de construção');
    loadActivities();
  };

  useEffect(() => {
    loadActivities();
  }, [approvedActivities]);

  // Listener para mudanças no localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      console.log('📦 Mudança detectada no localStorage, atualizando atividades');
      loadActivities();
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return {
    activities,
    loading,
    refreshActivities
  };
}