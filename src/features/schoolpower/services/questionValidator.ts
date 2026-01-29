import { normalizeAlternativeToString } from '../activities/lista-exercicios/contracts';

export interface ValidatedQuestion {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado: string;
  alternativas?: string[];
  respostaCorreta?: string | number;
  explicacao?: string;
  dificuldade?: string;
  tema?: string;
}

export interface ValidatedExerciseList {
  titulo: string;
  disciplina: string;
  tema: string;
  anoEscolaridade: string;
  numeroQuestoes: number;
  dificuldade: string;
  tipoQuestoes: string;
  objetivos: string;
  conteudoPrograma: string;
  observacoes: string;
  questoes: ValidatedQuestion[];
  isGeneratedByAI: boolean;
  generatedAt: string;
}

export const validateAndNormalizeQuestions = (
  rawData: any,
  contextData: any
): ValidatedExerciseList => {
  console.log('🔍 Iniciando validação de questões:', rawData);

  // Extrair questões de diferentes possíveis localizações
  let questoesRaw: any[] = [];
  
  if (rawData.questoes && Array.isArray(rawData.questoes)) {
    questoesRaw = rawData.questoes;
  } else if (rawData.questions && Array.isArray(rawData.questions)) {
    questoesRaw = rawData.questions;
  } else if (rawData.content?.questoes && Array.isArray(rawData.content.questoes)) {
    questoesRaw = rawData.content.questoes;
  } else if (rawData.content?.questions && Array.isArray(rawData.content.questions)) {
    questoesRaw = rawData.content.questions;
  }

  if (questoesRaw.length === 0) {
    throw new Error('Nenhuma questão encontrada nos dados da IA');
  }

  console.log(`📝 Processando ${questoesRaw.length} questões brutas`);

  // Validar e normalizar cada questão
  const questoesValidadas: ValidatedQuestion[] = questoesRaw.map((questao, index) => {
    const questaoId = questao.id || `questao-${index + 1}`;
    
    // Normalizar tipo da questão
    let tipoNormalizado: ValidatedQuestion['type'] = 'multipla-escolha';
    const tipoOriginal = (questao.type || questao.tipo || 'multipla-escolha').toLowerCase();
    
    if (tipoOriginal.includes('discursiva') || tipoOriginal.includes('dissertativa')) {
      tipoNormalizado = 'discursiva';
    } else if (tipoOriginal.includes('verdadeiro') || tipoOriginal.includes('falso')) {
      tipoNormalizado = 'verdadeiro-falso';
    } else if (tipoOriginal.includes('multipla') || tipoOriginal.includes('múltipla') || tipoOriginal.includes('escolha')) {
      tipoNormalizado = 'multipla-escolha';
    }

    // Validar enunciado
    const enunciado = questao.enunciado || questao.pergunta || questao.question || questao.text;
    if (!enunciado || enunciado.trim().length === 0) {
      throw new Error(`Questão ${index + 1} não possui enunciado válido`);
    }

    // Processar alternativas baseado no tipo
    let alternativas: string[] | undefined = undefined;
    
    if (tipoNormalizado === 'multipla-escolha') {
      const rawAlternativas = questao.alternativas || questao.alternatives || questao.options || [];
      alternativas = Array.isArray(rawAlternativas) 
        ? rawAlternativas.map((alt: any, altIdx: number) => normalizeAlternativeToString(alt, altIdx))
        : [];
      
      // Garantir que há pelo menos 2 alternativas
      if (alternativas.length < 2) {
        console.warn(`⚠️ Questão ${index + 1} com alternativas insuficientes, gerando alternativas padrão`);
        alternativas = [
          questao.respostaCorreta || 'Alternativa correta',
          'Alternativa incorreta A',
          'Alternativa incorreta B',
          'Alternativa incorreta C'
        ];
      }
    } else if (tipoNormalizado === 'verdadeiro-falso') {
      alternativas = ['Verdadeiro', 'Falso'];
    }
    // Para discursiva, alternativas permanecem undefined

    const questaoValidada: ValidatedQuestion = {
      id: questaoId,
      type: tipoNormalizado,
      enunciado: enunciado.trim(),
      alternativas,
      respostaCorreta: questao.respostaCorreta || questao.correctAnswer || 0,
      explicacao: questao.explicacao || questao.explanation || '',
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tema: questao.tema || questao.topic || contextData.tema || 'Tema não especificado'
    };

    console.log(`✅ Questão ${index + 1} validada:`, {
      id: questaoValidada.id,
      type: questaoValidada.type,
      hasEnunciado: !!questaoValidada.enunciado,
      alternativasCount: questaoValidada.alternativas?.length || 0
    });

    return questaoValidada;
  });

  // Montar resultado final validado
  const resultadoValidado: ValidatedExerciseList = {
    titulo: rawData.titulo || contextData.titulo || contextData.title || 'Lista de Exercícios',
    disciplina: rawData.disciplina || contextData.disciplina || contextData.subject || 'Disciplina',
    tema: rawData.tema || contextData.tema || contextData.theme || 'Tema',
    anoEscolaridade: rawData.anoEscolaridade || contextData.anoEscolaridade || contextData.schoolYear || 'Não especificado',
    numeroQuestoes: questoesValidadas.length,
    dificuldade: rawData.dificuldade || contextData.nivelDificuldade || contextData.difficultyLevel || 'Médio',
    tipoQuestoes: rawData.tipoQuestoes || contextData.modeloQuestoes || contextData.questionModel || 'Múltipla escolha',
    objetivos: rawData.objetivos || contextData.objetivos || contextData.objectives || `Desenvolver conhecimentos sobre ${rawData.tema || contextData.tema || 'o tema proposto'}`,
    conteudoPrograma: rawData.conteudoPrograma || contextData.instrucoes || contextData.instructions || 'Conteúdo programático específico',
    observacoes: rawData.observacoes || 'Exercícios gerados automaticamente pela IA',
    questoes: questoesValidadas,
    isGeneratedByAI: true,
    generatedAt: new Date().toISOString()
  };

  console.log('✅ Validação completa:', {
    titulo: resultadoValidado.titulo,
    disciplina: resultadoValidado.disciplina,
    tema: resultadoValidado.tema,
    totalQuestoes: resultadoValidado.questoes.length
  });

  return resultadoValidado;
};

export const isValidExerciseList = (data: any): boolean => {
  if (!data || typeof data !== 'object') return false;
  
  const hasQuestoes = (data.questoes && Array.isArray(data.questoes) && data.questoes.length > 0) ||
                     (data.questions && Array.isArray(data.questions) && data.questions.length > 0);
  
  return hasQuestoes;
};
