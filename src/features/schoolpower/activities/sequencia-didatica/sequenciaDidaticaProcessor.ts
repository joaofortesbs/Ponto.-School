
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
    title: activity.personalizedTitle || activity.title || customFields['Título do Tema / Assunto'] || customFields['titulo'] || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: customFields['Disciplina'] || customFields['disciplina'] || 'Geografia',
    theme: customFields['Título do Tema / Assunto'] || customFields['titulo'] || customFields['tema'] || '',
    schoolYear: customFields['Ano / Série'] || customFields['ano'] || customFields['serie'] || '6º ano',
    numberOfQuestions: '',
    difficultyLevel: 'Médio',
    questionModel: '',
    sources: '',
    objectives: customFields['Objetivos de Aprendizagem'] || customFields['objetivos'] || '',
    materials: '',
    // Campos específicos da Sequência Didática
    tituloTemaAssunto: customFields['Título do Tema / Assunto'] || customFields['titulo'] || customFields['tema'] || '',
    anoSerie: customFields['Ano / Série'] || customFields['ano'] || customFields['serie'] || '',
    disciplina: customFields['Disciplina'] || customFields['disciplina'] || '',
    bnccCompetencias: customFields['BNCC / Competências'] || customFields['bncc'] || customFields['competencias'] || '',
    publicoAlvo: customFields['Público-alvo'] || customFields['publicoAlvo'] || customFields['publico'] || '',
    objetivosAprendizagem: customFields['Objetivos de Aprendizagem'] || customFields['objetivos'] || '',
    quantidadeAulas: customFields['Quantidade de Aulas'] || customFields['quantidadeAulas'] || customFields['aulas'] || '',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || customFields['quantidadeDiagnosticos'] || customFields['diagnosticos'] || '',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || customFields['quantidadeAvaliacoes'] || customFields['avaliacoes'] || '',
    cronograma: customFields['Cronograma'] || customFields['cronograma'] || ''
  };
}

/**
 * Mapeia os campos da Sequência Didática para o formato do modal
 */
export const sequenciaDidaticaFieldMapping = {
  'tituloTemaAssunto': 'Título do Tema / Assunto',
  'anoSerie': 'Ano / Série', 
  'disciplina': 'Disciplina',
  'bnccCompetencias': 'BNCC / Competências',
  'publicoAlvo': 'Público-alvo',
  'objetivosAprendizagem': 'Objetivos de Aprendizagem',
  'quantidadeAulas': 'Quantidade de Aulas',
  'quantidadeDiagnosticos': 'Quantidade de Diagnósticos',
  'quantidadeAvaliacoes': 'Quantidade de Avaliações',
  'cronograma': 'Cronograma'
};

export interface SequenciaDidaticaFields {
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
