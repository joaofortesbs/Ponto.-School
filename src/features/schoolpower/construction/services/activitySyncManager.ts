
export interface SyncResult {
  success: boolean;
  activityId: string;
  neonId?: string;
  error?: string;
  attempt: number;
}

export interface SyncManagerStats {
  totalActivities: number;
  syncedActivities: number;
  pendingActivities: number;
  failedActivities: number;
  lastSyncTime: string | null;
}

class ActivitySyncManager {
  private maxRetries = 5;
  private syncQueue: Map<string, any> = new Map();
  private syncStats: SyncManagerStats = {
    totalActivities: 0,
    syncedActivities: 0,
    pendingActivities: 0,
    failedActivities: 0,
    lastSyncTime: null
  };

  /**
   * Adicionar atividade à fila de sincronização
   */
  queueActivity(activityId: string, activityData: any): void {
    console.log('📥 Adicionando atividade à fila de sincronização:', activityId);
    this.syncQueue.set(activityId, {
      data: activityData,
      attempts: 0,
      queuedAt: new Date().toISOString()
    });
    this.updateStats();
  }

  /**
   * Processar fila de sincronização
   */
  async processSyncQueue(): Promise<SyncResult[]> {
    const results: SyncResult[] = [];
    console.log('🔄 Processando fila de sincronização:', this.syncQueue.size, 'atividades');

    for (const [activityId, queueItem] of this.syncQueue.entries()) {
      try {
        const result = await this.syncSingleActivity(activityId, queueItem);
        results.push(result);

        if (result.success) {
          this.syncQueue.delete(activityId);
          this.syncStats.syncedActivities++;
        } else if (queueItem.attempts >= this.maxRetries) {
          this.syncQueue.delete(activityId);
          this.syncStats.failedActivities++;
          console.error('❌ Atividade removida da fila após máximo de tentativas:', activityId);
        }
      } catch (error) {
        console.error('❌ Erro crítico ao processar atividade:', activityId, error);
        results.push({
          success: false,
          activityId,
          error: error.message,
          attempt: queueItem.attempts + 1
        });
      }
    }

    this.syncStats.lastSyncTime = new Date().toISOString();
    this.updateStats();
    return results;
  }

  /**
   * Sincronizar uma atividade específica
   */
  private async syncSingleActivity(activityId: string, queueItem: any): Promise<SyncResult> {
    const { data: activityData, attempts } = queueItem;
    queueItem.attempts = attempts + 1;

    console.log(`🔄 Tentativa ${queueItem.attempts} de sincronização para:`, activityId);

    try {
      // Importar serviços necessários
      const { profileService } = await import('@/services/profileService');
      const activitiesApi = (await import('@/services/activitiesApiService')).default;

      // Obter perfil do usuário
      const profile = await profileService.getCurrentUserProfile();
      if (!profile?.id) {
        throw new Error('Perfil do usuário não encontrado');
      }

      // Mapear dados da atividade
      const mappedData = this.mapActivityForNeon(activityId, activityData, profile);
      
      // Verificar se já existe no banco
      const existingActivities = await activitiesApi.getUserActivities(profile.id);
      let syncResult;

      if (existingActivities.success && existingActivities.data) {
        const existingActivity = existingActivities.data.find(
          act => act.tipo === activityId
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
        // Atualizar localStorage
        this.updateLocalStorageSync(activityId, syncResult.data.codigo_unico || syncResult.data.id, true);
        
        console.log('✅ Atividade sincronizada com sucesso:', activityId);
        return {
          success: true,
          activityId,
          neonId: syncResult.data.codigo_unico || syncResult.data.id,
          attempt: queueItem.attempts
        };
      } else {
        throw new Error(syncResult.error || 'Erro desconhecido na API');
      }

    } catch (error) {
      console.error(`❌ Erro na sincronização da atividade ${activityId}:`, error);
      
      // Atualizar localStorage com erro
      this.updateLocalStorageSync(activityId, null, false, error.message);
      
      return {
        success: false,
        activityId,
        error: error.message,
        attempt: queueItem.attempts
      };
    }
  }

  /**
   * Mapear dados da atividade para formato do banco Neon
   */
  private mapActivityForNeon(activityId: string, activityData: any, profile: any) {
    const activitiesApi = require('@/services/activitiesApiService').default;
    
    const baseMapping = {
      user_id: profile.id,
      codigo_unico: activitiesApi.generateUniqueCode(),
      tipo: activityId,
      titulo: activityData.title || `Atividade ${activityId}`,
      descricao: activityData.description || 'Atividade educacional',
      conteudo: {
        ...activityData,
        activityType: activityId,
        syncedAt: new Date().toISOString(),
        syncVersion: '2.0'
      }
    };

    // Mapeamentos específicos por tipo
    const typeSpecificMappings = {
      'quiz-interativo': {
        titulo: `Quiz: ${activityData.theme || activityData.title || 'Quiz Interativo'}`,
        descricao: `Quiz sobre ${activityData.theme || 'temas diversos'} - ${activityData.subject || 'Disciplina'}`,
        conteudo: {
          ...baseMapping.conteudo,
          questions: activityData.questions || [],
          totalQuestions: activityData.totalQuestions || activityData.questions?.length || 0,
          subject: activityData.subject,
          schoolYear: activityData.schoolYear,
          theme: activityData.theme,
          difficultyLevel: activityData.difficultyLevel,
          timePerQuestion: activityData.timePerQuestion
        }
      },
      'flash-cards': {
        titulo: `Flash Cards: ${activityData.theme || activityData.title || 'Flash Cards'}`,
        descricao: `Flash cards sobre ${activityData.theme || 'temas diversos'}`,
        conteudo: {
          ...baseMapping.conteudo,
          cards: activityData.cards || [],
          totalCards: activityData.totalCards || activityData.cards?.length || 0,
          theme: activityData.theme,
          topicos: activityData.topicos
        }
      },
      'plano-aula': {
        titulo: `Plano de Aula: ${activityData.theme || activityData.title || 'Plano de Aula'}`,
        descricao: activityData.objectives || 'Plano de aula educacional',
        conteudo: {
          ...baseMapping.conteudo,
          subject: activityData.subject,
          theme: activityData.theme,
          schoolYear: activityData.schoolYear,
          objectives: activityData.objectives,
          materials: activityData.materials
        }
      },
      'sequencia-didatica': {
        titulo: activityData.tituloTemaAssunto || 'Sequência Didática',
        descricao: activityData.objetivosAprendizagem || 'Sequência didática educacional',
        conteudo: {
          ...baseMapping.conteudo,
          tituloTemaAssunto: activityData.tituloTemaAssunto,
          disciplina: activityData.disciplina,
          anoSerie: activityData.anoSerie,
          objetivosAprendizagem: activityData.objetivosAprendizagem,
          quantidadeAulas: activityData.quantidadeAulas
        }
      },
      'quadro-interativo': {
        titulo: `Quadro Interativo: ${activityData.theme || activityData.title || 'Quadro Interativo'}`,
        descricao: activityData.objectives || 'Quadro interativo educacional',
        conteudo: {
          ...baseMapping.conteudo,
          subject: activityData.subject,
          theme: activityData.theme,
          objectives: activityData.objectives,
          quadroInterativoCampoEspecifico: activityData.quadroInterativoCampoEspecifico
        }
      }
    };

    const specificMapping = typeSpecificMappings[activityId];
    if (specificMapping) {
      return {
        ...baseMapping,
        ...specificMapping
      };
    }

    return baseMapping;
  }

  /**
   * Atualizar localStorage com status de sincronização
   */
  private updateLocalStorageSync(activityId: string, neonId: string | null, success: boolean, error?: string): void {
    try {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      
      constructedActivities[activityId] = {
        ...constructedActivities[activityId],
        syncedToNeon: success,
        neonActivityId: neonId,
        neonSyncAt: new Date().toISOString(),
        syncStatus: success ? 'success' : 'error',
        syncError: error || null
      };
      
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
    } catch (e) {
      console.error('❌ Erro ao atualizar localStorage:', e);
    }
  }

  /**
   * Atualizar estatísticas
   */
  private updateStats(): void {
    this.syncStats.pendingActivities = this.syncQueue.size;
    this.syncStats.totalActivities = this.syncStats.syncedActivities + this.syncStats.pendingActivities + this.syncStats.failedActivities;
  }

  /**
   * Obter estatísticas de sincronização
   */
  getStats(): SyncManagerStats {
    return { ...this.syncStats };
  }

  /**
   * Limpar fila de sincronização
   */
  clearQueue(): void {
    this.syncQueue.clear();
    this.updateStats();
  }
}

// Instância singleton
export const activitySyncManager = new ActivitySyncManager();
export default activitySyncManager;
