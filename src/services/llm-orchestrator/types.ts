/**
 * LLM ORCHESTRATOR - TYPES
 * 
 * Tipos centralizados para o Sistema Unificado de LLMs v3.0 Enterprise
 * 
 * @version 3.0.0
 * @author Ponto School
 */

// ============================================================================
// PROVIDER TYPES
// ============================================================================

export type LLMProvider = 'groq' | 'gemini' | 'local';

export type ModelTier = 
  | 'ultra-fast'    // Tier 1: Modelos mais rápidos (< 1s)
  | 'fast'          // Tier 2: Modelos rápidos (1-3s)
  | 'balanced'      // Tier 3: Equilíbrio velocidade/qualidade
  | 'powerful'      // Tier 4: Modelos mais potentes
  | 'fallback';     // Tier 5: Fallback local (nunca falha)

export type ActivityType = 
  | 'lista-exercicios'
  | 'quiz-interativo'
  | 'flash-cards'
  | 'plano-aula'
  | 'sequencia-didatica'
  | 'quadro-interativo'
  | 'tese-redacao'
  | 'avaliacao-diagnostica'
  | 'general';

// ============================================================================
// MODEL CONFIGURATION
// ============================================================================

export interface LLMModel {
  id: string;
  name: string;
  provider: LLMProvider;
  endpoint: string;
  maxTokens: number;
  contextWindow: number;
  tier: ModelTier;
  priority: number;
  isActive: boolean;
  avgLatencyMs: number;
  bestFor: ActivityType[];
}

// ============================================================================
// REQUEST/RESPONSE TYPES
// ============================================================================

export interface GenerateContentRequest {
  prompt: string;
  options?: GenerateContentOptions;
}

export interface GenerateContentOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  preferredTier?: ModelTier;
  activityType?: ActivityType;
  skipCache?: boolean;
  onProgress?: (status: string) => void;
}

export interface GenerateContentResult {
  success: boolean;
  data: string | null;
  model: string;
  provider: LLMProvider;
  tier: ModelTier;
  latencyMs: number;
  cached: boolean;
  attemptsMade: number;
  errors: ModelError[];
}

export interface ModelError {
  model: string;
  provider: LLMProvider;
  error: string;
  statusCode?: number;
  timestamp: number;
}

// ============================================================================
// CACHE TYPES
// ============================================================================

export interface CacheEntry {
  data: string;
  model: string;
  provider: LLMProvider;
  timestamp: number;
  hitCount: number;
  promptHash: string;
}

export interface CacheConfig {
  maxEntries: number;
  ttlMs: number;
  minPromptLength: number;
}

// ============================================================================
// CIRCUIT BREAKER TYPES
// ============================================================================

export type CircuitState = 'closed' | 'open' | 'half-open';

export interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  lastFailureTime: number;
  successCount: number;
}

export interface CircuitBreakerConfig {
  failureThreshold: number;
  recoveryTimeMs: number;
  halfOpenSuccessThreshold: number;
}

// ============================================================================
// RATE LIMITER TYPES
// ============================================================================

export interface RateLimiterState {
  requestCount: number;
  windowStart: number;
  tokensUsed: number;
}

export interface RateLimiterConfig {
  maxRequestsPerMinute: number;
  maxTokensPerMinute: number;
  windowMs: number;
}

// ============================================================================
// ROUTER TYPES
// ============================================================================

export type QueryComplexity = 'simple' | 'moderate' | 'complex' | 'expert';

export interface RoutingDecision {
  complexity: QueryComplexity;
  recommendedModels: string[];
  reason: string;
}

// ============================================================================
// ORCHESTRATOR TYPES
// ============================================================================

export interface OrchestratorConfig {
  timeout: number;
  maxRetriesPerModel: number;
  retryDelayMs: number;
  exponentialBackoff: boolean;
  enableCache: boolean;
  enableCircuitBreaker: boolean;
  enableRateLimiting: boolean;
  enableSmartRouting: boolean;
}

export interface OrchestratorStats {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  cacheHits: number;
  cacheMisses: number;
  avgLatencyMs: number;
  modelUsage: Record<string, number>;
  providerUsage: Record<LLMProvider, number>;
}
