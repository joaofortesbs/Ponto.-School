
import { generateQuadroInterativoContent } from './QuadroInterativoGenerator';
import { mapFormDataToQuadroInterativo, validateQuadroInterativoData } from './fieldMapping';

export interface QuadroInterativoProcessorInput {
  quadroInterativoTitulo?: string;
  quadroInterativoDescricao?: string;
  quadroInterativoMateria?: string;
  quadroInterativoTema?: string;
  quadroInterativoAnoEscolar?: string;
  quadroInterativoNumeroQuestoes?: number;
  quadroInterativoNivelDificuldade?: string;
  quadroInterativoModalidadeQuestao?: string;
  quadroInterativoCampoEspecifico?: string;
}

export interface QuadroInterativoProcessorOutput {
  success: boolean;
  data?: any;
  error?: string;
  validationErrors?: string[];
}

export async function processQuadroInterativoData(
  inputData: QuadroInterativoProcessorInput
): Promise<QuadroInterativoProcessorOutput> {
  console.log('🔄 Processando dados do Quadro Interativo:', inputData);

  try {
    // Mapear dados do formulário
    const mappedData = mapFormDataToQuadroInterativo(inputData);
    console.log('📋 Dados mapeados:', mappedData);

    // Validar dados
    const isValid = validateQuadroInterativoData(mappedData);
    if (!isValid) {
      const validationErrors = [];
      if (!mappedData.titulo) validationErrors.push('Título é obrigatório');
      if (!mappedData.materia) validationErrors.push('Matéria é obrigatória');
      if (!mappedData.tema) validationErrors.push('Tema é obrigatório');

      return {
        success: false,
        error: 'Dados inválidos',
        validationErrors
      };
    }

    // Gerar conteúdo com a IA
    console.log('🤖 Gerando conteúdo com IA...');
    const generatedContent = await generateQuadroInterativoContent(mappedData);

    console.log('✅ Conteúdo gerado com sucesso');
    return {
      success: true,
      data: {
        originalInput: inputData,
        mappedData,
        generatedContent,
        timestamp: new Date().toISOString()
      }
    };

  } catch (error) {
    console.error('❌ Erro ao processar dados:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

export function createQuadroInterativoSummary(data: any): string {
  if (!data || !data.generatedContent) {
    return 'Quadro Interativo - Dados não disponíveis';
  }

  const content = data.generatedContent;
  return `${content.title} - ${content.subject} (${content.schoolYear}) - ${content.slides?.length || 0} slides`;
}

export function validateQuadroInterativoForSave(data: any): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!data.quadroInterativoTitulo?.trim()) {
    errors.push('Título é obrigatório');
  }

  if (!data.quadroInterativoMateria?.trim()) {
    errors.push('Matéria é obrigatória');
  }

  if (!data.quadroInterativoTema?.trim()) {
    errors.push('Tema é obrigatório');
  }

  if (data.quadroInterativoNumeroQuestoes < 5 || data.quadroInterativoNumeroQuestoes > 20) {
    errors.push('Número de questões deve estar entre 5 e 20');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}
