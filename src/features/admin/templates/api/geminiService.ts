import { Template, GeneratedActivity } from '../types';

export const generateActivityWithGemini = async (template: Template): Promise<GeneratedActivity> => {
  try {
    // Construir prompt baseado no template e campos
    const prompt = buildPromptForTemplate(template);
    
    // Fazer requisição para o Gemini (usar a mesma estrutura que já existe na plataforma)
    const response = await fetch('/api/gemini-generate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        prompt,
        templateId: template.id,
        fields: template.fields,
      }),
    });

    if (!response.ok) {
      throw new Error('Erro ao gerar atividade com Gemini');
    }

    const data = await response.json();
    
    return {
      title: data.title || `${template.name} - Atividade Gerada`,
      description: data.description || 'Atividade gerada automaticamente com IA',
      content: data.content || {},
      difficulty: template.fields.difficulty || 'Intermediário',
      duration: template.fields.duration || 30,
      type: template.id.split('-')[0] || 'activity',
    };
  } catch (error) {
    console.error('Error generating activity with Gemini:', error);
    throw error;
  }
};

const buildPromptForTemplate = (template: Template): string => {
  const fields = template.fields;
  
  let prompt = `Gere uma atividade educacional baseada nas seguintes especificações:

Template: ${template.name}
ID: ${template.id}
Provedor de IA: ${template.ia_provider}

Configurações:`;

  // Adicionar campos específicos ao prompt
  Object.entries(fields).forEach(([key, value]) => {
    if (value) {
      prompt += `\n- ${key}: ${value}`;
    }
  });

  prompt += `

Por favor, gere uma atividade completa e estruturada no formato JSON, incluindo:
1. Título da atividade
2. Descrição detalhada
3. Conteúdo específico (questões, exercícios, textos, etc.)
4. Instruções para o aluno
5. Critérios de avaliação (se aplicável)

A atividade deve ser educacionalmente relevante, bem estruturada e adequada para o nível de dificuldade especificado.`;

  return prompt;
};

// Simular resposta do Gemini para desenvolvimento/teste
export const mockGeminiResponse = (template: Template): GeneratedActivity => {
  const templateType = template.id.split('-')[0];
  
  const mockResponses: { [key: string]: any } = {
    quiz: {
      title: `Quiz de ${template.fields.topic || 'Conhecimentos Gerais'}`,
      description: `Quiz interativo com ${template.fields.questionCount || 10} questões sobre ${template.fields.topic || 'o tema especificado'}`,
      content: {
        questions: Array.from({ length: template.fields.questionCount || 10 }, (_, i) => ({
          id: i + 1,
          question: `Pergunta ${i + 1} sobre ${template.fields.topic || 'o tema'}`,
          type: template.fields.questionType || 'Múltipla Escolha',
          options: template.fields.questionType === 'Múltipla Escolha' ? [
            'Opção A', 'Opção B', 'Opção C', 'Opção D'
          ] : [],
          correctAnswer: 'A',
          explanation: 'Explicação da resposta correta'
        }))
      }
    },
    essay: {
      title: `Redação: ${template.fields.theme || 'Tema Livre'}`,
      description: `Redação dissertativa sobre "${template.fields.theme || 'tema especificado'}" com limite de ${template.fields.wordLimit || 500} palavras`,
      content: {
        theme: template.fields.theme || 'Tema da redação',
        instructions: [
          'Desenvolva uma redação dissertativa',
          `Mantenha o limite de ${template.fields.wordLimit || 500} palavras`,
          'Utilize argumentos consistentes',
          'Conclua com uma proposta de solução'
        ],
        criteria: [
          'Coerência e coesão textual',
          'Domínio da norma culta',
          'Capacidade argumentativa',
          'Proposta de intervenção'
        ]
      }
    },
    exercise: {
      title: `Exercícios de ${template.fields.topic || 'Prática'}`,
      description: `Lista com ${template.fields.exerciseCount || 5} exercícios práticos sobre ${template.fields.topic || 'o tema'}`,
      content: {
        exercises: Array.from({ length: template.fields.exerciseCount || 5 }, (_, i) => ({
          id: i + 1,
          statement: `Exercício ${i + 1}: Resolva o problema relacionado a ${template.fields.topic || 'o tema'}`,
          difficulty: template.fields.difficulty || 'Intermediário',
          expectedAnswer: 'Resposta esperada',
          explanation: template.fields.includeExplanation === 'Sim' ? 'Explicação detalhada da resolução' : null
        }))
      }
    }
  };

  return mockResponses[templateType] || {
    title: template.name,
    description: 'Atividade gerada automaticamente',
    content: { data: 'Conteúdo da atividade' },
    difficulty: template.fields.difficulty || 'Intermediário',
    duration: template.fields.duration || 30,
    type: templateType
  };
};

export interface GeminiServiceConfig {
  apiKey?: string;
  model?: string;
}

export class GeminiService {
  private apiKey: string;
  private model: string;

  constructor(config: GeminiServiceConfig = {}) {
    this.apiKey = config.apiKey || process.env.GEMINI_API_KEY || '';
    this.model = config.model || 'gemini-pro';
  }

  async generateActivity(template: any, context: any): Promise<any> {
    try {
      // Simulação da geração de atividade
      return {
        success: true,
        activity: {
          title: `Atividade gerada para ${template.name}`,
          content: 'Conteúdo da atividade...',
          questions: [],
          metadata: {
            template_id: template.id,
            generated_at: new Date().toISOString()
          }
        }
      };
    } catch (error) {
      console.error('Erro ao gerar atividade:', error);
      return {
        success: false,
        error: 'Erro na geração da atividade'
      };
    }
  }
}

export const geminiService = new GeminiService();