
import { supabase } from "./supabase";

/**
 * Verifica se o usuário está autenticado na aplicação
 * Consulta o localStorage primeiro e, se necessário, o Supabase
 */
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    // Verificar se já consultamos a autenticação anteriormente nesta sessão
    const hasCheckedAuth = localStorage.getItem('auth_checked');
    const authStatus = localStorage.getItem('auth_status');
    
    // Se já verificamos e temos status, usar o valor armazenado
    if (hasCheckedAuth && authStatus) {
      return authStatus === 'authenticated';
    }
    
    // Caso contrário, consultar o Supabase
    const { data } = await supabase.auth.getSession();
    const isAuthenticated = !!data.session;
    
    // Armazenar resultado para futuras verificações
    localStorage.setItem('auth_checked', 'true');
    localStorage.setItem('auth_status', isAuthenticated ? 'authenticated' : 'unauthenticated');
    
    return isAuthenticated;
  } catch (error) {
    console.error("Erro ao verificar autenticação:", error);
    return false;
  }
};

/**
 * Limpa os dados de autenticação do localStorage
 */
export const clearAuthState = (): void => {
  localStorage.removeItem('auth_checked');
  localStorage.removeItem('auth_status');
};

/**
 * Atualiza o estado de autenticação após login bem-sucedido
 */
export const setAuthenticatedState = (): void => {
  localStorage.setItem('auth_checked', 'true');
  localStorage.setItem('auth_status', 'authenticated');
};
