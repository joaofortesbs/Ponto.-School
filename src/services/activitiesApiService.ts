/**
 * Serviço para comunicação com a API de atividades
 * Gerencia todas as operações CRUD de atividades no banco de dados Neon
 */

export interface ActivityData {
  id?: string;
  user_id: string;
  codigo_unico: string;
  tipo: string;
  titulo?: string;
  descricao?: string;
  conteudo: any;
  stars?: number;
  criado_em?: string;
  atualizado_em?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

class ActivitiesApiService {
  private baseUrl: string;
  private debug: boolean = true;

  constructor() {
    // Determinar a URL base da API
    this.baseUrl = this.getApiBaseUrl();
    this.debugLog('🔗 API Base URL:', this.baseUrl);
  }

  /**
   * Determina a URL base da API baseada no ambiente
   */
  private getApiBaseUrl(): string {
    // Sempre usar caminho relativo - o proxy do Vite resolve automaticamente
    // Em dev: /api → proxy → localhost:3001
    // Em deployment: /api → proxy → localhost:3000
    return '/api';
  }

  /**
   * Logger de debug
   */
  private debugLog(message: string, data?: any): void {
    if (this.debug) {
      console.log(`💾 [ActivitiesAPI] ${message}`, data || '');
    }
  }

  /**
   * Executa uma requisição HTTP
   */
  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const url = `${this.baseUrl}${endpoint}`;
      this.debugLog(`📡 ${options.method || 'GET'} ${url}`);

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();

      if (response.ok) {
        this.debugLog('✅ Resposta bem-sucedida:', data);
        return data;
      } else {
        this.debugLog('❌ Erro na resposta:', data);
        return {
          success: false,
          error: data.error || `Erro HTTP ${response.status}`,
        };
      }
    } catch (error) {
      this.debugLog('❌ Erro na requisição:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Gera um código único para atividade (8 caracteres)
   */
  public generateUniqueCode(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  /**
   * Criar nova atividade
   */
  async createActivity(activityData: Omit<ActivityData, 'id' | 'criado_em' | 'atualizado_em'>): Promise<ApiResponse<ActivityData>> {
    this.debugLog('📝 Criando nova atividade:', activityData);

    return this.makeRequest<ActivityData>('/atividades', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  /**
   * Atualizar atividade existente
   */
  async updateActivity(
    codigo_unico: string,
    updateData: Pick<ActivityData, 'titulo' | 'descricao' | 'conteudo'>
  ): Promise<ApiResponse<ActivityData>> {
    this.debugLog('🔄 Atualizando atividade:', { codigo_unico, updateData });

    return this.makeRequest<ActivityData>(`/atividades/${codigo_unico}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  /**
   * Buscar atividades do usuário (histórico)
   */
  async getUserActivities(user_id: string): Promise<ApiResponse<ActivityData[]>> {
    this.debugLog('🔍 Buscando atividades do usuário:', user_id);

    return this.makeRequest<ActivityData[]>(`/atividades/usuario/${user_id}`);
  }

  /**
   * Buscar atividade por código único
   */
  async getActivityByCode(codigo_unico: string): Promise<ApiResponse<ActivityData>> {
    this.debugLog('🔍 Buscando atividade por código:', codigo_unico);

    return this.makeRequest<ActivityData>(`/atividades-neon/${codigo_unico}`);
  }

  /**
   * Deletar atividade
   */
  async deleteActivity(codigo_unico: string, user_id: string): Promise<ApiResponse<{ message: string }>> {
    this.debugLog('🗑️ Deletando atividade:', codigo_unico);

    return this.makeRequest<{ message: string }>(`/atividades/${codigo_unico}`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id }),
    });
  }

  /**
   * Verificar status da API
   */
  async checkApiStatus(): Promise<boolean> {
    try {
      const response = await this.makeRequest<{ status: string }>('/status');
      return response.success;
    } catch (error) {
      this.debugLog('❌ API não está disponível:', error);
      return false;
    }
  }

  /**
   * Migrar atividade do localStorage para o banco
   */
  async migrateFromLocalStorage(
    user_id: string,
    localStorageData: any,
    activityId: string
  ): Promise<ApiResponse<ActivityData>> {
    this.debugLog('🔄 Migrando atividade do localStorage:', { activityId, user_id });

    try {
      // Gerar código único para a atividade migrada
      const codigo_unico = this.generateUniqueCode();

      // Preparar dados da atividade
      const activityData: Omit<ActivityData, 'id' | 'criado_em' | 'atualizado_em'> = {
        user_id,
        codigo_unico,
        tipo: activityId,
        titulo: localStorageData.title || localStorageData.titulo || `Atividade ${activityId}`,
        descricao: localStorageData.description || localStorageData.descricao || 'Atividade migrada do armazenamento local',
        conteudo: localStorageData,
      };

      // Criar atividade no banco
      const result = await this.createActivity(activityData);

      if (result.success) {
        this.debugLog('✅ Atividade migrada com sucesso');
        return result;
      } else {
        this.debugLog('❌ Erro na migração:', result.error);
        return result;
      }
    } catch (error) {
      this.debugLog('❌ Erro durante migração:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro durante migração',
      };
    }
  }

  /**
   * Sincronizar atividade: salvar no banco e manter localStorage como backup
   */
  async syncActivity(
    user_id: string,
    activityData: any,
    activityId: string,
    forceUpdate: boolean = false
  ): Promise<ApiResponse<ActivityData>> {
    this.debugLog('🔄 Sincronizando atividade:', { activityId, user_id, forceUpdate });

    try {
      // Verificar se já existe no banco
      const existingActivities = await this.getUserActivities(user_id);
      
      if (existingActivities.success && existingActivities.data) {
        // Procurar atividade existente por tipo/ID
        const existingActivity = existingActivities.data.find(
          activity => activity.tipo === activityId
        );

        if (existingActivity && !forceUpdate) {
          // Atividade já existe - atualizar
          this.debugLog('📝 Atividade já existe, atualizando...');
          
          return this.updateActivity(existingActivity.codigo_unico, {
            titulo: activityData.title || activityData.titulo || existingActivity.titulo,
            descricao: activityData.description || activityData.descricao || existingActivity.descricao,
            conteudo: activityData,
          });
        }
      }

      // Atividade não existe ou forceUpdate é true - criar nova
      this.debugLog('📝 Criando nova atividade...');
      return this.migrateFromLocalStorage(user_id, activityData, activityId);

    } catch (error) {
      this.debugLog('❌ Erro durante sincronização:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro durante sincronização',
      };
    }
  }

  /**
   * Sincronizar todas as atividades do localStorage para o banco
   */
  async syncAllLocalActivities(user_id: string): Promise<{ synced: number; errors: string[] }> {
    const results = { synced: 0, errors: [] };
    
    try {
      this.debugLog('🔄 Iniciando sincronização completa para usuário:', user_id);
      
      // Buscar todas as atividades construídas do localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      
      for (const [activityId, activityInfo] of Object.entries(constructedActivities)) {
        try {
          if ((activityInfo as any)?.isBuilt) {
            // Buscar dados completos da atividade
            const activityData = localStorage.getItem(`activity_${activityId}`);
            if (activityData) {
              const parsedData = JSON.parse(activityData);
              const syncResult = await this.syncActivity(user_id, parsedData, activityId);
              
              if (syncResult.success) {
                results.synced++;
                this.debugLog('✅ Atividade sincronizada:', activityId);
                
                // Marcar como sincronizada
                constructedActivities[activityId] = {
                  ...constructedActivities[activityId],
                  syncedToNeon: true,
                  neonSyncAt: new Date().toISOString()
                };
              } else {
                results.errors.push(`${activityId}: ${syncResult.error}`);
              }
            }
          }
        } catch (error) {
          results.errors.push(`${activityId}: Erro ao processar dados - ${error.message}`);
        }
      }
      
      // Atualizar o localStorage com as informações de sincronização
      localStorage.setItem('constructedActivities', JSON.stringify(constructedActivities));
      
      this.debugLog('📊 Sincronização completa:', results);
      return results;
      
    } catch (error) {
      this.debugLog('❌ Erro na sincronização completa:', error);
      results.errors.push(`Erro geral: ${error.message}`);
      return results;
    }
  }
}

// Exportar instância singleton
export const activitiesApi = new ActivitiesApiService();
export default activitiesApi;

// Exportar métodos individuais para compatibilidade com imports existentes
export const getUserActivities = (user_id: string) => activitiesApi.getUserActivities(user_id);
export const updateActivity = (codigo_unico: string, updateData: Pick<ActivityData, 'titulo' | 'descricao' | 'conteudo'>) => activitiesApi.updateActivity(codigo_unico, updateData);
export const createActivity = (activityData: Omit<ActivityData, 'id' | 'criado_em' | 'atualizado_em'>) => activitiesApi.createActivity(activityData);
export const getActivityByCode = (codigo_unico: string) => activitiesApi.getActivityByCode(codigo_unico);
export const deleteActivity = (codigo_unico: string, user_id: string) => activitiesApi.deleteActivity(codigo_unico, user_id);
export const generateUniqueCode = () => activitiesApi.generateUniqueCode();
export const migrateFromLocalStorage = (user_id: string, localStorageData: any, activityId: string) => activitiesApi.migrateFromLocalStorage(user_id, localStorageData, activityId);