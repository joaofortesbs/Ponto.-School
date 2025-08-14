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

// Processador de dados para Sequência Didática
export interface SequenciaDidaticaFormData {
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
  'Ano / Série': 'anoSerie',
  'Disciplina': 'disciplina',
  'BNCC / Competências': 'bnccCompetencias',
  'Público-alvo': 'publicoAlvo',
  'Objetivos de Aprendizagem': 'objetivosAprendizagem',
  'Quantidade de Aulas': 'quantidadeAulas',
  'Quantidade de Diagnósticos': 'quantidadeDiagnosticos',
  'Quantidade de Avaliações': 'quantidadeAvaliacoes',
  'Cronograma': 'cronograma'
};

export function processSequenciaDidaticaData(activityData: any): SequenciaDidaticaFormData {
  console.log('🔄 Processando dados da Sequência Didática:', activityData);

  const customFields = activityData.customFields || {};

  return {
    tituloTemaAssunto: customFields['Título do Tema / Assunto'] || activityData.title || '',
    anoSerie: customFields['Ano / Série'] || activityData.schoolYear || '',
    disciplina: customFields['Disciplina'] || activityData.subject || '',
    bnccCompetencias: customFields['BNCC / Competências'] || '',
    publicoAlvo: customFields['Público-alvo'] || activityData.targetAudience || '',
    objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || activityData.objectives || '',
    quantidadeAulas: customFields['Quantidade de Aulas'] || '3',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || '1',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || '1',
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