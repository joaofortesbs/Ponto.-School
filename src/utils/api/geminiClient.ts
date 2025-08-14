
import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = 'AIzaSyD-Sso0SdyYKoA4M3tQhcWjQ1AoddB7Wo4';

if (!API_KEY) {
  console.error('❌ API Key do Gemini não encontrada');
  throw new Error('API Key do Gemini é obrigatória');
}

const genAI = new GoogleGenerativeAI(API_KEY);

interface GenerationConfig {
  temperature?: number;
  topK?: number;
  topP?: number;
  maxOutputTokens?: number;
}

class GeminiClient {
  private model: any;
  private defaultConfig: GenerationConfig;

  constructor() {
    try {
      this.model = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: {
          temperature: 0.7,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 8192,
        },
      });
      
      this.defaultConfig = {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      };
      
      console.log('✅ Gemini Client inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar Gemini Client:', error);
      throw error;
    }
  }

  async generateContent(prompt: string, config?: GenerationConfig): Promise<any> {
    try {
      console.log('🚀 Enviando prompt para Gemini:', prompt.substring(0, 200) + '...');
      
      if (!prompt || prompt.trim().length === 0) {
        throw new Error('Prompt não pode estar vazio');
      }

      const finalConfig = { ...this.defaultConfig, ...config };
      
      // Configurar o modelo com as configurações específicas
      const modelWithConfig = genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: finalConfig,
      });

      const result = await modelWithConfig.generateContent(prompt);
      
      if (!result || !result.response) {
        throw new Error('Resposta vazia da API Gemini');
      }

      const response = result.response;
      const text = response.text();
      
      if (!text || text.trim().length === 0) {
        throw new Error('Texto de resposta vazio');
      }

      console.log('✅ Resposta recebida do Gemini:', text.substring(0, 200) + '...');
      
      return {
        text: () => text,
        response: response
      };

    } catch (error: any) {
      console.error('❌ Erro ao gerar conteúdo com Gemini:', error);
      
      // Tratamento específico para diferentes tipos de erro
      if (error.message?.includes('API_KEY')) {
        throw new Error('Erro de autenticação com a API Gemini');
      } else if (error.message?.includes('QUOTA')) {
        throw new Error('Limite de uso da API Gemini excedido');
      } else if (error.message?.includes('SAFETY')) {
        throw new Error('Conteúdo bloqueado por filtros de segurança');
      } else {
        throw new Error(`Erro na API Gemini: ${error.message || 'Erro desconhecido'}`);
      }
    }
  }

  async generateWithRetry(prompt: string, maxRetries: number = 3, config?: GenerationConfig): Promise<any> {
    let lastError: Error;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`🔄 Tentativa ${attempt}/${maxRetries} de geração`);
        const result = await this.generateContent(prompt, config);
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`⚠️ Tentativa ${attempt} falhou:`, error.message);
        
        if (attempt < maxRetries) {
          // Aguardar antes da próxima tentativa (backoff exponencial)
          const delay = Math.pow(2, attempt) * 1000;
          console.log(`⏳ Aguardando ${delay}ms antes da próxima tentativa...`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }
    
    throw lastError!;
  }

  // Método para verificar se a API está funcionando
  async healthCheck(): Promise<boolean> {
    try {
      const result = await this.generateContent('Teste de conectividade. Responda apenas "OK".');
      return !!result && !!result.text;
    } catch (error) {
      console.error('❌ Health check falhou:', error);
      return false;
    }
  }
}

// Instância singleton
export const geminiClient = new GeminiClient();

// Export para compatibilidade
export default geminiClient;
