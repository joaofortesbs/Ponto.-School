
export { default as SequenciaDidaticaPreview } from './SequenciaDidaticaPreview';
export { processSequenciaDidaticaData, sequenciaDidaticaFieldMapping } from './sequenciaDidaticaProcessor';

// Exportar o builder para uso externo
export { sequenciaDidaticaBuilder, SequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';

// Exportar o generator
export { sequenciaDidaticaGenerator, SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';

// Exportar tipos
export type { SequenciaDidaticaData } from './sequenciaDidaticaProcessor';
export type { 
  SequenciaDidaticaCompleta, 
  AulaData, 
  DiagnosticoData, 
  AvaliacaoData 
} from './SequenciaDidaticaGenerator';
