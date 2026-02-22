/**
 * LLM ORCHESTRATOR - EDENAI PROVIDER
 * 
 * Provider para EdenAI — agregador multi-provider com failover automático.
 * Dá acesso a GPT-4o-mini da OpenAI sem precisar de chave OpenAI direta.
 * 
 * API diferente da interface OpenAI: usa endpoint próprio com "providers" field.
 * 
 * @version 4.0.0
 */

import type { LLMModel, GenerateContentResult, ModelError } from '../types';
import { ORCHESTRATOR_CONFIG } from '../config';

interface EdenAIModelConfig {
  provider: string;
  modelName: string;
}

function parseEdenAIModelId(modelId: string): EdenAIModelConfig {
  const parts = modelId.split('/');
  if (parts.length === 2) {
    return { provider: parts[0], modelName: parts[1] };
  }
  return { provider: 'openai', modelName: modelId };
}

export async function callEdenAIAPI(
  model: LLMModel,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    systemPrompt?: string;
    apiKey: string;
  }
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const errors: ModelError[] = [];

  console.log(`🚀 [EDENAI] Tentando modelo: ${model.name} (${model.id})`);

  if (!options.apiKey || options.apiKey.trim().length < 20) {
    const error: ModelError = {
      model: model.id,
      provider: 'edenai',
      error: 'EdenAI API Key inválida ou não configurada',
      timestamp: Date.now(),
    };
    errors.push(error);
    console.warn(`⚠️ [EDENAI] API Key inválida`);
    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'edenai',
      tier: model.tier,
      latencyMs: Date.now() - startTime,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }

  const timeout = options.timeout || ORCHESTRATOR_CONFIG.timeout;
  const { provider: edenProvider, modelName } = parseEdenAIModelId(model.id);

  const fullPrompt = options.systemPrompt
    ? `${options.systemPrompt}\n\n${prompt}`
    : prompt;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('https://api.edenai.run/v2/text/generation', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${options.apiKey}`,
      },
      body: JSON.stringify({
        providers: edenProvider,
        text: fullPrompt,
        temperature: options.temperature ?? 0.3,
        max_tokens: Math.min(options.maxTokens ?? model.maxTokens, 4096),
        settings: {
          [edenProvider]: modelName,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      const error: ModelError = {
        model: model.id,
        provider: 'edenai',
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        statusCode: response.status,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [EDENAI] ${model.name} falhou: HTTP ${response.status}`);
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'edenai',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const data = await response.json();
    const providerResult = data[edenProvider];

    if (!providerResult || providerResult.status !== 'success') {
      const error: ModelError = {
        model: model.id,
        provider: 'edenai',
        error: `EdenAI provider ${edenProvider} retornou status: ${providerResult?.status || 'unknown'}`,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [EDENAI] ${model.name}: provider falhou`);
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'edenai',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const content = providerResult.generated_text;

    if (!content || content.trim().length === 0) {
      const error: ModelError = {
        model: model.id,
        provider: 'edenai',
        error: 'Resposta vazia da EdenAI',
        timestamp: Date.now(),
      };
      errors.push(error);
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'edenai',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    console.log(`✅ [EDENAI] ${model.name} respondeu em ${latencyMs}ms (${content.length} chars)`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'edenai',
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
      provider: 'edenai',
      error: isTimeout ? `Timeout após ${timeout}ms` : errorMessage,
      timestamp: Date.now(),
    };
    errors.push(modelError);
    console.error(`❌ [EDENAI] ${model.name} erro: ${modelError.error}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'edenai',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }
}
