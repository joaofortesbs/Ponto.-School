/**
 * LLM ORCHESTRATOR - GROQ PROVIDER
 * 
 * Provider para todos os modelos Groq (9 modelos).
 * Inclui: Llama 3.x, Mixtral, Gemma 2
 * 
 * @version 3.0.0
 */

import type { LLMModel, GenerateContentResult, ModelError } from '../types';
import { getGroqApiKey, validateGroqApiKey, ORCHESTRATOR_CONFIG } from '../config';

export async function callGroqAPI(
  model: LLMModel,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
  } = {}
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const apiKey = getGroqApiKey();
  const errors: ModelError[] = [];

  console.log(`🚀 [GROQ] Tentando modelo: ${model.name} (${model.id})`);

  if (!validateGroqApiKey(apiKey)) {
    const error: ModelError = {
      model: model.id,
      provider: 'groq',
      error: 'API Key inválida ou não configurada',
      timestamp: Date.now(),
    };
    errors.push(error);
    console.warn(`⚠️ [GROQ] API Key inválida`);
    
    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'groq',
      tier: model.tier,
      latencyMs: Date.now() - startTime,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }

  const timeout = options.timeout || ORCHESTRATOR_CONFIG.timeout;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(model.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: model.id,
        messages: [{ role: 'user', content: prompt }],
        temperature: options.temperature ?? 0.3,
        max_tokens: Math.min(options.maxTokens ?? model.maxTokens, 7000),
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const error: ModelError = {
        model: model.id,
        provider: 'groq',
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        statusCode: response.status,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [GROQ] ${model.name} falhou: HTTP ${response.status}`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content || content.trim().length === 0) {
      const error: ModelError = {
        model: model.id,
        provider: 'groq',
        error: 'Resposta vazia da API',
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [GROQ] ${model.name} retornou resposta vazia`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'groq',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    console.log(`✅ [GROQ] ${model.name} respondeu em ${latencyMs}ms (${content.length} chars)`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'groq',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors: [],
    };

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    const isTimeout = errorMessage.includes('abort') || errorMessage.includes('timeout');
    
    const modelError: ModelError = {
      model: model.id,
      provider: 'groq',
      error: isTimeout ? `Timeout após ${timeout}ms` : errorMessage,
      timestamp: Date.now(),
    };
    errors.push(modelError);
    
    console.error(`❌ [GROQ] ${model.name} erro: ${modelError.error}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'groq',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }
}
