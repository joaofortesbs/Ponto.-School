/**
 * LLM ORCHESTRATOR - MAIN ENGINE v4.0
 * 
 * Orquestrador principal do Sistema Unificado de LLMs v4.0 Enterprise.
 * 9 providers, 16 modelos em cascata inteligente por tier.
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
 * │ 4. CASCADE EXECUTION (16 modelos em 5 tiers)                            │
 * │    ├── TIER 1: Ultra-Fast  — Groq Llama 3.1 8B                          │
 * │    ├── TIER 2: Fast        — Groq 70B + Together 70B                    │
 * │    ├── TIER 3: Balanced    — Groq Llama4 + OpenRouter + Together + DInf │
 * │    ├── TIER 4: Powerful    — Gemini + DeepInfra + OpenRouter + XRoute   │
 * │    │                         + EdenAI + HuggingFace                     │
 * │    └── TIER 5: Fallback    — Local (NUNCA FALHA)                        │
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
 * @version 4.0.0 — 9 providers, 16 modelos
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
  getApiKeyForProvider,
  ORCHESTRATOR_CONFIG 
} from './config';
import { callGroqAPI } from './providers/groq';
import { callGeminiAPI } from './providers/gemini';
import { callOpenAICompatibleAPI } from './providers/openai-compatible';
import { callEdenAIAPI } from './providers/edenai';
import { callHuggingFaceAPI } from './providers/huggingface';
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
    together: 0,
    openrouter: 0,
    deepinfra: 0,
    xroute: 0,
    edenai: 0,
    huggingface: 0,
    local: 0,
  },
};

// ============================================================================
// PROVIDER DISPATCH — Rota correta por provider
// ============================================================================

async function dispatchToProvider(
  model: LLMModel,
  prompt: string,
  options: GenerateContentOptions
): Promise<GenerateContentResult> {
  const apiKey = getApiKeyForProvider(model.provider);

  switch (model.provider) {
    case 'groq':
      return callGroqAPI(model, prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeout: options.timeout,
        systemPrompt: options.systemPrompt,
      });

    case 'gemini':
      return callGeminiAPI(model, prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeout: options.timeout,
        systemPrompt: options.systemPrompt,
      });

    case 'together':
    case 'openrouter':
    case 'xroute':
    case 'deepinfra':
      return callOpenAICompatibleAPI(model, prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeout: options.timeout,
        systemPrompt: options.systemPrompt,
        apiKey,
      });

    case 'edenai':
      return callEdenAIAPI(model, prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeout: options.timeout,
        systemPrompt: options.systemPrompt,
        apiKey,
      });

    case 'huggingface':
      return callHuggingFaceAPI(model, prompt, {
        temperature: options.temperature,
        maxTokens: options.maxTokens,
        timeout: options.timeout,
        systemPrompt: options.systemPrompt,
        apiKey,
      });

    default:
      return {
        success: false,
        data: null,
        model: model.id,
        provider: model.provider,
        tier: model.tier,
        latencyMs: 0,
        cached: false,
        attemptsMade: 1,
        errors: [{
          model: model.id,
          provider: model.provider,
          error: `Provider desconhecido: ${model.provider}`,
          timestamp: Date.now(),
        }],
      };
  }
}

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

  console.log(`\n🤖 [LLM-Orchestrator v4.0] ====== NOVA REQUISIÇÃO ======`);
  console.log(`🤖 [LLM-Orchestrator] Prompt length: ${prompt.length} chars`);
  console.log(`📊 [LLM-Orchestrator] Modelos ativos: ${getActiveModels().length} (9 providers)`);

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
    options.onProgress(`Iniciando com ${modelsToTry.length} modelos disponíveis (9 providers)...`);
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

      const result = await dispatchToProvider(model, cleanPrompt, options);

      recordRequest(model.provider);

      if (result.success && result.data) {
        recordSuccess(model.id);

        if (ORCHESTRATOR_CONFIG.enableCache) {
          setCacheResponse(cleanPrompt, result.data, model.id, model.provider);
        }

        stats.successfulRequests++;
        stats.modelUsage[model.id] = (stats.modelUsage[model.id] || 0) + 1;
        stats.providerUsage[model.provider] = (stats.providerUsage[model.provider] || 0) + 1;

        const totalLatency = Date.now() - startTime;
        stats.avgLatencyMs = (stats.avgLatencyMs * (stats.successfulRequests - 1) + totalLatency) / stats.successfulRequests;

        console.log(`✅ [LLM-Orchestrator] Sucesso com ${model.id} [${model.provider}] em ${totalLatency}ms`);

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
        console.log(`⏭️ [LLM-Orchestrator] ${model.id} rate limited (429), pulando para próximo modelo`);
        break;
      }
    }
  }

  console.log(`⚠️ [LLM-Orchestrator] Todos os ${modelsToTry.length} modelos falharam, usando fallback local`);

  if (options.onProgress) {
    options.onProgress('Gerando conteúdo localmente...');
  }

  const localResult = generateLocalFallback(cleanPrompt, activityType);
  
  stats.successfulRequests++;
  stats.modelUsage['local-fallback'] = (stats.modelUsage['local-fallback'] || 0) + 1;
  stats.providerUsage['local'] = (stats.providerUsage['local'] || 0) + 1;

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
    systemPrompt?: string;
  }
): Promise<CascadeResult> {
  const result = await generateContent(prompt, {
    onProgress: options?.onProgress,
    temperature: options?.temperature,
    maxTokens: options?.maxTokens,
    timeout: options?.timeout,
    activityType: options?.activityType,
    systemPrompt: options?.systemPrompt,
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
  stats.providerUsage = {
    groq: 0,
    gemini: 0,
    together: 0,
    openrouter: 0,
    deepinfra: 0,
    xroute: 0,
    edenai: 0,
    huggingface: 0,
    local: 0,
  };
}

console.log(`🚀 [LLM-Orchestrator v4.0] Sistema Unificado Enterprise inicializado`);
console.log(`   📊 Modelos ATIVOS: ${getActiveModels().length}/16 — Cascata: Groq → Gemini → OpenRouter → Local`);
console.log(`   🌐 Providers ativos: Groq ✅ | Gemini ✅ | OpenRouter ✅ | Local ✅`);
console.log(`   💾 Cache: ${ORCHESTRATOR_CONFIG.enableCache ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   🔒 Circuit Breaker: ${ORCHESTRATOR_CONFIG.enableCircuitBreaker ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   ⏱️ Rate Limiting: ${ORCHESTRATOR_CONFIG.enableRateLimiting ? 'Habilitado' : 'Desabilitado'}`);
console.log(`   🎯 Smart Routing: ${ORCHESTRATOR_CONFIG.enableSmartRouting ? 'Habilitado' : 'Desabilitado'}`);
