
// Módulo para gerenciar a persistência dos elementos visuais entre páginas

/**
 * Inicializa o sistema de persistência para elementos visuais da aplicação
 */
export function initializeWebPersistence() {
  // Verifica se o sistema de persistência já foi inicializado
  const persistenceKey = 'web_persistence_initialized';
  
  if (!localStorage.getItem(persistenceKey)) {
    try {
      // Configura listeners para eventos de navegação
      window.addEventListener('beforeunload', saveCurrentState);
      window.addEventListener('load', loadSavedState);
      
      // Marca como inicializado
      localStorage.setItem(persistenceKey, 'true');
      
      console.log("Sistema de persistência visual inicializado com sucesso");
    } catch (error) {
      console.error("Erro ao inicializar sistema de persistência visual:", error);
    }
  }
}

/**
 * Salva o estado atual dos elementos visuais
 */
function saveCurrentState() {
  // Este método é chamado antes da página ser descarregada
  // Os dados específicos já são salvos por seus respectivos componentes
  try {
    localStorage.setItem('last_page_unload', new Date().toISOString());
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
    }
  } catch (error) {
    console.error("Erro ao carregar estado da página:", error);
  }
}

export default {
  initializeWebPersistence
};
