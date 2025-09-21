
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
      if (!token) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
        return;
      }

      const userId = localStorage.getItem('user_id');
      if (userId) {
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
              signal: AbortSignal.timeout(3000)
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
          throw lastError || new Error("Backend não está disponível");
        }

        const result = await response.json();

        if (result.success) {
          setAuthState({
            user: result.data,
            isLoading: false,
            isAuthenticated: true,
            error: null
          });
        } else {
          localStorage.removeItem('auth_token');
          localStorage.removeItem('user_id');
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      }
    } catch (error) {
      console.error('Erro ao verificar autenticação:', error);
      setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
    }
  };

  const register = async (userData: {
    nome_completo: string;
    nome_usuario: string;
    email: string;
    senha: string;
    tipo_conta: string;
    pais: string;
    estado: string;
    instituicao_ensino: string;
  }) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      // Primeira verificação: backend está rodando?
      const statusUrls = [
        "http://0.0.0.0:3001/api/status",
        "http://localhost:3001/api/status",
        "http://127.0.0.1:3001/api/status"
      ];

      let backendAvailable = false;
      for (const url of statusUrls) {
        try {
          const statusResponse = await fetch(url, {
            method: 'GET',
            signal: AbortSignal.timeout(2000)
          });
          if (statusResponse.ok) {
            backendAvailable = true;
            break;
          }
        } catch (error) {
          continue;
        }
      }

      if (!backendAvailable) {
        const errorMessage = "Servidor indisponível. Verifique se o backend está rodando.";
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const backendUrls = [
        "http://0.0.0.0:3001/api/perfis",
        "http://localhost:3001/api/perfis",
        "http://127.0.0.1:3001/api/perfis"
      ];

      let response;
      let lastError;

      for (const url of backendUrls) {
        try {
          response = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify(userData),
            signal: AbortSignal.timeout(8000)
          });

          if (response.ok || response.status < 500) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response) {
        const errorMessage = "Não foi possível conectar ao servidor. Verifique sua conexão.";
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      if (!response.ok) {
        let errorMessage = "Erro ao criar conta";
        try {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } else {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
        } catch (parseError) {
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }

        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Login automático após cadastro
      const loginUrls = [
        "http://0.0.0.0:3001/api/perfis/login",
        "http://localhost:3001/api/perfis/login",
        "http://127.0.0.1:3001/api/perfis/login"
      ];

      let loginResponse;
      for (const url of loginUrls) {
        try {
          loginResponse = await fetch(url, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Accept": "application/json",
            },
            body: JSON.stringify({
              email: userData.email,
              senha: userData.senha,
            }),
            signal: AbortSignal.timeout(5000)
          });

          if (loginResponse.ok) break;
        } catch (error) {
          continue;
        }
      }

      if (!loginResponse || !loginResponse.ok) {
        setAuthState(prev => ({ ...prev, isLoading: false, error: "Conta criada! Faça login manualmente." }));
        return { success: true, profile: data.profile, needsManualLogin: true };
      }

      const loginData = await loginResponse.json();

      setAuthState({
        user: loginData.profile,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      localStorage.setItem("neon_user", JSON.stringify(loginData.profile));
      localStorage.setItem("neon_authenticated", "true");

      return { success: true, profile: loginData.profile };

    } catch (error) {
      console.error("Erro geral na requisição:", error);
      let errorMessage = "Erro de conexão com o servidor";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = "Timeout na conexão. Tente novamente.";
        } else if (error.message.includes('fetch')) {
          errorMessage = "Erro de rede. Verifique sua conexão.";
        } else {
          errorMessage = error.message;
        }
      }
      
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const login = async (email: string, senha: string) => {
    try {
      setAuthState(prev => ({ ...prev, isLoading: true, error: null }));

      const loginUrls = [
        "http://0.0.0.0:3001/api/perfis/login",
        "http://localhost:3001/api/perfis/login", 
        "http://127.0.0.1:3001/api/perfis/login"
      ];

      let response;
      let lastError;

      for (const url of loginUrls) {
        try {
          response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, senha }),
            signal: AbortSignal.timeout(5000)
          });

          if (response.ok || response.status < 500) {
            break;
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        const errorData = response ? await response.json() : {};
        throw new Error(errorData.error || 'Email ou senha incorretos');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Email ou senha incorretos');
      }

      const user = result.profile;
      const token = btoa(`${user.id}:${Date.now()}`);

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user.id);
      localStorage.setItem("neon_user", JSON.stringify(user));
      localStorage.setItem("neon_authenticated", "true");

      setAuthState({
        user,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      return { success: true, user };
    } catch (error) {
      console.error('Erro no login:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erro ao fazer login';
      setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  };

  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_id');
    localStorage.removeItem("neon_user");
    localStorage.removeItem("neon_authenticated");
    
    setAuthState({
      user: null,
      isLoading: false,
      isAuthenticated: false,
      error: null
    });
  };

  return {
    user: authState.user,
    isLoading: authState.isLoading,
    isAuthenticated: authState.isAuthenticated,
    error: authState.error,
    register,
    login,
    logout,
    checkAuthStatus
  };
}
