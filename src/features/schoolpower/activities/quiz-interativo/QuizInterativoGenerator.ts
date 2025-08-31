
import { geminiLogger } from '@/utils/geminiDebugLogger';

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
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export class QuizInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
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
    const numQuestions = parseInt(data.numberOfQuestions) || 10;
    
    return `
Você é um especialista em educação brasileira. Crie ${numQuestions} questões de quiz sobre "${data.theme}" para ${data.subject}, ${data.schoolYear}.

**CONTEXTO EDUCACIONAL:**
- Disciplina: ${data.subject}
- Ano/Série: ${data.schoolYear}
- Tema Central: ${data.theme}
- Objetivos: ${data.objectives}
- Nível: ${data.difficultyLevel}
- Formato: ${data.format}

**ESPECIFICAÇÕES DAS QUESTÕES:**

${data.format === 'Múltipla Escolha' ? `
Crie ${numQuestions} questões de múltipla escolha com:
- 4 alternativas por questão (A, B, C, D)
- Apenas 1 alternativa correta
- Explicação educativa para cada resposta
` : data.format === 'Verdadeiro/Falso' ? `
Crie ${numQuestions} questões verdadeiro/falso sobre ${data.theme}:
- Afirmações claras sobre conceitos do tema
- Explicação do porquê é verdadeiro ou falso
` : `
Crie ${numQuestions} questões mistas:
- 50% múltipla escolha (4 alternativas A,B,C,D)
- 50% verdadeiro/falso
- Varie os tipos alternadamente
`}

**DIRETRIZES PEDAGÓGICAS:**
- Use linguagem apropriada para ${data.schoolYear}
- Foque em ${data.theme} especificamente
- Nivel ${data.difficultyLevel} de dificuldade
- Questões que desenvolvam ${data.objectives}

**RETORNE APENAS ESTE JSON (sem texto extra):**

{
  "title": "Quiz Interativo: ${data.theme}",
  "description": "Teste seus conhecimentos sobre ${data.theme}",
  "questions": [
    {
      "id": 1,
      "question": "texto da questão",
      "type": "multipla-escolha",
      "options": ["A) primeira opção", "B) segunda opção", "C) terceira opção", "D) quarta opção"],
      "correctAnswer": "A) primeira opção",
      "explanation": "explicação clara"
    }
  ]
}`;
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
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192,
      }
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`Erro na API do Gemini: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content) {
      throw new Error('Resposta inválida da API do Gemini');
    }

    return data.candidates[0].content.parts[0].text;
  }

  private parseResponse(response: string, originalData: QuizInterativoData): QuizInterativoContent {
    try {
      geminiLogger.logInfo('🔍 Processando resposta do Gemini', { 
        responseLength: response.length,
        responsePreview: response.substring(0, 200),
        originalData 
      });

      // Limpeza mais robusta da resposta
      let cleanResponse = response.trim();
      
      // Remover markdown code blocks
      cleanResponse = cleanResponse.replace(/^```json\s*/gi, '').replace(/\s*```$/g, '');
      cleanResponse = cleanResponse.replace(/^```\s*/g, '').replace(/\s*```$/g, '');
      
      // Remover texto antes do JSON
      const jsonStart = cleanResponse.indexOf('{');
      const jsonEnd = cleanResponse.lastIndexOf('}');
      
      if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {
        cleanResponse = cleanResponse.substring(jsonStart, jsonEnd + 1);
      }

      geminiLogger.logInfo('🧹 Resposta limpa para parsing', { 
        cleanResponse: cleanResponse.substring(0, 500) + '...',
        length: cleanResponse.length 
      });

      const parsed = JSON.parse(cleanResponse);

      // Validar estrutura básica
      if (!parsed.questions || !Array.isArray(parsed.questions) || parsed.questions.length === 0) {
        geminiLogger.logError('❌ Estrutura de resposta inválida ou sem questões', parsed);
        throw new Error('Resposta não contém questões válidas');
      }

      // Processar questões com validação robusta
      const questions: QuizQuestion[] = parsed.questions.map((q: any, index: number) => {
        const questionId = index + 1;
        
        // Determinar tipo da questão
        let questionType: 'multipla-escolha' | 'verdadeiro-falso' = 'multipla-escolha';
        
        if (q.type === 'verdadeiro-falso' || q.tipo === 'verdadeiro-falso' || 
            (q.options && q.options.length === 2 && 
             q.options.some((opt: string) => opt.toLowerCase().includes('verdadeiro')) &&
             q.options.some((opt: string) => opt.toLowerCase().includes('falso')))) {
          questionType = 'verdadeiro-falso';
        }

        // Processar opções
        let processedOptions: string[] = [];
        if (questionType === 'multipla-escolha') {
          processedOptions = q.options || q.opcoes || q.alternativas || [
            `A) Conceito básico de ${originalData.theme}`,
            `B) Aplicação prática de ${originalData.theme}`,
            `C) Teoria avançada de ${originalData.theme}`,
            `D) Exercícios sobre ${originalData.theme}`
          ];
        } else {
          processedOptions = ['Verdadeiro', 'Falso'];
        }

        // Garantir resposta correta válida
        let correctAnswer = q.correctAnswer || q.respostaCorreta || q.resposta;
        if (!correctAnswer || !processedOptions.includes(correctAnswer)) {
          correctAnswer = processedOptions[0];
        }

        const processedQuestion: QuizQuestion = {
          id: questionId,
          question: q.question || q.pergunta || q.enunciado || `Questão ${questionId}: Sobre ${originalData.theme} em ${originalData.subject}, qual conceito é fundamental para o ${originalData.schoolYear}?`,
          type: questionType,
          options: processedOptions,
          correctAnswer: correctAnswer,
          explanation: q.explanation || q.explicacao || q.justificativa || `O conceito correto de ${originalData.theme} é fundamental para compreender o assunto em ${originalData.subject}.`
        };

        geminiLogger.logInfo(`✅ Questão ${questionId} processada`, processedQuestion);
        return processedQuestion;
      });

      // Processar tempo por questão
      let timePerQuestion = 60; // padrão
      const timeInput = originalData.timePerQuestion?.toString().replace(/\D/g, '');
      if (timeInput && !isNaN(parseInt(timeInput))) {
        timePerQuestion = parseInt(timeInput);
      }

      const result: QuizInterativoContent = {
        title: parsed.title || `Quiz Interativo: ${originalData.theme}`,
        description: parsed.description || `Teste seus conhecimentos sobre ${originalData.theme} com este quiz interativo! Descubra se você domina os conceitos e aplicações deste importante conteúdo de ${originalData.subject}.`,
        questions,
        timePerQuestion,
        totalQuestions: questions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true
      };

      // Log final para debug
      geminiLogger.logSuccess('✅ Conteúdo final processado com sucesso', {
        title: result.title,
        totalQuestions: result.totalQuestions,
        timePerQuestion: result.timePerQuestion,
        questionsTypes: result.questions.map(q => q.type),
        firstQuestionPreview: result.questions[0]
      });
      
      return result;

    } catch (error) {
      geminiLogger.logError('❌ Erro crítico no parsing da resposta', { error, response: response.substring(0, 300) });
      return this.createFallbackContent(originalData);
    }
  }
}
