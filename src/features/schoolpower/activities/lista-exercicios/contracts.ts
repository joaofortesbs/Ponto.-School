/**
 * LISTA DE EXERCÍCIOS - CONTRATOS DE BLINDAGEM
 * 
 * Este arquivo define interfaces IMUTÁVEIS que protegem a Lista de Exercícios
 * contra modificações externas acidentais.
 * 
 * REGRA: Qualquer dado que entre no pipeline DEVE passar pelo sanitizador.
 * 
 * @version 2.0
 * @protected
 */

// ============================================================================
// CONTRATOS IMUTÁVEIS (readonly)
// ============================================================================

/**
 * Contrato de entrada para a Lista de Exercícios
 * Todos os campos são readonly para prevenir mutações acidentais
 */
export interface ExerciseListContract {
  readonly id: string;
  readonly tema: string;
  readonly disciplina: string;
  readonly anoEscolaridade: string;
  readonly numeroQuestoes: number;
  readonly nivelDificuldade: DifficultyLevel;
  readonly modeloQuestoes: QuestionType;
  readonly titulo?: string;
  readonly objetivos?: string;
  readonly fontes?: string;
}

/**
 * Contrato para uma questão individual
 */
export interface QuestionContract {
  readonly id: string;
  readonly type: QuestionType;
  readonly enunciado: string;
  readonly alternativas?: ReadonlyArray<string>;
  readonly respostaCorreta?: number | string | boolean;
  readonly explicacao?: string;
  readonly dificuldade?: string;
  readonly tema?: string;
  readonly _source?: string;
  readonly _validated?: boolean;
}

/**
 * Contrato de resposta do pipeline
 */
export interface ExerciseListResponseContract {
  readonly success: boolean;
  readonly titulo: string;
  readonly disciplina: string;
  readonly questoes: ReadonlyArray<QuestionContract>;
  readonly metadata: Readonly<{
    totalQuestoes: number;
    validQuestoes: number;
    invalidQuestoes: number;
    extractionMethod: string;
    timestamp: number;
    processingTimeMs?: number;
  }>;
  readonly errors?: ReadonlyArray<string>;
  readonly warnings?: ReadonlyArray<string>;
}

// ============================================================================
// TIPOS ENUMERADOS
// ============================================================================

export type DifficultyLevel = 'facil' | 'medio' | 'dificil';
export type QuestionType = 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';

// ============================================================================
// CONSTANTES DE CONFIGURAÇÃO
// ============================================================================

export const LISTA_EXERCICIOS_CONFIG = {
  STORAGE_PREFIX: 'sp_le_v2_',
  MIN_QUESTIONS: 1,
  MAX_QUESTIONS: 50,
  MIN_ENUNCIADO_LENGTH: 10,
  VERSION: '2.0.0',
  PROTECTED: true
} as const;

// ============================================================================
// SANITIZADOR DE ENTRADA
// ============================================================================

/**
 * Sanitizador que valida e normaliza dados de entrada
 * Esta é a ÚNICA forma de criar um ExerciseListContract válido
 */
export class ExerciseListInputSanitizer {
  private static readonly DIFFICULTY_MAP: Record<string, DifficultyLevel> = {
    'facil': 'facil',
    'fácil': 'facil',
    'easy': 'facil',
    'baixo': 'facil',
    'medio': 'medio',
    'médio': 'medio',
    'medium': 'medio',
    'moderado': 'medio',
    'dificil': 'dificil',
    'difícil': 'dificil',
    'hard': 'dificil',
    'alto': 'dificil'
  };

  private static readonly TYPE_MAP: Record<string, QuestionType> = {
    'multipla-escolha': 'multipla-escolha',
    'multipla escolha': 'multipla-escolha',
    'multiple-choice': 'multipla-escolha',
    'objetiva': 'multipla-escolha',
    'discursiva': 'discursiva',
    'dissertativa': 'discursiva',
    'aberta': 'discursiva',
    'essay': 'discursiva',
    'verdadeiro-falso': 'verdadeiro-falso',
    'verdadeiro ou falso': 'verdadeiro-falso',
    'v/f': 'verdadeiro-falso',
    'true-false': 'verdadeiro-falso'
  };

  /**
   * Sanitiza dados de entrada e retorna um contrato válido
   * @throws Error se os dados forem completamente inválidos
   */
  static sanitize(input: any): ExerciseListContract {
    console.log('🛡️ [ExerciseListInputSanitizer] Iniciando sanitização de entrada');
    console.log('🛡️ [ExerciseListInputSanitizer] Dados recebidos:', JSON.stringify(input, null, 2).substring(0, 500));

    // Validar que input existe
    if (!input || typeof input !== 'object') {
      console.warn('⚠️ [ExerciseListInputSanitizer] Input inválido, usando valores padrão');
      input = {};
    }

    const sanitized: ExerciseListContract = {
      id: this.sanitizeId(input),
      tema: this.sanitizeString(input.tema || input.theme, 'Conteúdo Geral'),
      disciplina: this.sanitizeString(input.disciplina || input.subject, 'Geral'),
      anoEscolaridade: this.sanitizeString(input.anoEscolaridade || input.schoolYear, 'Não Informado'),
      numeroQuestoes: this.sanitizeNumber(
        input.numeroQuestoes || input.numberOfQuestions,
        LISTA_EXERCICIOS_CONFIG.MIN_QUESTIONS,
        LISTA_EXERCICIOS_CONFIG.MAX_QUESTIONS,
        10
      ),
      nivelDificuldade: this.sanitizeDifficulty(input.nivelDificuldade || input.difficultyLevel),
      modeloQuestoes: this.sanitizeQuestionType(input.modeloQuestoes || input.questionModel),
      titulo: this.sanitizeString(input.titulo || input.title, undefined),
      objetivos: this.sanitizeString(input.objetivos || input.objectives, undefined),
      fontes: this.sanitizeString(input.fontes || input.sources, undefined)
    };

    console.log('✅ [ExerciseListInputSanitizer] Dados sanitizados:', sanitized);
    return Object.freeze(sanitized); // Congela o objeto para evitar mutações
  }

  /**
   * Sanitiza o ID da atividade
   */
  private static sanitizeId(input: any): string {
    const id = input.id || input.activityId || input._id;
    if (id && typeof id === 'string' && id.trim().length > 0) {
      return id.trim();
    }
    return `le_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sanitiza uma string com valor padrão
   */
  private static sanitizeString(value: any, defaultValue?: string): string | undefined {
    if (value === null || value === undefined) {
      return defaultValue;
    }
    const str = String(value).trim();
    return str.length > 0 ? str : defaultValue;
  }

  /**
   * Sanitiza um número dentro de limites
   */
  private static sanitizeNumber(value: any, min: number, max: number, defaultValue: number): number {
    const num = Number(value);
    if (isNaN(num)) {
      return defaultValue;
    }
    return Math.min(Math.max(Math.floor(num), min), max);
  }

  /**
   * Sanitiza o nível de dificuldade
   */
  private static sanitizeDifficulty(value: any): DifficultyLevel {
    if (!value) return 'medio';
    const normalized = String(value).toLowerCase().trim();
    return this.DIFFICULTY_MAP[normalized] || 'medio';
  }

  /**
   * Sanitiza o tipo de questão
   */
  private static sanitizeQuestionType(value: any): QuestionType {
    if (!value) return 'multipla-escolha';
    const normalized = String(value).toLowerCase().trim();
    return this.TYPE_MAP[normalized] || 'multipla-escolha';
  }

  /**
   * Valida se um contrato é válido
   */
  static validate(contract: ExerciseListContract): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!contract.id) {
      errors.push('ID é obrigatório');
    }
    if (!contract.tema || contract.tema.length < 2) {
      errors.push('Tema deve ter pelo menos 2 caracteres');
    }
    if (contract.numeroQuestoes < 1 || contract.numeroQuestoes > 50) {
      errors.push('Número de questões deve estar entre 1 e 50');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

/**
 * Gera a chave de cache para o StorageOrchestrator
 */
export function generateExerciseListCacheKey(contract: ExerciseListContract): string {
  return `${LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX}${contract.id}_${contract.tema}_${contract.modeloQuestoes}`;
}

/**
 * Verifica se uma chave pertence à Lista de Exercícios
 */
export function isExerciseListKey(key: string): boolean {
  return key.startsWith(LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX);
}

// ============================================================================
// FUNÇÕES CENTRALIZADAS DE STORAGE - BLINDAGEM V2.0
// ============================================================================

/**
 * Interface para dados processados e salvos de Lista de Exercícios
 */
export interface ProcessedExerciseListData {
  id: string;
  titulo: string;
  disciplina: string;
  tema: string;
  tipoQuestoes: string;
  numeroQuestoes: number;
  dificuldade: string;
  questoes: QuestionContract[];
  isGeneratedByAI: boolean;
  generatedAt: string;
  _processedByPipeline: boolean;
  _pipelineVersion: string;
}

/**
 * Salva dados de Lista de Exercícios usando o namespace protegido
 * IMPORTANTE: Esta função deve ser usada por TODOS os pontos de salvamento
 */
export function saveExerciseListData(activityId: string, data: any): boolean {
  try {
    const storageKey = `${LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX}${activityId}`;
    const legacyKey = `constructed_lista-exercicios_${activityId}`;
    
    // Adicionar metadados de processamento
    const dataToSave = {
      ...data,
      _processedByPipeline: true,
      _pipelineVersion: LISTA_EXERCICIOS_CONFIG.VERSION,
      _savedAt: new Date().toISOString()
    };
    
    // Salvar no novo namespace
    localStorage.setItem(storageKey, JSON.stringify(dataToSave));
    
    // Também salvar no legacy para compatibilidade retroativa
    localStorage.setItem(legacyKey, JSON.stringify(dataToSave));
    
    console.log(`💾 [ExerciseListStorage] Dados salvos com sucesso:`, {
      newKey: storageKey,
      legacyKey,
      questoesCount: data.questoes?.length || 0,
      titulo: data.titulo
    });
    
    return true;
  } catch (error) {
    console.error('❌ [ExerciseListStorage] Erro ao salvar:', error);
    return false;
  }
}

/**
 * Carrega dados de Lista de Exercícios do namespace protegido
 * Tenta o novo namespace primeiro, depois o legacy
 * IMPORTANTE: Esta função deve ser usada por TODOS os pontos de carregamento
 */
export function loadExerciseListData(activityId: string): ProcessedExerciseListData | null {
  try {
    const storageKey = `${LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX}${activityId}`;
    const legacyKey = `constructed_lista-exercicios_${activityId}`;
    
    // Tentar novo namespace primeiro
    let rawData = localStorage.getItem(storageKey);
    let source = 'new';
    
    // Fallback para legacy
    if (!rawData) {
      rawData = localStorage.getItem(legacyKey);
      source = 'legacy';
    }
    
    if (!rawData) {
      console.log(`📭 [ExerciseListStorage] Nenhum dado encontrado para: ${activityId}`);
      return null;
    }
    
    const parsed = JSON.parse(rawData);
    
    console.log(`📂 [ExerciseListStorage] Dados carregados de ${source}:`, {
      activityId,
      titulo: parsed.titulo,
      questoesCount: parsed.questoes?.length || 0,
      processedByPipeline: parsed._processedByPipeline
    });
    
    // Se veio do legacy e não foi processado, migrar para novo namespace
    if (source === 'legacy' && !parsed._processedByPipeline) {
      console.log(`🔄 [ExerciseListStorage] Migrando dados legacy para novo namespace`);
      saveExerciseListData(activityId, parsed);
    }
    
    return parsed as ProcessedExerciseListData;
  } catch (error) {
    console.error('❌ [ExerciseListStorage] Erro ao carregar:', error);
    return null;
  }
}

/**
 * Verifica se existem dados salvos para uma atividade
 */
export function hasExerciseListData(activityId: string): boolean {
  const storageKey = `${LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX}${activityId}`;
  const legacyKey = `constructed_lista-exercicios_${activityId}`;
  
  return localStorage.getItem(storageKey) !== null || 
         localStorage.getItem(legacyKey) !== null;
}

/**
 * Remove dados de Lista de Exercícios (ambos namespaces)
 */
export function removeExerciseListData(activityId: string): boolean {
  try {
    const storageKey = `${LISTA_EXERCICIOS_CONFIG.STORAGE_PREFIX}${activityId}`;
    const legacyKey = `constructed_lista-exercicios_${activityId}`;
    
    localStorage.removeItem(storageKey);
    localStorage.removeItem(legacyKey);
    
    console.log(`🗑️ [ExerciseListStorage] Dados removidos: ${activityId}`);
    return true;
  } catch (error) {
    console.error('❌ [ExerciseListStorage] Erro ao remover:', error);
    return false;
  }
}
