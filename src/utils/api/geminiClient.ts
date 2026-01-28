
import { 
  API_KEYS, 
  API_URLS, 
  API_CONFIG, 
  TOKEN_COSTS, 
  API_MODELS, 
  validateGroqApiKey, 
  validateGeminiApiKey,
  fetchWithRetry 
} from '@/config/apiKeys';

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
  provider?: 'groq' | 'groq-fallback' | 'gemini';
}

type APIProvider = 'groq' | 'groq-fallback' | 'gemini';

interface ProviderConfig {
  name: APIProvider;
  apiKey: string;
  baseUrl: string;
  model: string;
  isValid: () => boolean;
  tokenCost: number;
}

export class GeminiClient {
  private groqApiKey: string;
  private geminiApiKey: string;
  private providers: ProviderConfig[];

  constructor() {
    this.groqApiKey = (API_KEYS.GROQ || '').trim();
    this.geminiApiKey = (API_KEYS.GEMINI || '').trim();
    
    this.providers = [
      {
        name: 'groq',
        apiKey: this.groqApiKey,
        baseUrl: API_URLS.GROQ,
        model: API_MODELS.GROQ,
        isValid: () => validateGroqApiKey(this.groqApiKey),
        tokenCost: TOKEN_COSTS.GROQ,
      },
      {
        name: 'groq-fallback',
        apiKey: this.groqApiKey,
        baseUrl: API_URLS.GROQ,
        model: API_MODELS.GROQ_FALLBACK,
        isValid: () => validateGroqApiKey(this.groqApiKey),
        tokenCost: TOKEN_COSTS.GROQ,
      },
      {
        name: 'gemini',
        apiKey: this.geminiApiKey,
        baseUrl: API_URLS.GEMINI,
        model: API_MODELS.GEMINI,
        isValid: () => validateGeminiApiKey(this.geminiApiKey),
        tokenCost: TOKEN_COSTS.GEMINI,
      },
    ];

    console.log('🤖 [GeminiClient] Sistema Multi-API Resiliente inicializado');
    console.log(`   ✅ Groq API: ${validateGroqApiKey(this.groqApiKey) ? 'Configurada' : 'NÃO configurada'}`);
    console.log(`   ✅ Gemini API: ${validateGeminiApiKey(this.geminiApiKey) ? 'Configurada' : 'NÃO configurada'}`);
  }

  async generate(request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    const errors: string[] = [];
    
    console.log('🤖 [GeminiClient] ====== INICIANDO GERAÇÃO COM FALLBACK ======');
    console.log('🤖 [GeminiClient] Prompt (primeiros 300 chars):', request.prompt?.substring(0, 300));

    for (const provider of this.providers) {
      if (!provider.isValid()) {
        console.log(`⏭️ [GeminiClient] Pulando ${provider.name}: API Key não configurada`);
        continue;
      }

      try {
        console.log(`🔄 [GeminiClient] Tentando provider: ${provider.name} (modelo: ${provider.model})`);
        
        const result = await this.callProvider(provider, request);
        
        if (result.success) {
          const executionTime = Date.now() - startTime;
          console.log(`✅ [GeminiClient] SUCESSO com ${provider.name} em ${executionTime}ms`);
          console.log(`✅ [GeminiClient] Resposta (primeiros 500 chars):`, result.result?.substring(0, 500));
          
          return {
            ...result,
            executionTime,
            provider: provider.name,
          };
        }
        
        errors.push(`${provider.name}: ${result.error}`);
        console.warn(`⚠️ [GeminiClient] Falha com ${provider.name}: ${result.error}`);
        
      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : String(error);
        errors.push(`${provider.name}: ${errorMsg}`);
        console.error(`❌ [GeminiClient] Erro com ${provider.name}:`, errorMsg);
      }
    }

    const executionTime = Date.now() - startTime;
    console.error('❌ [GeminiClient] TODAS AS APIs FALHARAM após', executionTime, 'ms');
    console.error('❌ [GeminiClient] Erros:', errors);

    return {
      success: false,
      result: '',
      estimatedTokens: 0,
      estimatedPowerCost: 0,
      executionTime,
      error: `Todas as APIs falharam: ${errors.join('; ')}`,
    };
  }

  private async callProvider(provider: ProviderConfig, request: GeminiRequest): Promise<GeminiResponse> {
    const startTime = Date.now();
    const maxTokens = Math.min(request.maxTokens || API_CONFIG.maxTokens, 7000);

    if (provider.name === 'gemini') {
      return this.callGeminiAPI(provider, request, maxTokens, startTime);
    } else {
      return this.callGroqAPI(provider, request, maxTokens, startTime);
    }
  }

  private async callGroqAPI(
    provider: ProviderConfig, 
    request: GeminiRequest, 
    maxTokens: number,
    startTime: number
  ): Promise<GeminiResponse> {
    const response = await fetchWithRetry(provider.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${provider.apiKey}`,
      },
      body: JSON.stringify({
        model: provider.model,
        messages: [{ role: 'user', content: request.prompt }],
        temperature: request.temperature || 0.7,
        top_p: request.topP || 0.8,
        max_tokens: maxTokens,
      }),
    });

    console.log(`📡 [GeminiClient] ${provider.name} status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status} ${response.statusText} - ${errorData.error?.message || ''}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    if (!data.choices || !data.choices[0]?.message?.content) {
      throw new Error('Resposta sem conteúdo válido');
    }

    const responseText = data.choices[0].message.content;
    const estimatedTokens = this.estimateTokens(request.prompt + responseText);

    return {
      success: true,
      result: responseText,
      estimatedTokens,
      estimatedPowerCost: estimatedTokens * provider.tokenCost,
      executionTime,
    };
  }

  private async callGeminiAPI(
    provider: ProviderConfig, 
    request: GeminiRequest, 
    maxTokens: number,
    startTime: number
  ): Promise<GeminiResponse> {
    const url = `${provider.baseUrl}/${provider.model}:generateContent?key=${provider.apiKey}`;

    const response = await fetchWithRetry(url, {
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
          maxOutputTokens: maxTokens,
        },
        safetySettings: [
          { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_NONE' },
          { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_NONE' },
        ],
      }),
    });

    console.log(`📡 [GeminiClient] ${provider.name} status:`, response.status, response.statusText);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`${response.status} ${response.statusText} - ${errorData.error?.message || JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const executionTime = Date.now() - startTime;

    if (!data.candidates || !data.candidates[0]?.content?.parts?.[0]?.text) {
      console.error('❌ [GeminiClient] Resposta Gemini inválida:', JSON.stringify(data).substring(0, 500));
      throw new Error('Resposta Gemini sem conteúdo válido');
    }

    const responseText = data.candidates[0].content.parts[0].text;
    const estimatedTokens = this.estimateTokens(request.prompt + responseText);

    return {
      success: true,
      result: responseText,
      estimatedTokens,
      estimatedPowerCost: estimatedTokens * provider.tokenCost,
      executionTime,
    };
  }

  private estimateTokens(text: string): number {
    return Math.ceil(text.length / 4);
  }

  updateApiKey(provider: 'groq' | 'gemini', newKey: string): void {
    if (provider === 'groq') {
      this.groqApiKey = newKey;
      this.providers[0].apiKey = newKey;
      this.providers[1].apiKey = newKey;
    } else {
      this.geminiApiKey = newKey;
      this.providers[2].apiKey = newKey;
    }
  }

  async generateContent(prompt: string): Promise<string> {
    const result = await this.generate({ prompt });
    
    if (!result.success) {
      console.error('❌ [GeminiClient] generateContent falhou:', result.error);
      throw new Error(result.error || 'Erro ao gerar conteúdo');
    }
    
    return result.result;
  }

  getAvailableProviders(): string[] {
    return this.providers
      .filter(p => p.isValid())
      .map(p => p.name);
  }
}

export const geminiClient = new GeminiClient();
