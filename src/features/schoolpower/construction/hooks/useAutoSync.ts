
import { useEffect, useCallback } from 'react';
import { profileService } from '@/services/profileService';
import activitiesApi from '@/services/activitiesApiService';

export function useAutoSync() {
  const syncActivitiesToNeon = useCallback(async () => {
    try {
      const profile = await profileService.getCurrentUserProfile();
      if (!profile?.id) {
        console.log('⚠️ Usuário não encontrado para sincronização automática');
        return;
      }

      console.log('🔄 Iniciando sincronização automática das atividades...');
      
      // Usar a nova função de sincronização completa
      const results = await activitiesApi.syncAllLocalActivities(profile.id);
      
      if (results.synced > 0) {
        console.log(`✅ Sincronização automática concluída: ${results.synced} atividades sincronizadas`);
        
        // Disparar evento para notificar outros componentes
        window.dispatchEvent(new CustomEvent('activities-synced', {
          detail: { synced: results.synced, errors: results.errors }
        }));
      }
      
      if (results.errors.length > 0) {
        console.warn('⚠️ Alguns erros na sincronização:', results.errors);
      }
      
    } catch (error) {
      console.error('❌ Erro na sincronização automática:', error);
    }
  }, []);

  // Executar sincronização quando o componente monta
  useEffect(() => {
    // Aguardar um pouco para garantir que o perfil está carregado
    const timeoutId = setTimeout(syncActivitiesToNeon, 2000);
    
    return () => clearTimeout(timeoutId);
  }, [syncActivitiesToNeon]);

  // Sincronização periódica (a cada 5 minutos)
  useEffect(() => {
    const intervalId = setInterval(syncActivitiesToNeon, 5 * 60 * 1000);
    
    return () => clearInterval(intervalId);
  }, [syncActivitiesToNeon]);

  return { syncActivitiesToNeon };
}
