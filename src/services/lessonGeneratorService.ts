/**
 * ====================================================================
 * PONTO. SCHOOL - SERVIÇO DE GERAÇÃO DE AULAS COM IA
 * ====================================================================
 * 
 * Este serviço conecta o frontend ao backend para geração automática
 * de conteúdo de aulas usando IA (Groq API).
 * 
 * FLUXO:
 * 1. Modal "Personalize sua aula" → Usuário preenche dados
 * 2. Clique em "Gerar aula" → Chama este serviço
 * 3. Backend processa com IA → Retorna conteúdo
 * 4. Interface popula campos automaticamente
 * 
 * VERSÃO: 1.0.0
 * ÚLTIMA ATUALIZAÇÃO: 2025-12-23
 * ====================================================================
 */

const API_BASE_URL = '/api/lesson-generator';

/**
 * Interface para dados de entrada da geração de aula
 */
export interface LessonGenerationInput {
  templateId: string;
  templateName: string;
  assunto: string;
  contexto?: string;
  sectionOrder: string[];
}

/**
 * Interface para dados gerados pela IA
 */
export interface GeneratedLessonData {
  titulo: string;
  objetivo: string;
  duracao_estimada?: string;
  nivel_ensino?: string;
  secoes: Record<string, string>;
  tags?: string[];
  competencias_bncc?: string[];
}

/**
 * Interface para resposta completa da API
 */
export interface LessonGenerationResponse {
  success: boolean;
  requestId: string;
  data: GeneratedLessonData | null;
  error?: string;
  metadata?: {
    templateId: string;
    templateName: string;
    assunto: string;
    generatedAt: string;
    processingTime: number;
  };
}

/**
 * Interface para regeneração de seção
 */
export interface SectionRegenerationInput {
  sectionId: string;
  sectionName: string;
  assunto: string;
  contexto?: string;
  currentContent?: string;
  instruction?: string;
}

/**
 * Interface para resposta de regeneração de seção
 */
export interface SectionRegenerationResponse {
  success: boolean;
  requestId: string;
  data: {
    sectionId: string;
    content: string;
  } | null;
  error?: string;
}

/**
 * Interface para resposta de geração de títulos
 */
export interface TitleGenerationResponse {
  success: boolean;
  requestId: string;
  data: {
    titulos: string[];
  };
  error?: string;
}

/**
 * ====================================================================
 * FUNÇÃO PRINCIPAL: GERAR AULA COMPLETA
 * ====================================================================
 */
export async function generateLesson(input: LessonGenerationInput): Promise<LessonGenerationResponse> {
  console.log('🎓 [LessonGeneratorService] Iniciando geração de aula...');
  console.log('🎓 [LessonGeneratorService] Input:', {
    templateId: input.templateId,
    templateName: input.templateName,
    assunto: input.assunto,
    contexto: input.contexto?.substring(0, 100) || '[vazio]',
    sectionCount: input.sectionOrder.length
  });

  try {
    const response = await fetch(`${API_BASE_URL}/generate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    const result: LessonGenerationResponse = await response.json();

    console.log('🎓 [LessonGeneratorService] Resposta recebida:', {
      success: result.success,
      requestId: result.requestId,
      titulo: result.data?.titulo,
      secoesGeradas: result.data?.secoes ? Object.keys(result.data.secoes).length : 0
    });

    return result;

  } catch (error) {
    console.error('❌ [LessonGeneratorService] Erro:', error);
    
    return {
      success: false,
      requestId: 'ERROR',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: REGENERAR SEÇÃO ESPECÍFICA
 * ====================================================================
 */
export async function regenerateSection(input: SectionRegenerationInput): Promise<SectionRegenerationResponse> {
  console.log('🔄 [LessonGeneratorService] Regenerando seção:', input.sectionId);

  try {
    const response = await fetch(`${API_BASE_URL}/regenerate-section`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: SectionRegenerationResponse = await response.json();

    console.log('🔄 [LessonGeneratorService] Regeneração concluída:', result.success);

    return result;

  } catch (error) {
    console.error('❌ [LessonGeneratorService] Erro na regeneração:', error);
    
    return {
      success: false,
      requestId: 'ERROR',
      data: null,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: GERAR OPÇÕES DE TÍTULO
 * ====================================================================
 */
export async function generateTitleOptions(assunto: string, contexto?: string): Promise<TitleGenerationResponse> {
  console.log('📝 [LessonGeneratorService] Gerando opções de título para:', assunto);

  try {
    const response = await fetch(`${API_BASE_URL}/generate-titles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ assunto, contexto }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `HTTP ${response.status}`);
    }

    const result: TitleGenerationResponse = await response.json();

    console.log('📝 [LessonGeneratorService] Títulos gerados:', result.data?.titulos?.length || 0);

    return result;

  } catch (error) {
    console.error('❌ [LessonGeneratorService] Erro ao gerar títulos:', error);
    
    return {
      success: false,
      requestId: 'ERROR',
      data: { titulos: [`Aula sobre ${assunto}`] },
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}

/**
 * ====================================================================
 * FUNÇÃO: TESTAR CONEXÃO COM O SERVIÇO
 * ====================================================================
 */
export async function testConnection(): Promise<{ success: boolean; message: string }> {
  console.log('🧪 [LessonGeneratorService] Testando conexão...');

  try {
    const response = await fetch(`${API_BASE_URL}/test`);
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const result = await response.json();
    
    console.log('🧪 [LessonGeneratorService] Teste:', result.success ? '✅ OK' : '❌ FALHOU');
    
    return result;

  } catch (error) {
    console.error('❌ [LessonGeneratorService] Erro no teste:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Erro de conexão'
    };
  }
}

/**
 * ====================================================================
 * HELPER: MAPEAR DADOS GERADOS PARA FORMATO DA INTERFACE
 * ====================================================================
 * Converte os dados retornados pela IA para o formato esperado
 * pelos componentes da interface de criação de aula.
 */
export function mapGeneratedDataToInterface(
  generatedData: GeneratedLessonData,
  sectionOrder: string[]
): {
  titulo: string;
  objetivo: string;
  dynamicSections: Record<string, string>;
} {
  console.log('🗺️ [LessonGeneratorService] Mapeando dados para interface...');
  console.log('🗺️ [LessonGeneratorService] Seções esperadas:', sectionOrder);
  console.log('🗺️ [LessonGeneratorService] Seções geradas:', Object.keys(generatedData.secoes));

  const dynamicSections: Record<string, string> = {};

  for (const sectionId of sectionOrder) {
    if (sectionId === 'objective') continue;
    
    const content = generatedData.secoes[sectionId];
    if (content) {
      dynamicSections[sectionId] = content;
      console.log(`✅ [LessonGeneratorService] Seção "${sectionId}" mapeada`);
    } else {
      console.log(`⚠️ [LessonGeneratorService] Seção "${sectionId}" não encontrada nos dados gerados`);
      dynamicSections[sectionId] = '';
    }
  }

  return {
    titulo: generatedData.titulo,
    objetivo: generatedData.objetivo,
    dynamicSections
  };
}

export default {
  generateLesson,
  regenerateSection,
  generateTitleOptions,
  testConnection,
  mapGeneratedDataToInterface
};
