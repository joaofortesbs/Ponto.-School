
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
export function processSequenciaDidaticaData(formData: ActivityFormData): SequenciaDidaticaData {
  console.log('📚 Processando dados da Sequência Didática:', formData);

  const processedData: SequenciaDidaticaData = {
    tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
    anoSerie: formData.anoSerie || formData.schoolYear || '',
    disciplina: formData.disciplina || formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
    quantidadeAulas: formData.quantidadeAulas || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
    cronograma: formData.cronograma || ''
  };

  console.log('✅ Dados processados:', processedData);
  return processedData;
}

/**
 * Converte dados do ActivityFormData para SequenciaDidaticaData
 */
export function activityFormToSequenciaData(formData: ActivityFormData): SequenciaDidaticaData {
  return {
    tituloTemaAssunto: formData.tituloTemaAssunto || formData.title || '',
    anoSerie: formData.anoSerie || formData.schoolYear || '',
    disciplina: formData.disciplina || formData.subject || '',
    bnccCompetencias: formData.bnccCompetencias || formData.competencies || '',
    publicoAlvo: formData.publicoAlvo || formData.context || '',
    objetivosAprendizagem: formData.objetivosAprendizagem || formData.objectives || '',
    quantidadeAulas: formData.quantidadeAulas || '4',
    quantidadeDiagnosticos: formData.quantidadeDiagnosticos || '1',
    quantidadeAvaliacoes: formData.quantidadeAvaliacoes || '1',
    cronograma: formData.cronograma || ''
  };
}

/**
 * Valida se os dados essenciais estão presentes
 */
export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.tituloTemaAssunto?.trim()) {
    errors.push('Título do tema/assunto é obrigatório');
  }

  if (!data.anoSerie?.trim()) {
    errors.push('Ano/série é obrigatório');
  }

  if (!data.disciplina?.trim()) {
    errors.push('Disciplina é obrigatória');
  }

  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de aprendizagem são obrigatórios');
  }

  const quantAulas = parseInt(data.quantidadeAulas || '0');
  if (quantAulas <= 0) {
    errors.push('Quantidade de aulas deve ser maior que 0');
  }

  const quantDiag = parseInt(data.quantidadeDiagnosticos || '0');
  if (quantDiag < 0) {
    errors.push('Quantidade de diagnósticos deve ser 0 ou maior');
  }

  const quantAval = parseInt(data.quantidadeAvaliacoes || '0');
  if (quantAval < 0) {
    errors.push('Quantidade de avaliações deve ser 0 ou maior');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
