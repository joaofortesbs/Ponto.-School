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

  // Função auxiliar para verificar e gerar ID do usuário
  const checkAndGenerateUserId = useCallback(async (user: User) => {
    if (!user) return;

    try {
      // Consultar perfil para verificar se já tem ID válido
      const { data: profileData } = await supabase
        .from('profiles')
        .select('user_id, state')
        .eq('id', user.id)
        .single();

      // Se já tiver ID válido, não precisa gerar
      if (profileData?.user_id && /^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(profileData.user_id)) {
        console.log('Usuário já possui ID válido:', profileData.user_id);
        return;
      }

      console.log('Gerando ID para usuário existente...');

      // Obter dados necessários para gerar o ID
      let uf = profileData?.state || '';
      const userData = user.user_metadata || {};

      // Tentar diferentes fontes para obter a UF
      if (!uf || uf.length !== 2 || uf === 'BR') {
        // Tentar do user_metadata
        if (userData.state && userData.state.length === 2 && userData.state !== 'BR') {
          uf = userData.state.toUpperCase();
        } else {
          // Usar localStorage como fallback
          const savedState = localStorage.getItem('selectedState');
          if (savedState && savedState.length === 2 && savedState !== 'BR') {
            uf = savedState.toUpperCase();
          } else {
            // Último recurso: usar SP como padrão
            uf = 'SP';
          }
        }
      }

      // Determinar tipo de conta
      let tipoConta = 2; // Padrão: tipo básico (2)
      if (userData.plan_type) {
        const planLower = userData.plan_type.toLowerCase().trim();
        if (planLower === 'premium' || planLower === 'full') {
          tipoConta = 1; // Tipo Full/Premium
        }
      }

      // Gerar ID usando RPC function
      const { data: generatedId, error: idError } = await supabase.rpc(
        'generate_sequential_user_id',
        { p_uf: uf, p_tipo_conta: tipoConta }
      );

      if (idError || !generatedId) {
        console.error('Erro ao gerar ID sequencial:', idError);
        return;
      }

      if (generatedId) {
        // Atualizar o perfil com o novo ID
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            user_id: generatedId,
            state: uf,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);

        if (updateError) {
          console.error('Erro ao atualizar perfil com ID:', updateError);
        } else {
          console.log('ID de usuário gerado com sucesso:', generatedId);
        }
      }
    } catch (error) {
      console.error('Erro ao verificar/gerar ID de usuário:', error);
    }
  }, []);

  // Verificar o estado de autenticação atual
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Verificar se é uma rota pública
        const currentPath = window.location.pathname;
        const isPublicRoute = currentPath.startsWith('/atividade/') ||
                              currentPath === '/quiz' ||
                              currentPath === '/blank' ||
                              currentPath.includes('/atividade/');

        const isAuthRoute = currentPath === '/login' ||
                           currentPath === '/register' ||
                           currentPath === '/forgot-password' ||
                           currentPath === '/reset-password';

        if (isPublicRoute) {
          console.log('🔓 Rota pública detectada, permitindo acesso sem autenticação');
          setAuthState(prevState => ({
            ...prevState,
            user: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            error: null
          }));
          return;
        }

        if (isAuthRoute) {
          console.log('🔑 Rota de autenticação detectada');
          setAuthState(prevState => ({
            ...prevState,
            isLoading: false
          }));
          return;
        }

        const { data, error } = await supabase.auth.getSession();

        if (error) throw error;

        const { session } = data;
        const user = session?.user || null;

        setAuth(user, session, false);

        // Se tiver usuário, verificar e gerar ID se necessário
        if (user) {
          await checkAndGenerateUserId(user);
        }

        // Configurar o listener para mudanças na autenticação
        const { data: authListener } = supabase.auth.onAuthStateChange(
          async (event, newSession) => {
            const user = newSession?.user || null;
            setAuth(user, newSession, false);

            // Verificar e gerar ID quando o usuário fizer login
            if (event === 'SIGNED_IN' && user) {
              await checkAndGenerateUserId(user);
              // Só redirecionar se não estiver em rota pública
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith('/atividade/')) {
                navigate('/dashboard');
              }
            } else if (event === 'SIGNED_OUT') {
              // Só redirecionar se não estiver em rota pública
              const currentPath = window.location.pathname;
              if (!currentPath.startsWith('/atividade/')) {
                navigate('/login');
              }
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
        // Redirecionar para login apenas se não estiver em uma rota de autenticação
        const currentPath = window.location.pathname;
        if (!currentPath.startsWith('/atividade/') &&
            currentPath !== '/login' &&
            currentPath !== '/register' &&
            currentPath !== '/forgot-password' &&
            currentPath !== '/reset-password' &&
            currentPath !== '/quiz' &&
            currentPath !== '/blank') {
          navigate('/login');
        }
      }
    };

    checkAuth();
  }, [navigate, setAuth, checkAndGenerateUserId]);

  // Função de login
  const login = useCallback(async (email: string, password: string) => {
    try {
      setAuth(null, null, true, null);
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });

      if (error) throw error;

      const { user, session } = data;
      setAuth(user, session, false);

      // Verificar e gerar ID de usuário se necessário
      if (user) {
        try {
          // Consultar perfil para verificar se já tem ID válido
          const { data: profileData } = await supabase
            .from('profiles')
            .select('user_id, state')
            .eq('id', user.id)
            .single();

          // Se não existir ID ou o ID não estiver no formato correto
          if (!profileData?.user_id || !/^[A-Z]{2}\d{4}[1-2]\d{6}$/.test(profileData.user_id)) {
            console.log('Gerando ID para novo usuário...');

            // Obter dados necessários para gerar o ID
            let uf = profileData?.state || '';
            const userData = user.user_metadata || {};

            // Tentar diferentes fontes para obter a UF
            if (!uf || uf.length !== 2 || uf === 'BR') {
              // Tentar do user_metadata
              if (userData.state && userData.state.length === 2 && userData.state !== 'BR') {
                uf = userData.state.toUpperCase();
              } else {
                // Usar localStorage como fallback
                const savedState = localStorage.getItem('selectedState');
                if (savedState && savedState.length === 2 && savedState !== 'BR') {
                  uf = savedState.toUpperCase();
                } else {
                  // Último recurso: usar SP como padrão
                  uf = 'SP';
                }
              }
            }

            // Determinar tipo de conta
            let tipoConta = 2; // Padrão: tipo básico (2)
            if (userData.plan_type) {
              const planLower = userData.plan_type.toLowerCase().trim();
              if (planLower === 'premium' || planLower === 'full') {
                tipoConta = 1; // Tipo Full/Premium
              }
            }

            // Gerar ID usando RPC function
            const { data: generatedId, error: idError } = await supabase.rpc(
              'generate_sequential_user_id',
              { p_uf: uf, p_tipo_conta: tipoConta }
            );

            if (idError || !generatedId) {
              console.error('Erro ao gerar ID sequencial:', idError);
              // Continuar sem falhar o login
            } else if (generatedId) {
              // Atualizar o perfil com o novo ID
              const { error: updateError } = await supabase
                .from('profiles')
                .update({
                  user_id: generatedId,
                  state: uf,
                  updated_at: new Date().toISOString()
                })
                .eq('id', user.id);

              if (updateError) {
                console.error('Erro ao atualizar perfil com ID:', updateError);
              } else {
                console.log('ID de usuário gerado com sucesso:', generatedId);
              }
            }
          }
        } catch (idGenError) {
          console.error('Erro ao gerar ID de usuário:', idGenError);
          // Continuar sem falhar o login
        }
      }

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