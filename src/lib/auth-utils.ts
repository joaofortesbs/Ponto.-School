import { supabase } from "./supabase";

/**
 * Verifica se o usuário está autenticado na aplicação
 * Consulta cookies, localStorage e Supabase para máxima precisão
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    console.log('🔍 [AUTH] Iniciando verificação completa de autenticação...');
    
    // 1. Verificar cookies do navegador para sessões persistentes
    const hasSupabaseCookies = document.cookie.includes('sb-') || 
                              document.cookie.includes('supabase-auth-token') ||
                              document.cookie.includes('auth-token');
    
    console.log('🍪 [AUTH] Cookies de autenticação encontrados:', hasSupabaseCookies);
    
    // 2. Verificar cache local para resposta rápida
    const cachedStatus = localStorage.getItem('auth_status');
    const cacheTime = localStorage.getItem('auth_cache_time');
    const now = Date.now();
    
    console.log('💾 [AUTH] Status em cache:', cachedStatus, 'Tempo:', cacheTime);
    
    // 3. Se há cache recente e cookies, provavelmente está autenticado
    if (cachedStatus === 'authenticated' && hasSupabaseCookies && cacheTime && 
        (now - parseInt(cacheTime)) < 30 * 60 * 1000) {
      console.log('✅ [AUTH] Cache válido + cookies presentes = autenticado');
      
      // Verificar em background para manter sincronização
      requestAnimationFrame(() => {
        supabase.auth.getSession().then(({ data }) => {
          const currentlyAuth = !!data?.session;
          if (currentlyAuth !== (cachedStatus === 'authenticated')) {
            localStorage.setItem('auth_status', currentlyAuth ? 'authenticated' : 'unauthenticated');
            localStorage.setItem('auth_cache_time', now.toString());
            console.log('🔄 [AUTH] Cache atualizado em background:', currentlyAuth);
          }
        }).catch(() => {});
      });
      
      return true;
    }
    
    // 4. Se não há cookies, provavelmente não está autenticado
    if (!hasSupabaseCookies) {
      console.log('❌ [AUTH] Sem cookies de autenticação - não autenticado');
      localStorage.setItem('auth_status', 'unauthenticated');
      localStorage.setItem('auth_cache_time', now.toString());
      return false;
    }

    // 5. Verificação definitiva com Supabase (com timeout)
    console.log('🔍 [AUTH] Verificando sessão no Supabase...');
    const authPromise = Promise.race([
      supabase.auth.getSession(),
      new Promise((resolve) => setTimeout(() => 
        resolve({data: {session: null}}), 3000))
    ]);

    const { data } = await authPromise;
    const isAuthenticated = !!data?.session;

    console.log('📋 [AUTH] Resultado da verificação Supabase:', isAuthenticated);

    // 6. Atualizar cache com resultado definitivo
    localStorage.setItem('auth_checked', 'true');
    localStorage.setItem('auth_status', isAuthenticated ? 'authenticated' : 'unauthenticated');
    localStorage.setItem('auth_cache_time', now.toString());

    return isAuthenticated;
  } catch (error) {
    console.error("❌ [AUTH] Erro ao verificar autenticação:", error);
    
    // Em caso de erro, usar estratégia conservadora
    const hasSupabaseCookies = document.cookie.includes('sb-') || 
                              document.cookie.includes('supabase-auth-token');
    const cachedStatus = localStorage.getItem('auth_status');
    
    // Se há cookies E cache positivo, assumir autenticado
    if (hasSupabaseCookies && cachedStatus === 'authenticated') {
      console.log('⚠️ [AUTH] Erro, mas cookies + cache indicam autenticado');
      return true;
    }
    
    console.log('❌ [AUTH] Erro sem indicações de autenticação - não autenticado');
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
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data?.user) {
      localStorage.setItem('auth_checked', 'true');
      localStorage.setItem('auth_status', 'authenticated');

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
    // Primeiro, buscar o email associado ao nome de usuário
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('email')
      .eq('username', username)
      .single();

    if (profileError || !profileData?.email) {
      return { 
        success: false, 
        error: new Error("Nome de usuário não encontrado")
      };
    }

    // Usar o email encontrado para fazer login
    return signInWithEmail(profileData.email, password);
    
  } catch (error) {
    console.error("Erro ao fazer login com nome de usuário:", error);
    return { success: false, error };
  }
};