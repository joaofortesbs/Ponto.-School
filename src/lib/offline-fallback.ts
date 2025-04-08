/**
 * Módulo de fallback para quando o aplicativo está offline ou o banco de dados não está disponível
 */

// Sistemas de fallback para modo offline
import React from 'react';

// Constantes para keys do localStorage
const OFFLINE_MODE_KEY = 'isOfflineMode';
const LAST_CONNECTION_ATTEMPT = 'lastConnectionAttempt';
const USER_DATA_CACHE = 'userDataCache';

// Verificar se estamos offline
export const checkIfOffline = (): boolean => {
  return localStorage.getItem(OFFLINE_MODE_KEY) === 'true' || !navigator.onLine;
};

// Salvar dados no cache local
export const saveToLocalCache = (key: string, data: any): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Erro ao salvar no cache local:', error);
  }
};

// Obter dados do cache local
export const getFromLocalCache = (key: string): any => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Erro ao obter dados do cache local:', error);
    return null;
  }
};

// Obter usuário do cache local
export const getUserFromCache = (): any => {
  return getFromLocalCache('user');
};

// Criar usuário em modo offline
export const createOfflineUser = (userData: any): void => {
  saveToLocalCache('user', {
    ...userData,
    createdAt: new Date().toISOString(),
    isOfflineCreated: true
  });
};

// Sincronizar dados quando voltar online
export const syncOfflineData = async (): Promise<boolean> => {
  if (navigator.onLine) {
    // Aqui implementaríamos a sincronização com o servidor
    console.log('Sincronizando dados offline...');
    return true;
  }
  return false;
};

// Verificar conexão periodicamente
export const setupConnectionCheck = (callback?: () => void): (() => void) => {
  const checkInterval = setInterval(() => {
    if (navigator.onLine) {
      syncOfflineData().then((success) => {
        if (success && callback) {
          callback();
        }
      });
    }
  }, 30000);

  return () => clearInterval(checkInterval);
};mpt';
const CONNECTION_HEALTH_KEY = 'connectionHealth';

// Verifica se o modo offline foi ativado
export const checkOfflineMode = (): boolean => {
  // Verificar localStorage
  const storedOfflineMode = localStorage.getItem(OFFLINE_MODE_KEY);
  if (storedOfflineMode === 'true') return true;

  // Verificar status atual da conexão
  if (!navigator.onLine) {
    localStorage.setItem(OFFLINE_MODE_KEY, 'true');
    return true;
  }

  return false;
};

// Força modo offline para usar cache local
export const enableOfflineMode = (): void => {
  localStorage.setItem(OFFLINE_MODE_KEY, 'true');
  console.log('Modo offline ativado manualmente');
};

// Força modo online para tentar conexões
export const disableOfflineMode = (): void => {
  localStorage.setItem(OFFLINE_MODE_KEY, 'false');
  localStorage.setItem(LAST_CONNECTION_ATTEMPT, Date.now().toString());
  console.log('Modo offline desativado manualmente');
};

// Para uso em componentes React que precisam do status offline
export const useOfflineDetection = (): {
  isOffline: boolean;
  setOfflineMode: (mode: boolean) => void;
} => {
  const [isOffline, setIsOffline] = React.useState<boolean>(checkOfflineMode());

  // Função para alternar modo offline manualmente
  const setOfflineMode = (mode: boolean) => {
    if (mode) {
      enableOfflineMode();
    } else {
      disableOfflineMode();
    }
    setIsOffline(mode);
  };

  React.useEffect(() => {
    // Função para verificar mudanças no estado online/offline
    const handleOnline = () => {
      localStorage.setItem(OFFLINE_MODE_KEY, 'false');
      localStorage.setItem(CONNECTION_HEALTH_KEY, '100');
      setIsOffline(false);
      console.log('Conexão restaurada');
    };

    const handleOffline = () => {
      localStorage.setItem(OFFLINE_MODE_KEY, 'true');
      localStorage.setItem(CONNECTION_HEALTH_KEY, '0');
      setIsOffline(true);
      console.log('Conexão perdida');
    };

    // Verificar o status inicial no carregamento do componente
    if (!navigator.onLine) {
      setIsOffline(true);
      localStorage.setItem(OFFLINE_MODE_KEY, 'true');
    }

    // Event listeners
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Verificação periódica da conexão
    const intervalId = setInterval(() => {
      if (navigator.onLine) {
        // Verifica a conexão com um ping leve
        fetch('/vite.svg', { 
          method: 'HEAD',
          cache: 'no-store',
          headers: { 'Cache-Control': 'no-cache' }
        })
        .then(() => {
          if (isOffline) {
            console.log('Conexão verificada e restaurada');
            localStorage.setItem(OFFLINE_MODE_KEY, 'false');
            setIsOffline(false);
          }
        })
        .catch(() => {
          // Manter offline se o fetch falhar
          console.log('Falha na verificação de conexão');
        });
      }
    }, 30000); // Verificar a cada 30 segundos

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(intervalId);
    };
  }, [isOffline]);

  return { isOffline, setOfflineMode };
};

// Função auxiliar para simular atraso em modo de desenvolvimento
export const simulateDelay = async (ms = 500): Promise<void> => {
  if (import.meta.env.DEV) {
    await new Promise(resolve => setTimeout(resolve, ms));
  }
};

// Componente para exibir indicador de modo offline
export const OfflineIndicator: React.FC = () => {
  const { isOffline, setOfflineMode } = useOfflineDetection();

  if (!isOffline) return null;

  return (
    <div className="offline-indicator">
      <span>🔌 Modo offline ativo</span>
      <button 
        onClick={() => setOfflineMode(false)}
        className="ml-2 px-2 py-1 bg-white text-red-700 rounded text-xs"
      >
        Tentar reconectar
      </button>
    </div>
  );
};

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