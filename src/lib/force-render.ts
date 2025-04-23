
/**
 * Utilitário para forçar a renderização de componentes em situações críticas
 */

/**
 * Força a renderização de um elemento DOM específico
 * @param elementId ID do elemento DOM a ser renderizado
 */
export function forceRender(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    // Técnica 1: Forçar reflow
    void element.offsetHeight;
    
    // Técnica 2: Modificar classe temporariamente
    element.classList.add('force-render');
    setTimeout(() => {
      element.classList.remove('force-render');
    }, 50);
  }
}

/**
 * Garante a renderização do modo Epictus IA
 */
export function ensureEpictusIARendering(): void {
  // Verificar URL
  const isEpictusMode = window.location.search.includes('mode=epictus');
  
  if (isEpictusMode) {
    // Técnica 1: Forçar reflow do documento
    void document.body.offsetHeight;
    
    // Técnica 2: Adicionar/remover classe temporária
    document.body.classList.add('epictus-forced-render');
    setTimeout(() => {
      document.body.classList.remove('epictus-forced-render');
    }, 100);
    
    // Técnica 3: Forçar repaint
    document.body.style.display = 'none';
    setTimeout(() => {
      document.body.style.display = '';
    }, 5);
    
    // Técnica 4: Notificar navegador de mudança
    window.dispatchEvent(new Event('resize'));
  }
}

/**
 * Trigger para ser chamado quando o EpictusIAMode for ativado
 */
export function triggerEpictusModeRendering(): void {
  ensureEpictusIARendering();
  
  // Configurar verificações periódicas 
  const checkInterval = setInterval(() => {
    const container = document.getElementById('epictus-ia-mode-container');
    if (container && container.offsetHeight > 0) {
      clearInterval(checkInterval);
      console.log('Epictus IA mode rendered successfully');
    } else if (container) {
      forceRender('epictus-ia-mode-container');
    }
  }, 250);
  
  // Limpar após 5 segundos de qualquer forma
  setTimeout(() => {
    clearInterval(checkInterval);
  }, 5000);
}

// Inicializar verificação quando o script for carregado
setTimeout(ensureEpictusIARendering, 500);

export default {
  forceRender,
  ensureEpictusIARendering,
  triggerEpictusModeRendering
};
