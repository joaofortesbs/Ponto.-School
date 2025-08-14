
import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { QuadroInterativoFields, quadroInterativoFieldMapping, debugFieldMappings } from './fieldMapping';

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

  // Inicializar dados do formulário com dados da atividade
  const formData: ActivityFormData = {
    title: activity.personalizedTitle || activity.title || '',
    description: activity.personalizedDescription || activity.description || '',
    subject: '',
    theme: '',
    schoolYear: '',
    objectives: '',
    difficultyLevel: '',
    quadroInterativoCampoEspecifico: '',
    numberOfQuestions: '1',
    questionModel: '',
    sources: '',
    materials: '',
    instructions: '',
    evaluation: '',
    timeLimit: '',
    context: '',
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

  // PRIORIDADE 1: Mapear campos diretos exatos primeiro
  console.log('🔍 Campos disponíveis no customFields:', Object.keys(customFields));
  debugFieldMappings(customFields);
  
  // Mapeamento direto prioritário - campos exatos
  const directMappings: Array<[string, keyof ActivityFormData]> = [
    ['Disciplina / Área de conhecimento', 'subject'],
    ['Ano / Série', 'schoolYear'],
    ['Tema ou Assunto da aula', 'theme'],
    ['Objetivo de aprendizagem da aula', 'objectives'],
    ['Nível de Dificuldade', 'difficultyLevel'],
    ['Atividade mostrada', 'quadroInterativoCampoEspecifico']
  ];

  // Aplicar mapeamento direto PRIMEIRO
  directMappings.forEach(([customFieldKey, formFieldKey]) => {
    const value = customFields[customFieldKey];
    if (value && typeof value === 'string' && value.trim()) {
      (formData as any)[formFieldKey] = value.trim();
      console.log(`✅ DIRETO: ${customFieldKey} -> ${formFieldKey} = "${value}"`);
    }
  });

  // Mapear campos específicos do Quadro Interativo com múltiplas variações (como fallback)
  const fieldMappings: Record<string, keyof ActivityFormData> = {
    // Disciplina / Área de conhecimento
    'Disciplina': 'subject',
    'Área de conhecimento': 'subject',
    'Componente Curricular': 'subject',
    'Matéria': 'subject',
    
    // Ano / Série
    'Ano': 'schoolYear',
    'Série': 'schoolYear',
    'Ano de Escolaridade': 'schoolYear',
    'Público-Alvo': 'schoolYear',
    
    // Tema ou Assunto da aula
    'Tema': 'theme',
    'Assunto': 'theme',
    'Tópico': 'theme',
    'Tema Central': 'theme',
    
    // Objetivo de aprendizagem da aula
    'Objetivo': 'objectives',
    'Objetivos': 'objectives',
    'Objetivo Principal': 'objectives',
    'Objetivos de Aprendizagem': 'objectives',
    
    // Nível de Dificuldade
    'Dificuldade': 'difficultyLevel',
    'Nível': 'difficultyLevel',
    'Complexidade': 'difficultyLevel',
    
    // Atividade mostrada
    'Atividade': 'quadroInterativoCampoEspecifico',
    'Atividades': 'quadroInterativoCampoEspecifico',
    'Tipo de Atividade': 'quadroInterativoCampoEspecifico',
    'Interatividade': 'quadroInterativoCampoEspecifico',
    'Recursos Interativos': 'quadroInterativoCampoEspecifico'
  };

  // Aplicar mapeamentos fallback apenas se o campo ainda está vazio
  Object.entries(fieldMappings).forEach(([customFieldKey, formFieldKey]) => {
    const value = customFields[customFieldKey];
    const currentValue = (formData as any)[formFieldKey];
    if (value && value.trim() && formFieldKey in formData && !currentValue) {
      (formData as any)[formFieldKey] = value.trim();
      console.log(`✅ FALLBACK: ${customFieldKey} -> ${formFieldKey} = "${value}"`);
    }
  });

  // Mapear campos adicionais que podem existir
  const additionalMappings: Record<string, keyof ActivityFormData> = {
    'Materiais': 'materials',
    'Recursos': 'materials',
    'Materiais Necessários': 'materials',
    'Instruções': 'instructions',
    'Metodologia': 'instructions',
    'Como Fazer': 'instructions',
    'Avaliação': 'evaluation',
    'Critérios': 'evaluation',
    'Critérios de Avaliação': 'evaluation',
    'Tempo': 'timeLimit',
    'Duração': 'timeLimit',
    'Tempo Estimado': 'timeLimit',
    'Contexto': 'context',
    'Aplicação': 'context',
    'Onde Usar': 'context'
  };

  // Aplicar mapeamentos adicionais
  Object.entries(additionalMappings).forEach(([customFieldKey, formFieldKey]) => {
    const value = customFields[customFieldKey];
    if (value && value.trim() && formFieldKey in formData) {
      (formData as any)[formFieldKey] = value;
      console.log(`✅ Mapeamento adicional: ${customFieldKey} -> ${formFieldKey} = ${value}`);
    }
  });

  // Mapear usando o sistema de fieldMapping existente
  Object.entries(customFields).forEach(([key, value]) => {
    const mappedField = quadroInterativoFieldMapping[key];
    if (mappedField && typeof value === 'string' && value.trim()) {
      switch (mappedField) {
        case 'recursos':
          formData.materials = value;
          console.log(`📋 Recursos mapeados: ${value}`);
          break;
        case 'objetivo':
          formData.objectives = value;
          console.log(`🎯 Objetivo mapeado: ${value}`);
          break;
        case 'avaliacao':
          formData.evaluation = value;
          console.log(`📊 Avaliação mapeada: ${value}`);
          break;
        case 'conteudo':
          formData.instructions = value;
          console.log(`📝 Conteúdo mapeado: ${value}`);
          break;
        case 'interatividade':
          formData.quadroInterativoCampoEspecifico = value;
          console.log(`🎮 Interatividade mapeada: ${value}`);
          break;
        case 'design':
          formData.difficultyLevel = value;
          console.log(`🎨 Design mapeado: ${value}`);
          break;
      }
    }
  });

  // Log final dos dados processados
  console.log('📊 RESUMO FINAL - Dados mapeados:');
  console.log('  📚 Disciplina:', formData.subject || '[VAZIO]');
  console.log('  🎓 Ano/Série:', formData.schoolYear || '[VAZIO]');
  console.log('  📖 Tema:', formData.theme || '[VAZIO]');
  console.log('  🎯 Objetivos:', formData.objectives || '[VAZIO]');
  console.log('  📊 Dificuldade:', formData.difficultyLevel || '[VAZIO]');
  console.log('  🎮 Atividade:', formData.quadroInterativoCampoEspecifico || '[VAZIO]');

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
