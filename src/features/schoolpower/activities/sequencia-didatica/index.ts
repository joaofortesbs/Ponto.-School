
export { default as SequenciaDidaticaPreview } from './SequenciaDidaticaPreview';
export { processSequenciaDidaticaData, sequenciaDidaticaFieldMapping } from './sequenciaDidaticaProcessor';

// Exportar o builder para uso externo
export { default as SequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';
export type { SequenciaDidaticaAula, SequenciaDidaticaData, SequenciaDidaticaResult } from './SequenciaDidaticaBuilder';

// Exportar o generator
export { SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';
