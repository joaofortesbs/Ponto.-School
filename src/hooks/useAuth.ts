import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/services/api';

interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  full_name?: string;
}

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      // Verificar se há usuário salvo no localStorage primeiro
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser);
          setState({
            user,
            loading: false,
            error: null,
          });
          return;
        } catch (e) {
          localStorage.removeItem('currentUser');
        }
      }

      // Verificar com o backend
      const response = await auth.getUser();

      if (response.data.user) {
        localStorage.setItem('currentUser', JSON.stringify(response.data.user));
        setState({
          user: response.data.user,
          loading: false,
          error: null,
        });
      } else {
        setState({
          user: null,
          loading: false,
          error: null,
        });
      }
    } catch (error: any) {
      setState({
        user: null,
        loading: false,
        error: error.message || 'Authentication error',
      });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      const response = await auth.signIn(email, password);

      if (!response.success) {
        setState(prev => ({ ...prev, loading: false, error: response.error }));
        return { success: false, error: response.error };
      }

      localStorage.setItem('currentUser', JSON.stringify(response.user));
      setState({
        user: response.user,
        loading: false,
        error: null,
      });

      return { success: true, user: response.user };
    } catch (error: any) {
      setState({
        user: null,
        loading: false,
        error: error.message || 'Sign in error',
      });
      return { success: false, error: error.message };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('auth_status');
      setState({
        user: null,
        loading: false,
        error: null,
      });
    } catch (error: any) {
      setState(prev => ({ ...prev, error: error.message }));
    }
  };

  return {
    user: state.user,
    loading: state.loading,
    error: state.error,
    signIn,
    signOut,
    checkAuth,
  };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Caregar usuário inicial
  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      const result = await auth.signIn(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Erro ao fazer login' };
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    try {
      const result = await auth.signUp(email, password, userData);
      if (result.success && result.user) {
        setUser(result.user);
        return { success: true };
      }
      return { success: false, error: result.error };
    } catch (error) {
      return { success: false, error: 'Erro ao criar conta' };
    }
  };

  const signOut = async () => {
    try {
      await auth.signOut();
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const currentUser = await auth.getUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const contextValue = React.useMemo<AuthContextType>(() => ({
    user,
    loading,
    signIn,
    signUp,
    signOut,
    refreshUser,
  }), [user, loading]);

  return React.createElement(
    AuthContext.Provider,
    { value: contextValue },
    children
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

// Hook simples para compatibilidade
export const useAuthSimple = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await auth.getUser();
        setUser(currentUser);
      } catch (error) {
        console.error('Erro ao carregar usuário:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  return { user, loading };
};