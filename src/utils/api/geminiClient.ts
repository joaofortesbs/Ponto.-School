
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
    
    console.log('🤖 [GeminiClient] Iniciando chamada à API Groq...');
    console.log('🤖 [GeminiClient] Prompt (primeiros 300 chars):', request.prompt?.substring(0, 300));
    
    try {
      if (!this.apiKey) {
        console.error('❌ [GeminiClient] API Key não configurada!');
        throw new Error('Chave da API Groq não configurada');
      }

      if (!validateGroqApiKey(this.apiKey)) {
        console.error('❌ [GeminiClient] API Key inválida! Deve começar com "gsk_"');
        throw new Error('Chave da API Groq inválida. A chave deve começar com "gsk_"');
      }

      console.log('✅ [GeminiClient] API Key válida, fazendo requisição...');

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

      console.log('📡 [GeminiClient] Status da resposta:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('❌ [GeminiClient] Erro na API:', errorData);
        throw new Error(`Erro na API Groq: ${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log('📡 [GeminiClient] Resposta recebida em', executionTime, 'ms');

      if (!data.choices || !data.choices[0]?.message?.content) {
        console.error('❌ [GeminiClient] Resposta sem conteúdo válido:', data);
        throw new Error('Resposta inválida da API Groq');
      }

      const responseText = data.choices[0].message.content;
      const estimatedTokens = this.estimateTokens(request.prompt + responseText);
      const estimatedPowerCost = estimatedTokens * TOKEN_COSTS.GROQ;

      console.log('✅ [GeminiClient] Resposta bem-sucedida!');
      console.log('✅ [GeminiClient] Tamanho da resposta:', responseText.length, 'caracteres');
      console.log('✅ [GeminiClient] Primeiros 500 chars:', responseText.substring(0, 500));

      return {
        success: true,
        result: responseText,
        estimatedTokens,
        estimatedPowerCost,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ [GeminiClient] ERRO FATAL na API Groq:', error);
      console.error('❌ [GeminiClient] Tempo até falha:', executionTime, 'ms');
      
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
