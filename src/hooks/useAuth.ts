
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Session, AuthError } from '@supabase/supabase-js';

interface AuthState {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | Error | null;
}

export function useAuth() {
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
    error: AuthError | Error | null = null
  ) => {
    setAuthState({
      user,
      session,
      isLoading,
      isAuthenticated: !!user,
      error
    });
  }, []);

import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { setWebPersistence, getWebPersistence } from '@/lib/web-persistence';

export function useAuth() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();

  // Verificar se já existe uma sessão ativa
  const checkSession = useCallback(async () => {
    try {
      setLoading(true);
      
      // Primeiro, verificar na persistência local para evitar flashes de login
      const persistedAuth = getWebPersistence('auth_session');
      if (persistedAuth && persistedAuth.isAuthenticated) {
        setIsAuthenticated(true);
        setUser(persistedAuth.user);
      }
      
      // Verificar com Supabase
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao verificar sessão:", error);
        // Não fazer logout automático em caso de erro de rede
        if (error.message.includes('network') || error.message.includes('timeout')) {
          // Manter estado anterior se for erro de rede
          return;
        }
        setError(error);
        setIsAuthenticated(false);
        return;
      }
      
      if (session) {
        setUser(session.user);
        setIsAuthenticated(true);
        // Persistir localmente para evitar problemas de desconexão
        setWebPersistence('auth_session', {
          isAuthenticated: true,
          user: session.user,
          timestamp: new Date().toISOString()
        });
        setError(null);
      } else if (!persistedAuth) {
        // Só desautentica se não tiver sessão persistida local
        setIsAuthenticated(false);
        setUser(null);
      }
    } catch (err) {
      console.error("Erro ao verificar autenticação:", err);
      setError(err);
      // Não desautenticar em caso de erro para evitar redirecionamentos indevidos
    } finally {
      setLoading(false);
    }
  }, []);

  // Efetuar login
  const login = useCallback(async (email, password) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setError(error);
        return { error };
      }

      setUser(data.user);
      setIsAuthenticated(true);
      setWebPersistence('auth_session', {
        isAuthenticated: true, 
        user: data.user,
        timestamp: new Date().toISOString()
      });
      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Efetuar registro
  const register = useCallback(async (email, password, userData) => {
    try {
      setLoading(true);
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: userData
        }
      });

      if (error) {
        setError(error);
        return { error };
      }

      return { data };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, []);

  // Efetuar logout
  const logout = useCallback(async () => {
    try {
      setLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(error);
        return { error };
      }
      
      // Limpar dados de autenticação
      setUser(null);
      setIsAuthenticated(false);
      setWebPersistence('auth_session', null);
      
      // Redirecionar para login
      navigate('/login');
      return { success: true };
    } catch (err) {
      setError(err);
      return { error: err };
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  // Verificar visibilidade da página para evitar redirecionamentos incorretos
  useEffect(() => {
    let visibilityChange = false;
    
    // Função para lidar com mudança de visibilidade
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible' && visibilityChange) {
        // Verificar sessão apenas se mudou de hidden para visible
        checkSession();
        visibilityChange = false;
      } else if (document.visibilityState === 'hidden') {
        visibilityChange = true;
      }
    };
    
    // Adicionar listener para detectar mudança de guia/foco
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    // Verificar sessão inicial
    checkSession();
    
    // Configurar listener de alteração de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_IN') {
          setUser(session.user);
          setIsAuthenticated(true);
          setWebPersistence('auth_session', {
            isAuthenticated: true,
            user: session.user,
            timestamp: new Date().toISOString()
          });
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setWebPersistence('auth_session', null);
        }
      }
    );

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (authListener && authListener.subscription) {
        authListener.subscription.unsubscribe();
      }
    };
  }, [checkSession]);

  return {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    register,
    logout,
    checkSession
  };
}


  // Verificar o estado de autenticação atual
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        const { session } = data;
        const user = session?.user || null;
        
        setAuth(user, session, false);
        
        // Configurar o listener para mudanças na autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            const user = newSession?.user || null;
            setAuth(user, newSession, false);
            
            // Redirecionar com base no evento de autenticação
            if (event === 'SIGNED_IN' && user) {
              navigate('/dashboard');
            } else if (event === 'SIGNED_OUT') {
              navigate('/login');
            }
          }
        );
        
        // Limpar o listener quando o componente for desmontado
        return () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setAuth(null, null, false, error as AuthError);
      }
    };
    
    checkAuth();
  }, [navigate, setAuth]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuth(null, null, true, null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      const { user, session } = data;
      setAuth(user, session, false);
      return { user, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setAuth(null, null, false, error as AuthError);
      return { user: null, error };
    }
  }, [setAuth]);

  // Função de registro
  const register = useCallback(async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      setAuth(null, null, true, null);
      const { data, error } = await supabase.auth.signUp({ 
        email, 
        password,
        options: { 
          data: userData,
          emailRedirectTo: `${window.location.origin}/auth/callback` 
        }
      });
      
      if (error) throw error;
      
      const { user, session } = data;
      setAuth(user, session, false);
      return { user, error: null };
    } catch (error) {
      console.error('Erro no registro:', error);
      setAuth(null, null, false, error as AuthError);
      return { user: null, error };
    }
  }, [setAuth]);

  // Função de logout
  const logout = useCallback(async () => {
    try {
      setAuth(null, null, true, null);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      setAuth(null, null, false);
      return { error: null };
    } catch (error) {
      console.error('Erro no logout:', error);
      setAuth(authState.user, authState.session, false, error as AuthError);
      return { error };
    }
  }, [authState.session, authState.user, setAuth]);

  // Função para resetar senha
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      return { error };
    }
  }, []);

  // Função para atualizar senha
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password: newPassword });
      
      if (error) throw error;
      
      return { error: null };
    } catch (error) {
      console.error('Erro na atualização de senha:', error);
      return { error };
    }
  }, []);

  return {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  };
}

export default useAuth;
