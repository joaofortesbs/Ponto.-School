import { geminiLogger } from '../../../utils/geminiDebugLogger';

export interface QuadroInterativoData {
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, any>;
}

export interface QuadroInterativoContent {
  title: string;
  description: string;
  cardContent: {
    title: string;
    text: string;
  };
  generatedAt: string;
  isGeneratedByAI: boolean;
  // Campos originais para compatibilidade
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico?: string;
  customFields?: Record<string, any>;
}

/**
 * Classe para geração de conteúdo de Quadro Interativo
 * NOTA: A lógica principal foi movida para QuadroInterativoPreview.tsx
 * Esta classe mantém apenas compatibilidade com o sistema existente
 */
export class QuadroInterativoGenerator {

  /**
   * Método de compatibilidade - redireciona para o Preview
   */
  async generateQuadroInterativoContent(data: QuadroInterativoData): Promise<QuadroInterativoContent> {
    geminiLogger.logRequest('QuadroInterativoGenerator - Redirecionando para Preview', data);

    // Retorna estrutura básica - o Preview que fará a geração real
    const result: QuadroInterativoContent = {
      title: data.theme || 'Quadro Interativo',
      description: data.objectives || 'Atividade de quadro interativo',
      cardContent: {
        title: 'Conteúdo será gerado no Preview',
        text: 'O conteúdo será gerado automaticamente pela IA no componente de visualização.'
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false, // Será true quando gerado no Preview
      // Campos originais para compatibilidade
      subject: data.subject,
      schoolYear: data.schoolYear,
      theme: data.theme,
      objectives: data.objectives,
      difficultyLevel: data.difficultyLevel,
      quadroInterativoCampoEspecifico: data.quadroInterativoCampoEspecifico,
      customFields: data.customFields || {}
    };

    geminiLogger.logResponse('QuadroInterativoGenerator - Estrutura básica criada', result);
    return result;
  }
}