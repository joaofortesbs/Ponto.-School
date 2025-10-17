// Serviço para gerenciar atividades no banco Neon

export interface AtividadeNeon {
  id: string;
  id_user: string;
  tipo: string;
  id_json: any;
  sparks?: number;
  created_at?: string;
  updated_at?: string;
}

const API_BASE_URL = '/api/atividades-neon';

class AtividadesNeonService {
  // Salvar atividade no banco Neon
  async salvarAtividade(id: string, userId: string, tipo: string, dadosAtividade: any, sparks?: number): Promise<{ success: boolean; data?: any; error?: string }> {
    try {
      console.log('💾 Salvando atividade no Neon:', { id, userId, tipo, sparks });
      
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          id_user: userId,
          tipo,
          id_json: dadosAtividade,
          sparks: sparks !== undefined ? sparks : 100
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao salvar atividade');
      }

      const result = await response.json();
      console.log('✅ Atividade salva no Neon com sucesso:', result.data);
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Erro ao salvar atividade no Neon:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Buscar atividades de um usuário
  async buscarAtividadesUsuario(userId: string): Promise<{ success: boolean; data?: AtividadeNeon[]; error?: string }> {
    try {
      console.log('🔍 Buscando atividades do usuário no Neon:', userId);
      
      const response = await fetch(`${API_BASE_URL}/user/${userId}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar atividades');
      }

      const result = await response.json();
      console.log('✅ Atividades carregadas do Neon:', result.data?.length || 0);
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Erro ao buscar atividades do Neon:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido',
        data: []
      };
    }
  }

  // Buscar atividade específica
  async buscarAtividade(id: string): Promise<{ success: boolean; data?: AtividadeNeon; error?: string }> {
    try {
      console.log('🔍 Buscando atividade no Neon:', id);
      
      const response = await fetch(`${API_BASE_URL}/${id}`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar atividade');
      }

      const result = await response.json();
      console.log('✅ Atividade encontrada no Neon:', result.data);
      
      return { success: true, data: result.data };
    } catch (error) {
      console.error('❌ Erro ao buscar atividade do Neon:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Buscar atividade com dados do criador
  async buscarAtividadeComCriador(id: string): Promise<{ 
    success: boolean; 
    data?: AtividadeNeon & { criador?: any }; 
    error?: string 
  }> {
    try {
      console.log('🔍 Buscando atividade com dados do criador:', id);
      
      // Buscar atividade com criador em uma única requisição otimizada
      const response = await fetch(`${API_BASE_URL}/${id}?incluirCriador=true`);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao buscar atividade');
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        console.log('✅ Atividade com dados do criador encontrada:', result.data);
        return { success: true, data: result.data };
      }
      
      return { 
        success: false, 
        error: 'Atividade não encontrada' 
      };
      
    } catch (error) {
      console.error('❌ Erro ao buscar atividade com criador:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Deletar atividade
  async deletarAtividade(id: string, userId?: string): Promise<{ success: boolean; error?: string }> {
    try {
      console.log('🗑️ Deletando atividade do Neon:', id);
      
      const url = userId 
        ? `${API_BASE_URL}/${id}?userId=${userId}`
        : `${API_BASE_URL}/${id}`;
      
      const response = await fetch(url, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erro ao deletar atividade');
      }

      console.log('✅ Atividade deletada do Neon com sucesso');
      
      return { success: true };
    } catch (error) {
      console.error('❌ Erro ao deletar atividade do Neon:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  // Migrar atividades do localStorage para o Neon
  async migrarDoLocalStorage(userId: string): Promise<{ success: boolean; migradas: number; error?: string }> {
    try {
      console.log('🔄 Iniciando migração do localStorage para Neon...');
      
      // Buscar atividades construídas do localStorage
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const activityIds = Object.keys(constructedActivities);
      
      if (activityIds.length === 0) {
        console.log('ℹ️ Nenhuma atividade para migrar');
        return { success: true, migradas: 0 };
      }

      console.log(`📦 Encontradas ${activityIds.length} atividades no localStorage`);
      
      let migradas = 0;
      
      for (const activityId of activityIds) {
        // Buscar dados da atividade
        const activityData = localStorage.getItem(`activity_${activityId}`);
        
        if (activityData) {
          try {
            const parsedData = JSON.parse(activityData);
            const tipo = constructedActivities[activityId]?.type || activityId;
            
            // Salvar no Neon
            const result = await this.salvarAtividade(activityId, userId, tipo, parsedData);
            
            if (result.success) {
              migradas++;
              console.log(`✅ Atividade ${activityId} migrada com sucesso`);
            }
          } catch (error) {
            console.error(`❌ Erro ao migrar atividade ${activityId}:`, error);
          }
        }
      }
      
      console.log(`✅ Migração concluída: ${migradas} atividades migradas`);
      
      return { success: true, migradas };
    } catch (error) {
      console.error('❌ Erro na migração:', error);
      return { 
        success: false, 
        migradas: 0,
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }
}

export const atividadesNeonService = new AtividadesNeonService();
