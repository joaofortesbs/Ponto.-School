
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

/**
 * Processa dados de uma atividade de Sequência Didática do Action Plan
 * para o formato do formulário do modal
 */
export function processSequenciaDidaticaData(activity: SequenciaDidaticaActivity): ActivityFormData {
  console.log('📚 Processando dados da Sequência Didática:', activity);

  const customFields = activity.customFields || {};

  return {
    title: activity.personalizedTitle || activity.title || customFields['Título do Tema / Assunto'] || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: customFields['Disciplina'] || 'Geografia',
    theme: customFields['Título do Tema / Assunto'] || '',
    schoolYear: customFields['Ano / Série'] || '6º ano',
    numberOfQuestions: '',
    difficultyLevel: 'Médio',
    questionModel: '',
    sources: '',
    objectives: customFields['Objetivos de Aprendizagem'] || '',
    materials: '',
    // Campos específicos da Sequência Didática com nomes corretos
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

/**
 * Mapeia os campos da Sequência Didática para o formato do modal
 */
export const sequenciaDidaticaFieldMapping = {
  'Título do Tema / Assunto': 'Título do Tema / Assunto',
  'Ano / Série': 'Ano / Série', 
  'Disciplina': 'Disciplina',
  'BNCC / Competências': 'BNCC / Competências',
  'Público-alvo': 'Público-alvo',
  'Objetivos de Aprendizagem': 'Objetivos de Aprendizagem',
  'Quantidade de Aulas': 'Quantidade de Aulas',
  'Quantidade de Diagnósticos': 'Quantidade de Diagnósticos',
  'Quantidade de Avaliações': 'Quantidade de Avaliações',
  'Cronograma': 'Cronograma'
};

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
