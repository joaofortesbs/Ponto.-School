
export interface GeminiGenerateOptions {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
}

export interface GeminiResponse {
  success: boolean;
  result?: string;
  error?: string;
}

export class GeminiClient {
  private apiKey: string;
  private baseURL: string = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async generate(options: GeminiGenerateOptions): Promise<GeminiResponse> {
    try {
      console.log('🚀 Gerando conteúdo com Gemini:', {
        promptLength: options.prompt.length,
        temperature: options.temperature,
        maxTokens: options.maxTokens
      });

      const payload = {
        contents: [{
          parts: [{
            text: options.prompt
          }]
        }],
        generationConfig: {
          temperature: options.temperature || 0.7,
          maxOutputTokens: options.maxTokens || 4000,
          topP: 0.8,
          topK: 40
        }
      };

      const response = await fetch(`${this.baseURL}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error(`Gemini API Error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        const result = data.candidates[0].content.parts[0].text;
        console.log('✅ Conteúdo gerado com sucesso pelo Gemini');
        return {
          success: true,
          result
        };
      } else {
        throw new Error('Resposta inválida da API Gemini');
      }
    } catch (error) {
      console.error('❌ Erro na geração com Gemini:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      };
    }
  }

  async testConnection(): Promise<boolean> {
    try {
      const testResponse = await this.generate({
        prompt: 'Teste de conexão. Responda apenas: OK',
        temperature: 0.1,
        maxTokens: 10
      });
      return testResponse.success;
    } catch (error) {
      console.error('❌ Teste de conexão falhou:', error);
      return false;
    }
  }
}

// Instância padrão do cliente
const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDGXKgUsX-xhJX5kYd0m1EGaFxwFOMD2tA';

export const geminiClient = new GeminiClient(GEMINI_API_KEY);

// Exportações nomeadas e default para compatibilidade
export { GeminiClient };
export default geminiClient;
