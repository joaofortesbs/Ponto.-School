
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

  const result: SequenciaDidaticaData = {
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '1',
    quantidadeDiagnosticos: '1',
    quantidadeAvaliacoes: '1',
    cronograma: ''
  };

  if (!activityData) {
    return result;
  }

  // Processar campos de customFields se existirem
  if (activityData.customFields) {
    Object.entries(activityData.customFields).forEach(([key, value]) => {
      const mappedField = sequenciaDidaticaFieldMapping[key];
      if (mappedField && typeof value === 'string') {
        (result as any)[mappedField] = value;
      }
    });
  }

  // Processar campos diretos do originalData
  if (activityData.originalData) {
    Object.entries(activityData.originalData).forEach(([key, value]) => {
      const mappedField = sequenciaDidaticaFieldMapping[key];
      if (mappedField && typeof value === 'string') {
        (result as any)[mappedField] = value;
      }
    });
  }

  console.log('📚 Dados processados da Sequência Didática:', result);
  return result activityData);

  const customFields = activityData.customFields || {};
  
  return {
    tituloTemaAssunto: customFields['Título do Tema / Assunto'] || 
                      customFields['tituloTemaAssunto'] || 
                      activityData.title || '',
    anoSerie: customFields['Ano / Série'] || 
              customFields['anoSerie'] || 
              activityData.schoolYear || '',
    disciplina: customFields['Disciplina'] || 
                customFields['disciplina'] || 
                activityData.subject || '',
    bnccCompetencias: customFields['BNCC / Competências'] || 
                      customFields['bnccCompetencias'] || 
                      activityData.competencies || '',
    publicoAlvo: customFields['Público-alvo'] || 
                 customFields['publicoAlvo'] || 
                 activityData.context || '',
    objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || 
                           customFields['objetivosAprendizagem'] || 
                           activityData.objectives || '',
    quantidadeAulas: customFields['Quantidade de Aulas'] || 
                     customFields['quantidadeAulas'] || '4',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || 
                            customFields['quantidadeDiagnosticos'] || '1',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || 
                          customFields['quantidadeAvaliacoes'] || '1',
    cronograma: customFields['Cronograma'] || 
                customFields['cronograma'] || ''
  };
}

/**
 * Converte dados do formulário para o formato esperado pela API
 */
export function formDataToSequenciaDidatica(formData: ActivityFormData): SequenciaDidaticaData {
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
 * Valida se os dados da Sequência Didática estão completos
 */
export function validateSequenciaDidaticaData(data: SequenciaDidaticaData): { 
  isValid: boolean; 
  errors: string[] 
} {
  const errors: string[] = [];

  if (!data.tituloTemaAssunto?.trim()) {
    errors.push('Título do tema/assunto é obrigatório');
  }

  if (!data.disciplina?.trim()) {
    errors.push('Disciplina é obrigatória');
  }

  if (!data.anoSerie?.trim()) {
    errors.push('Ano/série é obrigatório');
  }

  if (!data.objetivosAprendizagem?.trim()) {
    errors.push('Objetivos de aprendizagem são obrigatórios');
  }

  if (!data.quantidadeAulas || parseInt(data.quantidadeAulas) < 1) {
    errors.push('Quantidade de aulas deve ser pelo menos 1');
  }

  if (data.quantidadeDiagnosticos && parseInt(data.quantidadeDiagnosticos) < 0) {
    errors.push('Quantidade de diagnósticos não pode ser negativa');
  }

  if (data.quantidadeAvaliacoes && parseInt(data.quantidadeAvaliacoes) < 0) {
    errors.push('Quantidade de avaliações não pode ser negativa');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
