/**
 * LLM ORCHESTRATOR - MAIN ENGINE
 * 
 * Orquestrador principal do Sistema Unificado de LLMs v3.0 Enterprise.
 * 
 * ARQUITETURA:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ 1. INPUT VALIDATION & SANITIZATION                                      │
 * │    └── guards.ts: sanitizePrompt()                                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 2. CACHE CHECK                                                          │
 * │    └── cache.ts: getCachedResponse()                                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 3. SMART ROUTING                                                        │
 * │    └── router.ts: makeRoutingDecision()                                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 4. CASCADE EXECUTION (11 modelos em 5 tiers)                            │
 * │    ├── TIER 1: Ultra-Fast (llama-3.1-8b, gemma2-9b)                     │
 * │    ├── TIER 2: Fast (llama-3.3-70b, mixtral-8x7b, llama3-70b)           │
 * │    ├── TIER 3: Balanced (llama-3-tool-use, llama-4-scout)               │
 * │    ├── TIER 4: Powerful (gemini-2.5-flash, gemini-2.0-flash)            │
 * │    └── TIER 5: Local Fallback (NUNCA FALHA)                             │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 5. PROTECTION SYSTEMS                                                   │
 * │    ├── Circuit Breaker (por modelo)                                     │
 * │    ├── Rate Limiter (por provider)                                      │
 * │    └── Retry with Exponential Backoff                                   │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ 6. CACHE STORAGE                                                        │
 * │    └── cache.ts: setCacheResponse()                                     │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 3.0.0
 */

import type { 
  GenerateContentResult, 
  GenerateContentOptions,
  LLMModel,
  ModelError,
  OrchestratorStats,
  ActivityType,
} from './types';
import { 
  getActiveModels, 
  getModelById, 
  ORCHESTRATOR_CONFIG 
} from './config';
import { callGroqAPI } from './providers/groq';
import { callGeminiAPI } from './providers/gemini';
import { getCachedResponse, setCacheResponse, getCacheStats } from './cache';
import { 
  sanitizePrompt, 
  isCircuitOpen, 
  isRateLimited,
  recordSuccess,
  recordFailure,
  recordRequest,
  sleep,
  calculateBackoff,
} from './guards';
import { makeRoutingDecision, detectActivityType } from './router';
import { generateLocalFallback } from './fallback';

// ============================================================================
// STATS TRACKING
// ============================================================================

const stats: OrchestratorStats = {
  totalRequests: 0,
  successfulRequests: 0,
  failedRequests: 0,
  cacheHits: 0,
  cacheMisses: 0,
  avgLatencyMs: 0,
  modelUsage: {},
  providerUsage: {
    groq: 0,
    gemini: 0,
    local: 0,
  },
};

// ============================================================================
// MAIN GENERATE FUNCTION
// ============================================================================

export async function generateContent(
  prompt: string,
  options: GenerateContentOptions = {}
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  stats.totalRequests++;
  
  const errors: ModelError[] = [];
  let attemptsMade = 0;

  console.log(`\n🤖 [LLM-Orchestrator] ====== NOVA REQUISIÇÃO ======`);
  console.log(`🤖 [LLM-Orchestrator] Prompt length: ${prompt.length} chars`);
  console.log(`🤖 [LLM-Orchestrator] Verificando API keys...`);
  
  // Log detalhado das API keys
  const groqKey = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
  const geminiKey = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  console.log(`🔑 [LLM-Orchestrator] VITE_GROQ_API_KEY: ${groqKey ? `${groqKey.substring(0, 8)}...` : 'NÃO ENCONTRADA'}`);
  console.log(`🔑 [LLM-Orchestrator] VITE_GEMINI_API_KEY: ${geminiKey ? `${geminiKey.substring(0, 8)}...` : 'NÃO ENCONTRADA'}`);
  console.log(`📊 [LLM-Orchestrator] Modelos ativos: ${getActiveModels().length}`);

  const sanitized = sanitizePrompt(prompt);
  if (!sanitized.valid) {
    console.error(`❌ [LLM-Orchestrator] Prompt inválido: ${sanitized.error}`);
    return {
      success: false,
      data: null,
      model: 'none',
      provider: 'local',
      tier: 'fallback',
      latencyMs: Date.now() - startTime,
      cached: false,
      attemptsMade: 0,
      errors: [{
        model: 'input-validation',
        provider: 'local',
        error: sanitized.error || 'Validação falhou',
        timestamp: Date.now(),
      }],
    };
  }

  const cleanPrompt = sanitized.sanitized;

  if (ORCHESTRATOR_CONFIG.enableCache && !options.skipCache) {
    const cached = getCachedResponse(cleanPrompt);
    if (cached) {
      stats.cacheHits++;
      stats.successfulRequests++;
      return {
        success: true,
        data: cached.data,
        model: cached.model,
        provider: cached.provider,
        tier: 'fast',
        latencyMs: Date.now() - startTime,
        cached: true,
        attemptsMade: 0,
        errors: [],
      };
    }
    stats.cacheMisses++;
  }

  const activityType = options.activityType || detectActivityType(cleanPrompt);
  const routingDecision = ORCHESTRATOR_CONFIG.enableSmartRouting 
    ? makeRoutingDecision(cleanPrompt)
    : { recommendedModels: getActiveModels().map(m => m.id), complexity: 'moderate', reason: 'Default' };

  const modelsToTry = routingDecision.recommendedModels
    .map(id => getModelById(id))
    .filter((m): m is LLMModel => m !== undefined);

  if (options.onProgress) {
    options.onProgress(`Iniciando com ${modelsToTry.length} modelos disponíveis...`);
  }

  for (const model of modelsToTry) {
    if (model.provider === 'local') {
      continue;
    }

    if (ORCHESTRATOR_CONFIG.enableCircuitBreaker && isCircuitOpen(model.id)) {
      console.log(`⏭️ [LLM-Orchestrator] Pulando ${model.id} (circuit open)`);
      continue;
    }

    if (ORCHESTRATOR_CONFIG.enableRateLimiting && isRateLimited(model.provider)) {
      console.log(`⏭️ [LLM-Orchestrator] Pulando ${model.id} (rate limited)`);
      continue;
    }

    for (let retry = 0; retry < ORCHESTRATOR_CONFIG.maxRetriesPerModel; retry++) {
      attemptsMade++;

      if (retry > 0) {
        const backoffMs = ORCHESTRATOR_CONFIG.exponentialBackoff
          ? calculateBackoff(retry, ORCHESTRATOR_CONFIG.retryDelayMs)
          : ORCHESTRATOR_CONFIG.retryDelayMs;
        console.log(`⏳ [LLM-Orchestrator] Retry ${retry + 1} para ${model.id} em ${backoffMs}ms`);
        await sleep(backoffMs);
      }

      if (options.onProgress) {
        options.onProgress(`Tentando ${model.name}${retry > 0 ? ` (retry ${retry + 1})` : ''}...`);
      }

      let result: GenerateContentResult;

      if (model.provider === 'groq') {
        result = await callGroqAPI(model, cleanPrompt, {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          timeout: options.timeout,
          systemPrompt: options.systemPrompt,
        });
      } else if (model.provider === 'gemini') {
        result = await callGeminiAPI(model, cleanPrompt, {
          temperature: options.temperature,
          maxTokens: options.maxTokens,
          timeout: options.timeout,
          systemPrompt: options.systemPrompt,
        });
      } else {
        continue;
      }

      recordRequest(model.provider);

      if (result.success && result.data) {
        recordSuccess(model.id);

        if (ORCHESTRATOR_CONFIG.enableCache) {
          setCacheResponse(cleanPrompt, result.data, model.id, model.provider);
        }

        stats.successfulRequests++;
        stats.modelUsage[model.id] = (stats.modelUsage[model.id] || 0) + 1;
        stats.providerUsage[model.provider]++;

        const totalLatency = Date.now() - startTime;
        stats.avgLatencyMs = (stats.avgLatencyMs * (stats.successfulRequests - 1) + totalLatency) / stats.successfulRequests;

        console.log(`✅ [LLM-Orchestrator] Sucesso com ${model.id} em ${totalLatency}ms`);

        if (options.onProgress) {
          options.onProgress(`Concluído com ${model.name}`);
        }

        return {
          ...result,
          attemptsMade,
          latencyMs: totalLatency,
        };
      }

      recordFailure(model.id);
      errors.push(...result.errors);

      if (result.errors.some(e => e.statusCode === 429)) {
        console.log(`⏭️ [LLM-Orchestrator] ${model.id} rate limited, pulando para próximo modelo`);
        break;
      }
    }
  }

  console.log(`⚠️ [LLM-Orchestrator] Todas as APIs falharam, usando fallback local`);

  if (options.onProgress) {
    options.onProgress('Gerando conteúdo localmente...');
  }

  const localResult = generateLocalFallback(cleanPrompt, activityType);
  
  stats.successfulRequests++;
  stats.modelUsage['local-fallback'] = (stats.modelUsage['local-fallback'] || 0) + 1;
  stats.providerUsage.local++;

  return {
    ...localResult,
    attemptsMade,
    errors,
    latencyMs: Date.now() - startTime,
  };
}

// ============================================================================
// COMPATIBILITY WRAPPER (for controle-APIs-gerais-school-power.ts)
// ============================================================================

export interface CascadeResult {
  success: boolean;
  data: string | null;
  modelUsed: string;
  providerUsed: string;
  attemptsMade: number;
  errors: Array<{ model: string; error: string }>;
  totalLatency: number;
}

export async function executeWithCascadeFallback(
  prompt: string,
  options?: {
    onProgress?: (status: string) => void;
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    activityType?: ActivityType;
  }
): Promise<CascadeResult> {
  const result = await generateContent(prompt, {
    onProgress: options?.onProgress,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    timeout: options?.timeout,
    activityType: options?.activityType,
  });

  return {
    success: result.success,
    data: result.data,
    modelUsed: result.model,
    providerUsed: result.provider,
    attemptsMade: result.attemptsMade,
    errors: result.errors.map(e => ({ model: e.model, error: e.error })),
    totalLatency: result.latencyMs,
  };
}

// ============================================================================
// STATS & UTILITIES
// ============================================================================

export function getOrchestratorStats(): OrchestratorStats & { cache: ReturnType<typeof getCacheStats> } {
  return {
    ...stats,
    cache: getCacheStats(),
  };
}

export function resetOrchestratorStats(): void {
  stats.totalRequests = 0;
  stats.successfulRequests = 0;
  stats.failedRequests = 0;
  stats.cacheHits = 0;
  stats.cacheMisses = 0;
  stats.avgLatencyMs = 0;
  stats.modelUsage = {};
  stats.providerUsage = { groq: 0, gemini: 0, local: 0 };
}

console.log(`🚀 [LLM-Orchestrator] Sistema Unificado v3.0 Enterprise inicializado`);
console.log(`   📊 Modelos disponíveis: ${getActiveModels().length}`);
console.log(`   💾 Cache: ${ORCHESTRATOR_CONFIG.enableCache ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   🔒 Circuit Breaker: ${ORCHESTRATOR_CONFIG.enableCircuitBreaker ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   ⏱️ Rate Limiting: ${ORCHESTRATOR_CONFIG.enableRateLimiting ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   🎯 Smart Routing: ${ORCHESTRATOR_CONFIG.enableSmartRouting ? 'Habilitado' : 'Desabilitado'}`);
