
import { GeminiClient } from '@/utils/api/geminiClient';
import { quadroInterativoPrompt } from '../../prompts/quadroInterativoPrompt';

interface QuadroInterativoFormData {
  disciplina: string;
  anoSerie: string;
  tema: string;
  objetivo: string;
  nivelDificuldade: string;
  atividadeMostrada: string;
}

interface QuadroInterativoResult {
  success: boolean;
  data?: any;
  error?: string;
}

function buildQuadroInterativoPrompt(formData: QuadroInterativoFormData): string {
  return quadroInterativoPrompt
    .replace('{disciplina}', formData.disciplina)
    .replace('{anoSerie}', formData.anoSerie)
    .replace('{tema}', formData.tema)
    .replace('{objetivo}', formData.objetivo)
    .replace('{nivelDificuldade}', formData.nivelDificuldade)
    .replace('{atividadeMostrada}', formData.atividadeMostrada);
}

function parseGeminiResponse(responseText: string): any {
  console.log('🎯 Parseando resposta da IA:', responseText);

  try {
    // Limpar resposta
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, '').replace(/```\n?/g, '');
    cleanedText = cleanedText.trim();

    // Tentar parsear JSON
    const parsedContent = JSON.parse(cleanedText);
    
    console.log('✅ Conteúdo parseado com sucesso:', parsedContent);
    return parsedContent;

  } catch (error) {
    console.error('❌ Erro ao parsear resposta:', error);
    console.error('📝 Texto original:', responseText);
    throw new Error('Erro ao processar resposta da IA');
  }
}

export async function generateQuadroInterativoContent(
  formData: QuadroInterativoFormData
): Promise<QuadroInterativoResult> {
  console.log('🎯 Iniciando geração de conteúdo do Quadro Interativo...');
  console.log('📋 Dados recebidos:', formData);

  try {
    const geminiClient = new GeminiClient();

    const prompt = buildQuadroInterativoPrompt(formData);
    console.log('📝 Prompt construído para IA');

    const response = await geminiClient.generate({
      prompt,
      temperature: 0.7,
      maxTokens: 2048,
    });

    if (!response.success) {
      throw new Error(response.error || 'Erro na API Gemini');
    }

    console.log('📤 Resposta da IA recebida:', response.result);

    const parsedContent = parseGeminiResponse(response.result);
    
    if (!parsedContent.titulo) {
      throw new Error('Resposta da IA não contém título válido');
    }

    console.log('✅ Conteúdo processado com sucesso:', parsedContent);

    return {
      success: true,
      data: {
        ...parsedContent,
        conteudo: parsedContent, // Manter estrutura compatível
        metadados: {
          isGeneratedByAI: true,
          generatedAt: new Date().toISOString()
        }
      }
    };

  } catch (error) {
    console.error('❌ Erro na geração do conteúdo:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

// Exportações para compatibilidade
export * from './fieldMapping';
export { default as EditActivity } from './EditActivity';
export { default as QuadroInterativoPreview } from './QuadroInterativoPreview';
export { quadroInterativoFieldMapping } from './fieldMapping';

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

export function processQuadroInterativoData(activity: QuadroInterativoActivity): ActivityFormData {
  console.log('📱 Processando dados do Quadro Interativo:', activity);

  const customFields = activity.customFields || {};
  const consolidatedData = {
    ...activity,
    title: activity.personalizedTitle || activity.title,
    description: activity.personalizedDescription || activity.description
  };

  return {
    activityType: 'quadro-interativo',
    activityId: activity.id,
    title: consolidatedData.title,
    description: consolidatedData.description,
    customFields
  };
}
