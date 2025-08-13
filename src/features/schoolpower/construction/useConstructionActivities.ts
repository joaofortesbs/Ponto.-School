import { useState, useEffect, useCallback } from 'react';
import { ConstructionActivity } from './types';

interface UseConstructionActivitiesReturn {
  activities: ConstructionActivity[];
  loading: boolean;
  refreshActivities: () => void;
  buildAllActivities: () => Promise<void>;
  buildingStatus: {
    isBuilding: boolean;
    progress: number;
    currentStep: string;
  };
}

export function useConstructionActivities(approvedActivities: any[], toast: (options: any) => void): UseConstructionActivitiesReturn {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [buildingStatus, setBuildingStatus] = useState({
    isBuilding: false,
    progress: 0,
    currentStep: '',
  });

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

  const buildAllActivities = useCallback(async () => {
    if (approvedActivities.length === 0) {
      console.warn('⚠️ [BUILD_ALL] Nenhuma atividade aprovada para construir');
      return;
    }

    setBuildingStatus({
      isBuilding: true,
      progress: 0,
      currentStep: 'Iniciando construção automática...'
    });

    try {
      console.log('🏗️ [BUILD_ALL] Iniciando construção automática de todas as atividades');
      console.log('📊 [BUILD_ALL] Atividades a serem construídas:', approvedActivities);

      // Importar o serviço de construção automática
      const { autoBuildActivities } = await import('./auto/autoBuildActivities');

      for (let i = 0; i < approvedActivities.length; i++) {
        const activity = approvedActivities[i];
        const progress = Math.round(((i + 1) / approvedActivities.length) * 100);

        setBuildingStatus({
          isBuilding: true,
          progress,
          currentStep: `Construindo ${activity.title}...`
        });

        console.log(`🔨 [BUILD_ALL] Construindo atividade ${i + 1}/${approvedActivities.length}:`, activity);

        try {
          // Construir usando o sistema automático
          const builtActivities = await autoBuildActivities([activity]);

          if (builtActivities && builtActivities.length > 0) {
            console.log(`✅ [BUILD_ALL] Atividade construída com sucesso: ${activity.title}`);

            // Salvar no localStorage para compatibilidade
            const builtActivity = builtActivities[0];
            const storageKey = `constructed_${activity.id}_${builtActivity.activityId || Date.now()}`;
            localStorage.setItem(storageKey, JSON.stringify(builtActivity));

            console.log(`💾 [BUILD_ALL] Atividade salva no localStorage: ${storageKey}`);
          } else {
            console.warn(`⚠️ [BUILD_ALL] Nenhuma atividade foi construída para: ${activity.title}`);
          }

        } catch (activityError) {
          console.error(`❌ [BUILD_ALL] Erro ao construir atividade específica ${activity.title}:`, activityError);
          // Continuar com as próximas atividades mesmo se uma falhar
        }
      }

      setBuildingStatus({
        isBuilding: false,
        progress: 100,
        currentStep: 'Concluído!'
      });

      toast({
        title: "Construção Concluída",
        description: `Processo de construção automática finalizado!`,
      });

      // Recarregar a página para mostrar as atividades construídas
      setTimeout(() => {
        window.location.reload();
      }, 1500);

    } catch (error) {
      console.error('❌ [BUILD_ALL] Erro na construção automática:', error);
      console.error('🔍 [BUILD_ALL] Stack trace:', error.stack);

      setBuildingStatus({
        isBuilding: false,
        progress: 0,
        currentStep: 'Erro na construção'
      });

      toast({
        title: "Erro na Construção",
        description: `Erro durante a construção automática: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [approvedActivities, toast]);


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
    refreshActivities,
    buildAllActivities,
    buildingStatus,
  };
}