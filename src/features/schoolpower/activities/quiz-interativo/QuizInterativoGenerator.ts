import { geminiLogger } from '@/utils/geminiDebugLogger';
import { API_KEYS } from '@/config/apiKeys';

export interface QuizInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  format: string;
  numberOfQuestions: string;
  timePerQuestion: string;
  instructions: string;
  evaluation: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  type: 'multipla-escolha' | 'verdadeiro-falso';
  options?: string[];
  correctAnswer: string;
  explanation?: string;
  area?: string; // Nova: área específica do tema
  difficulty?: string; // Nova: dificuldade específica da questão
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
  topicsExplored?: string[]; // Nova: áreas exploradas
  questionDistribution?: { [key: string]: number }; // Nova: distribuição de questões
}

export class QuizInterativoGenerator {
  private apiKey: string;

  constructor() {
    // Tentar múltiplas fontes para a chave da API
    this.apiKey = API_KEYS?.GEMINI || import.meta.env.VITE_GEMINI_API_KEY || import.meta.env.VITE_GOOGLE_GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY || '';

    if (!this.apiKey) {
      console.error('⚠️ ERRO: Chave da API Gemini não configurada');
      console.error('📋 Variáveis disponíveis:', Object.keys(import.meta.env));
      geminiLogger.logError('API Key não configurada', {
        hasKey: !!this.apiKey,
        envVars: Object.keys(import.meta.env).filter(key => key.includes('GEMINI') || key.includes('GOOGLE'))
      });
      throw new Error('API Gemini não configurada. Adicione VITE_GEMINI_API_KEY nas Secrets.');
    } else {
      console.log('✅ API Gemini configurada corretamente');
      geminiLogger.logInfo('API Gemini configurada', {
        keyLength: this.apiKey.length,
        keyPreview: this.apiKey.substring(0, 10) + '...'
      });
    }
  }

  async generateQuizContent(data: QuizInterativoData): Promise<QuizInterativoContent> {
    try {
      geminiLogger.logInfo('🎯 Iniciando geração de Quiz Interativo', data);

      // Validar dados de entrada
      const validatedData = this.validateInputData(data);
      geminiLogger.logInfo('✅ Dados validados', validatedData);

      if (!this.apiKey) {
        geminiLogger.logError('❌ API Key não configurada', { hasKey: false });
        return this.createFallbackContent(validatedData);
      }

      const prompt = this.buildPrompt(validatedData);
      geminiLogger.logInfo('📝 Prompt construído', { promptLength: prompt.length });

      const response = await this.callGeminiAPI(prompt);
      geminiLogger.logInfo('📥 Resposta recebida da API', { responseLength: response.length });

      const content = this.parseResponse(response, validatedData);

      geminiLogger.logSuccess('✅ Quiz Interativo gerado com sucesso', content);
      return content;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao gerar Quiz Interativo', error);
      return this.createFallbackContent(data);
    }
  }

  private validateInputData(data: QuizInterativoData): QuizInterativoData {
    return {
      subject: data.subject?.trim() || 'Matemática',
      schoolYear: data.schoolYear?.trim() || '6º Ano - Ensino Fundamental',
      theme: data.theme?.trim() || 'Tema Geral',
      objectives: data.objectives?.trim() || 'Testar conhecimentos sobre o tema',
      difficultyLevel: data.difficultyLevel?.trim() || 'Médio',
      format: data.format?.trim() || 'Múltipla Escolha',
      numberOfQuestions: data.numberOfQuestions?.trim() || '10',
      timePerQuestion: data.timePerQuestion?.trim() || '60',
      instructions: data.instructions?.trim() || 'Leia cada questão atentamente e selecione a resposta correta.',
      evaluation: data.evaluation?.trim() || 'Pontuação baseada no número de acertos.'
    };
  }

  private createFallbackContent(data: QuizInterativoData): QuizInterativoContent {
    const numQuestions = parseInt(data.numberOfQuestions) || 5;
    const timePerQuestion = parseInt(data.timePerQuestion) || 60;

    geminiLogger.logWarning('⚠️ Criando conteúdo de fallback', {
      reason: 'API falhou ou resposta inválida',
      numQuestions,
      theme: data.theme,
      subject: data.subject
    });

    // Definir subáreas para diversificar as questões
    const subareas = [
      'Conceitos fundamentais',
      'Aplicações práticas',
      'Resolução de problemas',
      'Análise e interpretação'
    ];

    const fallbackQuestions: QuizQuestion[] = Array.from({ length: numQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const subareaIndex = index % subareas.length;
      const subarea = subareas[subareaIndex];

      // Alternar entre tipos de questão de forma inteligente
      const isMultipleChoice = data.format !== 'Verdadeiro/Falso' &&
        (data.format === 'Múltipla Escolha' || index % 3 !== 2);

      if (isMultipleChoice) {
        const questionTemplates = [
          `Qual é o conceito principal de ${data.theme} relacionado a ${subarea.toLowerCase()}?`,
          `Como ${data.theme} se aplica em situações práticas de ${subarea.toLowerCase()}?`,
          `Qual alternativa melhor descreve ${data.theme} no contexto de ${subarea.toLowerCase()}?`,
          `Em ${data.subject}, ${data.theme} é caracterizado por qual aspecto de ${subarea.toLowerCase()}?`
        ];

        const questionText = questionTemplates[questionNumber % questionTemplates.length];

        return {
          id: questionNumber,
          question: `Questão ${questionNumber}: ${questionText}`,
          type: 'multipla-escolha',
          options: [
            `A) Definição básica e estrutural de ${data.theme}`,
            `B) Aplicação prática em ${data.subject}`,
            `C) Relação com outros conceitos da disciplina`,
            `D) Exemplos específicos de ${subarea.toLowerCase()}`
          ],
          correctAnswer: `A) Definição básica e estrutural de ${data.theme}`,
          explanation: `A definição básica é fundamental para compreender ${data.theme} em ${data.subject}, especialmente no contexto de ${subarea.toLowerCase()}.`,
          area: subarea,
          difficulty: index < numQuestions / 3 ? 'básico' : index < 2 * numQuestions / 3 ? 'médio' : 'avançado'
        };
      } else {
        const truthStatements = [
          `${data.theme} é um conceito fundamental em ${data.subject}`,
          `A aplicação de ${data.theme} é essencial para o ${data.schoolYear}`,
          `${data.theme} se relaciona diretamente com ${subarea.toLowerCase()}`,
          `O estudo de ${data.theme} desenvolve habilidades importantes`
        ];

        const statement = truthStatements[questionNumber % truthStatements.length];

        return {
          id: questionNumber,
          question: `Questão ${questionNumber}: ${statement}.`,
          type: 'verdadeiro-falso',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Verdadeiro',
          explanation: `Correto! ${data.theme} é realmente importante em ${data.subject}, especialmente para compreender ${subarea.toLowerCase()}.`,
          area: subarea,
          difficulty: index < numQuestions / 3 ? 'básico' : index < 2 * numQuestions / 3 ? 'médio' : 'avançado'
        };
      }
    });

    // Calcular distribuições para o fallback
    const typeDistribution = fallbackQuestions.reduce((acc, q) => {
      acc[q.type] = (acc[q.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const result: QuizInterativoContent = {
      title: `Quiz Interativo: ${data.theme}`,
      description: `Explore diferentes aspectos de ${data.theme} com questões variadas que testam desde conceitos básicos até aplicações práticas em ${data.subject}. Este quiz foi gerado em modo demonstração.`,
      questions: fallbackQuestions,
      timePerQuestion,
      totalQuestions: numQuestions,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      topicsExplored: subareas.slice(0, Math.min(4, numQuestions)),
      questionDistribution: typeDistribution
    };

    geminiLogger.logInfo('✅ Conteúdo de fallback criado', {
      totalQuestions: result.totalQuestions,
      typeDistribution,
      topicsExplored: result.topicsExplored
    });

    return result;
  }

  private buildPrompt(data: QuizInterativoData): string {
    const numQuestions = parseInt(data.numberOfQuestions) || 10;

    // Calcular distribuição de questões por subárea
    const questoesPorArea = Math.ceil(numQuestions / 4); // Dividir em 4 áreas principais

    return `
Você é um especialista em educação brasileira e criação de conteúdo educacional diversificado.

**MISSÃO:** Criar ${numQuestions} questões VARIADAS e ABRANGENTES sobre "${data.theme}" explorando DIFERENTES SUBÁREAS e ASPECTOS do tema.

**CONTEXTO EDUCACIONAL:**
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema Central: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Formato: ${data.format}

**ESTRATÉGIA DE DIVERSIFICAÇÃO:**
1. **EXPLORE 4 SUBÁREAS DIFERENTES** do tema "${data.theme}":
   - Conceitos fundamentais e definições
   - Aplicações práticas e exemplos do cotidiano
   - Resolução de problemas e cálculos
   - Análise crítica e interpretação

2. **VARIE OS NÍVEIS DE COMPLEXIDADE:**
   - 30% questões básicas (conhecimento)
   - 40% questões médias (compreensão/aplicação)
   - 30% questões avançadas (análise/síntese)

3. **DIVERSIFIQUE OS CONTEXTOS:**
   - Situações do dia a dia
   - Problemas matemáticos/científicos
   - Análise de texto/imagem (quando aplicável)
   - Comparações e relações

**ESPECIFICAÇÕES DAS QUESTÕES:**

${data.format === 'Múltipla Escolha' ? `
Crie ${numQuestions} questões de múltipla escolha com:
- EXATAMENTE 4 alternativas por questão (A, B, C, D)
- Apenas 1 alternativa correta
- Alternativas plausíveis mas claramente distintas
- Explicação educativa detalhada para cada resposta
- Varie os contextos e subáreas do tema
` : data.format === 'Verdadeiro/Falso' ? `
Crie ${numQuestions} questões verdadeiro/falso sobre ${data.theme}:
- Afirmações claras sobre conceitos específicos
- Explore diferentes aspectos do tema
- Explicação completa do porquê é verdadeiro ou falso
- Varie entre conceitos básicos e aplicações práticas
` : `
Crie ${numQuestions} questões MISTAS explorando todo o tema:
- 60% múltipla escolha (4 alternativas A,B,C,D)
- 40% verdadeiro/falso
- Varie os tipos de forma inteligente
- Explore todas as subáreas do tema
- Misture diferentes níveis de dificuldade
`}

**DIRETRIZES PEDAGÓGICAS ESPECÍFICAS:**
- Use linguagem ADEQUADA para ${data.schoolYear}
- EXPLORE PROFUNDAMENTE o tema "${data.theme}"
- Nível ${data.difficultyLevel} como base, mas VARIE a complexidade
- Desenvolva competências: ${data.objectives}
- Cada questão deve abordar um ASPECTO DIFERENTE do tema
- Inclua situações práticas e exemplos reais
- Evite repetição de conceitos entre questões

**FORMATO DE RESPOSTA OBRIGATÓRIO (APENAS JSON, SEM TEXTO ADICIONAL):**

{
  "title": "Quiz Interativo: ${data.theme}",
  "description": "Explore diferentes aspectos de ${data.theme} com questões variadas que testam desde conceitos básicos até aplicações práticas",
  "topicsExplored": ["subárea 1", "subárea 2", "subárea 3", "subárea 4"],
  "questions": [
    {
      "id": 1,
      "question": "Pergunta específica sobre conceitos fundamentais",
      "type": "multipla-escolha",
      "options": ["A) Primeira alternativa", "B) Segunda alternativa", "C) Terceira alternativa", "D) Quarta alternativa"],
      "correctAnswer": "A) Primeira alternativa",
      "explanation": "Explicação clara e educativa",
      "area": "Conceitos fundamentais",
      "difficulty": "básico"
    },
    {
      "id": 2,
      "question": "Pergunta sobre aplicação prática",
      "type": "verdadeiro-falso",
      "options": ["Verdadeiro", "Falso"],
      "correctAnswer": "Verdadeiro",
      "explanation": "Explicação detalhada",
      "area": "Aplicações práticas",
      "difficulty": "médio"
    }
  ]
}

**IMPORTANTE:**
- RETORNE APENAS O JSON, sem explicações extras
- GARANTA que cada questão explore um aspecto diferente
- DIVERSIFIQUE os contextos e situações
- USE exemplos práticos e relevantes para a faixa etária`;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`;

    const payload = {
      contents: [{
        parts: [{
          text: prompt
        }]
      }],
      generationConfig: {
        temperature: 0.8, // Aumentado para mais criatividade
        topK: 50, // Aumentado para mais variedade
        topP: 0.95,
        maxOutputTokens: 16384, // Aumentado para respostas mais completas
      }
    };

    geminiLogger.logInfo('🚀 Fazendo chamada para API Gemini', {
      url,
      hasApiKey: !!this.apiKey,
      promptLength: prompt.length,
      payload: payload.generationConfig
    });

    const startTime = Date.now();

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(30000) // 30 segundos timeout
      });

      const executionTime = Date.now() - startTime;

      geminiLogger.logInfo('📥 Resposta da API recebida', {
        status: response.status,
        statusText: response.statusText,
        executionTime: `${executionTime}ms`
      });

      if (!response.ok) {
        const errorText = await response.text();
        geminiLogger.logError('❌ Erro na API do Gemini', {
          status: response.status,
          statusText: response.statusText,
          errorBody: errorText
        });
        throw new Error(`Erro na API do Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();

      geminiLogger.logInfo('🔍 Estrutura da resposta da API', {
        hasCandidates: !!data.candidates,
        candidatesLength: data.candidates?.length || 0,
        hasContent: !!data.candidates?.[0]?.content,
        hasParts: !!data.candidates?.[0]?.content?.parts,
        partsLength: data.candidates?.[0]?.content?.parts?.length || 0
      });

      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
        geminiLogger.logError('❌ Estrutura de resposta inválida', data);
        throw new Error('Resposta inválida da API do Gemini - estrutura malformada');
      }

      const responseText = data.candidates[0].content.parts[0].text;

      geminiLogger.logInfo('✅ Texto da resposta extraído com sucesso', {
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 200)
      });

      return responseText;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      geminiLogger.logError('❌ Erro crítico na chamada da API', {
        error: error.message,
        executionTime: `${executionTime}ms`
      });
      throw error;
    }
  }

  private parseResponse(response: string, originalData: QuizInterativoData): QuizInterativoContent {
    try {
      geminiLogger.logInfo('🔍 Processando resposta do Gemini', {
        responseLength: response.length,
        responsePreview: response.substring(0, 300),
        originalData
      });

      // Limpeza mais robusta da resposta
      let cleanResponse = response.trim();

      // Remover markdown code blocks e outros padrões
      cleanResponse = cleanResponse.replace(/^```json\s*/gi, '').replace(/\s*```$/g, '');
      cleanResponse = cleanResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      cleanResponse = cleanResponse.replace(/^.*?(?=\{)/s, ''); // Remove tudo antes do primeiro {
      cleanResponse = cleanResponse.replace(/\}[^}]*$/s, '}'); // Remove tudo depois do último }

      geminiLogger.logInfo('🧹 Resposta limpa para parsing', {
        cleanResponse: cleanResponse.substring(0, 500) + '...',
        length: cleanResponse.length
      });

      let parsed;
      try {
        parsed = JSON.parse(cleanResponse);
      } catch (parseError) {
        geminiLogger.logError('❌ Erro de JSON parsing, tentando limpeza adicional', parseError);

        // Tentativa de limpeza adicional
        cleanResponse = cleanResponse.replace(/,\s*}/g, '}').replace(/,\s*]/g, ']');
        parsed = JSON.parse(cleanResponse);
      }

      // Validar estrutura básica com logs detalhados
      geminiLogger.logInfo('📊 Estrutura da resposta parseada', {
        hasQuestions: !!parsed.questions,
        isQuestionsArray: Array.isArray(parsed.questions),
        questionsLength: parsed.questions?.length || 0,
        hasTitle: !!parsed.title,
        hasDescription: !!parsed.description,
        hasTopicsExplored: !!parsed.topicsExplored
      });

      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        geminiLogger.logError('❌ Estrutura de resposta inválida ou sem questões', parsed);
        throw new Error('Resposta não contém questões válidas');
      }

      // Processar questões com validação mais rigorosa
      const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => {
        const questionId = index + 1;

        geminiLogger.logInfo(`🔍 Processando questão ${questionId}`, q);

        // Determinar tipo da questão com lógica melhorada
        let questionType: 'multipla-escolha' | 'verdadeiro-falso' = 'multipla-escolha';

        if (q.type === 'verdadeiro-falso' || q.tipo === 'verdadeiro-falso' ||
          (q.options && q.options.length === 2 &&
            q.options.some((opt: string) => opt?.toLowerCase().includes('verdadeiro')) &&
            q.options.some((opt: string) => opt?.toLowerCase().includes('falso')))) {
          questionType = 'verdadeiro-falso';
        }

        // Processar opções com validação
        let processedOptions: string[] = [];
        if (questionType === 'multipla-escolha') {
          const rawOptions = q.options || q.opcoes || q.alternativas;
          if (rawOptions && Array.isArray(rawOptions) && rawOptions.length >= 4) {
            processedOptions = rawOptions.slice(0, 4); // Garantir exatamente 4 opções
          } else {
            // Fallback com opções baseadas no tema
            processedOptions = [
              `A) Conceito fundamental de ${originalData.theme}`,
              `B) Aplicação prática de ${originalData.theme}`,
              `C) Exemplo específico de ${originalData.theme}`,
              `D) Teoria complementar de ${originalData.theme}`
            ];
          }
        } else {
          processedOptions = ['Verdadeiro', 'Falso'];
        }

        // Validar resposta correta
        let correctAnswer = q.correctAnswer || q.respostaCorreta || q.resposta || processedOptions[0];

        // Para múltipla escolha, garantir que a resposta correta existe nas opções
        if (questionType === 'multipla-escolha') {
          const isValidAnswer = processedOptions.some(option =>
            option.toLowerCase().includes(correctAnswer.toLowerCase()) ||
            correctAnswer.toLowerCase().includes(option.toLowerCase())
          );

          if (!isValidAnswer) {
            correctAnswer = processedOptions[0]; // Usar primeira opção como fallback
            geminiLogger.logWarning(`⚠️ Resposta correta ajustada para questão ${questionId}`, {
              originalAnswer: q.correctAnswer,
              newAnswer: correctAnswer
            });
          }
        }

        const processedQuestion: QuizQuestion = {
          id: questionId,
          question: q.question || q.pergunta || q.enunciado || `Questão ${questionId}: Sobre ${originalData.theme} em ${originalData.subject}, qual aspecto é mais relevante?`,
          type: questionType,
          options: processedOptions,
          correctAnswer,
          explanation: q.explanation || q.explicacao || q.justificativa || `Explicação para a questão ${questionId} sobre ${originalData.theme}`,
          area: q.area || q.topico || q.subtema || 'Área geral',
          difficulty: q.difficulty || q.dificuldade || originalData.difficultyLevel
        };

        geminiLogger.logInfo(`✅ Questão ${questionId} processada com sucesso`, {
          type: processedQuestion.type,
          optionsCount: processedQuestion.options?.length,
          hasExplanation: !!processedQuestion.explanation,
          area: processedQuestion.area
        });

        return processedQuestion;
      });

      // Validar distribuição das questões
      const typeDistribution = questions.reduce((acc, q) => {
        acc[q.type] = (acc[q.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const areaDistribution = questions.reduce((acc, q) => {
        const area = q.area || 'Não definida';
        acc[area] = (acc[area] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      // Processar tempo por questão
      let timePerQuestion = 60; // padrão
      const timeInput = originalData.timePerQuestion?.toString().replace(/\D/g, '');
      if (timeInput && !isNaN(parseInt(timeInput))) {
        timePerQuestion = parseInt(timeInput);
      }

      const result: QuizInterativoContent = {
        title: parsed.title || `Quiz Interativo: ${originalData.theme}`,
        description: parsed.description || `Explore diferentes aspectos de ${originalData.theme} com questões variadas que testam desde conceitos básicos até aplicações práticas em ${originalData.subject}.`,
        questions,
        timePerQuestion,
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        topicsExplored: parsed.topicsExplored || Object.keys(areaDistribution),
        questionDistribution: typeDistribution
      };

      geminiLogger.logSuccess('✅ Conteúdo final processado com sucesso', {
        title: result.title,
        totalQuestions: result.totalQuestions,
        timePerQuestion: result.timePerQuestion,
        typeDistribution,
        areaDistribution,
        topicsExplored: result.topicsExplored
      });

      return result;

    } catch (error) {
      geminiLogger.logError('❌ Erro crítico no parsing da resposta', {
        error: error.message,
        response: response.substring(0, 500),
        stack: error.stack
      });
      return this.createFallbackContent(originalData);
    }
  }
}