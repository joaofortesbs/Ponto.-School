
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
        // Tentar múltiplas URLs para o backend
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
              console.log("✅ Conexão estabelecida com:", url);
              break;
            }
          } catch (error) {
            lastError = error;
            console.log("Tentando próxima URL...", error.message);
            continue;
          }
        }

        if (!response || !response.ok) {
          throw lastError || new Error("Nenhuma URL de backend respondeu");
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
      setAuthState(prev => ({ ...prev, isLoading: false, error: null })); // Não mostrar erro na verificação
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

      console.log("📤 Enviando dados de cadastro:", { ...userData, senha: "[HIDDEN]" });

      const response = await fetch("http://0.0.0.0:3001/api/perfis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData)
      });

      console.log("📥 Status da resposta:", response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = "Erro ao criar conta";
        try {
          const errorData = await response.json();
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (parseError) {
          const errorText = await response.text();
          errorMessage = errorText || `Erro HTTP ${response.status}`;
        }

        console.error("❌ Erro no cadastro:", errorMessage);
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log("✅ Cadastro realizado com sucesso:", data);

      // Login automático após cadastro
      const loginResponse = await fetch("http://0.0.0.0:3001/api/perfis/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          senha: userData.senha,
        })
      });

      if (!loginResponse.ok) {
        console.warn("⚠️ Login automático falhou, mas cadastro foi bem-sucedido");
        setAuthState(prev => ({ ...prev, isLoading: false, error: null }));
        return { success: true, profile: data.profile, needsManualLogin: true };
      }

      const loginData = await loginResponse.json();
      console.log("✅ Login automático realizado com sucesso:", loginData);

      setAuthState({
        user: loginData.profile,
        isLoading: false,
        isAuthenticated: true,
        error: null
      });

      // Salvar dados no localStorage
      localStorage.setItem("neon_user", JSON.stringify(loginData.profile));
      localStorage.setItem("neon_authenticated", "true");

      return { success: true, profile: loginData.profile };

    } catch (error) {
      console.error("❌ Erro geral na requisição:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro de conexão com o servidor";
      
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
            console.log("✅ Login conectado em:", url);
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

      // Gerar token
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
