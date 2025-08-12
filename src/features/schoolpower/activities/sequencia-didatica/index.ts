
// Exportações principais
export { SequenciaDidaticaBuilder, sequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';
export { SequenciaDidaticaGenerator, sequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
export { default as SequenciaDidaticaPreview } from './SequenciaDidaticaPreview';

// Exportações de tipos e processamento
export type { 
  SequenciaDidaticaData,
  ValidationResult
} from './sequenciaDidaticaProcessor';

export {
  validateSequenciaDidaticaData,
  processSequenciaDidaticaData,
  activityFormToSequenciaData,
  sequenciaDidaticaFieldMapping
} from './sequenciaDidaticaProcessor';

// Exportações de tipos do generator
export type {
  AulaData,
  DiagnosticoData,
  AvaliacaoData,
  SequenciaDidaticaCompleta,
  SequenciaDidaticaBuildResult
} from './SequenciaDidaticaGenerator';
