
// Utilitário para lidar com persistência de objetos evitando referências circulares

/**
 * Função segura para serializar objetos, removendo referências circulares
 * e propriedades DOM que causam erros ao salvar no localStorage
 */
export function safeSerialize(obj: any, seen = new WeakSet()): any {
  // Verificar tipos primitivos
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  
  // Evitar referências circulares
  if (seen.has(obj)) {
    return "[Circular Reference]";
  }
  
  // Registrar este objeto como visto
  seen.add(obj);
  
  // Para arrays, processar cada item
  if (Array.isArray(obj)) {
    return obj.map(item => safeSerialize(item, seen));
  }
  
  // Para objetos, processar cada propriedade
  const result: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(obj)) {
    // Ignorar funções, elementos DOM, e propriedades React/DOM internas
    if (
      typeof value === "function" ||
      key.startsWith("_") || 
      key.startsWith("__") ||
      key === "ref" ||
      key === "props" ||
      key === "children" ||
      value instanceof Element ||
      value instanceof Node
    ) {
      continue;
    }
    
    // Processar recursivamente
    result[key] = safeSerialize(value, seen);
  }
  
  return result;
}

/**
 * Salva dados no localStorage evitando problemas com estruturas circulares
 */
export function safeSaveToLocalStorage(key: string, data: any): boolean {
  try {
    const serialized = JSON.stringify(safeSerialize(data));
    localStorage.setItem(key, serialized);
    return true;
  } catch (error) {
    console.error(`Erro ao salvar em ${key}:`, error);
    return false;
  }
}

/**
 * Carrega dados do localStorage com tratamento de erros
 */
export function safeLoadFromLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Erro ao carregar de ${key}:`, error);
    return defaultValue;
  }
}
