/**
 * LLM ORCHESTRATOR - CONFIGURATION v4.0
 * 
 * 9 providers, 16 modelos em cascata inteligente.
 * 
 * ARQUITETURA DE 5 TIERS:
 * ┌─────────────────────────────────────────────────────────────────────────────┐
 * │ TIER 1: ULTRA-FAST (< 500ms) — Respostas instantâneas                       │
 * │ └─ llama-3.1-8b-instant        (Groq LPU)                                   │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ TIER 2: FAST (500ms-2s) — Equilíbrio velocidade/qualidade                   │
 * │ ├─ llama-3.3-70b-versatile     (Groq LPU — principal)                       │
 * │ ├─ llama-3.3-70b-specdec       (Groq LPU — SpecDec)                         │
 * │ └─ Llama-3.3-70B-Turbo         (Together AI — 3º backup 70B)               │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ TIER 3: BALANCED — Raciocínio mais profundo                                  │
 * │ ├─ llama-4-scout-17b           (Groq LPU — Llama 4)                         │
 * │ ├─ llama-4-maverick:free        (OpenRouter — Llama 4 Maverick grátis)       │
 * │ ├─ Qwen2.5-72B-Turbo           (Together AI — alternativa)                  │
 * │ └─ Llama-3.3-70B               (DeepInfra — mais barato do mercado)         │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ TIER 4: POWERFUL — Máxima qualidade e raciocínio                            │
 * │ ├─ gemini-2.5-flash            (Google — 1M context, multimodal)            │
 * │ ├─ gemini-2.5-flash-lite       (Google — versão lite)                        │
 * │ ├─ DeepSeek-V3                 (DeepInfra — reasoning excelente)             │
 * │ ├─ deepseek-r1:free            (OpenRouter — reasoning grátis)               │
 * │ ├─ claude-3-5-haiku            (XRoute — Claude via créditos)               │
 * │ ├─ gpt-4o-mini                 (EdenAI — GPT via créditos)                  │
 * │ └─ Mistral-7B-Instruct         (HuggingFace — open-source, lento)           │
 * ├─────────────────────────────────────────────────────────────────────────────┤
 * │ TIER 5: FALLBACK LOCAL — NUNCA FALHA                                         │
 * │ └─ local-fallback              (Geração local inteligente)                   │
 * └─────────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 4.0.0 — 9 providers, 16 modelos
 * @author Ponto School
 */

import type { 
  LLMModel, 
  OrchestratorConfig, 
  CacheConfig, 
  CircuitBreakerConfig,
  RateLimiterConfig 
} from './types';

// ============================================================================
// API KEY GETTERS — Cada provider tem seu getter seguro
// ============================================================================

export function getGroqApiKey(): string {
  const key = (import.meta.env.VITE_GROQ_API_KEY || '').trim();
  const isValid = key.startsWith('gsk_') && key.length > 20;
  console.log(`🔑 [Config] getGroqApiKey(): ${key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : 'NÃO CONFIGURADA'} (válida: ${isValid})`);
  return key;
}

export function getGeminiApiKey(): string {
  const key = (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
  const isValid = key.startsWith('AIza') && key.length > 20;
  console.log(`🔑 [Config] getGeminiApiKey(): ${key ? `${key.substring(0, 8)}...${key.substring(key.length - 4)}` : 'NÃO CONFIGURADA'} (válida: ${isValid})`);
  return key;
}

export function getOpenRouterApiKey(): string {
  const key = (import.meta.env.VITE_OPENROUTER_API_KEY || '').trim();
  return key;
}

export function getXRouteApiKey(): string {
  const key = (import.meta.env.VITE_XROUTE_API_KEY || '').trim();
  return key;
}

export function getTogetherApiKey(): string {
  const key = (import.meta.env.VITE_TOGETHER_API_KEY || '').trim();
  return key;
}

export function getDeepInfraApiKey(): string {
  const key = (import.meta.env.VITE_DEEPINFRA_API_KEY || '').trim();
  return key;
}

export function getEdenAIApiKey(): string {
  const key = (import.meta.env.VITE_EDENAI_API_KEY || '').trim();
  return key;
}

export function getHuggingFaceApiKey(): string {
  const key = (import.meta.env.VITE_HUGGINGFACE_API_KEY || '').trim();
  return key;
}

export function validateGroqApiKey(key: string): boolean {
  return key.startsWith('gsk_') && key.length > 20;
}

export function validateGeminiApiKey(key: string): boolean {
  return key.startsWith('AIza') && key.length > 20;
}

export function getApiKeyForProvider(provider: string): string {
  switch (provider) {
    case 'groq': return getGroqApiKey();
    case 'gemini': return getGeminiApiKey();
    case 'openrouter': return getOpenRouterApiKey();
    case 'xroute': return getXRouteApiKey();
    case 'together': return getTogetherApiKey();
    case 'deepinfra': return getDeepInfraApiKey();
    case 'edenai': return getEdenAIApiKey();
    case 'huggingface': return getHuggingFaceApiKey();
    default: return '';
  }
}

// ============================================================================
// MODEL CASCADE CONFIGURATION — 16 modelos em 5 tiers
// ============================================================================

export const LLM_MODELS: LLMModel[] = [

  // ======================================================================
  // TIER 1: ULTRA-FAST — Groq LPU (< 500ms)
  // ======================================================================
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'ultra-fast',
    priority: 1,
    isActive: true,
    avgLatencyMs: 300,
    bestFor: ['flash-cards', 'quiz-interativo', 'general'],
  },

  // ======================================================================
  // TIER 2: FAST — 70B Models (500ms-2s)
  // ======================================================================
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'fast',
    priority: 2,
    isActive: true,
    avgLatencyMs: 1200,
    bestFor: ['lista-exercicios', 'plano-aula', 'sequencia-didatica', 'tese-redacao', 'general'],
  },
  {
    id: 'llama-3.3-70b-specdec',
    name: 'Llama 3.3 70B SpecDec',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'fast',
    priority: 3,
    isActive: true,
    avgLatencyMs: 800,
    bestFor: ['plano-aula', 'sequencia-didatica', 'general'],
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct-Turbo',
    name: 'Llama 3.3 70B Turbo (Together)',
    provider: 'together',
    endpoint: 'https://api.together.ai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'fast',
    priority: 4,
    isActive: true,
    avgLatencyMs: 1500,
    bestFor: ['lista-exercicios', 'plano-aula', 'sequencia-didatica', 'tese-redacao', 'general'],
  },

  // ======================================================================
  // TIER 3: BALANCED — Raciocínio mais profundo
  // ======================================================================
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'balanced',
    priority: 5,
    isActive: true,
    avgLatencyMs: 500,
    bestFor: ['plano-aula', 'sequencia-didatica', 'general', 'avaliacao-diagnostica'],
  },
  {
    id: 'google/gemma-3-4b-it:free',
    name: 'Gemma 3 4B (OpenRouter Free)',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'balanced',
    priority: 6,
    isActive: true,
    avgLatencyMs: 1500,
    bestFor: ['plano-aula', 'sequencia-didatica', 'lista-exercicios', 'general'],
  },
  {
    id: 'Qwen/Qwen2.5-72B-Instruct-Turbo',
    name: 'Qwen 2.5 72B Turbo (Together)',
    provider: 'together',
    endpoint: 'https://api.together.ai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 32768,
    tier: 'balanced',
    priority: 7,
    isActive: true,
    avgLatencyMs: 2000,
    bestFor: ['plano-aula', 'sequencia-didatica', 'tese-redacao', 'avaliacao-diagnostica', 'general'],
  },
  {
    id: 'meta-llama/Llama-3.3-70B-Instruct',
    name: 'Llama 3.3 70B (DeepInfra)',
    provider: 'deepinfra',
    endpoint: 'https://api.deepinfra.com/v1/openai/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'balanced',
    priority: 8,
    isActive: true,
    avgLatencyMs: 1800,
    bestFor: ['lista-exercicios', 'plano-aula', 'quiz-interativo', 'general'],
  },

  // ======================================================================
  // TIER 4: POWERFUL — Máxima qualidade
  // ======================================================================
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    tier: 'powerful',
    priority: 9,
    isActive: true,
    avgLatencyMs: 2000,
    bestFor: ['lista-exercicios', 'plano-aula', 'sequencia-didatica', 'tese-redacao', 'quiz-interativo', 'flash-cards', 'general'],
  },
  {
    id: 'gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    tier: 'powerful',
    priority: 10,
    isActive: true,
    avgLatencyMs: 1500,
    bestFor: ['quiz-interativo', 'flash-cards', 'general'],
  },
  {
    id: 'deepseek-ai/DeepSeek-V3',
    name: 'DeepSeek V3 (DeepInfra)',
    provider: 'deepinfra',
    endpoint: 'https://api.deepinfra.com/v1/openai/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'powerful',
    priority: 11,
    isActive: true,
    avgLatencyMs: 3000,
    bestFor: ['plano-aula', 'sequencia-didatica', 'tese-redacao', 'avaliacao-diagnostica', 'general'],
  },
  {
    id: 'deepseek/deepseek-r1:free',
    name: 'DeepSeek R1 (OpenRouter Free)',
    provider: 'openrouter',
    endpoint: 'https://openrouter.ai/api/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'powerful',
    priority: 12,
    isActive: true,
    avgLatencyMs: 4000,
    bestFor: ['plano-aula', 'sequencia-didatica', 'avaliacao-diagnostica', 'tese-redacao', 'general'],
  },
  {
    id: 'claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku (XRoute)',
    provider: 'xroute',
    endpoint: 'https://api.xroute.ai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 200000,
    tier: 'powerful',
    priority: 13,
    isActive: true,
    avgLatencyMs: 3000,
    bestFor: ['plano-aula', 'sequencia-didatica', 'tese-redacao', 'lista-exercicios', 'general'],
  },
  {
    id: 'openai/gpt-4o-mini',
    name: 'GPT-4o Mini (EdenAI)',
    provider: 'edenai',
    endpoint: 'https://api.edenai.run/v2/text/generation',
    maxTokens: 8000,
    contextWindow: 128000,
    tier: 'powerful',
    priority: 14,
    isActive: true,
    avgLatencyMs: 3500,
    bestFor: ['quiz-interativo', 'flash-cards', 'lista-exercicios', 'general'],
  },
  {
    id: 'mistralai/Mistral-7B-Instruct-v0.3',
    name: 'Mistral 7B (HuggingFace)',
    provider: 'huggingface',
    endpoint: 'https://router.huggingface.co/hf-inference/models/mistralai/Mistral-7B-Instruct-v0.3/v1/chat/completions',
    maxTokens: 2000,
    contextWindow: 32768,
    tier: 'powerful',
    priority: 15,
    isActive: false,
    avgLatencyMs: 8000,
    bestFor: ['general', 'flash-cards', 'quiz-interativo'],
  },

  // ======================================================================
  // TIER 5: LOCAL FALLBACK — NUNCA FALHA
  // ======================================================================
  {
    id: 'local-fallback',
    name: 'Local Fallback Generator',
    provider: 'local',
    endpoint: 'local',
    maxTokens: 10000,
    contextWindow: 50000,
    tier: 'fallback',
    priority: 16,
    isActive: true,
    avgLatencyMs: 10,
    bestFor: ['lista-exercicios', 'quiz-interativo', 'flash-cards', 'plano-aula', 'sequencia-didatica', 'quadro-interativo', 'tese-redacao', 'avaliacao-diagnostica', 'general'],
  },
];

// ============================================================================
// ORCHESTRATOR CONFIG
// ============================================================================

export const ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  timeout: 30000,
  maxRetriesPerModel: 2,
  retryDelayMs: 500,
  exponentialBackoff: true,
  enableCache: true,
  enableCircuitBreaker: true,
  enableRateLimiting: true,
  enableSmartRouting: true,
};

// ============================================================================
// CACHE CONFIG
// ============================================================================

export const CACHE_CONFIG: CacheConfig = {
  maxEntries: 200,
  ttlMs: 5 * 60 * 1000,
  minPromptLength: 50,
};

// ============================================================================
// CIRCUIT BREAKER CONFIG
// ============================================================================

export const CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 5,
  recoveryTimeMs: 20000,
  halfOpenSuccessThreshold: 2,
};

// ============================================================================
// RATE LIMITER CONFIG — por provider
// ============================================================================

export const RATE_LIMITER_CONFIG: Record<string, RateLimiterConfig> = {
  groq: {
    maxRequestsPerMinute: 50,
    maxTokensPerMinute: 100000,
    windowMs: 60000,
  },
  gemini: {
    maxRequestsPerMinute: 30,
    maxTokensPerMinute: 1000000,
    windowMs: 60000,
  },
  together: {
    maxRequestsPerMinute: 60,
    maxTokensPerMinute: 200000,
    windowMs: 60000,
  },
  openrouter: {
    maxRequestsPerMinute: 20,
    maxTokensPerMinute: 100000,
    windowMs: 60000,
  },
  deepinfra: {
    maxRequestsPerMinute: 50,
    maxTokensPerMinute: 200000,
    windowMs: 60000,
  },
  xroute: {
    maxRequestsPerMinute: 30,
    maxTokensPerMinute: 100000,
    windowMs: 60000,
  },
  edenai: {
    maxRequestsPerMinute: 20,
    maxTokensPerMinute: 50000,
    windowMs: 60000,
  },
  huggingface: {
    maxRequestsPerMinute: 10,
    maxTokensPerMinute: 20000,
    windowMs: 60000,
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

export function getActiveModels(): LLMModel[] {
  return LLM_MODELS.filter(m => m.isActive).sort((a, b) => a.priority - b.priority);
}

export function getModelsByTier(tier: string): LLMModel[] {
  return LLM_MODELS.filter(m => m.tier === tier && m.isActive);
}

export function getModelsByProvider(provider: string): LLMModel[] {
  return LLM_MODELS.filter(m => m.provider === provider && m.isActive);
}

export function getModelById(id: string): LLMModel | undefined {
  return LLM_MODELS.find(m => m.id === id);
}

export function getBestModelsForActivity(activityType: string): LLMModel[] {
  return LLM_MODELS
    .filter(m => m.isActive && m.bestFor.includes(activityType as any))
    .sort((a, b) => a.priority - b.priority);
}
