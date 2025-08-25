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
  cardContent2?: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
  subject?: string;
  schoolYear?: string;
  theme?: string;
  objectives?: string;
  difficultyLevel?: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, string>;
}

export class QuadroInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('Gerando conteúdo específico de Quadro Interativo', data);

    try {
      const prompt = this.buildEnhancedPrompt(data);
      console.log('📤 Enviando prompt para Gemini (tema:', data.theme, ')');
      console.log('📝 Prompt preview:', prompt.substring(0, 300) + '...');

      const response = await this.callGeminiAPI(prompt);
      console.log('📥 Resposta bruta recebida do Gemini:', JSON.stringify(response, null, 2));

      const parsedContent = this.parseGeminiResponse(response);
      console.log('✅ Conteúdo FINAL processado pela IA:', parsedContent);
      console.log('📊 Tamanhos - Título:', parsedContent.title?.length, 'Texto:', parsedContent.text?.length, 'Avançado:', parsedContent.advancedText?.length);

      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || data.theme || 'Conteúdo do Quadro',
          text: parsedContent.text || 'Conteúdo educativo específico gerado pela IA.'
        },
        cardContent2: parsedContent.advancedText ? {
          title: `${parsedContent.title} - Nível Avançado`,
          text: parsedContent.advancedText
        } : undefined,
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
          'Atividade mostrada': data.quadroInterativoCampoEspecifico,
          'isAIGenerated': 'true',
          'generatedContent': JSON.stringify({
            cardContent: {
              title: parsedContent.title,
              text: parsedContent.text
            },
            cardContent2: parsedContent.advancedText ? {
              title: `${parsedContent.title} - Nível Avançado`,
              text: parsedContent.advancedText
            } : undefined,
            generatedAt: new Date().toISOString()
          })
        }
      };

      // DEBUG INTENSIVO - VERIFICAR CONTEÚDO FINAL
      console.log('🔥 CONTEÚDO ESPECÍFICO GERADO PELA IA GEMINI:', {
        tema: data.theme,
        tituloGerado: parsedContent.title,
        textoGerado: parsedContent.text.substring(0, 100) + '...',
        temaTituloContém: parsedContent.title?.toLowerCase().includes(data.theme.toLowerCase()),
        temaTextoContém: parsedContent.text?.toLowerCase().includes(data.theme.toLowerCase()),
        tamanhoTexto: parsedContent.text.length,
        cardContentFinal: result.cardContent
      });

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ RESULTADO FINAL ENVIADO PARA O PREVIEW:', result);
      return result;

    } catch (error) {
      console.error('❌ ERRO na geração do conteúdo:', error);
      geminiLogger.logError(error as Error, { data });

      // Se falhar, ainda tenta retornar algo específico baseado no tema
      const specificFallback = this.generateSpecificFallback(data);
      console.log('⚠️ Usando fallback específico para o tema:', specificFallback);
      return specificFallback;
    }
  }

  private buildEnhancedPrompt(data: QuadroInterativoData): string {
    return `VOCÊ É UM PROFESSOR ESPECIALISTA BRASILEIRO EM ${data.subject}. CRIE CONTEÚDO EDUCATIVO ULTRA-ESPECÍFICO E PRÁTICO PARA O TEMA "${data.theme}".

📚 CONTEXTO EDUCACIONAL:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema ESPECÍFICO: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Atividade Alvo: ${data.quadroInterativoCampoEspecifico}

🎯 MISSÃO CRÍTICA:
Gerar conteúdo educativo EXTREMAMENTE ESPECÍFICO para "${data.theme}" que será usado em quadro interativo para alunos de ${data.schoolYear} em ${data.subject}.

⚠️ REGRAS OBRIGATÓRIAS:
1. SEMPRE mencione "${data.theme}" pelo nome no conteúdo (mínimo 3 vezes)
2. NUNCA use frases genéricas como "dominar este conteúdo" ou "este tema"
3. SEMPRE forneça exemplos CONCRETOS específicos de ${data.theme}
4. SEMPRE inclua passos NUMERADOS e PRÁTICOS
5. SEMPRE use linguagem direta ao aluno ("Para você...")
6. SEMPRE inclua dicas, macetes e alertas específicos
7. SEMPRE contextualizar para ${data.schoolYear} de ${data.subject}

📋 ESTRUTURA OBRIGATÓRIA - RESPONDA APENAS COM JSON VÁLIDO:
{
  "title": "Como [ação específica] ${data.theme}",
  "text": "Para você [objetivo específico com ${data.theme}]: 1) [passo prático específico do ${data.theme}], 2) [segundo passo específico], 3) [terceiro passo específico]. Exemplo real: [situação concreta onde ${data.theme} aparece]. Macete: [dica exclusiva para ${data.theme}]. Cuidado: [erro comum específico em ${data.theme}]. Lembre-se: [reforço específico sobre ${data.theme}].",
  "advancedText": "Dominando ${data.theme} no nível avançado: [técnica específica avançada]. Para casos complexos de ${data.theme}: [estratégia específica]. Exercício desafiador: [problema específico de ${data.theme}]. Dica profissional: [segredo específico para ${data.theme}]. Conexão: [como ${data.theme} se relaciona com outros temas de ${data.subject}]."
}

🌟 EXEMPLOS DE QUALIDADE ESPERADA:

Para "Teorema de Pitágoras":
{
  "title": "Como Aplicar o Teorema de Pitágoras",
  "text": "Para você resolver problemas com Teorema de Pitágoras: 1) Identifique o triângulo retângulo no problema. 2) Localize a hipotenusa (lado mais longo, oposto ao ângulo reto). 3) Aplique a² + b² = c², onde c é a hipotenusa. Exemplo real: para calcular a diagonal de uma TV 32 polegadas, use a² + b² = 32². Macete: a hipotenusa é sempre o maior lado! Cuidado: só funciona em triângulos retângulos. Lembre-se: Teorema de Pitágoras é a base da geometria.",
  "advancedText": "Dominando Teorema de Pitágoras no nível avançado: use para calcular distâncias em plano cartesiano. Para casos complexos: aplique em pirâmides e sólidos geométricos. Exercício desafiador: calcule a altura de um prédio usando Teorema de Pitágoras e sombra. Dica profissional: Teorema de Pitágoras aparece em física (velocidades) e programação (distâncias). Conexão: Teorema de Pitágoras se relaciona com trigonometria e funções quadráticas."
}

AGORA GERE CONTEÚDO ESPECÍFICO PARA "${data.theme}" EM ${data.subject}:`;
  }

  private async callGeminiAPI(prompt: string): Promise<any> {
    if (!this.apiKey) {
      throw new Error('API Key do Gemini não configurada');
    }

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
            temperature: 0.3, // Mais determinístico para respostas específicas
            topK: 20,
            topP: 0.8,
            maxOutputTokens: 2048,
          }
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP da API Gemini:', response.status, errorText);
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const executionTime = Date.now() - startTime;

      console.log('📊 Tempo de execução da API:', executionTime + 'ms');
      console.log('📥 Resposta completa da API Gemini:', JSON.stringify(data, null, 2));
      
      // Extrair texto da resposta estruturada da API Gemini
      const generatedText = data?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      console.log('📄 Texto extraído da resposta:', generatedText);
      
      geminiLogger.logResponse(data, executionTime);

      return generatedText;

    } catch (error) {
      console.error('❌ Erro na chamada da API Gemini:', error);
      geminiLogger.logError(error as Error, { prompt: prompt.substring(0, 200) });
      throw error;
    }
  }

  private parseGeminiResponse(response: any): { title: string; text: string; advancedText?: string } {
    console.log('🔄 Fazendo parse da resposta do Gemini...');
    console.log('📄 Resposta COMPLETA recebida:', response);

    try {
      // Limpar resposta removendo caracteres indesejados
      let cleanedResponse = response.trim();

      // Remover markdown se presente
      if (cleanedResponse.includes('```json')) {
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1];
        }
      } else if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```[^{]*/, '').replace(/```$/, '');
      }

      // Buscar JSON na resposta
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0) {
        console.error('❌ JSON não encontrado na resposta');
        throw new Error('JSON não encontrado na resposta');
      }

      const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
      console.log('🔄 JSON EXTRAÍDO:', jsonString);

      const parsedContent = JSON.parse(jsonString);
      console.log('✅ CONTEÚDO PARSEADO:', parsedContent);

      const result = {
        title: parsedContent.titulo || parsedContent.title || 'Conteúdo Educativo',
        text: parsedContent.conteudo || parsedContent.content || parsedContent.text || 'Conteúdo gerado pela IA.',
        advancedText: parsedContent.conteudoAvancado || parsedContent.advancedContent || parsedContent.advancedText
      };

      console.log('🎯 RESULTADO FINAL PARSEADO:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro ao fazer parse da resposta:', error);
      console.log('📄 Resposta problemática completa:', response);

      // Tentar extrair conteúdo manualmente se JSON falhar
      const manualContent = this.extractContentManually(response);
      if (manualContent) {
        console.log('✅ Conteúdo extraído manualmente:', manualContent);
        return manualContent;
      }

      // Fallback final
      console.log('⚠️ Usando fallback final');
      return {
        title: 'Erro no processamento',
        text: 'Houve um problema ao processar o conteúdo gerado pela IA. Resposta original: ' + response.substring(0, 200),
        advancedText: 'Tente novamente ou contate o suporte.'
      };
    }
  }

  private extractContentManually(response: string): { title: string; text: string; advancedText?: string } | null {
    try {
      console.log('🔧 Tentando extração manual do conteúdo...');

      // Tentar encontrar padrões de conteúdo educativo
      const lines = response.split('\n').filter(line => line.trim());

      let title = '';
      let text = '';
      let advancedText = '';

      // Procurar por títulos
      for (const line of lines) {
        if (line.includes('título') || line.includes('Title') || line.includes('#')) {
          title = line.replace(/[#*"']/g, '').replace(/título:?/i, '').trim();
          break;
        }
      }

      // Se não encontrou título, usar primeira linha significativa
      if (!title && lines.length > 0) {
        title = lines[0].replace(/[#*"']/g, '').trim();
      }

      // Procurar por conteúdo
      const contentLines = lines.filter(line => 
        line.length > 50 && 
        !line.includes('título') && 
        !line.includes('Title') &&
        !line.includes('```')
      );

      if (contentLines.length > 0) {
        text = contentLines[0];
        if (contentLines.length > 1) {
          advancedText = contentLines[1];
        }
      }

      if (title || text) {
        const result = {
          title: title || 'Conteúdo Educativo',
          text: text || response.substring(0, 300),
          advancedText: advancedText || undefined
        };

        console.log('✅ Extração manual bem-sucedida:', result);
        return result;
      }

      return null;
    } catch (error) {
      console.error('❌ Erro na extração manual:', error);
      return null;
    }
  }

  private generateSpecificFallback(data: QuadroInterativoData): QuadroInterativoContent {
    const theme = data.theme || 'este conteúdo';

    // Título específico baseado no tema
    let specificTitle = `Como Dominar ${theme}`;
    if (theme.toLowerCase().includes('substantivo')) {
      specificTitle = `Como Identificar ${theme}`;
    } else if (theme.toLowerCase().includes('verbo')) {
      specificTitle = `Como Reconhecer ${theme}`;
    } else if (theme.toLowerCase().includes('equação') || theme.toLowerCase().includes('função')) {
      specificTitle = `Como Resolver ${theme}`;
    } else if (theme.toLowerCase().includes('matemática') || theme.toLowerCase().includes('cálculo')) {
      specificTitle = `Como Calcular ${theme}`;
    }

    // Texto específico para o tema
    const specificText = `Para você dominar ${theme.toLowerCase()}, siga estes passos essenciais: 1) Identifique os conceitos-chave de ${theme}. 2) Pratique com exemplos específicos de ${theme}. 3) Aplique o conhecimento em exercícios de ${theme}. Exemplo: observe como ${theme} aparece em situações reais. Dica importante: foque nos detalhes específicos de ${theme}. Cuidado: não confunda ${theme} com conceitos similares. Lembre-se: dominar ${theme} requer prática constante!`;

    const advancedText = `Agora que você entende o básico de ${theme.toLowerCase()}, explore aspectos avançados: analise casos complexos de ${theme}. Quando encontrar dificuldades em ${theme}, volte aos fundamentos. Teste: explique ${theme} para um colega. Conexão: veja como ${theme} se relaciona com outros temas de ${data.subject}. Dica profissional: crie mapas mentais específicos para ${theme}!`;

    return {
      title: data.theme || 'Conteúdo Educativo',
      description: data.objectives || 'Atividade educativa interativa',
      cardContent: {
        title: specificTitle.substring(0, 80),
        text: specificText.substring(0, 500)
      },
      cardContent2: {
        title: `${specificTitle} - Nível Avançado`.substring(0, 80),
        text: advancedText.substring(0, 500)
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
  }
}

export default QuadroInterativoGenerator;