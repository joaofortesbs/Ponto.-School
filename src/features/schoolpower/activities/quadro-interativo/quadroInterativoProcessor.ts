
import { geminiLogger } from '@/utils/geminiDebugLogger';
import { QuadroInterativoGenerator } from './QuadroInterativoGenerator';

// Interfaces
interface ActivityFormData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  title: string;
  description: string;
  materials?: string;
  [key: string]: any;
}

interface QuadroInterativoActivity {
  id?: string;
  title: string;
  description?: string;
  personalizedTitle?: string;
  personalizedDescription?: string;
  customFields?: { [key: string]: any };
  materials?: any;
}

/**
 * Função utilitária para sanitizar strings JSON
 */
function sanitizeJsonString(value: any): string {
  if (typeof value !== 'string') {
    return String(value || '');
  }
  
  return value
    .replace(/undefined/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Função para normalizar materiais
 */
function normalizeMaterials(materials: any): string {
  if (!materials) return '';
  
  if (typeof materials === 'string') {
    return materials;
  }
  
  if (Array.isArray(materials)) {
    return materials.map(item => {
      if (typeof item === 'string') return item;
      if (typeof item === 'object' && item !== null) {
        return JSON.stringify(item);
      }
      return String(item);
    }).join(', ');
  }
  
  if (typeof materials === 'object') {
    return JSON.stringify(materials);
  }
  
  return String(materials);
}

/**
 * Valida os dados de entrada do Quadro Interativo
 */
function validateQuadroInterativoData(activity: QuadroInterativoActivity): boolean {
  return !!(activity && (activity.title || activity.personalizedTitle));
}

/**
 * Processa dados de uma atividade de Quadro Interativo do Action Plan
 * para o formato do formulário do modal
 */
export function processQuadroInterativoData(activity: QuadroInterativoActivity): ActivityFormData {
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
    subject: safeCustomFields['Disciplina'] || safeCustomFields['Disciplina / Área de conhecimento'] || 'Matemática',
    schoolYear: safeCustomFields['Ano / Série'] || 'Ex: 6º Ano, 7º Ano, 8º Ano',
    theme: sanitizeJsonString(consolidatedData.title) || safeCustomFields['Tema ou Assunto da aula'] || 'Ex: Substantivos e Verbos, Frações, Sistema Solar',
    objectives: safeCustomFields['Objetivo de aprendizagem da aula'] || safeCustomFields['Objetivos de Aprendizagem'] || '',
    difficultyLevel: safeCustomFields['Nível de Dificuldade'] || 'Ex: Básico, Intermediário, Avançado',

    // Campo específico do Quadro Interativo
    quadroInterativoCampoEspecifico: safeCustomFields['Atividade mostrada'] || safeCustomFields['Tipo de Interação'] || 'Ex: Jogo de arrastar e soltar, Quiz interativo, Mapa mental',

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

  // Limpar valores 'undefined' dos campos
  Object.keys(formData).forEach(key => {
    if (typeof formData[key] === 'string' && formData[key].includes('undefined')) {
      formData[key] = '';
    }
  });

  console.log('✅ FormData do Quadro Interativo preparado e validado:', formData);
  return formData;
}

/**
 * Prepara dados do Quadro Interativo para a IA Gemini gerar conteúdo
 */
export async function prepareQuadroInterativoData(data: any): Promise<any> {
  console.log('🔧 Preparando dados do Quadro Interativo para processamento:', data);
  
  try {
    // Extrair dados das respostas da IA se disponível
    const generatedData = data.respostasIA?.data || data;
    
    console.log('📊 Dados extraídos do generatedData:', generatedData);

    if (!generatedData) {
      throw new Error('Dados não encontrados para processamento do Quadro Interativo');
    }

    // Instanciar o gerador
    const generator = new QuadroInterativoGenerator();

    // Construir dados para a IA
    const aiData = {
      subject: generatedData.customFields?.['Disciplina / Área de conhecimento'] || 
              generatedData['Disciplina / Área de conhecimento'] || 'Disciplina',
      schoolYear: generatedData.customFields?.['Ano / Série'] || 
                 generatedData['Ano / Série'] || 'Ano/Série',
      theme: generatedData.customFields?.['Tema ou Assunto da aula'] || 
             generatedData['Tema ou Assunto da aula'] || 'Tema da aula',
      objectives: generatedData.customFields?.['Objetivo de aprendizagem da aula'] || 
                 generatedData['Objetivo de aprendizagem da aula'] || 'Objetivos',
      difficultyLevel: generatedData.customFields?.['Nível de Dificuldade'] || 
                      generatedData['Nível de Dificuldade'] || 'Intermediário',
      quadroInterativoCampoEspecifico: generatedData.customFields?.['Atividade mostrada'] || 
                                      generatedData['Atividade mostrada'] || 'Atividade interativa'
    };

    console.log('📝 Dados preparados para IA:', aiData);

    try {
      const aiGeneratedContent = await generator.generateQuadroInterativoContent(aiData);
      console.log('🤖 Conteúdo gerado pela IA:', aiGeneratedContent);

      // Combinar dados originais com conteúdo gerado pela IA
      const finalResult = {
        ...generatedData,
        // Dados principais
        title: aiGeneratedContent.title || aiGeneratedContent.cardContent?.title || generatedData.title || 'Quadro Interativo',
        description: aiGeneratedContent.description || aiGeneratedContent.cardContent?.text || generatedData.description || 'Atividade interativa',
        
        // Conteúdo específico do card
        cardContent: aiGeneratedContent.cardContent || {
          title: aiGeneratedContent.title || 'Atividade de Quadro Interativo',
          text: aiGeneratedContent.description || 'Conteúdo educativo interativo'
        },
        
        // Metadados da IA
        generatedAt: aiGeneratedContent.generatedAt || new Date().toISOString(),
        isGeneratedByAI: aiGeneratedContent.isGeneratedByAI || true,
        
        // Preservar campos customizados originais
        customFields: {
          ...generatedData.customFields,
          ...aiGeneratedContent.customFields
        }
      };

      console.log('✅ Resultado final preparado:', finalResult);
      return finalResult;

    } catch (aiError) {
      console.error('❌ Erro na geração de conteúdo pela IA:', aiError);
      
      // Fallback: retornar dados originais com estrutura mínima
      return {
        ...generatedData,
        title: generatedData.title || 'Quadro Interativo',
        description: generatedData.description || 'Atividade de quadro interativo',
        cardContent: {
          title: 'Atividade de Quadro Interativo',
          text: 'Conteúdo educativo para interação no quadro digital da sala de aula.'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false
      };
    }

  } catch (error) {
    console.error('❌ Erro ao preparar dados do Quadro Interativo:', error);
    geminiLogger.logError(error as Error, { originalData: data });
    
    // Retornar estrutura básica em caso de erro crítico
    return {
      title: 'Quadro Interativo',
      description: 'Atividade educativa interativa',
      cardContent: {
        title: 'Atividade de Quadro Interativo',
        text: 'Conteúdo educativo para interação no quadro digital.'
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      customFields: data?.customFields || {}
    };
  }
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
  prepareQuadroInterativoData,
  validateQuadroInterativoFields
};
