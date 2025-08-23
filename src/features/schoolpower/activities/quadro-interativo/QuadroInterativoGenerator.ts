
import { geminiLogger } from '../../../../utils/geminiDebugLogger';

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
    console.log('🖼️ Iniciando geração de conteúdo do Quadro Interativo:', data);
    geminiLogger.logRequest('Gerando conteúdo de Quadro Interativo', data);
    
    try {
      const prompt = this.buildPrompt(data);
      const response = await this.callGeminiAPI(prompt);
      const parsedContent = this.parseGeminiResponse(response);
      
      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: parsedContent,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      console.log('✅ Conteúdo do Quadro Interativo gerado com sucesso:', result);
      geminiLogger.logResponse(result, Date.now());
      return result;
    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);
      geminiLogger.logError(error as Error, { data });
      
      // Retornar conteúdo fallback em caso de erro
      return {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: data.theme || 'Conteúdo Educativo',
          text: `Explore o tema "${data.theme}" de forma interativa. ${data.objectives || 'Desenvolva habilidades através desta atividade educativa.'}`
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };
    }
  }

  private buildPrompt(data: QuadroInterativoData): string {
    return `
Você é uma IA especializada em educação que cria conteúdo para quadros interativos educacionais.

Dados da atividade:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Atividade Mostrada: ${data.quadroInterativoCampoEspecifico}

Sua tarefa é gerar conteúdo educativo para ser exibido em um quadro interativo. O conteúdo deve ser:

1. **Educativo e relevante** para o tema e série especificados
2. **Interativo e envolvente** para estudantes
3. **Claro e direto** para fácil compreensão
4. **Adequado ao nível de dificuldade** especificado

Retorne APENAS um objeto JSON no seguinte formato:

{
  "title": "Título atrativo e educativo para o conteúdo do quadro (máximo 50 caracteres)",
  "text": "Conteúdo educativo principal que será exibido no quadro. Deve ser informativo, claro e adequado para ${data.schoolYear}. Inclua conceitos-chave sobre ${data.theme} de forma didática e envolvente (máximo 200 caracteres)."
}

IMPORTANTE: 
- O título deve ser específico e relacionado ao tema "${data.theme}"
- O texto deve ser educativo e adequado para ${data.schoolYear}
- Use linguagem apropriada para o nível de ensino
- Seja conciso mas informativo
- Retorne APENAS o JSON, sem explicações adicionais
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
      
      console.log('📡 Resposta da API Gemini recebida:', data);
      geminiLogger.logResponse(data, executionTime);
      
      return data;
    } catch (error) {
      console.error('❌ Erro na chamada da API Gemini:', error);
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

      console.log('📝 Texto bruto da resposta:', responseText);

      // Tentar extrair JSON da resposta
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsedContent = JSON.parse(jsonMatch[0]);
        console.log('✅ Conteúdo JSON parseado:', parsedContent);
        
        return {
          title: String(parsedContent.title || 'Conteúdo Educativo'),
          text: String(parsedContent.text || 'Conteúdo gerado pela IA.')
        };
      }

      // Se não conseguir parsear JSON, tentar extrair título e texto do texto bruto
      const lines = responseText.split('\n').filter(line => line.trim());
      if (lines.length >= 2) {
        return {
          title: lines[0].replace(/['"*#-]/g, '').trim().substring(0, 50),
          text: lines.slice(1).join(' ').replace(/['"*#-]/g, '').trim().substring(0, 200)
        };
      }

      // Fallback
      return {
        title: 'Conteúdo Educativo',
        text: responseText.substring(0, 200)
      };

    } catch (error) {
      console.error('❌ Erro ao parsear resposta da Gemini:', error);
      return {
        title: 'Conteúdo do Quadro',
        text: 'Conteúdo educativo será exibido aqui.'
      };
    }
  }
}
