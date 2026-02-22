/**
 * LLM ORCHESTRATOR - CONFIGURATION
 * 
 * Configuração centralizada de todos os modelos LLM disponíveis.
 * Sistema com 11 modelos em cascata (9 Groq + 2 Gemini) + fallback local.
 * 
 * ARQUITETURA DE 5 TIERS:
 * ┌─────────────────────────────────────────────────────────────────────────┐
 * │ TIER 1: ULTRA-FAST (< 500ms) - Para respostas instantâneas             │
 * │ └─ llama-3.1-8b-instant        (Groq - 8B params)                      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 2: FAST (500ms-2s) - Equilíbrio velocidade/qualidade              │
 * │ ├─ llama-3.3-70b-versatile     (Groq - 70B params, principal)          │
 * │ └─ llama-3.3-70b-specdec       (Groq - 70B SpecDec)                    │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 3: BALANCED - Para tarefas que precisam de raciocínio             │
 * │ └─ llama-4-scout-17b-16e-instruct (Groq - Llama 4 Scout)               │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 4: POWERFUL - Modelos mais potentes (fallback externo)            │
 * │ ├─ gemini-2.5-flash            (Google - 1M context, multimodal)       │
 * │ └─ gemini-2.5-flash-lite       (Google - Versão lite mais rápida)      │
 * ├─────────────────────────────────────────────────────────────────────────┤
 * │ TIER 5: FALLBACK LOCAL - NUNCA FALHA                                   │
 * │ └─ local-fallback              (Geração local inteligente)             │
 * └─────────────────────────────────────────────────────────────────────────┘
 * 
 * @version 3.1.0 — Gemini 2.5 Flash (migração de 2.0 depreciado)
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
  // ========== TIER 1: ULTRA-FAST (Groq - Modelos Rápidos) ==========
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

  // ========== TIER 2: FAST (Groq - Principal) ==========
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

  // ========== TIER 3: BALANCED (Groq - Llama 4) ==========
  {
    id: 'meta-llama/llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 131072,
    tier: 'balanced',
    priority: 4,
    isActive: true,
    avgLatencyMs: 500,
    bestFor: ['plano-aula', 'sequencia-didatica', 'general', 'avaliacao-diagnostica'],
  },

  // ========== TIER 4: POWERFUL (Gemini 2.5) ==========
  {
    id: 'gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    tier: 'powerful',
    priority: 5,
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
    priority: 6,
    isActive: true,
    avgLatencyMs: 1500,
    bestFor: ['quiz-interativo', 'flash-cards', 'general'],
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
    priority: 7,
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
  failureThreshold: 5,         // 5 falhas para abrir o circuito (menos sensível a erros transitórios)
  recoveryTimeMs: 20000,       // 20 segundos para tentar recuperar (mais rápido)
  halfOpenSuccessThreshold: 2, // 2 sucessos para fechar o circuito
};

// ============================================================================
// RATE LIMITER CONFIG (per provider)
// ============================================================================

export const RATE_LIMITER_CONFIG: Record<string, RateLimiterConfig> = {
  groq: {
    maxRequestsPerMinute: 50,    // 50 requests/min (conservador — ajuste conforme tier da conta)
    maxTokensPerMinute: 100000,  // 100K tokens/min
    windowMs: 60000,             // 1 minuto
  },
  gemini: {
    maxRequestsPerMinute: 30,    // 30 requests/min (Gemini 2.5 Flash tem limite maior)
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
