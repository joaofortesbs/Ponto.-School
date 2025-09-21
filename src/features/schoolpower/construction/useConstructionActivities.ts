import { useState, useEffect } from 'react';
import { ConstructionActivity } from './types';
import { useActivities } from '@/hooks/useActivities'; // Importando do hooks correto

interface UseConstructionActivitiesReturn {
  activities: ConstructionActivity[];
  loading: boolean;
  refreshActivities: () => void;
  updateActivity: (id: string, updates: Partial<ConstructionActivity>) => Promise<void>;
}

export function useConstructionActivities(approvedActivities: any[]): UseConstructionActivitiesReturn {
  const [activities, setActivities] = useState<ConstructionActivity[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Obter userId do localStorage
  const userId = localStorage.getItem('user_id') || localStorage.getItem('current_user_id') || 'anonymous';
  const { saveActivity } = useActivities(userId); // Importando saveActivity de useActivities

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

  const updateActivity = async (id: string, updates: Partial<ConstructionActivity>) => {
    setActivities(prev =>
      prev.map(activity => {
        const updatedActivity = activity.id === id ? { ...activity, ...updates } : activity;

        // Auto-save quando atividade for concluída
        if (updatedActivity.id === id && updates.status === 'completed') {
          handleAutoSaveActivity(updatedActivity);
        }

        return updatedActivity;
      })
    );
  };

  const handleAutoSaveActivity = async (activity: ConstructionActivity) => {
    try {
      console.log('🔄 Auto-salvando atividade construída via hook:', activity.id);

      const activityCode = `sp-hook-${activity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('current_user_id') || 
                     localStorage.getItem('neon_user_id') ||
                     'anonymous';

      // Buscar dados construídos do localStorage
      const constructedData = localStorage.getItem(`activity_${activity.id}`);
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityConstructionData = constructedActivities[activity.id];
      
      let generatedContent = {};
      if (constructedData) {
        try {
          generatedContent = JSON.parse(constructedData);
        } catch (e) {
          console.warn('⚠️ Erro ao fazer parse do conteúdo construído:', e);
        }
      }

      const activityData = {
        user_id: userId,
        activity_code: activityCode,
        type: activity.type,
        title: activity.title,
        content: {
          // Dados originais da atividade
          originalData: activity.customFields || {},
          
          // Conteúdo gerado pela IA
          generatedContent: generatedContent,
          
          // Dados de construção
          constructionData: activityConstructionData || {},
          
          // Metadados do School Power
          schoolPowerMetadata: {
            constructedAt: new Date().toISOString(),
            autoSaved: true,
            activityId: activity.id,
            progress: activity.progress,
            status: activity.status,
            description: activity.description,
            isBuilt: true,
            source: 'schoolpower_hook'
          }
        }
      };

      console.log('💾 Salvando atividade via hook no Neon:', {
        activityCode,
        title: activity.title,
        type: activity.type,
        hasGeneratedContent: !!generatedContent,
        hasOriginalData: !!activity.customFields
      });

      const result = await saveActivity(activityData);

      if (result && result.success) {
        console.log('✅ Atividade salva automaticamente no Neon:', activityCode);

        // Armazenar referência local
        const savedActivityRef = {
          activityCode,
          savedAt: new Date().toISOString(),
          title: activity.title,
          type: activity.type,
          activityId: activity.id,
          neonSaved: true,
          source: 'hook'
        };

        localStorage.setItem(`neon_hook_saved_${activity.id}`, JSON.stringify(savedActivityRef));

        // Atualizar lista de atividades salvas
        const savedActivities = JSON.parse(localStorage.getItem('school_power_saved_activities') || '[]');
        
        // Evitar duplicatas
        const existingIndex = savedActivities.findIndex((item: any) => item.activityId === activity.id);
        if (existingIndex >= 0) {
          savedActivities[existingIndex] = savedActivityRef;
        } else {
          savedActivities.push(savedActivityRef);
        }
        
        localStorage.setItem('school_power_saved_activities', JSON.stringify(savedActivities));

      } else {
        console.error('❌ Falha ao auto-salvar atividade:', result?.error);
      }

    } catch (error) {
      console.error('❌ Erro no auto-save via hook:', error);
    }
  };


  return {
    activities,
    loading,
    refreshActivities,
    updateActivity
  };
}