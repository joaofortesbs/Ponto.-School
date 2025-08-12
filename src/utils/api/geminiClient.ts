import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyDhzqOQOfqK4o1iKt6nOmKX2wY-mCBdGlU';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-pro" });
  }

  async generateContent(prompt: string, options: any = {}): Promise<any> {
    try {
      console.log('🤖 Enviando prompt para Gemini:', prompt.substring(0, 200) + '...');

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      console.log('✅ Resposta recebida do Gemini:', text.substring(0, 200) + '...');

      return {
        success: true,
        data: text,
        usage: response.usage || {}
      };
    } catch (error) {
      console.error('❌ Erro no GeminiClient:', error);
      return {
        success: false,
        error: error.message || 'Erro desconhecido no Gemini'
      };
    }
  }

  async generateStructuredContent(prompt: string, schema?: any): Promise<any> {
    try {
      const structuredPrompt = schema
        ? `${prompt}\n\nPor favor, responda seguindo exatamente esta estrutura JSON:\n${JSON.stringify(schema, null, 2)}`
        : prompt;

      const result = await this.generateContent(structuredPrompt);

      if (result.success) {
        try {
          // Tentar parsear como JSON
          const parsed = JSON.parse(result.data);
          return {
            success: true,
            data: parsed
          };
        } catch (parseError) {
          // Se não conseguir parsear, retornar o texto original
          return {
            success: true,
            data: result.data
          };
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Erro na geração estruturada:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Instância singleton
const geminiClient = new GeminiClient();

export { geminiClient };
export default geminiClient;