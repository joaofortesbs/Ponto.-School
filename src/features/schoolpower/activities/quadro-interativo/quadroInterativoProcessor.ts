
import { generateQuadroInterativoContent, saveQuadroInterativoData, QuadroInterativoFieldData } from './QuadroInterativoGenerator';

/**
 * Processa dados do formulário e gera conteúdo para Quadro Interativo
 */
export async function processQuadroInterativoData(
  activityId: string,
  formData: Record<string, any>
): Promise<any> {
  try {
    console.log('Processando dados do Quadro Interativo:', formData);

    // Mapeia os dados do formulário para o formato esperado
    const fieldData: QuadroInterativoFieldData = {
      titulo: formData.titulo || '',
      disciplina: formData.disciplina || '',
      anoEscolar: formData.anoEscolar || '',
      tema: formData.tema || '',
      objetivo: formData.objetivo || '',
      instrucoes: formData.instrucoes || '',
      observacoes: formData.observacoes || ''
    };

    // Gera o conteúdo usando a IA
    const generatedContent = await generateQuadroInterativoContent(fieldData);

    // Salva os dados localmente
    saveQuadroInterativoData(activityId, generatedContent);

    // Retorna dados processados
    return {
      ...formData,
      generatedContent,
      processedAt: new Date().toISOString()
    };

  } catch (error) {
    console.error('Erro ao processar dados do Quadro Interativo:', error);
    throw error;
  }
}

/**
 * Valida se os dados mínimos estão presentes
 */
export function validateQuadroInterativoData(formData: Record<string, any>): boolean {
  return !!(formData.titulo || formData.tema);
}

/**
 * Formata dados para exibição
 */
export function formatQuadroInterativoForDisplay(data: any): any {
  return {
    titulo: data.generatedContent?.titulo || data.titulo || 'Quadro Interativo',
    texto: data.generatedContent?.texto || 'Conteúdo não gerado',
    metadata: {
      disciplina: data.disciplina,
      anoEscolar: data.anoEscolar,
      tema: data.tema,
      processedAt: data.processedAt
    }
  };
}
