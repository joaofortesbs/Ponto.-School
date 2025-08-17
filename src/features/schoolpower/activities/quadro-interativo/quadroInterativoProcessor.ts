import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { QuadroInterativoFields, quadroInterativoFieldMapping } from './fieldMapping';

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

export interface QuadroInterativoData {
  title: string;
  description: string;
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  timeLimit?: string;
  materials?: string;
  instructions?: string;
  evaluation?: string;
  context?: string;
}

/**
 * Processa dados de atividade para o formato do Quadro Interativo
 */
export function prepareQuadroInterativoDataForModal(activityData: any): QuadroInterativoData {
  console.log('🖼️ Processando dados para modal do Quadro Interativo:', activityData);

  const customFields = activityData?.customFields || {};

  // Função auxiliar para buscar valores em múltiplas chaves
  const findValue = (possibleKeys: string[], fallback = '') => {
    for (const key of possibleKeys) {
      if (customFields[key] && customFields[key].toString().trim()) {
        return customFields[key].toString().trim();
      }
    }
    return fallback;
  };

  const processedData: QuadroInterativoData = {
    title: activityData?.personalizedTitle ||
           activityData?.title ||
           findValue(['title', 'Título']) ||
           'Quadro Interativo',

    description: activityData?.personalizedDescription ||
                activityData?.description ||
                findValue(['description', 'Descrição']) ||
                'Atividade educacional interativa',

    subject: findValue([
      'Disciplina / Área de conhecimento',
      'disciplina',
      'Disciplina',
      'Componente Curricular',
      'Matéria',
      'subject'
    ], 'Matemática'),

    schoolYear: findValue([
      'Ano / Série',
      'anoSerie',
      'Ano de Escolaridade',
      'Público-Alvo',
      'schoolYear',
      'Ano',
      'Série'
    ], '6º Ano'),

    theme: findValue([
      'Tema ou Assunto da aula',
      'tema',
      'Tema',
      'Assunto',
      'Tópico',
      'theme'
    ], activityData?.title || 'Conteúdo Interativo'),

    objectives: findValue([
      'Objetivo de aprendizagem da aula',
      'objetivos',
      'Objetivos',
      'Objetivo',
      'objectives',
      'Objetivos de Aprendizagem'
    ], 'Desenvolver habilidades através de atividades interativas'),

    difficultyLevel: findValue([
      'Nível de Dificuldade',
      'nivelDificuldade',
      'dificuldade',
      'Dificuldade',
      'difficultyLevel',
      'Nível',
      'Complexidade'
    ], 'Intermediário'),

    quadroInterativoCampoEspecifico: findValue([
      'Atividade mostrada',
      'atividadeMostrada',
      'quadroInterativoCampoEspecifico',
      'Campo Específico do Quadro Interativo',
      'Atividade',
      'Tipo de Atividade',
      'Recursos Interativos'
    ], 'Atividade interativa no quadro'),

    timeLimit: findValue([
      'Tempo Estimado',
      'Duração',
      'timeLimit',
      'Tempo',
      'Tempo da Atividade'
    ], '45 minutos'),

    materials: findValue([
      'Materiais',
      'Materiais Necessários',
      'Recursos',
      'materials',
      'Recursos Visuais'
    ], 'Quadro interativo, computador, projetor'),

    instructions: findValue([
      'Instruções',
      'Metodologia',
      'instructions',
      'Como Fazer',
      'Procedimentos'
    ], 'Siga as orientações apresentadas no quadro interativo'),

    evaluation: findValue([
      'Avaliação',
      'Critérios de Avaliação',
      'evaluation',
      'Critérios',
      'Como Avaliar'
    ], 'Participação e engajamento durante a atividade'),

    context: findValue([
      'Contexto',
      'Aplicação',
      'context',
      'Onde Usar',
      'Contexto de Aplicação'
    ], '')
  };

  console.log('✅ Dados processados para Quadro Interativo:', processedData);
  return processedData;
}

/**
 * Valida se os dados obrigatórios estão preenchidos
 */
export function validateQuadroInterativoData(data: QuadroInterativoData): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields = [
    'title',
    'description',
    'subject',
    'schoolYear',
    'theme',
    'objectives',
    'difficultyLevel',
    'quadroInterativoCampoEspecifico'
  ];

  const missingFields = requiredFields.filter(field => {
    const value = data[field as keyof QuadroInterativoData];
    return !value || value.toString().trim().length === 0;
  });

  return {
    isValid: missingFields.length === 0,
    missingFields
  };
}

/**
 * Converte dados do formulário para o formato esperado pelo gerador
 */
export function convertFormDataToQuadroInterativo(formData: any): QuadroInterativoData {
  return {
    title: formData.title || '',
    description: formData.description || '',
    subject: formData.subject || 'Matemática',
    schoolYear: formData.schoolYear || '6º Ano',
    theme: formData.theme || '',
    objectives: formData.objectives || '',
    difficultyLevel: formData.difficultyLevel || 'Intermediário',
    quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico || '',
    timeLimit: formData.timeLimit || '45 minutos',
    materials: formData.materials || '',
    instructions: formData.instructions || '',
    evaluation: formData.evaluation || '',
    context: formData.context || ''
  };
}

/**
 * Mapeia dados do Action Plan para campos do Quadro Interativo
 */
export function mapActionPlanToQuadroInterativo(actionPlanData: any): QuadroInterativoData {
  console.log('🔄 Mapeando dados do Action Plan para Quadro Interativo:', actionPlanData);

  const mapped = prepareQuadroInterativoDataForModal(actionPlanData);

  console.log('📋 Dados mapeados:', mapped);
  return mapped;
}