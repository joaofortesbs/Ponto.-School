
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
 * Mapeamento dos campos específicos da Sequência Didática
 */
export const sequenciaDidaticaFieldMapping = {
  'Tema Central': 'temaCentral',
  'Objetivos': 'objetivos', 
  'Etapas': 'etapas',
  'Recursos': 'recursos',
  'Avaliação': 'avaliacao'
};

/**
 * Processa dados de uma atividade de Sequência Didática do Action Plan
 * para o formato do formulário do modal
 */
export function processSequenciaDidaticaData(activity: SequenciaDidaticaActivity): ActivityFormData {
  console.log('📚 Processando dados da Sequência Didática:', activity);

  const customFields = activity.customFields || {};

  return {
    title: activity.personalizedTitle || activity.title || customFields['Tema Central'] || customFields['titulo'] || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: customFields['Disciplina'] || customFields['disciplina'] || 'Português',
    theme: customFields['Tema Central'] || customFields['titulo'] || customFields['tema'] || '',
    schoolYear: customFields['Ano / Série'] || customFields['ano'] || customFields['serie'] || '6º ano',
    numberOfQuestions: '',
    difficultyLevel: 'Médio',
    questionModel: '',
    sources: '',
    objectives: customFields['Objetivos'] || customFields['Objetivos de Aprendizagem'] || customFields['objetivos'] || '',
    materials: customFields['Recursos'] || customFields['Recursos Didáticos'] || customFields['materiais'] || '',
    instructions: customFields['Etapas'] || customFields['Metodologia'] || customFields['instrucoes'] || '',
    evaluation: customFields['Avaliação'] || customFields['Critérios de Avaliação'] || customFields['avaliacao'] || '',
    // Campos específicos da Sequência Didática
    temaCentral: customFields['Tema Central'] || customFields['titulo'] || customFields['tema'] || '',
    objetivos: customFields['Objetivos'] || customFields['Objetivos de Aprendizagem'] || customFields['objetivos'] || '',
    etapas: customFields['Etapas'] || customFields['Metodologia'] || customFields['etapas'] || '',
    recursos: customFields['Recursos'] || customFields['Recursos Didáticos'] || customFields['recursos'] || '',
    avaliacao: customFields['Avaliação'] || customFields['Critérios de Avaliação'] || customFields['avaliacao'] || '',
    quantidadeAulas: customFields['Quantidade de Aulas'] || customFields['quantidadeAulas'] || '',
    quantidadeDiagnosticos: customFields['Quantidade de Diagnósticos'] || customFields['quantidadeDiagnosticos'] || '',
    quantidadeAvaliacoes: customFields['Quantidade de Avaliações'] || customFields['quantidadeAvaliacoes'] || '',
    cronograma: customFields['Cronograma'] || customFields['cronograma'] || ''
  };
}



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
