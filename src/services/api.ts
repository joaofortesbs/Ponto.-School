// Serviço de API para comunicação com o backend

// Serviços de API usando endpoints do backend com Neon PostgreSQL

const API_BASE_URL = '/api';

// Tipos
export interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  full_name?: string;
  created_at: string;
}

export interface AuthResponse {
  success: boolean;
  user?: User;
  error?: string;
}

// Utilitário para fazer requisições
const apiRequest = async (endpoint: string, options: RequestInit = {}) => {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Network error' }));
    throw new Error(error.error || 'Request failed');
  }

  return response.json();
};

// Serviços de autenticação
export const auth = {
  signUp: async (email: string, password: string, userData?: any): Promise<AuthResponse> => {
    try {
      return await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, userData }),
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Signup failed' };
    }
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      return await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Login failed' };
    }
  },

  signOut: async (): Promise<{ success: boolean }> => {
    try {
      await apiRequest('/auth/signout', { method: 'POST' });
      return { success: true };
    } catch (error) {
      return { success: false };
    }
  },

  getUser: async (): Promise<{ data: { user: User | null } }> => {
    try {
      const response = await apiRequest('/auth/me');
      return { data: { user: response.user || null } };
    } catch (error) {
      return { data: { user: null } };
    }
  },

  checkUsername: async (username: string): Promise<{ available: boolean }> => {
    try {
      return await apiRequest(`/auth/check-username/${username}`);
    } catch (error) {
      return { available: false };
    }
  },

  resolveUsername: async (username: string): Promise<{ email?: string; error?: string }> => {
    try {
      return await apiRequest('/auth/resolve-username', {
        method: 'POST',
        body: JSON.stringify({ username }),
      });
    } catch (error) {
      return { error: error instanceof Error ? error.message : 'Username not found' };
    }
  },
};

// Verificação de conexão com banco
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`);
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Verificação de autenticação
export const checkAuthentication = async (): Promise<boolean> => {
  const user = await auth.getUser();
  return user !== null;
};

// Serviço de autenticação para compatibilidade
export const authService = auth;

// Export para compatibilidade com código antigo
export default {
  auth,
  checkDatabaseConnection,
  checkAuthentication,
};