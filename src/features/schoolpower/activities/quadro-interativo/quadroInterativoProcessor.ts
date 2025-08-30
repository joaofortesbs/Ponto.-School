
import { ActivityFormData } from '../../construction/types/ActivityTypes';

/**
 * Processa dados para o Quadro Interativo
 * Simplificado para trabalhar com o novo sistema baseado no Preview
 */
export function prepareQuadroInterativoData(activityData: any): ActivityFormData {
  console.log('📊 Processando dados do Quadro Interativo:', activityData);

  // Função auxiliar para normalizar materiais
  const normalizeMaterials = (materials: any): string => {
    if (typeof materials === 'string') return materials;
    if (Array.isArray(materials)) return materials.join(', ');
    if (materials && typeof materials === 'object') {
      return Object.values(materials).filter(Boolean).join(', ');
    }
    return '';
  };

  // Consolidar dados de diferentes fontes
  const consolidatedData = {
    title: activityData.title || activityData.personalizedTitle || '',
    description: activityData.description || activityData.personalizedDescription || '',
    ...activityData.customFields,
    ...activityData
  };

  // Campos customizados seguros
  const safeCustomFields = consolidatedData.customFields || {};

  // Mapear para ActivityFormData
  const formData: ActivityFormData = {
    // Campos específicos do Quadro Interativo
    subject: safeCustomFields['Disciplina / Área de conhecimento'] || consolidatedData.subject || '',
    schoolYear: safeCustomFields['Ano / Série'] || consolidatedData.schoolYear || '',
    theme: safeCustomFields['Tema ou Assunto da aula'] || consolidatedData.theme || '',
    objectives: safeCustomFields['Objetivo de aprendizagem da aula'] || consolidatedData.objectives || '',
    difficultyLevel: safeCustomFields['Nível de Dificuldade'] || consolidatedData.difficultyLevel || 'Médio',
    quadroInterativoCampoEspecifico: safeCustomFields['Campo Específico do Quadro Interativo'] || '',

    // Campos obrigatórios para ActivityFormData
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

    // Manter campos extras
    ...safeCustomFields
  };

  console.log('✅ Dados do Quadro Interativo processados:', formData);
  return formData;
}

/**
 * Processa dados gerados pela IA do Gemini para o preview
 * Agora é responsabilidade do Preview fazer a geração
 */
export function processQuadroInterativoAIData(generatedData: any): any {
  console.log('🤖 Processando dados da IA para Preview:', generatedData);
  
  // Simplesmente retorna os dados para o Preview processar
  return {
    ...generatedData,
    processedAt: new Date().toISOString(),
    processedBy: 'quadroInterativoProcessor'
  };
}
