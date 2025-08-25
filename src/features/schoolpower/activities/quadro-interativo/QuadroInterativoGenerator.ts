
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
    console.log('🚀 INICIANDO GERAÇÃO CRÍTICA DE CONTEÚDO ESPECÍFICO VIA IA GEMINI');
    console.log('📊 DADOS DE ENTRADA PARA IA:', JSON.stringify(data, null, 2));
    
    geminiLogger.logRequest('Gerando conteúdo ultra-específico de Quadro Interativo', data);

    try {
      const prompt = this.buildUltraSpecificPrompt(data);
      console.log('📤 ENVIANDO PROMPT ULTRA-ESPECÍFICO PARA GEMINI API...');
      console.log('🎯 TEMA ESPECÍFICO:', data.theme);
      console.log('📚 DISCIPLINA:', data.subject);

      console.log('🌐 CHAMANDO API GEMINI PARA CONTEÚDO ESPECÍFICO...');
      const response = await this.callGeminiAPI(prompt);
      console.log('📥 RESPOSTA BRUTA RECEBIDA DA API GEMINI:', JSON.stringify(response, null, 2));

      const parsedContent = this.parseGeminiResponseStrict(response);
      console.log('✅ Conteúdo ESPECÍFICO processado pela IA:', parsedContent);

      // Validação CRÍTICA do conteúdo específico
      if (!this.validateSpecificContent(parsedContent, data.theme)) {
        console.error('❌ CONTEÚDO DA IA NÃO É ESPECÍFICO SUFICIENTE - REGENERANDO');
        throw new Error('Conteúdo não específico para o tema');
      }

      const result: QuadroInterativoContent = {
        title: data.theme || 'Quadro Interativo',
        description: data.objectives || 'Atividade de quadro interativo',
        cardContent: {
          title: parsedContent.title || `Como Dominar ${data.theme}`,
          text: parsedContent.text || 'Conteúdo específico gerado pela IA Gemini.'
        },
        cardContent2: parsedContent.advancedText ? {
          title: `${parsedContent.title} - Nível Avançado`,
          text: parsedContent.advancedText
        } : undefined,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        // Campos originais preservados
        subject: data.subject,
        schoolYear: data.schoolYear,
        theme: data.theme,
        objectives: data.objectives,
        difficultyLevel: data.difficultyLevel,
        quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
        // Campos customizados CRÍTICOS
        customFields: {
          'Disciplina / Área de conhecimento': data.subject,
          'Ano / Série': data.schoolYear,
          'Tema ou Assunto da aula': data.theme,
          'Objetivo de aprendizagem da aula': data.objectives,
          'Nível de Dificuldade': data.difficultyLevel,
          'Atividade mostrada': data.quadroInterativoCampoEspecifico,
          'isAIGenerated': 'true',
          'aiGeneratedTitle': parsedContent.title,
          'aiGeneratedText': parsedContent.text,
          'aiGeneratedAdvancedText': parsedContent.advancedText || '',
          'aiContentSource': 'gemini-api',
          'aiSourceTimestamp': new Date().toISOString(),
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
            apiSuccess: true,
            sourceType: 'gemini-api-real'
          })
        }
      };

      // VERIFICAÇÃO FINAL CRÍTICA
      console.log('🔥 CONTEÚDO ESPECÍFICO FINAL GERADO PELA IA GEMINI:', {
        tema: data.theme,
        tituloGerado: parsedContent.title,
        textoPreview: parsedContent.text.substring(0, 150) + '...',
        temaTituloContém: parsedContent.title?.toLowerCase().includes(data.theme.toLowerCase()),
        temaTextoContém: parsedContent.text?.toLowerCase().includes(data.theme.toLowerCase()),
        tamanhoTexto: parsedContent.text.length,
        isSpecific: this.validateSpecificContent(parsedContent, data.theme)
      });

      geminiLogger.logResponse(result, Date.now());
      console.log('✅ RESULTADO FINAL ESPECÍFICO ENVIADO PARA O PREVIEW:', result);
      return result;

    } catch (error) {
      console.error('❌ ERRO na geração do conteúdo específico:', error);
      geminiLogger.logError(error as Error, { data });

      // Fallback com conteúdo ESPECÍFICO para o tema
      const specificFallback = this.generateSpecificFallback(data);
      console.log('⚠️ Usando fallback específico para o tema:', specificFallback);
      return specificFallback;
    }
  }

  private buildUltraSpecificPrompt(data: QuadroInterativoData): string {
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
1. SEMPRE mencione "${data.theme}" literalmente no texto (mínimo 8 vezes)
2. NUNCA use termos genéricos como "este tema", "este conteúdo", "dominar isso"
3. SEMPRE forneça exemplos REAIS e ESPECÍFICOS de "${data.theme}"
4. SEMPRE inclua 4-6 passos NUMERADOS e PRÁTICOS específicos para "${data.theme}"
5. SEMPRE use linguagem direta ao aluno ("Para você entender ${data.theme}...")
6. SEMPRE inclua macetes, dicas e alertas exclusivos para "${data.theme}"
7. SEMPRE contextualizar especificamente para ${data.schoolYear} em ${data.subject}
8. SEMPRE usar exemplos práticos onde "${data.theme}" aparece na vida real
9. CONTEÚDO DEVE SER 100% ESPECÍFICO PARA "${data.theme}" - ZERO GENERICIDADE

📋 FORMATO JSON OBRIGATÓRIO - RESPONDA EXATAMENTE ASSIM:
{
  "title": "Como Dominar ${data.theme} - Guia Específico para ${data.schoolYear}",
  "text": "Para você dominar ${data.theme} em ${data.subject} (${data.schoolYear}): 1) [passo específico para ${data.theme}] 2) [segundo passo prático para ${data.theme}] 3) [terceiro passo específico para ${data.theme}] 4) [quarto passo avançado para ${data.theme}] 5) [quinto passo aplicado de ${data.theme}]. Exemplo prático real: [situação específica onde ${data.theme} é usado]. Macete especial para ${data.theme}: [dica específica e exclusiva]. Cuidado comum com ${data.theme}: [erro específico que estudantes cometem]. Aplicação de ${data.theme}: [como ${data.theme} é usado profissionalmente]. Dica final: ${data.theme} é fundamental em ${data.subject} porque [razão específica para ${data.schoolYear}].",
  "advancedText": "Dominando ${data.theme} no nível avançado para ${data.schoolYear}: [técnica específica avançada de ${data.theme}]. Para casos complexos de ${data.theme}: [estratégia avançada específica]. Exercício desafiador de ${data.theme}: [problema específico com solução detalhada]. Segredo profissional para ${data.theme}: [dica de especialista específica]. Conexão avançada: como ${data.theme} se conecta com [outros temas específicos de ${data.subject}]. Aplicação real avançada de ${data.theme}: [exemplo profissional ou acadêmico específico]. Truque de especialista em ${data.theme}: [técnica avançada específica]."
}

🌟 EXEMPLO DE QUALIDADE ESPECÍFICA PARA "Teorema de Pitágoras":
{
  "title": "Como Aplicar o Teorema de Pitágoras - Guia Específico",
  "text": "Para você dominar Teorema de Pitágoras em Matemática (9º Ano): 1) Identifique o triângulo retângulo no problema - procure pelo ângulo de 90°. 2) Localize a hipotenusa do Teorema de Pitágoras - é sempre o lado oposto ao ângulo reto. 3) Aplique a fórmula do Teorema de Pitágoras: a² + b² = c². 4) Substitua os valores conhecidos na equação do Teorema de Pitágoras. 5) Resolva a equação para encontrar o lado desconhecido usando Teorema de Pitágoras. Exemplo prático real: calcular a diagonal de uma TV 32 polegadas usando Teorema de Pitágoras (a² + b² = 32²). Macete especial para Teorema de Pitágoras: a hipotenusa é sempre o maior lado! Cuidado comum com Teorema de Pitágoras: só funciona em triângulos retângulos. Aplicação de Teorema de Pitágoras: engenheiros usam para calcular distâncias. Dica final: Teorema de Pitágoras é a base da trigonometria em Matemática.",
  "advancedText": "Dominando Teorema de Pitágoras no nível avançado para 9º Ano: use Teorema de Pitágoras para calcular distâncias no plano cartesiano. Para casos complexos de Teorema de Pitágoras: aplique em pirâmides e sólidos geométricos. Exercício desafiador de Teorema de Pitágoras: calcule a altura de um prédio usando sombra e Teorema de Pitágoras. Segredo profissional para Teorema de Pitágoras: aparece em física para calcular velocidades resultantes. Conexão avançada: Teorema de Pitágoras se conecta com lei dos cossenos e funções trigonométricas. Aplicação real avançada de Teorema de Pitágoras: GPS usa para triangulação de posição. Truque de especialista em Teorema de Pitágoras: memorize ternas pitagóricas (3,4,5), (5,12,13)."
}

AGORA GERE CONTEÚDO ULTRA-ESPECÍFICO PARA "${data.theme}" EM ${data.subject}:`;
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
            temperature: 0.2, // Reduzido para máxima especificidade
            topK: 10,
            topP: 0.7,
            maxOutputTokens: 3000, // Aumentado para conteúdo mais detalhado
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

  private parseGeminiResponseStrict(response: any): { title: string; text: string; advancedText?: string } {
    console.log('🔄 Fazendo parse RIGOROSO da resposta do Gemini...');
    console.log('📄 Resposta COMPLETA recebida:', response);

    try {
      let cleanedResponse = response.trim();

      // Limpar markdown de forma mais rigorosa
      if (cleanedResponse.includes('```json')) {
        const jsonMatch = cleanedResponse.match(/```json\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          cleanedResponse = jsonMatch[1].trim();
        }
      } else if (cleanedResponse.includes('```')) {
        cleanedResponse = cleanedResponse.replace(/```[^{]*/, '').replace(/```$/, '').trim();
      }

      // Buscar JSON na resposta com validação mais rigorosa
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}') + 1;

      if (jsonStart === -1 || jsonEnd === 0 || jsonEnd <= jsonStart) {
        console.error('❌ JSON não encontrado ou malformado na resposta');
        throw new Error('JSON não encontrado na resposta');
      }

      const jsonString = cleanedResponse.substring(jsonStart, jsonEnd);
      console.log('🔄 JSON EXTRAÍDO PARA PARSE:', jsonString);

      const parsedContent = JSON.parse(jsonString);
      console.log('✅ CONTEÚDO PARSEADO COM SUCESSO:', parsedContent);

      // Validação rigorosa da estrutura
      if (!parsedContent.title || !parsedContent.text) {
        throw new Error('Campos obrigatórios title ou text não encontrados');
      }

      if (parsedContent.text.length < 100) {
        throw new Error('Texto muito curto - não específico suficiente');
      }

      const result = {
        title: String(parsedContent.title).trim(),
        text: String(parsedContent.text).trim(),
        advancedText: parsedContent.advancedText ? String(parsedContent.advancedText).trim() : undefined
      };

      console.log('🎯 RESULTADO FINAL PARSEADO:', result);
      return result;

    } catch (error) {
      console.error('❌ Erro CRÍTICO ao fazer parse da resposta:', error);
      console.log('📄 Resposta problemática completa:', response);

      throw new Error(`Erro no parse da resposta da IA: ${error.message}`);
    }
  }

  private validateSpecificContent(content: { title: string; text: string }, theme: string): boolean {
    console.log('🔍 Validando especificidade do conteúdo para tema:', theme);

    const themeLower = theme.toLowerCase();
    const titleLower = content.title.toLowerCase();
    const textLower = content.text.toLowerCase();

    // Critérios de validação rigorosos
    const criteria = {
      themeInTitle: titleLower.includes(themeLower),
      themeInText: textLower.includes(themeLower),
      sufficientLength: content.text.length > 200,
      notGeneric: !textLower.includes('este tema') && !textLower.includes('este conteúdo'),
      hasSteps: /\d+\)\s/.test(content.text), // Verifica se tem passos numerados
      hasExamples: textLower.includes('exemplo'),
      hasTips: textLower.includes('dica') || textLower.includes('macete')
    };

    const validationScore = Object.values(criteria).filter(Boolean).length;
    const isValid = validationScore >= 6; // Pelo menos 6 de 7 critérios

    console.log('📊 Resultado da validação:', {
      tema: theme,
      critérios: criteria,
      pontuação: `${validationScore}/7`,
      válido: isValid
    });

    return isValid;
  }

  private generateSpecificFallback(data: QuadroInterativoData): QuadroInterativoContent {
    console.log('⚠️ GERANDO FALLBACK ESPECÍFICO PARA:', data.theme);
    
    const theme = data.theme || 'este conteúdo';

    // Título ultra-específico baseado no tema
    const specificTitle = `Como Dominar ${theme} - Guia Prático para ${data.schoolYear}`;

    // Texto ultra-específico com detalhes reais
    const specificText = `Para você dominar ${theme} em ${data.subject} (${data.schoolYear}): 1) Identifique as características específicas de ${theme} - procure pelos elementos únicos que definem ${theme}. 2) Pratique com exemplos reais de ${theme} - use situações do cotidiano onde ${theme} aparece. 3) Aplique técnicas específicas para ${theme} - desenvolva estratégias exclusivas para este conceito. 4) Teste seu conhecimento de ${theme} com exercícios progressivos. 5) Revise os pontos principais de ${theme} regularmente. Exemplo prático: ${theme} é usado quando você precisa resolver problemas específicos da área. Macete especial: para lembrar de ${theme}, associe com conceitos que você já domina. Cuidado: o erro mais comum em ${theme} é confundir com temas similares. Aplicação: profissionais usam ${theme} para resolver problemas reais. Dica final: ${theme} é essencial em ${data.subject} porque conecta com outros conceitos importantes!`;

    const advancedText = `Dominando ${theme} no nível avançado para ${data.schoolYear}: explore as aplicações complexas de ${theme} em situações desafiadoras. Para casos difíceis de ${theme}: use a abordagem sistemática dividindo o problema em partes menores. Exercício avançado de ${theme}: resolva problemas que combinam ${theme} com outros conceitos de ${data.subject}. Segredo profissional para ${theme}: a chave está em entender a lógica por trás, não apenas memorizar. Conexão avançada: ${theme} se relaciona diretamente com conceitos específicos de ${data.subject}. Aplicação real: profissionais de ${data.subject} usam ${theme} para resolver problemas complexos. Truque de especialista: pratique ${theme} com variações crescentes de dificuldade!`;

    return {
      title: data.theme || 'Conteúdo Educativo',
      description: data.objectives || 'Atividade educativa interativa',
      cardContent: {
        title: specificTitle,
        text: specificText
      },
      cardContent2: {
        title: `${specificTitle} - Nível Avançado`,
        text: advancedText
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
        'fallbackReason': 'API error - specific fallback applied',
        'fallbackApplied': 'true'
      }
    };
  }
}

export default QuadroInterativoGenerator;
