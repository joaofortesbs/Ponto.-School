
import { GoogleGenerativeAI } from '@google/generative-ai';

export interface GeminiResponse {
  text: string;
  error?: string;
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI;
  private model: any;

  constructor() {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'AIzaSyAzlddq4mQbPP0rTuGF1JjQKdtEGFEWcXE';
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
  }

  async generateText(prompt: string): Promise<GeminiResponse> {
    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return { text };
    } catch (error) {
      console.error('Erro no Gemini:', error);
      return { 
        text: '', 
        error: error instanceof Error ? error.message : 'Erro desconhecido' 
      };
    }
  }

  async generateSequenciaDidatica(data: any): Promise<GeminiResponse> {
    const prompt = `
    Gere uma sequência didática completa baseada nos seguintes dados:
    
    Disciplina: ${data.disciplina || 'Não especificada'}
    Série/Ano: ${data.serie || 'Não especificada'}
    Tema: ${data.tema || 'Não especificado'}
    Objetivos: ${data.objetivos || 'Não especificados'}
    Duração: ${data.duracao || 'Não especificada'}
    
    Retorne uma sequência didática estruturada com:
    1. Título
    2. Objetivos de aprendizagem
    3. Conteúdos programáticos
    4. Metodologia
    5. Recursos didáticos
    6. Avaliação
    7. Cronograma das atividades
    `;

    return this.generateText(prompt);
  }
}

export const geminiClient = new GeminiClient();
