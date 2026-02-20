/**
 * LLM ORCHESTRATOR - GEMINI PROVIDER
 * 
 * Provider para todos os modelos Gemini do Google.
 * Inclui: Gemini 2.5 Flash, Gemini 2.0 Flash
 * 
 * @version 3.0.0
 */

import type { LLMModel, GenerateContentResult, ModelError } from '../types';
import { getGeminiApiKey, validateGeminiApiKey, ORCHESTRATOR_CONFIG } from '../config';

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required?: string[];
  };
}

export async function callGeminiWithFunctionCalling(
  model: LLMModel,
  prompt: string,
  functionDeclarations: GeminiFunctionDeclaration[],
  options: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    systemPrompt?: string;
  } = {}
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const apiKey = getGeminiApiKey();
  const errors: ModelError[] = [];

  console.log(`🚀 [GEMINI-FC] Function Calling com ${model.name} (${model.id})`);

  if (!validateGeminiApiKey(apiKey)) {
    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      tier: model.tier,
      latencyMs: Date.now() - startTime,
      cached: false,
      attemptsMade: 1,
      errors: [{ model: model.id, provider: 'gemini', error: 'API Key inválida', timestamp: Date.now() }],
    };
  }

  const timeout = options.timeout || ORCHESTRATOR_CONFIG.timeout;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const url = `${model.endpoint}?key=${apiKey}`;

    const body: any = {
      contents: [{ parts: [{ text: prompt }] }],
      tools: [{ functionDeclarations }],
      toolConfig: { functionCallingConfig: { mode: 'ANY' } },
      generationConfig: {
        temperature: options.temperature ?? 0.2,
        maxOutputTokens: options.maxTokens ?? model.maxTokens,
      },
    };

    if (options.systemPrompt) {
      body.systemInstruction = { parts: [{ text: options.systemPrompt }] };
    }

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text();
      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors: [{ model: model.id, provider: 'gemini', error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`, statusCode: response.status, timestamp: Date.now() }],
      };
    }

    const data = await response.json();
    const functionCall = data.candidates?.[0]?.content?.parts?.[0]?.functionCall;

    if (functionCall) {
      console.log(`✅ [GEMINI-FC] Function call recebido: ${functionCall.name} em ${latencyMs}ms`);
      return {
        success: true,
        data: JSON.stringify(functionCall.args),
        model: model.id,
        provider: 'gemini',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors: [],
      };
    }

    const textContent = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (textContent) {
      console.log(`⚠️ [GEMINI-FC] Gemini retornou texto ao invés de function call, tentando extrair JSON`);
      return {
        success: true,
        data: textContent,
        model: model.id,
        provider: 'gemini',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors: [],
      };
    }

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors: [{ model: model.id, provider: 'gemini', error: 'Sem function call ou texto na resposta', timestamp: Date.now() }],
    };

  } catch (error) {
    const latencyMs = Date.now() - startTime;
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors: [{ model: model.id, provider: 'gemini', error: errorMessage, timestamp: Date.now() }],
    };
  }
}

export async function callGeminiAPI(
  model: LLMModel,
  prompt: string,
  options: {
    temperature?: number;
    maxTokens?: number;
    timeout?: number;
    systemPrompt?: string;
  } = {}
): Promise<GenerateContentResult> {
  const startTime = Date.now();
  const apiKey = getGeminiApiKey();
  const errors: ModelError[] = [];

  console.log(`🚀 [GEMINI] Tentando modelo: ${model.name} (${model.id})`);

  if (!validateGeminiApiKey(apiKey)) {
    const error: ModelError = {
      model: model.id,
      provider: 'gemini',
      error: 'API Key inválida ou não configurada',
      timestamp: Date.now(),
    };
    errors.push(error);
    console.warn(`⚠️ [GEMINI] API Key inválida`);
    
    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
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

    const url = `${model.endpoint}?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...(options.systemPrompt ? { systemInstruction: { parts: [{ text: options.systemPrompt }] } } : {}),
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: options.temperature ?? 0.3,
          maxOutputTokens: options.maxTokens ?? model.maxTokens,
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
        provider: 'gemini',
        error: `HTTP ${response.status}: ${errorText.substring(0, 200)}`,
        statusCode: response.status,
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [GEMINI] ${model.name} falhou: HTTP ${response.status}`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    const data = await response.json();
    const content = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!content || content.trim().length === 0) {
      const error: ModelError = {
        model: model.id,
        provider: 'gemini',
        error: 'Resposta vazia da API',
        timestamp: Date.now(),
      };
      errors.push(error);
      console.warn(`⚠️ [GEMINI] ${model.name} retornou resposta vazia`);

      return {
        success: false,
        data: null,
        model: model.id,
        provider: 'gemini',
        tier: model.tier,
        latencyMs,
        cached: false,
        attemptsMade: 1,
        errors,
      };
    }

    console.log(`✅ [GEMINI] ${model.name} respondeu em ${latencyMs}ms (${content.length} chars)`);

    return {
      success: true,
      data: content,
      model: model.id,
      provider: 'gemini',
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
      provider: 'gemini',
      error: isTimeout ? `Timeout após ${timeout}ms` : errorMessage,
      timestamp: Date.now(),
    };
    errors.push(modelError);
    
    console.error(`❌ [GEMINI] ${model.name} erro: ${modelError.error}`);

    return {
      success: false,
      data: null,
      model: model.id,
      provider: 'gemini',
      tier: model.tier,
      latencyMs,
      cached: false,
      attemptsMade: 1,
      errors,
    };
  }
}
