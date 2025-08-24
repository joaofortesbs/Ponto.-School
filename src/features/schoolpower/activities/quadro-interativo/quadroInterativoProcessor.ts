
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
