import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface SequenciaDidaticaCustomFields {
  [key: string]: string;
}

export interface SequenciaDidaticaActivity {
  id: string;
  title: string;
  description: string;
  customFields: SequenciaDidaticaCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

export interface SequenciaDidaticaData {
  tituloTemaAssunto: string;
  anoSerie: string;
  disciplina: string;
  bnccCompetencias: string;
  publicoAlvo: string;
  objetivosAprendizagem: string;
  quantidadeAulas: string;
  quantidadeDiagnosticos: string;
  quantidadeAvaliacoes: string;
  cronograma: string;
}

export const sequenciaDidaticaFieldMapping = {
  'Título do Tema / Assunto': 'tituloTemaAssunto',
  'tituloTemaAssunto': 'tituloTemaAssunto',
  'Ano / Série': 'anoSerie',
  'anoSerie': 'anoSerie',
  'Disciplina': 'disciplina',
  'disciplina': 'disciplina',
  'BNCC / Competências': 'bnccCompetencias',
  'bnccCompetencias': 'bnccCompetencias',
  'Público-alvo': 'publicoAlvo',
  'publicoAlvo': 'publicoAlvo',
  'Objetivos de Aprendizagem': 'objetivosAprendizagem',
  'objetivosAprendizagem': 'objetivosAprendizagem',
  'Quantidade de Aulas': 'quantidadeAulas',
  'quantidadeAulas': 'quantidadeAulas',
  'Quantidade de Diagnósticos': 'quantidadeDiagnosticos',
  'quantidadeDiagnosticos': 'quantidadeDiagnosticos',
  'Quantidade de Avaliações': 'quantidadeAvaliacoes',
  'quantidadeAvaliacoes': 'quantidadeAvaliacoes',
  'Cronograma': 'cronograma',
  'cronograma': 'cronograma'
};

/**
 * Processa dados de uma atividade de Sequência Didática do Action Plan
 * para o formato do formulário do modal
 */
export function processSequenciaDidaticaData(activityData: any): SequenciaDidaticaData {
  console.log('📚 Processando dados da Sequência Didática:', activityData);

  const customFields = activityData.customFields || {};

  return {
    tituloTemaAssunto: customFields['Título do Tema / Assunto'] || '',
    anoSerie: customFields['Ano / Série'] || '',
    disciplina: customFields['Disciplina'] || '',
    bnccCompetencias: customFields['BNCC / Competências'] || '',
    publicoAlvo: customFields['Público-alvo'] || '',
    objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || '',
    quantidadeAulas: customFields['Quantidade de Aulas'] || '',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '',
    cronograma: customFields['Cronograma'] || ''
  };
}

export interface SequenciaDidaticaFields {
  'Título do Tema / Assunto': string;
  'Ano / Série': string;
  'Disciplina': string;
  'BNCC / Competências': string;
  'Público-alvo': string;
  'Objetivos de Aprendizagem': string;
  'Quantidade de Aulas': string;
  'Quantidade de Diagnósticos': string;
  'Quantidade de Avaliações': string;
  'Cronograma': string;
}