
/**
 * Módulo para gerenciar a persistência dos elementos visuais entre páginas
 */

// Constante para a chave de armazenamento das teias
const WEB_NODES_KEY = 'auth_animated_background_nodes';

/**
 * Inicializa o sistema de persistência para elementos visuais da aplicação
 */
export function initializeWebPersistence() {
  // Verifica se o sistema de persistência já foi inicializado
  const persistenceKey = 'web_persistence_initialized';
  
  try {
    // Configura listeners para eventos de navegação
    window.addEventListener('beforeunload', saveCurrentState);
    window.addEventListener('load', loadSavedState);
    
    // Marca como inicializado
    localStorage.setItem(persistenceKey, 'true');
    
    // Verifica se já existem nós de teias
    ensureWebNodesExist();
    
    console.log("Sistema de persistência visual inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar sistema de persistência visual:", error);
  }
}

/**
 * Garante que nós de teia existam no localStorage
 */
function ensureWebNodesExist() {
  try {
    // Verificar se já existem nós
    const existingNodes = localStorage.getItem(WEB_NODES_KEY);
    
    // Se não existirem, cria uma estrutura inicial vazia para ser preenchida pelo componente
    if (!existingNodes) {
      const initialNodes = [];
      localStorage.setItem(WEB_NODES_KEY, JSON.stringify(initialNodes));
      console.log("Estrutura inicial de teias criada");
    } else {
      console.log("Estrutura de teias já existe no localStorage");
    }
  } catch (error) {
    console.error("Erro ao verificar nós de teia:", error);
  }
}

/**
 * Salva o estado atual dos elementos visuais
 */
function saveCurrentState() {
  // Este método é chamado antes da página ser descarregada
  try {
    localStorage.setItem('last_page_unload', new Date().toISOString());
    
    // Forçar atualização da flag para garantir carregamento na próxima página
    localStorage.setItem('force_web_nodes_reload', 'true');
  } catch (error) {
    console.error("Erro ao salvar estado da página:", error);
  }
}

/**
 * Carrega o estado salvo para os elementos visuais
 */
function loadSavedState() {
  // Este método é chamado quando uma nova página é carregada
  try {
    const lastUnload = localStorage.getItem('last_page_unload');
    if (lastUnload) {
      const timeSinceLastUnload = new Date().getTime() - new Date(lastUnload).getTime();
      console.log(`Página carregada após ${timeSinceLastUnload}ms da última navegação`);
      
      // Sinaliza para componentes que precisam recarregar seus estados
      localStorage.setItem('force_web_nodes_reload', 'true');
      
      // Garante que existem nós no localStorage
      ensureWebNodesExist();
    }
  } catch (error) {
    console.error("Erro ao carregar estado da página:", error);
  }
}

export default {
  initializeWebPersistence
};
