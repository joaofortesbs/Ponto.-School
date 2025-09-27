
<old_str>
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

</old_str>
<new_str>
import { useEffect, useCallback, useState } from 'react';
import { profileService } from '@/services/profileService';
import activitiesApi from '@/services/activitiesApiService';

interface SyncStats {
  pending: number;
  synced: number;
  errors: number;
  lastSync: string | null;
}

export function useAutoSync() {
  const [syncStats, setSyncStats] = useState<SyncStats>({
    pending: 0,
    synced: 0,
    errors: 0,
    lastSync: null
  });

  const mapActivityDataForNeon = useCallback((activityId: string, activityData: any, profile: any) => {
    console.log('🗺️ Mapeando dados da atividade para banco Neon:', activityId);
    
    // Sistema de mapeamento por tipo de atividade
    const baseMapping = {
      user_id: profile.id,
      codigo_unico: activitiesApi.generateUniqueCode(),
      tipo: activityId,
      titulo: '',
      descricao: '',
      conteudo: {}
    };

    // Mapeamento específico por tipo de atividade
    switch (activityId) {
      case 'quiz-interativo':
        return {
          ...baseMapping,
          titulo: activityData.title || `Quiz Interativo - ${activityData.theme || 'Sem tema'}`,
          descricao: activityData.description || `Quiz sobre ${activityData.theme || 'temas diversos'}`,
          conteudo: {
            ...activityData,
            questions: activityData.questions || [],
            totalQuestions: activityData.totalQuestions || activityData.questions?.length || 0,
            subject: activityData.subject,
            schoolYear: activityData.schoolYear,
            theme: activityData.theme,
            format: activityData.format || activityData.questionModel,
            difficultyLevel: activityData.difficultyLevel,
            timePerQuestion: activityData.timePerQuestion
          }
        };

      case 'flash-cards':
        return {
          ...baseMapping,
          titulo: activityData.title || `Flash Cards - ${activityData.theme || 'Sem tema'}`,
          descricao: activityData.description || `Flash cards sobre ${activityData.theme || 'temas diversos'}`,
          conteudo: {
            ...activityData,
            cards: activityData.cards || [],
            totalCards: activityData.totalCards || activityData.cards?.length || 0,
            theme: activityData.theme,
            subject: activityData.subject,
            schoolYear: activityData.schoolYear,
            topicos: activityData.topicos
          }
        };

      case 'sequencia-didatica':
        return {
          ...baseMapping,
          titulo: activityData.title || activityData.tituloTemaAssunto || 'Sequência Didática',
          descricao: activityData.description || activityData.objetivosAprendizagem || 'Sequência didática educacional',
          conteudo: {
            ...activityData,
            tituloTemaAssunto: activityData.tituloTemaAssunto,
            anoSerie: activityData.anoSerie,
            disciplina: activityData.disciplina,
            publicoAlvo: activityData.publicoAlvo,
            objetivosAprendizagem: activityData.objetivosAprendizagem,
            quantidadeAulas: activityData.quantidadeAulas,
            quantidadeDiagnosticos: activityData.quantidadeDiagnosticos,
            quantidadeAvaliacoes: activityData.quantidadeAvaliacoes,
            cronograma: activityData.cronograma
          }
        };

      case 'plano-aula':
        return {
          ...baseMapping,
          titulo: activityData.title || `Plano de Aula - ${activityData.theme || 'Sem tema'}`,
          descricao: activityData.description || activityData.objectives || 'Plano de aula educacional',
          conteudo: {
            ...activityData,
            subject: activityData.subject,
            theme: activityData.theme,
            schoolYear: activityData.schoolYear,
            objectives: activityData.objectives,
            materials: activityData.materials,
            instructions: activityData.instructions,
            evaluation: activityData.evaluation,
            timeLimit: activityData.timeLimit
          }
        };

      case 'quadro-interativo':
        return {
          ...baseMapping,
          titulo: activityData.title || `Quadro Interativo - ${activityData.theme || 'Sem tema'}`,
          descricao: activityData.description || activityData.objectives || 'Quadro interativo educacional',
          conteudo: {
            ...activityData,
            subject: activityData.subject,
            schoolYear: activityData.schoolYear,
            theme: activityData.theme,
            objectives: activityData.objectives,
            difficultyLevel: activityData.difficultyLevel,
            quadroInterativoCampoEspecifico: activityData.quadroInterativoCampoEspecifico
          }
        };

      default:
        return {
          ...baseMapping,
          titulo: activityData.title || activityData.titulo || `Atividade ${activityId}`,
          descricao: activityData.description || activityData.descricao || 'Atividade educacional',
          conteudo: activityData
        };
    }
  }, []);

  const syncActivitiesToNeon = useCallback(async (forceSync = false) => {
    try {
      const profile = await profileService.getCurrentUserProfile();
      if (!profile?.id) {
        console.log('⚠️ Usuário não encontrado para sincronização automática');
        return { success: false, error: 'Usuário não encontrado' };
      }

      console.log('🔄 Iniciando sincronização automática avançada...');
      
      // Obter atividades do localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const pendingActivities = [];
      
      // Identificar atividades pendentes de sincronização
      for (const [activityId, activityInfo] of Object.entries(constructedActivities)) {
        const info = activityInfo as any;
        const needsSync = info.isBuilt && 
                         (!info.syncedToNeon || 
                          info.syncStatus === 'error' || 
                          info.syncStatus === 'critical_error' ||
                          forceSync);
        
        if (needsSync) {
          const activityData = localStorage.getItem(`activity_${activityId}`);
          if (activityData) {
            try {
              const parsedData = JSON.parse(activityData);
              pendingActivities.push({ id: activityId, data: parsedData, info });
            } catch (e) {
              console.warn(`⚠️ Erro ao parsear dados da atividade ${activityId}`);
            }
          }
        }
      }

      console.log(`📊 Encontradas ${pendingActivities.length} atividades para sincronização`);

      let synced = 0;
      let errors = 0;
      const syncErrors = [];

      // Processar cada atividade pendente
      for (const { id, data, info } of pendingActivities) {
        try {
          console.log(`🔄 Sincronizando atividade: ${id}`);
          
          // Mapear dados para formato do banco
          const mappedData = mapActivityDataForNeon(id, data, profile);
          console.log(`📋 Dados mapeados para ${id}:`, mappedData);

          // Verificar se já existe no banco
          const existingActivities = await activitiesApi.getUserActivities(profile.id);
          let syncResult;

          if (existingActivities.success && existingActivities.data) {
            const existingActivity = existingActivities.data.find(
              act => act.tipo === id
            );

            if (existingActivity) {
              // Atualizar atividade existente
              syncResult = await activitiesApi.updateActivity(existingActivity.codigo_unico, {
                titulo: mappedData.titulo,
                descricao: mappedData.descricao,
                conteudo: mappedData.conteudo
              });
            } else {
              // Criar nova atividade
              syncResult = await activitiesApi.createActivity(mappedData);
            }
          } else {
            // Criar nova atividade
            syncResult = await activitiesApi.createActivity(mappedData);
          }

          if (syncResult.success) {
            // Marcar como sincronizada
            constructedActivities[id] = {
              ...constructedActivities[id],
              syncedToNeon: true,
              neonActivityId: syncResult.data.codigo_unico || syncResult.data.id,
              neonSyncAt: new Date().toISOString(),
              syncStatus: 'success',
              syncAttempts: (info.syncAttempts || 0) + 1
            };
            synced++;
            console.log(`✅ Atividade ${id} sincronizada com sucesso`);
          } else {
            throw new Error(syncResult.error || 'Erro desconhecido na sincronização');
          }

        } catch (error) {
          console.error(`❌ Erro ao sincronizar atividade ${id}:`, error);
          
          // Marcar erro com retry
          const attempts = (info.syncAttempts || 0) + 1;
          constructedActivities[id] = {
            ...constructedActivities[id],
            syncedToNeon: false,
            syncError: error.message,
            lastSyncAttempt: new Date().toISOString(),
            syncStatus: attempts >= 5 ? 'critical_error' : 'error',
            syncAttempts: attempts
          };
          
          syncErrors.push(`${id}: ${error.message}`);
          errors++;
        }
      }

      // Salvar estado atualizado
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));

      // Atualizar estatísticas
      setSyncStats({
        pending: pendingActivities.length - synced,
        synced,
        errors,
        lastSync: new Date().toISOString()
      });

      if (synced > 0) {
        console.log(`✅ Sincronização concluída: ${synced} atividades sincronizadas`);
        
        // Disparar evento para notificar componentes
        window.dispatchEvent(new CustomEvent('activities-synced', {
          detail: { synced, errors: syncErrors, stats: syncStats }
        }));
      }

      if (errors > 0) {
        console.warn(`⚠️ ${errors} erros na sincronização:`, syncErrors);
      }

      return { success: true, synced, errors, syncErrors };
      
    } catch (error) {
      console.error('❌ Erro crítico na sincronização automática:', error);
      return { success: false, error: error.message };
    }
  }, [mapActivityDataForNeon]);

  // Executar sincronização inicial
  useEffect(() => {
    const timeoutId = setTimeout(() => syncActivitiesToNeon(), 3000);
    return () => clearTimeout(timeoutId);
  }, [syncActivitiesToNeon]);

  // Sincronização periódica (a cada 2 minutos)
  useEffect(() => {
    const intervalId = setInterval(() => syncActivitiesToNeon(), 2 * 60 * 1000);
    return () => clearInterval(intervalId);
  }, [syncActivitiesToNeon]);

  // Listener para sincronização forçada
  useEffect(() => {
    const handleForceSync = () => {
      console.log('🔄 Sincronização forçada solicitada');
      syncActivitiesToNeon(true);
    };

    window.addEventListener('force-sync-activities', handleForceSync);
    return () => window.removeEventListener('force-sync-activities', handleForceSync);
  }, [syncActivitiesToNeon]);

  return { 
    syncActivitiesToNeon,
    syncStats,
    mapActivityDataForNeon
  };
}

</new_str>
