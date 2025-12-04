/**
 * Sistema de Sincronização de Mensagens
 * Gerencia o salvamento e recuperação de mensagens pendentes entre páginas
 */

const PENDING_MESSAGE_KEY = 'schoolpower_pending_message';
const PENDING_FILES_KEY = 'schoolpower_pending_files';
const HAS_LOGGED_IN_KEY = 'has_logged_in_before';
const REDIRECT_TO_SCHOOLPOWER_KEY = 'redirect_to_schoolpower';

export interface PendingMessage {
  message: string;
  files?: any[];
  timestamp: number;
}

/**
 * Salva uma mensagem pendente no localStorage
 */
export const savePendingMessage = (message: string, files?: any[]): void => {
  try {
    const pendingData: PendingMessage = {
      message,
      files: files || [],
      timestamp: Date.now()
    };
    localStorage.setItem(PENDING_MESSAGE_KEY, JSON.stringify(pendingData));
    console.log('💾 Mensagem pendente salva:', message);
  } catch (error) {
    console.error('❌ Erro ao salvar mensagem pendente:', error);
  }
};

/**
 * Recupera a mensagem pendente do localStorage
 */
export const getPendingMessage = (): PendingMessage | null => {
  try {
    const data = localStorage.getItem(PENDING_MESSAGE_KEY);
    if (!data) return null;
    
    const pendingData: PendingMessage = JSON.parse(data);
    
    // Verificar se a mensagem não expirou (24 horas)
    const twentyFourHours = 24 * 60 * 60 * 1000;
    if (Date.now() - pendingData.timestamp > twentyFourHours) {
      clearPendingMessage();
      return null;
    }
    
    console.log('📥 Mensagem pendente recuperada:', pendingData.message);
    return pendingData;
  } catch (error) {
    console.error('❌ Erro ao recuperar mensagem pendente:', error);
    return null;
  }
};

/**
 * Limpa a mensagem pendente do localStorage
 */
export const clearPendingMessage = (): void => {
  try {
    localStorage.removeItem(PENDING_MESSAGE_KEY);
    localStorage.removeItem(PENDING_FILES_KEY);
    console.log('🧹 Mensagem pendente limpa');
  } catch (error) {
    console.error('❌ Erro ao limpar mensagem pendente:', error);
  }
};

/**
 * Verifica se existe uma mensagem pendente
 */
export const hasPendingMessage = (): boolean => {
  return getPendingMessage() !== null;
};

/**
 * Marca que o usuário já fez login no navegador
 */
export const markUserHasLoggedIn = (): void => {
  try {
    localStorage.setItem(HAS_LOGGED_IN_KEY, 'true');
    console.log('✅ Marcado que usuário já fez login');
  } catch (error) {
    console.error('❌ Erro ao marcar login:', error);
  }
};

/**
 * Verifica se o usuário já fez login alguma vez neste navegador
 */
export const hasUserLoggedInBefore = (): boolean => {
  try {
    return localStorage.getItem(HAS_LOGGED_IN_KEY) === 'true';
  } catch (error) {
    console.error('❌ Erro ao verificar histórico de login:', error);
    return false;
  }
};

/**
 * Verifica se o usuário está atualmente logado
 */
export const isUserCurrentlyLoggedIn = (): boolean => {
  try {
    const authToken = localStorage.getItem('auth_token');
    const userId = localStorage.getItem('user_id');
    return !!(authToken && userId);
  } catch (error) {
    console.error('❌ Erro ao verificar autenticação:', error);
    return false;
  }
};

/**
 * Define que o usuário deve ser redirecionado para School Power após login
 */
export const setRedirectToSchoolPower = (): void => {
  try {
    localStorage.setItem(REDIRECT_TO_SCHOOLPOWER_KEY, 'true');
    console.log('🎯 Redirecionamento para School Power configurado');
  } catch (error) {
    console.error('❌ Erro ao configurar redirecionamento:', error);
  }
};

/**
 * Verifica se deve redirecionar para School Power
 */
export const shouldRedirectToSchoolPower = (): boolean => {
  try {
    return localStorage.getItem(REDIRECT_TO_SCHOOLPOWER_KEY) === 'true';
  } catch (error) {
    console.error('❌ Erro ao verificar redirecionamento:', error);
    return false;
  }
};

/**
 * Limpa o flag de redirecionamento para School Power
 */
export const clearRedirectToSchoolPower = (): void => {
  try {
    localStorage.removeItem(REDIRECT_TO_SCHOOLPOWER_KEY);
    console.log('🧹 Flag de redirecionamento limpo');
  } catch (error) {
    console.error('❌ Erro ao limpar redirecionamento:', error);
  }
};

/**
 * Função principal para processar envio de mensagem da página de vendas
 * Retorna: 'redirect_schoolpower' | 'redirect_login' | 'error'
 */
export const processMessageFromSalesPage = (
  message: string,
  files?: any[]
): { action: 'redirect_schoolpower' | 'redirect_login'; path: string } => {
  // Salvar mensagem no localStorage
  savePendingMessage(message, files);
  
  // Configurar redirecionamento para School Power
  setRedirectToSchoolPower();
  
  // Verificar se usuário está logado
  if (isUserCurrentlyLoggedIn()) {
    console.log('✅ Usuário logado - redirecionando para School Power');
    return {
      action: 'redirect_schoolpower',
      path: '/dashboard/school-power'
    };
  }
  
  // Verificar se usuário já fez login antes (pode ter sessão expirada)
  if (hasUserLoggedInBefore()) {
    console.log('🔄 Usuário já logou antes - redirecionando para login');
    return {
      action: 'redirect_login',
      path: '/login'
    };
  }
  
  // Usuário nunca logou - redirecionar para registro ou login
  console.log('🆕 Primeiro acesso - redirecionando para login');
  return {
    action: 'redirect_login',
    path: '/login'
  };
};

/**
 * Função para ser chamada após login bem-sucedido
 * Retorna o caminho para redirecionamento
 */
export const getPostLoginRedirectPath = (): string => {
  // Marcar que usuário já fez login
  markUserHasLoggedIn();
  
  // Verificar se deve redirecionar para School Power
  if (shouldRedirectToSchoolPower() && hasPendingMessage()) {
    console.log('🎯 Redirecionando para School Power após login');
    return '/dashboard/school-power';
  }
  
  // Retorno padrão para dashboard
  return '/dashboard';
};

/**
 * Limpa todos os dados de sincronização
 */
export const clearAllSyncData = (): void => {
  clearPendingMessage();
  clearRedirectToSchoolPower();
};
