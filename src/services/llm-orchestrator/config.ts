/**
 * LLM ORCHESTRATOR - CONFIGURATION
 * 
 * Configuração centralizada de todos os modelos LLM disponíveis.
 * Sistema com 11 modelos em cascata (9 Groq + 2 Gemini) + fallback local.
 * 
 * ARQUITETURA DE 5 TIERS:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TIER 1: ULTRA-FAST (< 500ms) - Para respostas instantâneas             │
 * │ ├─ llama-3.1-8b-instant        (Groq - 8B params)                      │
 * │ └─ gemma2-9b-it                (Groq - 9B params)                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 2: FAST (500ms-2s) - Equilíbrio velocidade/qualidade              │
 * │ ├─ llama-3.3-70b-versatile     (Groq - 70B params, principal)          │
 * │ ├─ mixtral-8x7b-32768          (Groq - 56B MoE, contexto longo)        │
 * │ └─ llama3-70b-8192             (Groq - 70B params, contexto curto)     │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 3: BALANCED - Para tarefas que precisam de raciocínio             │
 * │ ├─ llama-3-groq-70b-tool-use   (Groq - Tool calling)                   │
 * │ └─ llama-4-scout-17b-16e-instruct (Groq - Novo modelo)                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 4: POWERFUL - Modelos mais potentes (fallback externo)            │
 * │ ├─ gemini-2.5-flash            (Google - 1M context, multimodal)       │
 * │ └─ gemini-2.5-pro              (Google - Mais potente)                 │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 5: FALLBACK LOCAL - NUNCA FALHA                                   │
 * │ └─ local-fallback              (Geração local inteligente)             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 3.0.0
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
// API KEYS (from environment)
// ============================================================================

export function getGroqApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim();
}

export function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

export function validateGroqApiKey(key: string): boolean {
  return key.startsWith('gsk_') && key.length > 20;
}

export function validateGeminiApiKey(key: string): boolean {
  return key.startsWith('AIza') && key.length > 20;
}

// ============================================================================
// MODEL CASCADE CONFIGURATION
// ============================================================================

export const LLM_MODELS: LLMModel[] = [
  // ========== TIER 1: ULTRA-FAST ==========
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
  {
    id: 'gemma2-9b-it',
    name: 'Gemma 2 9B IT',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 8192,
    tier: 'ultra-fast',
    priority: 2,
    isActive: true,
    avgLatencyMs: 400,
    bestFor: ['flash-cards', 'quiz-interativo'],
  },

  // ========== TIER 2: FAST ==========
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'fast',
    priority: 3,
    isActive: true,
    avgLatencyMs: 1200,
    bestFor: ['lista-exercicios', 'plano-aula', 'sequencia-didatica', 'tese-redacao', 'general'],
  },
  {
    id: 'mixtral-8x7b-32768',
    name: 'Mixtral 8x7B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 32768,
    tier: 'fast',
    priority: 4,
    isActive: true,
    avgLatencyMs: 1000,
    bestFor: ['plano-aula', 'sequencia-didatica', 'general'],
  },
  {
    id: 'llama3-70b-8192',
    name: 'Llama 3 70B (8K context)',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 8192,
    tier: 'fast',
    priority: 5,
    isActive: true,
    avgLatencyMs: 1100,
    bestFor: ['quiz-interativo', 'flash-cards', 'general'],
  },

  // ========== TIER 3: BALANCED ==========
  {
    id: 'llama-3-groq-70b-tool-use',
    name: 'Llama 3 70B Tool Use',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 8192,
    tier: 'balanced',
    priority: 6,
    isActive: true,
    avgLatencyMs: 1500,
    bestFor: ['avaliacao-diagnostica', 'quadro-interativo'],
  },
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'balanced',
    priority: 7,
    isActive: true,
    avgLatencyMs: 1800,
    bestFor: ['plano-aula', 'sequencia-didatica', 'general'],
  },

  // ========== TIER 4: POWERFUL (Gemini) ==========
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    tier: 'powerful',
    priority: 8,
    isActive: true,
    avgLatencyMs: 2000,
    bestFor: ['lista-exercicios', 'plano-aula', 'sequencia-didatica', 'tese-redacao', 'general'],
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    tier: 'powerful',
    priority: 9,
    isActive: true,
    avgLatencyMs: 2200,
    bestFor: ['lista-exercicios', 'plano-aula', 'general'],
  },

  // ========== TIER 5: LOCAL FALLBACK (NUNCA FALHA) ==========
  {
    id: 'local-fallback',
    name: 'Local Fallback Generator',
    provider: 'local',
    endpoint: 'local',
    maxTokens: 10000,
    contextWindow: 50000,
    tier: 'fallback',
    priority: 10,
    isActive: true,
    avgLatencyMs: 10,
    bestFor: ['lista-exercicios', 'quiz-interativo', 'flash-cards', 'plano-aula', 'sequencia-didatica', 'quadro-interativo', 'tese-redacao', 'avaliacao-diagnostica', 'general'],
  },
];

// ============================================================================
// ORCHESTRATOR CONFIG
// ============================================================================

export const ORCHESTRATOR_CONFIG: OrchestratorConfig = {
  timeout: 30000,              // 30 segundos timeout global
  maxRetriesPerModel: 2,       // 2 retries por modelo
  retryDelayMs: 500,           // 500ms delay entre retries
  exponentialBackoff: true,    // Backoff exponencial
  enableCache: true,           // Cache habilitado
  enableCircuitBreaker: true,  // Circuit breaker habilitado
  enableRateLimiting: true,    // Rate limiting habilitado
  enableSmartRouting: true,    // Roteamento inteligente habilitado
};

// ============================================================================
// CACHE CONFIG
// ============================================================================

export const CACHE_CONFIG: CacheConfig = {
  maxEntries: 200,             // Máximo de 200 entradas no cache
  ttlMs: 5 * 60 * 1000,        // TTL de 5 minutos
  minPromptLength: 50,         // Mínimo de 50 caracteres para cache
};

// ============================================================================
// CIRCUIT BREAKER CONFIG
// ============================================================================

export const CIRCUIT_BREAKER_CONFIG: CircuitBreakerConfig = {
  failureThreshold: 3,         // 3 falhas para abrir o circuito
  recoveryTimeMs: 30000,       // 30 segundos para tentar recuperar
  halfOpenSuccessThreshold: 2, // 2 sucessos para fechar o circuito
};

// ============================================================================
// RATE LIMITER CONFIG (per provider)
// ============================================================================

export const RATE_LIMITER_CONFIG: Record<string, RateLimiterConfig> = {
  groq: {
    maxRequestsPerMinute: 30,    // 30 requests/min (free tier)
    maxTokensPerMinute: 50000,   // 50K tokens/min
    windowMs: 60000,             // 1 minuto
  },
  gemini: {
    maxRequestsPerMinute: 15,    // 15 requests/min (free tier)
    maxTokensPerMinute: 1000000, // 1M tokens/min
    windowMs: 60000,             // 1 minuto
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
