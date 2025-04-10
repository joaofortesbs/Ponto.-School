
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
