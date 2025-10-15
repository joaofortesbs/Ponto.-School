import axios from 'axios';

const API_BASE_URL = '/api';

interface RegistrarVisitaParams {
  codigo_atividade: string;
  id_usuario_visitante?: string;
  nome_visitante?: string;
  email_visitante?: string;
  tipo_visitante?: 'anonimo' | 'registrado';
}

interface EstatisticasVisitantes {
  totalVisitas: number;
  visitasHoje: number;
  visitantesUnicos: number;
  visitantes: Array<{
    id: number;
    codigo_atividade: string;
    nome_visitante: string;
    email_visitante?: string;
    tipo_visitante: string;
    data_acesso: string;
    titulo_atividade?: string;
  }>;
  visitasPorAtividade: Array<{
    codigo_atividade: string;
    titulo_atividade: string;
    total_visitas: number;
    visitantes_unicos: number;
  }>;
}

export const visitantesService = {
  /**
   * Registra uma nova visita a uma atividade
   */
  async registrarVisita(params: RegistrarVisitaParams) {
    try {
      // Captura IP e User Agent do navegador
      const ip_address = await this.getClientIP();
      const user_agent = navigator.userAgent;

      const response = await axios.post(`${API_BASE_URL}/visitantes`, {
        ...params,
        ip_address,
        user_agent
      });

      console.log('✅ [VISITANTES] Visita registrada:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ [VISITANTES] Erro ao registrar visita:', error);
      throw error;
    }
  },

  /**
   * Busca estatísticas de visitantes de um usuário
   */
  async buscarEstatisticas(userId: string): Promise<EstatisticasVisitantes> {
    try {
      const response = await axios.get(`${API_BASE_URL}/visitantes/${userId}`);
      console.log('✅ [VISITANTES] Estatísticas carregadas:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ [VISITANTES] Erro ao buscar estatísticas:', error);
      throw error;
    }
  },

  /**
   * Busca visitantes de uma atividade específica
   */
  async buscarVisitantesPorAtividade(codigoAtividade: string) {
    try {
      const response = await axios.get(`${API_BASE_URL}/visitantes/atividade/${codigoAtividade}`);
      console.log('✅ [VISITANTES] Visitantes da atividade carregados:', response.data.data);
      return response.data.data;
    } catch (error) {
      console.error('❌ [VISITANTES] Erro ao buscar visitantes:', error);
      throw error;
    }
  },

  /**
   * Obtém o IP do cliente (usando serviço público)
   */
  async getClientIP(): Promise<string> {
    try {
      const response = await axios.get('https://api.ipify.org?format=json');
      return response.data.ip;
    } catch (error) {
      console.warn('⚠️ Não foi possível obter IP do cliente, usando "unknown"');
      return 'unknown';
    }
  }
};
