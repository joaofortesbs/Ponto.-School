/**
 * LLM ORCHESTRATOR - HUGGINGFACE PROVIDER
 * 
 * Provider para HuggingFace Inference API.
 * Modelos open-source gratuitos — fallback de último recurso antes do local.
 * ATENÇÃO: Cold starts podem demorar 30-60s se o modelo não estiver carregado.
 * 
 * @version 4.0.0
 */

import type { LLMModel, GenerateContentResult, ModelError } from '../types';
import { ORCHESTRATOR_CONFIG } from '../config';

function formatHFPrompt(prompt: string, systemPrompt?: string): string {
  const system = systemPrompt || 'Você é Jota, um assistente educacional brasileiro especializado em criação de atividades pedagógicas.';
  return `<s>[INST] ${system}\n\n${prompt} [/INST]`;
}

export async function callHuggingFaceAPI(
  model: LLMModel,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    systemPrompt?: string;
    apiKey?: string;
  }
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const errors: ModelError[] = [];

  console.log(`🚀 [HUGGINGFACE] Tentando modelo: ${model.name} (${model.id})`);

  const timeout = options.timeout || Math.max(ORCHESTRATOR_CONFIG.timeout, 60000);
  const formattedPrompt = formatHFPrompt(prompt, options.systemPrompt);

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch('/api/ai/huggingface', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        endpoint: model.endpoint,
        inputs: formattedPrompt,
        parameters: {
          max_new_tokens: Math.min(options.maxTokens ?? 2000, 2000),
          temperature: options.temperature ?? 0.3,
          return_full_text: false,
          do_sample: true,
        },
        options: {
          wait_for_model: true,
          use_cache: false,
        },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();

      if (response.status === 503) {
        const error: ModelError = {
          model: model.id,
          provider: 'huggingface',
          error: `Modelo não carregado (cold start): ${errorText.substring(0, 100)}`,
          statusCode: 503,
          timestamp: Date.now(),
        };
        errors.push(error);
        console.warn(`⚠️ [HUGGINGFACE] Cold start detectado para ${model.name}`);
        return {
          success: false,
          data: null,
          model: model.id,
          provider: 'huggingface',
          tier: model.tier,
          latencyMs,
          cached: false,
          attemptsMade: 1,
          errors,
        };
      }

      const error: ModelError = {
        model: model.id,
        provider: 'huggingface',
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        statusCode: response.status,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [HUGGINGFACE] ${model.name} falhou: HTTP ${response.status}`);
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'huggingface',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const data = await response.json();
    
    let content: string | null = null;
    if (Array.isArray(data) && data[0]?.generated_text) {
      content = data[0].generated_text;
    } else if (typeof data === 'object' && data.generated_text) {
      content = data.generated_text;
    }

    if (!content || content.trim().length === 0) {
      const error: ModelError = {
        model: model.id,
        provider: 'huggingface',
        error: 'Resposta vazia do HuggingFace',
        timestamp: Date.now(),
      };
      errors.push(error);
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'huggingface',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const cleaned = content.replace(formattedPrompt, '').trim();
    console.log(`✅ [HUGGINGFACE] ${model.name} respondeu em ${latencyMs}ms (${cleaned.length} chars)`);

    return {
      success: true,
      data: cleaned || content,
      model: model.id,
      provider: 'huggingface',
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
      provider: 'huggingface',
      error: isTimeout ? `Timeout após ${timeout}ms (HuggingFace pode ter cold start)` : errorMessage,
      timestamp: Date.now(),
    };
    errors.push(modelError);
    console.error(`❌ [HUGGINGFACE] ${model.name} erro: ${modelError.error}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'huggingface',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }
}
