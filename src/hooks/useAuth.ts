import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { auth } from '@/services/api';

interface User {
  id: string;
  email: string;
  username?: string;
  display_name?: string;
  full_name?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, userData?: any) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Caregar usuário inicial
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await auth.getUser();
        if (response.data.user) {
          setUser(response.data.user);
        }
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
      localStorage.removeItem('currentUser');
      localStorage.removeItem('auth_checked');
      localStorage.removeItem('auth_status');
      setUser(null);
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const refreshUser = async () => {
    try {
      const response = await auth.getUser();
      if (response.data.user) {
        setUser(response.data.user);
      }
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

// Hook simples para compatibilidade com código existente
export const useAuthSimple = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await auth.getUser();
        if (response.data.user) {
          setUser(response.data.user);
        }
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