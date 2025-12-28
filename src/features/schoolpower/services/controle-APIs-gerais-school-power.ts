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
 */
export async function executeWithCascadeFallback(
  prompt: string,
  options?: {
    skipModels?: string[];
    maxAttempts?: number;
    onProgress?: (status: string) => void;
  }
): Promise<CascadeResult> {
  const startTime = Date.now();
  const errors: Array<{ model: string; error: string }> = [];
  let attemptsMade = 0;
  
  const groqApiKey = getGroqApiKey();
  const geminiApiKey = getGeminiApiKey();
  
  const skipModels = options?.skipModels || [];
  const maxAttempts = options?.maxAttempts || API_MODELS_CASCADE.length;
  const onProgress = options?.onProgress;
  
  const activeModels = API_MODELS_CASCADE
    .filter(m => m.isActive && !skipModels.includes(m.id))
    .sort((a, b) => a.priority - b.priority)
    .slice(0, maxAttempts);

  console.log('🎯 [CASCADE] Iniciando sistema de fallback...');
  console.log(`📋 [CASCADE] Modelos disponíveis: ${activeModels.map(m => m.name).join(', ')}`);

  geminiLogger.logRequest(prompt, { cascade: true, models: activeModels.map(m => m.id) });

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
        result = await callGroqAPI(model, prompt, groqApiKey);
        
        if (result.success) {
          geminiLogger.logResponse({ model: model.id, success: true }, Date.now() - startTime);
          
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
      
      result = await callGeminiAPI(model, prompt, geminiApiKey);
      
      if (result.success) {
        geminiLogger.logResponse({ model: model.id, success: true }, Date.now() - startTime);
        
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
  
  const localData = generateLocalFallback(prompt);
  
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

export default {
  executeWithCascadeFallback,
  generateEducationalPlan,
  generateActivityContent,
  getAPIStatus,
  getAvailableModels,
  API_MODELS_CASCADE,
  API_CONFIG,
};
