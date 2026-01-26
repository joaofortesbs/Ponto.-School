/**
 * CONTROLE DE APIs GERAIS - SCHOOL POWER
 * 
 * Sistema de persistência multi-API com fallback em cascata.
 * Garante que SEMPRE haverá uma resposta, independente de falhas.
 * 
 * Arquitetura:
 * ┌─────────────────────────────────────────────────────────────┐
 * │ SISTEMA DE PERSISTÊNCIA                                     │
 * ├─────────────────────────────────────────────────────────────┤
 * │ Nível 1: llama-3.3-70b-versatile (principal)               │
 * │ Nível 2: llama-3.1-8b-instant (rápido e leve)              │
 * │ Nível 3: llama-4-scout-17b-16e-instruct (novo)             │
 * │ Nível 4: gemini-2.0-flash (fallback externo)               │
 * │ Nível 5: Resultado local pré-definido (nunca falha)        │
 * └─────────────────────────────────────────────────────────────┘
 */

import { geminiLogger } from '@/utils/geminiDebugLogger';

// ============================================================================
// CONFIGURAÇÃO DE APIs
// ============================================================================

export interface APIModel {
  id: string;
  name: string;
  provider: 'groq' | 'gemini' | 'local';
  endpoint: string;
  maxTokens: number;
  contextWindow: number;
  priority: number;
  isActive: boolean;
}

export const API_MODELS_CASCADE: APIModel[] = [
  {
    id: 'llama-3.3-70b-versatile',
    name: 'Llama 3.3 70B Versatile',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 1,
    isActive: true,
  },
  {
    id: 'llama-3.1-8b-instant',
    name: 'Llama 3.1 8B Instant',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 2,
    isActive: true,
  },
  {
    id: 'llama-4-scout-17b-16e-instruct',
    name: 'Llama 4 Scout 17B',
    provider: 'groq',
    endpoint: 'https://api.groq.com/openai/v1/chat/completions',
    maxTokens: 8000,
    contextWindow: 128000,
    priority: 3,
    isActive: true,
  },
  {
    id: 'gemini-2.0-flash',
    name: 'Gemini 2.0 Flash',
    provider: 'gemini',
    endpoint: 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
    maxTokens: 8192,
    contextWindow: 1000000,
    priority: 4,
    isActive: true,
  },
];

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const API_CONFIG = {
  timeout: 30000,
  maxRetriesPerModel: 2,
  retryDelay: 1000,
  exponentialBackoff: true,
};

// ============================================================================
// SISTEMA DE CACHE IN-MEMORY - Performance Engineering
// ============================================================================

interface CacheEntry {
  data: string;
  model: string;
  provider: string;
  timestamp: number;
  hitCount: number;
}

const CACHE_CONFIG = {
  MAX_ENTRIES: 100,
  TTL_MS: 5 * 60 * 1000,
  MIN_PROMPT_LENGTH_FOR_CACHE: 50,
};

const responseCache = new Map<string, CacheEntry>();

function generateCacheKey(prompt: string): string {
  const normalized = prompt.toLowerCase().trim().replace(/\s+/g, ' ');
  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    const char = normalized.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return `cache_${hash.toString(36)}`;
}

function getCachedResponse(prompt: string): CacheEntry | null {
  if (prompt.length < CACHE_CONFIG.MIN_PROMPT_LENGTH_FOR_CACHE) return null;
  
  const key = generateCacheKey(prompt);
  const entry = responseCache.get(key);
  
  if (!entry) return null;
  
  if (Date.now() - entry.timestamp > CACHE_CONFIG.TTL_MS) {
    responseCache.delete(key);
    return null;
  }
  
  entry.hitCount++;
  console.log(`⚡ [CACHE] Hit para query (${entry.hitCount}x usado)`);
  return entry;
}

function setCacheResponse(prompt: string, data: string, model: string, provider: string): void {
  if (prompt.length < CACHE_CONFIG.MIN_PROMPT_LENGTH_FOR_CACHE) return;
  if (!data || data.length < 10) return;
  
  if (responseCache.size >= CACHE_CONFIG.MAX_ENTRIES) {
    const oldestKey = responseCache.keys().next().value;
    if (oldestKey) responseCache.delete(oldestKey);
  }
  
  const key = generateCacheKey(prompt);
  responseCache.set(key, {
    data,
    model,
    provider,
    timestamp: Date.now(),
    hitCount: 0,
  });
  console.log(`💾 [CACHE] Resposta armazenada (${responseCache.size} entradas)`);
}

// ============================================================================
// CLASSIFICADOR DE COMPLEXIDADE - Roteamento Inteligente
// ============================================================================

type QueryComplexity = 'simple' | 'moderate' | 'complex';

function classifyQueryComplexity(prompt: string): QueryComplexity {
  const wordCount = prompt.split(/\s+/).length;
  const hasCodeKeywords = /\b(código|code|implementar|algoritmo|função|class|script)\b/i.test(prompt);
  const hasComplexKeywords = /\b(analise|análise|compare|avalie|profundo|detalhado|completo|extenso)\b/i.test(prompt);
  const hasSimpleKeywords = /\b(o que é|defina|liste|enumere|quanto|quando|onde|quem)\b/i.test(prompt);
  
  if (hasSimpleKeywords && wordCount < 30 && !hasComplexKeywords) {
    return 'simple';
  }
  
  if (hasCodeKeywords || hasComplexKeywords || wordCount > 150) {
    return 'complex';
  }
  
  return 'moderate';
}

function getOptimalModelForComplexity(complexity: QueryComplexity): string[] {
  switch (complexity) {
    case 'simple':
      return ['llama-3.1-8b-instant', 'llama-3.3-70b-versatile'];
    case 'moderate':
      return ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
    case 'complex':
      return ['llama-3.3-70b-versatile', 'gemini-2.0-flash'];
  }
}

// ============================================================================
// VALIDAÇÃO DE INPUT - Proteção e Sanitização
// ============================================================================

const INPUT_CONFIG = {
  MAX_PROMPT_LENGTH: 8000,
};

function validateAndSanitizePrompt(prompt: string): { valid: boolean; sanitized: string; error?: string } {
  if (!prompt || typeof prompt !== 'string') {
    return { valid: false, sanitized: '', error: 'Prompt inválido' };
  }
  
  const trimmed = prompt.trim();
  
  if (trimmed.length === 0) {
    return { valid: false, sanitized: '', error: 'Prompt vazio' };
  }
  
  if (trimmed.length > INPUT_CONFIG.MAX_PROMPT_LENGTH) {
    return {
      valid: true,
      sanitized: trimmed.substring(0, INPUT_CONFIG.MAX_PROMPT_LENGTH) + '...[truncado]',
    };
  }
  
  return { valid: true, sanitized: trimmed };
}

// ============================================================================
// TIPOS
// ============================================================================

export interface APICallResult {
  success: boolean;
  data: string | null;
  model: string;
  provider: string;
  error?: string;
  latency?: number;
  tokensUsed?: number;
}

export interface CascadeResult {
  success: boolean;
  data: string | null;
  modelUsed: string;
  providerUsed: string;
  attemptsMade: number;
  errors: Array<{ model: string; error: string }>;
  totalLatency: number;
}

// ============================================================================
// FUNÇÕES AUXILIARES
// ============================================================================

function getGroqApiKey(): string {
  return (import.meta.env.VITE_GROQ_API_KEY || '').trim();
}

function getGeminiApiKey(): string {
  return (import.meta.env.VITE_GEMINI_API_KEY || '').trim();
}

function validateApiKey(key: string, provider: string): boolean {
  if (!key) return false;
  if (provider === 'groq') return key.startsWith('gsk_') && key.length > 10;
  if (provider === 'gemini') return key.length > 10;
  return false;
}

async function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================================================
// CHAMADAS ESPECÍFICAS POR PROVIDER
// ============================================================================

async function callGroqAPI(
  model: APIModel,
  prompt: string,
  apiKey: string
): Promise<APICallResult> {
  const startTime = Date.now();
  
  console.log(`🚀 [GROQ] Tentando modelo: ${model.name}`);
  
  try {
    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.3,
        max_tokens: Math.min(model.maxTokens, 7000),
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GROQ] ${model.name} falhou: ${response.status}`);
      
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        error: 'Resposta vazia da API',
        latency,
      };
    }

    console.log(`✅ [GROQ] ${model.name} respondeu em ${latency}ms`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'groq',
      latency,
      tokensUsed: data.usage?.total_tokens,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [GROQ] ${model.name} erro: ${errorMessage}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'groq',
      error: errorMessage,
      latency,
    };
  }
}

async function callGeminiAPI(
  model: APIModel,
  prompt: string,
  apiKey: string
): Promise<APICallResult> {
  const startTime = Date.now();
  
  console.log(`🚀 [GEMINI] Tentando modelo: ${model.name}`);
  
  try {
    const url = `${model.endpoint}?key=${apiKey}`;
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: model.maxTokens,
        },
      }),
      signal: AbortSignal.timeout(API_CONFIG.timeout),
    });

    const latency = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      console.warn(`⚠️ [GEMINI] ${model.name} falhou: ${response.status}`);
      
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        error: `HTTP ${response.status}: ${errorText}`,
        latency,
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content) {
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        error: 'Resposta vazia da API',
        latency,
      };
    }

    console.log(`✅ [GEMINI] ${model.name} respondeu em ${latency}ms`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'gemini',
      latency,
    };
  } catch (error) {
    const latency = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    console.error(`❌ [GEMINI] ${model.name} erro: ${errorMessage}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      error: errorMessage,
      latency,
    };
  }
}

// ============================================================================
// FALLBACK LOCAL (NUNCA FALHA)
// ============================================================================

function generateLocalFallback(prompt: string): string {
  console.log('🔄 [LOCAL] Gerando fallback local...');
  
  const defaultActivities = [
    {
      id: 'lista-exercicios',
      title: 'Lista de Exercícios Personalizada',
      description: 'Lista de exercícios baseada no contexto fornecido.',
      duration: '30 min',
      difficulty: 'Médio',
      category: 'Exercícios',
      type: 'activity',
    },
    {
      id: 'resumo',
      title: 'Resumo do Conteúdo',
      description: 'Resumo estruturado do tema solicitado.',
      duration: '20 min',
      difficulty: 'Fácil',
      category: 'Resumo',
      type: 'activity',
    },
    {
      id: 'mapa-mental',
      title: 'Mapa Mental',
      description: 'Organização visual dos conceitos principais.',
      duration: '25 min',
      difficulty: 'Médio',
      category: 'Organização',
      type: 'activity',
    },
    {
      id: 'flash-cards',
      title: 'Flash Cards para Revisão',
      description: 'Cards de memorização para estudo.',
      duration: '15 min',
      difficulty: 'Fácil',
      category: 'Revisão',
      type: 'activity',
    },
    {
      id: 'quiz-interativo',
      title: 'Quiz Interativo',
      description: 'Questionário gamificado para fixação.',
      duration: '20 min',
      difficulty: 'Médio',
      category: 'Avaliação',
      type: 'activity',
    },
  ];

  return JSON.stringify(defaultActivities);
}

// ============================================================================
// FUNÇÃO PRINCIPAL: CASCATA DE FALLBACK
// ============================================================================

/**
 * Executa chamada com fallback em cascata.
 * Tenta cada modelo na ordem de prioridade até obter sucesso.
 * Se todos falharem, retorna resultado local garantido.
 * 
 * OTIMIZAÇÕES APLICADAS:
 * - Cache in-memory para queries frequentes
 * - Classificação de complexidade para roteamento inteligente
 * - Validação e sanitização de input
 */
export async function executeWithCascadeFallback(
  prompt: string,
  options?: {
    skipModels?: string[];
    maxAttempts?: number;
    onProgress?: (status: string) => void;
    userId?: string;
    bypassCache?: boolean;
  }
): Promise<CascadeResult> {
  const startTime = Date.now();
  const errors: Array<{ model: string; error: string }> = [];
  let attemptsMade = 0;
  
  const validation = validateAndSanitizePrompt(prompt);
  if (!validation.valid) {
    console.warn(`⚠️ [CASCADE] Prompt inválido: ${validation.error}, usando fallback local`);
    const localData = generateLocalFallback('prompt inválido');
    return {
      success: true,
      data: localData,
      modelUsed: 'local-fallback-validation',
      providerUsed: 'local',
      attemptsMade: 0,
      errors: [{ model: 'validation', error: validation.error || 'Erro de validação' }],
      totalLatency: Date.now() - startTime,
    };
  }
  
  const sanitizedPrompt = validation.sanitized;
  
  if (!options?.bypassCache) {
    const cached = getCachedResponse(sanitizedPrompt);
    if (cached) {
      return {
        success: true,
        data: cached.data,
        modelUsed: `${cached.model}-cached`,
        providerUsed: cached.provider,
        attemptsMade: 0,
        errors: [],
        totalLatency: Date.now() - startTime,
      };
    }
  }
  
  const complexity = classifyQueryComplexity(sanitizedPrompt);
  const preferredModels = getOptimalModelForComplexity(complexity);
  console.log(`🧠 [CASCADE] Complexidade: ${complexity} → Modelos preferidos: ${preferredModels.join(', ')}`);
  
  const groqApiKey = getGroqApiKey();
  const geminiApiKey = getGeminiApiKey();
  
  const skipModels = options?.skipModels || [];
  const maxAttempts = options?.maxAttempts || API_MODELS_CASCADE.length;
  const onProgress = options?.onProgress;
  
  let activeModels = API_MODELS_CASCADE
    .filter(m => m.isActive && !skipModels.includes(m.id))
    .sort((a, b) => {
      const aPreferred = preferredModels.indexOf(a.id);
      const bPreferred = preferredModels.indexOf(b.id);
      if (aPreferred !== -1 && bPreferred !== -1) return aPreferred - bPreferred;
      if (aPreferred !== -1) return -1;
      if (bPreferred !== -1) return 1;
      return a.priority - b.priority;
    })
    .slice(0, maxAttempts);

  console.log('🎯 [CASCADE] Iniciando sistema de fallback...');
  console.log(`📋 [CASCADE] Modelos ordenados: ${activeModels.map(m => m.name).join(', ')}`);

  geminiLogger.logRequest(sanitizedPrompt, { cascade: true, models: activeModels.map(m => m.id), complexity });

  for (const model of activeModels) {
    attemptsMade++;
    onProgress?.(`Tentando ${model.name}...`);
    
    let result: APICallResult;
    
    if (model.provider === 'groq') {
      if (!validateApiKey(groqApiKey, 'groq')) {
        errors.push({ model: model.id, error: 'API Key Groq não configurada' });
        continue;
      }
      
      for (let retry = 0; retry < API_CONFIG.maxRetriesPerModel; retry++) {
        result = await callGroqAPI(model, sanitizedPrompt, groqApiKey);
        
        if (result.success) {
          geminiLogger.logResponse({ model: model.id, success: true }, Date.now() - startTime);
          
          if (result.data) {
            setCacheResponse(sanitizedPrompt, result.data, model.id, 'groq');
          }
          
          return {
            success: true,
            data: result.data,
            modelUsed: model.id,
            providerUsed: 'groq',
            attemptsMade,
            errors,
            totalLatency: Date.now() - startTime,
          };
        }
        
        if (result.error?.includes('429') && retry < API_CONFIG.maxRetriesPerModel - 1) {
          const delay = API_CONFIG.retryDelay * Math.pow(2, retry);
          console.log(`⏳ [CASCADE] Rate limit, aguardando ${delay}ms...`);
          await sleep(delay);
          continue;
        }
        
        errors.push({ model: model.id, error: result.error || 'Erro desconhecido' });
        break;
      }
    } 
    else if (model.provider === 'gemini') {
      if (!validateApiKey(geminiApiKey, 'gemini')) {
        errors.push({ model: model.id, error: 'API Key Gemini não configurada' });
        continue;
      }
      
      result = await callGeminiAPI(model, sanitizedPrompt, geminiApiKey);
      
      if (result.success) {
        geminiLogger.logResponse({ model: model.id, success: true }, Date.now() - startTime);
        
        if (result.data) {
          setCacheResponse(sanitizedPrompt, result.data, model.id, 'gemini');
        }
        
        return {
          success: true,
          data: result.data,
          modelUsed: model.id,
          providerUsed: 'gemini',
          attemptsMade,
          errors,
          totalLatency: Date.now() - startTime,
        };
      }
      
      errors.push({ model: model.id, error: result.error || 'Erro desconhecido' });
    }
  }

  console.warn('⚠️ [CASCADE] Todos os modelos falharam, usando fallback local');
  onProgress?.('Usando resposta local...');
  
  const localData = generateLocalFallback(sanitizedPrompt);
  
  geminiLogger.error('error', 'Todos os modelos falharam no cascade', { errors });

  return {
    success: true,
    data: localData,
    modelUsed: 'local-fallback',
    providerUsed: 'local',
    attemptsMade,
    errors,
    totalLatency: Date.now() - startTime,
  };
}

// ============================================================================
// FUNÇÕES DE CONVENIÊNCIA
// ============================================================================

/**
 * Gera plano de ação educacional com fallback garantido.
 */
export async function generateEducationalPlan(
  prompt: string,
  onProgress?: (status: string) => void
): Promise<{ data: string; model: string; provider: string }> {
  const result = await executeWithCascadeFallback(prompt, { onProgress });
  
  return {
    data: result.data || '[]',
    model: result.modelUsed,
    provider: result.providerUsed,
  };
}

/**
 * Gera conteúdo de atividade específica com fallback garantido.
 */
export async function generateActivityContent(
  prompt: string,
  onProgress?: (status: string) => void
): Promise<{ data: string; model: string; provider: string }> {
  const result = await executeWithCascadeFallback(prompt, { onProgress });
  
  return {
    data: result.data || '',
    model: result.modelUsed,
    provider: result.providerUsed,
  };
}

/**
 * Verifica status das APIs disponíveis.
 */
export function getAPIStatus(): {
  groq: { configured: boolean; modelsAvailable: number };
  gemini: { configured: boolean };
  totalModels: number;
} {
  const groqKey = getGroqApiKey();
  const geminiKey = getGeminiApiKey();
  
  const groqModels = API_MODELS_CASCADE.filter(m => m.provider === 'groq' && m.isActive);
  
  return {
    groq: {
      configured: validateApiKey(groqKey, 'groq'),
      modelsAvailable: groqModels.length,
    },
    gemini: {
      configured: validateApiKey(geminiKey, 'gemini'),
    },
    totalModels: API_MODELS_CASCADE.filter(m => m.isActive).length,
  };
}

/**
 * Lista modelos disponíveis ordenados por prioridade.
 */
export function getAvailableModels(): APIModel[] {
  return API_MODELS_CASCADE
    .filter(m => m.isActive)
    .sort((a, b) => a.priority - b.priority);
}

// ============================================================================
// EXPORT DEFAULT
// ============================================================================

/**
 * Retorna estatísticas do cache para monitoramento.
 */
export function getCacheStats(): {
  entries: number;
  maxEntries: number;
  ttlMs: number;
} {
  return {
    entries: responseCache.size,
    maxEntries: CACHE_CONFIG.MAX_ENTRIES,
    ttlMs: CACHE_CONFIG.TTL_MS,
  };
}

/**
 * Limpa o cache manualmente (útil para debug).
 */
export function clearCache(): void {
  responseCache.clear();
  console.log('🧹 [CACHE] Cache limpo manualmente');
}

export default {
  executeWithCascadeFallback,
  generateEducationalPlan,
  generateActivityContent,
  getAPIStatus,
  getAvailableModels,
  getCacheStats,
  clearCache,
  API_MODELS_CASCADE,
  API_CONFIG,
  CACHE_CONFIG,
  INPUT_CONFIG,
};
