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
  type: 'multipla-escolha' | 'verdadeiro-falso' | 'lacuna'; // Adicionado 'lacuna'
  options?: string[];
  correctAnswer: string | number; // Permitindo string ou número para índice
  explanation?: string;
  area?: string; // Nova: área específica do tema
  difficulty?: string; // Nova: dificuldade específica da questão
  topic?: string; // Adicionado para refletir a estrutura do prompt
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

      const prompt = this.createPrompt(validatedData); // Renomeado de buildPrompt para createPrompt
      geminiLogger.logInfo('📝 Prompt construído', { promptLength: prompt.length });

      const responseText = await this.callGeminiAPI(prompt);
      geminiLogger.logInfo('📥 Resposta recebida da API', { responseLength: responseText.length });

      const content = this.parseAndValidateResponse(responseText); // Renomeado de parseResponse

      // Mesclar dados originais com os gerados, se necessário
      const finalContent: QuizInterativoContent = {
        ...content,
        title: content.title || `Quiz Interativo: ${validatedData.theme}`,
        description: content.description || `Explore diferentes aspectos de ${validatedData.theme} com questões variadas.`,
        timePerQuestion: parseInt(validatedData.timePerQuestion) || content.timePerQuestion,
        totalQuestions: content.questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        questionDistribution: content.questionDistribution || this.calculateDistribution(content.questions)
      };

      geminiLogger.logSuccess('✅ Quiz Interativo gerado com sucesso', finalContent);
      return finalContent;

    } catch (error) {
      geminiLogger.logError('❌ Erro ao gerar Quiz Interativo', { error: error.message, stack: error.stack });
      // Se ocorrer um erro durante a geração, retornar conteúdo de fallback
      const fallbackData = this.validateInputData(data); // Usar os dados validados para o fallback
      return this.createFallbackContent(fallbackData);
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
      'Análise e interpretação',
      'Relações e conexões' // Adicionada mais uma área
    ];

    const fallbackQuestions: QuizQuestion[] = Array.from({ length: numQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const subareaIndex = index % subareas.length;
      const subarea = subareas[subareaIndex];

      // Alternar entre tipos de questão de forma inteligente
      const questionType = index % 3 === 0 ? 'multipla-escolha' : index % 3 === 1 ? 'verdadeiro-falso' : 'lacuna';

      if (questionType === 'multipla-escolha') {
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
          correctAnswer: 0, // Índice da resposta correta
          explanation: `A definição básica é fundamental para compreender ${data.theme} em ${data.subject}, especialmente no contexto de ${subarea.toLowerCase()}.`,
          area: subarea,
          difficulty: index < numQuestions / 3 ? 'básico' : index < 2 * numQuestions / 3 ? 'médio' : 'avançado',
          topic: subarea // Adicionando topic
        };
      } else if (questionType === 'verdadeiro-falso') {
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
          difficulty: index < numQuestions / 3 ? 'básico' : index < 2 * numQuestions / 3 ? 'médio' : 'avançado',
          topic: subarea // Adicionando topic
        };
      } else {
        const fillInTheBlankTemplates = [
          `A principal característica de ${data.theme} no contexto de ${subarea.toLowerCase()} é __________.`,
          `Para resolver problemas em ${data.subject} relacionados a ${data.theme}, é crucial entender __________.`,
          `A aplicação prática de ${data.theme} no ${data.schoolYear} envolve principalmente __________.`
        ];
        const questionText = fillInTheBlankTemplates[questionNumber % fillInTheBlankTemplates.length];
        return {
          id: questionNumber,
          question: `Questão ${questionNumber}: ${questionText}`,
          type: 'lacuna',
          options: [], // Lacunas não têm opções pré-definidas
          correctAnswer: `Conceito chave de ${data.theme}`, // Resposta esperada
          explanation: `Compreender ${data.theme} é essencial para ${data.subject}. A resposta correta é o conceito central relacionado a ${subarea.toLowerCase()}.`,
          area: subarea,
          difficulty: index < numQuestions / 3 ? 'básico' : index < 2 * numQuestions / 3 ? 'médio' : 'avançado',
          topic: subarea // Adicionando topic
        };
      }
    });

    const result: QuizInterativoContent = {
      title: `Quiz Interativo: ${data.theme} (Modo Demonstração)`,
      description: `Explore diferentes aspectos de ${data.theme} com questões variadas que testam desde conceitos básicos até aplicações práticas em ${data.subject}. Este quiz foi gerado em modo demonstração devido a falha na API.`,
      questions: fallbackQuestions,
      timePerQuestion,
      totalQuestions: numQuestions,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      topicsExplored: subareas.slice(0, Math.min(4, numQuestions)),
      questionDistribution: this.calculateDistribution(fallbackQuestions)
    };

    geminiLogger.logInfo('✅ Conteúdo de fallback criado', {
      totalQuestions: result.totalQuestions,
      questionDistribution: result.questionDistribution,
      topicsExplored: result.topicsExplored
    });

    return result;
  }

  private createPrompt(data: QuizInterativoData): string {
    const questionCount = parseInt(data.numberOfQuestions) || 10;
    const multipleChoice = Math.ceil(questionCount * 0.6);
    const trueFalse = Math.ceil(questionCount * 0.25);
    const fillBlanks = questionCount - multipleChoice - trueFalse;

    return `
Você é um especialista em educação criando um quiz interativo educacional DIVERSIFICADO e ABRANGENTE.

DADOS EDUCACIONAIS:
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema Principal: ${data.theme}
- Objetivos: ${data.objectives}
- Nível de Dificuldade: ${data.difficultyLevel}
- Total de Questões: ${questionCount}
- Tempo por Questão: ${data.timePerQuestion} segundos

MANDATÓRIO - EXPLORAÇÃO DIVERSIFICADA:

1. **MAPEAMENTO DE SUBTEMAS (Obrigatório)**:
   - Identifique 5-6 áreas distintas dentro do tema "${data.theme}"
   - Cada área deve abordar aspectos únicos e complementares
   - Distribua as questões equitativamente entre as áreas
   - Exemplos de diversificação:
     * Conceitos básicos e definições
     * Aplicações práticas e exemplos
     * Relações e conexões interdisciplinares
     * Análise crítica e interpretação
     * Resolução de problemas reais
     * História e evolução do conceito

2. **DISTRIBUIÇÃO OBRIGATÓRIA DE TIPOS**:
   - ${multipleChoice} questões de Múltipla Escolha (4-5 alternativas cada)
   - ${trueFalse} questões de Verdadeiro/Falso (com justificativa)
   - ${fillBlanks} questões de Completar Lacunas

3. **CRITÉRIOS DE QUALIDADE RIGOROSOS**:
   - Questões contextualizadas com situações reais
   - Alternativas plausíveis e educativas
   - Explicações detalhadas (mínimo 50 palavras por explicação)
   - Progressão de dificuldade: 30% fácil, 50% médio, 20% difícil
   - Linguagem adequada ao ${data.schoolYear}

4. **REQUISITOS ESPECÍFICOS POR TIPO**:

   **Múltipla Escolha:**
   - 4-5 alternativas por questão
   - Apenas 1 resposta correta
   - Alternativas incorretas pedagogicamente úteis
   - Evitar "todas as alternativas" ou "nenhuma das alternativas"

   **Verdadeiro/Falso:**
   - Afirmações claras e específicas
   - Evitar generalizações absolutas
   - Incluir justificativa na explicação

   **Completar Lacunas:**
   - Sentenças com 1-2 lacunas estratégicas
   - Resposta deve ser palavra-chave ou conceito central
   - Contexto suficiente para dedução lógica

FORMATO JSON ESTRITO (sem markdown, sem comentários):
{
  "title": "Quiz Interativo: ${data.theme}",
  "description": "Avaliação abrangente explorando múltiplas dimensões do tema ${data.theme}, adequada para ${data.schoolYear}",
  "questions": [
    {
      "id": 1,
      "type": "multipla-escolha",
      "topic": "Nome específico do subtema abordado",
      "question": "Pergunta contextualizada e clara sobre o subtema?",
      "options": ["Alternativa A detalhada", "Alternativa B detalhada", "Alternativa C detalhada", "Alternativa D detalhada"],
      "correctAnswer": 0,
      "explanation": "Explicação educativa completa justificando a resposta correta e explicando por que as outras alternativas estão incorretas. Deve ter pelo menos 50 palavras e ser pedagogicamente rica.",
      "difficulty": "facil"
    }
  ],
  "timePerQuestion": ${data.timePerQuestion},
  "totalQuestions": ${questionCount},
  "generatedAt": "${new Date().toISOString()}",
  "isGeneratedByAI": true,
  "topicsExplored": ["Lista de todos os subtemas abordados"],
  "questionDistribution": {
    "multipla-escolha": ${multipleChoice},
    "verdadeiro-falso": ${trueFalse},
    "lacuna": ${fillBlanks}
  }
}

CRÍTICO: Gere exatamente ${questionCount} questões explorando diferentes aspectos de "${data.theme}". Cada questão deve abordar um subtema distinto para máxima diversidade educacional.`;
  }

  private async callGeminiAPI(prompt: string): Promise<string> {
    const startTime = Date.now();

    try {
      geminiLogger.logInfo('🚀 Iniciando chamada para API Gemini', {
        promptLength: prompt.length,
        apiKeyAvailable: !!this.apiKey,
        promptPreview: prompt.substring(0, 200) + '...'
      });

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.4, // Mais criatividade para diversidade
          topK: 30,
          topP: 0.9,
          maxOutputTokens: 16384, // Aumentado para questões mais elaboradas
          candidateCount: 1
        },
        safetySettings: [
          {
            category: "HARM_CATEGORY_HARASSMENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_HATE_SPEECH",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          },
          {
            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
            threshold: "BLOCK_MEDIUM_AND_ABOVE"
          }
        ]
      };

      console.log('📤 Enviando requisição para Gemini API:', {
        url: `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey.substring(0, 10)}...`,
        bodyPreview: JSON.stringify(requestBody).substring(0, 300)
      });

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
        signal: AbortSignal.timeout(30000) // Adiciona timeout de 30 segundos
      });

      const executionTime = Date.now() - startTime;

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erro HTTP na API Gemini:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });

        geminiLogger.logError(`Erro HTTP ${response.status}`, {
          status: response.status,
          error: errorText,
          executionTime
        });
        throw new Error(`Erro na API Gemini: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      console.log('📥 Resposta bruta da API:', {
        candidates: data.candidates?.length || 0,
        hasContent: !!data.candidates?.[0]?.content,
        hasParts: !!data.candidates?.[0]?.content?.parts
      });

      const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

      if (!resultText) {
        console.error('❌ Resposta vazia ou malformada da API Gemini:', data);
        geminiLogger.logError('❌ Resposta vazia ou malformada da API Gemini', { data: JSON.stringify(data) });
        throw new Error('Resposta vazia ou malformada da API Gemini');
      }

      console.log('✅ Texto extraído da resposta:', {
        length: resultText.length,
        preview: resultText.substring(0, 500) + '...'
      });

      geminiLogger.logSuccess('✅ Resposta recebida com sucesso', {
        responseLength: resultText.length,
        executionTime,
        hasValidResponse: !!resultText
      });

      return resultText;

    } catch (error) {
      const executionTime = Date.now() - startTime;
      console.error('❌ Erro na chamada da API Gemini:', error);

      geminiLogger.logError('❌ Erro na chamada da API', {
        error: error.message,
        executionTime,
        stack: error.stack
      });
      throw error;
    }
  }

  private parseAndValidateResponse(responseText: string): QuizInterativoContent {
    try {
      console.log('🔍 Iniciando processamento da resposta:', {
        originalLength: responseText.length,
        preview: responseText.substring(0, 200) + '...'
      });

      // Limpeza mais robusta da resposta
      let cleanedResponse = responseText.trim();

      // Remover blocos de código markdown e texto explicativo
      cleanedResponse = cleanedResponse.replace(/^```json\s*/gi, '').replace(/\s*```$/g, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      cleanedResponse = cleanedResponse.replace(/```/gi, ''); // Remover quaisquer outros ```

      // Encontrar o bloco JSON mais provável
      const jsonStart = cleanedResponse.indexOf('{');
      const jsonEnd = cleanedResponse.lastIndexOf('}');

      if (jsonStart === -1 || jsonEnd === -1 || jsonEnd <= jsonStart) {
        console.error('❌ JSON não encontrado. Resposta completa:', responseText);
        geminiLogger.logError('Formato JSON não encontrado na resposta', { response: responseText });
        throw new Error('Formato JSON não encontrado na resposta da IA');
      }

      cleanedResponse = cleanedResponse.substring(jsonStart, jsonEnd + 1);

      console.log('🧹 JSON extraído e limpo:', {
        length: cleanedResponse.length,
        startsCorrectly: cleanedResponse.startsWith('{'),
        endsCorrectly: cleanedResponse.endsWith('}'),
        preview: cleanedResponse.substring(0, 300) + '...'
      });

      // Parse do JSON
      let parsedContent;
      try {
        parsedContent = JSON.parse(cleanedResponse);
      } catch (parseError) {
        console.error('❌ Erro de JSON.parse, tentando limpeza adicional:', parseError);
        geminiLogger.logError('Erro de JSON.parse', { error: parseError.message, cleanedResponse });
        // Tentativa de limpeza adicional para vírgulas extras no final de arrays/objetos
        cleanedResponse = cleanedResponse.replace(/,\s*([}\]])/g, '$1');
        try {
          parsedContent = JSON.parse(cleanedResponse);
        } catch (finalParseError) {
          console.error('❌ Falha final no parsing JSON após limpeza:', finalParseError);
          throw new Error(`Falha ao parsear JSON mesmo após limpeza: ${finalParseError.message}`);
        }
      }

      console.log('📊 Conteúdo parseado:', {
        hasTitle: !!parsedContent.title,
        hasDescription: !!parsedContent.description,
        hasQuestions: !!parsedContent.questions,
        questionsType: Array.isArray(parsedContent.questions) ? 'array' : typeof parsedContent.questions,
        questionsCount: parsedContent.questions?.length || 0
      });

      // Validações rigorosas
      if (!parsedContent.questions || !Array.isArray(parsedContent.questions)) {
        throw new Error('Campo "questions" não encontrado ou não é um array');
      }

      if (parsedContent.questions.length === 0) {
        throw new Error('Nenhuma questão foi gerada pela IA');
      }

      // Validar estrutura detalhada de cada questão
      const validationErrors = [];

      parsedContent.questions.forEach((question: any, index: number) => {
        const questionNum = index + 1;

        if (!question.question || typeof question.question !== 'string' || question.question.trim() === '') {
          validationErrors.push(`Questão ${questionNum}: campo "question" ausente, inválido ou vazio`);
        }

        if (!question.type || typeof question.type !== 'string' || !['multipla-escolha', 'verdadeiro-falso', 'lacuna'].includes(question.type)) {
          validationErrors.push(`Questão ${questionNum}: campo "type" ausente ou inválido (deve ser 'multipla-escolha', 'verdadeiro-falso' ou 'lacuna')`);
        }

        if (!question.explanation || typeof question.explanation !== 'string' || question.explanation.trim().length < 20) { // Mínimo de 20 caracteres para explicação
          validationErrors.push(`Questão ${questionNum}: campo "explanation" ausente, inválido ou muito curto`);
        }

        // Validação específica para Múltipla Escolha
        if (question.type === 'multipla-escolha') {
          if (!question.options || !Array.isArray(question.options) || question.options.length < 2) {
            validationErrors.push(`Questão ${questionNum}: campo "options" ausente, inválido ou com menos de 2 opções para múltipla escolha`);
          } else {
            if (typeof question.correctAnswer !== 'number' || !Number.isInteger(question.correctAnswer) || question.correctAnswer < 0 || question.correctAnswer >= question.options.length) {
              validationErrors.push(`Questão ${questionNum}: "correctAnswer" (índice) inválido ou fora do intervalo para múltipla escolha`);
            }
          }
        }

        // Validação específica para Verdadeiro/Falso
        if (question.type === 'verdadeiro-falso') {
          if (!question.options || !Array.isArray(question.options) || question.options.length !== 2 || !question.options.includes('Verdadeiro') || !question.options.includes('Falso')) {
            validationErrors.push(`Questão ${questionNum}: campo "options" inválido para verdadeiro/falso (deve ser ['Verdadeiro', 'Falso'])`);
          }
          if (typeof question.correctAnswer !== 'string' || (question.correctAnswer !== 'Verdadeiro' && question.correctAnswer !== 'Falso')) {
            validationErrors.push(`Questão ${questionNum}: "correctAnswer" inválido para verdadeiro/falso (deve ser 'Verdadeiro' ou 'Falso')`);
          }
        }

        // Validação específica para Lacuna
        if (question.type === 'lacuna') {
          if (question.options && question.options.length > 0) {
            console.warn(`Questão ${questionNum}: Campo "options" não é esperado para tipo 'lacuna'. Sendo ignorado.`);
          }
          if (typeof question.correctAnswer !== 'string' || question.correctAnswer.trim() === '') {
            validationErrors.push(`Questão ${questionNum}: campo "correctAnswer" (a palavra/conceito a ser preenchido) é obrigatório e não pode estar vazio para tipo 'lacuna'`);
          }
        }
      });

      if (validationErrors.length > 0) {
        console.error('❌ Erros de validação encontrados:', validationErrors);
        geminiLogger.logError('Questões inválidas geradas pela IA', { errors: validationErrors });
        throw new Error(`Questões inválidas geradas pela IA:\n${validationErrors.join('\n')}`);
      }

      // Garantir campos obrigatórios com valores padrão consistentes
      const validatedContent: QuizInterativoContent = {
        title: parsedContent.title && typeof parsedContent.title === 'string' ? parsedContent.title.trim() : 'Quiz Interativo',
        description: parsedContent.description && typeof parsedContent.description === 'string' ? parsedContent.description.trim() : 'Quiz educativo gerado automaticamente',
        questions: parsedContent.questions.map((q: any, index: number) => ({
          ...q,
          id: index + 1, // Reindexar para garantir IDs sequenciais
          question: q.question.trim(),
          explanation: q.explanation.trim(),
          topic: q.topic?.trim() || q.area?.trim() || 'Geral', // Usar topic ou area como fallback
          area: q.area?.trim() || q.topic?.trim() || 'Geral', // Usar area ou topic como fallback
          difficulty: q.difficulty?.trim().toLowerCase() || 'médio', // Default para médio e lowercase
          options: q.type === 'multipla-escolha' ? (q.options || []).map((opt: string) => opt?.trim()).filter((opt: string) => opt !== '') : q.type === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : [],
          correctAnswer: q.type === 'lacuna' ? q.correctAnswer.toString().trim() : q.correctAnswer, // Garantir que correctAnswer seja string para lacuna
        })),
        timePerQuestion: parsedContent.timePerQuestion && !isNaN(parseInt(parsedContent.timePerQuestion)) ? parseInt(parsedContent.timePerQuestion) : 60,
        totalQuestions: parsedContent.questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        topicsExplored: (parsedContent.topicsExplored && Array.isArray(parsedContent.topicsExplored)) ? parsedContent.topicsExplored.map((t: string) => t?.trim()).filter((t: string) => t !== '') : [],
        questionDistribution: this.calculateDistribution(parsedContent.questions)
      };

      // Se topicsExplored estiver vazio, preencher com base nas áreas das questões
      if (validatedContent.topicsExplored.length === 0 && validatedContent.questions.length > 0) {
        validatedContent.topicsExplored = Array.from(new Set(validatedContent.questions.map(q => q.area || 'Geral'))).slice(0, 4);
      }

      console.log('✅ Conteúdo completamente validado e processado:', {
        title: validatedContent.title,
        totalQuestions: validatedContent.totalQuestions,
        topicsCount: validatedContent.topicsExplored.length,
        questionTypes: validatedContent.questions.map(q => q.type)
      });

      return validatedContent;

    } catch (error) {
      console.error('❌ Erro crítico no processamento da resposta da IA:', {
        error: error.message,
        stack: error.stack,
        originalResponse: responseText
      });

      geminiLogger.logError('Erro crítico no processamento da resposta da IA', {
        error: error.message,
        responseLength: responseText.length,
        responsePreview: responseText.substring(0, 500)
      });

      // Retornar fallback se o processamento falhar
      throw new Error(`Falha no processamento da resposta da IA: ${error.message}`);
    }
  }

  private calculateDistribution(questions: QuizQuestion[]): { [key: string]: number } {
    const distribution: { [key: string]: number } = {};
    questions.forEach(q => {
      distribution[q.type] = (distribution[q.type] || 0) + 1;
    });
    return distribution;
  }
}
```json\s*/gi, '').replace(/\s*```$/g, '');
      cleanedResponse = cleanedResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      cleanedResponse = cleanedResponse.replace(/```/gi, ''); // Remover quaisquer outros