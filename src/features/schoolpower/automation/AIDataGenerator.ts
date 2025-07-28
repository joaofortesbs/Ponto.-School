
import { ActivityTypeMapping } from './ActivityTypeDetector';

export interface AIGenerationRequest {
  activityType: string;
  baseData: any;
  requiredFields: string[];
  conditionalFields?: { [key: string]: string[] };
}

export interface AIGenerationResponse {
  success: boolean;
  data: any;
  errors?: string[];
}

export class AIDataGenerator {
  private static apiEndpoint = '/api/generate-activity-data';

  public static async generateActivityData(
    typeMapping: ActivityTypeMapping,
    baseData: any
  ): Promise<AIGenerationResponse> {
    try {
      const request: AIGenerationRequest = {
        activityType: typeMapping.id,
        baseData,
        requiredFields: typeMapping.requiredFields,
        conditionalFields: typeMapping.conditionalFields
      };

      // Generate prompt based on activity type
      const prompt = this.buildPrompt(request);

      // Call AI service (using existing Gemini integration)
      const response = await this.callGeminiAPI(prompt, typeMapping);

      if (response.success && response.data) {
        // Validate generated data
        const validationResult = this.validateGeneratedData(response.data, typeMapping);
        
        if (validationResult.valid) {
          return {
            success: true,
            data: response.data
          };
        } else {
          return {
            success: false,
            data: null,
            errors: validationResult.errors
          };
        }
      }

      return {
        success: false,
        data: null,
        errors: ['Failed to generate AI data']
      };

    } catch (error) {
      console.error('Error generating AI data:', error);
      return {
        success: false,
        data: null,
        errors: [error instanceof Error ? error.message : 'Unknown error']
      };
    }
  }

  private static buildPrompt(request: AIGenerationRequest): string {
    const basePrompt = `
Você é um assistente especializado em educação. Preciso que você gere dados estruturados para criar uma atividade educacional do tipo "${request.activityType}".

Dados base fornecidos:
${JSON.stringify(request.baseData, null, 2)}

Campos obrigatórios que devem ser preenchidos:
${request.requiredFields.join(', ')}

${request.conditionalFields ? `Campos condicionais disponíveis:
${Object.entries(request.conditionalFields).map(([field, options]) => 
  `- ${field}: ${options.join(', ')}`
).join('\n')}` : ''}

IMPORTANTE: Retorne APENAS um objeto JSON válido, sem comentários ou texto adicional. O JSON deve incluir todos os campos obrigatórios e campos relevantes para este tipo de atividade.

Exemplo de estrutura esperada para "${request.activityType}":
    `;

    // Add specific examples based on activity type
    switch (request.activityType) {
      case 'lista-exercicios':
        return basePrompt + `
{
  "titulo": "Nome da atividade",
  "descricao": "Descrição detalhada da atividade",
  "disciplina": "Disciplina correspondente",
  "tema": "Tema específico",
  "ano": "Ano escolar (ex: 6º ano)",
  "nivel": "Fácil/Médio/Difícil",
  "modelo_questao": "multipla_escolha/verdadeiro_falso/dissertativa",
  "formato_entrega": "Online/Presencial/Híbrido",
  "tempo_estimado": "Tempo em minutos",
  "objetivos": ["Objetivo 1", "Objetivo 2"],
  "materiais_necessarios": ["Material 1", "Material 2"],
  "numero_questoes": "Número de questões",
  "criterios_avaliacao": ["Critério 1", "Critério 2"]
}`;

      case 'jogo-educativo':
        return basePrompt + `
{
  "titulo": "Nome do jogo",
  "descricao": "Descrição do jogo educativo",
  "disciplina": "Disciplina correspondente",
  "tipo_jogo": "quiz/memoria/puzzle/simulacao",
  "nivel": "Fácil/Médio/Difícil",
  "tempo_estimado": "Tempo de jogo",
  "objetivos": ["Objetivo 1", "Objetivo 2"],
  "mecanicas": ["Mecânica 1", "Mecânica 2"],
  "recursos_necessarios": ["Recurso 1", "Recurso 2"],
  "instrucoes": "Instruções do jogo"
}`;

      case 'prova':
        return basePrompt + `
{
  "titulo": "Nome da avaliação",
  "descricao": "Descrição da prova",
  "disciplina": "Disciplina correspondente",
  "tempo_duracao": "Tempo em minutos",
  "valor_total": "Pontuação total",
  "formato": "presencial/online/mista",
  "numero_questoes": "Quantidade de questões",
  "tipos_questao": ["multipla_escolha", "dissertativa"],
  "conteudos_avaliados": ["Conteúdo 1", "Conteúdo 2"],
  "criterios_avaliacao": ["Critério 1", "Critério 2"]
}`;

      case 'redacao':
        return basePrompt + `
{
  "titulo": "Título da produção textual",
  "descricao": "Descrição da atividade de redação",
  "genero_textual": "narrativo/descritivo/dissertativo/argumentativo",
  "tema": "Tema da redação",
  "palavra_min": "Número mínimo de palavras",
  "palavra_max": "Número máximo de palavras",
  "criterios": ["Critério 1", "Critério 2"],
  "orientacoes": "Orientações específicas",
  "recursos_apoio": ["Recurso 1", "Recurso 2"]
}`;

      default:
        return basePrompt + `
{
  "titulo": "Título da atividade",
  "descricao": "Descrição detalhada",
  "disciplina": "Disciplina correspondente",
  "nivel": "Nível de dificuldade",
  "objetivos": ["Objetivo 1", "Objetivo 2"],
  "materiais_necessarios": ["Material 1", "Material 2"]
}`;
    }
  }

  private static async callGeminiAPI(prompt: string, typeMapping: ActivityTypeMapping): Promise<any> {
    try {
      // Use existing Gemini client from the codebase
      const { generateAIResponse } = await import('../../../utils/api/geminiClient');
      
      const response = await generateAIResponse(prompt);
      
      if (response) {
        // Try to parse JSON from response
        try {
          const jsonMatch = response.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const data = JSON.parse(jsonMatch[0]);
            return {
              success: true,
              data
            };
          }
        } catch (parseError) {
          console.error('Error parsing AI response:', parseError);
        }
      }

      return {
        success: false,
        data: null
      };

    } catch (error) {
      console.error('Error calling Gemini API:', error);
      return {
        success: false,
        data: null
      };
    }
  }

  private static validateGeneratedData(data: any, typeMapping: ActivityTypeMapping): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    for (const field of typeMapping.requiredFields) {
      if (!data[field] || (typeof data[field] === 'string' && data[field].trim() === '')) {
        errors.push(`Campo obrigatório ausente ou vazio: ${field}`);
      }
    }

    // Check conditional fields
    if (typeMapping.conditionalFields) {
      for (const [field, validOptions] of Object.entries(typeMapping.conditionalFields)) {
        if (data[field] && !validOptions.includes(data[field])) {
          errors.push(`Valor inválido para ${field}: ${data[field]}. Opções válidas: ${validOptions.join(', ')}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
