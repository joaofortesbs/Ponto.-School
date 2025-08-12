import { API_KEYS, API_URLS, API_CONFIG, TOKEN_COSTS } from '@/config/apiKeys';

export interface GeminiResponse {
  success: boolean;
  result: string;
  error?: string;
}

export interface GeminiRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

class GeminiClient {
  private readonly apiKey = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    try {
      console.log('🚀 Enviando requisição para Gemini:', {
        promptLength: request.prompt.length,
        temperature: request.temperature,
        maxTokens: request.maxTokens
      });

      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: request.prompt
            }]
          }],
          generationConfig: {
            temperature: request.temperature || 0.7,
            maxOutputTokens: request.maxTokens || 4000,
            topP: 0.8,
            topK: 40
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na resposta do Gemini:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`API Error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📊 Resposta do Gemini recebida:', {
        hasResponse: !!data,
        candidatesLength: data.candidates?.length || 0
      });

      if (!data.candidates || data.candidates.length === 0) {
        throw new Error('Nenhuma resposta gerada pelo Gemini');
      }

      const result = data.candidates[0].content.parts[0].text;
      console.log('✅ Conteúdo extraído com sucesso, length:', result.length);

      return {
        success: true,
        result: result
      };

    } catch (error) {
      console.error('❌ Erro no cliente Gemini:', error);
      return {
        success: false,
        result: '',
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }
}

export const geminiClient = new GeminiClient();