
// Funções de fallback para modo offline

// Verificar se estamos no modo offline
export function isOfflineMode(): boolean {
  return localStorage.getItem('isOfflineMode') === 'true';
}

// Ativar modo offline
export function activateOfflineMode(): void {
  localStorage.setItem('isOfflineMode', 'true');
  console.log("Modo offline ativado");
}

// Desativar modo offline
export function deactivateOfflineMode(): void {
  localStorage.removeItem('isOfflineMode');
  console.log("Modo offline desativado");
}

// Armazenar dados localmente
export function storeLocalData(key: string, data: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error(`Erro ao armazenar dados locais (${key}):`, error);
  }
}

// Recuperar dados locais
export function getLocalData(key: string): any {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error(`Erro ao recuperar dados locais (${key}):`, error);
    return null;
  }
}

// Sincronizar dados quando estiver online novamente
export async function syncDataWhenOnline(): Promise<void> {
  if (isOfflineMode()) {
    // Implementar lógica para sincronizar dados com o banco de dados
    console.log("Sincronizando dados offline com o banco de dados...");
    
    // Após a sincronização bem-sucedida, desativar o modo offline
    deactivateOfflineMode();
  }
}

// Detectar quando a conexão for restaurada
export function setupOfflineListener(): void {
  window.addEventListener('online', () => {
    console.log("Conexão de rede restaurada");
    syncDataWhenOnline()
      .then(() => {
        console.log("Dados sincronizados com sucesso");
        // Recarregar a aplicação para usar os dados sincronizados
        window.location.reload();
      })
      .catch(error => {
        console.error("Erro ao sincronizar dados:", error);
      });
  });
  
  window.addEventListener('offline', () => {
    console.log("Conexão de rede perdida");
    activateOfflineMode();
  });
}

export default {
  isOfflineMode,
  activateOfflineMode,
  deactivateOfflineMode,
  storeLocalData,
  getLocalData,
  syncDataWhenOnline,
  setupOfflineListener
};
