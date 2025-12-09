
import { API_KEYS, API_URLS, API_CONFIG, TOKEN_COSTS, API_MODELS, validateGroqApiKey, fetchWithRetry } from '@/config/apiKeys';

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
    this.apiKey = (API_KEYS.GROQ || '').trim();
    this.baseUrl = API_URLS.GROQ;
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Chave da API Groq não configurada');
      }

      if (!validateGroqApiKey(this.apiKey)) {
        throw new Error('Chave da API Groq inválida. A chave deve começar com "gsk_"');
      }

      const maxTokens = Math.min(request.maxTokens || API_CONFIG.maxTokens, 7000);

      const response = await fetchWithRetry(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: API_MODELS.GROQ,
          messages: [{ role: 'user', content: request.prompt }],
          temperature: request.temperature || 0.7,
          top_p: request.topP || 0.8,
          max_tokens: maxTokens,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Erro na API Groq: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      if (!data.choices || !data.choices[0]?.message?.content) {
        throw new Error('Resposta inválida da API Groq');
      }

      const responseText = data.choices[0].message.content;
      const estimatedTokens = this.estimateTokens(request.prompt + responseText);
      const estimatedPowerCost = estimatedTokens * TOKEN_COSTS.GROQ;

      return {
        success: true,
        result: responseText,
        estimatedTokens,
        estimatedPowerCost,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('Erro na API Groq:', error);
      
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

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
  }

  async generateContent(prompt: string): Promise<string> {
    const result = await this.generate({ prompt });
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao gerar conteúdo');
    }
    
    return result.result;
  }
}

export const geminiClient = new GeminiClient();
