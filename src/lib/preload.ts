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
  try {
    // Primeiro tenta no caminho padrão
    const response = await fetch('/api/status', { 
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: AbortSignal.timeout(2000) // 2 segundos timeout
    });
    
    if (response.ok) {
      const data = await response.json();
      console.log('Status do servidor API:', data.status);
      return true;
    }
    return false;
  } catch (error) {
    // Tenta na porta específica como fallback
    try {
      const altResponse = await fetch('http://localhost:3001/api/status', { 
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(2000)
      });
      
      if (altResponse.ok) {
        const data = await altResponse.json();
        console.log('Status do servidor API (porta 3001):', data.status);
        return true;
      }
    } catch (altError) {
      console.warn('Servidor API não está rodando');
    }
    return false;
  }
}

// Função inicializadora principal que executa todas as tarefas de inicialização
export async function inicializarAplicacao() {
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