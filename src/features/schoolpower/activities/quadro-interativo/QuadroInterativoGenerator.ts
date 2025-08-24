
import { geminiLogger } from '@/utils/geminiDebugLogger';

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
}

interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  // Campos customizados específicos
  'Disciplina / Área de conhecimento'?: string;
  'Ano / Série'?: string;
  'Tema ou Assunto da aula'?: string;
  'Objetivo de aprendizagem da aula'?: string;
  'Nível de Dificuldade'?: string;
  'Atividade mostrada'?: string;
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
  // Campos originais para compatibilidade
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
  // Campos customizados
  customFields?: Record<string, string>;
}

export class QuadroInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
    console.log('🔧 QuadroInterativoGenerator inicializado com API Key:', !!this.apiKey);
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    console.log('🚀 Iniciando geração de conteúdo Quadro Interativo:', data);
    geminiLogger.logRequest('Gerando conteúdo de Quadro Interativo', data);
    
    try {
      if (!this.apiKey) {
        throw new Error('API Key do Gemini não configurada');
      }

      const prompt = this.buildPrompt(data);
      console.log('📝 Prompt construído:', prompt.substring(0, 200) + '...');
      
      const response = await this.callGeminiAPI(prompt);
      console.log('📥 Resposta recebida da API Gemini:', response);
      
      const parsedContent = this.parseGeminiResponse(response);
      console.log('🔍 Conteúdo parseado:', parsedContent);
      
      // Construir resultado completo
      const result: QuadroInterativoContent = {
        title: parsedContent.title || data.theme || 'Quadro Interativo',
        description: parsedContent.text || data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || data.theme || 'Conteúdo do Quadro',
          text: parsedContent.text || data.objectives || 'Conteúdo educativo gerado pela IA.'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        // Campos originais para compatibilidade
        subject: data.subject || data['Disciplina / Área de conhecimento'] || 'Disciplina',
        schoolYear: data.schoolYear || data['Ano / Série'] || 'Ano/Série',
        theme: data.theme || data['Tema ou Assunto da aula'] || 'Tema da Aula',
        objectives: data.objectives || data['Objetivo de aprendizagem da aula'] || 'Objetivos',
        difficultyLevel: data.difficultyLevel || data['Nível de Dificuldade'] || 'Intermediário',
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico || data['Atividade mostrada'] || 'Atividade interativa',
        // Campos customizados específicos
        customFields: {
          'Disciplina / Área de conhecimento': data.subject || data['Disciplina / Área de conhecimento'] || 'Matemática',
          'Ano / Série': data.schoolYear || data['Ano / Série'] || '5º Ano',
          'Tema ou Assunto da aula': data.theme || data['Tema ou Assunto da aula'] || 'Tema educativo',
          'Objetivo de aprendizagem da aula': data.objectives || data['Objetivo de aprendizagem da aula'] || 'Desenvolver conhecimentos',
          'Nível de Dificuldade': data.difficultyLevel || data['Nível de Dificuldade'] || 'Intermediário',
          'Atividade mostrada': data.quadroInterativoCampoEspecifico || data['Atividade mostrada'] || 'Atividade interativa no quadro'
        }
      };

      console.log('✅ Resultado final gerado:', result);
      geminiLogger.logResponse(result, Date.now());
      
      return result;yLevel,
          'Atividade mostrada': data.quadroInterativoCampoEspecifico
        }
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
- Atividade Mostrada: ${data.quadroIntprivate buildPrompt(data: QuadroInterativoData): string {
    const disciplina = data.subject || data['Disciplina / Área de conhecimento'] || 'Disciplina';
    const anoSerie = data.schoolYear || data['Ano / Série'] || 'Ano/Série';
    const tema = data.theme || data['Tema ou Assunto da aula'] || 'Tema da aula';
    const objetivos = data.objectives || data['Objetivo de aprendizagem da aula'] || 'Objetivos de aprendizagem';
    const nivelDificuldade = data.difficultyLevel || data['Nível de Dificuldade'] || 'Intermediário';
    const atividadeMostrada = data.quadroInterativoCampoEspecifico || data['Atividade mostrada'] || 'Atividade interativa';

    return `Você é uma IA especializada em educação, criando conteúdo para quadros interativos educacionais.

CONTEXTO EDUCACIONAL:
- Disciplina: ${disciplina}
- Ano/Série: ${anoSerie}
- Tema da Aula: ${tema}
- Objetivos de Aprendizagem: ${objetivos}
- Nível de Dificuldade: ${nivelDificuldade}
- Atividade Específica: ${atividadeMostrada}

TAREFA:
Gere um conteúdo educativo específico para ser exibido em um quadro interativo. O conteúdo será mostrado em um card retangular central e deve ser claro, objetivo e apropriado para a série especificada.

FORMATO DE RESPOSTA (JSON OBRIGATÓRIO):
{
  "title": "Título claro e específico da atividade (máximo 50 caracteres)",
  "text": "Texto educativo detalhado e bem estruturado para o quadro interativo, explicando conceitos de forma clara e apropriada para a série (máximo 250 caracteres)"
}

REQUISITOS DO CONTEÚDO:
- Linguagem adequada para ${anoSerie}
- Diretamente relacionado ao tema: ${tema}
- Suporte aos objetivos: ${objetivos}
- Nível de complexidade: ${nivelDificuldade}
- Formato interativo e envolvente
- Sem códigos técnicos ou jargões complexos
- Texto claro e educativo

IMPORTANTE: Responda APENAS com o JSON válido, sem texto adicional ou formatação markdown.`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    const startTime = Date.now();
    
    try {
      console.log('🌐 Fazendo chamada para API Gemini...');
      
      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 20,
          topP: 0.8,
          maxOutputTokens: 2048,
        }
      };

      console.log('📤 Enviando requisição:', JSON.stringify(requestBody, null, 2));

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro na API Gemini:', response.status, errorText);
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta da API Gemini:', data);

      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!generatedText) {
        console.error('❌ Resposta vazia da API Gemini');
        throw new Error('Resposta vazia da API Gemini');
      }

      console.log('✅ Texto gerado pela IA:', generatedText);
      console.log(`⏱️ Tempo de execução: ${executionTime}ms`);

      return generatedText;

    } catch (error) {
      console.error('❌ Erro ao chamar API Gemini:', error);
      geminiLogger.logError(error instanceof Error ? error : new Error(String(error)), {
        prompt_length: prompt.length,
        api_key_available: !!this.apiKey
      });
      throw error;
    }
  }

  private parseGeminiResponse(responseText: string): { title: string; text: string } {
    console.log('🔍 Parseando resposta da Gemini...');
    console.log('📝 Texto recebido:', responseText);

    try {
      // Limpar o texto da resposta
      let cleanedText = responseText.trim();

      // Remover blocos de markdown se existirem
      cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');

      // Remover quebras de linha extras
      cleanedText = cleanedText.trim();

      console.log('🧹 Texto limpo:', cleanedText);

      // Tentar fazer parse do JSON
      const parsedData = JSON.parse(cleanedText);

      // Validar estrutura
      if (!parsedData.title || !parsedData.text) {
        console.warn('⚠️ Estrutura JSON incompleta, usando fallback');
        return {
          title: parsedData.title || 'Conteúdo Educativo',
          text: parsedData.text || 'Conteúdo interativo gerado pela IA para apoiar o aprendizado.'
        };
      }

      console.log('✅ Conteúdo parseado com sucesso:', parsedData);
      return {
        title: String(parsedData.title).substring(0, 50),
        text: String(parsedData.text).substring(0, 250)
      };

    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta:', error);
      console.error('📝 Texto original:', responseText);
      
      // Fallback em caso de erro de parse
      return {
        title: 'Quadro Interativo Educativo',
        text: 'Conteúdo educativo interativo desenvolvido para apoiar o processo de ensino-aprendizagem de forma dinâmica e envolvente.'
      };
    }
  }
}tatus} ${response.statusText}`);
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
