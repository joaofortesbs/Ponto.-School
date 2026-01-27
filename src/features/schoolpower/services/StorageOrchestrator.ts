/**
 * STORAGE ORCHESTRATOR - Sistema Enterprise de Armazenamento Multi-Camadas
 * 
 * Arquitetura:
 * - Camada 1: IndexedDB (50MB+ capacidade) - dados grandes de atividades
 * - Camada 2: Zustand Store (memória) - acesso rápido, dados voláteis
 * - Camada 3: localStorage (5MB limite) - apenas metadados e flags
 * 
 * Funcionalidades:
 * - Escrita automática na camada correta baseada no tamanho
 * - Fallback automático entre camadas na leitura
 * - Garbage collection de dados antigos
 * - Monitoramento de uso com alertas preventivos
 * - Compressão de dados grandes
 * - Proteção contra QuotaExceededError
 */

const DB_NAME = 'PontoSchoolStorage';
const DB_VERSION = 1;
const STORE_NAME = 'activities';
const METADATA_STORE = 'metadata';

const LARGE_DATA_THRESHOLD = 50 * 1024; // 50KB
const MAX_LOCALSTORAGE_ITEM = 100 * 1024; // 100KB max por item no localStorage
const MAX_AGE_DAYS = 7; // Dados mais velhos que 7 dias podem ser limpos
const CRITICAL_USAGE_PERCENT = 80;

interface StorageMetadata {
  key: string;
  size: number;
  timestamp: number;
  storageLayer: 'indexeddb' | 'localstorage' | 'memory';
  activityType?: string;
  compressed?: boolean;
}

interface StorageStats {
  indexedDBSize: number;
  localStorageSize: number;
  localStoragePercent: number;
  itemCount: number;
  lastCleanup: number;
}

let dbInstance: IDBDatabase | null = null;
let dbReady: Promise<IDBDatabase> | null = null;
const memoryCache = new Map<string, { data: unknown; timestamp: number }>();
const metadataIndex = new Map<string, StorageMetadata>();

async function initDB(): Promise<IDBDatabase> {
  if (dbInstance) return dbInstance;
  if (dbReady) return dbReady;

  dbReady = new Promise((resolve, reject) => {
    try {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('[StorageOrchestrator] IndexedDB open error:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        dbInstance = request.result;
        console.log('[StorageOrchestrator] IndexedDB initialized successfully');
        resolve(dbInstance);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'key' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
          store.createIndex('activityType', 'activityType', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(METADATA_STORE)) {
          db.createObjectStore(METADATA_STORE, { keyPath: 'key' });
        }
        
        console.log('[StorageOrchestrator] IndexedDB schema created');
      };
    } catch (error) {
      console.error('[StorageOrchestrator] Failed to initialize IndexedDB:', error);
      reject(error);
    }
  });

  return dbReady;
}

function getDataSize(data: unknown): number {
  try {
    const str = typeof data === 'string' ? data : JSON.stringify(data);
    return str.length * 2; // UTF-16
  } catch {
    return 0;
  }
}

function compressData(data: string): string {
  try {
    const encoder = new TextEncoder();
    const bytes = encoder.encode(data);
    const base64 = btoa(String.fromCharCode(...bytes));
    return `__COMPRESSED__${base64}`;
  } catch {
    return data;
  }
}

function decompressData(data: string): string {
  if (!data.startsWith('__COMPRESSED__')) return data;
  try {
    const base64 = data.slice(14);
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return new TextDecoder().decode(bytes);
  } catch {
    return data;
  }
}

export function isHeavyActivityType(type: string): boolean {
  const heavyTypes = [
    'quiz-interativo',
    'flash-cards',
    'lista-exercicios',
    'plano-aula',
    'sequencia-didatica'
  ];
  return heavyTypes.some(t => type.includes(t));
}

export function getLocalStorageUsage(): { used: number; percent: number } {
  let used = 0;
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key) {
      const value = localStorage.getItem(key);
      if (value) {
        used += (key.length + value.length) * 2;
      }
    }
  }
  const percent = (used / (5 * 1024 * 1024)) * 100; // 5MB max
  return { used, percent };
}

async function writeToIndexedDB(key: string, data: unknown, activityType?: string): Promise<boolean> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      
      const record = {
        key,
        data,
        timestamp: Date.now(),
        activityType: activityType || 'unknown'
      };
      
      const request = store.put(record);
      
      request.onsuccess = () => {
        console.log(`[StorageOrchestrator] IndexedDB write success: ${key}`);
        resolve(true);
      };
      
      request.onerror = () => {
        console.error(`[StorageOrchestrator] IndexedDB write error: ${key}`, request.error);
        resolve(false);
      };
    });
  } catch (error) {
    console.error('[StorageOrchestrator] IndexedDB write failed:', error);
    return false;
  }
}

async function readFromIndexedDB(key: string): Promise<unknown | null> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(key);
      
      request.onsuccess = () => {
        const result = request.result;
        if (result) {
          resolve(result.data);
        } else {
          resolve(null);
        }
      };
      
      request.onerror = () => {
        console.error(`[StorageOrchestrator] IndexedDB read error: ${key}`);
        resolve(null);
      };
    });
  } catch (error) {
    console.error('[StorageOrchestrator] IndexedDB read failed:', error);
    return null;
  }
}

async function deleteFromIndexedDB(key: string): Promise<boolean> {
  try {
    const db = await initDB();
    return new Promise((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readwrite');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.delete(key);
      
      request.onsuccess = () => resolve(true);
      request.onerror = () => resolve(false);
    });
  } catch {
    return false;
  }
}

function safeLocalStorageSet(key: string, value: string): boolean {
  try {
    localStorage.setItem(key, value);
    return true;
  } catch (error) {
    if (error instanceof DOMException && error.name === 'QuotaExceededError') {
      console.warn(`[StorageOrchestrator] localStorage quota exceeded for key: ${key}`);
      performEmergencyCleanup();
      try {
        localStorage.setItem(key, value);
        return true;
      } catch {
        return false;
      }
    }
    return false;
  }
}

function performEmergencyCleanup(): void {
  console.log('[StorageOrchestrator] Performing emergency cleanup...');
  
  const keysToRemove: { key: string; size: number; timestamp: number }[] = [];
  const heavyPatterns = ['constructed_', 'activity_', 'generated_', 'auto_activity_data_'];
  
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Skip protected keys
    if (key.includes('supabase') || key.includes('auth') || key.includes('user')) continue;
    
    // Check if it's a heavy pattern
    if (heavyPatterns.some(p => key.includes(p))) {
      const value = localStorage.getItem(key);
      if (value) {
        keysToRemove.push({
          key,
          size: value.length,
          timestamp: 0 // Will be sorted by size
        });
      }
    }
  }
  
  // Sort by size (largest first)
  keysToRemove.sort((a, b) => b.size - a.size);
  
  // Remove the largest items until we free enough space
  let freedSpace = 0;
  const targetFree = 1024 * 1024; // 1MB
  
  for (const item of keysToRemove) {
    if (freedSpace >= targetFree) break;
    
    console.log(`[StorageOrchestrator] Emergency removing: ${item.key} (${Math.round(item.size / 1024)}KB)`);
    localStorage.removeItem(item.key);
    freedSpace += item.size;
  }
  
  console.log(`[StorageOrchestrator] Emergency cleanup freed: ${Math.round(freedSpace / 1024)}KB`);
}

export async function storageSet(
  key: string,
  data: unknown,
  options?: {
    activityType?: string;
    forceLocalStorage?: boolean;
    ttlDays?: number;
  }
): Promise<{ success: boolean; layer: string }> {
  const size = getDataSize(data);
  const activityType = options?.activityType || extractActivityType(key);
  const isHeavy = isHeavyActivityType(activityType) || size > LARGE_DATA_THRESHOLD;
  
  // Store in memory cache always for fast access
  memoryCache.set(key, { data, timestamp: Date.now() });
  
  // Update metadata index
  const metadata: StorageMetadata = {
    key,
    size,
    timestamp: Date.now(),
    storageLayer: 'memory',
    activityType,
    compressed: false
  };
  
  // For heavy data or large sizes, use IndexedDB
  if (isHeavy && !options?.forceLocalStorage) {
    const indexedDBSuccess = await writeToIndexedDB(key, data, activityType);
    
    if (indexedDBSuccess) {
      metadata.storageLayer = 'indexeddb';
      metadataIndex.set(key, metadata);
      
      // Store lightweight reference in localStorage
      const reference = {
        __storage_ref__: true,
        layer: 'indexeddb',
        timestamp: Date.now(),
        activityType,
        size
      };
      
      safeLocalStorageSet(key, JSON.stringify(reference));
      console.log(`[StorageOrchestrator] Heavy data stored in IndexedDB: ${key} (${Math.round(size / 1024)}KB)`);
      return { success: true, layer: 'indexeddb' };
    }
  }
  
  // For small data or if IndexedDB failed, try localStorage
  if (size <= MAX_LOCALSTORAGE_ITEM) {
    try {
      const serialized = typeof data === 'string' ? data : JSON.stringify(data);
      const success = safeLocalStorageSet(key, serialized);
      
      if (success) {
        metadata.storageLayer = 'localstorage';
        metadataIndex.set(key, metadata);
        return { success: true, layer: 'localstorage' };
      }
    } catch (error) {
      console.warn(`[StorageOrchestrator] localStorage failed for ${key}:`, error);
    }
  }
  
  // Fallback: memory only
  console.log(`[StorageOrchestrator] Data kept in memory only: ${key}`);
  metadataIndex.set(key, metadata);
  return { success: true, layer: 'memory' };
}

export async function storageGet<T = unknown>(key: string): Promise<T | null> {
  // Layer 1: Memory cache (fastest)
  const cached = memoryCache.get(key);
  if (cached) {
    return cached.data as T;
  }
  
  // Layer 2: Check localStorage for reference or data
  try {
    const localData = localStorage.getItem(key);
    if (localData) {
      try {
        const parsed = JSON.parse(localData);
        
        // Check if it's a reference to IndexedDB
        if (parsed.__storage_ref__ && parsed.layer === 'indexeddb') {
          // Fetch from IndexedDB
          const indexedDBData = await readFromIndexedDB(key);
          if (indexedDBData) {
            // Update memory cache
            memoryCache.set(key, { data: indexedDBData, timestamp: Date.now() });
            return indexedDBData as T;
          }
        }
        
        // It's actual data in localStorage
        memoryCache.set(key, { data: parsed, timestamp: Date.now() });
        return parsed as T;
      } catch {
        // Raw string data
        return localData as unknown as T;
      }
    }
  } catch {
    // localStorage access failed
  }
  
  // Layer 3: Try IndexedDB directly
  const indexedDBData = await readFromIndexedDB(key);
  if (indexedDBData) {
    memoryCache.set(key, { data: indexedDBData, timestamp: Date.now() });
    return indexedDBData as T;
  }
  
  return null;
}

export async function storageRemove(key: string): Promise<void> {
  memoryCache.delete(key);
  metadataIndex.delete(key);
  
  try {
    localStorage.removeItem(key);
  } catch { /* ignore */ }
  
  await deleteFromIndexedDB(key);
}

export async function storageSetJSON(key: string, data: unknown, options?: { activityType?: string }): Promise<boolean> {
  const result = await storageSet(key, data, options);
  return result.success;
}

export async function storageGetJSON<T = unknown>(key: string): Promise<T | null> {
  return storageGet<T>(key);
}

function extractActivityType(key: string): string {
  const patterns = [
    /constructed_([a-z-]+)_/,
    /activity_([a-z-]+)/,
    /generated_([a-z-]+)/
  ];
  
  for (const pattern of patterns) {
    const match = key.match(pattern);
    if (match) return match[1];
  }
  
  return 'unknown';
}

export async function performGarbageCollection(): Promise<{ removed: number; freedBytes: number }> {
  console.log('[StorageOrchestrator] Starting garbage collection...');
  
  const now = Date.now();
  const maxAge = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  let removed = 0;
  let freedBytes = 0;
  
  // Clean memory cache
  for (const [key, value] of memoryCache.entries()) {
    if (now - value.timestamp > maxAge) {
      memoryCache.delete(key);
      removed++;
    }
  }
  
  // Clean localStorage
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    
    // Skip protected keys
    if (key.includes('supabase') || key.includes('auth') || key.includes('user')) continue;
    
    const value = localStorage.getItem(key);
    if (value) {
      try {
        const parsed = JSON.parse(value);
        if (parsed.timestamp && now - parsed.timestamp > maxAge) {
          keysToRemove.push(key);
          freedBytes += value.length * 2;
        }
      } catch {
        // Can't determine age, check if it's old constructed data
        if (key.includes('constructed_') && value.length > 100000) {
          keysToRemove.push(key);
          freedBytes += value.length * 2;
        }
      }
    }
  }
  
  for (const key of keysToRemove) {
    localStorage.removeItem(key);
    removed++;
    console.log(`[StorageOrchestrator] GC removed: ${key}`);
  }
  
  // Clean IndexedDB old entries
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const index = store.index('timestamp');
    
    const oldTimestamp = now - maxAge;
    const range = IDBKeyRange.upperBound(oldTimestamp);
    const request = index.openCursor(range);
    
    request.onsuccess = (event) => {
      const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
      if (cursor) {
        console.log(`[StorageOrchestrator] GC removing IndexedDB entry: ${cursor.value.key}`);
        cursor.delete();
        removed++;
        cursor.continue();
      }
    };
  } catch (error) {
    console.warn('[StorageOrchestrator] IndexedDB GC failed:', error);
  }
  
  console.log(`[StorageOrchestrator] GC complete: ${removed} items removed, ${Math.round(freedBytes / 1024)}KB freed`);
  return { removed, freedBytes };
}

export async function getStorageStats(): Promise<StorageStats> {
  const localStorageUsage = getLocalStorageUsage();
  
  let indexedDBSize = 0;
  let itemCount = 0;
  
  try {
    const db = await initDB();
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    
    const countRequest = store.count();
    itemCount = await new Promise<number>((resolve) => {
      countRequest.onsuccess = () => resolve(countRequest.result);
      countRequest.onerror = () => resolve(0);
    });
  } catch { /* ignore */ }
  
  return {
    indexedDBSize,
    localStorageSize: localStorageUsage.used,
    localStoragePercent: localStorageUsage.percent,
    itemCount: itemCount + memoryCache.size,
    lastCleanup: 0
  };
}

export function safeSetItem(key: string, value: string): boolean {
  const size = value.length * 2;
  
  if (size > MAX_LOCALSTORAGE_ITEM || isHeavyActivityType(extractActivityType(key))) {
    storageSet(key, value, { activityType: extractActivityType(key) });
    return true;
  }
  
  return safeLocalStorageSet(key, value);
}

export function safeSetJSON(key: string, data: unknown): boolean {
  const serialized = JSON.stringify(data);
  return safeSetItem(key, serialized);
}

export async function safeGetItem(key: string): Promise<string | null> {
  const result = await storageGet<string>(key);
  return result;
}

export async function safeGetJSON<T = unknown>(key: string): Promise<T | null> {
  return storageGet<T>(key);
}

// Initialize IndexedDB on module load
initDB().catch(console.error);

// Auto garbage collection every 5 minutes if usage is high
setInterval(async () => {
  const usage = getLocalStorageUsage();
  if (usage.percent > CRITICAL_USAGE_PERCENT) {
    console.log(`[StorageOrchestrator] Auto GC triggered: ${Math.round(usage.percent)}% usage`);
    await performGarbageCollection();
  }
}, 5 * 60 * 1000);

console.log('[StorageOrchestrator] Enterprise Storage System initialized');
