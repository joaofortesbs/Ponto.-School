
<old_str>export { default as SequenciaDidaticaPreview } from './SequenciaDidaticaPreview';
export { processSequenciaDidaticaData, sequenciaDidaticaFieldMapping } from './sequenciaDidaticaProcessor';

// Exportar o builder para uso externo
export { default as sequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';</old_str>
<new_str>export { default as SequenciaDidaticaPreview } from './SequenciaDidaticaPreview';
export { processSequenciaDidaticaData, sequenciaDidaticaFieldMapping } from './sequenciaDidaticaProcessor';
export { SequenciaDidaticaBuilder as sequenciaDidaticaBuilder } from './SequenciaDidaticaBuilder';
export { SequenciaDidaticaGenerator } from './SequenciaDidaticaGenerator';

// Exportar componentes
export * from './components';</old_str>
