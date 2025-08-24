
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
}

interface QuadroInterativoContent {
  title: string;
  description: string;
  cardContent: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export class QuadroInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('Gerando conteúdo de Quadro Interativo', data);
    
    try {
      const prompt = this.buildPrompt(data);
      const response = await this.callGeminiAPI(prompt);
      const parsedContent = this.parseGeminiResponse(response);
      
      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || 'Conteúdo do Quadro',
          text: parsedContent.text || 'Conteúdo educativo gerado pela IA.'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        // Campos originais para compatibilidade
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico
      };

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ Conteúdo do Quadro Interativo gerado:', result);
      return result;
    } catch (error) {
      geminiLogger.logError(error as Error, { data });
      
      // Fallback em caso de erro
      const fallbackResult: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: 'Atividade de Quadro Interativo',
          text: 'Conteúdo educativo para interação no quadro digital da sala de aula.'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico
      };
      
      console.log('⚠️ Usando conteúdo fallback para Quadro Interativo:', fallbackResult);
      return fallbackResult;
    }
  }

  private buildPrompt(data: QuadroInterativoData): string {
    return `
Você é uma IA especializada em educação que cria conteúdo para quadros interativos.

Com base nos seguintes dados:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Atividade Mostrada: ${data.quadroInterativoCampoEspecifico}

Gere um conteúdo específico para ser exibido em um quadro interativo que será mostrado em um card retangular central.

IMPORTANTE: Responda APENAS no seguinte formato JSON, sem texto adicional:

{
  "title": "Título claro e objetivo da atividade para o quadro (máximo 60 caracteres)",
  "text": "Texto descritivo e educativo que será exibido no quadro interativo, adequado para a série e disciplina especificadas (máximo 300 caracteres, linguagem simples e direta)"
}

O conteúdo deve ser:
- Educativo e apropriado para a série especificada
- Claro e objetivo
- Relacionado diretamente ao tema e objetivos
- Adequado para exibição em quadro interativo
- Sem códigos ou dados técnicos visíveis
`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 1024,
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API Gemini: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;
      
      geminiLogger.logResponse(data, executionTime);
      
      return data;
    } catch (error) {
      geminiLogger.logError(error as Error, { prompt: prompt.substring(0, 200) });
      throw error;
    }
  }

  private parseGeminiResponse(response: any): { title: string; text: string } {
    try {
      const responseText = response?.candidates?.[0]?.content?.parts?.[0]?.text;
      
      if (!responseText) {
        throw new Error('Resposta vazia da API Gemini');
      }

      // Limpar a resposta removendo markdown e extraindo JSON
      let cleanedResponse = responseText
        .replace(/```json\n?/g, '')
        .replace(/```\n?/g, '')
        .replace(/^\s*[\r\n]/gm, '')
        .trim();

      // Tentar fazer parse do JSON
      const parsedContent = JSON.parse(cleanedResponse);
      
      // Validar estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Estrutura JSON inválida na resposta');
      }

      // Limitar tamanhos
      const title = parsedContent.title.substring(0, 60);
      const text = parsedContent.text.substring(0, 300);

      geminiLogger.logValidation({ title, text }, true);
      
      return { title, text };
      
    } catch (error) {
      geminiLogger.logValidation(response, false, [error.message]);
      
      // Fallback com conteúdo padrão
      return {
        title: 'Atividade de Quadro Interativo',
        text: 'Conteúdo educativo para interação no quadro digital da sala de aula.'
      };
    }
  }
}

export default QuadroInterativoGenerator;
