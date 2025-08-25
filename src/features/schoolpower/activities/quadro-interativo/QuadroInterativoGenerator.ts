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
    console.log('🚀 INICIANDO GERAÇÃO CRÍTICA DE CONTEÚDO VIA IA GEMINI');
    console.log('📊 DADOS DE ENTRADA PARA IA:', JSON.stringify(data, null, 2));
    
    geminiLogger.logRequest('Gerando conteúdo específico de Quadro Interativo', data);

    try {
      const prompt = this.buildEnhancedPrompt(data);
      console.log('📤 ENVIANDO PROMPT PARA GEMINI API...');
      console.log('🎯 TEMA ESPECÍFICO:', data.theme);
      console.log('📚 DISCIPLINA:', data.subject);
      console.log('📝 Preview do prompt (300 chars):', prompt.substring(0, 300) + '...');

      console.log('🌐 CHAMANDO API GEMINI...');
      const response = await this.callGeminiAPI(prompt);
      console.log('📥 RESPOSTA BRUTA RECEBIDA DA API GEMINI:', response);

      // Processar resposta da IA
      const parsedContent = this.parseGeminiResponse(response);
      console.log('✅ CONTEÚDO PROCESSADO DA IA:', parsedContent);

      if (!parsedContent || !parsedContent.title || !parsedContent.text) {
        throw new Error('Conteúdo inválido retornado pela IA');
      }

      const result: QuadroInterativoContent = {
        title: data.theme || parsedContent.title,
        description: data.objectives || parsedContent.text,
        cardContent: {
          title: parsedContent.title,
          text: parsedContent.text
        },
        cardContent2: parsedContent.advancedText ? {
          title: `${parsedContent.title} - Nível Avançado`,
          text: parsedContent.advancedText
        } : undefined,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
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
            generatedAt: new Date().toISOString(),
            sourceType: 'gemini-ai-api'
          })
        }
      };

      console.log('🎯 RESULTADO FINAL PREPARADO:', result);
      return result;

    } catch (error) {
      console.error('❌ ERRO CRÍTICO na geração pela IA Gemini:', error);
      
      // Fallback com conteúdo específico baseado nos dados
      const fallbackTitle = `Como Dominar ${data.theme || 'Este Conteúdo'} - Guia Específico`;
      const fallbackText = `Para você dominar ${data.theme || 'este conteúdo'} em ${data.subject || 'sua disciplina'}: 1) Identifique os conceitos-chave específicos de ${data.theme || 'este tema'} - observe as características únicas que definem este assunto. 2) Pratique com exemplos reais de ${data.theme || 'este tema'} - use situações do cotidiano onde ${data.theme || 'este conteúdo'} é aplicado. 3) Desenvolva estratégias específicas para ${data.theme || 'este tema'} - crie métodos de estudo exclusivos para este conteúdo. 4) Teste seu conhecimento com exercícios progressivos. Exemplo prático: ${data.theme || 'este conteúdo'} é fundamental quando você precisa resolver problemas específicos da área. Macete especial: para lembrar de ${data.theme || 'este tema'}, associe com conceitos que você já conhece. Cuidado: o erro mais comum em ${data.theme || 'este tema'} é confundir com temas similares. Dica final: ${data.theme || 'este conteúdo'} é essencial porque conecta diretamente com outros conceitos importantes da matéria!`;

      return {
        title: data.theme || 'Conteúdo Educativo',
        description: data.objectives || 'Atividade educativa interativa',
        cardContent: {
          title: fallbackTitle,
          text: fallbackText
        },
        cardContent2: {
          title: `${fallbackTitle} - Nível Avançado`,
          text: `Dominando ${data.theme || 'este conteúdo'} no nível avançado: explore aplicações complexas e desafiadoras. Para casos difíceis: divida o problema em partes menores e aplique ${data.theme || 'este conteúdo'} sistematicamente. Exercício avançado: combine ${data.theme || 'este tema'} com outros conceitos para resolver problemas interdisciplinares. Segredo profissional: a chave está em entender a lógica fundamental por trás de ${data.theme || 'este conteúdo'}, não apenas memorizar definições.`
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
        customFields: {
          'Disciplina / Área de conhecimento': data.subject,
          'Ano / Série': data.schoolYear,
          'Tema ou Assunto da aula': data.theme,
          'Objetivo de aprendizagem da aula': data.objectives,
          'Nível de Dificuldade': data.difficultyLevel,
          'Atividade mostrada': data.quadroInterativoCampoEspecifico,
          'isAIGenerated': 'false',
          'fallbackApplied': 'true'
        }
      };
    }
  }

  private parseGeminiResponse(response: string): any {
    try {
      console.log('🔄 Processando resposta da IA Gemini...');
      
      // Limpar resposta
      let cleanedResponse = response.trim();
      cleanedResponse = cleanedResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '');
      cleanedResponse = cleanedResponse.trim();

      console.log('🧹 Resposta limpa:', cleanedResponse);

      // Tentar parsear como JSON
      const parsed = JSON.parse(cleanedResponse);
      console.log('✅ JSON parseado com sucesso:', parsed);

      return parsed;
    } catch (error) {
      console.error('❌ Erro ao parsear resposta da IA:', error);
      console.log('📝 Resposta original:', response);
      
      // Fallback: extrair conteúdo manualmente
      return {
        title: 'Conteúdo Gerado pela IA',
        text: response.substring(0, 500),
        advancedText: response.length > 500 ? response.substring(500, 1000) : undefined
      };
    }
  }

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
    return `VOCÊ É UM PROFESSOR ESPECIALISTA BRASILEIRO EM ${data.subject}. CRIE CONTEÚDO EDUCATIVO ULTRA-ESPECÍFICO E PERSONALIZADO PARA O TEMA "${data.theme}".

📚 CONTEXTO EDUCACIONAL OBRIGATÓRIO:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema ESPECÍFICO: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Atividade Alvo: ${data.quadroInterativoCampoEspecifico}

🎯 MISSÃO ULTRA-ESPECÍFICA:
Criar conteúdo educativo EXTREMAMENTE DETALHADO e PERSONALIZADO para "${data.theme}" que será exibido em um quadro interativo para alunos de ${data.schoolYear} estudando ${data.subject}.

⚠️ REGRAS CRÍTICAS OBRIGATÓRIAS:
1. SEMPRE mencione "${data.theme}" literalmente no texto (mínimo 5 vezes)
2. NUNCA use termos genéricos como "este tema", "este conteúdo", "dominar isso"
3. SEMPRE forneça exemplos REAIS e ESPECÍFICOS de "${data.theme}"
4. SEMPRE inclua 3-5 passos NUMERADOS e PRÁTICOS específicos para "${data.theme}"
5. SEMPRE use linguagem direta ao aluno ("Para você entender ${data.theme}...")
6. SEMPRE inclua macetes, dicas e alertas exclusivos para "${data.theme}"
7. SEMPRE contextualizar especificamente para ${data.schoolYear} em ${data.subject}
8. SEMPRE usar exemplos práticos onde "${data.theme}" aparece na vida real

📋 FORMATO JSON OBRIGATÓRIO - RESPONDA EXATAMENTE ASSIM:
{
  "title": "Como Dominar ${data.theme} - Guia Prático para ${data.schoolYear}",
  "text": "Para você dominar ${data.theme} em ${data.subject} (${data.schoolYear}): 1) [passo específico para ${data.theme}] 2) [segundo passo prático para ${data.theme}] 3) [terceiro passo específico] 4) [quarto passo avançado]. Exemplo prático: [situação real onde ${data.theme} é usado]. Macete especial para ${data.theme}: [dica específica]. Cuidado com ${data.theme}: [erro comum]. Dica final: ${data.theme} é fundamental porque [razão específica para ${data.schoolYear}].",
  "advancedText": "Dominando ${data.theme} no nível avançado para ${data.schoolYear}: [técnica específica avançada de ${data.theme}]. Para casos complexos de ${data.theme}: [estratégia avançada]. Exercício desafiador de ${data.theme}: [problema específico com solução]. Segredo profissional para ${data.theme}: [dica de especialista]. Conexão avançada: como ${data.theme} se conecta com [outros temas específicos de ${data.subject}]. Aplicação real de ${data.theme}: [exemplo profissional ou acadêmico específico]."
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
    console.log('⚠️ GERANDO FALLBACK ESPECÍFICO PARA:', data.theme);
    
    const theme = data.theme || 'este conteúdo';

    // Título ultra-específico baseado no tema e contexto
    let specificTitle = `Como Dominar ${theme} - ${data.schoolYear}`;
    if (theme.toLowerCase().includes('substantivo')) {
      specificTitle = `Identificando ${theme} - Guia Prático`;
    } else if (theme.toLowerCase().includes('verbo')) {
      specificTitle = `Reconhecendo ${theme} - Método Fácil`;
    } else if (theme.toLowerCase().includes('equação') || theme.toLowerCase().includes('função')) {
      specificTitle = `Resolvendo ${theme} - Passo a Passo`;
    } else if (theme.toLowerCase().includes('teorema') || theme.toLowerCase().includes('pitágoras')) {
      specificTitle = `Aplicando ${theme} - Técnicas Práticas`;
    } else if (theme.toLowerCase().includes('matemática') || theme.toLowerCase().includes('cálculo')) {
      specificTitle = `Calculando ${theme} - Métodos Eficazes`;
    }

    // Texto ultra-específico para o tema com detalhes reais
    const specificText = `Para você dominar ${theme} em ${data.subject} (${data.schoolYear}): 1) Identifique as características específicas de ${theme} - procure pelos elementos únicos que definem ${theme}. 2) Pratique com exemplos reais de ${theme} - use situações do cotidiano onde ${theme} aparece. 3) Aplique técnicas específicas para ${theme} - desenvolva estratégias exclusivas para este conceito. 4) Teste seu conhecimento de ${theme} com exercícios progressivos. Exemplo prático: ${theme} é usado quando [situação específica]. Macete especial: para lembrar de ${theme}, use a técnica [método específico]. Cuidado: o erro mais comum em ${theme} é [problema específico]. Dica final: ${theme} é essencial para ${data.schoolYear} porque conecta com outros conceitos importantes!`;

    const advancedText = `Dominando ${theme} no nível avançado para ${data.schoolYear}: explore as aplicações complexas de ${theme} em situações desafiadoras. Para casos difíceis de ${theme}: use a abordagem sistemática dividindo o problema em partes menores. Exercício avançado de ${theme}: resolva problemas que combinam ${theme} com outros conceitos de ${data.subject}. Segredo profissional para ${theme}: a chave está em entender a lógica por trás, não apenas decorar fórmulas. Conexão avançada: ${theme} se relaciona diretamente com [conceitos específicos de ${data.subject}] e prepara você para [tópicos futuros]. Aplicação real: profissionais de [área específica] usam ${theme} para [aplicação prática específica]!`;

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