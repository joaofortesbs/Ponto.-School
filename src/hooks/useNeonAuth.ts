import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ApiClient } from '@/services/api-client';

// Interfaces locais (removidas de neon-db.ts por segurança)
interface User {
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

interface Session {
  access_token: string;
}

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: any;
}

export function useNeonAuth() {
  const navigate = useNavigate();
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null
  });

  // Função para atualizar o estado de autenticação
  const setAuth = useCallback((
    user: User | null, 
    session: Session | null, 
    isLoading: boolean = false, 
    error: any = null
  ) => {
    setAuthState({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      error
    });
  }, []);

  // Verificar token existente ao carregar
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const token = localStorage.getItem('neon_auth_token');
        if (!token) {
          setAuth(null, null, false);
          return;
        }

        // Verificar se o token ainda é válido via API
        const response = await fetch('/api/auth/verify', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          localStorage.removeItem('neon_auth_token');
          setAuth(null, null, false);
          return;
        }

        const { user } = await response.json();
        
        const session: Session = {
          access_token: token
        };

        setAuth(user, session, false);
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        localStorage.removeItem('neon_auth_token');
        setAuth(null, null, false, error);
      }
    };

    checkStoredAuth();
  }, [setAuth]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuth(null, null, true, null);
      
      const { user, session, error } = await ApiClient.signInWithPassword(email, password);

      if (error || !user || !session) {
        setAuth(null, null, false, error);
        return { user: null, error };
      }

      // Armazenar token no localStorage
      localStorage.setItem('neon_auth_token', session.access_token);
      
      setAuth(user, session, false);

      return { user, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setAuth(null, null, false, error);
      return { user: null, error };
    }
  }, [setAuth]);

  // Função de registro
  const register = useCallback(async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      setAuth(null, null, true, null);
      
      const { user, session, error } = await ApiClient.register(email, password, userData);

      if (error || !user) {
        setAuth(null, null, false, error);
        return { user: null, error };
      }

      // Se o registro incluiu login automático
      if (session) {
        localStorage.setItem('neon_auth_token', session.access_token);
        setAuth(user, session, false);
      } else {
        // Caso contrário, fazer login separadamente
        const loginResult = await login(email, password);
        return loginResult;
      }
      
      return { user, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      setAuth(null, null, false, error);
      return { user: null, error };
    }
  }, [setAuth, login]);

  // Função de logout
  const logout = useCallback(async () => {
    try {
      setAuth(null, null, true, null);
      
      // Remover token do localStorage
      localStorage.removeItem('neon_auth_token');
      
      // Chamar endpoint de logout no backend (opcional)
      try {
        await fetch('/api/auth/logout', { method: 'POST' });
      } catch (e) {
        // Ignorar erros do logout no backend - o importante é limpar o cliente
      }

      setAuth(null, null, false);
      navigate('/login');
      
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      setAuth(null, null, false, error);
      return { error };
    }
  }, [setAuth, navigate]);

  // Função para atualizar perfil
  const updateProfile = useCallback(async (updates: Partial<User>) => {
    try {
      if (!authState.user || !authState.session) {
        throw new Error('Usuário não autenticado');
      }

      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authState.session.access_token}`
        },
        body: JSON.stringify(updates)
      });

      if (!response.ok) {
        throw new Error('Erro ao atualizar perfil');
      }

      const { user } = await response.json();
      
      setAuth(user, authState.session, false);
      
      return { user, error: null };
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      return { user: null, error };
    }
  }, [authState.user, authState.session, setAuth]);

  return {
    ...authState,
    login,
    register,
    logout,
    updateProfile,
    setAuth
  };
}