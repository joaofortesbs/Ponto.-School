// Sistema de persistência visual para otimizar o carregamento das teias
const NODES_STORAGE_KEY = 'animated_background_nodes';

// Função para pré-inicializar teias para renderização imediata
export function preInitializeWebNodes() {
  try {
    const storedNodesString = localStorage.getItem(NODES_STORAGE_KEY);

    if (storedNodesString) {
      console.log("Estrutura de teias já existe no localStorage");
    } else {
      // Criar nodes padrão para primeira inicialização
      const defaultNodes = [];
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const nodeCount = 120; // Número fixo para consistência

      for (let i = 0; i < nodeCount; i++) {
        defaultNodes.push({
          x: Math.random() * screenWidth,
          y: Math.random() * screenHeight,
          size: Math.random() * 2 + 1,
          id: Math.random().toString(36).substring(2, 15)
        });
      }

      localStorage.setItem(NODES_STORAGE_KEY, JSON.stringify(defaultNodes));
      console.log("Teias iniciais geradas para carregamento rápido");
    }

    console.log("Sistema de persistência visual inicializado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao inicializar sistema de persistência visual:", error);
    return false;
  }
}