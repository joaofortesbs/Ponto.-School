
export class QuizInterativoDebugger {
  static logGenerationStep(step: string, data: any) {
    console.log(`🎯 [QUIZ DEBUG] ${step}:`, data);
  }

  static logDataFlow(source: string, data: any) {
    console.log(`📊 [QUIZ DATA FLOW] ${source}:`, {
      hasData: !!data,
      hasQuestions: !!data?.questions,
      questionsCount: data?.questions?.length || 0,
      title: data?.title,
      isGeneratedByAI: data?.isGeneratedByAI,
      timestamp: new Date().toISOString()
    });
  }

  static validateQuizContent(content: any): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!content) {
      errors.push('Conteúdo não existe');
      return { isValid: false, errors };
    }

    if (!content.title) errors.push('Título não definido');
    if (!content.description) errors.push('Descrição não definida');
    if (!content.questions) errors.push('Questões não definidas');
    if (!Array.isArray(content.questions)) errors.push('Questões não é um array');
    if (content.questions && content.questions.length === 0) errors.push('Nenhuma questão encontrada');

    if (content.questions && Array.isArray(content.questions)) {
      content.questions.forEach((q: any, index: number) => {
        if (!q.question) errors.push(`Questão ${index + 1}: texto não definido`);
        if (!q.type) errors.push(`Questão ${index + 1}: tipo não definido`);
        if (!q.options || !Array.isArray(q.options)) errors.push(`Questão ${index + 1}: opções inválidas`);
        if (!q.correctAnswer) errors.push(`Questão ${index + 1}: resposta correta não definida`);
      });
    }

    return { isValid: errors.length === 0, errors };
  }
}
