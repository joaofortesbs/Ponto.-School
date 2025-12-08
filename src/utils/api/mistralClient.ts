
import { API_KEYS, API_URLS, API_CONFIG, TOKEN_COSTS, AI_MODELS } from '@/config/apiKeys';

export interface MistralRequest {
  prompt: string;
  temperature?: number;
  maxTokens?: number;
  topP?: number;
}

export interface MistralResponse {
  success: boolean;
  result: string;
  estimatedTokens: number;
  estimatedPowerCost: number;
  executionTime: number;
  error?: string;
}

interface HuggingFaceResponse {
  generated_text?: string;
  error?: string;
}

export class MistralClient {
  private apiKey: string;
  private baseUrl: string;
  private model: string;

  constructor() {
    this.apiKey = API_KEYS.HUGGINGFACE || import.meta.env.VITE_HUGGINGFACE_API_KEY || '';
    this.baseUrl = API_URLS.HUGGINGFACE;
    this.model = AI_MODELS.MISTRAL_NEMO;
  }

  /**
   * Faz requisição para a API HuggingFace com modelo Mistral
   */
  async generate(request: MistralRequest): Promise<MistralResponse> {
    const startTime = Date.now();
    
    try {
      if (!this.apiKey) {
        throw new Error('Chave da API HuggingFace não configurada. Configure VITE_HUGGINGFACE_API_KEY.');
      }

      const response = await fetch(`${this.baseUrl}/${this.model}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: request.prompt,
          parameters: {
            temperature: request.temperature || 0.7,
            top_p: request.topP || 0.8,
            max_new_tokens: request.maxTokens || 2048,
            return_full_text: false,
          },
          options: {
            wait_for_model: true,
          }
        }),
        signal: AbortSignal.timeout(API_CONFIG.timeout)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro na API HuggingFace: ${response.status} ${response.statusText} - ${errorText}`);
      }

      const data: HuggingFaceResponse[] | HuggingFaceResponse = await response.json();
      const executionTime = Date.now() - startTime;

      // HuggingFace retorna um array de resultados
      let responseText = '';
      if (Array.isArray(data)) {
        responseText = data[0]?.generated_text || '';
      } else if (data.generated_text) {
        responseText = data.generated_text;
      } else if (data.error) {
        throw new Error(`Erro do modelo: ${data.error}`);
      }

      if (!responseText) {
        throw new Error('Resposta vazia da API HuggingFace');
      }

      const estimatedTokens = this.estimateTokens(request.prompt + responseText);
      const estimatedPowerCost = estimatedTokens * TOKEN_COSTS.MISTRAL;

      return {
        success: true,
        result: responseText,
        estimatedTokens,
        estimatedPowerCost,
        executionTime,
      };

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('Erro ao chamar API Mistral/HuggingFace:', error);
      
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

  /**
   * Método compatível com chamadas generateContent (para compatibilidade)
   */
  async generateContent(prompt: string): Promise<string> {
    const result = await this.generate({ prompt });
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao gerar conteúdo');
    }
    
    return result.result;
  }

  /**
   * Gera resposta em formato JSON estruturado
   */
  async generateJSON<T>(prompt: string): Promise<T> {
    const jsonPrompt = `${prompt}\n\nRETURN ONLY VALID JSON, no explanations or markdown.`;
    
    const result = await this.generate({ 
      prompt: jsonPrompt,
      temperature: 0.3, // Menor temperatura para JSON mais consistente
    });
    
    if (!result.success) {
      throw new Error(result.error || 'Erro ao gerar JSON');
    }
    
    // Limpa e parseia o JSON
    let cleanedText = result.result.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    
    // Tenta encontrar o JSON no texto
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }
    
    return JSON.parse(cleanedText);
  }
}

// Instância padrão para importação
export const mistralClient = new MistralClient();

// Alias para compatibilidade com código antigo
export const geminiClient = mistralClient;
export const GeminiClient = MistralClient;
