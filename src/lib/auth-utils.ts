import { supabase } from "./supabase";

/**
 * Verifica se o usuário está autenticado na aplicação
 * Consulta o localStorage primeiro e, se necessário, o Supabase
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Sempre consultar o Supabase para garantir estado atualizado
    const { data } = await supabase.auth.getSession();
    const isAuthenticated = !!data.session;

    // Atualizar o estado no localStorage
    localStorage.setItem('auth_checked', 'true');
    localStorage.setItem('auth_status', isAuthenticated ? 'authenticated' : 'unauthenticated');

    return isAuthenticated;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    // Limpar dados em caso de erro
    localStorage.removeItem('auth_checked');
    localStorage.removeItem('auth_status');
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