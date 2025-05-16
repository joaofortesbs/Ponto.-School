import { supabase } from "./supabase";

/**
 * Verifica se o usuário está autenticado na aplicação
 * Consulta o localStorage primeiro e, se necessário, o Supabase
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Verificar cache local para resposta instantânea
    const cachedStatus = localStorage.getItem('auth_status');
    const cacheTime = localStorage.getItem('auth_cache_time');
    const now = Date.now();

    // Resposta instantânea com base no cache recente (validade de 30 minutos)
    if (cachedStatus === 'authenticated' && cacheTime && (now - parseInt(cacheTime)) < 30 * 60 * 1000) {
      // Verificar em background após retornar resposta
      requestAnimationFrame(() => {
        // Usar Promise.race para limitar tempo de espera
        Promise.race([
          supabase.auth.getSession(),
          new Promise((_, reject) => setTimeout(() => reject(new Error('Timeout')), 3000))
        ]).then(({ data }) => {
          if (!!data?.session !== (cachedStatus === 'authenticated')) {
            localStorage.setItem('auth_status', !!data?.session ? 'authenticated' : 'unauthenticated');
            localStorage.setItem('auth_cache_time', now.toString());
          }
        }).catch(() => {
          // Ignorar erros silenciosamente na verificação em background
        });
      });

      return true;
    }

    // Sem cache válido, mas tentar retornar rápido com base em cache antigo
    if (cachedStatus === 'authenticated') {
      // Verificar em background, mas já retornar resposta positiva
      requestAnimationFrame(() => {
        supabase.auth.getSession().then(({ data }) => {
          localStorage.setItem('auth_status', !!data?.session ? 'authenticated' : 'unauthenticated');
          localStorage.setItem('auth_cache_time', now.toString());
        }).catch(() => {});
      });

      return true;
    }

    // Timeout para garantir que a verificação não bloqueie a UI
    const authPromise = Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) => setTimeout(() => 
        resolve({data: {session: null}}), 2000))
    ]);

    const { data } = await authPromise;
    const isAuthenticated = !!data?.session;

    // Atualizar cache
    localStorage.setItem('auth_checked', 'true');
    localStorage.setItem('auth_status', isAuthenticated ? 'authenticated' : 'unauthenticated');
    localStorage.setItem('auth_cache_time', now.toString());

    return isAuthenticated;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);

    // Em erro, confiar no cache existente
    const cachedStatus = localStorage.getItem('auth_status');
    if (cachedStatus === 'authenticated') {
      return true;
    }

    return false;
  }
};

/**
 * Limpa os dados de autenticação do localStorage
 */
export const clearAuthState = (): void => {
  localStorage.removeItem('auth_checked');
  localStorage.removeItem('auth_status');

  // Opcionalmente, remover a flag de primeiro login para testes
  // Descomente para testes:
  // localStorage.removeItem('hasLoggedInBefore');
};

/**
 * Atualiza o estado de autenticação após login bem-sucedido
 */
export const setAuthenticatedState = (): void => {
  localStorage.setItem('auth_checked', 'true');
  localStorage.setItem('auth_status', 'authenticated');
};

/**
 * Verifica se é o primeiro login do usuário específico
 * @param userId ID do usuário atual
 * @returns true se for o primeiro login deste usuário específico
 */
export const isFirstLoginForUser = (userId: string): boolean => {
  if (!userId) return false;
  const key = `hasLoggedInBefore_${userId}`;
  return !localStorage.getItem(key);
};

/**
 * Marca como não sendo mais o primeiro login para este usuário específico
 * @param userId ID do usuário atual
 */
export const markUserAsLoggedIn = (userId: string): void => {
  if (!userId) return;
  const key = `hasLoggedInBefore_${userId}`;
  localStorage.setItem(key, 'true');
};


/**
 * Salva o nome de usuário para uso consistente em toda a aplicação
 * @param displayName Nome a ser exibido (display_name)
 * @param fullName Nome completo (full_name)
 * @param username Nome de usuário (username)
 */
export const saveUserDisplayName = (displayName?: string | null, fullName?: string | null, username?: string | null): void => {
  // Ordem de prioridade corrigida: display_name > primeiro nome do full_name > username > fallback
  const firstName = displayName || (fullName ? fullName.split(' ')[0] : null) || username || "Usuário";
  localStorage.setItem('userFirstName', firstName);

  // Também guardar display_name separadamente para uso em outros componentes
  if (displayName) {
    localStorage.setItem('userDisplayName', displayName);
  }

  // Garantir que o username também seja salvo corretamente
  if (username && username !== 'Usuário' && !username.startsWith('user_')) {
    localStorage.setItem('username', username);

    // Armazenar também no sessionStorage como backup
    try {
      sessionStorage.setItem('username', username);
    } catch (e) {
      console.warn('Erro ao salvar username no sessionStorage', e);
    }

    // Disparar evento para sincronização
    document.dispatchEvent(new CustomEvent('usernameUpdated', { 
      detail: { username } 
    }));
  }
};

/**
 * Verifica e repara inconsistências nos nomes de usuário salvos
 */
export const repairUsernames = async (): Promise<void> => {
  try {
    // Obter usernames de todas as fontes
    const localUsername = localStorage.getItem('username');
    const sessionUsername = sessionStorage.getItem('username');
    const userFirstName = localStorage.getItem('userFirstName');
    const userDisplayName = localStorage.getItem('userDisplayName');

    console.log('Verificando consistência de usernames:', {
      localUsername,
      sessionUsername,
      userFirstName,
      userDisplayName
    });

    // Verificar se existe uma sessão ativa
    const { data: sessionData } = await supabase.auth.getSession();

    if (sessionData?.session?.user) {
      const email = sessionData.session.user.email;

      // Buscar perfil no Supabase
      if (email) {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, display_name, email, id')
          .eq('email', email)
          .single();

        // Determinar o melhor username disponível
        let bestUsername = '';

        // Prioridade: profile > localStorage > sessionStorage > email
        if (profileData?.username && profileData.username !== 'Usuário') {
          bestUsername = profileData.username;
        } else if (localUsername && localUsername !== 'Usuário') {
          bestUsername = localUsername;
        } else if (sessionUsername && sessionUsername !== 'Usuário') {
          bestUsername = sessionUsername;
        } else if (email) {
          // Usar parte do email como username
          bestUsername = email.split('@')[0];
        }

        // Se encontramos um bom username, atualizar em todos os lugares
        if (bestUsername && bestUsername !== 'Usuário') {
          // Atualizar localStorage e sessionStorage
          localStorage.setItem('username', bestUsername);
          try { sessionStorage.setItem('username', bestUsername); } catch (e) {}

          // Atualizar perfil se necessário
          if (profileData && (!profileData.username || profileData.username === 'Usuário')) {
            await supabase
              .from('profiles')
              .update({ 
                username: bestUsername,
                updated_at: new Date().toISOString()
              })
              .eq('id', profileData.id);

            console.log('Perfil atualizado com novo username:', bestUsername);
          }

          // Disparar evento para notificar outros componentes
          document.dispatchEvent(new CustomEvent('usernameRepaired', { 
            detail: { username: bestUsername } 
          }));
        }
      }
    }
  } catch (error) {
    console.error('Erro ao reparar usernames:', error);
  }
};

/**
 * Obtém o nome de exibição do usuário salvo
 * @returns Nome do usuário para exibição
 */
export const getUserDisplayName = (): string => {
  return localStorage.getItem('userFirstName') || "Usuário";
};

export const signInWithEmail = async (email: string, password: string) => {
  try {
    console.log("Tentando login com email:", email);
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error("Erro na autenticação:", error.message);
      throw error;
    }

    if (data?.user) {
      localStorage.setItem('auth_checked', 'true');
      localStorage.setItem('auth_status', 'authenticated');

      // Após login bem-sucedido, buscar informações do perfil
      try {
        const { data: profileData } = await supabase
          .from('profiles')
          .select('username, display_name, email, full_name')
          .eq('id', data.user.id)
          .single();

        if (profileData) {
          // Salvar os dados do usuário para uso rápido na aplicação
          saveUserDisplayName(
            profileData.display_name, 
            profileData.full_name, 
            profileData.username
          );

          // Garantir que o username está salvo corretamente
          if (profileData.username) {
            localStorage.setItem('username', profileData.username);
            try { sessionStorage.setItem('username', profileData.username); } catch (e) {}
          }
        }
      } catch (e) {
        console.warn("Erro ao obter perfil após login:", e);
      }

      // Não armazenamos mais timestamp de sessão para que o modal sempre apareça
    }

    return { success: true, data };
  } catch (error) {
    console.error("Erro ao fazer login:", error);
    return { success: false, error };
  }
};

/**
 * Função para login com nome de usuário
 * Primeiro busca o email associado ao username e depois faz login
 */
export const signInWithUsername = async (username: string, password: string) => {
  try {
    console.log("Iniciando login com username:", username);

    // Primeiro, buscar o email associado ao nome de usuário (case insensitive para maior flexibilidade)
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email, username, display_name')
      .ilike('username', username)
      .limit(1);

    if (profileError || !profileData || profileData.length === 0) {
      console.log("Nome de usuário não encontrado:", username, profileError);
      return { 
        success: false, 
        error: new Error("Nome de usuário não encontrado")
      };
    }

    const userProfile = profileData[0];
    
    if (!userProfile.email) {
      console.log("Perfil encontrado, mas sem email associado:", username);
      return {
        success: false,
        error: new Error("Conta com informações incompletas. Por favor, contate o suporte.")
      };
    }

    // Salvar o username confirmado
    try {
      localStorage.setItem('username', userProfile.username);
      localStorage.setItem('userFirstName', userProfile.display_name || username);

      // Armazenar também no sessionStorage como backup
      sessionStorage.setItem('username', userProfile.username);
    } catch (e) {
      console.warn("Erro ao salvar username no cache:", e);
    }

    console.log("Username encontrado, email associado:", userProfile.email);
    // Usar o email encontrado para fazer login
    return signInWithEmail(userProfile.email, password);

  } catch (error) {
    console.error("Erro ao fazer login com nome de usuário:", error);
    return { success: false, error };
  }
};

  // Função para redirecionar usuário para login após registro bem-sucedido
  export const redirectToLoginAfterRegistration = (username: string) => {
    try {
      localStorage.setItem('redirectTimer', 'active');
      localStorage.setItem('lastRegisteredUsername', username || '');
      
      // Armazenar informações adicionais para melhorar a experiência de login
      if (username) {
        localStorage.setItem('prefillUsername', username);
        localStorage.setItem('registrationComplete', 'true');
        localStorage.setItem('registrationTime', Date.now().toString());
      }

      console.log("Configurando redirecionamento automático para login com username:", username);

      // Redirecionar para página de login com indicação de nova conta e pré-preenchendo o nome de usuário
      window.location.href = `/login?newAccount=true${username ? `&username=${encodeURIComponent(username)}` : ''}`;
    } catch (error) {
      console.error("Erro ao configurar redirecionamento:", error);
      // Fallback simples em caso de erro
      window.location.href = '/login';
    }
  };

  // Outras funções e lógica poderiam ser adicionadas aqui, como:
  // - Validação de tokens
  // - Renovação de sessão
  // - Funções utilitárias para manipulação de dados do usuário