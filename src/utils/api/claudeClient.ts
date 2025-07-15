
import { API_KEYS, API_URLS, API_CONFIG } from '@/config/apiKeys';

export interface ClaudeRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface ClaudeResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  responseTime: number;
  error?: string;
}

export class ClaudeClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = API_KEYS.CLAUDE;
    this.baseUrl = API_URLS.CLAUDE;
  }

  /**
   * Faz requisição para a API Claude
   */
  async generate(request: ClaudeRequest): Promise<ClaudeResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Chave da API Claude não configurada');
      }

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: request.maxTokens || 4096,
          temperature: request.temperature || 0.7,
          top_p: request.topP || 0.9,
          messages: [
            {
              role: 'user',
              content: request.prompt
            }
          ]
        }),
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      });

      if (!response.ok) {
        throw new Error(`Erro na API Claude: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const responseTime = Date.now() - startTime;

      if (!data.content || !data.content[0]?.text) {
        throw new Error('Resposta inválida da API Claude');
      }

      return {
        success: true,
        content: data.content[0].text,
        tokensUsed: data.usage?.input_tokens + data.usage?.output_tokens || 0,
        responseTime,
      };

    } catch (error) {
      const responseTime = Date.now() - startTime;
      
      return {
        success: false,
        content: '',
        tokensUsed: 0,
        responseTime,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza a chave da API
   */
  updateApiKey(newKey: string): void {
    this.apiKey = newKey;
  }
}
