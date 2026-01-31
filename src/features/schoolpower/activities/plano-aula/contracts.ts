/**
 * PLANO DE AULA - CONTRATOS DE INTERFACE (Bounded Context Protection)
 * 
 * Este arquivo define os contratos IMUTÁVEIS para a atividade de Plano de Aula.
 * Todas as interfaces usam 'readonly' para prevenir mutações acidentais.
 * 
 * ⚠️ ATENÇÃO: NÃO MODIFIQUE este arquivo sem ler PLANO_AULA_RULES.md
 * 
 * @version 1.0
 * @date Janeiro 2026
 */

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const PLANO_AULA_CONFIG = {
  VERSION: '1.0',
  STORAGE_PREFIX: 'sp_pa_v1_',
  STORAGE_CACHE_PREFIX: 'sp_pa_v1_cache_',
  LEGACY_PREFIX: 'text_content_plano-aula_',
  TEXT_VERSION_PREFIX: 'text_content_plano-aula_',
  MIN_SECTIONS: 1,
  MAX_SECTIONS: 20,
  MIN_OBJECTIVES: 1,
  MAX_OBJECTIVES: 15,
  MIN_TEXT_LENGTH: 3,
  ACTIVITY_TYPE: 'plano-aula',
  PROTECTION_ENABLED: true,
  IS_TEXT_VERSION: true
} as const;

// ============================================================================
// TIPOS ENUMERADOS
// ============================================================================

export type PlanoAulaMethodology = 'expositiva' | 'dialogada' | 'pratica' | 'mista' | 'ativa' | 'investigativa';
export type PlanoAulaDuration = '45min' | '50min' | '90min' | '100min' | '120min' | 'custom';

// ============================================================================
// CONTRATOS DE INTERFACE (IMUTÁVEIS)
// ============================================================================

/**
 * Contrato para a Visão Geral do Plano de Aula
 */
export interface PlanoAulaVisaoGeralContract {
  readonly disciplina: string;
  readonly tema: string;
  readonly serie: string;
  readonly tempo: string;
  readonly metodologia: string;
  readonly recursos: ReadonlyArray<string>;
}

/**
 * Contrato para um Objetivo do Plano de Aula
 */
export interface PlanoAulaObjetivoContract {
  readonly id: number;
  readonly tipo: 'geral' | 'especifico';
  readonly descricao: string;
  readonly habilidadeBNCC?: string;
}

/**
 * Contrato para uma Etapa de Desenvolvimento
 */
export interface PlanoAulaDesenvolvimentoContract {
  readonly id: number;
  readonly titulo: string;
  readonly descricao: string;
  readonly duracao?: string;
  readonly recursos?: ReadonlyArray<string>;
  readonly metodologia?: string;
}

/**
 * Contrato para uma Atividade do Plano
 */
export interface PlanoAulaAtividadeContract {
  readonly id: number;
  readonly nome: string;
  readonly tipo: string;
  readonly descricao: string;
  readonly duracao?: string;
  readonly recursos?: ReadonlyArray<string>;
  readonly objetivosRelacionados?: ReadonlyArray<number>;
}

/**
 * Contrato para Avaliação do Plano
 */
export interface PlanoAulaAvaliacaoContract {
  readonly criterios: ReadonlyArray<string>;
  readonly instrumentos: ReadonlyArray<string>;
  readonly observacoes?: string;
}

/**
 * Contrato de entrada para geração de Plano de Aula
 * Dados que vêm do formulário de edição ou do Chat
 */
export interface PlanoAulaInputContract {
  readonly id?: string;
  readonly titulo?: string;
  readonly disciplina: string;
  readonly tema: string;
  readonly serie: string;
  readonly objetivoGeral: string;
  readonly objetivosEspecificos?: string;
  readonly duracao?: string;
  readonly metodologia?: string;
  readonly recursos?: string;
  readonly anoEscolaridade?: string;
  readonly contextoUso?: string;
  readonly observacoes?: string;
}

/**
 * Contrato de saída após geração de Plano de Aula
 * Dados que são salvos e renderizados
 */
export interface PlanoAulaOutputContract {
  readonly titulo: string;
  readonly visao_geral: PlanoAulaVisaoGeralContract;
  readonly objetivos: ReadonlyArray<PlanoAulaObjetivoContract>;
  readonly metodologia: Readonly<{
    readonly abordagem: string;
    readonly descricao: string;
    readonly tecnicas?: ReadonlyArray<string>;
  }>;
  readonly desenvolvimento: ReadonlyArray<PlanoAulaDesenvolvimentoContract>;
  readonly atividades: ReadonlyArray<PlanoAulaAtividadeContract>;
  readonly avaliacao?: PlanoAulaAvaliacaoContract;
  readonly recursos_complementares?: ReadonlyArray<string>;
  readonly referencias?: ReadonlyArray<string>;
  readonly isGeneratedByAI: boolean;
  readonly generatedAt: string;
  readonly isFallback?: boolean;
}

/**
 * Contrato para resposta do pipeline de Plano de Aula
 */
export interface PlanoAulaResponseContract {
  readonly success: boolean;
  readonly data?: PlanoAulaOutputContract;
  readonly sections?: Readonly<Record<string, unknown>>;
  readonly textContent?: string;
  readonly error?: string;
  readonly timestamp: number;
  readonly isTextVersion: boolean;
}

// ============================================================================
// SANITIZADOR DE ENTRADA
// ============================================================================

/**
 * PlanoAulaSanitizer - Sanitiza e valida dados externos
 * 
 * IMPORTANTE: Todos os dados externos DEVEM passar por este sanitizador
 * antes de serem processados pelo PlanoAulaGenerator ou PlanoAulaPreview
 */
export class PlanoAulaSanitizer {
  /**
   * Sanitiza dados de entrada para geração de Plano de Aula
   */
  static sanitizeInput(data: any): PlanoAulaInputContract {
    console.log('🛡️ [PlanoAulaSanitizer] Sanitizando dados de entrada');
    
    const sanitized: PlanoAulaInputContract = {
      id: this.sanitizeString(data?.id),
      titulo: this.sanitizeString(data?.titulo) || this.sanitizeString(data?.title) || `Plano de Aula: ${this.sanitizeString(data?.tema) || 'Geral'}`,
      disciplina: this.sanitizeString(data?.disciplina) || this.sanitizeString(data?.subject) || 'Geral',
      tema: this.sanitizeString(data?.tema) || this.sanitizeString(data?.theme) || 'Conteúdo Geral',
      serie: this.sanitizeString(data?.serie) || this.sanitizeString(data?.anoEscolaridade) || this.sanitizeString(data?.schoolYear) || 'Não Informado',
      objetivoGeral: this.sanitizeString(data?.objetivoGeral) || this.sanitizeString(data?.objectives) || '',
      objetivosEspecificos: this.sanitizeString(data?.objetivosEspecificos),
      duracao: this.sanitizeString(data?.duracao) || this.sanitizeString(data?.duration) || '50min',
      metodologia: this.sanitizeString(data?.metodologia) || 'mista',
      recursos: this.sanitizeString(data?.recursos),
      anoEscolaridade: this.sanitizeString(data?.anoEscolaridade) || this.sanitizeString(data?.schoolYear),
      contextoUso: this.sanitizeString(data?.contextoUso) || this.sanitizeString(data?.context),
      observacoes: this.sanitizeString(data?.observacoes)
    };

    console.log('✅ [PlanoAulaSanitizer] Dados sanitizados:', {
      titulo: sanitized.titulo,
      disciplina: sanitized.disciplina,
      tema: sanitized.tema,
      serie: sanitized.serie
    });

    return sanitized;
  }

  /**
   * Sanitiza dados de saída completos (para preview/exibição)
   */
  static sanitizeOutput(data: any): PlanoAulaOutputContract | null {
    console.log('🛡️ [PlanoAulaSanitizer] Sanitizando dados de saída para exibição');

    if (!data) {
      console.warn('⚠️ [PlanoAulaSanitizer] Dados de saída nulos');
      return null;
    }

    const actualData = data?.data || data;

    const visao_geral: PlanoAulaVisaoGeralContract = {
      disciplina: this.sanitizeString(actualData?.visao_geral?.disciplina) || 'Geral',
      tema: this.sanitizeString(actualData?.visao_geral?.tema) || 'Tema Geral',
      serie: this.sanitizeString(actualData?.visao_geral?.serie) || 'Não Informado',
      tempo: this.sanitizeString(actualData?.visao_geral?.tempo) || '50min',
      metodologia: this.sanitizeString(actualData?.visao_geral?.metodologia) || 'mista',
      recursos: this.sanitizeArray(actualData?.visao_geral?.recursos)
    };

    const objetivos = this.sanitizeObjetivos(actualData?.objetivos);
    const desenvolvimento = this.sanitizeDesenvolvimento(actualData?.desenvolvimento);
    const atividades = this.sanitizeAtividades(actualData?.atividades);

    const output: PlanoAulaOutputContract = {
      titulo: this.sanitizeString(actualData?.titulo) || 'Plano de Aula',
      visao_geral,
      objetivos,
      metodologia: {
        abordagem: this.sanitizeString(actualData?.metodologia?.abordagem) || 'mista',
        descricao: this.sanitizeString(actualData?.metodologia?.descricao) || '',
        tecnicas: this.sanitizeArray(actualData?.metodologia?.tecnicas)
      },
      desenvolvimento,
      atividades,
      avaliacao: actualData?.avaliacao ? {
        criterios: this.sanitizeArray(actualData.avaliacao.criterios),
        instrumentos: this.sanitizeArray(actualData.avaliacao.instrumentos),
        observacoes: this.sanitizeString(actualData.avaliacao.observacoes)
      } : undefined,
      recursos_complementares: this.sanitizeArray(actualData?.recursos_complementares),
      referencias: this.sanitizeArray(actualData?.referencias),
      isGeneratedByAI: Boolean(actualData?.isGeneratedByAI || actualData?.generatedByAI),
      generatedAt: this.sanitizeString(actualData?.generatedAt) || new Date().toISOString(),
      isFallback: Boolean(actualData?.isFallback)
    };

    console.log('✅ [PlanoAulaSanitizer] Saída sanitizada:', {
      titulo: output.titulo,
      objetivosCount: output.objetivos.length,
      desenvolvimentoCount: output.desenvolvimento.length,
      atividadesCount: output.atividades.length
    });

    return output;
  }

  /**
   * Sanitiza array de objetivos
   */
  private static sanitizeObjetivos(objetivos: any): PlanoAulaObjetivoContract[] {
    if (!Array.isArray(objetivos)) {
      return [{
        id: 1,
        tipo: 'geral',
        descricao: 'Objetivo a ser definido'
      }];
    }

    return objetivos.map((obj, index) => ({
      id: typeof obj?.id === 'number' ? obj.id : index + 1,
      tipo: obj?.tipo === 'especifico' ? 'especifico' : 'geral',
      descricao: this.sanitizeString(obj?.descricao) || `Objetivo ${index + 1}`,
      habilidadeBNCC: this.sanitizeString(obj?.habilidadeBNCC)
    }));
  }

  /**
   * Sanitiza array de desenvolvimento
   */
  private static sanitizeDesenvolvimento(desenvolvimento: any): PlanoAulaDesenvolvimentoContract[] {
    if (!Array.isArray(desenvolvimento)) {
      return [{
        id: 1,
        titulo: 'Etapa de Desenvolvimento',
        descricao: 'Descrição a ser definida'
      }];
    }

    return desenvolvimento.map((etapa, index) => ({
      id: typeof etapa?.id === 'number' ? etapa.id : index + 1,
      titulo: this.sanitizeString(etapa?.titulo) || `Etapa ${index + 1}`,
      descricao: this.sanitizeString(etapa?.descricao) || '',
      duracao: this.sanitizeString(etapa?.duracao),
      recursos: this.sanitizeArray(etapa?.recursos),
      metodologia: this.sanitizeString(etapa?.metodologia)
    }));
  }

  /**
   * Sanitiza array de atividades
   */
  private static sanitizeAtividades(atividades: any): PlanoAulaAtividadeContract[] {
    if (!Array.isArray(atividades)) {
      return [{
        id: 1,
        nome: 'Atividade',
        tipo: 'geral',
        descricao: 'Descrição a ser definida'
      }];
    }

    return atividades.map((atividade, index) => ({
      id: typeof atividade?.id === 'number' ? atividade.id : index + 1,
      nome: this.sanitizeString(atividade?.nome) || `Atividade ${index + 1}`,
      tipo: this.sanitizeString(atividade?.tipo) || 'geral',
      descricao: this.sanitizeString(atividade?.descricao) || '',
      duracao: this.sanitizeString(atividade?.duracao),
      recursos: this.sanitizeArray(atividade?.recursos),
      objetivosRelacionados: Array.isArray(atividade?.objetivosRelacionados) 
        ? atividade.objetivosRelacionados.filter((n: any) => typeof n === 'number')
        : undefined
    }));
  }

  /**
   * Valida se os dados de entrada estão completos
   */
  static validate(data: PlanoAulaInputContract): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!data.tema || data.tema.trim() === '') {
      errors.push('Tema é obrigatório');
    }

    if (!data.disciplina || data.disciplina.trim() === '') {
      errors.push('Disciplina é obrigatória');
    }

    if (!data.serie || data.serie.trim() === '') {
      errors.push('Série/Ano é obrigatório');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * Gera chave de cache para Plano de Aula
   */
  static getCacheKey(data: PlanoAulaInputContract): string {
    const tema = (data.tema || 'default').substring(0, 20).replace(/\s+/g, '_');
    const disciplina = (data.disciplina || 'geral').substring(0, 15).replace(/\s+/g, '_');
    return `${PLANO_AULA_CONFIG.STORAGE_CACHE_PREFIX}${data.id || 'new'}_${tema}_${disciplina}`;
  }

  /**
   * Gera chave de storage para persistência
   */
  static getStorageKey(activityId: string): string {
    return `${PLANO_AULA_CONFIG.STORAGE_PREFIX}${activityId}`;
  }

  /**
   * Gera chave de storage para text-version (compatibilidade)
   */
  static getTextVersionStorageKey(activityId: string): string {
    return `${PLANO_AULA_CONFIG.TEXT_VERSION_PREFIX}${activityId}`;
  }

  /**
   * Gera chave de storage legacy (para compatibilidade)
   */
  static getLegacyStorageKey(activityId: string): string {
    return `${PLANO_AULA_CONFIG.LEGACY_PREFIX}${activityId}`;
  }

  // ============================================================================
  // HELPERS PRIVADOS
  // ============================================================================

  private static sanitizeString(value: any): string {
    if (typeof value === 'string') {
      return value.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
    }
    if (typeof value === 'number') {
      return String(value);
    }
    return '';
  }

  private static sanitizeArray(value: any): string[] {
    if (!Array.isArray(value)) {
      return [];
    }
    return value
      .filter(item => item !== null && item !== undefined)
      .map(item => typeof item === 'string' ? item.trim() : String(item))
      .filter(item => item.length > 0);
  }
}

// ============================================================================
// FUNÇÕES DE STORAGE COM NAMESPACE DEDICADO
// ============================================================================

/**
 * Salva dados de Plano de Aula no storage com namespace dedicado
 */
export function savePlanoAulaToStorage(activityId: string, data: any): boolean {
  try {
    const key = PlanoAulaSanitizer.getStorageKey(activityId);
    const textVersionKey = PlanoAulaSanitizer.getTextVersionStorageKey(activityId);
    
    const sanitizedOutput = PlanoAulaSanitizer.sanitizeOutput(data);
    
    const storageData = {
      success: true,
      data: sanitizedOutput,
      timestamp: new Date().toISOString(),
      activityId: activityId,
      _namespace: PLANO_AULA_CONFIG.VERSION,
      isTextVersion: true
    };

    localStorage.setItem(key, JSON.stringify(storageData));
    localStorage.setItem(textVersionKey, JSON.stringify(storageData));
    
    console.log(`💾 [PlanoAulaStorage] Salvo com namespace: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ [PlanoAulaStorage] Erro ao salvar:', error);
    return false;
  }
}

/**
 * Carrega dados de Plano de Aula do storage
 */
export function loadPlanoAulaFromStorage(activityId: string): PlanoAulaOutputContract | null {
  try {
    const newKey = PlanoAulaSanitizer.getStorageKey(activityId);
    const textVersionKey = PlanoAulaSanitizer.getTextVersionStorageKey(activityId);
    const legacyKey = PlanoAulaSanitizer.getLegacyStorageKey(activityId);

    let data = localStorage.getItem(newKey);
    let source = 'new';
    
    if (!data) {
      data = localStorage.getItem(textVersionKey);
      source = 'text-version';
    }
    
    if (!data) {
      data = localStorage.getItem(legacyKey);
      source = 'legacy';
    }

    if (!data) {
      console.log(`📭 [PlanoAulaStorage] Nenhum dado encontrado para: ${activityId}`);
      return null;
    }

    const parsed = JSON.parse(data);
    const sanitized = PlanoAulaSanitizer.sanitizeOutput(parsed);
    
    if (sanitized) {
      console.log(`📦 [PlanoAulaStorage] Carregado de ${source}: ${activityId}`);
    }

    return sanitized;
  } catch (error) {
    console.error('❌ [PlanoAulaStorage] Erro ao carregar:', error);
    return null;
  }
}

/**
 * Verifica se existem dados de Plano de Aula no storage
 */
export function hasPlanoAulaInStorage(activityId: string): boolean {
  const newKey = PlanoAulaSanitizer.getStorageKey(activityId);
  const textVersionKey = PlanoAulaSanitizer.getTextVersionStorageKey(activityId);
  const legacyKey = PlanoAulaSanitizer.getLegacyStorageKey(activityId);
  
  return localStorage.getItem(newKey) !== null || 
         localStorage.getItem(textVersionKey) !== null ||
         localStorage.getItem(legacyKey) !== null;
}

console.log('📚 [PlanoAulaContracts] Contratos de Plano de Aula carregados v' + PLANO_AULA_CONFIG.VERSION);
