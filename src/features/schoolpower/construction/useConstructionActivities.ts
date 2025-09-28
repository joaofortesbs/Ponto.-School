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
      isBuilt: isBuilt,
      builtAt: localStorageBuiltAt || new Date().toISOString(),
      progress: isBuilt ? 100 : 0,
      status: isBuilt ? 'completed' : 'pending',
      // Propriedades obrigatórias adicionais
      categoryId: activity.id,
      categoryName: activity.title,
      icon: activity.id,
      tags: [],
      difficulty: 'Médio',
      estimatedTime: '30 min'
    };
  };

  // Função para sincronizar atividade do localStorage para o banco Neon
  const syncActivityToNeon = async (activityId: string, activityData: any) => {
    try {
      const profile = await profileService.getCurrentUserProfile();
      if (!profile?.id) {
        console.warn('⚠️ Perfil do usuário não encontrado para sincronização');
        return false;
      }

      console.log('🔄 Sincronizando atividade com banco Neon:', activityId);

      // Verificar se já existe no banco
      const existingActivities = await activitiesApi.getUserActivities(profile.id);
      
      if (existingActivities.success && existingActivities.data) {
        const existingActivity = existingActivities.data.find(
          activity => activity.tipo === activityId
        );

        if (existingActivity) {
          // Atualizar atividade existente
          const updateResult = await activitiesApi.updateActivity(existingActivity.codigo_unico, {
            titulo: activityData.title || activityData.titulo || `Atividade ${activityId}`,
            descricao: activityData.description || activityData.descricao || 'Atividade criada na plataforma',
            conteudo: activityData
          });

          if (updateResult.success) {
            console.log('✅ Atividade atualizada no banco Neon:', activityId);
            return true;
          }
        } else {
          // Criar nova atividade
          const createResult = await activitiesApi.migrateFromLocalStorage(
            profile.id,
            activityData,
            activityId
          );

          if (createResult.success) {
            console.log('✅ Atividade criada no banco Neon:', activityId);
            return true;
          }
        }
      }

      return false;
    } catch (error) {
      console.error('❌ Erro ao sincronizar com banco Neon:', error);
      return false;
    }
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

      // Sincronizar atividades construídas com o banco Neon
      for (const activity of constructionActivities) {
        if (activity.isBuilt) {
          // Buscar dados da atividade no localStorage
          const activityData = localStorage.getItem(`activity_${activity.id}`);
          if (activityData) {
            try {
              const parsedData = JSON.parse(activityData);
              await syncActivityToNeon(activity.id, parsedData);
            } catch (error) {
              console.error('❌ Erro ao parsear dados da atividade:', error);
            }
          }
        }
      }

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