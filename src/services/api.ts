
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

// Utilitário para fazer requisições com retry e timeout
const apiRequest = async (endpoint: string, options: RequestInit = {}, maxRetries = 3) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos timeout

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        credentials: 'include',
        signal: controller.signal,
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        ...options,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: `HTTP ${response.status}: ${response.statusText}` }));
        throw new Error(errorData.error || `Request failed with status ${response.status}`);
      }

      return response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      
      if (attempt === maxRetries) {
        if (error instanceof Error) {
          if (error.name === 'AbortError') {
            throw new Error('Tempo limite da requisição excedido. Verifique sua conexão.');
          }
          throw error;
        }
        throw new Error('Erro desconhecido na requisição');
      }
      
      // Wait before retry (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
};

// Serviços de autenticação
export const auth = {
  signUp: async (email: string, password: string, userData?: any): Promise<AuthResponse> => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      // Validação de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { success: false, error: 'Email inválido' };
      }

      // Validação de senha
      if (password.length < 6) {
        return { success: false, error: 'Senha deve ter pelo menos 6 caracteres' };
      }

      return await apiRequest('/auth/signup', {
        method: 'POST',
        body: JSON.stringify({ email, password, userData }),
      });
    } catch (error) {
      console.error('Signup error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar conta. Tente novamente.' 
      };
    }
  },

  signIn: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      if (!email || !password) {
        return { success: false, error: 'Email e senha são obrigatórios' };
      }

      return await apiRequest('/auth/signin', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
    } catch (error) {
      console.error('Signin error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao fazer login. Tente novamente.' 
      };
    }
  },

  signOut: async (): Promise<{ success: boolean }> => {
    try {
      await apiRequest('/auth/signout', { method: 'POST' });
      return { success: true };
    } catch (error) {
      console.error('Signout error:', error);
      return { success: false };
    }
  },

  getUser: async (): Promise<{ data: { user: User | null } }> => {
    try {
      const response = await apiRequest('/auth/me');
      return { data: { user: response.user || null } };
    } catch (error) {
      console.error('Get user error:', error);
      return { data: { user: null } };
    }
  },

  checkUsername: async (username: string): Promise<{ available: boolean; error?: string }> => {
    try {
      // Validação local primeiro
      if (!username || typeof username !== 'string') {
        return { available: false, error: 'Username é obrigatório' };
      }

      const cleanUsername = username.trim().toLowerCase();
      
      if (cleanUsername.length === 0) {
        return { available: false, error: 'Username não pode estar vazio' };
      }

      if (cleanUsername.length < 3) {
        return { available: false, error: 'Username deve ter pelo menos 3 caracteres' };
      }

      if (cleanUsername.length > 30) {
        return { available: false, error: 'Username deve ter no máximo 30 caracteres' };
      }

      // Verificar caracteres válidos
      const validPattern = /^[a-z0-9_]+$/;
      if (!validPattern.test(cleanUsername)) {
        return { available: false, error: 'Username deve conter apenas letras minúsculas, números e sublinhados' };
      }

      // Verificar palavras reservadas
      const reservedWords = ['admin', 'api', 'root', 'system', 'user', 'null', 'undefined'];
      if (reservedWords.includes(cleanUsername)) {
        return { available: false, error: 'Este username está reservado' };
      }

      console.log(`Verificando disponibilidade do username: ${cleanUsername}`);

      const response = await apiRequest(`/auth/check-username/${encodeURIComponent(cleanUsername)}`, {}, 2); // Menos tentativas para username check
      
      return {
        available: response.available === true,
        error: response.error || (!response.available ? 'Username já está em uso' : undefined)
      };
    } catch (error) {
      console.error('Username check error:', error);
      
      // Tratamento específico de diferentes tipos de erro
      if (error instanceof Error) {
        const errorMessage = error.message.toLowerCase();
        
        if (errorMessage.includes('tempo limite') || errorMessage.includes('timeout') || errorMessage.includes('abort')) {
          return { available: false, error: 'Conexão muito lenta. Tente novamente.' };
        }
        
        if (errorMessage.includes('failed to fetch') || errorMessage.includes('network')) {
          return { available: false, error: 'Sem conexão com a internet. Verifique sua rede.' };
        }
        
        if (errorMessage.includes('500') || errorMessage.includes('internal server')) {
          return { available: false, error: 'Servidor temporariamente indisponível.' };
        }
        
        if (errorMessage.includes('404')) {
          return { available: false, error: 'Serviço de verificação não encontrado.' };
        }
      }
      
      return { available: false, error: 'Erro ao verificar username. Tente novamente em alguns instantes.' };
    }
  },

  resolveUsername: async (username: string): Promise<{ email?: string; error?: string }> => {
    try {
      if (!username || typeof username !== 'string') {
        return { error: 'Username é obrigatório' };
      }

      return await apiRequest('/auth/resolve-username', {
        method: 'POST',
        body: JSON.stringify({ username: username.trim() }),
      });
    } catch (error) {
      console.error('Resolve username error:', error);
      return { error: error instanceof Error ? error.message : 'Username não encontrado' };
    }
  },

  createUserProfile: async (profileData: any): Promise<{ success: boolean; error?: string; profile?: any }> => {
    try {
      if (!profileData) {
        return { success: false, error: 'Dados do perfil são obrigatórios' };
      }

      const response = await apiRequest('/auth/create-profile', {
        method: 'POST',
        body: JSON.stringify({ profileData }),
      });
      return { success: true, profile: response.profile };
    } catch (error) {
      console.error('Create profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao criar perfil' 
      };
    }
  },

  updateUserProfile: async (profileData: any): Promise<{ success: boolean; error?: string; profile?: any }> => {
    try {
      if (!profileData) {
        return { success: false, error: 'Dados do perfil são obrigatórios' };
      }

      const response = await apiRequest('/auth/create-profile', {
        method: 'POST',
        body: JSON.stringify({ profileData }),
      });
      return { success: true, profile: response.profile };
    } catch (error) {
      console.error('Update profile error:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro ao atualizar perfil' 
      };
    }
  },

  checkEmail: async (email: string): Promise<{ available: boolean }> => {
    try {
      if (!email || typeof email !== 'string') {
        return { available: false };
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return { available: false };
      }

      return await apiRequest(`/auth/check-email/${encodeURIComponent(email)}`);
    } catch (error) {
      console.error('Check email error:', error);
      return { available: false };
    }
  },
};

// Verificação de conexão com banco
export const checkDatabaseConnection = async (): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/status`, { 
      method: 'GET',
      timeout: 10000 
    });
    return response.ok;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
};

// Verificação de autenticação
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const result = await auth.getUser();
    return result.data.user !== null;
  } catch (error) {
    console.error('Authentication check failed:', error);
    return false;
  }
};

// Serviço de autenticação para compatibilidade
export const authService = auth;

// Export para compatibilidade com código antigo
export default {
  auth,
  checkDatabaseConnection,
  checkAuthentication,
};
