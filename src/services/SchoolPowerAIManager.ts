
import { GeminiClient, GeminiRequest, GeminiResponse } from '@/utils/api/geminiClient';
import { ClaudeClient, ClaudeRequest, ClaudeResponse } from '@/utils/api/claudeClient';

// Tipos para as respostas padronizadas
export interface AIResponse {
  success: boolean;
  content: string;
  tokensUsed: number;
  responseTime: number;
  model: 'claude' | 'gemini';
  error?: string;
}

// Tipos para parâmetros das funções
export interface LessonPlanParams {
  subject: string;
  grade: string;
  duration: string;
  objectives: string[];
  content: string;
}

export interface TestParams {
  subject: string;
  grade: string;
  questionCount: number;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
}

export interface SlidePresentationParams {
  title: string;
  subject: string;
  slideCount: number;
  content: string;
  audience: string;
}

export interface RewriteTextParams {
  text: string;
  style: 'formal' | 'casual' | 'academic' | 'simple';
  purpose: string;
}

// Mapeamento de funcionalidades para modelos de IA
const FUNCTIONALITY_MODEL_MAP = {
  // Funcionalidades prioritárias → Claude 3.7 Sonnet
  lessonPlan: 'claude',
  test: 'claude',
  pei: 'claude', // Plano Educacional Individualizado
  report: 'claude',
  exam: 'claude',
  assessment: 'claude',
  curriculum: 'claude',
  
  // Funcionalidades secundárias → Gemini 2.5 Flash
  exerciseList: 'gemini',
  slides: 'gemini',
  messages: 'gemini',
  recreationalActivities: 'gemini',
  simpleAdaptations: 'gemini',
  rewriteText: 'gemini',
  summarize: 'gemini',
} as const;

export class SchoolPowerAIManager {
  private claudeClient: ClaudeClient;
  private geminiClient: GeminiClient;

  constructor() {
    this.claudeClient = new ClaudeClient();
    this.geminiClient = new GeminiClient();
  }

  /**
   * Gera um plano de aula personalizado
   */
  async generateLessonPlan(params: LessonPlanParams): Promise<AIResponse> {
    const prompt = `
Crie um plano de aula detalhado com as seguintes especificações:

**Disciplina:** ${params.subject}
**Série/Ano:** ${params.grade}
**Duração:** ${params.duration}

**Objetivos:**
${params.objectives.map(obj => `- ${obj}`).join('\n')}

**Conteúdo a ser abordado:**
${params.content}

Por favor, estruture o plano incluindo:
1. Objetivos específicos
2. Metodologia
3. Recursos necessários
4. Desenvolvimento da aula (introdução, desenvolvimento, conclusão)
5. Avaliação
6. Atividades complementares

Formate de forma clara e profissional para uso educacional.
    `;

    return this.executeRequest('lessonPlan', prompt);
  }

  /**
   * Gera uma prova/teste
   */
  async generateTest(params: TestParams): Promise<AIResponse> {
    const prompt = `
Crie uma prova/teste com as seguintes especificações:

**Disciplina:** ${params.subject}
**Série/Ano:** ${params.grade}
**Número de questões:** ${params.questionCount}
**Dificuldade:** ${params.difficulty}

**Tópicos a abordar:**
${params.topics.map(topic => `- ${topic}`).join('\n')}

Inclua:
- Questões variadas (múltipla escolha, dissertativas, V/F)
- Gabarito comentado
- Critérios de avaliação
- Distribuição de pontos

Formate de forma profissional e educativa.
    `;

    return this.executeRequest('test', prompt);
  }

  /**
   * Resume o conteúdo de um vídeo
   */
  async summarizeVideo(videoURL: string, context?: string): Promise<AIResponse> {
    const prompt = `
Preciso de um resumo estruturado de um vídeo educacional.

**URL do vídeo:** ${videoURL}
${context ? `**Contexto adicional:** ${context}` : ''}

Como não posso acessar o conteúdo do vídeo diretamente, forneça um template estruturado para resumo de vídeo educacional que inclua:

1. Título e duração estimada
2. Objetivos de aprendizagem
3. Principais tópicos abordados
4. Conceitos-chave
5. Aplicações práticas
6. Pontos de atenção
7. Recursos complementares sugeridos

Este template poderá ser preenchido após assistir ao vídeo.
    `;

    return this.executeRequest('summarize', prompt);
  }

  /**
   * Reescreve texto com estilo específico
   */
  async rewriteText(params: RewriteTextParams): Promise<AIResponse> {
    const prompt = `
Reescreva o seguinte texto:

**Texto original:**
${params.text}

**Estilo desejado:** ${params.style}
**Propósito:** ${params.purpose}

Mantenha o significado original, mas adapte o tom, vocabulário e estrutura para o estilo solicitado.
Garanta que o texto reescrito seja adequado para o contexto educacional.
    `;

    return this.executeRequest('rewriteText', prompt);
  }

  /**
   * Cria apresentação em slides
   */
  async createSlidePresentation(params: SlidePresentationParams): Promise<AIResponse> {
    const prompt = `
Crie o conteúdo para uma apresentação em slides com as seguintes especificações:

**Título:** ${params.title}
**Disciplina:** ${params.subject}
**Número de slides:** ${params.slideCount}
**Público-alvo:** ${params.audience}

**Conteúdo base:**
${params.content}

Para cada slide, forneça:
- Título do slide
- Pontos principais (bullets)
- Imagens sugeridas
- Notas para o apresentador

Organize de forma didática e envolvente.
    `;

    return this.executeRequest('slides', prompt);
  }

  /**
   * Gera lista de exercícios
   */
  async generateExerciseList(subject: string, grade: string, topic: string, quantity: number): Promise<AIResponse> {
    const prompt = `
Crie uma lista de exercícios com as seguintes especificações:

**Disciplina:** ${subject}
**Série/Ano:** ${grade}
**Tópico:** ${topic}
**Quantidade:** ${quantity} exercícios

Inclua:
- Exercícios de diferentes níveis de dificuldade
- Gabarito com resoluções comentadas
- Dicas de estudo
- Exercícios extras para reforço

Formate de forma didática e progressiva.
    `;

    return this.executeRequest('exerciseList', prompt);
  }

  /**
   * Executa requisição para o modelo apropriado
   */
  private async executeRequest(functionality: keyof typeof FUNCTIONALITY_MODEL_MAP, prompt: string): Promise<AIResponse> {
    const modelToUse = FUNCTIONALITY_MODEL_MAP[functionality];
    
    try {
      if (modelToUse === 'claude') {
        const response = await this.claudeClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 4096,
        });

        return {
          ...response,
          model: 'claude',
        };
      } else {
        const response = await this.geminiClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        });

        return {
          ...response,
          model: 'gemini',
        };
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        tokensUsed: 0,
        responseTime: 0,
        model: modelToUse,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }

  /**
   * Atualiza chave da API Claude
   */
  updateClaudeApiKey(newKey: string): void {
    this.claudeClient.updateApiKey(newKey);
  }

  /**
   * Atualiza chave da API Gemini
   */
  updateGeminiApiKey(newKey: string): void {
    this.geminiClient.updateApiKey(newKey);
  }

  /**
   * Obtém estatísticas de uso
   */
  getUsageStats(): { supportedFunctionalities: string[], modelMapping: typeof FUNCTIONALITY_MODEL_MAP } {
    return {
      supportedFunctionalities: Object.keys(FUNCTIONALITY_MODEL_MAP),
      modelMapping: FUNCTIONALITY_MODEL_MAP,
    };
  }

  /**
   * Função genérica para executar qualquer prompt
   */
  async executeCustomPrompt(prompt: string, preferredModel?: 'claude' | 'gemini'): Promise<AIResponse> {
    const modelToUse = preferredModel || 'gemini'; // Default para Gemini

    try {
      if (modelToUse === 'claude') {
        const response = await this.claudeClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 4096,
        });

        return {
          ...response,
          model: 'claude',
        };
      } else {
        const response = await this.geminiClient.generate({
          prompt,
          temperature: 0.7,
          maxTokens: 2048,
        });

        return {
          ...response,
          model: 'gemini',
        };
      }
    } catch (error) {
      return {
        success: false,
        content: '',
        tokensUsed: 0,
        responseTime: 0,
        model: modelToUse,
        error: error instanceof Error ? error.message : 'Erro desconhecido',
      };
    }
  }
}

// Instância singleton para uso global
export const schoolPowerAI = new SchoolPowerAIManager();
