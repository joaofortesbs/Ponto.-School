import { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';
import activitiesApi from '@/services/activitiesApiService';
import { profileService } from '@/services/profileService';

interface UseConstructionActivitiesReturn {
  activities: ConstructionActivity[];
  loading: boolean;
  refreshActivities: () => void;
}

export function useConstructionActivities(approvedActivities: any[]): UseConstructionActivitiesReturn {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [builtActivitiesCache, setBuiltActivitiesCache] = useState<Set<string>>(new Set());

  // Cache para atividades construídas do banco de dados
  const loadBuiltActivitiesCache = async () => {
    try {
      const profile = await profileService.getCurrentUserProfile();
      if (profile?.id) {
        const apiResponse = await activitiesApi.getUserActivities(profile.id);
        if (apiResponse.success && apiResponse.data) {
          const builtActivityTypes = new Set(apiResponse.data.map(activity => activity.tipo));
          setBuiltActivitiesCache(builtActivityTypes);
          console.log('📦 Cache de atividades construídas carregado:', builtActivityTypes);
        }
      }
    } catch (error) {
      console.error('❌ Erro ao carregar cache de atividades construídas:', error);
    }
  };

  const convertToConstructionActivity = async (activity: any): Promise<ConstructionActivity> => {
    console.log('🔄 Convertendo atividade:', activity);

    // Verificar se atividade está no banco de dados
    const isBuiltInDatabase = builtActivitiesCache.has(activity.id);

    // Fallback: verificar localStorage se não encontrado no banco
    let isBuiltInLocalStorage = false;
    let localStorageBuiltAt = null;

    if (!isBuiltInDatabase) {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const isRegisteredAsBuilt = constructedActivities[activity.id];
      const savedContent = localStorage.getItem(`activity_${activity.id}`);
      
      isBuiltInLocalStorage = isRegisteredAsBuilt?.isBuilt && savedContent !== null;
      localStorageBuiltAt = isRegisteredAsBuilt?.builtAt;
    }

    const isBuilt = isBuiltInDatabase || isBuiltInLocalStorage;

    console.log(`🎯 Atividade ${activity.id} - Banco: ${isBuiltInDatabase}, localStorage: ${isBuiltInLocalStorage}, isBuilt: ${isBuilt}`);

    return {
      id: activity.id,
      title: activity.title,
      description: activity.description,
      type: activity.id, // usar id como tipo para compatibilidade
      customFields: activity.customFields || {},
      approved: activity.approved || false,
      isTrilhasEligible: activity.isTrilhasEligible || false,
      isBuilt: isBuilt,
      builtAt: localStorageBuiltAt || new Date().toISOString(),
      progress: isBuilt ? 100 : 0,
      status: isBuilt ? 'completed' : 'pending'
    };
  };

  const loadActivities = async () => {
    console.log('📚 useConstructionActivities: Carregando atividades para construção...', approvedActivities);

    setLoading(true);

    try {
      if (!approvedActivities || approvedActivities.length === 0) {
        console.log('⚠️ Nenhuma atividade aprovada fornecida');
        setActivities([]);
        return;
      }

      // Carregar cache de atividades construídas primeiro
      await loadBuiltActivitiesCache();

      // Converter todas as atividades usando o cache carregado
      const constructionActivities = await Promise.all(
        approvedActivities.map(activity => convertToConstructionActivity(activity))
      );

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