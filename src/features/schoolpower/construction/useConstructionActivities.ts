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

      // Verificar se a atividade tem dados suficientes para salvar
      const savedActivityData = localStorage.getItem(`activity_${activity.id}`);
      if (!savedActivityData) {
        console.warn('⚠️ Dados da atividade não encontrados no localStorage');
        return;
      }

      const parsedActivityData = JSON.parse(savedActivityData);
      const activityCode = `sp-${activity.type}-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
      const userId = localStorage.getItem('user_id') || 
                     localStorage.getItem('current_user_id') || 
                     localStorage.getItem('neon_user_id') ||
                     'anonymous';

      console.log('👤 Usuário identificado para salvamento:', userId);

      const activityData = {
        user_id: userId,
        activity_code: activityCode,
        type: activity.type,
        title: activity.title,
        content: {
          ...parsedActivityData,
          ...activity.originalData,
          constructedAt: new Date().toISOString(),
          schoolPowerGenerated: true,
          activityId: activity.id,
          progress: activity.progress,
          status: activity.status,
          description: activity.description,
          autoSaved: true,
          hookSaved: true
        }
      };

      console.log('📋 Dados preparados para salvamento:', {
        user_id: activityData.user_id,
        activity_code: activityData.activity_code,
        type: activityData.type,
        title: activityData.title,
        hasContent: !!activityData.content
      });

      const result = await saveActivity(activityData);

      if (result) {
        console.log('✅ Atividade salva automaticamente no Neon:', activityCode);

        // Armazenar referência local
        const savedActivityRef = {
          activityCode,
          savedAt: new Date().toISOString(),
          title: activity.title,
          type: activity.type,
          neonSaved: true,
          userId: userId,
          activityId: activity.id
        };

        localStorage.setItem(`constructed_${activity.id}`, JSON.stringify(savedActivityRef));

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

        // Mostrar notificação de sucesso
        this.showSaveSuccessNotification(activity.title);

      } else {
        console.error('❌ Falha ao auto-salvar atividade - resultado falso');
        throw new Error('Falha no salvamento');
      }

    } catch (error) {
      console.error('❌ Erro no auto-save via hook:', error);
      
      // Fallback: salvar no localStorage para sincronização posterior
      const fallbackData = {
        activityId: activity.id,
        title: activity.title,
        type: activity.type,
        needsSync: true,
        errorAt: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
      
      const pendingSync = JSON.parse(localStorage.getItem('pending_neon_sync') || '[]');
      pendingSync.push(fallbackData);
      localStorage.setItem('pending_neon_sync', JSON.stringify(pendingSync));
      
      console.log('💾 Atividade adicionada à fila de sincronização');
    }
  };

  // Método auxiliar para mostrar notificação de sucesso
  const showSaveSuccessNotification = (title: string) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-slide-in';
    notification.innerHTML = `
      <div class="flex items-center gap-2">
        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
          <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"></path>
        </svg>
        <span class="font-medium">${title}</span>
        <span class="text-green-200">salva no Neon!</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (document.body.contains(notification)) {
        notification.classList.add('animate-fade-out');
        setTimeout(() => {
          if (document.body.contains(notification)) {
            document.body.removeChild(notification);
          }
        }, 300);
      }
    }, 4000);
  };


  return {
    activities,
    loading,
    refreshActivities,
    updateActivity
  };
}