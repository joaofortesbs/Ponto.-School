/**
 * SEQUÊNCIA DIDÁTICA - CONTRATOS DE INTERFACE (Bounded Context Protection)
 * 
 * Este arquivo define os contratos IMUTÁVEIS para a atividade de Sequência Didática.
 * Todas as interfaces usam 'readonly' para prevenir mutações acidentais.
 * 
 * ⚠️ ATENÇÃO: NÃO MODIFIQUE este arquivo sem ler SEQUENCIA_DIDATICA_RULES.md
 * 
 * @version 1.0
 * @date Janeiro 2026
 */

// ============================================================================
// CONFIGURAÇÃO GLOBAL
// ============================================================================

export const SEQUENCIA_DIDATICA_CONFIG = {
  VERSION: '1.0',
  STORAGE_PREFIX: 'sp_sd_v1_',
  STORAGE_CACHE_PREFIX: 'sp_sd_v1_cache_',
  LEGACY_PREFIX: 'text_content_sequencia-didatica_',
  TEXT_VERSION_PREFIX: 'text_content_sequencia-didatica_',
  MIN_ETAPAS: 1,
  MAX_ETAPAS: 20,
  MIN_AULAS: 1,
  MAX_AULAS: 30,
  MIN_TEXT_LENGTH: 3,
  ACTIVITY_TYPE: 'sequencia-didatica',
  PROTECTION_ENABLED: true,
  IS_TEXT_VERSION: true
} as const;

// ============================================================================
// TIPOS ENUMERADOS
// ============================================================================

export type SequenciaDuration = '1 semana' | '2 semanas' | '1 mês' | '2 meses' | 'bimestre' | 'trimestre' | 'semestre' | 'custom';
export type EtapaTipo = 'introducao' | 'desenvolvimento' | 'consolidacao' | 'avaliacao' | 'recuperacao';

// ============================================================================
// CONTRATOS DE INTERFACE (IMUTÁVEIS)
// ============================================================================

/**
 * Contrato para Informações Gerais da Sequência Didática
 */
export interface SequenciaInfoGeralContract {
  readonly disciplina: string;
  readonly tema: string;
  readonly serie: string;
  readonly duracao: string;
  readonly numeroAulas: number;
  readonly objetivoGeral: string;
  readonly justificativa?: string;
}

/**
 * Contrato para um Objetivo de Aprendizagem
 */
export interface SequenciaObjetivoContract {
  readonly id: number;
  readonly tipo: 'geral' | 'especifico';
  readonly descricao: string;
  readonly habilidadeBNCC?: string;
  readonly competenciaBNCC?: string;
}

/**
 * Contrato para uma Aula/Etapa da Sequência
 */
export interface SequenciaEtapaContract {
  readonly id: number;
  readonly numero: number;
  readonly titulo: string;
  readonly tipo: EtapaTipo;
  readonly duracao: string;
  readonly objetivos: ReadonlyArray<string>;
  readonly conteudos: ReadonlyArray<string>;
  readonly metodologia: string;
  readonly recursos: ReadonlyArray<string>;
  readonly atividades: ReadonlyArray<{
    readonly nome: string;
    readonly descricao: string;
    readonly duracao?: string;
  }>;
  readonly avaliacao?: string;
  readonly tarefaCasa?: string;
}

/**
 * Contrato para Avaliação da Sequência
 */
export interface SequenciaAvaliacaoContract {
  readonly criterios: ReadonlyArray<string>;
  readonly instrumentos: ReadonlyArray<string>;
  readonly rubricas?: ReadonlyArray<{
    readonly criterio: string;
    readonly niveis: ReadonlyArray<{
      readonly nivel: string;
      readonly descricao: string;
    }>;
  }>;
  readonly recuperacao?: string;
}

/**
 * Contrato de entrada para geração de Sequência Didática
 */
export interface SequenciaDidaticaInputContract {
  readonly id?: string;
  readonly titulo?: string;
  readonly disciplina: string;
  readonly tema: string;
  readonly serie: string;
  readonly objetivoGeral: string;
  readonly objetivosEspecificos?: string;
  readonly duracao?: string;
  readonly numeroAulas?: number;
  readonly metodologia?: string;
  readonly recursos?: string;
  readonly anoEscolaridade?: string;
  readonly contextoUso?: string;
  readonly justificativa?: string;
  readonly observacoes?: string;
}

/**
 * Contrato de saída após geração de Sequência Didática
 */
export interface SequenciaDidaticaOutputContract {
  readonly titulo: string;
  readonly info_geral: SequenciaInfoGeralContract;
  readonly objetivos: ReadonlyArray<SequenciaObjetivoContract>;
  readonly etapas: ReadonlyArray<SequenciaEtapaContract>;
  readonly avaliacao: SequenciaAvaliacaoContract;
  readonly recursos_gerais: ReadonlyArray<string>;
  readonly referencias?: ReadonlyArray<string>;
  readonly cronograma?: string;
  readonly adaptacoes?: string;
  readonly isGeneratedByAI: boolean;
  readonly generatedAt: string;
  readonly isFallback?: boolean;
}

/**
 * Contrato para resposta do pipeline de Sequência Didática
 */
export interface SequenciaDidaticaResponseContract {
  readonly success: boolean;
  readonly data?: SequenciaDidaticaOutputContract;
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
 * SequenciaDidaticaSanitizer - Sanitiza e valida dados externos
 * 
 * IMPORTANTE: Todos os dados externos DEVEM passar por este sanitizador
 * antes de serem processados pelo SequenciaDidaticaGenerator ou Preview
 */
export class SequenciaDidaticaSanitizer {
  /**
   * Sanitiza dados de entrada para geração de Sequência Didática
   */
  static sanitizeInput(data: any): SequenciaDidaticaInputContract {
    console.log('🛡️ [SequenciaDidaticaSanitizer] Sanitizando dados de entrada');
    
    const sanitized: SequenciaDidaticaInputContract = {
      id: this.sanitizeString(data?.id),
      titulo: this.sanitizeString(data?.titulo) || this.sanitizeString(data?.title) || `Sequência Didática: ${this.sanitizeString(data?.tema) || 'Geral'}`,
      disciplina: this.sanitizeString(data?.disciplina) || this.sanitizeString(data?.subject) || 'Geral',
      tema: this.sanitizeString(data?.tema) || this.sanitizeString(data?.theme) || 'Conteúdo Geral',
      serie: this.sanitizeString(data?.serie) || this.sanitizeString(data?.anoEscolaridade) || this.sanitizeString(data?.schoolYear) || 'Não Informado',
      objetivoGeral: this.sanitizeString(data?.objetivoGeral) || this.sanitizeString(data?.objectives) || '',
      objetivosEspecificos: this.sanitizeString(data?.objetivosEspecificos),
      duracao: this.sanitizeString(data?.duracao) || this.sanitizeString(data?.duration) || '2 semanas',
      numeroAulas: this.parseNumber(data?.numeroAulas || data?.numberOfClasses, 1, 30, 6),
      metodologia: this.sanitizeString(data?.metodologia) || 'ativa',
      recursos: this.sanitizeString(data?.recursos),
      anoEscolaridade: this.sanitizeString(data?.anoEscolaridade) || this.sanitizeString(data?.schoolYear),
      contextoUso: this.sanitizeString(data?.contextoUso) || this.sanitizeString(data?.context),
      justificativa: this.sanitizeString(data?.justificativa),
      observacoes: this.sanitizeString(data?.observacoes)
    };

    console.log('✅ [SequenciaDidaticaSanitizer] Dados sanitizados:', {
      titulo: sanitized.titulo,
      disciplina: sanitized.disciplina,
      tema: sanitized.tema,
      serie: sanitized.serie,
      numeroAulas: sanitized.numeroAulas
    });

    return sanitized;
  }

  /**
   * Sanitiza dados de saída completos (para preview/exibição)
   */
  static sanitizeOutput(data: any): SequenciaDidaticaOutputContract | null {
    console.log('🛡️ [SequenciaDidaticaSanitizer] Sanitizando dados de saída para exibição');

    if (!data) {
      console.warn('⚠️ [SequenciaDidaticaSanitizer] Dados de saída nulos');
      return null;
    }

    const actualData = data?.data || data;

    const info_geral: SequenciaInfoGeralContract = {
      disciplina: this.sanitizeString(actualData?.info_geral?.disciplina) || 'Geral',
      tema: this.sanitizeString(actualData?.info_geral?.tema) || 'Tema Geral',
      serie: this.sanitizeString(actualData?.info_geral?.serie) || 'Não Informado',
      duracao: this.sanitizeString(actualData?.info_geral?.duracao) || '2 semanas',
      numeroAulas: this.parseNumber(actualData?.info_geral?.numeroAulas, 1, 30, 6),
      objetivoGeral: this.sanitizeString(actualData?.info_geral?.objetivoGeral) || '',
      justificativa: this.sanitizeString(actualData?.info_geral?.justificativa)
    };

    const objetivos = this.sanitizeObjetivos(actualData?.objetivos);
    const etapas = this.sanitizeEtapas(actualData?.etapas);
    const avaliacao = this.sanitizeAvaliacao(actualData?.avaliacao);

    const output: SequenciaDidaticaOutputContract = {
      titulo: this.sanitizeString(actualData?.titulo) || 'Sequência Didática',
      info_geral,
      objetivos,
      etapas,
      avaliacao,
      recursos_gerais: this.sanitizeArray(actualData?.recursos_gerais),
      referencias: this.sanitizeArray(actualData?.referencias),
      cronograma: this.sanitizeString(actualData?.cronograma),
      adaptacoes: this.sanitizeString(actualData?.adaptacoes),
      isGeneratedByAI: Boolean(actualData?.isGeneratedByAI || actualData?.generatedByAI),
      generatedAt: this.sanitizeString(actualData?.generatedAt) || new Date().toISOString(),
      isFallback: Boolean(actualData?.isFallback)
    };

    console.log('✅ [SequenciaDidaticaSanitizer] Saída sanitizada:', {
      titulo: output.titulo,
      objetivosCount: output.objetivos.length,
      etapasCount: output.etapas.length
    });

    return output;
  }

  /**
   * Sanitiza array de objetivos
   */
  private static sanitizeObjetivos(objetivos: any): SequenciaObjetivoContract[] {
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
      habilidadeBNCC: this.sanitizeString(obj?.habilidadeBNCC),
      competenciaBNCC: this.sanitizeString(obj?.competenciaBNCC)
    }));
  }

  /**
   * Sanitiza array de etapas
   */
  private static sanitizeEtapas(etapas: any): SequenciaEtapaContract[] {
    if (!Array.isArray(etapas)) {
      return [{
        id: 1,
        numero: 1,
        titulo: 'Etapa 1',
        tipo: 'introducao',
        duracao: '1 aula',
        objetivos: [],
        conteudos: [],
        metodologia: '',
        recursos: [],
        atividades: []
      }];
    }

    return etapas.map((etapa, index) => ({
      id: typeof etapa?.id === 'number' ? etapa.id : index + 1,
      numero: typeof etapa?.numero === 'number' ? etapa.numero : index + 1,
      titulo: this.sanitizeString(etapa?.titulo) || `Etapa ${index + 1}`,
      tipo: this.sanitizeEtapaTipo(etapa?.tipo),
      duracao: this.sanitizeString(etapa?.duracao) || '1 aula',
      objetivos: this.sanitizeArray(etapa?.objetivos),
      conteudos: this.sanitizeArray(etapa?.conteudos),
      metodologia: this.sanitizeString(etapa?.metodologia) || '',
      recursos: this.sanitizeArray(etapa?.recursos),
      atividades: this.sanitizeAtividadesEtapa(etapa?.atividades),
      avaliacao: this.sanitizeString(etapa?.avaliacao),
      tarefaCasa: this.sanitizeString(etapa?.tarefaCasa)
    }));
  }

  /**
   * Sanitiza atividades de uma etapa
   */
  private static sanitizeAtividadesEtapa(atividades: any): Array<{ nome: string; descricao: string; duracao?: string }> {
    if (!Array.isArray(atividades)) {
      return [];
    }

    return atividades.map((ativ, index) => ({
      nome: this.sanitizeString(ativ?.nome) || `Atividade ${index + 1}`,
      descricao: this.sanitizeString(ativ?.descricao) || '',
      duracao: this.sanitizeString(ativ?.duracao)
    }));
  }

  /**
   * Sanitiza avaliação
   */
  private static sanitizeAvaliacao(avaliacao: any): SequenciaAvaliacaoContract {
    return {
      criterios: this.sanitizeArray(avaliacao?.criterios),
      instrumentos: this.sanitizeArray(avaliacao?.instrumentos),
      rubricas: Array.isArray(avaliacao?.rubricas) ? avaliacao.rubricas.map((r: any) => ({
        criterio: this.sanitizeString(r?.criterio) || '',
        niveis: Array.isArray(r?.niveis) ? r.niveis.map((n: any) => ({
          nivel: this.sanitizeString(n?.nivel) || '',
          descricao: this.sanitizeString(n?.descricao) || ''
        })) : []
      })) : undefined,
      recuperacao: this.sanitizeString(avaliacao?.recuperacao)
    };
  }

  /**
   * Sanitiza tipo de etapa
   */
  private static sanitizeEtapaTipo(tipo: any): EtapaTipo {
    const validTipos: EtapaTipo[] = ['introducao', 'desenvolvimento', 'consolidacao', 'avaliacao', 'recuperacao'];
    const normalized = this.sanitizeString(tipo).toLowerCase();
    return validTipos.includes(normalized as EtapaTipo) ? (normalized as EtapaTipo) : 'desenvolvimento';
  }

  /**
   * Valida se os dados de entrada estão completos
   */
  static validate(data: SequenciaDidaticaInputContract): { valid: boolean; errors: string[] } {
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
   * Gera chave de cache
   */
  static getCacheKey(data: SequenciaDidaticaInputContract): string {
    const tema = (data.tema || 'default').substring(0, 20).replace(/\s+/g, '_');
    const disciplina = (data.disciplina || 'geral').substring(0, 15).replace(/\s+/g, '_');
    return `${SEQUENCIA_DIDATICA_CONFIG.STORAGE_CACHE_PREFIX}${data.id || 'new'}_${tema}_${disciplina}`;
  }

  /**
   * Gera chave de storage para persistência
   */
  static getStorageKey(activityId: string): string {
    return `${SEQUENCIA_DIDATICA_CONFIG.STORAGE_PREFIX}${activityId}`;
  }

  /**
   * Gera chave de storage para text-version
   */
  static getTextVersionStorageKey(activityId: string): string {
    return `${SEQUENCIA_DIDATICA_CONFIG.TEXT_VERSION_PREFIX}${activityId}`;
  }

  /**
   * Gera chave de storage legacy
   */
  static getLegacyStorageKey(activityId: string): string {
    return `${SEQUENCIA_DIDATICA_CONFIG.LEGACY_PREFIX}${activityId}`;
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

  private static parseNumber(value: any, min: number, max: number, defaultValue: number): number {
    let num: number;
    
    if (typeof value === 'number') {
      num = value;
    } else if (typeof value === 'string') {
      num = parseInt(value, 10);
    } else {
      num = defaultValue;
    }

    if (isNaN(num)) {
      num = defaultValue;
    }

    return Math.max(min, Math.min(max, num));
  }
}

// ============================================================================
// FUNÇÕES DE STORAGE COM NAMESPACE DEDICADO
// ============================================================================

/**
 * Salva dados de Sequência Didática no storage
 */
export function saveSequenciaDidaticaToStorage(activityId: string, data: any): boolean {
  try {
    const key = SequenciaDidaticaSanitizer.getStorageKey(activityId);
    const textVersionKey = SequenciaDidaticaSanitizer.getTextVersionStorageKey(activityId);
    
    const sanitizedOutput = SequenciaDidaticaSanitizer.sanitizeOutput(data);
    
    const storageData = {
      success: true,
      data: sanitizedOutput,
      timestamp: new Date().toISOString(),
      activityId: activityId,
      _namespace: SEQUENCIA_DIDATICA_CONFIG.VERSION,
      isTextVersion: true
    };

    localStorage.setItem(key, JSON.stringify(storageData));
    localStorage.setItem(textVersionKey, JSON.stringify(storageData));
    
    console.log(`💾 [SequenciaDidaticaStorage] Salvo com namespace: ${key}`);
    return true;
  } catch (error) {
    console.error('❌ [SequenciaDidaticaStorage] Erro ao salvar:', error);
    return false;
  }
}

/**
 * Carrega dados de Sequência Didática do storage
 */
export function loadSequenciaDidaticaFromStorage(activityId: string): SequenciaDidaticaOutputContract | null {
  try {
    const newKey = SequenciaDidaticaSanitizer.getStorageKey(activityId);
    const textVersionKey = SequenciaDidaticaSanitizer.getTextVersionStorageKey(activityId);
    const legacyKey = SequenciaDidaticaSanitizer.getLegacyStorageKey(activityId);

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
      console.log(`📭 [SequenciaDidaticaStorage] Nenhum dado encontrado para: ${activityId}`);
      return null;
    }

    const parsed = JSON.parse(data);
    const sanitized = SequenciaDidaticaSanitizer.sanitizeOutput(parsed);
    
    if (sanitized) {
      console.log(`📦 [SequenciaDidaticaStorage] Carregado de ${source}: ${activityId}`);
    }

    return sanitized;
  } catch (error) {
    console.error('❌ [SequenciaDidaticaStorage] Erro ao carregar:', error);
    return null;
  }
}

/**
 * Verifica se existem dados no storage
 */
export function hasSequenciaDidaticaInStorage(activityId: string): boolean {
  const newKey = SequenciaDidaticaSanitizer.getStorageKey(activityId);
  const textVersionKey = SequenciaDidaticaSanitizer.getTextVersionStorageKey(activityId);
  const legacyKey = SequenciaDidaticaSanitizer.getLegacyStorageKey(activityId);
  
  return localStorage.getItem(newKey) !== null || 
         localStorage.getItem(textVersionKey) !== null ||
         localStorage.getItem(legacyKey) !== null;
}

console.log('📘 [SequenciaDidaticaContracts] Contratos de Sequência Didática carregados v' + SEQUENCIA_DIDATICA_CONFIG.VERSION);
