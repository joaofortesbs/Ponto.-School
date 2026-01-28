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
  // Campos alternativos que podem vir da IA (para compatibilidade)
  texto?: string;
  alternativas?: string[];
  resposta_correta?: number | string;
  feedback?: string;
}

interface QuizInterativoContent {
  title: string;
  description: string;
  questions: QuizQuestion[];
  timePerQuestion: number;
  totalQuestions: number;
  generatedAt?: string;
  isGeneratedByAI: boolean;
  isFallback?: boolean;
  subject?: string;
  schoolYear?: string;
  theme?: string;
  difficultyLevel?: string;
  format?: string;
}

export class QuizInterativoGenerator {
  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';

    if (!this.apiKey) {
      console.warn('⚠️ API Key do Gemini não configurada para Quiz Interativo');
    }
  }

  async generateQuizContent(data: QuizInterativoData): Promise<QuizInterativoContent> {
    geminiLogger.logQuizGeneration(data);
    console.log('🎯 Iniciando geração do Quiz Interativo com dados:', data);

    if (!this.apiKey) {
      geminiLogger.warn('request', 'API Key não disponível para Quiz Interativo');
      console.warn('🔑 API Key não disponível, usando fallback');
      return this.createFallbackContent(data);
    }

    try {
      const prompt = this.buildPrompt(data);
      geminiLogger.logRequest(prompt, { source: 'QuizInterativo', dataLength: JSON.stringify(data).length });
      console.log('📝 Prompt gerado:', prompt);

      const startTime = Date.now();
      const response = await this.callGeminiAPI(prompt);
      const executionTime = Date.now() - startTime;

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
        correctAnswer: q.correctAnswer || q.resposta_correta || (q.options?.[0] || 'Opção A'),
        explanation: q.explanation || q.feedback || `Explicação para a questão ${index + 1}`
      })) || []
    };
  }

  private mapQuestionType(format: string): 'multipla-escolha' | 'verdadeiro-falso' {
    if (format?.toLowerCase().includes('verdadeiro') || format?.toLowerCase().includes('falso')) {
      return 'verdadeiro-falso';
    }
    return 'multipla-escolha';
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

      const content = {
        title: parsed.quiz?.titulo || parsed.titulo || parsed.title || `Quiz: ${originalData.theme}`,
        description: parsed.quiz?.descricao || parsed.descricao || parsed.description || `Quiz sobre ${originalData.theme} para ${originalData.schoolYear}`,
        questions: questions,
        timePerQuestion: parseInt(originalData.timePerQuestion) || 60,
        totalQuestions: questions.length,
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

  /**
   * Detecta se um texto contém instruções de prompt do usuário ao invés de conteúdo educacional real
   */
  private containsUserPromptPatterns(text: string): boolean {
    if (!text || typeof text !== 'string') return false;
    
    const promptPatterns = [
      /^criar\s+(as\s+)?próximas?\s+atividades?/i,
      /^fazer\s+(as\s+)?próximas?\s+atividades?/i,
      /^gerar\s+(as\s+)?atividades?/i,
      /^preciso\s+(de\s+)?atividades?/i,
      /^quero\s+(criar|fazer|gerar)/i,
      /próximas?\s+atividades?\s+sobre/i,
      /conceito\s+de\s+criar\s+as\s+próximas?/i,
      /aplicação\s+prática\s+de\s+criar/i,
      /teoria\s+avançada\s+de\s+criar/i,
      /exercícios\s+sobre\s+criar\s+as/i
    ];
    
    return promptPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Valida uma questão para garantir que não contém prompts do usuário
   * Retorna true se a questão é válida (não contém prompts)
   */
  private isValidQuestion(question: any): boolean {
    const questionText = question.texto || question.question || question.pergunta || '';
    const options = question.alternativas || question.options || question.opcoes || [];
    
    // Verificar se a questão contém padrões de prompt
    if (this.containsUserPromptPatterns(questionText)) {
      console.warn(`⚠️ [QuizGenerator] Questão inválida detectada (contém prompt): "${questionText.substring(0, 50)}..."`);
      return false;
    }
    
    // Verificar se alguma opção contém padrões de prompt
    for (const option of options) {
      if (typeof option === 'string' && this.containsUserPromptPatterns(option)) {
        console.warn(`⚠️ [QuizGenerator] Opção inválida detectada (contém prompt): "${option.substring(0, 50)}..."`);
        return false;
      }
    }
    
    return true;
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

    // Filtrar questões inválidas que contêm prompts do usuário
    const validQuestions = questionsArray.filter((q: any) => this.isValidQuestion(q));
    
    if (validQuestions.length < questionsArray.length) {
      console.warn(`⚠️ [QuizGenerator] ${questionsArray.length - validQuestions.length} questões removidas por conter prompts do usuário`);
    }
    
    if (validQuestions.length === 0) {
      console.warn('⚠️ [QuizGenerator] Nenhuma questão válida encontrada após validação');
      return [];
    }

    return validQuestions.map((q: any, index: number) => ({
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


  /**
   * Sanitiza o tema para remover instruções de comando do usuário
   * Detecta quando o tema é na verdade um prompt do usuário
   */
  private sanitizeTheme(theme: string, subject: string): string {
    if (!theme || theme.length < 3) {
      return this.getDefaultThemeForSubject(subject);
    }
    
    // Padrões que indicam que o "tema" é na verdade uma instrução do usuário
    const instructionPatterns = [
      /^criar\s+/i,
      /^fazer\s+/i,
      /^gerar\s+/i,
      /^preciso\s+/i,
      /^quero\s+/i,
      /^desenvolver\s+/i,
      /^próximas?\s+atividades?/i,
      /^atividades?\s+(de|sobre|para)/i
    ];
    
    const isInstruction = instructionPatterns.some(pattern => pattern.test(theme));
    
    if (isInstruction) {
      // Tentar extrair o tema real de dentro de aspas
      const quotedMatch = theme.match(/[""''"]([^"""''']+)[""''']/);
      if (quotedMatch && quotedMatch[1] && quotedMatch[1].length >= 5) {
        const extractedTheme = quotedMatch[1].trim();
        console.log(`🔧 [QuizGenerator] Tema extraído de aspas: "${extractedTheme}"`);
        return extractedTheme.charAt(0).toUpperCase() + extractedTheme.slice(1);
      }
      
      // Tentar extrair após "sobre" ou "tema"
      const aboutMatch = theme.match(/(?:sobre\s+o\s+tema|sobre|tema)\s*[:""]?\s*([^"!?.]+)/i);
      if (aboutMatch && aboutMatch[1] && aboutMatch[1].length >= 5) {
        const extractedTheme = aboutMatch[1].trim().replace(/[!?.]+$/, '');
        console.log(`🔧 [QuizGenerator] Tema extraído após 'sobre': "${extractedTheme}"`);
        return extractedTheme.charAt(0).toUpperCase() + extractedTheme.slice(1);
      }
      
      // Se não conseguiu extrair, usar tema padrão para a disciplina
      console.log(`⚠️ [QuizGenerator] Tema é uma instrução, usando padrão para ${subject}`);
      return this.getDefaultThemeForSubject(subject);
    }
    
    return theme;
  }
  
  private getDefaultThemeForSubject(subject: string): string {
    const defaultThemes: Record<string, string> = {
      'Matemática': 'Operações com Números Inteiros',
      'Língua Portuguesa': 'Interpretação de Textos',
      'Português': 'Interpretação de Textos',
      'Ciências': 'O Corpo Humano e seus Sistemas',
      'História': 'Brasil Colonial',
      'Geografia': 'Regiões Brasileiras',
      'Arte': 'Expressão Artística',
      'Educação Física': 'Práticas Esportivas',
      'Inglês': 'Basic Vocabulary'
    };
    return defaultThemes[subject] || 'Conhecimentos Gerais';
  }

  private validateInputData(data: QuizInterativoData): QuizInterativoData {
    const sanitizedTheme = this.sanitizeTheme(data.theme, data.subject || 'Matemática');
    
    return {
      subject: data.subject?.trim() || 'Matemática',
      schoolYear: data.schoolYear?.trim() || '6º Ano - Ensino Fundamental',
      theme: sanitizedTheme,
      objectives: data.objectives?.trim() || 'Testar conhecimentos sobre o tema',
      difficultyLevel: data.difficultyLevel?.trim() || 'Médio',
      format: data.format?.trim() || 'Múltipla Escolha',
      numberOfQuestions: data.numberOfQuestions?.trim() || '10',
      timePerQuestion: data.timePerQuestion?.trim() || '60',
      instructions: data.instructions?.trim() || 'Leia cada questão atentamente e selecione a resposta correta.',
      evaluation: data.evaluation?.trim() || 'Pontuação baseada no número de acertos.'
    };
  }

  /**
   * Gera questões de fallback educacionais REAIS baseadas no tema e disciplina
   * Evita completamente ecoar instruções do usuário
   */
  private createFallbackContent(data: QuizInterativoData): QuizInterativoContent {
    const numQuestions = parseInt(data.numberOfQuestions) || 5;
    const timePerQuestion = parseInt(data.timePerQuestion) || 60;
    
    // Sanitizar o tema mais uma vez para garantir que não contém instruções
    const cleanTheme = this.sanitizeTheme(data.theme, data.subject);
    
    // Banco de questões educacionais por disciplina
    const questionBanks = this.getQuestionBankForSubject(data.subject, cleanTheme);
    
    const fallbackQuestions: QuizQuestion[] = Array.from({ length: numQuestions }, (_, index) => {
      const questionNumber = index + 1;
      const isMultipleChoice = data.format !== 'Verdadeiro/Falso' && (data.format === 'Múltipla Escolha' || index % 2 === 0);
      
      // Selecionar questão do banco (circular se necessário)
      const bankIndex = index % questionBanks.length;
      const bankQuestion = questionBanks[bankIndex];

      if (isMultipleChoice) {
        return {
          id: questionNumber,
          question: bankQuestion.question,
          type: 'multipla-escolha' as const,
          options: bankQuestion.options,
          correctAnswer: bankQuestion.correctAnswer,
          explanation: bankQuestion.explanation
        };
      } else {
        return {
          id: questionNumber,
          question: bankQuestion.trueFalseQuestion || `${cleanTheme} é um conteúdo importante para o desenvolvimento acadêmico em ${data.subject}?`,
          type: 'verdadeiro-falso' as const,
          options: ['Verdadeiro', 'Falso'],
          correctAnswer: 'Verdadeiro',
          explanation: bankQuestion.trueFalseExplanation || `Sim, ${cleanTheme} é um tema fundamental para o aprendizado em ${data.subject}.`
        };
      }
    });

    return {
      title: `Quiz Interativo: ${cleanTheme}`,
      description: `Teste seus conhecimentos sobre ${cleanTheme}! Este quiz avalia sua compreensão sobre conceitos fundamentais de ${data.subject}.`,
      questions: fallbackQuestions,
      timePerQuestion,
      totalQuestions: numQuestions,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true,
      subject: data.subject,
      schoolYear: data.schoolYear,
      theme: cleanTheme,
      difficultyLevel: data.difficultyLevel,
      format: data.format
    };
  }
  
  /**
   * Retorna um banco de questões educacionais reais baseadas na disciplina e tema
   */
  private getQuestionBankForSubject(subject: string, theme: string): Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
    trueFalseQuestion?: string;
    trueFalseExplanation?: string;
  }> {
    const subjectLower = subject.toLowerCase();
    
    // Questões específicas por disciplina
    if (subjectLower.includes('história')) {
      return [
        {
          question: `Qual foi um dos principais acontecimentos relacionados a ${theme} no Brasil?`,
          options: ['A) A chegada dos portugueses ao Brasil', 'B) A independência do Brasil', 'C) A proclamação da República', 'D) O descobrimento das minas de ouro'],
          correctAnswer: 'A) A chegada dos portugueses ao Brasil',
          explanation: `A chegada dos portugueses em 1500 foi um marco histórico fundamental para o tema ${theme}.`,
          trueFalseQuestion: `O estudo de ${theme} é importante para compreender a formação histórica do Brasil?`,
          trueFalseExplanation: `Sim, ${theme} é essencial para entender a história brasileira e suas transformações.`
        },
        {
          question: `Em relação a ${theme}, qual período histórico é mais relevante para seu estudo?`,
          options: ['A) Brasil Colonial (1500-1822)', 'B) Era das Grandes Navegações', 'C) Período Imperial', 'D) Era Vargas'],
          correctAnswer: 'A) Brasil Colonial (1500-1822)',
          explanation: `O período colonial é fundamental para compreender ${theme} no contexto brasileiro.`
        },
        {
          question: `Qual foi a principal consequência de ${theme} para a sociedade da época?`,
          options: ['A) Mudanças na organização social', 'B) Desenvolvimento econômico isolado', 'C) Estagnação cultural', 'D) Nenhuma mudança significativa'],
          correctAnswer: 'A) Mudanças na organização social',
          explanation: `${theme} provocou transformações importantes na sociedade colonial brasileira.`
        }
      ];
    }
    
    if (subjectLower.includes('matemática')) {
      return [
        {
          question: `Qual operação matemática é fundamental para resolver problemas sobre ${theme}?`,
          options: ['A) Adição e subtração', 'B) Multiplicação e divisão', 'C) Potenciação', 'D) Todas as anteriores'],
          correctAnswer: 'D) Todas as anteriores',
          explanation: `Diferentes operações matemáticas podem ser necessárias dependendo do problema específico sobre ${theme}.`,
          trueFalseQuestion: `A matemática é importante para resolver problemas do dia a dia relacionados a ${theme}?`,
          trueFalseExplanation: `Sim, a matemática está presente em diversas situações cotidianas.`
        },
        {
          question: `Ao estudar ${theme}, qual habilidade matemática é mais desenvolvida?`,
          options: ['A) Raciocínio lógico', 'B) Memorização de fórmulas', 'C) Cálculo mental', 'D) Interpretação de gráficos'],
          correctAnswer: 'A) Raciocínio lógico',
          explanation: `O raciocínio lógico é a base para compreender e aplicar conceitos de ${theme}.`
        }
      ];
    }
    
    if (subjectLower.includes('português') || subjectLower.includes('língua portuguesa')) {
      return [
        {
          question: `Em textos sobre ${theme}, qual elemento é essencial para a compreensão?`,
          options: ['A) Identificação do tema central', 'B) Contagem de palavras', 'C) Análise de pontuação apenas', 'D) Leitura superficial'],
          correctAnswer: 'A) Identificação do tema central',
          explanation: `Identificar o tema central é fundamental para interpretar corretamente textos sobre ${theme}.`,
          trueFalseQuestion: `A interpretação de texto é uma habilidade importante para compreender ${theme}?`,
          trueFalseExplanation: `Sim, a interpretação textual permite compreender informações sobre qualquer tema.`
        },
        {
          question: `Qual recurso linguístico pode ser usado para enriquecer um texto sobre ${theme}?`,
          options: ['A) Uso de sinônimos e expressões variadas', 'B) Repetição excessiva de palavras', 'C) Uso de gírias apenas', 'D) Ausência de conectivos'],
          correctAnswer: 'A) Uso de sinônimos e expressões variadas',
          explanation: `Sinônimos e expressões variadas tornam o texto mais rico e interessante.`
        }
      ];
    }
    
    if (subjectLower.includes('ciência')) {
      return [
        {
          question: `Qual é a importância de ${theme} para a ciência?`,
          options: ['A) Permite compreender fenômenos naturais', 'B) Não tem aplicação prática', 'C) É apenas teórico', 'D) Só serve para provas'],
          correctAnswer: 'A) Permite compreender fenômenos naturais',
          explanation: `O estudo de ${theme} ajuda a entender como a natureza funciona.`,
          trueFalseQuestion: `O estudo de ${theme} contribui para o avanço do conhecimento científico?`,
          trueFalseExplanation: `Sim, cada área de estudo contribui para o desenvolvimento científico geral.`
        }
      ];
    }
    
    // Questões genéricas de qualidade para outras disciplinas
    return [
      {
        question: `Qual é a principal característica de ${theme} em ${subject}?`,
        options: ['A) Contribui para o desenvolvimento do conhecimento', 'B) É irrelevante para o aprendizado', 'C) Não possui aplicação prática', 'D) É um tema ultrapassado'],
        correctAnswer: 'A) Contribui para o desenvolvimento do conhecimento',
        explanation: `${theme} é um tema relevante que contribui para a formação acadêmica em ${subject}.`,
        trueFalseQuestion: `O estudo de ${theme} é importante para a formação acadêmica?`,
        trueFalseExplanation: `Sim, ${theme} é um tema relevante que contribui para o conhecimento em ${subject}.`
      },
      {
        question: `Por que estudar ${theme} é importante para alunos?`,
        options: ['A) Desenvolve pensamento crítico', 'B) Serve apenas para avaliações', 'C) Não tem utilidade', 'D) É obrigatório apenas'],
        correctAnswer: 'A) Desenvolve pensamento crítico',
        explanation: `Estudar ${theme} ajuda a desenvolver habilidades de análise e pensamento crítico.`
      },
      {
        question: `Como o conhecimento sobre ${theme} pode ser aplicado na vida cotidiana?`,
        options: ['A) Em diversas situações práticas', 'B) Apenas em provas escolares', 'C) Somente em laboratórios', 'D) Não tem aplicação prática'],
        correctAnswer: 'A) Em diversas situações práticas',
        explanation: `O conhecimento sobre ${theme} tem aplicações práticas importantes no dia a dia.`
      }
    ];
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
        "alternativas": ["Alternativa A", "Alternativa B", "Alternativa C", "Alternativa D"],
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

}