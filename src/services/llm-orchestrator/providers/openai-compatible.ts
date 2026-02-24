/**
 * LLM ORCHESTRATOR - OPENAI-COMPATIBLE PROVIDER
 * 
 * Provider genérico para APIs compatíveis com a interface OpenAI:
 * - OpenRouter (openrouter.ai) — agregador: Claude, GPT-4, DeepSeek, free models
 * - XRoute (xroute.ai) — Claude, GPT-5, Grok via créditos premium
 * - Together AI (together.ai) — 200+ modelos, Llama 4, Qwen, DeepSeek
 * - DeepInfra (deepinfra.com) — mais barato do mercado, Llama, Qwen, DeepSeek
 * 
 * Todos usam exatamente o mesmo formato de request/response da OpenAI API.
 * 
 * @version 4.0.0
 */

import type { LLMModel, GenerateContentResult, ModelError, LLMProvider } from '../types';
import { ORCHESTRATOR_CONFIG } from '../config';

interface OpenAICompatibleOptions {
  temperature?: number;
  maxTokens?: number;
  timeout?: number;
  systemPrompt?: string;
  apiKey?: string;
}

export async function callOpenAICompatibleAPI(
  model: LLMModel,
  prompt: string,
  options: OpenAICompatibleOptions
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const errors: ModelError[] = [];
  const provider = model.provider as LLMProvider;

  console.log(`🚀 [${provider.toUpperCase()}] Tentando modelo: ${model.name} (${model.id})`);

  const timeout = options.timeout || ORCHESTRATOR_CONFIG.timeout;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const messages = options.systemPrompt
      ? [
          { role: 'system', content: options.systemPrompt },
          { role: 'user', content: prompt },
        ]
      : [{ role: 'user', content: prompt }];

    const response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider,
        model: model.id,
        messages,
        temperature: options.temperature ?? 0.3,
        max_tokens: Math.min(options.maxTokens ?? model.maxTokens, model.maxTokens),
        stream: false,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const error: ModelError = {
        model: model.id,
        provider,
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        statusCode: response.status,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [${provider.toUpperCase()}] ${model.name} falhou: HTTP ${response.status}`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider,
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
        provider,
        error: 'Resposta vazia da API',
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [${provider.toUpperCase()}] ${model.name} retornou resposta vazia`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider,
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    console.log(`✅ [${provider.toUpperCase()}] ${model.name} respondeu em ${latencyMs}ms (${content.length} chars)`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider,
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
      provider,
      error: isTimeout ? `Timeout após ${timeout}ms` : errorMessage,
      timestamp: Date.now(),
    };
    errors.push(modelError);

    console.error(`❌ [${provider.toUpperCase()}] ${model.name} erro: ${modelError.error}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider,
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }
}
