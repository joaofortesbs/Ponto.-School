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

// Função processQuadroInterativoData removida para evitar duplicação

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

    // Verificar se já tem conteúdo processado
    if (generatedData.cardContent && generatedData.isGeneratedByAI) {
      console.log('✅ Dados já processados, retornando:', generatedData);
      return generatedData;
    }

    // Instanciar o gerador
    const generator = new QuadroInterativoGenerator();

    // Construir dados para a IA com validação
    const extractField = (fieldName: string, fallback: string) => {
      return generatedData.customFields?.[fieldName] ||
             generatedData[fieldName] ||
             generatedData.personalizedTitle ||
             generatedData.title ||
             fallback;
    };

    const aiData = {
      subject: extractField('Disciplina / Área de conhecimento', 'Matemática'),
      schoolYear: extractField('Ano / Série', '5º Ano'),
      theme: extractField('Tema ou Assunto da aula', 'Tema educativo'),
      objectives: extractField('Objetivo de aprendizagem da aula', 'Desenvolver conhecimentos'),
      difficultyLevel: extractField('Nível de Dificuldade', 'Intermediário'),
      quadroInterativoCampoEspecifico: extractField('Atividade mostrada', 'Atividade interativa no quadro')
    };

    console.log('📝 Dados preparados para IA:', aiData);

    // Validar dados essenciais
    const hasValidData = aiData.subject && aiData.theme && aiData.objectives;
    
    if (!hasValidData) {
      console.warn('⚠️ Dados insuficientes para geração pela IA, usando fallback');
      return createFallbackData(generatedData);
    }

    try {
      const aiGeneratedContent = await generator.generateQuadroInterativoContent(aiData);
      console.log('🤖 Conteúdo gerado pela IA:', aiGeneratedContent);

      // Validar conteúdo gerado
      if (!aiGeneratedContent.cardContent?.title || !aiGeneratedContent.cardContent?.text) {
        console.warn('⚠️ Conteúdo da IA incompleto, ajustando...');
        aiGeneratedContent.cardContent = {
          title: aiGeneratedContent.title || 'Quadro Interativo Educativo',
          text: aiGeneratedContent.description || 'Conteúdo educativo desenvolvido para interação no quadro digital.'
        };
      }

      // Combinar dados originais com conteúdo gerado pela IA
      const finalResult = {
        ...generatedData,
        // Dados principais
        title: aiGeneratedContent.title || generatedData.personalizedTitle || generatedData.title || 'Quadro Interativo',
        description: aiGeneratedContent.description || generatedData.personalizedDescription || generatedData.description || 'Atividade interativa',

        // Conteúdo específico do card
        cardContent: aiGeneratedContent.cardContent,

        // Metadados da IA
        generatedAt: aiGeneratedContent.generatedAt || new Date().toISOString(),
        isGeneratedByAI: true,

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
      return createFallbackData(generatedData);
    }

  } catch (error) {
    console.error('❌ Erro ao preparar dados do Quadro Interativo:', error);
    geminiLogger.logError(error as Error, { originalData: data });
    return createFallbackData(data);
  }
}

function createFallbackData(originalData: any) {
  return {
    ...originalData,
    title: originalData.personalizedTitle || originalData.title || 'Quadro Interativo',
    description: originalData.personalizedDescription || originalData.description || 'Atividade de quadro interativo',
    cardContent: {
      title: originalData.personalizedTitle || originalData.title || 'Atividade de Quadro Interativo',
      text: originalData.personalizedDescription || originalData.description || 'Conteúdo educativo para interação no quadro digital da sala de aula.'
    },
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: false,
    customFields: originalData?.customFields || {}
  };
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
  prepareQuadroInterativoData,
  validateQuadroInterativoFields
};