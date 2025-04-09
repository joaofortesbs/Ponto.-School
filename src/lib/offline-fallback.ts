
// Funções de auxílio para o modo offline

// Verificar status da conexão
export const checkConnection = async (): Promise<boolean> => {
  // Se o modo offline já estiver ativado manualmente, retornar falso
  if (localStorage.getItem('isOfflineMode') === 'true') {
    console.log('Verificação de conexão pulada - modo offline ativo');
    return false;
  }
  
  try {
    // Tentar buscar um recurso mínimo para verificar a conexão
    // Usamos timestamp para evitar cache
    const response = await fetch(`/ping?t=${Date.now()}`, {
      method: 'HEAD',
      cache: 'no-store',
      headers: { 'Cache-Control': 'no-cache' }
    });
    
    return response.ok;
  } catch (error) {
    return false;
  }
};

// Tentar uma operação com retry
export const retryOperation = async <T>(
  operation: () => Promise<T>,
  maxRetries: number = 5,
  initialDelay: number = 1000
): Promise<T> => {
  // Se o modo offline já estiver ativado manualmente, não fazer retries
  if (localStorage.getItem('isOfflineMode') === 'true') {
    console.log('Verificação de conexão pulada - modo offline ativo');
    throw new Error('Modo offline ativo');
  }
  
  let retries = 0;
  let delay = initialDelay;
  
  while (retries < maxRetries) {
    try {
      return await operation();
    } catch (error) {
      console.log(`Falha na tentativa ${retries}. Tentando novamente em ${delay}ms...`);
      
      // Última tentativa, não esperar
      if (retries === maxRetries - 1) {
        if (retries === maxRetries - 1) {
          console.log('Aplicação entrando em modo offline após falhas consecutivas');
          localStorage.setItem('isOfflineMode', 'true');
          throw error;
        }
      }
      
      // Esperar e tentar novamente
      await new Promise(resolve => setTimeout(resolve, delay));
      retries++;
      console.log(`Tentativa ${retries} de ${maxRetries}...`);
      
      // Backoff exponencial com um limite máximo
      delay = Math.min(delay * 2, 10000);
    }
  }
  
  throw new Error(`Operação falhou após ${maxRetries} tentativas`);
};

// Ativar modo offline manualmente
export const enableOfflineMode = (enable: boolean = true): void => {
  localStorage.setItem('isOfflineMode', enable ? 'true' : 'false');
  console.log(`Modo offline ${enable ? 'ativado' : 'desativado'} manualmente`);
  
  // Se estiver desativando, recarregar a página para tentar reconectar
  if (!enable) {
    window.location.reload();
  }
};

// Verificar se o modo offline está ativo
export const isOfflineModeActive = (): boolean => {
  return localStorage.getItem('isOfflineMode') === 'true';
};

// Criar usuários mock para desenvolvimento offline
export const setupOfflineUsers = (): void => {
  const existingUsers = localStorage.getItem('users');
  
  if (!existingUsers || JSON.parse(existingUsers).length === 0) {
    const defaultUsers = [
      {
        id: 'user_default_1',
        email: 'usuario@teste.com',
        password: 'senha123',
        full_name: 'Usuário de Teste',
        display_name: 'Usuário',
        avatar: null,
        createdAt: new Date().toISOString(),
        level: 3,
        rank: "Estudante",
        xp: 350,
        coins: 120
      }
    ];
    
    localStorage.setItem('users', JSON.stringify(defaultUsers));
    console.log('Usuários offline foram criados para desenvolvimento');
  }
};

// Inicializar modo offline se necessário
export const initializeOfflineMode = async (): Promise<void> => {
  try {
    const isConnected = await checkConnection();
    
    if (!isConnected) {
      console.log('Sem conexão detectada. Ativando modo offline automaticamente');
      localStorage.setItem('isOfflineMode', 'true');
      setupOfflineUsers();
    } else {
      console.log('Conexão detectada. Modo online ativo');
      localStorage.setItem('isOfflineMode', 'false');
    }
  } catch (error) {
    console.log('Erro ao verificar conexão. Ativando modo offline por segurança');
    localStorage.setItem('isOfflineMode', 'true');
    setupOfflineUsers();
  }
};
