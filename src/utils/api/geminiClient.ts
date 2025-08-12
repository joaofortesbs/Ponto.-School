import { GoogleGenerativeAI } from '@google/generative-ai';

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY || 'sua-chave-api-aqui';

export class GeminiClient {
  private genAI: GoogleGenerativeAI;

  constructor() {
    this.genAI = new GoogleGenerativeAI(API_KEY);
  }

  async generateContent(prompt: string, model: string = 'gemini-1.5-flash') {
    try {
      const generativeModel = this.genAI.getGenerativeModel({ model });
      const result = await generativeModel.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar conteúdo com Gemini:', error);
      throw error;
    }
  }

  async generateStructuredContent(prompt: string, schema?: any) {
    try {
      const model = this.genAI.getGenerativeModel({ 
        model: 'gemini-1.5-flash',
        generationConfig: schema ? { 
          responseMimeType: "application/json",
          responseSchema: schema 
        } : undefined
      });

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();
    } catch (error) {
      console.error('Erro ao gerar conteúdo estruturado:', error);
      throw error;
    }
  }
}

export const geminiClient = new GeminiClient();