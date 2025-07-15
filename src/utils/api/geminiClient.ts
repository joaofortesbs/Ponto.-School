
import { API_KEYS, API_URLS, API_CONFIG, TOKEN_COSTS } from '@/config/apiKeys';

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
  topK?: number;
}

export interface GeminiResponse {
  success: boolean;
  result: string;
  estimatedTokens: number;
  estimatedPowerCost: number;
  executionTime: number;
  error?: string;
}

export class GeminiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEYS.GEMINI;
    this.baseUrl = API_URLS.GEMINI;
  }

  /**
   * Faz requisição para a API Gemini
   */
  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Chave da API Gemini não configurada');
      }

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: request.prompt }]
          }],
          generationConfig: {
            temperature: request.temperature || 0.7,
            topP: request.topP || 0.8,
            topK: request.topK || 40,
            maxOutputTokens: request.maxTokens || 2048,
          }
        }),
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
        throw new Error('Resposta inválida da API Gemini');
      }

      const responseText = data.candidates[0].content.parts[0].text;
      const estimatedTokens = this.estimateTokens(request.prompt + responseText);
      const estimatedPowerCost = estimatedTokens * TOKEN_COSTS.GEMINI;

      return {
        success: true,
        result: responseText,
        estimatedTokens,
        estimatedPowerCost,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      
      return {
        success: false,
        result: '',
        estimatedTokens: 0,
        estimatedPowerCost: 0,
        executionTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Estimativa básica de tokens (aproximadamente 4 caracteres por token)
   */
  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  /**
   * Atualiza a chave da API
   */
  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
  }
}
