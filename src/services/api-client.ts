import axios, { AxiosResponse } from 'axios';

// Configuração da base URL da API
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-production-url.com/api' 
  : 'http://localhost:3001/api';

// Interface para resposta da API
interface ApiResponse<T = any> {
  user?: T;
  session?: {
    access_token: string;
    user: T;
  };
  profile?: T;
  data?: T;
  message?: string;
  error?: string;
}

// Interface para usuário
export interface User {
  id: string;
  email: string;
  full_name?: string;
  role?: string;
  avatar_url?: string;
  created_at?: string;
  updated_at?: string;
  display_name?: string;
  bio?: string;
  user_id?: string;
  instituição_ensino?: string;
  estado_uf?: string;
}

// Interface para sessão
export interface Session {
  access_token: string;
  user: User;
}

// Criar instância do axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar o token de autenticação automaticamente
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('neon_auth_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para lidar com respostas de erro
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expirado ou inválido
      localStorage.removeItem('neon_auth_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export class ApiClient {
  // Registrar novo usuário
  static async register(email: string, password: string, userData?: Record<string, any>): Promise<{ user: User | null; session: Session | null; error: any }> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/auth/register', {
        email,
        password,
        userData
      });

      return {
        user: response.data.user || null,
        session: response.data.session || null,
        error: null
      };
    } catch (error: any) {
      console.error('Erro no registro:', error);
      return {
        user: null,
        session: null,
        error: error.response?.data || error
      };
    }
  }

  // Fazer login
  static async signInWithPassword(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: any }> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.post('/auth/login', {
        email,
        password
      });

      // Armazenar token no localStorage
      if (response.data.session?.access_token) {
        localStorage.setItem('neon_auth_token', response.data.session.access_token);
      }

      return {
        user: response.data.user || null,
        session: response.data.session || null,
        error: null
      };
    } catch (error: any) {
      console.error('Erro no login:', error);
      return {
        user: null,
        session: null,
        error: error.response?.data || error
      };
    }
  }

  // Verificar token
  static async verifyToken(): Promise<{ user: User | null; error: any }> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/verify');

      return {
        user: response.data.user || null,
        error: null
      };
    } catch (error: any) {
      console.error('Erro na verificação de token:', error);
      return {
        user: null,
        error: error.response?.data || error
      };
    }
  }

  // Buscar perfil do usuário
  static async getProfile(): Promise<{ data: User | null; error: any }> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.get('/auth/profile');

      return {
        data: response.data.profile || null,
        error: null
      };
    } catch (error: any) {
      console.error('Erro ao buscar perfil:', error);
      return {
        data: null,
        error: error.response?.data || error
      };
    }
  }

  // Atualizar perfil do usuário
  static async updateProfile(updates: Partial<User>): Promise<{ data: User | null; error: any }> {
    try {
      const response: AxiosResponse<ApiResponse<User>> = await apiClient.put('/auth/profile', updates);

      return {
        data: response.data.profile || null,
        error: null
      };
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      return {
        data: null,
        error: error.response?.data || error
      };
    }
  }

  // Fazer logout
  static async signOut(): Promise<{ error: any }> {
    try {
      await apiClient.post('/auth/logout');
      
      // Remover token do localStorage
      localStorage.removeItem('neon_auth_token');
      
      return { error: null };
    } catch (error: any) {
      console.error('Erro no logout:', error);
      // Mesmo se der erro no servidor, remover token local
      localStorage.removeItem('neon_auth_token');
      return { error: error.response?.data || error };
    }
  }

  // Testar conexão com banco
  static async testDatabase(): Promise<{ database: string; message: string; error?: any }> {
    try {
      const response: AxiosResponse<ApiResponse> = await apiClient.get('/auth/test-db');

      return {
        database: response.data.database || 'unknown',
        message: response.data.message || 'Status unknown',
        error: null
      };
    } catch (error: any) {
      console.error('Erro no teste de conexão:', error);
      return {
        database: 'erro',
        message: 'Erro na conexão',
        error: error.response?.data || error
      };
    }
  }

  // Funções de compatibilidade com Supabase (para facilitar migração)
  static get auth() {
    return {
      signUp: this.register,
      signInWithPassword: this.signInWithPassword,
      signOut: this.signOut,
      getSession: async () => {
        const token = localStorage.getItem('neon_auth_token');
        if (!token) {
          return { data: { session: null }, error: null };
        }

        const { user, error } = await this.verifyToken();
        if (error || !user) {
          return { data: { session: null }, error };
        }

        return {
          data: {
            session: {
              access_token: token,
              user
            }
          },
          error: null
        };
      },
      onAuthStateChange: (callback: (event: string, session: Session | null) => void) => {
        // Implementação simplificada para compatibilidade
        // Em uma implementação completa, você usaria WebSockets ou polling
        console.log('onAuthStateChange mock - implement real-time auth state changes if needed');
        return {
          subscription: {
            unsubscribe: () => console.log('Auth state change unsubscribed')
          }
        };
      }
    };
  }

  // Função para simular queries do Supabase
  static from(table: string) {
    return {
      select: (columns: string = '*') => ({
        eq: (column: string, value: any) => ({
          single: async () => {
            // Para perfis, usar endpoint específico
            if (table === 'profiles') {
              const { data, error } = await this.getProfile();
              return { data, error };
            }
            
            console.warn(`Query para tabela ${table} não implementada ainda`);
            return { data: null, error: { message: 'Query não implementada' } };
          }
        }),
        limit: (count: number) => ({
          then: async (callback: any) => {
            console.warn(`Query para tabela ${table} não implementada ainda`);
            return callback({ data: [], error: null });
          }
        })
      }),
      update: (updates: any) => ({
        eq: (column: string, value: any) => ({
          then: async (callback: any) => {
            if (table === 'profiles') {
              const { data, error } = await this.updateProfile(updates);
              return callback({ data, error });
            }
            
            console.warn(`Update para tabela ${table} não implementada ainda`);
            return callback({ data: null, error: { message: 'Update não implementado' } });
          }
        })
      })
    };
  }

  // Função para RPC (compatibilidade com Supabase)
  static async rpc(functionName: string, parameters?: any): Promise<{ data: any; error: any }> {
    console.warn(`RPC function ${functionName} não implementada - considere migrar para endpoints REST`);
    return { data: null, error: { message: 'RPC não implementado' } };
  }
}

// Exportar instância única para compatibilidade
export const neonApiClient = ApiClient;

// Exportar como padrão para facilitar importação
export default ApiClient;