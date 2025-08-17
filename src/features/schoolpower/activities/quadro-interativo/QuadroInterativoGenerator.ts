
export interface QuadroInterativoContent {
  title: string;
  description: string;
  subject: string;
  schoolYear: string;
  theme: string;
  objectives: string;
  difficultyLevel: string;
  quadroInterativoCampoEspecifico: string;
  timeLimit: string;
  materials: string;
  instructions: string;
  evaluation: string;
  interactiveResources: string[];
  activities: Array<{
    type: string;
    name: string;
    description: string;
    duration: string;
  }>;
  success: boolean;
}

class QuadroInterativoGenerator {
  static async generateContent(formData: any): Promise<QuadroInterativoContent> {
    console.log('🖼️ Gerando conteúdo para Quadro Interativo:', formData);

    try {
      // Processar e estruturar os dados de entrada
      const processedData = this.processFormData(formData);
      
      // Gerar atividades interativas baseadas no tema
      const interactiveActivities = this.generateInteractiveActivities(processedData);
      
      // Gerar recursos interativos
      const interactiveResources = this.generateInteractiveResources(processedData);

      const content: QuadroInterativoContent = {
        title: processedData.title || 'Quadro Interativo',
        description: processedData.description || 'Atividade educacional interativa',
        subject: processedData.subject || 'Matemática',
        schoolYear: processedData.schoolYear || '6º Ano',
        theme: processedData.theme || 'Conteúdo Interativo',
        objectives: processedData.objectives || 'Desenvolver habilidades através de atividades interativas no quadro',
        difficultyLevel: processedData.difficultyLevel || 'Intermediário',
        quadroInterativoCampoEspecifico: processedData.quadroInterativoCampoEspecifico || 'Atividade interativa personalizada',
        timeLimit: processedData.timeLimit || '45 minutos',
        materials: processedData.materials || 'Quadro interativo, computador, projetor',
        instructions: processedData.instructions || 'Interaja com os elementos do quadro conforme as orientações apresentadas',
        evaluation: processedData.evaluation || 'Avaliação contínua baseada na participação e engajamento',
        interactiveResources,
        activities: interactiveActivities,
        success: true
      };

      console.log('✅ Conteúdo do Quadro Interativo gerado:', content);
      return content;

    } catch (error) {
      console.error('❌ Erro ao gerar conteúdo do Quadro Interativo:', error);
      
      return {
        title: 'Erro na Geração',
        description: 'Não foi possível gerar o conteúdo do quadro interativo',
        subject: formData.subject || 'Matemática',
        schoolYear: formData.schoolYear || '6º Ano',
        theme: formData.theme || 'Tema não definido',
        objectives: 'Objetivos não puderam ser gerados',
        difficultyLevel: formData.difficultyLevel || 'Médio',
        quadroInterativoCampoEspecifico: 'Atividade não pôde ser configurada',
        timeLimit: '45 minutos',
        materials: 'Recursos básicos',
        instructions: 'Instruções não disponíveis',
        evaluation: 'Critérios não definidos',
        interactiveResources: [],
        activities: [],
        success: false
      };
    }
  }

  private static processFormData(formData: any) {
    return {
      title: formData.title?.trim() || '',
      description: formData.description?.trim() || '',
      subject: formData.subject?.trim() || 'Matemática',
      schoolYear: formData.schoolYear?.trim() || '6º Ano',
      theme: formData.theme?.trim() || '',
      objectives: formData.objectives?.trim() || '',
      difficultyLevel: formData.difficultyLevel?.trim() || 'Intermediário',
      quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico?.trim() || '',
      timeLimit: formData.timeLimit?.trim() || '45 minutos',
      materials: formData.materials?.trim() || '',
      instructions: formData.instructions?.trim() || '',
      evaluation: formData.evaluation?.trim() || ''
    };
  }

  private static generateInteractiveActivities(data: any) {
    const activities = [
      {
        type: 'drag-drop',
        name: 'Arrastar e Soltar',
        description: `Atividade de ${data.theme} onde os alunos arrastam elementos para as posições corretas`,
        duration: '15 minutos'
      },
      {
        type: 'quiz-interactive',
        name: 'Quiz Interativo',
        description: `Perguntas e respostas sobre ${data.theme} com feedback imediato`,
        duration: '20 minutos'
      },
      {
        type: 'simulation',
        name: 'Simulação',
        description: `Simulação interativa de conceitos relacionados a ${data.theme}`,
        duration: '10 minutos'
      }
    ];

    return activities.slice(0, 2); // Retorna 2 atividades principais
  }

  private static generateInteractiveResources(data: any) {
    return [
      'Quadro digital interativo',
      'Elementos visuais dinâmicos',
      'Sistema de feedback em tempo real',
      'Interface touch screen',
      'Recursos multimídia integrados'
    ];
  }
}

export default QuadroInterativoGenerator;
export { QuadroInterativoGenerator };
