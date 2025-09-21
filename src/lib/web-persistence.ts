
/**
 * Utilitário para persistência visual entre sessões
 */

const WEB_PERSISTENCE_PREFIX = "ponto_school_web_";

/**
 * Obtém um valor persistente do localStorage
 */
export function getWebPersistence(key: string): any {
  try {
    const fullKey = `${WEB_PERSISTENCE_PREFIX}${key}`;
    const storedValue = localStorage.getItem(fullKey);

    if (!storedValue) return null;

    try {
      return JSON.parse(storedValue);
    } catch (parseError) {
      console.error(`Erro ao fazer parse do valor persistente '${key}':`, parseError);
      localStorage.removeItem(fullKey);
      return null;
    }
  } catch (error) {
    console.error(`Erro ao acessar localStorage para a chave '${key}':`, error);
    return null;
  }
}

/**
 * Define um valor persistente no localStorage
 */
export function setWebPersistence(key: string, value: any): boolean {
  try {
    const fullKey = `${WEB_PERSISTENCE_PREFIX}${key}`;

    if (value === undefined || value === null) {
      localStorage.removeItem(fullKey);
      return true;
    }

    const jsonValue = JSON.stringify(value);

    if (jsonValue.length > 4 * 1024 * 1024) {
      console.error(`Valor muito grande para armazenar em '${key}' (${jsonValue.length} bytes)`);
      return false;
    }

    localStorage.setItem(fullKey, jsonValue);
    return localStorage.getItem(fullKey) === jsonValue;
  } catch (error) {
    console.error(`Erro ao armazenar valor persistente '${key}':`, error);

    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || 
         error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {
      try {
        clearOldVisualData();
        if (key === "backgroundNodes" && Array.isArray(value)) {
          const compactNodes = value.slice(0, 100).map(node => ({
            x: Math.round(node.x) || 0,
            y: Math.round(node.y) || 0,
            r: Number((node.radius || 1).toFixed(1)),
            o: Number((node.opacity || 0.2).toFixed(2))
          }));
          localStorage.setItem(`${WEB_PERSISTENCE_PREFIX}${key}`, JSON.stringify(compactNodes));
          return true;
        }
      } catch (innerError) {
        console.error("Erro ao tentar compactar dados:", innerError);
      }
    }
    return false;
  }
}

/**
 * Limpa dados visuais antigos para liberar espaço
 */
function clearOldVisualData(): void {
  try {
    const keysToKeep = ["backgroundNodes"];
    
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const key = localStorage.key(i);
      if (key && key.startsWith(WEB_PERSISTENCE_PREFIX)) {
        const shortKey = key.substring(WEB_PERSISTENCE_PREFIX.length);
        if (!keysToKeep.includes(shortKey)) {
          localStorage.removeItem(key);
        }
      }
    }
  } catch (error) {
    console.error("Erro ao limpar dados visuais antigos:", error);
  }
}

/**
 * Inicializa o sistema de persistência visual
 */
export function initWebPersistence(): void {
  try {
    const existingNodes = getWebPersistence("backgroundNodes");
    if (!existingNodes || !Array.isArray(existingNodes) || existingNodes.length === 0) {
      setWebPersistence("backgroundNodes", []);
    }
  } catch (error) {
    console.error("Erro ao inicializar sistema de persistência visual:", error);
  }
}

/**
 * Cria nós iniciais otimizados
 */
function createInitialNodes(count = 100) {
  return Array.from({ length: count }, () => ({
    x: Math.random() * 100,
    y: Math.random() * 100,
    vx: (Math.random() - 0.5) * 0.2,
    vy: (Math.random() - 0.5) * 0.2,
    radius: Math.random() * 1.5 + 0.5,
    fadeState: Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable',
    fadeTimer: Math.floor(Math.random() * 500) + 100,
    opacity: 0.1 + Math.random() * 0.3
  }));
}

/**
 * Salva os nós no localStorage de forma segura
 */
export function saveNodes(nodes: any[]) {
  try {
    if (!Array.isArray(nodes) || nodes.length === 0) return;

    const viewportWidth = window.innerWidth || 1280;
    const viewportHeight = window.innerHeight || 800;

    const simplifiedNodes = nodes.slice(0, 150).map(node => ({
      x: typeof node.x === 'number' ? (node.x / viewportWidth) * 100 : Math.random() * 100,
      y: typeof node.y === 'number' ? (node.y / viewportHeight) * 100 : Math.random() * 100,
      r: node.radius || node.r || 1,
      o: node.opacity || node.o || 0.2
    }));

    localStorage.setItem('webNodes', JSON.stringify(simplifiedNodes));
  } catch (error) {
    console.error("Erro ao salvar teias:", error);
  }
}

/**
 * Carrega os nós do localStorage de forma segura
 */
export function loadNodes() {
  try {
    const storedNodes = localStorage.getItem('webNodes');
    if (!storedNodes) return createInitialNodes();

    let parsedNodes;
    try {
      parsedNodes = JSON.parse(storedNodes);
    } catch (parseError) {
      console.error("Erro ao analisar nós armazenados:", parseError);
      return createInitialNodes();
    }

    if (!Array.isArray(parsedNodes) || parsedNodes.length === 0) {
      return createInitialNodes();
    }

    return parsedNodes.map((node: any) => ({
      x: node.x || Math.random() * 100,
      y: node.y || Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: node.r || Math.random() * 1.5 + 0.5,
      fadeState: Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable',
      fadeTimer: Math.floor(Math.random() * 500) + 100,
      opacity: node.o || (0.1 + Math.random() * 0.3)
    }));
  } catch (error) {
    console.error("Erro ao carregar teias:", error);
    return createInitialNodes();
  }
}

/**
 * Pré-inicialização otimizada
 */
export function preInitializeWebNodes() {
  try {
    const existingNodes = loadNodes();
    if (existingNodes && existingNodes.length > 0) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      }, 10);
      return existingNodes;
    }

    const initialNodes = createInitialNodes(80);
    saveNodes(initialNodes);
    
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
    }, 50);

    return initialNodes;
  } catch (error) {
    console.error("Erro ao pré-inicializar teias:", error);
    const fallbackNodes = createInitialNodes(50);
    saveNodes(fallbackNodes);
    
    setTimeout(() => {
      document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
    }, 100);
    
    return fallbackNodes;
  }
}

/**
 * Função para carregar dados visuais de animação do localStorage
 */
export const loadWebsFromLocalStorage = () => {
  try {
    const nodes = localStorage.getItem('webNodesData');
    if (nodes) {
      setTimeout(() => {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      }, 10);
      return JSON.parse(nodes);
    }
    return null;
  } catch (e) {
    console.error('Erro ao carregar teias do localStorage:', e);
    return null;
  }
};
