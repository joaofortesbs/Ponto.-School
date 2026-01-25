/**
 * LOCALSTORAGE MANAGER - Gerenciamento Inteligente de Armazenamento
 * 
 * Este serviço gerencia o localStorage para evitar erros de quota excedida.
 * 
 * Funcionalidades:
 * - Limpeza automática de dados antigos
 * - Tratamento de erro de quota
 * - Priorização de dados importantes
 * - Compressão de dados grandes
 */

const STORAGE_PREFIX = 'schoolpower_';
const MAX_STORAGE_SIZE = 4 * 1024 * 1024; // 4MB limite seguro
const CLEANUP_THRESHOLD = 0.8; // Limpar quando atingir 80%

interface StorageMetadata {
  key: string;
  size: number;
  timestamp: number;
  priority: 'high' | 'medium' | 'low';
  activityType?: string;
}

// Chaves que NUNCA devem ser removidas
const PROTECTED_KEYS = [
  'supabase.auth.token',
  'user_preferences',
  'app_settings'
];

// Padrões de chaves por prioridade
const KEY_PRIORITIES: Record<string, 'high' | 'medium' | 'low'> = {
  'text_content_': 'high',
  'constructed_': 'medium',
  'activity_': 'medium',
  'generated_content_': 'low',
  'constructedActivities': 'low',
  'auto_activity_data_': 'low'
};

/**
 * Calcula o tamanho total usado pelo localStorage
 */
export function getLocalStorageSize(): number {
  let total = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        total += key.length + value.length;
      }
    }
  }
  return total * 2; // UTF-16 usa 2 bytes por caractere
}

/**
 * Obtém uso do localStorage como porcentagem
 */
export function getStorageUsagePercent(): number {
  const used = getLocalStorageSize();
  return (used / MAX_STORAGE_SIZE) * 100;
}

/**
 * Determina a prioridade de uma chave
 */
function getKeyPriority(key: string): 'high' | 'medium' | 'low' {
  for (const [pattern, priority] of Object.entries(KEY_PRIORITIES)) {
    if (key.includes(pattern)) {
      return priority;
    }
  }
  return 'low';
}

/**
 * Coleta metadados de todas as chaves do localStorage relacionadas ao SchoolPower
 */
function collectStorageMetadata(): StorageMetadata[] {
  const metadata: StorageMetadata[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Ignorar chaves protegidas
    if (PROTECTED_KEYS.some(pk => key.includes(pk))) continue;
    
    // Focar em chaves relacionadas ao SchoolPower
    const isSchoolPowerKey = 
      key.includes('activity') || 
      key.includes('constructed') || 
      key.includes('text_content') ||
      key.includes('generated') ||
      key.includes('plano') ||
      key.includes('quiz') ||
      key.includes('flash') ||
      key.includes('sequencia') ||
      key.includes('schoolpower');
    
    if (!isSchoolPowerKey) continue;
    
    const value = localStorage.getItem(key);
    if (!value) continue;
    
    let timestamp = Date.now();
    try {
      const parsed = JSON.parse(value);
      if (parsed.timestamp) timestamp = parsed.timestamp;
      if (parsed.storedAt) timestamp = new Date(parsed.storedAt).getTime();
      if (parsed.generatedAt) timestamp = new Date(parsed.generatedAt).getTime();
      if (parsed.lastSync) timestamp = new Date(parsed.lastSync).getTime();
    } catch {
      // Não é JSON, usar timestamp atual
    }
    
    metadata.push({
      key,
      size: (key.length + value.length) * 2,
      timestamp,
      priority: getKeyPriority(key)
    });
  }
  
  return metadata;
}

/**
 * Limpa dados antigos do localStorage
 * Prioriza manter dados de alta prioridade
 */
export function cleanupOldStorage(targetFreeSpace: number = MAX_STORAGE_SIZE * 0.3): void {
  console.log('🧹 [LocalStorageManager] Iniciando limpeza de armazenamento...');
  
  const metadata = collectStorageMetadata();
  const currentSize = getLocalStorageSize();
  
  console.log(`📊 [LocalStorageManager] Uso atual: ${(currentSize / 1024).toFixed(2)} KB`);
  console.log(`📊 [LocalStorageManager] Chaves encontradas: ${metadata.length}`);
  
  if (currentSize < MAX_STORAGE_SIZE * CLEANUP_THRESHOLD) {
    console.log('✅ [LocalStorageManager] Armazenamento dentro do limite, limpeza não necessária');
    return;
  }
  
  // Ordenar por prioridade (low primeiro) e depois por timestamp (mais antigo primeiro)
  const priorityOrder = { low: 0, medium: 1, high: 2 };
  metadata.sort((a, b) => {
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    return a.timestamp - b.timestamp;
  });
  
  let freedSpace = 0;
  const removedKeys: string[] = [];
  
  for (const item of metadata) {
    if (freedSpace >= targetFreeSpace) break;
    
    // Nunca remover itens de alta prioridade na primeira passada
    if (item.priority === 'high' && freedSpace < targetFreeSpace * 0.7) continue;
    
    try {
      localStorage.removeItem(item.key);
      freedSpace += item.size;
      removedKeys.push(item.key);
      console.log(`🗑️ [LocalStorageManager] Removido: ${item.key} (${(item.size / 1024).toFixed(2)} KB)`);
    } catch (error) {
      console.warn(`⚠️ [LocalStorageManager] Erro ao remover ${item.key}:`, error);
    }
  }
  
  console.log(`✅ [LocalStorageManager] Limpeza concluída. Espaço liberado: ${(freedSpace / 1024).toFixed(2)} KB`);
  console.log(`📊 [LocalStorageManager] Chaves removidas: ${removedKeys.length}`);
}

/**
 * Limpa TODOS os dados de uma atividade específica
 */
export function clearActivityData(activityId: string): void {
  console.log(`🗑️ [LocalStorageManager] Limpando dados da atividade: ${activityId}`);
  
  const keysToRemove: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes(activityId)) {
      keysToRemove.push(key);
    }
  }
  
  keysToRemove.forEach(key => {
    localStorage.removeItem(key);
    console.log(`   🗑️ Removido: ${key}`);
  });
  
  console.log(`✅ [LocalStorageManager] ${keysToRemove.length} chaves removidas para atividade ${activityId}`);
}

/**
 * Armazena dados com tratamento de erro de quota
 * Tenta limpar espaço automaticamente se quota for excedida
 */
export function safeSetItem(key: string, value: string, retryCount = 0): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`⚠️ [LocalStorageManager] Quota excedida ao salvar: ${key}`);
      
      if (retryCount < 2) {
        console.log(`🔄 [LocalStorageManager] Tentando limpar espaço (tentativa ${retryCount + 1})...`);
        cleanupOldStorage();
        return safeSetItem(key, value, retryCount + 1);
      } else {
        console.error(`❌ [LocalStorageManager] Não foi possível salvar após limpeza: ${key}`);
        return false;
      }
    }
    
    console.error(`❌ [LocalStorageManager] Erro ao salvar ${key}:`, error);
    return false;
  }
}

/**
 * Armazena dados JSON com tratamento de quota
 */
export function safeSetJSON(key: string, data: any): boolean {
  try {
    const jsonString = JSON.stringify(data);
    return safeSetItem(key, jsonString);
  } catch (error) {
    console.error(`❌ [LocalStorageManager] Erro ao serializar dados para ${key}:`, error);
    return false;
  }
}

/**
 * Obtém dados JSON com tratamento de erro
 */
export function safeGetJSON<T>(key: string, defaultValue: T): T {
  try {
    const value = localStorage.getItem(key);
    if (!value) return defaultValue;
    return JSON.parse(value) as T;
  } catch (error) {
    console.warn(`⚠️ [LocalStorageManager] Erro ao parsear ${key}:`, error);
    return defaultValue;
  }
}

/**
 * Inicializa o gerenciador de localStorage
 * Deve ser chamado no início da aplicação
 */
export function initLocalStorageManager(): void {
  console.log('🚀 [LocalStorageManager] Inicializando...');
  
  const usagePercent = getStorageUsagePercent();
  console.log(`📊 [LocalStorageManager] Uso do localStorage: ${usagePercent.toFixed(2)}%`);
  
  if (usagePercent > CLEANUP_THRESHOLD * 100) {
    console.log('⚠️ [LocalStorageManager] Uso alto detectado, iniciando limpeza preventiva...');
    cleanupOldStorage();
  }
}

/**
 * Limpa dados antigos especificamente para plano-aula
 */
export function cleanupPlanoAulaData(): void {
  console.log('🧹 [LocalStorageManager] Limpando dados antigos de plano-aula...');
  
  const planoAulaKeys: string[] = [];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key && key.includes('plano-aula') || key?.includes('plano_aula')) {
      planoAulaKeys.push(key);
    }
  }
  
  // Manter apenas a última versão de cada tipo
  const keysByType: Record<string, string[]> = {};
  
  planoAulaKeys.forEach(key => {
    const type = key.split('_')[0];
    if (!keysByType[type]) keysByType[type] = [];
    keysByType[type].push(key);
  });
  
  let removedCount = 0;
  Object.values(keysByType).forEach(keys => {
    if (keys.length > 2) {
      // Ordenar por timestamp e remover mais antigos
      const keysWithTimestamp = keys.map(key => {
        const value = localStorage.getItem(key);
        let timestamp = 0;
        try {
          const parsed = JSON.parse(value || '{}');
          timestamp = parsed.timestamp || parsed.storedAt || 0;
        } catch {}
        return { key, timestamp };
      });
      
      keysWithTimestamp.sort((a, b) => b.timestamp - a.timestamp);
      
      // Manter apenas os 2 mais recentes
      keysWithTimestamp.slice(2).forEach(({ key }) => {
        localStorage.removeItem(key);
        removedCount++;
      });
    }
  });
  
  console.log(`✅ [LocalStorageManager] ${removedCount} chaves antigas de plano-aula removidas`);
}

export default {
  getLocalStorageSize,
  getStorageUsagePercent,
  cleanupOldStorage,
  clearActivityData,
  safeSetItem,
  safeSetJSON,
  safeGetJSON,
  initLocalStorageManager,
  cleanupPlanoAulaData
};
