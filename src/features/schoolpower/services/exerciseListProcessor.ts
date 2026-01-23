
interface Question {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado: string;
  alternativas?: string[];
  respostaCorreta?: string | number;
  explicacao?: string;
  dificuldade?: 'facil' | 'medio' | 'dificil';
  tema?: string;
}

interface ProcessedExerciseList {
  titulo: string;
  disciplina: string;
  tema: string;
  tipoQuestoes: string;
  numeroQuestoes: number;
  dificuldade: string;
  objetivos: string;
  conteudoPrograma: string;
  observacoes?: string;
  questoes: Question[];
}

/**
 * Processa o conteúdo bruto gerado pela IA e extrai questões estruturadas
 */
export function processAIGeneratedContent(
  rawContent: string,
  formData: any
): ProcessedExerciseList {
  console.log('🔄 Processando conteúdo da IA para lista de exercícios...');
  
  const questoes = extractQuestionsFromContent(rawContent, formData);
  
  return {
    titulo: formData.titulo || 'Lista de Exercícios',
    disciplina: formData.disciplina || 'Disciplina',
    tema: formData.tema || 'Tema',
    tipoQuestoes: formData.tipoQuestoes || 'Mista',
    numeroQuestoes: parseInt(formData.numeroQuestoes) || questoes.length,
    dificuldade: formData.dificuldade || 'Médio',
    objetivos: formData.objetivos || '',
    conteudoPrograma: formData.conteudoPrograma || '',
    observacoes: formData.observacoes,
    questoes
  };
}

/**
 * Extrai questões do conteúdo gerado pela IA
 */
function extractQuestionsFromContent(content: string, formData: any): Question[] {
  const questoes: Question[] = [];
  
  try {
    // Tentar parsear JSON estruturado primeiro
    if (content.trim().startsWith('{') || content.trim().startsWith('[')) {
      const parsedContent = JSON.parse(content);
      if (parsedContent.questoes) {
        return parsedContent.questoes.map((q: any, index: number) => ({
          id: `questao-${index + 1}`,
          type: determineQuestionType(q, formData.tipoQuestoes),
          enunciado: q.enunciado || q.pergunta || q.questao || '',
          alternativas: q.alternativas || q.opcoes,
          respostaCorreta: q.respostaCorreta || q.gabarito,
          explicacao: q.explicacao || q.justificativa,
          dificuldade: q.dificuldade || formData.dificuldade?.toLowerCase(),
          tema: formData.tema
        }));
      }
    }

    // Processar conteúdo em texto simples
    const questoesText = extractQuestionsFromText(content, formData);
    return questoesText;

  } catch (error) {
    console.warn('Erro ao processar JSON, tentando extração de texto:', error);
    return extractQuestionsFromText(content, formData);
  }
}

/**
 * Extrai questões de texto não estruturado
 */
function extractQuestionsFromText(content: string, formData: any): Question[] {
  const questoes: Question[] = [];
  const lines = content.split('\n').filter(line => line.trim());
  
  let currentQuestion: Partial<Question> | null = null;
  let questionCounter = 1;
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detectar início de nova questão
    if (isQuestionStart(line)) {
      // Salvar questão anterior se existir
      if (currentQuestion && currentQuestion.enunciado) {
        questoes.push({
          id: `questao-${questionCounter}`,
          type: currentQuestion.type || determineQuestionType(currentQuestion, formData.tipoQuestoes),
          enunciado: currentQuestion.enunciado,
          alternativas: currentQuestion.alternativas,
          respostaCorreta: currentQuestion.respostaCorreta,
          explicacao: currentQuestion.explicacao,
          dificuldade: formData.dificuldade?.toLowerCase() || 'medio',
          tema: formData.tema
        } as Question);
        questionCounter++;
      }
      
      // Iniciar nova questão
      currentQuestion = {
        enunciado: cleanQuestionText(line),
        alternativas: []
      };
    }
    // Detectar alternativas
    else if (currentQuestion && isAlternative(line)) {
      if (!currentQuestion.alternativas) {
        currentQuestion.alternativas = [];
      }
      currentQuestion.alternativas.push(cleanAlternativeText(line));
    }
    // Detectar explicação
    else if (currentQuestion && isExplanation(line)) {
      currentQuestion.explicacao = cleanExplanationText(line);
    }
    // Continuar enunciado se não for alternativa nem explicação
    else if (currentQuestion && line && !isAlternative(line) && !isExplanation(line)) {
      currentQuestion.enunciado += ' ' + line;
    }
  }
  
  // Adicionar última questão
  if (currentQuestion && currentQuestion.enunciado) {
    questoes.push({
      id: `questao-${questionCounter}`,
      type: currentQuestion.type || determineQuestionType(currentQuestion, formData.tipoQuestoes),
      enunciado: currentQuestion.enunciado,
      alternativas: currentQuestion.alternativas,
      respostaCorreta: currentQuestion.respostaCorreta,
      explicacao: currentQuestion.explicacao,
      dificuldade: formData.dificuldade?.toLowerCase() || 'medio',
      tema: formData.tema
    } as Question);
  }
  
  return questoes;
}

/**
 * Determina o tipo de questão baseado no conteúdo e configuração
 */
function determineQuestionType(question: any, tipoQuestoes: string): Question['type'] {
  const tipo = tipoQuestoes?.toLowerCase() || '';
  
  if (tipo.includes('mista')) {
    // Para questões mistas, determinar baseado no conteúdo
    if (question.alternativas && question.alternativas.length > 2) {
      return 'multipla-escolha';
    } else if (question.alternativas && question.alternativas.length === 2) {
      const alternativas = question.alternativas.map((alt: string) => alt.toLowerCase());
      if (alternativas.some((alt: string) => alt.includes('verdadeiro') || alt.includes('falso'))) {
        return 'verdadeiro-falso';
      }
    }
    return 'discursiva';
  } else if (tipo.includes('discursiva')) {
    return 'discursiva';
  } else if (tipo.includes('verdadeiro') || tipo.includes('falso')) {
    return 'verdadeiro-falso';
  } else {
    return 'multipla-escolha';
  }
}

/**
 * Detecta se uma linha é o início de uma questão
 */
function isQuestionStart(line: string): boolean {
  const patterns = [
    /^\d+[\.\)]/,  // "1.", "1)"
    /^questão\s*\d+/i,  // "Questão 1"
    /^pergunta\s*\d+/i,  // "Pergunta 1"
    /^\d+\s*[-–]/,  // "1 -", "1 –"
  ];
  
  return patterns.some(pattern => pattern.test(line.trim()));
}

/**
 * Detecta se uma linha é uma alternativa
 */
function isAlternative(line: string): boolean {
  const patterns = [
    /^[a-e][\.\)]/i,  // "a.", "A)", etc.
    /^\([a-e]\)/i,    // "(a)", "(A)", etc.
    /^[a-e]\s*-/i,    // "a -", "A -"
    /^(verdadeiro|falso)/i,  // Para questões V/F
  ];
  
  return patterns.some(pattern => pattern.test(line.trim()));
}

/**
 * Detecta se uma linha é uma explicação
 */
function isExplanation(line: string): boolean {
  const patterns = [
    /^(explicação|justificativa|resolução|resposta):/i,
    /^(gabarito|correção):/i,
  ];
  
  return patterns.some(pattern => pattern.test(line.trim()));
}

/**
 * Limpa o texto da questão
 */
function cleanQuestionText(text: string): string {
  return text
    .replace(/^\d+[\.\)]\s*/, '')
    .replace(/^questão\s*\d+[\.\):]?\s*/i, '')
    .replace(/^pergunta\s*\d+[\.\):]?\s*/i, '')
    .replace(/^\d+\s*[-–]\s*/, '')
    .trim();
}

/**
 * Limpa o texto da alternativa
 */
function cleanAlternativeText(text: string): string {
  return text
    .replace(/^[a-e][\.\)]\s*/i, '')
    .replace(/^\([a-e]\)\s*/i, '')
    .replace(/^[a-e]\s*-\s*/i, '')
    .trim();
}

/**
 * Limpa o texto da explicação
 */
function cleanExplanationText(text: string): string {
  return text
    .replace(/^(explicação|justificativa|resolução|resposta):\s*/i, '')
    .replace(/^(gabarito|correção):\s*/i, '')
    .trim();
}

/**
 * Gera questões padrão caso a IA não retorne conteúdo válido
 * NOTA: Este fallback só deve ser acionado em caso de erro na API.
 * Se você estiver vendo este conteúdo, significa que houve um problema
 * na geração com IA. Tente regenerar a lista de exercícios.
 */
export function generateFallbackQuestions(formData: any): Question[] {
  console.warn('⚠️ [generateFallbackQuestions] FALLBACK ACIONADO - IA não retornou conteúdo válido');
  console.warn('⚠️ [generateFallbackQuestions] Dados recebidos:', formData);
  
  const numeroQuestoes = parseInt(formData.numeroQuestoes) || 5;
  const questoes: Question[] = [];
  const tema = formData.tema || formData.theme || formData.disciplina || 'tema solicitado';
  
  for (let i = 1; i <= numeroQuestoes; i++) {
    const tipoQuestao = determineQuestionType({}, formData.tipoQuestoes || formData.modeloQuestoes);
    
    questoes.push({
      id: `questao-fallback-${i}`,
      type: tipoQuestao,
      enunciado: `[ERRO NA GERAÇÃO] Questão ${i} sobre "${tema}" não foi gerada corretamente. Por favor, clique em "Regenerar" para tentar novamente.`,
      alternativas: tipoQuestao === 'multipla-escolha' ? [
        'Opção de exemplo A - Regenere para conteúdo real',
        'Opção de exemplo B - Regenere para conteúdo real',
        'Opção de exemplo C - Regenere para conteúdo real',
        'Opção de exemplo D - Regenere para conteúdo real'
      ] : tipoQuestao === 'verdadeiro-falso' ? ['Verdadeiro', 'Falso'] : undefined,
      dificuldade: formData.dificuldade?.toLowerCase() || formData.nivelDificuldade?.toLowerCase() || 'medio',
      tema: tema,
      explicacao: 'Esta questão foi gerada como fallback devido a um erro. Clique em regenerar para obter questões personalizadas pela IA.'
    });
  }
  
  console.warn(`⚠️ [generateFallbackQuestions] Geradas ${questoes.length} questões de fallback`);
  
  return questoes;
}
