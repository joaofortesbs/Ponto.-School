export { transformPlanoAulaData, planoAulaFieldMapping } from './fieldMapping';
export { processPlanoAulaData, PlanoAulaProcessor } from './planoAulaProcessor';
export { PlanoAulaBuilder } from './PlanoAulaBuilder';
export { PlanoAulaGenerator } from './PlanoAulaGenerator';
export { PlanoAulaValidator } from './PlanoAulaValidator';
export type { PlanoAulaFields } from './fieldMapping';
export type { PlanoAulaData, PlanoAulaResponse } from './PlanoAulaBuilder';
export { default as PlanoAulaPreview } from './PlanoAulaPreview';

// Exportar seções separadas
export * from './sections';

// Exportar contratos e sanitizadores (Blindagem v1.0)
export {
  PLANO_AULA_CONFIG,
  PlanoAulaSanitizer,
  savePlanoAulaToStorage,
  loadPlanoAulaFromStorage,
  hasPlanoAulaInStorage
} from './contracts';

export type {
  PlanoAulaInputContract,
  PlanoAulaOutputContract,
  PlanoAulaResponseContract,
  PlanoAulaVisaoGeralContract,
  PlanoAulaObjetivoContract,
  PlanoAulaDesenvolvimentoContract,
  PlanoAulaAtividadeContract,
  PlanoAulaAvaliacaoContract,
  PlanoAulaMethodology,
  PlanoAulaDuration
} from './contracts';
