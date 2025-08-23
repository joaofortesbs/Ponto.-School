
import { GeminiClient } from '@/utils/api/geminiClient';
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoData {
  disciplina?: string;
  anoSerie?: string;
  tema?: string;
  objetivos?: string;
  nivelDificuldade?: string;
  atividadeMostrada?: string;
  theme?: string;
  objectives?: string;
  subject?: string;
  schoolYear?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
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
      // Normalizar dados de entrada
      const normalizedData = this.normalizeInputData(data);
      console.log('📝 Dados normalizados para geração:', normalizedData);

      const prompt = this.buildPrompt(normalizedData);
      console.log('📝 Prompt construído para Gemini:', prompt.substring(0, 200) + '...');

      const response = await this.geminiClient.generate({
        prompt,
        temperature: 0.7,
        maxTokens: 1000,
        topP: 0.9,
        topK: 40
      });

      if (!response.success) {
        console.error('❌ Erro na resposta do Gemini:', response.error);
        // Retornar conteúdo de fallback em caso de erro da API
        return this.createFallbackContent(normalizedData);
      }

      const parsedContent = this.parseGeminiResponse(response.result);

      const result: QuadroInterativoContent = {
        title: normalizedData.tema || 'Quadro Interativo',
        description: normalizedData.objetivos || 'Atividade de quadro interativo',
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
      
      // Retornar conteúdo de fallback em vez de lançar erro
      const normalizedData = this.normalizeInputData(data);
      return this.createFallbackContent(normalizedData);
    }
  }

  private normalizeInputData(data: QuadroInterativoData): QuadroInterativoData {
    return {
      disciplina: data.disciplina || data.subject || 'Matemática',
      anoSerie: data.anoSerie || data.schoolYear || '6º Ano',
      tema: data.tema || data.theme || data.title || 'Tema da Aula',
      objetivos: data.objetivos || data.objectives || data.description || 'Objetivos de aprendizagem',
      nivelDificuldade: data.nivelDificuldade || data.difficultyLevel || 'Intermediário',
      atividadeMostrada: data.atividadeMostrada || data.quadroInterativoCampoEspecifico || 'Atividade interativa'
    };
  }

  private createFallbackContent(data: QuadroInterativoData): QuadroInterativoContent {
    console.log('🔧 Criando conteúdo de fallback para:', data);
    
    const tema = data?.tema || 'Tema da Aula';
    const objetivos = data?.objetivos || 'Objetivos de aprendizagem';
    const disciplina = data?.disciplina || 'Disciplina';
    const anoSerie = data?.anoSerie || 'Ano/Série';
    
    const fallbackTitle = `${tema} - ${disciplina}`;
    const fallbackText = `Conteúdo educativo sobre ${tema} para ${anoSerie}. ${objetivos}`;
    
    return {
      title: tema,
      description: objetivos,
      cardContent: {
        title: fallbackTitle,
        text: fallbackText
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false
    };
  }

  private buildPrompt(data: QuadroInterativoData): string {
    return `
Você é uma IA especializada em educação que cria conteúdo para quadros interativos educacionais.

Com base nos dados fornecidos, gere um conteúdo educativo claro e objetivo para ser exibido em um quadro interativo de sala de aula.

**DADOS DA ATIVIDADE:**
- Disciplina: ${data.disciplina}
- Ano/Série: ${data.anoSerie}
- Tema: ${data.tema}
- Objetivos: ${data.objetivos}
- Nível de Dificuldade: ${data.nivelDificuldade}
- Atividade: ${data.atividadeMostrada}

**INSTRUÇÕES:**
1. Crie um título atrativo e direto sobre o tema
2. Desenvolva um texto educativo claro e objetivo (máximo 150 palavras)
3. O conteúdo deve ser adequado para o ano/série especificado
4. Mantenha foco nos objetivos de aprendizagem
5. Use linguagem adequada para estudantes
6. Inclua elementos que tornem o conteúdo interativo

**FORMATO DE RESPOSTA (JSON):**
{
  "title": "Título atrativo para o quadro",
  "text": "Texto educativo claro e objetivo para exibição no quadro interativo"
}

Retorne APENAS o JSON válido, sem comentários adicionais.
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
        title: parsed.title || parsed.titulo || 'Conteúdo do Quadro',
        text: parsed.text || parsed.texto || parsed.content || parsed.conteudo || 'Conteúdo educativo gerado pela IA.'
      };

      // Validar e sanitizar o resultado
      if (!result.title || result.title.trim() === '') {
        result.title = 'Conteúdo do Quadro';
      }

      if (!result.text || result.text.trim() === '') {
        result.text = 'Conteúdo educativo gerado pela IA.';
      }

      console.log('✅ Resposta parseada:', result);
      return result;
    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error);
      
      // Fallback: tentar extrair conteúdo textual da resposta
      const fallbackText = response && response.length > 50 ? 
                          response.substring(0, 150) + '...' : 
                          'Erro ao processar conteúdo gerado pela IA.';
      
      return {
        title: 'Conteúdo do Quadro',
        text: fallbackText
      };
    }
  }
}
