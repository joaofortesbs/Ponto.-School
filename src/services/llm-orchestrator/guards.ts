/**
 * LLM ORCHESTRATOR - GUARDS
 * 
 * Sistema de proteção multi-camada:
 * - Circuit Breaker: Previne chamadas para serviços falhos
 * - Rate Limiter: Controla taxa de requisições
 * - Input Sanitizer: Valida e limpa prompts
 * - Timeout Handler: Gerencia timeouts
 * 
 * @version 3.0.0
 */

import type { 
  CircuitBreakerState, 
  CircuitState, 
  RateLimiterState,
  LLMProvider 
} from './types';
import { 
  CIRCUIT_BREAKER_CONFIG, 
  RATE_LIMITER_CONFIG 
} from './config';

// ============================================================================
// CIRCUIT BREAKER
// ============================================================================

const circuitBreakers = new Map<string, CircuitBreakerState>();

function getOrCreateCircuitBreaker(modelId: string): CircuitBreakerState {
  if (!circuitBreakers.has(modelId)) {
    circuitBreakers.set(modelId, {
      state: 'closed',
      failureCount: 0,
      lastFailureTime: 0,
      successCount: 0,
    });
  }
  return circuitBreakers.get(modelId)!;
}

export function isCircuitOpen(modelId: string): boolean {
  const breaker = getOrCreateCircuitBreaker(modelId);
  
  if (breaker.state === 'closed') {
    return false;
  }
  
  if (breaker.state === 'open') {
    const timeSinceFailure = Date.now() - breaker.lastFailureTime;
    if (timeSinceFailure >= CIRCUIT_BREAKER_CONFIG.recoveryTimeMs) {
      breaker.state = 'half-open';
      breaker.successCount = 0;
      console.log(`🔄 [CircuitBreaker] ${modelId} → half-open (tentando recuperar)`);
      return false;
    }
    return true;
  }
  
  return false;
}

export function recordSuccess(modelId: string): void {
  const breaker = getOrCreateCircuitBreaker(modelId);
  
  if (breaker.state === 'half-open') {
    breaker.successCount++;
    if (breaker.successCount >= CIRCUIT_BREAKER_CONFIG.halfOpenSuccessThreshold) {
      breaker.state = 'closed';
      breaker.failureCount = 0;
      console.log(`✅ [CircuitBreaker] ${modelId} → closed (recuperado)`);
    }
  } else if (breaker.state === 'closed') {
    breaker.failureCount = Math.max(0, breaker.failureCount - 1);
  }
}

export function recordFailure(modelId: string): void {
  const breaker = getOrCreateCircuitBreaker(modelId);
  
  breaker.failureCount++;
  breaker.lastFailureTime = Date.now();
  
  if (breaker.state === 'half-open') {
    breaker.state = 'open';
    console.log(`🔴 [CircuitBreaker] ${modelId} → open (falhou em half-open)`);
  } else if (breaker.failureCount >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    breaker.state = 'open';
    console.log(`🔴 [CircuitBreaker] ${modelId} → open (${breaker.failureCount} falhas)`);
  }
}

export function getCircuitBreakerState(modelId: string): CircuitBreakerState {
  return getOrCreateCircuitBreaker(modelId);
}

export function resetCircuitBreaker(modelId: string): void {
  circuitBreakers.delete(modelId);
  console.log(`🔄 [CircuitBreaker] ${modelId} resetado`);
}

// ============================================================================
// RATE LIMITER
// ============================================================================

const rateLimiters = new Map<LLMProvider, RateLimiterState>();

function getOrCreateRateLimiter(provider: LLMProvider): RateLimiterState {
  if (!rateLimiters.has(provider)) {
    rateLimiters.set(provider, {
      requestCount: 0,
      windowStart: Date.now(),
      tokensUsed: 0,
    });
  }
  return rateLimiters.get(provider)!;
}

export function isRateLimited(provider: LLMProvider): boolean {
  const config = RATE_LIMITER_CONFIG[provider];
  if (!config) return false;
  
  const limiter = getOrCreateRateLimiter(provider);
  const now = Date.now();
  
  if (now - limiter.windowStart >= config.windowMs) {
    limiter.requestCount = 0;
    limiter.tokensUsed = 0;
    limiter.windowStart = now;
    return false;
  }
  
  if (limiter.requestCount >= config.maxRequestsPerMinute) {
    const waitTime = config.windowMs - (now - limiter.windowStart);
    console.warn(`⏳ [RateLimiter] ${provider} limitado (${limiter.requestCount}/${config.maxRequestsPerMinute} req). Reset em ${Math.ceil(waitTime/1000)}s`);
    return true;
  }
  
  return false;
}

export function recordRequest(provider: LLMProvider, tokensUsed: number = 0): void {
  const limiter = getOrCreateRateLimiter(provider);
  limiter.requestCount++;
  limiter.tokensUsed += tokensUsed;
}

export function getRateLimiterState(provider: LLMProvider): RateLimiterState {
  return getOrCreateRateLimiter(provider);
}

// ============================================================================
// INPUT SANITIZER
// ============================================================================

const INPUT_LIMITS = {
  maxPromptLength: 10000,
  minPromptLength: 5,
};

export interface SanitizeResult {
  valid: boolean;
  sanitized: string;
  error?: string;
  wasTruncated: boolean;
}

export function sanitizePrompt(prompt: string): SanitizeResult {
  if (!prompt || typeof prompt !== 'string') {
    return { 
      valid: false, 
      sanitized: '', 
      error: 'Prompt inválido: deve ser uma string',
      wasTruncated: false,
    };
  }

  const trimmed = prompt.trim();

  if (trimmed.length < INPUT_LIMITS.minPromptLength) {
    return { 
      valid: false, 
      sanitized: '', 
      error: `Prompt muito curto (mínimo: ${INPUT_LIMITS.minPromptLength} caracteres)`,
      wasTruncated: false,
    };
  }

  if (trimmed.length > INPUT_LIMITS.maxPromptLength) {
    const truncated = trimmed.substring(0, INPUT_LIMITS.maxPromptLength) + '\n\n[...conteúdo truncado]';
    console.warn(`⚠️ [Sanitizer] Prompt truncado de ${trimmed.length} para ${INPUT_LIMITS.maxPromptLength} chars`);
    return { 
      valid: true, 
      sanitized: truncated,
      wasTruncated: true,
    };
  }

  return { 
    valid: true, 
    sanitized: trimmed,
    wasTruncated: false,
  };
}

// ============================================================================
// TIMEOUT UTILITIES
// ============================================================================

export function createTimeout(ms: number): AbortController {
  const controller = new AbortController();
  setTimeout(() => controller.abort(), ms);
  return controller;
}

export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
  errorMessage: string = 'Operação excedeu timeout'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error(`${errorMessage} (${ms}ms)`)), ms)
    ),
  ]);
}

// ============================================================================
// SLEEP UTILITY
// ============================================================================

export async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

export function calculateBackoff(attempt: number, baseDelay: number = 500): number {
  return Math.min(baseDelay * Math.pow(2, attempt), 10000);
}
