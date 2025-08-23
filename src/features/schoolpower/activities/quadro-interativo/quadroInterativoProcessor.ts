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

/**
 * Processa dados de uma atividade de Quadro Interativo do Action Plan
 * para o formato do formulário do modal
 */
export function processQuadroInterativoData(activity: QuadroInterativoActivity): ActivityFormData {
  console.log('📱 Processando dados do Quadro Interativo:', activity);

  const customFields = activity.customFields || {};

  // Inicializar dados do formulário com valores padrão
  const formData: ActivityFormData = {
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: '',
    theme: '',
    schoolYear: '',
    objective: '',
    difficultyLevel: '',
    activityShown: ''
  };

  // Mapear campos específicos do Quadro Interativo
  const fieldMappings: Record<string, keyof ActivityFormData> = {
    'Disciplina / Área de conhecimento': 'subject',
    'Disciplina': 'subject',
    'Área de conhecimento': 'subject',
    'Ano / Série': 'schoolYear',
    'Ano': 'schoolYear',
    'Série': 'schoolYear',
    'Tema ou Assunto da aula': 'theme',
    'Tema': 'theme',
    'Assunto': 'theme',
    'Objetivo de aprendizagem da aula': 'objective',
    'Objetivo': 'objective',
    'Objetivos': 'objective',
    'Nível de Dificuldade': 'difficultyLevel',
    'Dificuldade': 'difficultyLevel',
    'Atividade mostrada': 'activityShown',
    'Atividade': 'activityShown',
    'Atividades': 'activityShown'
  };

  // Aplicar mapeamentos com log detalhado
  Object.entries(fieldMappings).forEach(([customFieldKey, formFieldKey]) => {
    const value = customFields[customFieldKey];
    if (value && value.trim() && formFieldKey in formData) {
      (formData as any)[formFieldKey] = value;
      console.log(`✅ Mapeado: ${customFieldKey} -> ${formFieldKey} = ${value}`);
    }
  });

  // Mapear campos customizados para campos do formulário
  Object.entries(customFields).forEach(([key, value]) => {
    const mappedField = quadroInterativoFieldMapping[key];
    if (mappedField && typeof value === 'string') {
      switch (mappedField) {
        case 'recursos':
          formData.materials = value;
          break;
        case 'objetivo':
          formData.objective = value;
          break;
        case 'avaliacao':
          formData.evaluationCriteria = value;
          break;
        case 'conteudo':
          formData.instructions = value;
          break;
        case 'interatividade':
          formData.activityShown = value;
          break;
        case 'design':
          formData.difficultyLevel = value;
          break;
        // Campos diretos do modal de edição
        case 'title':
          formData.title = value;
          break;
        case 'description':
          formData.description = value;
          break;
        case 'materials':
          formData.materials = value;
          break;
        case 'instructions':
          formData.instructions = value;
          break;
      }
    }
  });

  console.log('📝 Dados processados do Quadro Interativo:', formData);
  return formData;
}

/**
 * Valida se uma atividade é um Quadro Interativo válido
 */
export function isValidQuadroInterativoActivity(activity: any): activity is QuadroInterativoActivity {
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