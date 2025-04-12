
// Sistema de persistência visual para otimizar o carregamento das teias
const NODES_STORAGE_KEY = 'animated_background_nodes';

// Função para pré-inicializar teias para renderização imediata
export function preInitializeWebNodes() {
  try {
    // Verificar se já existe no localStorage
    const storedNodesString = localStorage.getItem(NODES_STORAGE_KEY);

    if (!storedNodesString) {
      console.log("Criando estrutura inicial de teias para carregamento instantâneo");
      // Criar nodes padrão para primeira inicialização
      const defaultNodes = [];
      const screenWidth = window.innerWidth || 1366; // Valor padrão caso não esteja disponível
      const screenHeight = window.innerHeight || 768; // Valor padrão caso não esteja disponível
      const nodeCount = 150; // Aumentado para melhor efeito visual
      
      for (let i = 0; i < nodeCount; i++) {
        defaultNodes.push({
          x: Math.random() * screenWidth,
          y: Math.random() * screenHeight,
          size: Math.random() * 2 + 1,
          id: Math.random().toString(36).substring(2, 15)
        });
      }
      
      localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(defaultNodes));
    } else {
      console.log("Estrutura de teias já existe no localStorage, carregando instantaneamente");
    }
    
    // Pré-carregar conexões entre os nós para renderização mais rápida
    const storedNodes = JSON.parse(localStorage.getItem(NODES_STORAGE_KEY) || '[]');
    if (storedNodes.length > 0) {
      // Pré-cálculo de conexões para os primeiros 20 nós (para carregamento mais rápido)
      for (let i = 0; i < Math.min(20, storedNodes.length); i++) {
        storedNodes[i].connections = [];
        for (let j = 0; j < storedNodes.length; j++) {
          if (i !== j) {
            const dx = storedNodes[i].x - storedNodes[j].x;
            const dy = storedNodes[i].y - storedNodes[j].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 300 && storedNodes[i].connections.length < 3) {
              storedNodes[i].connections.push(j);
            }
          }
        }
      }
      localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(storedNodes));
    }

    // Garantir disponibilidade imediata
    document.dispatchEvent(new CustomEvent('WebTeiasProntas', { detail: { ready: true } }));
    console.log("Sistema de persistência visual inicializado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar sistema de persistência visual:", error);
    return false;
  }
}

// Inicialização automática - executada imediatamente assim que o script é carregado
(() => {
  // Inicializar imediatamente antes de qualquer outro código
  preInitializeWebNodes();
  
  // Adicionar evento para páginas de login/registro
  document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos em uma página de autenticação
    const isAuthPage = window.location.pathname.includes('/login') || 
                       window.location.pathname.includes('/register');
    
    if (isAuthPage) {
      console.log("Página de autenticação detectada, priorizando carregamento das teias");
      // Forçar atualização das teias para garantir que estejam visíveis
      const event = new CustomEvent('ForceWebTeiaUpdate');
      document.dispatchEvent(event);
    }
  });
})();
