
import { ActivityFormData } from '../../construction/types/ActivityTypes';

export interface QuadroInterativoFields {
  [key: string]: string;
}

export interface QuadroInterativoCustomFields {
  [key: string]: string;
}

export interface QuadroInterativoActivity {
  id: string;
  title: string;
  description: string;
  customFields: QuadroInterativoCustomFields;
  personalizedTitle?: string;
  personalizedDescription?: string;
}

/**
 * Processa dados de uma atividade de Quadro Interativo do Action Plan
 * para o formato do formulário do modal
 */
export function processQuadroInterativoData(activity: QuadroInterativoActivity): ActivityFormData {
  console.log('📱 Processando dados do Quadro Interativo:', activity);

  const customFields = activity.customFields || {};
  const consolidatedData = {
    ...activity,
    title: activity.personalizedTitle || activity.title,
    description: activity.personalizedDescription || activity.description
  };

  return {
    title: consolidatedData.title || '',
    description: consolidatedData.description || '',
    subject: customFields['Disciplina / Área de conhecimento'] || 'Matemática',
    schoolYear: customFields['Ano / Série'] || '6º Ano',
    theme: customFields['Tema ou Assunto da aula'] || consolidatedData.title || 'Tema da Aula',
    objectives: customFields['Objetivo de aprendizagem da aula'] || consolidatedData.description || 'Objetivos de aprendizagem',
    difficultyLevel: customFields['Nível de Dificuldade'] || 'Intermediário',
    quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || 'Atividade interativa no quadro',
    materials: customFields['Materiais Necessários'] || '',
    instructions: customFields['Instruções'] || '',
    evaluation: customFields['Critérios de Avaliação'] || '',
    timeLimit: customFields['Tempo Estimado'] || '45 minutos',
    context: customFields['Contexto de Aplicação'] || '',
    // Campos padrão
    numberOfQuestions: '1',
    questionModel: '',
    sources: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: ''
  };
}

/**
 * Prepara dados de Quadro Interativo para o modal de edição
 */
export function prepareQuadroInterativoDataForModal(activity: any): ActivityFormData {
  console.log('🔄 Preparando dados do Quadro Interativo para modal:', activity);

  const customFields = activity.customFields || {};
  
  return {
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || '',
    
    // Campos específicos do Quadro Interativo
    subject: customFields['Disciplina / Área de conhecimento'] || 
             customFields['disciplina'] || 
             customFields['Disciplina'] || 
             'Matemática',
             
    schoolYear: customFields['Ano / Série'] || 
                customFields['anoSerie'] || 
                customFields['Ano de Escolaridade'] || 
                '6º Ano',
                
    theme: customFields['Tema ou Assunto da aula'] || 
           customFields['tema'] || 
           customFields['Tema'] || 
           activity.title || 
           'Tema da Aula',
           
    objectives: customFields['Objetivo de aprendizagem da aula'] || 
                customFields['objetivos'] || 
                customFields['Objetivos'] || 
                activity.description || 
                'Objetivos de aprendizagem',
                
    difficultyLevel: customFields['Nível de Dificuldade'] || 
                     customFields['nivelDificuldade'] || 
                     customFields['dificuldade'] || 
                     'Intermediário',
                     
    quadroInterativoCampoEspecifico: customFields['Atividade mostrada'] || 
                                    customFields['atividadeMostrada'] || 
                                    customFields['quadroInterativoCampoEspecifico'] || 
                                    'Atividade interativa no quadro',

    // Campos opcionais
    materials: customFields['Materiais Necessários'] || customFields['materiais'] || '',
    instructions: customFields['Instruções'] || customFields['instrucoes'] || '',
    evaluation: customFields['Critérios de Avaliação'] || customFields['avaliacao'] || '',
    timeLimit: customFields['Tempo Estimado'] || customFields['tempoLimite'] || '45 minutos',
    context: customFields['Contexto de Aplicação'] || customFields['contexto'] || '',

    // Campos padrão necessários para ActivityFormData
    numberOfQuestions: '1',
    questionModel: '',
    sources: '',
    textType: '',
    textGenre: '',
    textLength: '',
    associatedQuestions: '',
    competencies: '',
    readingStrategies: '',
    visualResources: '',
    practicalActivities: '',
    wordsIncluded: '',
    gridFormat: '',
    providedHints: '',
    vocabularyContext: '',
    language: '',
    associatedExercises: '',
    knowledgeArea: '',
    complexityLevel: '',
    tituloTemaAssunto: '',
    anoSerie: '',
    disciplina: '',
    bnccCompetencias: '',
    publicoAlvo: '',
    objetivosAprendizagem: '',
    quantidadeAulas: '',
    quantidadeDiagnosticos: '',
    quantidadeAvaliacoes: '',
    cronograma: ''
  };
}

/**
 * Valida se uma atividade é do tipo Quadro Interativo
 */
export function isQuadroInterativoActivity(activity: any): activity is QuadroInterativoActivity {
  return activity && 
         activity.id === 'quadro-interativo' &&
         typeof activity.title === 'string' &&
         typeof activity.description === 'string' &&
         typeof activity.customFields === 'object';
}

/**
 * Gera os campos customizados específicos para Quadro Interativo
 */
export function generateQuadroInterativoFields(
  disciplina: string,
  anoSerie: string,
  tema: string,
  objetivo: string,
  nivelDificuldade: string,
  atividadeMostrada: string
): QuadroInterativoCustomFields {
  return {
    'Disciplina / Área de conhecimento': disciplina,
    'Ano / Série': anoSerie,
    'Tema ou Assunto da aula': tema,
    'Objetivo de aprendizagem da aula': objetivo,
    'Nível de Dificuldade': nivelDificuldade,
    'Atividade mostrada': atividadeMostrada
  };
}

/**
 * Extrai dados específicos do Quadro Interativo de um objeto de atividade
 */
export function extractQuadroInterativoData(activity: any): QuadroInterativoCustomFields {
  const customFields = activity.customFields || {};
  const extractedData: QuadroInterativoCustomFields = {};

  // Campos obrigatórios para Quadro Interativo
  const requiredFields = [
    'Disciplina / Área de conhecimento',
    'Ano / Série', 
    'Tema ou Assunto da aula',
    'Objetivo de aprendizagem da aula',
    'Nível de Dificuldade',
    'Atividade mostrada'
  ];

  requiredFields.forEach(field => {
    if (customFields[field]) {
      extractedData[field] = customFields[field];
    }
  });

  return extractedData;
}

/**
 * Valida se os campos obrigatórios do Quadro Interativo estão preenchidos
 */
export function validateQuadroInterativoFields(data: ActivityFormData): boolean {
  return !!(
    data.subject?.trim() &&
    data.schoolYear?.trim() &&
    data.theme?.trim() &&
    data.objectives?.trim() &&
    data.difficultyLevel?.trim() &&
    data.quadroInterativoCampoEspecifico?.trim()
  );
}

export default {
  processQuadroInterativoData,
  prepareQuadroInterativoDataForModal,
  isQuadroInterativoActivity,
  generateQuadroInterativoFields,
  extractQuadroInterativoData,
  validateQuadroInterativoFields
};
