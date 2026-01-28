/**
 * FLASH CARDS - CONTRATOS DE INTERFACE (Bounded Context Protection)
 * 
 * Este arquivo define os contratos IMUTÁVEIS para a atividade de Flash Cards.
 * Todas as interfaces usam 'readonly' para prevenir mutações acidentais.
 * 
 * ⚠️ ATENÇÃO: NÃO MODIFIQUE este arquivo sem ler FLASH_CARDS_RULES.md
 * 
 * @version 2.0
 * @date Janeiro 2026
 */

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const FLASH_CARDS_CONFIG = {
  VERSION: '2.0',
  STORAGE_PREFIX: 'sp_fc_v2_',
  STORAGE_CACHE_PREFIX: 'sp_fc_v2_cache_',
  LEGACY_PREFIX: 'constructed_flash-cards_',
  MIN_CARDS: 1,
  MAX_CARDS: 50,
  MIN_TEXT_LENGTH: 3,
  ACTIVITY_TYPE: 'flash-cards',
  PROTECTION_ENABLED: true
} as const;

// ============================================================================
// CONTRATOS DE INTERFACE (IMUTÁVEIS)
// ============================================================================

/**
 * Contrato para um Flash Card individual
 * Cada card deve ter obrigatoriamente front e back
 */
export interface FlashCardContract {
  readonly id: number;
  readonly front: string;
  readonly back: string;
  readonly category?: string;
  readonly difficulty?: string;
}

/**
 * Contrato de entrada para geração de Flash Cards
 * Dados que vêm do formulário de edição ou do Chat
 */
export interface FlashCardsInputContract {
  readonly id?: string;
  readonly title?: string;
  readonly theme: string;
  readonly subject?: string;
  readonly schoolYear?: string;
  readonly topicos: string;
  readonly numberOfFlashcards: number;
  readonly context?: string;
  readonly difficultyLevel?: string;
  readonly objectives?: string;
  readonly instructions?: string;
  readonly evaluation?: string;
}

/**
 * Contrato de saída após geração de Flash Cards
 * Dados que são salvos e renderizados
 */
export interface FlashCardsOutputContract {
  readonly title: string;
  readonly description?: string;
  readonly cards: readonly FlashCardContract[];
  readonly totalCards: number;
  readonly theme: string;
  readonly subject?: string;
  readonly schoolYear?: string;
  readonly topicos?: string;
  readonly numberOfFlashcards: number;
  readonly contextoUso?: string;
  readonly difficultyLevel?: string;
  readonly objectives?: string;
  readonly instructions?: string;
  readonly evaluation?: string;
  readonly generatedByAI: boolean;
  readonly generatedAt: string;
  readonly isGeneratedByAI: boolean;
  readonly isFallback?: boolean;
}

/**
 * Contrato para resposta do pipeline de Flash Cards
 */
export interface FlashCardsResponseContract {
  readonly success: boolean;
  readonly data?: FlashCardsOutputContract;
  readonly error?: string;
  readonly timestamp: number;
}

// ============================================================================
// SANITIZADOR DE ENTRADA
// ============================================================================

/**
 * FlashCardsSanitizer - Sanitiza e valida dados externos
 * 
 * IMPORTANTE: Todos os dados externos DEVEM passar por este sanitizador
 * antes de serem processados pelo FlashCardsGenerator ou FlashCardsPreview
 */
export class FlashCardsSanitizer {
  /**
   * Sanitiza dados de entrada para geração de Flash Cards
   */
  static sanitizeInput(data: any): FlashCardsInputContract {
    console.log('🛡️ [FlashCardsSanitizer] Sanitizando dados de entrada');
    
    const numberOfFlashcards = this.parseNumber(
      data?.numberOfFlashcards ?? data?.numberOfCards ?? data?.numCards ?? 10,
      FLASH_CARDS_CONFIG.MIN_CARDS,
      FLASH_CARDS_CONFIG.MAX_CARDS
    );

    const sanitized: FlashCardsInputContract = {
      id: this.sanitizeString(data?.id),
      title: this.sanitizeString(data?.title) || `Flash Cards: ${this.sanitizeString(data?.theme) || 'Estudo'}`,
      theme: this.sanitizeString(data?.theme) || 'Tema Geral',
      subject: this.sanitizeString(data?.subject) || this.sanitizeString(data?.disciplina) || 'Geral',
      schoolYear: this.sanitizeString(data?.schoolYear) || this.sanitizeString(data?.anoEscolaridade) || 'Ensino Médio',
      topicos: this.sanitizeString(data?.topicos) || '',
      numberOfFlashcards,
      context: this.sanitizeString(data?.context) || this.sanitizeString(data?.contextoUso) || '',
      difficultyLevel: this.sanitizeString(data?.difficultyLevel) || this.sanitizeString(data?.nivelDificuldade) || 'Médio',
      objectives: this.sanitizeString(data?.objectives),
      instructions: this.sanitizeString(data?.instructions),
      evaluation: this.sanitizeString(data?.evaluation)
    };

    console.log('✅ [FlashCardsSanitizer] Dados sanitizados:', {
      theme: sanitized.theme,
      numberOfFlashcards: sanitized.numberOfFlashcards,
      subject: sanitized.subject
    });

    return sanitized;
  }

  /**
   * Sanitiza um array de cards, validando cada um
   */
  static sanitizeCards(cards: any): FlashCardContract[] {
    console.log('🛡️ [FlashCardsSanitizer] Sanitizando cards');

    if (!Array.isArray(cards)) {
      console.warn('⚠️ [FlashCardsSanitizer] Cards não é um array');
      return [];
    }

    const sanitizedCards: FlashCardContract[] = [];

    for (let i = 0; i < cards.length; i++) {
      const card = cards[i];
      
      if (!card || typeof card !== 'object') {
        console.warn(`⚠️ [FlashCardsSanitizer] Card ${i} inválido - não é objeto`);
        continue;
      }

      const front = this.sanitizeString(card.front);
      const back = this.sanitizeString(card.back);

      if (!front || front.length < FLASH_CARDS_CONFIG.MIN_TEXT_LENGTH) {
        console.warn(`⚠️ [FlashCardsSanitizer] Card ${i} sem 'front' válido`);
        continue;
      }

      if (!back || back.length < FLASH_CARDS_CONFIG.MIN_TEXT_LENGTH) {
        console.warn(`⚠️ [FlashCardsSanitizer] Card ${i} sem 'back' válido`);
        continue;
      }

      sanitizedCards.push({
        id: typeof card.id === 'number' ? card.id : sanitizedCards.length + 1,
        front: front.trim(),
        back: back.trim(),
        category: this.sanitizeString(card.category) || 'Geral',
        difficulty: this.sanitizeString(card.difficulty) || 'Médio'
      });
    }

    console.log(`✅ [FlashCardsSanitizer] ${sanitizedCards.length} cards válidos de ${cards.length} totais`);
    return sanitizedCards;
  }

  /**
   * Sanitiza dados de saída completos (para preview/exibição)
   */
  static sanitizeOutput(data: any): FlashCardsOutputContract | null {
    console.log('🛡️ [FlashCardsSanitizer] Sanitizando dados de saída para exibição');

    if (!data) {
      console.warn('⚠️ [FlashCardsSanitizer] Dados de saída nulos');
      return null;
    }

    // Extrair dados da estrutura (pode vir aninhado)
    const actualData = data?.data || data;

    // Buscar cards em diferentes propriedades possíveis
    let rawCards = actualData?.cards || 
                   actualData?.flashcards || 
                   actualData?.flashCards ||
                   data?.cards ||
                   data?.flashcards ||
                   [];

    const cards = this.sanitizeCards(rawCards);

    if (cards.length === 0) {
      console.warn('⚠️ [FlashCardsSanitizer] Nenhum card válido encontrado');
      return null;
    }

    const output: FlashCardsOutputContract = {
      title: this.sanitizeString(actualData?.title) || this.sanitizeString(data?.title) || 'Flash Cards',
      description: this.sanitizeString(actualData?.description) || this.sanitizeString(data?.description),
      cards: cards,
      totalCards: cards.length,
      theme: this.sanitizeString(actualData?.theme) || this.sanitizeString(data?.theme) || 'Tema Geral',
      subject: this.sanitizeString(actualData?.subject) || this.sanitizeString(data?.subject) || 'Geral',
      schoolYear: this.sanitizeString(actualData?.schoolYear) || this.sanitizeString(data?.schoolYear) || 'Ensino Médio',
      topicos: this.sanitizeString(actualData?.topicos) || this.sanitizeString(data?.topicos),
      numberOfFlashcards: cards.length,
      contextoUso: this.sanitizeString(actualData?.contextoUso) || this.sanitizeString(actualData?.context),
      difficultyLevel: this.sanitizeString(actualData?.difficultyLevel) || 'Médio',
      objectives: this.sanitizeString(actualData?.objectives),
      instructions: this.sanitizeString(actualData?.instructions),
      evaluation: this.sanitizeString(actualData?.evaluation),
      generatedByAI: Boolean(actualData?.generatedByAI || actualData?.isGeneratedByAI || data?.generatedByAI),
      generatedAt: this.sanitizeString(actualData?.generatedAt) || new Date().toISOString(),
      isGeneratedByAI: Boolean(actualData?.isGeneratedByAI || actualData?.generatedByAI || data?.isGeneratedByAI),
      isFallback: Boolean(actualData?.isFallback || data?.isFallback)
    };

    console.log('✅ [FlashCardsSanitizer] Saída sanitizada:', {
      title: output.title,
      totalCards: output.totalCards,
      generatedByAI: output.generatedByAI
    });

    return output;
  }

  /**
   * Valida se os dados de entrada estão completos
   */
  static validate(data: FlashCardsInputContract): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.theme || data.theme.trim() === '') {
      errors.push('Tema é obrigatório');
    }

    if (!data.topicos || data.topicos.trim() === '') {
      errors.push('Tópicos são obrigatórios');
    }

    if (data.numberOfFlashcards < FLASH_CARDS_CONFIG.MIN_CARDS) {
      errors.push(`Número mínimo de cards é ${FLASH_CARDS_CONFIG.MIN_CARDS}`);
    }

    if (data.numberOfFlashcards > FLASH_CARDS_CONFIG.MAX_CARDS) {
      errors.push(`Número máximo de cards é ${FLASH_CARDS_CONFIG.MAX_CARDS}`);
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera chave de cache para Flash Cards
   */
  static getCacheKey(data: FlashCardsInputContract): string {
    const theme = (data.theme || 'default').substring(0, 20).replace(/\s+/g, '_');
    const count = data.numberOfFlashcards || 10;
    return `${FLASH_CARDS_CONFIG.STORAGE_CACHE_PREFIX}${data.id || 'new'}_${theme}_${count}`;
  }

  /**
   * Gera chave de storage para persistência
   */
  static getStorageKey(activityId: string): string {
    return `${FLASH_CARDS_CONFIG.STORAGE_PREFIX}${activityId}`;
  }

  /**
   * Gera chave de storage legacy (para compatibilidade)
   */
  static getLegacyStorageKey(activityId: string): string {
    return `${FLASH_CARDS_CONFIG.LEGACY_PREFIX}${activityId}`;
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  private static sanitizeString(value: any): string {
    if (typeof value === 'string') {
      return value.trim();
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return '';
  }

  private static parseNumber(value: any, min: number, max: number): number {
    let num: number;
    
    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = parseInt(value, 10);
    } else {
      num = 10; // default
    }

    if (isNaN(num)) {
      num = 10;
    }

    return Math.max(min, Math.min(max, num));
  }
}

// ============================================================================
// FUNÇÕES UTILITÁRIAS EXPORTADAS
// ============================================================================

/**
 * Gera chave de cache para Flash Cards
 */
export function generateFlashCardsCacheKey(data: any): string {
  const sanitized = FlashCardsSanitizer.sanitizeInput(data);
  return FlashCardsSanitizer.getCacheKey(sanitized);
}

/**
 * Valida dados de entrada de Flash Cards
 */
export function validateFlashCardsInput(data: any): { valid: boolean; errors: string[] } {
  const sanitized = FlashCardsSanitizer.sanitizeInput(data);
  return FlashCardsSanitizer.validate(sanitized);
}

// ============================================================================
// FUNÇÕES DE STORAGE COM NAMESPACE DEDICADO
// ============================================================================

/**
 * Salva dados de Flash Cards no storage com namespace dedicado
 * Usa o novo prefixo sp_fc_v2_ para isolamento
 */
export function saveFlashCardsToStorage(activityId: string, data: any): boolean {
  try {
    const key = FlashCardsSanitizer.getStorageKey(activityId);
    const sanitizedOutput = FlashCardsSanitizer.sanitizeOutput(data);
    
    if (!sanitizedOutput) {
      console.warn('⚠️ [FlashCardsStorage] Dados inválidos para salvar');
      return false;
    }

    const storageData = {
      success: true,
      data: sanitizedOutput,
      timestamp: new Date().toISOString(),
      activityId: activityId,
      _namespace: FLASH_CARDS_CONFIG.VERSION
    };

    localStorage.setItem(key, JSON.stringify(storageData));
    console.log(`💾 [FlashCardsStorage] Salvo com namespace: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ [FlashCardsStorage] Erro ao salvar:', error);
    return false;
  }
}

/**
 * Carrega dados de Flash Cards do storage
 * Tenta novo prefixo primeiro, depois legacy para compatibilidade
 */
export function loadFlashCardsFromStorage(activityId: string): FlashCardsOutputContract | null {
  try {
    const newKey = FlashCardsSanitizer.getStorageKey(activityId);
    const legacyKey = FlashCardsSanitizer.getLegacyStorageKey(activityId);

    let data = localStorage.getItem(newKey);
    let source = 'new';
    
    if (!data) {
      data = localStorage.getItem(legacyKey);
      source = 'legacy';
    }

    if (!data) {
      console.log(`📭 [FlashCardsStorage] Nenhum dado encontrado para: ${activityId}`);
      return null;
    }

    const parsed = JSON.parse(data);
    const sanitized = FlashCardsSanitizer.sanitizeOutput(parsed);
    
    if (sanitized) {
      console.log(`📦 [FlashCardsStorage] Carregado de ${source}: ${activityId} (${sanitized.totalCards} cards)`);
    }

    return sanitized;
  } catch (error) {
    console.error('❌ [FlashCardsStorage] Erro ao carregar:', error);
    return null;
  }
}

/**
 * Verifica se existem dados de Flash Cards no storage
 */
export function hasFlashCardsInStorage(activityId: string): boolean {
  const newKey = FlashCardsSanitizer.getStorageKey(activityId);
  const legacyKey = FlashCardsSanitizer.getLegacyStorageKey(activityId);
  return localStorage.getItem(newKey) !== null || localStorage.getItem(legacyKey) !== null;
}

console.log('🃏 [FlashCardsContracts] Contratos de Flash Cards carregados v' + FLASH_CARDS_CONFIG.VERSION);
