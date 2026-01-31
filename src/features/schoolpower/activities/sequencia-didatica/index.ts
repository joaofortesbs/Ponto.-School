export * from './sequenciaDidaticaProcessor';
export { sequenciaDidaticaFieldMapping } from './sequenciaDidaticaProcessor';
export type { SequenciaDidaticaFields, SequenciaDidaticaActivity, SequenciaDidaticaCustomFields } from './sequenciaDidaticaProcessor';

// Exportar contratos e sanitizadores (Blindagem v1.0)
export {
  SEQUENCIA_DIDATICA_CONFIG,
  SequenciaDidaticaSanitizer,
  saveSequenciaDidaticaToStorage,
  loadSequenciaDidaticaFromStorage,
  hasSequenciaDidaticaInStorage
} from './contracts';

export type {
  SequenciaDidaticaInputContract,
  SequenciaDidaticaOutputContract,
  SequenciaDidaticaResponseContract,
  SequenciaInfoGeralContract,
  SequenciaObjetivoContract,
  SequenciaEtapaContract,
  SequenciaAvaliacaoContract,
  SequenciaDuration,
  EtapaTipo
} from './contracts';
