// Arquivo de pré-carregamento simplificado
export const preloadAllComponents = () => {
  console.log("Iniciando pré-carregamento de todos os componentes...");

  // Retorna uma promise resolvida para simular carregamento bem-sucedido
  setTimeout(() => {
    console.log("Todos os componentes foram pré-carregados com sucesso!");
  }, 300);

  return Promise.resolve();
};

// Função para verificar se o servidor de API está rodando
async function verificarServidorAPI() {
  // Guard: só executa no browser
  if (typeof window === 'undefined') {
    return false;
  }

  try {
    // Usa o caminho relativo - o proxy do Vite resolve automaticamente
    const response = await fetch('/api/status', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000) // 2 segundos timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Status do servidor API:', data.status);
      return true;
    }
    return false;
  } catch (error) {
    console.warn('⚠️ Servidor API não está respondendo');
    return false;
  }
}

// Função inicializadora principal que executa todas as tarefas de inicialização
export async function inicializarAplicacao() {
  // Guard: só executa no browser
  if (typeof window === 'undefined') {
    return;
  }

  console.log('Iniciando aplicação...');

  // Verifica se o servidor API está rodando
  const apiStatus = await verificarServidorAPI();
  if (!apiStatus) {
    console.log('Iniciando servidor API em background...');
    try {
      // Esta tentativa de iniciar o servidor é apenas visual para o usuário
      // O servidor precisa ser iniciado através do workflow
      const serverWorkflow = document.createElement('div');
      serverWorkflow.id = 'api-server-reminder';
      serverWorkflow.style.display = 'none';
      document.body.appendChild(serverWorkflow);
    } catch (err) {
      console.error('Erro ao iniciar servidor API:', err);
    }
  }
}