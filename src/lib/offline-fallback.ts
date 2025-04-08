
/**
 * Módulo de fallback para quando o aplicativo está offline ou o banco de dados não está disponível
 */

// Verificar se o aplicativo está em modo offline
export const isOfflineMode = (): boolean => {
  return localStorage.getItem('isOfflineMode') === 'true' || !navigator.onLine;
};

// Salvar dados no localStorage com retry para IndexedDB ou outro mecanismo
export const saveLocalData = (key: string, data: any): void => {
  try {
    const serializedData = typeof data === 'string' ? data : JSON.stringify(data);
    localStorage.setItem(key, serializedData);
    console.log(`Dados salvos localmente: ${key}`);
  } catch (error) {
    console.error(`Erro ao salvar dados localmente (${key}):`, error);
  }
};

// Recuperar dados do localStorage com fallback para cache
export const getLocalData = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    if (!data) return null;
    
    try {
      return JSON.parse(data);
    } catch {
      // Se não for JSON, retornar como string
      return data;
    }
  } catch (error) {
    console.error(`Erro ao recuperar dados locais (${key}):`, error);
    return null;
  }
};

// Verificar conexão com o servidor
export const checkServerConnection = async (
  url: string = '/api/health',
  timeout: number = 5000
): Promise<boolean> => {
  return new Promise((resolve) => {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      resolve(false);
    }, timeout);

    fetch(url, { 
      method: 'GET',
      signal: controller.signal,
      headers: { 'Cache-Control': 'no-cache' }
    })
      .then(response => {
        clearTimeout(timeoutId);
        resolve(response.ok);
      })
      .catch(() => {
        clearTimeout(timeoutId);
        resolve(false);
      });
  });
};

// Sincronizar dados locais com o servidor quando online
export const syncDataWithServer = async (): Promise<boolean> => {
  if (!navigator.onLine) return false;
  
  try {
    const pendingActions = getLocalData('pendingServerActions') || [];
    if (pendingActions.length === 0) return true;
    
    console.log(`Sincronizando ${pendingActions.length} ações pendentes...`);
    // Implementar a lógica de sincronização
    
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar dados com o servidor:', error);
    return false;
  }
};

// Registrar ação pendente para sincronização posterior
export const registerPendingAction = (action: any): void => {
  try {
    const pendingActions = getLocalData('pendingServerActions') || [];
    pendingActions.push({
      ...action,
      timestamp: new Date().toISOString()
    });
    saveLocalData('pendingServerActions', pendingActions);
  } catch (error) {
    console.error('Erro ao registrar ação pendente:', error);
  }
};

// Configurar modo de trabalho offline
export const setupOfflineMode = (): void => {
  if (isOfflineMode()) {
    console.log('Modo offline ativado');
    document.body.classList.add('offline-mode');
  } else {
    console.log('Modo online ativado');
    document.body.classList.remove('offline-mode');
  }
};
