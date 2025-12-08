
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
    this.apiKey = 'AIzaSyCEjk916YUa6wove13VEHou853eJULp6gs';
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
          title: parsedContent.title || data.theme || 'Conteúdo do Quadro',
          text: parsedContent.text || data.objectives || 'Conteúdo educativo gerado pela IA.'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        // Campos originais para compatibilidade
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
        // Campos customizados específicos
        customFields: {
          'Disciplina / Área de conhecimento': data.subject,
          'Ano / Série': data.schoolYear,
          'Tema ou Assunto da aula': data.theme,
          'Objetivo de aprendizagem da aula': data.objectives,
          'Nível de Dificuldade': data.difficultyLevel,
          'Atividade mostrada': data.quadroInterativoCampoEspecifico
        }
      };

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ Conteúdo do Quadro Interativo gerado:', result);
      return result;
    } catch (error) {
      geminiLogger.logError(error as Error, { data });
      
      // Fallback com conteúdo educativo melhorado
      const educationalTitle = data.theme || 'Conteúdo Educativo';
      const educationalText = data.objectives 
        ? `${data.objectives} - Explore este conceito através de atividades interativas que facilitam o aprendizado e compreensão do tema.`
        : `Explore o tema "${data.theme}" de forma interativa. Este conteúdo foi desenvolvido para facilitar a compreensão e aplicação dos conceitos fundamentais da disciplina.`;
      
      const fallbackResult: QuadroInterativoContent = {
        title: data.theme || 'Conteúdo Educativo',
        description: data.objectives || 'Atividade educativa interativa',
        cardContent: {
          title: educationalTitle.substring(0, 70),
          text: educationalText.substring(0, 450)
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
Você é uma IA especializada em educação brasileira que cria conteúdo educativo COMPLETO e DIDÁTICO para quadros interativos em sala de aula.

DADOS DA AULA:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Atividade Mostrada: ${data.quadroInterativoCampoEspecifico}

MISSÃO: Criar um conteúdo que ENSINE o conceito de forma clara e completa, como se fosse uma mini-aula explicativa.

FORMATO DE RESPOSTA (JSON apenas):
{
  "title": "Título educativo direto sobre o conceito (máximo 60 caracteres)",
  "text": "Explicação COMPLETA do conceito com definição, características principais, exemplos práticos e dicas para identificação/aplicação. Deve ser uma mini-aula textual que ensina efetivamente o tema (máximo 400 caracteres)"
}

DIRETRIZES OBRIGATÓRIAS:

TÍTULO:
- Seja direto e educativo sobre o conceito
- Use terminologia adequada para ${data.schoolYear}
- Exemplos: "Substantivos Próprios e Comuns", "Função do 1º Grau", "Fotossíntese das Plantas"
- NÃO use "Quadro Interativo" ou "Atividade de"

TEXTO:
- INICIE com uma definição clara do conceito
- INCLUA as características principais
- ADICIONE exemplos práticos e concretos
- FORNEÇA dicas para identificação ou aplicação
- Use linguagem didática apropriada para ${data.schoolYear}
- Seja EDUCATIVO, não apenas descritivo
- Foque em ENSINAR o conceito de forma completa

EXEMPLOS DE QUALIDADE:

Para "Substantivos Próprios":
{
  "title": "Substantivos Próprios e Comuns",
  "text": "Substantivos próprios nomeiam seres específicos e únicos (Maria, Brasil, Amazonas) e sempre iniciam com letra maiúscula. Substantivos comuns nomeiam seres em geral (menina, país, rio) e usam minúscula. Dica: se pode usar artigo 'o/a' antes, é comum; se não, é próprio!"
}

Para "Equação do 1º Grau":
{
  "title": "Equações do Primeiro Grau",
  "text": "Equação do 1º grau tem formato ax + b = 0, onde 'a' é diferente de zero. Para resolver: isole o 'x' fazendo operações inversas. Ex: 2x + 4 = 10 → 2x = 6 → x = 3. Dica: sempre faça a operação contrária nos dois lados da igualdade!"
}

AGORA GERE O CONTEÚDO EDUCATIVO:`;
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
            temperature: 0.8,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
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

      // Limitar tamanhos conforme especificado no prompt
      const title = parsedContent.title.substring(0, 70);
      const text = parsedContent.text.substring(0, 450);

      geminiLogger.logValidation({ title, text }, true);
      
      return { title, text };
      
    } catch (error) {
      geminiLogger.logValidation(response, false, [error.message]);
      
      // Fallback com conteúdo educativo baseado nos dados fornecidos
      const educationalTitle = data.theme || 'Conteúdo Educativo';
      const educationalText = data.objectives 
        ? `${data.objectives} - Tema: ${data.theme}. Explore este conceito através de atividades interativas que facilitam o aprendizado.`
        : `Explore o tema "${data.theme}" através de atividades educativas interativas que facilitam a compreensão e aplicação dos conceitos fundamentais.`;
      
      return {
        title: educationalTitle.substring(0, 70),
        text: educationalText.substring(0, 450)
      };
    }
  }
}

export default QuadroInterativoGenerator;
