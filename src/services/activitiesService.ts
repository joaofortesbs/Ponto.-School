
// Serviço para comunicação com a API de activities
export interface Activity {
  id?: number;
  user_id: string;
  activity_code: string;
  type: string;
  title?: string;
  content: any;
  created_at?: string;
  updated_at?: string;
}

export interface CreateActivityData {
  user_id: string;
  activity_code: string;
  type: string;
  title?: string;
  content: any;
}

export interface UpdateActivityData {
  title?: string;
  content?: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  details?: string;
}

const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

class ActivitiesService {
  private async makeRequest<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      const data = await response.json();
      
      if (!response.ok) {
        console.error(`❌ Erro na API (${response.status}):`, data);
        return {
          success: false,
          error: data.error || `Erro HTTP ${response.status}`,
          details: data.details
        };
      }

      return data;
    } catch (error) {
      console.error('❌ Erro de rede na API:', error);
      return {
        success: false,
        error: 'Erro de conexão com o servidor',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  // Criar nova atividade
  async createActivity(activityData: CreateActivityData): Promise<ApiResponse<Activity>> {
    console.log('📝 Criando atividade via API:', activityData.activity_code);
    
    return this.makeRequest<Activity>('/activities', {
      method: 'POST',
      body: JSON.stringify(activityData),
    });
  }

  // Buscar atividade por código
  async getActivityByCode(activityCode: string): Promise<ApiResponse<Activity>> {
    console.log('🔍 Buscando atividade via API:', activityCode);
    
    return this.makeRequest<Activity>(`/activities/${activityCode}`);
  }

  // Atualizar atividade
  async updateActivity(
    activityCode: string, 
    updateData: UpdateActivityData
  ): Promise<ApiResponse<Activity>> {
    console.log('📝 Atualizando atividade via API:', activityCode);
    
    return this.makeRequest<Activity>(`/activities/${activityCode}`, {
      method: 'PUT',
      body: JSON.stringify(updateData),
    });
  }

  // Listar atividades do usuário
  async getUserActivities(userId: string): Promise<ApiResponse<Activity[]>> {
    console.log('🔍 Buscando atividades do usuário via API:', userId);
    
    return this.makeRequest<Activity[]>(`/activities/user/${userId}`);
  }

  // Deletar atividade
  async deleteActivity(activityCode: string): Promise<ApiResponse<void>> {
    console.log('🗑️ Deletando atividade via API:', activityCode);
    
    return this.makeRequest<void>(`/activities/${activityCode}`, {
      method: 'DELETE',
    });
  }

  // Salvar ou atualizar atividade (método inteligente)
  async saveActivity(activityData: CreateActivityData): Promise<ApiResponse<Activity>> {
    console.log('💾 Salvando atividade (criar ou atualizar):', activityData.activity_code);
    
    // Primeiro, tentar buscar a atividade existente
    const existingActivity = await this.getActivityByCode(activityData.activity_code);
    
    if (existingActivity.success && existingActivity.data) {
      // Atividade existe, atualizar
      console.log('📝 Atividade existe, atualizando...');
      return this.updateActivity(activityData.activity_code, {
        title: activityData.title,
        content: activityData.content
      });
    } else {
      // Atividade não existe, criar nova
      console.log('📝 Atividade não existe, criando nova...');
      return this.createActivity(activityData);
    }
  }

  // Sincronizar atividade do LocalStorage para o banco (migração)
  async syncFromLocalStorage(activityCode: string, localData: any): Promise<ApiResponse<Activity>> {
    console.log('🔄 Sincronizando atividade do LocalStorage:', activityCode);
    
    try {
      // Extrair dados do LocalStorage
      const activityData: CreateActivityData = {
        user_id: localData.user_id || 'anonymous', // Usar user_id real quando disponível
        activity_code: activityCode,
        type: localData.type || 'unknown',
        title: localData.title || localData.nome || 'Atividade sem título',
        content: localData
      };

      return this.saveActivity(activityData);
    } catch (error) {
      console.error('❌ Erro ao sincronizar do LocalStorage:', error);
      return {
        success: false,
        error: 'Erro ao sincronizar dados do LocalStorage',
        details: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

// Instância singleton do serviço
export const activitiesService = new ActivitiesService();

// Hook para usar o serviço em componentes React
export function useActivitiesService() {
  return activitiesService;
}

export default activitiesService;
