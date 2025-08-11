import { ActivityFieldMap } from './index';

export const activitySequenciaDidaticaFieldMap: ActivityFieldMap = {
  'tituloTemaAssunto': 'input[name="tituloTemaAssunto"]',
  'anoSerie': 'input[name="anoSerie"]',
  'disciplina': 'select[name="disciplina"]',
  'bnccCompetencias': 'input[name="bnccCompetencias"]',
  'publicoAlvo': 'input[name="publicoAlvo"]',
  'objetivosAprendizagem': 'textarea[name="objetivosAprendizagem"]',
  'quantidadeAulas': 'input[name="quantidadeAulas"]',
  'quantidadeDiagnosticos': 'input[name="quantidadeDiagnosticos"]',
  'quantidadeAvaliacoes': 'input[name="quantidadeAvaliacoes"]',
  'cronograma': 'textarea[name="cronograma"]'
};

export default activitySequenciaDidaticaFieldMap;