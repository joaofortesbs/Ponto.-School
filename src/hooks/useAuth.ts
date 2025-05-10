
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
