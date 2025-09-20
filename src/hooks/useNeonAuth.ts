import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { neonDB, User, Session } from '@/lib/neon-db';

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

  // Função auxiliar para verificar e gerar ID do usuário (adaptada do useAuth original)
  const checkAndGenerateUserId = useCallback(async (user: User) => {
    if (!user) return;

    try {
      // Se já tiver ID válido, não precisa gerar
      if (user.user_id && /^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(user.user_id)) {
        console.log('Usuário já possui ID válido:', user.user_id);
        return;
      }

      console.log('Gerando ID para usuário existente...');

      // Obter dados necessários para gerar o ID
      let uf = user.estado_uf || '';

      // Tentar diferentes fontes para obter a UF
      if (!uf || uf.length !== 2 || uf === 'BR') {
        // Usar localStorage como fallback
        const savedState = localStorage.getItem('selectedState');
        if (savedState && savedState.length === 2 && savedState !== 'BR') {
          uf = savedState.toUpperCase();
        } else {
          // Último recurso: usar SP como padrão
          uf = 'SP';
        }
      }

      // Determinar tipo de conta
      let tipoConta = 2; // Padrão: tipo básico (2)
      
      // Gerar ID usando nossa função
      const generatedId = await neonDB.generateSequentialUserId(uf, tipoConta);

      if (generatedId) {
        // Atualizar o perfil com o novo ID
        const { error: updateError } = await neonDB.updateProfile(user.id, {
          user_id: generatedId,
          estado_uf: uf,
        });

        if (updateError) {
          console.error('Erro ao atualizar perfil com ID:', updateError);
        } else {
          console.log('ID de usuário gerado com sucesso:', generatedId);
          // Atualizar o estado local
          setAuth({ ...user, user_id: generatedId, estado_uf: uf }, authState.session, false);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/gerar ID de usuário:', error);
    }
  }, [authState.session, setAuth]);

  // Verificar token existente ao carregar
  useEffect(() => {
    const checkStoredAuth = async () => {
      try {
        const token = localStorage.getItem('neon_auth_token');
        if (!token) {
          setAuth(null, null, false);
          return;
        }

        // Verificar se o token ainda é válido
        const { user, error } = await neonDB.verifyToken(token);
        
        if (error || !user) {
          localStorage.removeItem('neon_auth_token');
          setAuth(null, null, false);
          return;
        }

        const session: Session = {
          access_token: token,
          user
        };

        setAuth(user, session, false);

        // Verificar e gerar ID se necessário
        if (user) {
          await checkAndGenerateUserId(user);
        }
      } catch (error) {
        console.error('Erro na verificação de autenticação:', error);
        localStorage.removeItem('neon_auth_token');
        setAuth(null, null, false, error);
      }
    };

    checkStoredAuth();
  }, [checkAndGenerateUserId, setAuth]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuth(null, null, true, null);
      
      const { user, session, error } = await neonDB.signInWithPassword(email, password);

      if (error || !user || !session) {
        setAuth(null, null, false, error);
        return { user: null, error };
      }

      // Armazenar token no localStorage
      localStorage.setItem('neon_auth_token', session.access_token);
      
      setAuth(user, session, false);

      // Verificar e gerar ID de usuário se necessário
      if (user) {
        await checkAndGenerateUserId(user);
      }

      return { user, error: null };
    } catch (error) {
      console.error('Erro no login:', error);
      setAuth(null, null, false, error);
      return { user: null, error };
    }
  }, [setAuth, checkAndGenerateUserId]);

  // Função de registro
  const register = useCallback(async (email: string, password: string, userData?: Record<string, any>) => {
    try {
      setAuth(null, null, true, null);
      
      const { user, error } = await neonDB.signUp(email, password, userData);

      if (error || !user) {
        setAuth(null, null, false, error);
        return { user: null, error };
      }

      // Após registro bem-sucedido, fazer login automaticamente
      const loginResult = await login(email, password);
      
      return loginResult;
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
      
      const { error } = await neonDB.signOut();

      setAuth(null, null, false);
      navigate('/login');
      
      return { error };
    } catch (error) {
      console.error('Erro no logout:', error);
      setAuth(authState.user, authState.session, false, error);
      return { error };
    }
  }, [authState.session, authState.user, setAuth, navigate]);

  // Função para resetar senha (implementação básica)
  const resetPassword = useCallback(async (email: string) => {
    try {
      // Por enquanto, apenas uma implementação placeholder
      // Em uma implementação completa, você enviaria um email com link de reset
      console.log('Reset de senha solicitado para:', email);
      return { error: null };
    } catch (error) {
      console.error('Erro no reset de senha:', error);
      return { error };
    }
  }, []);

  // Função para atualizar senha
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      if (!authState.user) {
        return { error: { message: 'Usuário não autenticado' } };
      }

      // Por enquanto, placeholder - em implementação completa você atualizaria a senha no banco
      console.log('Atualização de senha para usuário:', authState.user.id);
      return { error: null };
    } catch (error) {
      console.error('Erro na atualização de senha:', error);
      return { error };
    }
  }, [authState.user]);

  return {
    ...authState,
    login,
    register,
    logout,
    resetPassword,
    updatePassword
  };
}

export default useNeonAuth;