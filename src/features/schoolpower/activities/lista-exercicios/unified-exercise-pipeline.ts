// ============================================================================
// CAMADA 0 - CONTRATO DE BLINDAGEM (ISOLAMENTO)
// Re-exporta contratos centralizados de contracts.ts
// ============================================================================

import {
  ExerciseListInputSanitizer as ContractsSanitizer,
  LISTA_EXERCICIOS_CONFIG,
  generateExerciseListCacheKey,
  isExerciseListKey,
  normalizeAlternativeToString,
  type ExerciseListContract,
  type QuestionContract,
  type ExerciseListResponseContract,
  type DifficultyLevel,
  type QuestionType
} from './contracts';

export type { ExerciseListContract, QuestionContract, DifficultyLevel, QuestionType };

export class ExerciseListSanitizer {
  static sanitize(input: any): ExerciseListContract {
    return ContractsSanitizer.sanitize(input);
  }

  static validate(contract: ExerciseListContract): { valid: boolean; errors: string[] } {
    return ContractsSanitizer.validate(contract);
  }

  static getCacheKey(contract: ExerciseListContract): string {
    return generateExerciseListCacheKey(contract);
  }

  static isExerciseListStorageKey(key: string): boolean {
    return isExerciseListKey(key);
  }

  static get CONFIG() {
    return LISTA_EXERCICIOS_CONFIG;
  }
}

/**
 * UNIFIED EXERCISE LIST PIPELINE - Solução Robusta 6 Camadas
 * Resolve definitivamente o problema de geração de Lista de Exercícios
 * 
 * Camadas:
 * 1. Normalização Unificada - Interface consistente
 * 2. Extração Inteligente - Fallback múltiplo (5 formatos)
 * 3. Validação Rigorosa - Type-safe com logging
 * 4. Sincronização - Hooks e estado compartilhado
 * 5. Testes - Validação em runtime
 * 6. Fallback Progressivo - Cache, template, UI erro
 */

// ============================================================================
// CAMADA 1 - INTERFACES E TIPOS UNIFICADOS
// ============================================================================

export interface UnifiedQuestion {
  id: string;
  type: 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso';
  enunciado: string;
  alternativas?: string[];
  respostaCorreta?: number | string | boolean;
  explicacao?: string;
  dificuldade?: string;
  tema?: string;
  _source?: string; // Campo de origem para debug
  _validated?: boolean;
}

export interface UnifiedExerciseListResponse {
  success: boolean;
  titulo: string;
  disciplina: string;
  questoes: UnifiedQuestion[];
  metadata: {
    totalQuestoes: number;
    validQuestoes: number;
    invalidQuestoes: number;
    extractionMethod: string;
    timestamp: number;
    processingTimeMs?: number;
  };
  errors?: string[];
  warnings?: string[];
}

export interface ExtractionResult {
  questoes: any[];
  method: string;
  confidence: number;
}

// ============================================================================
// CAMADA 2 - EXTRAÇÃO INTELIGENTE COM FALLBACK MÚLTIPLO
// ============================================================================

const ENUNCIADO_FIELDS = [
  'enunciado', 'pergunta', 'question', 'statement', 'texto',
  'text', 'content', 'title', 'descricao', 'description', 'body'
] as const;

const ALTERNATIVAS_FIELDS = [
  'alternativas', 'alternatives', 'options', 'choices', 'opcoes'
] as const;

const RESPOSTA_FIELDS = [
  'respostaCorreta', 'correctAnswer', 'correct_answer', 'gabarito',
  'answer', 'resposta', 'correct', 'solution'
] as const;

export class IntelligentExtractor {
  private static logs: string[] = [];

  static log(message: string, data?: any): void {
    const logEntry = `[${new Date().toISOString()}] ${message}`;
    this.logs.push(logEntry);
    console.log(`🔍 [IntelligentExtractor] ${message}`, data || '');
  }

  static getLogs(): string[] {
    return [...this.logs];
  }

  static clearLogs(): void {
    this.logs = [];
  }

  /**
   * Extração inteligente com 5 formatos de fallback
   */
  static extractQuestoes(data: any, activityId?: string): ExtractionResult {
    this.log('Iniciando extração inteligente', { dataType: typeof data });

    // Método 1: data.data.questoes (wrapper duplo)
    if (data?.data?.questoes && Array.isArray(data.data.questoes)) {
      this.log('✅ Método 1: data.data.questoes', { count: data.data.questoes.length });
      return { questoes: data.data.questoes, method: 'data.data.questoes', confidence: 1.0 };
    }

    // Método 2: data.questoes (direto)
    if (data?.questoes && Array.isArray(data.questoes)) {
      this.log('✅ Método 2: data.questoes', { count: data.questoes.length });
      return { questoes: data.questoes, method: 'data.questoes', confidence: 0.95 };
    }

    // Método 3: data.content.questoes (alternativo)
    if (data?.content?.questoes && Array.isArray(data.content.questoes)) {
      this.log('✅ Método 3: data.content.questoes', { count: data.content.questoes.length });
      return { questoes: data.content.questoes, method: 'data.content.questoes', confidence: 0.9 };
    }

    // Método 4: data.questions (inglês)
    if (data?.questions && Array.isArray(data.questions)) {
      this.log('✅ Método 4: data.questions', { count: data.questions.length });
      return { questoes: data.questions, method: 'data.questions', confidence: 0.85 };
    }

    // Método 5: data.data (wrapper simples, questões podem estar no data)
    if (data?.data && typeof data.data === 'object') {
      const nestedData = data.data;
      if (nestedData.questoes && Array.isArray(nestedData.questoes)) {
        this.log('✅ Método 5: data.data (nested)', { count: nestedData.questoes.length });
        return { questoes: nestedData.questoes, method: 'data.data.nested', confidence: 0.8 };
      }
      if (nestedData.questions && Array.isArray(nestedData.questions)) {
        this.log('✅ Método 5b: data.data.questions', { count: nestedData.questions.length });
        return { questoes: nestedData.questions, method: 'data.data.questions', confidence: 0.8 };
      }
    }

    // Método 6: localStorage como último recurso
    if (activityId && typeof window !== 'undefined') {
      const localStorageKeys = [
        `activity_${activityId}_questoes`,
        `lista_exercicios_${activityId}`,
        `generated_content_${activityId}`
      ];

      for (const key of localStorageKeys) {
        try {
          const stored = localStorage.getItem(key);
          if (stored) {
            const parsed = JSON.parse(stored);
            const questoes = parsed.questoes || parsed.questions || parsed;
            if (Array.isArray(questoes) && questoes.length > 0) {
              this.log('✅ Método 6: localStorage', { key, count: questoes.length });
              return { questoes, method: `localStorage:${key}`, confidence: 0.7 };
            }
          }
        } catch (e) {
          this.log('⚠️ localStorage parse error', { key, error: e });
        }
      }
    }

    // Método 7: Busca recursiva em objeto
    const recursiveResult = this.recursiveSearch(data, 0);
    if (recursiveResult.length > 0) {
      this.log('✅ Método 7: busca recursiva', { count: recursiveResult.length });
      return { questoes: recursiveResult, method: 'recursive_search', confidence: 0.6 };
    }

    this.log('❌ Nenhuma questão encontrada em nenhum método');
    return { questoes: [], method: 'none', confidence: 0 };
  }

  /**
   * Busca recursiva em objeto para encontrar arrays de questões
   */
  private static recursiveSearch(obj: any, depth: number): any[] {
    if (depth > 5 || !obj || typeof obj !== 'object') return [];

    if (Array.isArray(obj)) {
      const hasQuestionLikeItems = obj.some((item: any) => 
        item && typeof item === 'object' && 
        (item.enunciado || item.pergunta || item.question || item.alternativas)
      );
      if (hasQuestionLikeItems) return obj;
    }

    for (const key of Object.keys(obj)) {
      const value = obj[key];
      if (Array.isArray(value) && value.length > 0) {
        const hasQuestions = value.some((item: any) =>
          item && typeof item === 'object' &&
          ENUNCIADO_FIELDS.some(field => item[field])
        );
        if (hasQuestions) return value;
      }
      const nested = this.recursiveSearch(value, depth + 1);
      if (nested.length > 0) return nested;
    }

    return [];
  }

  /**
   * Extrai enunciado de qualquer formato
   * IMPORTANTE: Retorna o texto encontrado SEM filtrar placeholders
   * A validação será feita pelo QuestionValidator
   */
  static extractEnunciado(question: any): string {
    for (const field of ENUNCIADO_FIELDS) {
      const value = question[field];
      if (value && typeof value === 'string' && value.trim().length > 0) {
        return value.trim();
      }
    }
    return '';
  }

  /**
   * Extrai alternativas de qualquer formato
   */
  static extractAlternativas(question: any): string[] | undefined {
    for (const field of ALTERNATIVAS_FIELDS) {
      const value = question[field];
      if (Array.isArray(value) && value.length > 0) {
        return value.map((v, index) => normalizeAlternativeToString(v, index));
      }
    }
    return undefined;
  }

  /**
   * Extrai resposta correta de qualquer formato
   */
  static extractRespostaCorreta(question: any): number | string | boolean | undefined {
    for (const field of RESPOSTA_FIELDS) {
      const value = question[field];
      if (value !== undefined && value !== null && value !== '') {
        return value;
      }
    }
    return undefined;
  }

  /**
   * Verifica se é texto placeholder
   * IMPORTANTE: Detecção conservadora para não descartar conteúdo real
   */
  static isPlaceholder(text: string): boolean {
    if (!text || text.trim().length === 0) return true;
    
    const lower = text.toLowerCase().trim();
    
    const strictPlaceholderPatterns = [
      /^\[conteúdo será gerado pela ia\]$/i,
      /^\[aguardando geração\]/i,
      /^questão simulada/i,
      /^placeholder$/i,
      /^lorem ipsum/i,
      /^\[.*será gerado.*\]$/i
    ];
    
    const isStrictPlaceholder = strictPlaceholderPatterns.some(pattern => pattern.test(lower));
    
    if (isStrictPlaceholder) {
      console.log('🚫 [isPlaceholder] Placeholder detectado:', text.substring(0, 50));
    }
    
    return isStrictPlaceholder;
  }
}

// ============================================================================
// CAMADA 3 - VALIDAÇÃO RIGOROSA
// ============================================================================

export class QuestionValidator {
  static validate(question: any, index: number): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    const enunciado = IntelligentExtractor.extractEnunciado(question);
    
    if (!enunciado) {
      errors.push(`Questão ${index + 1}: enunciado vazio ou não encontrado`);
    } else if (IntelligentExtractor.isPlaceholder(enunciado)) {
      errors.push(`Questão ${index + 1}: enunciado é placeholder "${enunciado.substring(0, 50)}..."`);
    } else if (enunciado.length < 10) {
      warnings.push(`Questão ${index + 1}: enunciado muito curto (${enunciado.length} chars)`);
    }

    const type = question.type || question.tipo || 'multipla-escolha';
    if (type === 'multipla-escolha' || type === 'multiple-choice') {
      const alternativas = IntelligentExtractor.extractAlternativas(question);
      if (!alternativas || alternativas.length < 2) {
        errors.push(`Questão ${index + 1}: alternativas insuficientes para múltipla escolha`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  static validateAll(questoes: any[]): { validCount: number; invalidCount: number; allErrors: string[]; allWarnings: string[] } {
    let validCount = 0;
    let invalidCount = 0;
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    questoes.forEach((q, i) => {
      const result = this.validate(q, i);
      if (result.valid) {
        validCount++;
      } else {
        invalidCount++;
      }
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    });

    return { validCount, invalidCount, allErrors, allWarnings };
  }
}

// ============================================================================
// CAMADA 4 - NORMALIZADOR UNIFICADO
// ============================================================================

export class UnifiedNormalizer {
  /**
   * Normaliza uma questão para formato unificado
   * IMPORTANTE: NÃO injeta placeholders - preserva dados originais
   */
  static normalizeQuestion(raw: any, index: number, defaults: any = {}): UnifiedQuestion {
    const enunciado = IntelligentExtractor.extractEnunciado(raw);
    const alternativas = IntelligentExtractor.extractAlternativas(raw);
    const respostaCorreta = IntelligentExtractor.extractRespostaCorreta(raw);

    const type = this.normalizeType(raw.type || raw.tipo || defaults.modeloQuestoes || 'multipla-escolha');
    
    const isValid = enunciado.length > 0 && !IntelligentExtractor.isPlaceholder(enunciado);

    return {
      id: raw.id || `questao-${index + 1}`,
      type,
      enunciado: enunciado,
      alternativas: type === 'multipla-escolha' ? alternativas : undefined,
      respostaCorreta,
      explicacao: raw.explicacao || raw.explanation || raw.justificativa || '',
      dificuldade: raw.dificuldade || raw.difficulty || defaults.nivelDificuldade || 'medio',
      tema: raw.tema || raw.topic || defaults.tema,
      _source: raw._source || 'normalized',
      _validated: isValid
    };
  }

  static normalizeType(type: string): 'multipla-escolha' | 'discursiva' | 'verdadeiro-falso' {
    const t = (type || '').toLowerCase();
    if (t.includes('discursiva') || t.includes('dissertativa') || t.includes('aberta') || t.includes('essay')) {
      return 'discursiva';
    }
    if (t.includes('verdadeiro') || t.includes('falso') || t.includes('true') || t.includes('false') || t.includes('v/f')) {
      return 'verdadeiro-falso';
    }
    return 'multipla-escolha';
  }

  /**
   * Processa resposta completa do pipeline
   */
  static processFullResponse(data: any, inputData: any = {}): UnifiedExerciseListResponse {
    const startTime = Date.now();
    IntelligentExtractor.clearLogs();
    
    console.log('🚀 [UnifiedNormalizer] Iniciando processamento completo');

    // Extração
    const extraction = IntelligentExtractor.extractQuestoes(data, inputData.id);
    
    // Normalização
    const normalizedQuestoes = extraction.questoes.map((q, i) => 
      this.normalizeQuestion(q, i, inputData)
    );

    // Validação
    const validation = QuestionValidator.validateAll(normalizedQuestoes);

    // Título e disciplina
    const titulo = data?.titulo || data?.data?.titulo || inputData.titulo || 'Lista de Exercícios';
    const disciplina = data?.disciplina || data?.data?.disciplina || inputData.disciplina || '';

    const response: UnifiedExerciseListResponse = {
      success: validation.validCount > 0,
      titulo,
      disciplina,
      questoes: normalizedQuestoes,
      metadata: {
        totalQuestoes: normalizedQuestoes.length,
        validQuestoes: validation.validCount,
        invalidQuestoes: validation.invalidCount,
        extractionMethod: extraction.method,
        timestamp: Date.now(),
        processingTimeMs: Date.now() - startTime
      },
      errors: validation.allErrors.length > 0 ? validation.allErrors : undefined,
      warnings: validation.allWarnings.length > 0 ? validation.allWarnings : undefined
    };

    console.log('✅ [UnifiedNormalizer] Processamento completo', {
      total: response.metadata.totalQuestoes,
      valid: response.metadata.validQuestoes,
      method: response.metadata.extractionMethod,
      timeMs: response.metadata.processingTimeMs
    });

    return response;
  }
}

// ============================================================================
// CAMADA 6 - FALLBACK PROGRESSIVO
// ============================================================================

export class ProgressiveFallback {
  private static cache = new Map<string, UnifiedExerciseListResponse>();
  private static MAX_CACHE_SIZE = 50;

  /**
   * Tenta obter do cache
   */
  static getFromCache(key: string): UnifiedExerciseListResponse | null {
    const cached = this.cache.get(key);
    if (cached) {
      console.log('📦 [ProgressiveFallback] Cache hit:', key);
      return cached;
    }
    return null;
  }

  /**
   * Salva no cache
   */
  static saveToCache(key: string, data: UnifiedExerciseListResponse): void {
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    this.cache.set(key, data);
    console.log('💾 [ProgressiveFallback] Cache save:', key);
  }

  /**
   * Gera template parcial como fallback
   */
  static generatePartialTemplate(inputData: any, count: number = 5): UnifiedExerciseListResponse {
    console.log('📝 [ProgressiveFallback] Gerando template parcial');
    
    const questoes: UnifiedQuestion[] = [];
    const type = UnifiedNormalizer.normalizeType(inputData.modeloQuestoes || 'multipla-escolha');

    for (let i = 0; i < count; i++) {
      questoes.push({
        id: `template-${i + 1}`,
        type,
        enunciado: `[Aguardando geração] Questão ${i + 1} sobre ${inputData.tema || 'o tema selecionado'}`,
        alternativas: type === 'multipla-escolha' ? [
          `Primeira opção sobre ${inputData.tema || 'o tema'} - aguardando geração`,
          `Segunda opção - processando conteúdo`,
          `Terceira alternativa - em carregamento`,
          `Quarta opção - regenere se persistir`
        ] : undefined,
        respostaCorreta: type === 'multipla-escolha' ? 0 : undefined,
        explicacao: '',
        dificuldade: inputData.nivelDificuldade || 'medio',
        tema: inputData.tema,
        _source: 'template',
        _validated: false
      });
    }

    return {
      success: false,
      titulo: inputData.titulo || 'Lista de Exercícios',
      disciplina: inputData.disciplina || '',
      questoes,
      metadata: {
        totalQuestoes: count,
        validQuestoes: 0,
        invalidQuestoes: count,
        extractionMethod: 'template_fallback',
        timestamp: Date.now()
      },
      warnings: ['Conteúdo gerado como template - aguardando resposta da IA']
    };
  }

  /**
   * Pipeline completo com fallbacks
   */
  static processWithFallbacks(data: any, inputData: any): UnifiedExerciseListResponse {
    const sanitizedInput = ExerciseListSanitizer.sanitize(inputData);
    
    const validation = ExerciseListSanitizer.validate(sanitizedInput);
    if (!validation.valid) {
      console.warn('⚠️ [ProgressiveFallback] Contrato de entrada inválido:', validation.errors);
    }
    
    const cacheKey = ExerciseListSanitizer.getCacheKey(sanitizedInput);

    // Tentar processar dados recebidos
    if (data) {
      const result = UnifiedNormalizer.processFullResponse(data, sanitizedInput);
      if (result.success && result.metadata.validQuestoes > 0) {
        this.saveToCache(cacheKey, result);
        return result;
      }
    }

    // Fallback 1: Cache
    const cached = this.getFromCache(cacheKey);
    if (cached && cached.success) {
      console.log('🔄 [ProgressiveFallback] Usando cache como fallback (Blindagem Ativa)');
      return cached;
    }

    // Fallback 2: Template parcial
    console.log('🔄 [ProgressiveFallback] Usando template como fallback (Blindagem Ativa)');
    return this.generatePartialTemplate(sanitizedInput, sanitizedInput.numeroQuestoes);
  }
}

// ============================================================================
// EXPORT PRINCIPAL
// ============================================================================

export function processExerciseListWithUnifiedPipeline(
  data: any,
  inputData: any
): UnifiedExerciseListResponse {
  console.log('🎯 [UnifiedPipeline] Iniciando pipeline unificado');
  return ProgressiveFallback.processWithFallbacks(data, inputData);
}
