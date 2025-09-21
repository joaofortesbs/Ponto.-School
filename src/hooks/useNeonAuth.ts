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

  // Declarações de estado para setUser, setIsLoading e setError devem ser feitas aqui
  // Se este hook for usado em um contexto onde esses estados já existem, 
  // você precisará ajustá-lo para receber esses estados como parâmetros ou 
  // removê-los se a lógica de estado já estiver sendo tratada externamente.
  // Por enquanto, vamos simular a existência deles para que a lógica do `register` funcione.
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);


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
      setIsLoading(true);
      setError("");

      // Verificar se o servidor está rodando
      try {
        const healthCheck = await fetch("http://localhost:3001/api/status", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (!healthCheck.ok) {
          throw new Error("Servidor não está respondendo");
        }
      } catch (healthError) {
        setError("Servidor indisponível. Tente novamente em alguns segundos.");
        return { success: false, error: "Servidor indisponível" };
      }

      const response = await fetch("http://localhost:3001/api/perfis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        // Tentar ler a resposta como texto primeiro, depois como JSON
        let errorMessage = "Erro ao criar conta";
        try {
          const errorText = await response.text();
          if (errorText) {
            const errorData = JSON.parse(errorText);
            errorMessage = errorData.error || errorMessage;
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta:", parseError);
        }

        setError(errorMessage);
        return { success: false, error: errorMessage };
      }

      const data = await response.json();

      // Login automático após cadastro bem-sucedido
      const loginResponse = await fetch("http://localhost:3001/api/perfis/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: userData.email,
          senha: userData.senha,
        }),
      });

      if (!loginResponse.ok) {
        const loginErrorText = await loginResponse.text();
        let loginErrorMessage = "Erro no login automático";
        try {
          if (loginErrorText) {
            const loginErrorData = JSON.parse(loginErrorText);
            loginErrorMessage = loginErrorData.error || loginErrorMessage;
          }
        } catch (parseError) {
          console.error("Erro ao processar resposta de login:", parseError);
        }

        setError(loginErrorMessage);
        return { success: false, error: loginErrorMessage };
      }

      const loginData = await loginResponse.json();

      setUser(loginData.profile);
      setIsAuthenticated(true);

      // Salvar dados no localStorage
      localStorage.setItem("neon_user", JSON.stringify(loginData.profile));
      localStorage.setItem("neon_authenticated", "true");

      return { success: true, profile: loginData.profile };

    } catch (error) {
      console.error("Erro na requisição:", error);
      const errorMessage = error instanceof Error ? error.message : "Erro de conexão com o servidor";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
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
    ...authState,
    register,
    login,
    logout,
    checkAuthStatus
  };
}