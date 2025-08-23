import { GeminiClient } from '@/utils/api/geminiClient';
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoData {
  disciplina?: string;
  anoSerie?: string;
  tema?: string;
  objetivos?: string;
  nivelDificuldade?: string;
  atividadeMostrada?: string;
  [key: string]: any;
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
  private geminiClient: GeminiClient;

  constructor() {
    this.geminiClient = new GeminiClient();
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('Gerando conteúdo de Quadro Interativo', data);

    try {
      const prompt = this.buildPrompt(data);
      console.log('📝 Prompt construído para Gemini');

      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        throw new Error(`Erro na API Gemini: ${response.error}`);
      }

      const parsedContent = this.parseGeminiResponse(response.result);

      const result: QuadroInterativoContent = {
        title: data.tema || 'Quadro Interativo',
        description: data.objetivos || 'Atividade de quadro interativo',
        cardContent: parsedContent,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('✅ Conteúdo gerado com sucesso:', result);
      geminiLogger.logResponse(result, Date.now());
      return result;
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo:', error);
      geminiLogger.logError(error as Error, { data });
      throw new Error(`Erro ao gerar conteúdo do Quadro Interativo: ${error.message}`);
    }
  }

  private buildPrompt(data: QuadroInterativoData): string {
    return `
Você é uma IA especializada em educação que cria conteúdo para quadros interativos educacionais.

Com base nos dados fornecidos, gere um conteúdo educativo claro e objetivo para ser exibido em um quadro interativo de sala de aula.

**DADOS DA ATIVIDADE:**
- Disciplina: ${data.disciplina || 'Não especificado'}
- Ano/Série: ${data.anoSerie || 'Não especificado'}
- Tema: ${data.tema || 'Não especificado'}
- Objetivos: ${data.objetivos || 'Não especificado'}
- Nível de Dificuldade: ${data.nivelDificuldade || 'Não especificado'}
- Atividade: ${data.atividadeMostrada || 'Não especificado'}

**INSTRUÇÕES:**
1. Crie um título atrativo e direto sobre o tema
2. Desenvolva um texto educativo claro e objetivo (máximo 150 palavras)
3. O conteúdo deve ser adequado para o ano/série especificado
4. Mantenha foco nos objetivos de aprendizagem

**FORMATO DE RESPOSTA (JSON):**
{
  "title": "Título atrativo para o quadro",
  "text": "Texto educativo claro e objetivo para exibição no quadro interativo"
}

Retorne APENAS o JSON, sem comentários adicionais.
`;
  }

  private parseGeminiResponse(response: string): { title: string; text: string } {
    try {
      console.log('🔄 Parseando resposta do Gemini:', response);

      // Limpar a resposta
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');

      // Encontrar o JSON
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);
      }

      const parsed = JSON.parse(cleanedResponse);

      const result = {
        title: parsed.title || 'Conteúdo do Quadro',
        text: parsed.text || 'Conteúdo educativo gerado pela IA.'
      };

      console.log('✅ Resposta parseada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error);
      return {
        title: 'Conteúdo do Quadro',
        text: 'Erro ao processar conteúdo gerado pela IA.'
      };
    }
  }
}