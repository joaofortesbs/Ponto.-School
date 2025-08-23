import { ActivityFormData } from '../../construction/types/ActivityTypes';
import { fieldMapping, normalizeMaterials } from './fieldMapping';
import { geminiLogger } from '@/utils/geminiDebugLogger';

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

// --- Start of edited code ---
export interface QuadroInterativoData {
  disciplina?: string;
  anoSerie?: string;
  tema?: string;
  objetivos?: string;
  nivelDificuldade?: string;
  atividadeMostrada?: string;
  [key: string]: any;
}

export interface QuadroInterativoResult {
  title: string;
  description: string;
  cardContent: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
}

export function processQuadroInterativoData(formData: any): QuadroInterativoResult {
  console.log('🔄 Processando dados do Quadro Interativo:', formData);

  try {
    // Extrair dados dos campos do formulário com múltiplas possibilidades
    const disciplina = formData.disciplina || formData.subject || formData['Disciplina / Área de conhecimento'] || '';
    const anoSerie = formData.anoSerie || formData.schoolYear || formData['Ano / Série'] || '';
    const tema = formData.tema || formData.theme || formData.title || formData['Tema ou Assunto da aula'] || '';
    const objetivos = formData.objetivos || formData.objectives || formData.description || formData['Objetivo de aprendizagem da aula'] || '';
    const nivelDificuldade = formData.nivelDificuldade || formData.difficultyLevel || formData['Nível de Dificuldade'] || '';
    const atividadeMostrada = formData.atividadeMostrada || formData.quadroInterativoCampoEspecifico || formData['Atividade mostrada'] || '';

    console.log('📊 Dados extraídos:', {
      disciplina, anoSerie, tema, objetivos, nivelDificuldade, atividadeMostrada
    });

    // Verificar se temos dados gerados pela IA em diferentes estruturas
    let cardContent = null;
    
    if (formData.cardContent && (formData.cardContent.title || formData.cardContent.text)) {
      cardContent = formData.cardContent;
      console.log('✅ Usando cardContent existente');
    } else if (formData.data && formData.data.cardContent) {
      cardContent = formData.data.cardContent;
      console.log('✅ Usando cardContent de formData.data');
    } else if (formData.generatedContent && formData.generatedContent.cardContent) {
      cardContent = formData.generatedContent.cardContent;
      console.log('✅ Usando cardContent de generatedContent');
    }

    // Se temos conteúdo gerado, usar ele
    if (cardContent && (cardContent.title || cardContent.text)) {
      console.log('✅ Usando dados já gerados pela IA:', cardContent);
      return {
        title: tema || cardContent.title || 'Quadro Interativo',
        description: objetivos || cardContent.text || 'Atividade de quadro interativo',
        cardContent: {
          title: cardContent.title || tema || 'Conteúdo do Quadro',
          text: cardContent.text || objetivos || 'Conteúdo educativo gerado pela IA.'
        },
        generatedAt: formData.generatedAt || new Date().toISOString(),
        isGeneratedByAI: formData.isGeneratedByAI !== false
      };
    }

    // Criar estrutura padrão com dados do formulário
    const result: QuadroInterativoResult = {
      title: tema || 'Quadro Interativo',
      description: objetivos || 'Atividade de quadro interativo',
      cardContent: {
        title: tema || 'Conteúdo do Quadro',
        text: objetivos || 'Conteúdo educativo será exibido aqui após a geração pela IA.'
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false
    };

    console.log('✅ Dados processados (estrutura padrão):', result);
    geminiLogger.info('quadro_interativo_processor', 'Dados processados com sucesso', result);

    return result;
  } catch (error) {
    console.error('❌ Erro ao processar dados do Quadro Interativo:', error);
    geminiLogger.error('quadro_interativo_processor', 'Erro no processamento', error);

    // Retornar estrutura de fallback
    return {
      title: 'Quadro Interativo',
      description: 'Atividade de quadro interativo',
      cardContent: {
        title: 'Conteúdo do Quadro',
        text: 'Erro ao processar dados. Tente novamente.'
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false
    };
  }
}

export function consolidateQuadroInterativoData(data: any): QuadroInterativoData {
  console.log('🔄 Consolidando dados do Quadro Interativo:', data);

  const consolidated: QuadroInterativoData = {
    disciplina: data.disciplina || data['Disciplina / Área de conhecimento'] || '',
    anoSerie: data.anoSerie || data['Ano / Série'] || '',
    tema: data.tema || data['Tema ou Assunto da aula'] || '',
    objetivos: data.objetivos || data['Objetivo de aprendizagem da aula'] || '',
    nivelDificuldade: data.nivelDificuldade || data['Nível de Dificuldade'] || '',
    atividadeMostrada: data.atividadeMostrada || data['Atividade mostrada'] || ''
  };

  console.log('✅ Dados consolidados:', consolidated);
  return consolidated;
}
// --- End of edited code ---


/**
 * Valida se os dados do Quadro Interativo são válidos
 */
function validateQuadroInterativoData(data: any): boolean {
  try {
    if (!data || typeof data !== 'object') return false;

    // Verificar campos essenciais
    const requiredFields = ['title', 'description'];
    for (const field of requiredFields) {
      if (!data[field] || typeof data[field] !== 'string' || data[field].trim() === '') {
        console.warn(`⚠️ Campo obrigatório ausente ou inválido: ${field}`);
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('❌ Erro na validação dos dados do Quadro Interativo:', error);
    return false;
  }
}

/**
 * Sanitiza uma string para uso seguro em JSON
 */
function sanitizeJsonString(str: string): string {
  if (!str || typeof str !== 'string') return '';

  return str
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
    .trim();
}

/**
 * Processa dados de uma atividade de Quadro Interativo do Action Plan
 * para o formato do formulário do modal
 */
export function processQuadroInterativoData_old(activity: QuadroInterativoActivity): ActivityFormData {
  console.log('📱 Processando dados do Quadro Interativo:', activity);

  // Validar dados de entrada
  if (!validateQuadroInterativoData(activity)) {
    console.error('❌ Dados inválidos para Quadro Interativo:', activity);
    throw new Error('Dados inválidos para processamento do Quadro Interativo');
  }

  const customFields = activity.customFields || {};

  // Sanitizar dados
  const sanitizedActivity = {
    ...activity,
    title: sanitizeJsonString(activity.personalizedTitle || activity.title),
    description: sanitizeJsonString(activity.personalizedDescription || activity.description)
  };

  const consolidatedData = {
    ...sanitizedActivity,
    title: sanitizedActivity.title,
    description: sanitizedActivity.description
  };

  // Extrair campos customizados com valores padrão seguros
  const safeCustomFields: { [key: string]: string } = {};
  Object.keys(customFields).forEach(key => {
    const value = customFields[key];
    if (value && typeof value === 'string') {
      safeCustomFields[key] = sanitizeJsonString(value);
    }
  });

  // Mapeamento para o formato do formulário
  const formData: ActivityFormData = {
    // Campos básicos
    subject: safeCustomFields['Disciplina'] || 'Matemática',
    schoolYear: safeCustomFields['Ano / Série'] || 'Ex: 6º Ano, 7º Ano, 8º Ano',
    theme: sanitizeJsonString(consolidatedData.title) || 'Ex: Substantivos e Verbos, Frações, Sistema Solar',
    objectives: safeCustomFields['Objetivos de Aprendizagem'] || '',
    difficultyLevel: safeCustomFields['Nível de Dificuldade'] || 'Ex: Básico, Intermediário, Avançado',

    // Campo específico do Quadro Interativo
    quadroInterativoCampoEspecifico: safeCustomFields['Tipo de Interação'] || 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental',

    // Campos adicionais
    bnccCompetencias: safeCustomFields['BNCC / Competências'] || '',
    publico: safeCustomFields['Público-alvo'] || '',

    // Campos padrão necessários para ActivityFormData
    title: consolidatedData.title || '',
    description: consolidatedData.description || '',
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
    materials: String(normalizeMaterials(consolidatedData.materials || '')),
    instructions: '',
    evaluation: '',
    timeLimit: '',
    context: '',

    // Campos extras que podem estar presentes
    ...safeCustomFields
  };

  console.log('✅ Dados do Quadro Interativo processados com sucesso:', formData);
  return formData;
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
    materials: normalizeMaterials(customFields['Materiais Necessários'] || customFields['materiais'] || ''),
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
  validateQuadroInterativoFields,
  // consolidateQuadroInterativoData is exposed via its own export
};