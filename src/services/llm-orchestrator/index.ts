/**
 * LLM ORCHESTRATOR - MAIN EXPORT
 * 
 * Sistema Unificado de LLMs v3.0 Enterprise
 * 
 * API ÚNICA para toda a plataforma Ponto School.
 * 
 * USAGE:
 * ```typescript
 * import { generateContent, executeWithCascadeFallback } from '@/services/llm-orchestrator';
 * 
 * // Método 1: API moderna
 * const result = await generateContent('Crie 5 questões de matemática', {
 *   activityType: 'lista-exercicios',
 *   onProgress: (status) => console.log(status),
 * });
 * 
 * // Método 2: API compatível (para código existente)
 * const cascadeResult = await executeWithCascadeFallback('Crie um quiz de história');
 * ```
 * 
 * @version 3.0.0
 * @author Ponto School
 */

export { generateContent, executeWithCascadeFallback, getOrchestratorStats, resetOrchestratorStats } from './orchestrator';

export type { CascadeResult } from './orchestrator';

export type {
  LLMProvider,
  ModelTier,
  ActivityType,
  LLMModel,
  GenerateContentRequest,
  GenerateContentOptions,
  GenerateContentResult,
  ModelError,
  CacheEntry,
  CircuitBreakerState,
  RateLimiterState,
  QueryComplexity,
  RoutingDecision,
  OrchestratorConfig,
  OrchestratorStats,
} from './types';

export {
  LLM_MODELS,
  ORCHESTRATOR_CONFIG,
  CACHE_CONFIG,
  CIRCUIT_BREAKER_CONFIG,
  RATE_LIMITER_CONFIG,
  getActiveModels,
  getModelsByTier,
  getModelsByProvider,
  getModelById,
  getBestModelsForActivity,
  getGroqApiKey,
  getGeminiApiKey,
  validateGroqApiKey,
  validateGeminiApiKey,
} from './config';

export { getCacheStats, clearCache, clearExpiredEntries, resetCacheStats } from './cache';

export { 
  isCircuitOpen, 
  recordSuccess, 
  recordFailure, 
  getCircuitBreakerState,
  resetCircuitBreaker,
  isRateLimited,
  recordRequest,
  getRateLimiterState,
  sanitizePrompt,
} from './guards';

export { classifyComplexity, detectActivityType, getOptimalModels, makeRoutingDecision } from './router';

export { generateLocalFallback } from './fallback';
