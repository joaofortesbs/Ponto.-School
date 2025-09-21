import { useState, useEffect } from 'react';
import { executeQuery } from '@/lib/neon-db';
import bcrypt from 'bcryptjs';

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

      // Verificar se o token é válido
      const userId = localStorage.getItem('user_id');
      if (userId) {
        const response = await fetch(`/api/perfis?id=${userId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          }
        });

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
      setAuthState(prev => ({ ...prev, isLoading: false, error: 'Erro ao verificar autenticação' }));
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

      // Verificar se o servidor está rodando com timeout
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);

        const healthCheck = await fetch("http://localhost:3001/api/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!healthCheck.ok) {
          throw new Error("Servidor não está respondendo");
        }

        const healthData = await healthCheck.json();
        console.log("✅ Servidor disponível:", healthData);

      } catch (healthError) {
        console.error("❌ Erro de conectividade:", healthError);
        setAuthState(prev => ({ 
          ...prev, 
          isLoading: false, 
          error: "Servidor indisponível. Verifique se o backend está rodando." 
        }));
        return { success: false, error: "Servidor indisponível" };
      }

      console.log("📤 Enviando dados de cadastro:", { ...userData, senha: "[HIDDEN]" });

      const response = await fetch("http://localhost:3001/api/perfis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify(userData),
      });

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
      const loginResponse = await fetch("http://localhost:3001/api/perfis/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          senha: userData.senha,
        }),
      });

      if (!loginResponse.ok) {
        let loginErrorMessage = "Erro no login automático";
        try {
          const contentType = loginResponse.headers.get("content-type");
          if (contentType && contentType.includes("application/json")) {
            const loginErrorData = await loginResponse.json();
            loginErrorMessage = loginErrorData.error || loginErrorMessage;
          } else {
            const loginErrorText = await loginResponse.text();
            loginErrorMessage = loginErrorText || loginErrorMessage;
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta de login:", parseError);
          loginErrorMessage = `Erro HTTP ${loginResponse.status}: ${loginResponse.statusText}`;
        }

        console.error("❌ Erro no login automático:", loginErrorMessage);
        setAuthState(prev => ({ ...prev, isLoading: false, error: loginErrorMessage }));
        return { success: false, error: loginErrorMessage };
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
          errorMessage = "Timeout na conexão com o servidor";
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

      // Primeiro buscar o usuário
      const response = await fetch(`/api/perfis?email=${encodeURIComponent(email)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('Email ou senha incorretos');
      }

      const user = result.data;

      // Verificar senha usando o endpoint de database
      const passwordCheckResult = await executeQuery('SELECT senha_hash FROM perfis WHERE email = $1', [email]);

      if (!passwordCheckResult.success || passwordCheckResult.data.length === 0) {
        throw new Error('Email ou senha incorretos');
      }

      const isValidPassword = await bcrypt.compare(senha, passwordCheckResult.data[0].senha_hash);

      if (!isValidPassword) {
        throw new Error('Email ou senha incorretos');
      }

      // Gerar token
      const token = btoa(`${user.id}:${Date.now()}`);

      localStorage.setItem('auth_token', token);
      localStorage.setItem('user_id', user.id);

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