/**
 * LLM ORCHESTRATOR - CACHE SYSTEM
 * 
 * Sistema de cache in-memory para respostas de LLM.
 * Reduz chamadas de API e melhora performance.
 * 
 * Features:
 * - Cache baseado em hash do prompt
 * - TTL configurável (default: 5 minutos)
 * - Limite de entradas (default: 200)
 * - Auto-limpeza de entradas expiradas
 * - Estatísticas de hit/miss
 * 
 * @version 3.0.0
 */

import type { CacheEntry, LLMProvider } from './types';
import { CACHE_CONFIG } from './config';

// ============================================================================
// CACHE STORAGE
// ============================================================================

const cache = new Map<string, CacheEntry>();
let cacheStats = {
  hits: 0,
  misses: 0,
  evictions: 0,
};

// ============================================================================
// HASH FUNCTION
// ============================================================================

function hashPrompt(prompt: string): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < Math.min(normalized.length, 1000); i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `llm_cache_${hash.toString(36)}`;
}

// ============================================================================
// CACHE OPERATIONS
// ============================================================================

export function getCachedResponse(prompt: string): CacheEntry | null {
  if (prompt.length < CACHE_CONFIG.minPromptLength) {
    return null;
  }

  const key = hashPrompt(prompt);
  const entry = cache.get(key);

  if (!entry) {
    cacheStats.misses++;
    return null;
  }

  if (Date.now() - entry.timestamp > CACHE_CONFIG.ttlMs) {
    cache.delete(key);
    cacheStats.evictions++;
    cacheStats.misses++;
    return null;
  }

  entry.hitCount++;
  cacheStats.hits++;
  console.log(`⚡ [CACHE] Hit para query (${entry.hitCount}x usado, modelo: ${entry.model})`);
  
  return entry;
}

export function setCacheResponse(
  prompt: string,
  data: string,
  model: string,
  provider: LLMProvider
): void {
  if (prompt.length < CACHE_CONFIG.minPromptLength) {
    return;
  }

  if (!data || data.length < 10) {
    return;
  }

  if (cache.size >= CACHE_CONFIG.maxEntries) {
    let oldestKey: string | null = null;
    let oldestTime = Infinity;

    for (const [key, entry] of cache.entries()) {
      if (entry.timestamp < oldestTime) {
        oldestTime = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      cache.delete(oldestKey);
      cacheStats.evictions++;
    }
  }

  const key = hashPrompt(prompt);
  cache.set(key, {
    data,
    model,
    provider,
    timestamp: Date.now(),
    hitCount: 0,
    promptHash: key,
  });

  console.log(`💾 [CACHE] Resposta armazenada (${cache.size}/${CACHE_CONFIG.maxEntries} entradas)`);
}

// ============================================================================
// CACHE MAINTENANCE
// ============================================================================

export function clearExpiredEntries(): number {
  const now = Date.now();
  let cleared = 0;

  for (const [key, entry] of cache.entries()) {
    if (now - entry.timestamp > CACHE_CONFIG.ttlMs) {
      cache.delete(key);
      cleared++;
    }
  }

  if (cleared > 0) {
    console.log(`🧹 [CACHE] Limpou ${cleared} entradas expiradas`);
    cacheStats.evictions += cleared;
  }

  return cleared;
}

export function clearCache(): void {
  const size = cache.size;
  cache.clear();
  console.log(`🗑️ [CACHE] Cache limpo (${size} entradas removidas)`);
}

// ============================================================================
// CACHE STATS
// ============================================================================

export function getCacheStats() {
  return {
    ...cacheStats,
    size: cache.size,
    maxSize: CACHE_CONFIG.maxEntries,
    ttlMs: CACHE_CONFIG.ttlMs,
    hitRate: cacheStats.hits + cacheStats.misses > 0
      ? (cacheStats.hits / (cacheStats.hits + cacheStats.misses) * 100).toFixed(1) + '%'
      : '0%',
  };
}

export function resetCacheStats(): void {
  cacheStats = { hits: 0, misses: 0, evictions: 0 };
}

setInterval(clearExpiredEntries, 60000);
