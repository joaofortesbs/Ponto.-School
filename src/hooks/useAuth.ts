
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { setWebPersistence, getWebPersistence } from '@/lib/web-persistence';

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

  // Verificar o estado de autenticação atual
  useEffect(() => {
    let unsubscribe: (() => void) | null = null;
    let isPageUnloading = false;

    // Salvar estado de autenticação em localStorage para persistência
    const saveAuthStateToStorage = (user: User | null, session: Session | null) => {
      if (user) {
        localStorage.setItem('auth_status', 'authenticated');
        localStorage.setItem('auth_cache_time', Date.now().toString());
        localStorage.setItem('auth_checked', 'true');
      }
    };

    // Manipulador para quando a página perde foco
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        // Quando a página fica oculta, salva o estado atual de autenticação
        if (authState.user) {
          saveAuthStateToStorage(authState.user, authState.session);
        }
      }
    };

    // Manipulador para quando a página está prestes a ser fechada ou recarregada
    const handleBeforeUnload = () => {
      isPageUnloading = true;
      if (authState.user) {
        saveAuthStateToStorage(authState.user, authState.session);
      }
    };

    const checkAuth = async () => {
      try {
        // Primeiro, verifique se temos um estado de autenticação armazenado
        const authStatus = localStorage.getItem('auth_status');
        const authChecked = localStorage.getItem('auth_checked');
        
        // Se temos um status salvo e estamos carregando inicialmente, use-o temporariamente
        if (authStatus === 'authenticated' && authChecked === 'true' && authState.isLoading) {
          // Definir isAuthenticated como true, mas ainda continuar verificando
          setAuth(authState.user, authState.session, true);
        }
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        const { session } = data;
        const user = session?.user || null;
        
        // Atualizar o estado de autenticação e salvar no localStorage
        setAuth(user, session, false);
        saveAuthStateToStorage(user, session);
        
        // Configurar o listener para mudanças na autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            const user = newSession?.user || null;
            setAuth(user, newSession, false);
            saveAuthStateToStorage(user, newSession);
            
            // Redirecionar com base no evento de autenticação
            if (event === 'SIGNED_IN' && user) {
              navigate('/dashboard');
            } else if (event === 'SIGNED_OUT' && !isPageUnloading) {
              navigate('/login');
            }
          }
        );
        
        // Armazenar a função de cancelamento da inscrição
        unsubscribe = () => {
          authListener.subscription.unsubscribe();
        };
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        setAuth(null, null, false, error as AuthError);
      }
    };
    
    // Adicionar ouvintes de eventos
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    checkAuth();
    
    // Limpar ouvintes e inscrições quando o componente for desmontado
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (unsubscribe) unsubscribe();
    };
  }, [navigate, setAuth, authState.user, authState.session, authState.isLoading]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuth(null, null, true, null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      
      const { user, session } = data;
      setAuth(user, session, false);
      
      // Salvar estado de autenticação
      localStorage.setItem('auth_status', 'authenticated');
      localStorage.setItem('auth_cache_time', Date.now().toString());
      localStorage.setItem('auth_checked', 'true');
      
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
      
      // Salvar estado de autenticação
      if (user) {
        localStorage.setItem('auth_status', 'authenticated');
        localStorage.setItem('auth_cache_time', Date.now().toString());
        localStorage.setItem('auth_checked', 'true');
      }
      
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
      
      // Limpar dados de autenticação do localStorage
      localStorage.removeItem('auth_status');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('auth_cache_time');
      
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
