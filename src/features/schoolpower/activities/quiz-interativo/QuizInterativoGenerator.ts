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
    console.log('🔍 [QuizInterativoGenerator] ====== PARSING ROBUSTO v2.0 ======');
    console.log('🔍 [QuizInterativoGenerator] Resposta bruta (primeiros 500 chars):', response?.substring(0, 500));

    try {
      let cleanedResponse = response.trim();
      
      // PASSO 1: Remover blocos de código markdown (múltiplos formatos)
      cleanedResponse = cleanedResponse
        .replace(/^```json\s*/i, '')
        .replace(/^```\s*/i, '')
        .replace(/\s*```$/i, '')
        .replace(/```json/gi, '')
        .replace(/```/g, '');
      
      // PASSO 2: Extrair primeiro bloco JSON válido usando bracket matching
      const extracted = this.extractFirstValidJSON(cleanedResponse);
      
      if (!extracted) {
        console.error('❌ [QuizInterativoGenerator] Nenhum JSON válido encontrado');
        return this.createFallbackContent(originalData);
      }
      
      cleanedResponse = extracted.json;
      console.log(`🧹 [QuizInterativoGenerator] ${extracted.isArray ? 'Array' : 'Objeto'} JSON extraído, tamanho:`, cleanedResponse.length);

      // PASSO 3: Limpar caracteres problemáticos que quebram o JSON
      cleanedResponse = cleanedResponse
        .replace(/[\x00-\x1F\x7F]/g, ' ')  // Remove caracteres de controle
        .replace(/\n\s*\n/g, ' ')          // Remove linhas em branco múltiplas
        .replace(/,\s*}/g, '}')            // Remove vírgulas antes de }
        .replace(/,\s*]/g, ']')            // Remove vírgulas antes de ]
        .replace(/"\s*:\s*undefined/g, '": null')  // Substitui undefined por null
        .replace(/"\s*:\s*NaN/g, '": 0');  // Substitui NaN por 0

      console.log('📝 [QuizInterativoGenerator] JSON limpo (primeiros 300 chars):', cleanedResponse.substring(0, 300));

      let parsed = JSON.parse(cleanedResponse);
      console.log('✅ [QuizInterativoGenerator] JSON parseado com sucesso!');
      
      // PASSO 4: Tratar array na raiz (quando IA retorna array direto de questões)
      if (Array.isArray(parsed) || extracted.isArray) {
        console.log('🔄 [QuizInterativoGenerator] Resposta é array, convertendo para objeto...');
        parsed = {
          titulo: `Quiz: ${originalData.theme}`,
          perguntas: Array.isArray(parsed) ? parsed : []
        };
      }

      // Mapear para o formato esperado
      const questions = this.extractQuestions(parsed, originalData);
      
      // PASSO 5: Validar questões extraídas
      const validQuestions = questions.filter(q => 
        q.question && q.question.length >= 5 && 
        q.options && q.options.length >= 2
      );
      
      console.log(`🔍 [QuizInterativoGenerator] Questões válidas: ${validQuestions.length}/${questions.length}`);

      if (validQuestions.length === 0) {
        console.warn('⚠️ [QuizInterativoGenerator] Nenhuma questão válida, usando fallback');
        return this.createFallbackContent(originalData);
      }

      const content: QuizInterativoContent = {
        title: parsed.quiz?.titulo || parsed.titulo || parsed.title || `Quiz: ${originalData.theme}`,
        description: parsed.quiz?.descricao || parsed.descricao || parsed.description || `Quiz sobre ${originalData.theme} para ${originalData.schoolYear}`,
        questions: validQuestions,
        timePerQuestion: parseInt(originalData.timePerQuestion) || 60,
        totalQuestions: validQuestions.length,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false,
        subject: originalData.subject,
        schoolYear: originalData.schoolYear,
        theme: originalData.theme,
        difficultyLevel: originalData.difficultyLevel,
        format: originalData.format
      };

      console.log('📦 [QuizInterativoGenerator] Conteúdo final:', {
        title: content.title,
        questionsCount: content.questions.length,
        firstQuestion: content.questions[0]?.question?.substring(0, 80)
      });
      
      return content;

    } catch (error) {
      console.error('❌ [QuizInterativoGenerator] Erro ao parsear resposta:', error);
      console.log('📄 [QuizInterativoGenerator] Resposta que causou erro:', response?.substring(0, 500));
      return this.createFallbackContent(originalData);
    }
  }

  private extractFirstValidJSON(text: string): { json: string; isArray: boolean } | null {
    // Buscar TODOS os blocos JSON possíveis e selecionar o que contém perguntas/questions
    const allObjects = this.findAllMatchingBrackets(text, '{', '}');
    const allArrays = this.findAllMatchingBrackets(text, '[', ']');
    
    // Primeiro: tentar encontrar objeto com "perguntas" ou "questions"
    for (const obj of allObjects) {
      if (obj.content.includes('"perguntas"') || obj.content.includes('"questions"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado objeto com "perguntas/questions"');
        return { json: obj.content, isArray: false };
      }
    }
    
    // Segundo: tentar encontrar objeto com "texto" ou "question" (provavelmente questões)
    for (const obj of allObjects) {
      if (obj.content.includes('"texto"') || obj.content.includes('"question"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado objeto com "texto/question"');
        return { json: obj.content, isArray: false };
      }
    }
    
    // Terceiro: tentar encontrar array com objetos de questões
    for (const arr of allArrays) {
      if (arr.content.includes('"texto"') || arr.content.includes('"question"')) {
        console.log('🎯 [extractFirstValidJSON] Encontrado array com questões');
        return { json: arr.content, isArray: true };
      }
    }
    
    // Fallback: primeiro bloco encontrado
    if (allObjects.length > 0) {
      console.log('⚠️ [extractFirstValidJSON] Usando primeiro objeto encontrado');
      return { json: allObjects[0].content, isArray: false };
    }
    
    if (allArrays.length > 0) {
      console.log('⚠️ [extractFirstValidJSON] Usando primeiro array encontrado');
      return { json: allArrays[0].content, isArray: true };
    }
    
    return null;
  }
  
  private findAllMatchingBrackets(text: string, open: string, close: string): { start: number; content: string }[] {
    const results: { start: number; content: string }[] = [];
    let searchStart = 0;
    
    while (searchStart < text.length) {
      const match = this.findMatchingBracketsFrom(text, open, close, searchStart);
      if (!match) break;
      results.push(match);
      searchStart = match.start + match.content.length;
    }
    
    return results;
  }
  
  private findMatchingBracketsFrom(text: string, open: string, close: string, fromIndex: number): { start: number; content: string } | null {
    const start = text.indexOf(open, fromIndex);
    if (start === -1) return null;
    
    let depth = 0;
    let inString = false;
    let escapeNext = false;
    
    for (let i = start; i < text.length; i++) {
      const char = text[i];
      
      if (escapeNext) {
        escapeNext = false;
        continue;
      }
      
      if (char === '\\') {
        escapeNext = true;
        continue;
      }
      
      if (char === '"') {
        inString = !inString;
        continue;
      }
      
      if (inString) continue;
      
      if (char === open) {
        depth++;
      } else if (char === close) {
        depth--;
        if (depth === 0) {
          return { start, content: text.substring(start, i + 1) };
        }
      }
    }
    
    return null;
  }

  private extractQuestions(parsed: any, originalData?: QuizInterativoData): QuizQuestion[] {
    console.log('🔍 [QuizInterativoGenerator] Extraindo questões de:', parsed);

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
    console.log('🔄 [QuizInterativoGenerator] ====== CRIANDO FALLBACK CONTEXTUALIZADO ======');
    console.log('🔄 [QuizInterativoGenerator] Disciplina:', data.subject, '| Tema:', data.theme);
    
    const numQuestions = parseInt(data.numberOfQuestions) || 5;
    const timePerQuestion = parseInt(data.timePerQuestion) || 60;

    // Banco de questões contextualizadas por disciplina
    const questionBank = this.getContextualizedQuestionBank(data.subject, data.theme, data.schoolYear);
    
    // Selecionar questões do banco até atingir o número desejado
    const fallbackQuestions: QuizQuestion[] = [];
    for (let i = 0; i < numQuestions; i++) {
      const questionIndex = i % questionBank.length;
      const baseQuestion = questionBank[questionIndex];
      
      fallbackQuestions.push({
        id: i + 1,
        question: baseQuestion.question,
        type: 'multipla-escolha' as const,
        options: baseQuestion.options,
        correctAnswer: baseQuestion.correctAnswer,
        explanation: baseQuestion.explanation
      });
    }

    console.log('✅ [QuizInterativoGenerator] Fallback gerado com', fallbackQuestions.length, 'questões contextualizadas');

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

  private getContextualizedQuestionBank(subject: string, theme: string, schoolYear: string): Array<{
    question: string;
    options: string[];
    correctAnswer: string;
    explanation: string;
  }> {
    const subjectLower = subject.toLowerCase();
    
    // Banco de questões por disciplina
    if (subjectLower.includes('matemática') || subjectLower.includes('math')) {
      return [
        {
          question: `Qual é o resultado de 3/4 + 1/4?`,
          options: ['1', '2/4', '4/8', '3/8'],
          correctAnswer: '1',
          explanation: 'Quando somamos frações com denominadores iguais, somamos apenas os numeradores: 3/4 + 1/4 = 4/4 = 1'
        },
        {
          question: 'Qual número é primo?',
          options: ['17', '15', '21', '9'],
          correctAnswer: '17',
          explanation: '17 é primo porque só é divisível por 1 e por ele mesmo. Os outros números têm outros divisores.'
        },
        {
          question: 'Quanto é 25% de 200?',
          options: ['50', '25', '75', '100'],
          correctAnswer: '50',
          explanation: '25% de 200 = 0,25 × 200 = 50'
        },
        {
          question: 'Qual é a área de um quadrado com lado 5cm?',
          options: ['25 cm²', '20 cm²', '10 cm²', '15 cm²'],
          correctAnswer: '25 cm²',
          explanation: 'Área do quadrado = lado × lado = 5 × 5 = 25 cm²'
        },
        {
          question: 'Qual é o valor de x em: 2x + 6 = 10?',
          options: ['2', '3', '4', '8'],
          correctAnswer: '2',
          explanation: '2x + 6 = 10 → 2x = 4 → x = 2'
        }
      ];
    }
    
    if (subjectLower.includes('português') || subjectLower.includes('língua portuguesa')) {
      return [
        {
          question: 'Qual é a classe gramatical da palavra "rapidamente"?',
          options: ['Advérbio', 'Adjetivo', 'Substantivo', 'Verbo'],
          correctAnswer: 'Advérbio',
          explanation: 'Palavras terminadas em "-mente" que modificam verbos são advérbios de modo.'
        },
        {
          question: 'Em "O menino correu para a escola", qual é o sujeito?',
          options: ['O menino', 'correu', 'para a escola', 'escola'],
          correctAnswer: 'O menino',
          explanation: 'O sujeito é quem pratica a ação do verbo. Quem correu? O menino.'
        },
        {
          question: 'Qual palavra está escrita corretamente?',
          options: ['Exceção', 'Excessão', 'Exeção', 'Excesão'],
          correctAnswer: 'Exceção',
          explanation: 'Exceção se escreve com "ç" e apenas um "s".'
        },
        {
          question: 'Qual é o plural de "cidadão"?',
          options: ['Cidadãos', 'Cidadões', 'Cidadães', 'Cidadãoes'],
          correctAnswer: 'Cidadãos',
          explanation: 'Palavras terminadas em "-ão" podem fazer plural em "-ãos", "-ões" ou "-ães". Cidadão faz cidadãos.'
        },
        {
          question: 'Qual frase está na voz passiva?',
          options: ['O bolo foi feito pela mãe', 'A mãe fez o bolo', 'O bolo está pronto', 'A mãe cozinha bem'],
          correctAnswer: 'O bolo foi feito pela mãe',
          explanation: 'Na voz passiva, o sujeito recebe a ação. "O bolo foi feito" indica que o bolo recebeu a ação de ser feito.'
        }
      ];
    }
    
    if (subjectLower.includes('história')) {
      return [
        {
          question: 'Qual foi o primeiro presidente do Brasil?',
          options: ['Marechal Deodoro da Fonseca', 'Getúlio Vargas', 'Dom Pedro II', 'Juscelino Kubitschek'],
          correctAnswer: 'Marechal Deodoro da Fonseca',
          explanation: 'Marechal Deodoro da Fonseca foi o primeiro presidente do Brasil, após a Proclamação da República em 1889.'
        },
        {
          question: 'Em que ano o Brasil foi descoberto?',
          options: ['1500', '1492', '1550', '1600'],
          correctAnswer: '1500',
          explanation: 'O Brasil foi descoberto em 22 de abril de 1500 por Pedro Álvares Cabral.'
        },
        {
          question: 'Qual era o nome do país antes de se chamar Brasil?',
          options: ['Terra de Santa Cruz', 'Nova Lusitânia', 'Terra Brasilis', 'Colônia Portuguesa'],
          correctAnswer: 'Terra de Santa Cruz',
          explanation: 'Inicialmente, o Brasil foi chamado de Terra de Santa Cruz pelos portugueses.'
        },
        {
          question: 'Quem proclamou a Independência do Brasil?',
          options: ['Dom Pedro I', 'Dom Pedro II', 'José Bonifácio', 'Tiradentes'],
          correctAnswer: 'Dom Pedro I',
          explanation: 'Dom Pedro I proclamou a Independência do Brasil em 7 de setembro de 1822.'
        },
        {
          question: 'Qual período da história do Brasil durou de 1822 a 1889?',
          options: ['Império', 'República', 'Colônia', 'Era Vargas'],
          correctAnswer: 'Império',
          explanation: 'O período do Império Brasileiro foi de 1822 (Independência) a 1889 (Proclamação da República).'
        }
      ];
    }
    
    if (subjectLower.includes('ciências') || subjectLower.includes('biologia')) {
      return [
        {
          question: 'Qual é a função principal dos pulmões?',
          options: ['Realizar trocas gasosas', 'Bombear sangue', 'Digerir alimentos', 'Filtrar impurezas'],
          correctAnswer: 'Realizar trocas gasosas',
          explanation: 'Os pulmões são responsáveis pela troca de oxigênio e gás carbônico no processo de respiração.'
        },
        {
          question: 'Qual planeta é conhecido como planeta vermelho?',
          options: ['Marte', 'Júpiter', 'Vênus', 'Saturno'],
          correctAnswer: 'Marte',
          explanation: 'Marte é chamado de planeta vermelho devido à cor de sua superfície, rica em óxido de ferro.'
        },
        {
          question: 'Qual é o maior órgão do corpo humano?',
          options: ['Pele', 'Fígado', 'Coração', 'Cérebro'],
          correctAnswer: 'Pele',
          explanation: 'A pele é o maior órgão do corpo humano, cobrindo toda a superfície do corpo.'
        },
        {
          question: 'O que as plantas precisam para fazer fotossíntese?',
          options: ['Luz solar, água e CO2', 'Apenas água', 'Apenas luz', 'Oxigênio e água'],
          correctAnswer: 'Luz solar, água e CO2',
          explanation: 'A fotossíntese requer luz solar, água (H2O) e gás carbônico (CO2) para produzir glicose e oxigênio.'
        },
        {
          question: 'Qual é a unidade básica da vida?',
          options: ['Célula', 'Átomo', 'Molécula', 'Tecido'],
          correctAnswer: 'Célula',
          explanation: 'A célula é a unidade básica e fundamental de todos os seres vivos.'
        }
      ];
    }
    
    if (subjectLower.includes('geografia')) {
      return [
        {
          question: 'Qual é o maior país do mundo em extensão territorial?',
          options: ['Rússia', 'Canadá', 'Estados Unidos', 'Brasil'],
          correctAnswer: 'Rússia',
          explanation: 'A Rússia é o maior país do mundo, com mais de 17 milhões de km².'
        },
        {
          question: 'Qual é o rio mais longo do Brasil?',
          options: ['Rio Amazonas', 'Rio São Francisco', 'Rio Paraná', 'Rio Tietê'],
          correctAnswer: 'Rio Amazonas',
          explanation: 'O Rio Amazonas é o maior rio do Brasil e um dos maiores do mundo.'
        },
        {
          question: 'Quantos estados tem o Brasil?',
          options: ['26 estados + DF', '25 estados + DF', '27 estados', '24 estados + DF'],
          correctAnswer: '26 estados + DF',
          explanation: 'O Brasil possui 26 estados e o Distrito Federal, totalizando 27 unidades federativas.'
        },
        {
          question: 'Qual é a capital do Brasil?',
          options: ['Brasília', 'Rio de Janeiro', 'São Paulo', 'Salvador'],
          correctAnswer: 'Brasília',
          explanation: 'Brasília é a capital do Brasil desde 1960, quando foi inaugurada por Juscelino Kubitschek.'
        },
        {
          question: 'Qual é o maior bioma brasileiro?',
          options: ['Amazônia', 'Cerrado', 'Mata Atlântica', 'Caatinga'],
          correctAnswer: 'Amazônia',
          explanation: 'A Amazônia é o maior bioma brasileiro, ocupando cerca de 49% do território nacional.'
        }
      ];
    }
    
    // Fallback genérico para outras disciplinas - mas com questões REAIS sobre o tema
    return [
      {
        question: `Sobre ${theme}: qual é a principal característica deste conteúdo em ${subject}?`,
        options: [
          'É um conceito fundamental para a disciplina',
          'É um tópico opcional',
          'Não é importante para o currículo',
          'É abordado apenas em níveis avançados'
        ],
        correctAnswer: 'É um conceito fundamental para a disciplina',
        explanation: `${theme} é um conteúdo importante em ${subject}, sendo parte fundamental do currículo escolar.`
      },
      {
        question: `Como ${theme} pode ser aplicado na prática?`,
        options: [
          'Em situações cotidianas e profissionais',
          'Apenas em provas escolares',
          'Somente em laboratórios',
          'Não tem aplicação prática'
        ],
        correctAnswer: 'Em situações cotidianas e profissionais',
        explanation: `O conhecimento sobre ${theme} tem diversas aplicações práticas no dia a dia e no mercado de trabalho.`
      },
      {
        question: `Qual habilidade é desenvolvida ao estudar ${theme}?`,
        options: [
          'Pensamento crítico e análise',
          'Apenas memorização',
          'Nenhuma habilidade específica',
          'Apenas habilidades manuais'
        ],
        correctAnswer: 'Pensamento crítico e análise',
        explanation: `Estudar ${theme} desenvolve o pensamento crítico e a capacidade de análise dos estudantes.`
      },
      {
        question: `Por que ${theme} é importante para ${schoolYear}?`,
        options: [
          'Serve de base para conteúdos futuros',
          'É apenas um conteúdo de revisão',
          'Não tem importância para esta série',
          'É opcional no currículo'
        ],
        correctAnswer: 'Serve de base para conteúdos futuros',
        explanation: `${theme} é fundamental pois serve como base para o aprendizado de conteúdos mais avançados.`
      },
      {
        question: `Qual é a melhor forma de estudar ${theme}?`,
        options: [
          'Praticando exercícios e revisando teoria',
          'Apenas lendo o material',
          'Decorando informações',
          'Assistindo vídeos sem praticar'
        ],
        correctAnswer: 'Praticando exercícios e revisando teoria',
        explanation: 'A melhor forma de aprender é combinando teoria com prática através de exercícios.'
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