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
        // Usar proxy do Vite para conectar ao backend
        const backendUrls = [
          `/api/perfis?id=${userId}`
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

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.error("Resposta não é JSON:", await response.text());
          throw new Error("Resposta inválida do servidor");
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

      const backendUrls = [
        "/api/perfis"
      ];

      let response;
      let lastError;

      // Tentar registrar com cada URL
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
            console.log("✅ Conexão de registro estabelecida com:", url);
            break;
          }
        } catch (error) {
          lastError = error;
          console.log("Tentando próxima URL para registro...", error.message);
          continue;
        }
      }

      if (!response) {
        throw lastError || new Error("Não foi possível conectar ao servidor");
      }

      console.log("📥 Status da resposta:", response.status, response.statusText);

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
          console.error("Erro ao processar resposta de erro:", parseError);
          errorMessage = `Erro HTTP ${response.status}: ${response.statusText}`;
        }

        console.error("❌ Erro no cadastro:", errorMessage);
        setAuthState(prev => ({ ...prev, isLoading: false, error: errorMessage }));
        return { success: false, error: errorMessage };
      }

      const data = await response.json();
      console.log("✅ Cadastro realizado com sucesso:", data);

      // Login automático após cadastro bem-sucedido
      console.log("🔐 Tentando login automático...");

      const loginUrls = [
        "/api/perfis/login"
      ];

      let loginResponse;
      let loginLastError;

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

          if (loginResponse.ok || loginResponse.status < 500) {
            console.log("✅ Login conectado em:", url);
            break;
          }
        } catch (error) {
          loginLastError = error;
          console.log("Tentando próxima URL para login...", error.message);
          continue;
        }
      }

      if (!loginResponse || !loginResponse.ok) {
        console.warn("⚠️ Login automático falhou, mas cadastro foi bem-sucedido");
        setAuthState(prev => ({ ...prev, isLoading: false, error: "Conta criada! Faça login manualmente." }));
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
        "/api/perfis/login"
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
        let errorMessage = 'Email ou senha incorretos';
        if (response) {
          try {
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.includes("application/json")) {
              const errorData = await response.json();
              errorMessage = errorData.error || errorMessage;
            }
          } catch (e) {
            console.error("Erro ao parsear resposta de erro:", e);
          }
        }
        throw new Error(errorMessage);
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