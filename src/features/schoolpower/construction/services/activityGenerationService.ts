export interface ActivityGenerationRequest {
  id: string;
  title: string;
  description: string;
  type: string;
  subject: string;
  theme: string;
  schoolYear: string;
  numberOfQuestions: string;
  difficultyLevel: string;
  questionModel: string;
  sources: string;
  customFields: Record<string, any>;
}

export interface GeneratedActivity {
  content: string;
  questions: Array<{
    question: string;
    options?: string[];
    correct?: number;
    type: 'multiple-choice' | 'essay' | 'true-false';
  }>;
  materials: string[];
  instructions: string;
  evaluation: string;
  metadata: {
    generatedAt: string;
    type: string;
    subject: string;
    theme: string;
  };
}

export class ActivityGenerationService {
  private static instance: ActivityGenerationService;

  static getInstance(): ActivityGenerationService {
    if (!ActivityGenerationService.instance) {
      ActivityGenerationService.instance = new ActivityGenerationService();
    }
    return ActivityGenerationService.instance;
  }

  async generateActivity(request: ActivityGenerationRequest): Promise<GeneratedActivity> {
    try {
      console.log(`🎯 Gerando atividade: ${request.title}`);

      // Gerar conteúdo baseado no tipo de atividade
      const content = await this.generateContentByType(request);

      return {
        content: content.content,
        questions: content.questions,
        materials: content.materials,
        instructions: content.instructions,
        evaluation: content.evaluation,
        metadata: {
          generatedAt: new Date().toISOString(),
          type: request.type,
          subject: request.subject,
          theme: request.theme
        }
      };
    } catch (error) {
      console.error('❌ Erro ao gerar atividade:', error);
      throw error;
    }
  }

  private async generateContentByType(request: ActivityGenerationRequest): Promise<any> {
    switch (request.type) {
      case 'lista-exercicios':
        return this.generateExerciseList(request);
      case 'prova-interativa':
        return this.generateInteractiveTest(request);
      case 'mapa-mental':
        return this.generateMindMap(request);
      case 'jogos-educativos':
        return this.generateEducationalGame(request);
      default:
        return this.generateGenericActivity(request);
    }
  }

  private async generateExerciseList(request: ActivityGenerationRequest): Promise<any> {
    const numQuestions = parseInt(request.numberOfQuestions) || 10;
    const questions = [];

    for (let i = 0; i < numQuestions; i++) {
      questions.push({
        question: `Questão ${i + 1} sobre ${request.theme} - ${request.subject}`,
        options: ['Alternativa A', 'Alternativa B', 'Alternativa C', 'Alternativa D'],
        correct: Math.floor(Math.random() * 4),
        type: 'multiple-choice' as const
      });
    }

    return {
      content: `Lista de exercícios sobre ${request.theme} para ${request.schoolYear}`,
      questions,
      materials: [`Livro didático de ${request.subject}`, 'Caderno de exercícios'],
      instructions: `Resolva as ${numQuestions} questões sobre ${request.theme}`,
      evaluation: `Avaliação baseada no acerto de pelo menos 70% das questões`
    };
  }

  private async generateInteractiveTest(request: ActivityGenerationRequest): Promise<any> {
    const numQuestions = parseInt(request.numberOfQuestions) || 15;
    const questions = [];

    for (let i = 0; i < numQuestions; i++) {
      questions.push({
        question: `Questão ${i + 1} da prova de ${request.theme}`,
        options: ['Opção A', 'Opção B', 'Opção C', 'Opção D'],
        correct: Math.floor(Math.random() * 4),
        type: 'multiple-choice' as const
      });
    }

    return {
      content: `Prova interativa de ${request.subject} - ${request.theme}`,
      questions,
      materials: ['Material de consulta permitido'],
      instructions: `Prova com ${numQuestions} questões sobre ${request.theme}`,
      evaluation: `Nota baseada na pontuação obtida`
    };
  }

  private async generateMindMap(request: ActivityGenerationRequest): Promise<any> {
    return {
      content: `Mapa mental sobre ${request.theme}`,
      questions: [{
        question: `Crie um mapa mental sobre ${request.theme}`,
        type: 'essay' as const
      }],
      materials: ['Papel', 'Canetas coloridas', 'Régua'],
      instructions: `Desenvolva um mapa mental completo sobre ${request.theme}`,
      evaluation: 'Avaliação baseada na organização e completude do mapa'
    };
  }

  private async generateEducationalGame(request: ActivityGenerationRequest): Promise<any> {
    return {
      content: `Jogo educativo sobre ${request.theme}`,
      questions: [{
        question: `Participe do jogo sobre ${request.theme}`,
        type: 'essay' as const
      }],
      materials: ['Computador ou tablet', 'Acesso à internet'],
      instructions: `Complete o jogo educativo sobre ${request.theme}`,
      evaluation: 'Avaliação baseada na participação e pontuação no jogo'
    };
  }

  private async generateGenericActivity(request: ActivityGenerationRequest): Promise<any> {
    return {
      content: `Atividade sobre ${request.theme} - ${request.subject}`,
      questions: [{
        question: `Desenvolva uma atividade sobre ${request.theme}`,
        type: 'essay' as const
      }],
      materials: ['Material didático', 'Caderno'],
      instructions: `Realize a atividade sobre ${request.theme}`,
      evaluation: 'Avaliação baseada no desenvolvimento da atividade'
    };
  }

  async saveGeneratedActivity(activityData: ActivityGenerationRequest, generatedContent: any): Promise<any> {
    try {
      // Salvar no localStorage usando o ID da atividade
      localStorage.setItem(`activity_${activityData.id}`, JSON.stringify({
        ...generatedContent,
        generatedAt: new Date().toISOString(),
        activityId: activityData.id,
        activityTitle: activityData.title,
        isGenerated: true
      }));

      console.log(`💾 Atividade ${activityData.id} salva com sucesso`);

      return generatedContent;
    } catch (error) {
      console.error('❌ Erro ao salvar atividade:', error);
      throw error;
    }
  }

  getGeneratedActivity(activityId: string): GeneratedActivity | null {
    try {
      const saved = localStorage.getItem(`generated_activity_${activityId}`);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      console.error('❌ Erro ao recuperar atividade:', error);
      return null;
    }
  }

  isActivityBuilt(activityId: string): boolean {
    return localStorage.getItem(`activity_built_${activityId}`) === 'true';
  }
}

export const activityGenerationService = ActivityGenerationService.getInstance();