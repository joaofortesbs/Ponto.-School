// Serviço de API para comunicação com o backend
const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? '/api' 
  : 'http://localhost:3001/api';

// Configuração fetch com credentials para cookies
const fetchWithCredentials = async (url: string, options: RequestInit = {}) => {
  const config: RequestInit = {
    credentials: 'include', // Para enviar cookies httpOnly
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${url}`, config);
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(errorData.error || `HTTP ${response.status}`);
  }
  
  return response.json();
};

// Interface para dados do usuário
export interface User {
  id: number;
  email: string;
  username?: string;
  full_name?: string;
  display_name?: string;
  institution?: string;
  state?: string;
  plan_type?: string;
}

// Interface para dados de registro
export interface SignUpData {
  email: string;
  password: string;
  userData?: {
    username?: string;
    full_name?: string;
    display_name?: string;
    institution?: string;
    state?: string;
    birth_date?: string;
    plan_type?: string;
  };
}

// Serviços de autenticação
export const authService = {
  // Registrar usuário
  async signUp(data: SignUpData) {
    try {
      const result = await fetchWithCredentials('/auth/signup', {
        method: 'POST',
        body: JSON.stringify(data),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Login usuário
  async signIn(email: string, password: string) {
    try {
      const result = await fetchWithCredentials('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      return { data: result, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Logout usuário
  async signOut() {
    try {
      await fetchWithCredentials('/auth/signout', {
        method: 'POST',
      });
      // Limpar localStorage
      localStorage.removeItem('username');
      localStorage.removeItem('userDisplayName');
      localStorage.removeItem('userFirstName');
      localStorage.removeItem('currentUserId');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('auth_status');
      return { data: { success: true }, error: null };
    } catch (error) {
      return { data: null, error: { message: (error as Error).message } };
    }
  },

  // Obter usuário atual
  async getUser() {
    try {
      const result = await fetchWithCredentials('/auth/me');
      return { data: { user: result.user }, error: null };
    } catch (error) {
      return { data: { user: null }, error: { message: (error as Error).message } };
    }
  },

  // Verificar se username está disponível
  async checkUsername(username: string) {
    try {
      const result = await fetchWithCredentials(`/auth/check-username/${username}`);
      return result.available;
    } catch (error) {
      console.error('Erro ao verificar username:', error);
      return false;
    }
  }
};

// Função auxiliar para verificar autenticação (compatibilidade)
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const result = await authService.getUser();
    return !!result.data?.user;
  } catch {
    return false;
  }
};

// Mock do objeto auth para compatibilidade com código existente
export const auth = {
  signUp: authService.signUp,
  signIn: authService.signIn,
  signOut: authService.signOut,
  getUser: authService.getUser,
};

// Mock da função query (substituirá as chamadas diretas de banco)
export const query = async (sql: string, params: any[]) => {
  throw new Error('Direct database queries not allowed in client. Use API endpoints instead.');
};

// Verificação de conexão (agora será uma verificação da API)
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    return response.ok;
  } catch {
    return false;
  }
};