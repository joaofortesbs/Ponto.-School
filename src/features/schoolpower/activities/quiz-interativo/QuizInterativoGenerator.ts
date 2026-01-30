import { geminiLogger } from '@/utils/geminiDebugLogger';
import { generateContent } from '@/services/llm-orchestrator';

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
  // Aliases para compatibilidade com respostas da IA em português
  texto?: string;
  alternativas?: string[];
  resposta_correta?: number | string;
  feedback?: string;
  pergunta?: string;
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean;
  subject?: string;
  schoolYear?: string;
  theme?: string;
  difficultyLevel?: string;
  format?: string;
}

export class QuizInterativoGenerator {
  constructor() {
    console.log('🎯 [QuizInterativoGenerator] Usando LLM Orchestrator v3.0 Enterprise');
  }

  async generateQuizContent(data: QuizInterativoData): Promise<QuizInterativoContent> {
    geminiLogger.logQuizGeneration(data);
    console.log('🎯 Iniciando geração do Quiz Interativo com dados:', data);

    try {
      const prompt = this.buildPrompt(data);
      geminiLogger.logRequest(prompt, { source: 'QuizInterativo', dataLength: JSON.stringify(data).length });
      console.log('📝 Prompt gerado:', prompt);

      const startTime = Date.now();
      const result = await generateContent(prompt, {
        activityType: 'quiz-interativo',
        onProgress: (status) => console.log(`🎯 [QuizInterativo] ${status}`),
      });
      const executionTime = Date.now() - startTime;

      if (!result.success || !result.data) {
        console.warn('⚠️ LLM Orchestrator falhou, usando fallback');
        return this.createFallbackContent(data);
      }

      const response = result.data;
      geminiLogger.logResponse(response, executionTime);
      console.log('📡 Resposta bruta da API:', response);

      const parsedContent = this.parseGeminiResponse(response, data);
      geminiLogger.logQuizParsing(response, parsedContent);
      console.log('✅ Conteúdo processado:', parsedContent);

      // Validar estrutura crítica
      const isValid = !!(parsedContent.questions && parsedContent.questions.length > 0);
      const errors = [];

      if (!parsedContent.questions) errors.push('Nenhuma propriedade questions encontrada');
      if (parsedContent.questions && parsedContent.questions.length === 0) errors.push('Array de questions está vazio');

      geminiLogger.logQuizValidation(parsedContent, isValid, errors);

      if (!isValid) {
        geminiLogger.error('validation', 'Estrutura de Quiz inválida', { parsedContent, errors });
        console.error('❌ Estrutura inválida: sem questões');
        return this.createFallbackContent(data);
      }

      // Garantir compatibilidade completa com o Preview
      const finalContent = this.ensureDataCompatibility(parsedContent, data);
      geminiLogger.logSuccess('Quiz Interativo gerado com sucesso', {
        questionsCount: finalContent.questions.length,
        hasTitle: !!finalContent.title,
        isGeneratedByAI: finalContent.isGeneratedByAI
      });
      console.log('🔄 Dados finais compatíveis:', finalContent);

      return finalContent;

    } catch (error) {
      geminiLogger.logError(error instanceof Error ? error : new Error(String(error)), { source: 'QuizInterativo', data });
      console.error('❌ Erro na geração do Quiz:', error);
      return this.createFallbackContent(data);
    }
  }

  private ensureDataCompatibility(content: QuizInterativoContent, originalData: QuizInterativoData): QuizInterativoContent {
    return {
      ...content,
      title: content.title || originalData.subject + ' - ' + originalData.theme,
      description: content.description || `Quiz sobre ${originalData.theme} para ${originalData.schoolYear}`,
      timePerQuestion: Number(content.timePerQuestion) || Number(originalData.timePerQuestion) || 60,
      totalQuestions: content.questions?.length || 0,
      isGeneratedByAI: true,
      isFallback: false,
      subject: originalData.subject,
      schoolYear: originalData.schoolYear,
      theme: originalData.theme,
      difficultyLevel: originalData.difficultyLevel,
      format: originalData.format,
      questions: content.questions?.map((q, index) => ({
        id: q.id || (index + 1),
        question: q.question || q.texto || `Questão ${index + 1}`,
        type: this.mapQuestionType(originalData.format),
        options: q.options || q.alternativas || [],
        correctAnswer: this.normalizeCorrectAnswer(q.correctAnswer, q.resposta_correta, q.options || q.alternativas || []),
        explanation: q.explanation || q.feedback || `Explicação para a questão ${index + 1}`
      })) || [],
      generatedAt: content.generatedAt || new Date().toISOString()
    };
  }

  private mapQuestionType(format: string): 'multipla-escolha' | 'verdadeiro-falso' {
    if (format?.toLowerCase().includes('verdadeiro') || format?.toLowerCase().includes('falso')) {
      return 'verdadeiro-falso';
    }
    return 'multipla-escolha';
  }

  private normalizeCorrectAnswer(
    correctAnswer: string | undefined,
    resposta_correta: number | string | undefined,
    options: string[]
  ): string {
    // Se já temos correctAnswer como string válida, usar diretamente
    if (typeof correctAnswer === 'string' && correctAnswer.length > 0) {
      return correctAnswer;
    }

    // Se resposta_correta é um índice numérico, pegar a alternativa correspondente
    if (typeof resposta_correta === 'number') {
      const option = options[resposta_correta];
      if (option) {
        return option;
      }
    }

    // Se resposta_correta é uma string, usar diretamente
    if (typeof resposta_correta === 'string' && resposta_correta.length > 0) {
      // Verificar se é um índice em forma de string
      const index = parseInt(resposta_correta);
      if (!isNaN(index) && options[index]) {
        return options[index];
      }
      // Se é uma letra (A, B, C, D), converter para índice
      const letterMap: Record<string, number> = { 'a': 0, 'b': 1, 'c': 2, 'd': 3, 'e': 4 };
      const letter = resposta_correta.toLowerCase().charAt(0);
      if (letterMap[letter] !== undefined && options[letterMap[letter]]) {
        return options[letterMap[letter]];
      }
      // Usar o valor como string diretamente
      return resposta_correta;
    }

    // Fallback: primeira opção ou valor padrão
    return options[0] || 'Opção A';
  }

  private parseGeminiResponse(response: string, originalData: QuizInterativoData): QuizInterativoContent {
    console.log('🔍 Parseando resposta do Gemini...');

    try {
      // Limpar e extrair JSON da resposta
      let cleanResponse = response.trim();

      // Remover markdown e formatação extra
      cleanResponse = cleanResponse.replace(/```json\s*|\s*```/g, '');
      cleanResponse = cleanResponse.replace(/^[^{]*/, '').replace(/[^}]*$/, '');

      // Tentar extrair JSON da resposta
      let jsonMatch = cleanResponse.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        console.warn('⚠️ Nenhum JSON encontrado na resposta');
        return this.createFallbackContent(originalData);
      }

      const jsonStr = jsonMatch[0];
      console.log('📄 JSON extraído:', jsonStr);

      const parsed = JSON.parse(jsonStr);
      console.log('✅ JSON parseado:', parsed);

      // Mapear para o formato esperado
      const questions = this.extractQuestions(parsed);

      if (!questions || questions.length === 0) {
        console.warn('⚠️ Nenhuma questão extraída, usando fallback');
        return this.createFallbackContent(originalData);
      }

      const content: QuizInterativoContent = {
        title: parsed.quiz?.titulo || parsed.titulo || parsed.title || `Quiz: ${originalData.theme}`,
        description: parsed.quiz?.descricao || parsed.descricao || parsed.description || `Quiz sobre ${originalData.theme} para ${originalData.schoolYear}`,
        questions: questions,
        timePerQuestion: parseInt(originalData.timePerQuestion) || 60,
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false,
        subject: originalData.subject,
        schoolYear: originalData.schoolYear,
        theme: originalData.theme,
        difficultyLevel: originalData.difficultyLevel,
        format: originalData.format
      };

      console.log('📦 Conteúdo final parseado:', content);
      return content;

    } catch (error) {
      console.error('❌ Erro ao parsear resposta:', error);
      console.log('📄 Resposta que causou erro:', response);
      return this.createFallbackContent(originalData);
    }
  }

  private extractQuestions(parsed: any): QuizQuestion[] {
    console.log('🔍 Extraindo questões de:', parsed);

    let questionsArray = [];

    // Tentar diferentes estruturas possíveis
    if (parsed.quiz?.perguntas) {
      questionsArray = parsed.quiz.perguntas;
    } else if (parsed.quiz?.questions) {
      questionsArray = parsed.quiz.questions;
    } else if (parsed.perguntas) {
      questionsArray = parsed.perguntas;
    } else if (parsed.questions) {
      questionsArray = parsed.questions;
    } else if (Array.isArray(parsed)) {
      questionsArray = parsed;
    }

    console.log('📋 Array de questões encontrado:', questionsArray);

    return questionsArray.map((q: any, index: number) => ({
      id: q.id || (index + 1),
      question: q.texto || q.question || q.pergunta || `Questão ${index + 1}`,
      type: 'multipla-escolha' as const,
      options: q.alternativas || q.options || q.opcoes || ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
      correctAnswer: this.determineCorrectAnswer(q),
      explanation: q.feedback || q.explanation || q.explicacao || `Explicação da questão ${index + 1}`
    }));
  }

  private determineCorrectAnswer(question: any): string {
    // Se resposta_correta é um índice, pegar a alternativa correspondente
    if (typeof question.resposta_correta === 'number') {
      const options = question.alternativas || question.options || [];
      return options[question.resposta_correta] || options[0] || 'Opção A';
    }

    // Se já é uma string, usar diretamente
    if (typeof question.resposta_correta === 'string') {
      return question.resposta_correta;
    }

    // Se tem correctAnswer
    if (question.correctAnswer) {
      return question.correctAnswer;
    }

    // Fallback para primeira opção
    const options = question.alternativas || question.options || [];
    return options[0] || 'Opção A';
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

    const fallbackQuestions: QuizQuestion[] = Array.from({ length: numQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const isMultipleChoice = data.format !== 'Verdadeiro/Falso' && (data.format === 'Múltipla Escolha' || index % 2 === 0);

      if (isMultipleChoice) {
        return {
          id: questionNumber,
          question: `Questão ${questionNumber}: Sobre ${data.theme} em ${data.subject}, qual conceito é fundamental para o ${data.schoolYear}?`,
          type: 'multipla-escolha',
          options: [
            `A) Conceito básico de ${data.theme}`,
            `B) Aplicação prática de ${data.theme}`,
            `C) Teoria avançada de ${data.theme}`,
            `D) Exercícios sobre ${data.theme}`
          ],
          correctAnswer: `A) Conceito básico de ${data.theme}`,
          explanation: `O conceito básico de ${data.theme} é fundamental para compreender o assunto em ${data.subject}.`
        };
      } else {
        return {
          id: questionNumber,
          question: `Questão ${questionNumber}: É verdade que ${data.theme} é um conteúdo importante para ${data.schoolYear} em ${data.subject}?`,
          type: 'verdadeiro-falso',
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Verdadeiro',
          explanation: `Sim, ${data.theme} é um conteúdo fundamental para o desenvolvimento acadêmico em ${data.subject}.`
        };
      }
    });

    return {
      title: `Quiz Interativo: ${data.theme}`,
      description: `Teste seus conhecimentos sobre ${data.theme} com este quiz interativo! Descubra se você domina os conceitos e aplicações deste importante conteúdo de ${data.subject}.`,
      questions: fallbackQuestions,
      timePerQuestion,
      totalQuestions: numQuestions,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };
  }

  private buildPrompt(data: QuizInterativoData): string {
    return `
Você é um gerador de quizzes educativos especializados. Crie um quiz sobre "${data.theme}" para ${data.schoolYear} na disciplina ${data.subject}.

ESPECIFICAÇÕES OBRIGATÓRIAS:
- Número de questões: ${data.numberOfQuestions}
- Nível de dificuldade: ${data.difficultyLevel}  
- Formato: ${data.format}
- Tema específico: ${data.theme}
- Disciplina: ${data.subject}
- Público-alvo: ${data.schoolYear}

REGRAS CRÍTICAS:
1. Retorne APENAS JSON válido, sem markdown, sem texto extra
2. Use EXATAMENTE o formato especificado abaixo
3. Questões adequadas ao nível "${data.schoolYear}"
4. Todas as alternativas devem ser plausíveis
5. resposta_correta = índice numérico (0, 1, 2, 3)

FORMATO OBRIGATÓRIO (COPIE EXATAMENTE):
{
  "quiz": {
    "titulo": "Quiz: ${data.theme} - ${data.subject}",
    "descricao": "Avalie seus conhecimentos sobre ${data.theme}",
    "perguntas": [
      {
        "id": 1,
        "texto": "Pergunta sobre ${data.theme}?",
        "alternativas": ["Primeira opção correta sobre o tema", "Segunda opção plausível mas incorreta", "Terceira opção relacionada ao conteúdo", "Quarta opção do exercício"],
        "resposta_correta": 0,
        "feedback": "Explicação educativa"
      }
    ]
  }
}

VALIDAÇÕES:
- Sempre 4 alternativas por questão
- resposta_correta = número (0, 1, 2 ou 3)
- Linguagem adequada para ${data.schoolYear}
- Conteúdo focado em: ${data.theme}
- Nível de dificuldade: ${data.difficultyLevel}

Gere ${data.numberOfQuestions} questões seguindo essas especificações.
`;
  }
}