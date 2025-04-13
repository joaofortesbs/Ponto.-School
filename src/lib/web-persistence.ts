/**
 * Utilitário para persistência visual entre sessões
 */

const WEB_PERSISTENCE_PREFIX = "ponto_school_web_";

/**
 * Obtém um valor persistente do localStorage
 * @param key Chave do valor
 * @returns Valor armazenado ou null se não existir
 */
export function getWebPersistence(key: string): any {
  try {
    const fullKey = `${WEB_PERSISTENCE_PREFIX}${key}`;
    const storedValue = localStorage.getItem(fullKey);

    if (!storedValue) return null;

    // Tenta fazer o parse do JSON, se falhar retorna null
    try {
      return JSON.parse(storedValue);
    } catch (parseError) {
      console.error(`Erro ao fazer parse do valor persistente '${key}':`, parseError);
      // Remove o valor inválido para evitar futuros erros
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
 * @param key Chave do valor
 * @param value Valor a ser armazenado
 * @returns true se o armazenamento for bem-sucedido, false caso contrário
 */
export function setWebPersistence(key: string, value: any): boolean {
  try {
    const fullKey = `${WEB_PERSISTENCE_PREFIX}${key}`;

    // Se o valor for undefined ou null, remove a chave
    if (value === undefined || value === null) {
      localStorage.removeItem(fullKey);
      return true;
    }

    // Converte o valor para string JSON
    const jsonValue = JSON.stringify(value);

    // Verifica se o tamanho é aceitável para localStorage (< 5MB)
    if (jsonValue.length > 4 * 1024 * 1024) {
      console.error(`Valor muito grande para armazenar em '${key}' (${jsonValue.length} bytes)`);
      return false;
    }

    // Armazena no localStorage
    localStorage.setItem(fullKey, jsonValue);

    // Verifica se o armazenamento foi bem-sucedido
    return localStorage.getItem(fullKey) === jsonValue;
  } catch (error) {
    console.error(`Erro ao armazenar valor persistente '${key}':`, error);

    // Se o erro for de cota de armazenamento, tenta liberar espaço
    if (error instanceof DOMException && 
        (error.name === 'QuotaExceededError' || 
         error.name === 'NS_ERROR_DOM_QUOTA_REACHED')) {

      try {
        // Remove dados antigos de teias para liberar espaço
        clearOldVisualData();

        // Tenta novamente com um valor mais compacto
        if (key === "backgroundNodes" && Array.isArray(value)) {
          const compactNodes = value.map(node => ({
            id: node.id,
            x: Math.round(node.x),
            y: Math.round(node.y),
            vx: Number(node.vx.toFixed(2)),
            vy: Number(node.vy.toFixed(2)),
            opacity: Number(node.opacity.toFixed(2)),
            size: Number(node.size.toFixed(1)),
            fadeState: node.fadeState,
            fadeTimer: Math.round(node.fadeTimer)
          }));

          localStorage.setItem(fullKey, JSON.stringify(compactNodes));
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
    // Lista de chaves a serem mantidas
    const keysToKeep = ["backgroundNodes"];

    // Percorre todas as chaves no localStorage
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);

      // Se a chave começar com o prefixo, verifica se deve ser mantida
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
    // Verifica se as teias já existem
    const existingNodes = getWebPersistence("backgroundNodes");

    if (existingNodes && Array.isArray(existingNodes) && existingNodes.length > 0) {
      console.log("Estrutura de teias já existe no localStorage");
    } else {
      // Cria uma estrutura vazia para as teias
      setWebPersistence("backgroundNodes", []);
    }

    console.log("Sistema de persistência visual inicializado com sucesso");
  } catch (error) {
    console.error("Erro ao inicializar sistema de persistência visual:", error);
  }
}


// Web Persistence - Gerencia a persistência de efeitos visuais na web
// Arquivos: web-persistence.ts

// Funções para persistir e recuperar os nós e conexões de teia

interface WebNode {
  id: number;
  x: number;
  y: number;
  connections: number[];
  opacity: number;
  size: number;
  glow: boolean;
}

interface WebConnection {
  id1: number;
  id2: number;
  opacity: number;
}

interface StoredWebs {
  nodes: WebNode[];
  connections: WebConnection[];
  timestamp: number;
}

// Cache em memória para acesso ultra-rápido
let inMemoryCache: StoredWebs | null = null;

// Função para inicializar o sistema antes mesmo do React carregar
export function preInitializeWebNodes() {
  try {
    // Verificar se já existe uma estrutura de teias no localStorage
    const existingData = localStorage.getItem('web_data');

    if (existingData) {
      console.log("Estrutura de teias já existe no localStorage, carregando instantaneamente");
      // Carregar dados no cache de memória para acesso mais rápido
      try {
        inMemoryCache = JSON.parse(existingData) as StoredWebs;
      } catch (e) {
        console.warn("Erro ao analisar dados de teias existentes, gerando novos dados");
        inMemoryCache = null;
      }
    } else {
      // Se não existir, criar uma estrutura básica para ser aprimorada depois
      const fallbackNodes: WebNode[] = [];
      const fallbackConnections: WebConnection[] = [];

      // Criar alguns nós de fallback para garantir que algo seja visualizado
      const width = window.innerWidth;
      const height = window.innerHeight;
      const nodeCount = 80; // Número aumentado para melhor aparência inicial

      for (let i = 0; i < nodeCount; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;

        fallbackNodes.push({
          id: i,
          x,
          y,
          connections: [],
          opacity: 0.15 + Math.random() * 0.25,
          size: 1.5 + Math.random() * 2,
          glow: Math.random() > 0.85, // 15% de chance de brilho
        });
      }

      // Criar algumas conexões básicas
      for (let i = 0; i < nodeCount; i++) {
        for (let j = i + 1; j < nodeCount; j++) {
          if (Math.random() > 0.85) { // 15% de chance de conexão para equilíbrio visual/performance
            fallbackConnections.push({
              id1: i,
              id2: j,
              opacity: 0.1 + Math.random() * 0.15,
            });

            fallbackNodes[i].connections.push(j);
            fallbackNodes[j].connections.push(i);
          }
        }
      }

      // Salvar a estrutura básica
      const fallbackData: StoredWebs = {
        nodes: fallbackNodes,
        connections: fallbackConnections,
        timestamp: Date.now(),
      };

      // Salvar no cache de memória e no localStorage
      inMemoryCache = fallbackData;
      localStorage.setItem('web_data', JSON.stringify(fallbackData));
    }

    // Inicializar evento para notificar que as teias estão prontas
    if (inMemoryCache) {
      // Usar requestAnimationFrame para garantir que o evento seja disparado no próximo frame de animação
      requestAnimationFrame(() => {
        document.dispatchEvent(new CustomEvent('WebTeiasProntas'));
      });
    }

    console.log("Sistema de persistência visual inicializado com sucesso");
    return true;
  } catch (error) {
    console.error("Erro ao pré-inicializar teias:", error);
    // Criar um objeto mínimo no cache para evitar falhas em outras partes do código
    inMemoryCache = {
      nodes: [],
      connections: [],
      timestamp: Date.now()
    };
    return false;
  }
}

// Função para persistir as teias no localStorage
export function persistWebs(nodes: WebNode[], connections: WebConnection[]): boolean {
  try {
    const data: StoredWebs = {
      nodes,
      connections,
      timestamp: Date.now(),
    };

    // Atualizar cache em memória primeiro para acesso mais rápido
    inMemoryCache = data;

    // Persistir no localStorage em segundo plano para não bloquear a UI
    setTimeout(() => {
      try {
        localStorage.setItem('web_data', JSON.stringify(data));
      } catch (e) {
        console.warn("Erro ao salvar teias no localStorage (ignorando):", e);
      }
    }, 50);

    return true;
  } catch (error) {
    console.error("Erro ao persistir teias:", error);
    return false;
  }
}

// Função para obter as teias do localStorage
export function getStoredWebs(): StoredWebs | null {
  try {
    // Usar cache em memória se disponível para velocidade máxima
    if (inMemoryCache) {
      return inMemoryCache;
    }

    const storedData = localStorage.getItem('web_data');

    if (!storedData) {
      return null;
    }

    // Atualizar cache em memória
    inMemoryCache = JSON.parse(storedData) as StoredWebs;
    return inMemoryCache;
  } catch (error) {
    console.error("Erro ao recuperar teias:", error);
    return null;
  }
}

// Função para limpar os dados de teias
export function clearStoredWebs(): boolean {
  try {
    // Limpar cache em memória primeiro
    inMemoryCache = null;

    // Depois remover do localStorage
    localStorage.removeItem('web_data');
    return true;
  } catch (error) {
    console.error("Erro ao limpar teias:", error);
    return false;
  }
}

// Função para verificar se as teias estão carregadas
export function areWebsLoaded(): boolean {
  return inMemoryCache !== null && inMemoryCache.nodes.length > 0;
}

// Criar nós iniciais para garantir que sempre existam teias
function createInitialNodes(count = 120) {
  const viewportWidth = window.innerWidth || 1280;
  const viewportHeight = window.innerHeight || 800;
  const margin = 2;

  return Array.from({ length: count }, () => {
    return {
      x: Math.random() * 100, // Normalizado como porcentagem
      y: Math.random() * 100, // Normalizado como porcentagem
      vx: (Math.random() - 0.5) * 0.2,
      vy: (Math.random() - 0.5) * 0.2,
      radius: Math.random() * 1.5 + 0.5,
      fadeState: Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable',
      fadeTimer: Math.floor(Math.random() * 500) + 100,
      opacity: 0.1 + Math.random() * 0.3
    };
  });
}

// Salvar os nós no localStorage
export function saveNodes(nodes: any[]) {
  try {
    // Converter nós para formato simplificado para economizar espaço
    const simplifiedNodes = nodes.map(node => ({
      x: node.x,
      y: node.y,
      r: node.radius || node.r || 1,
      o: node.opacity || node.o || 0.2
    }));

    // Normalizar coordenadas para porcentagens (0-100) para permitir adaptação entre diferentes tamanhos de tela
    const viewportWidth = window.innerWidth || 1280;
    const viewportHeight = window.innerHeight || 800;

    const normalizedNodes = simplifiedNodes.map(node => ({
      x: typeof node.x === 'number' ? (node.x / viewportWidth) * 100 : Math.random() * 100,
      y: typeof node.y === 'number' ? (node.y / viewportHeight) * 100 : Math.random() * 100,
      r: node.r,
      o: node.o
    }));

    localStorage.setItem('webNodes', JSON.stringify(normalizedNodes));
  } catch (error) {
    console.error("Erro ao salvar teias:", error);
  }
}

// Carregar os nós do localStorage
export function loadNodes() {
  try {
    const storedNodes = localStorage.getItem('webNodes');
    if (!storedNodes) return createInitialNodes();

    // Converter de volta ao formato completo
    let parsedNodes;
    try {
      parsedNodes = JSON.parse(storedNodes);
    } catch (parseError) {
      console.error("Erro ao analisar nós armazenados:", parseError);
      return createInitialNodes();
    }

    if (!Array.isArray(parsedNodes) || parsedNodes.length === 0) {
      console.warn("Dados de nós inválidos no localStorage, criando novos nós");
      return createInitialNodes();
    }

    // Reconstruir os nós com todas as propriedades
    return parsedNodes.map((node: any) => {
      return {
        x: node.x || Math.random() * 100,
        y: node.y || Math.random() * 100,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
        radius: node.r || Math.random() * 1.5 + 0.5,
        fadeState: Math.random() > 0.7 ? 'out' : Math.random() > 0.5 ? 'in' : 'stable',
        fadeTimer: Math.floor(Math.random() * 500) + 100,
        opacity: node.o || (0.1 + Math.random() * 0.3)
      };
    });
  } catch (error) {
    console.error("Erro ao carregar teias:", error);
    return createInitialNodes();
  }
}