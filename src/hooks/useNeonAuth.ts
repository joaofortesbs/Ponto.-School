
import { useState, useEffect } from 'react';

interface User {
  id: string;
  nome_completo: string;
  nome_usuario: string;
  email: string;
  tipo_conta: string;
  pais: string;
  estado: string;
  instituicao_ensino: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
}

export function useNeonAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const userId = localStorage.getItem('user_id');
      
      if (!token || !userId) {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false,
          isAuthenticated: false,
          user: null
        }));
        return;
      }

      const backendUrls = [
        `http://0.0.0.0:3001/api/perfis?id=${userId}`,
        `http://localhost:3001/api/perfis?id=${userId}`,
        `http://127.0.0.1:3001/api/perfis?id=${userId}`
      ];

      let response;
      let lastError;

      for (const url of backendUrls) {
        try {
          response = await fetch(url, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error("Backend não disponível");
      }

      const result = await response.json();
      
      if (result.success && result.data) {
        setAuthState({
          user: result.data,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });
      } else {
        // Token inválido, limpar
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_id');
        setAuthState({
          user: null,
          isLoading: false,
          isAuthenticated: false,
          error: null
        });
      }
    } catch (error) {
      console.error('❌ Erro ao verificar status de autenticação:', error);
      setAuthState({
        user: null,
        isLoading: false,
        isAuthenticated: false,
        error: null
      });
    }
  };

  const register = async (userData: {
    nome_completo: string;
    nome_usuario: string;
    email: string;
    senha: string;
    tipo_conta: string;
    pais?: string;
    estado: string;
    instituicao_ensino: string;
  }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      console.log('📝 Enviando dados de registro:', userData);
      
      const backendUrls = [
        'http://0.0.0.0:3001/api/perfis',
        'http://localhost:3001/api/perfis',
        'http://127.0.0.1:3001/api/perfis'
      ];

      let response;
      let lastError;

      for (const url of backendUrls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(userData),
            signal: AbortSignal.timeout(10000)
          });

          if (response.status !== 0) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error("Não foi possível conectar ao servidor");
      }

      const result = await response.json();
      
      if (result.success) {
        // Salvar token e user ID
        const authToken = btoa(`${result.data.id}:${Date.now()}`);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_id', result.data.id);
        
        setAuthState({
          user: result.data,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true, data: result.data };
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro no registro:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no registro';
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, senha: string) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const backendUrls = [
        'http://0.0.0.0:3001/api/perfis/login',
        'http://localhost:3001/api/perfis/login',
        'http://127.0.0.1:3001/api/perfis/login'
      ];

      let response;
      let lastError;

      for (const url of backendUrls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, senha }),
            signal: AbortSignal.timeout(10000)
          });

          if (response.status !== 0) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error("Não foi possível conectar ao servidor");
      }

      const result = await response.json();
      
      if (result.success) {
        // Salvar token e user ID
        const authToken = btoa(`${result.data.id}:${Date.now()}`);
        localStorage.setItem('auth_token', authToken);
        localStorage.setItem('user_id', result.data.id);
        
        setAuthState({
          user: result.data,
          isLoading: false,
          isAuthenticated: true,
          error: null
        });

        return { success: true, data: result.data };
      } else {
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: result.error 
        }));
        return { success: false, error: result.error };
      }
    } catch (error) {
      console.error('❌ Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido no login';
      
      setAuthState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: errorMessage
      }));
      
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  return {
    ...authState,
    register,
    login,
    logout,
    checkAuthStatus
  };
}
