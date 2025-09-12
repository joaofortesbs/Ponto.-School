
import { ActivityFormData } from '../types/ActivityTypes';

/**
 * Gera conteúdo para diferentes tipos de atividades
 */
export async function generateActivityContent(activityType: string, formData: ActivityFormData): Promise<any> {
  console.log(`🚀 Gerando conteúdo para atividade: ${activityType}`);
  console.log(`📊 Dados do formulário:`, formData);

  try {
    switch (activityType) {
      case 'lista-exercicios':
        return await generateListaExercicios(formData);
      
      case 'plano-aula':
        return await generatePlanoAula(formData);
      
      case 'sequencia-didatica':
        return await generateSequenciaDidatica(formData);
      
      case 'quadro-interativo':
        return await generateQuadroInterativo(formData);
      
      case 'quiz-interativo':
        return await generateQuizInterativo(formData);
      
      case 'flash-cards':
        return await generateFlashCards(formData);
      
      case 'mapa-mental':
        return await generateMapaMental(formData);
      
      default:
        return await generateGenericActivity(formData, activityType);
    }
  } catch (error) {
    console.error(`❌ Erro ao gerar ${activityType}:`, error);
    throw error;
  }
}

// Geradores específicos para cada tipo de atividade
async function generateListaExercicios(formData: ActivityFormData) {
  const content = {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    schoolYear: formData.schoolYear,
    numberOfQuestions: parseInt(formData.numberOfQuestions) || 10,
    difficultyLevel: formData.difficultyLevel,
    questionModel: formData.questionModel,
    objectives: formData.objectives,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    questions: Array.from({ length: parseInt(formData.numberOfQuestions) || 10 }, (_, i) => ({
      id: i + 1,
      question: `Questão ${i + 1} sobre ${formData.theme || formData.title}`,
      type: 'open',
      points: 1
    })),
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generatePlanoAula(formData: ActivityFormData) {
  const content = {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    theme: formData.theme,
    schoolYear: formData.schoolYear,
    objectives: formData.objectives,
    materials: formData.materials,
    context: formData.context,
    timeLimit: formData.timeLimit,
    methodology: formData.difficultyLevel,
    evaluation: formData.evaluation,
    competencies: formData.competencies,
    development: {
      introduction: "Introdução ao tema",
      activities: ["Atividade prática", "Discussão em grupo"],
      conclusion: "Conclusão e avaliação"
    },
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generateSequenciaDidatica(formData: ActivityFormData) {
  const content = {
    title: formData.title || formData.tituloTemaAssunto,
    description: formData.description,
    tituloTemaAssunto: formData.tituloTemaAssunto,
    anoSerie: formData.anoSerie,
    disciplina: formData.disciplina,
    bnccCompetencias: formData.bnccCompetencias,
    publicoAlvo: formData.publicoAlvo,
    objetivosAprendizagem: formData.objetivosAprendizagem,
    quantidadeAulas: parseInt(formData.quantidadeAulas) || 4,
    quantidadeDiagnosticos: parseInt(formData.quantidadeDiagnosticos) || 1,
    quantidadeAvaliacoes: parseInt(formData.quantidadeAvaliacoes) || 2,
    cronograma: formData.cronograma,
    aulas: Array.from({ length: parseInt(formData.quantidadeAulas) || 4 }, (_, i) => ({
      numero: i + 1,
      titulo: `Aula ${i + 1}: ${formData.tituloTemaAssunto}`,
      objetivos: formData.objetivosAprendizagem,
      conteudo: `Conteúdo da aula ${i + 1}`,
      metodologia: "Metodologia ativa",
      recursos: "Recursos pedagógicos",
      avaliacao: "Avaliação formativa"
    })),
    diagnosticos: Array.from({ length: parseInt(formData.quantidadeDiagnosticos) || 1 }, (_, i) => ({
      numero: i + 1,
      titulo: `Diagnóstico ${i + 1}`,
      objetivo: "Avaliar conhecimentos prévios",
      instrumento: "Questionário diagnóstico"
    })),
    avaliacoes: Array.from({ length: parseInt(formData.quantidadeAvaliacoes) || 2 }, (_, i) => ({
      numero: i + 1,
      titulo: `Avaliação ${i + 1}`,
      tipo: i === 0 ? "Formativa" : "Somativa",
      criterios: "Critérios de avaliação"
    })),
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generateQuadroInterativo(formData: ActivityFormData) {
  const content = {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    schoolYear: formData.schoolYear,
    theme: formData.theme,
    objectives: formData.objectives,
    difficultyLevel: formData.difficultyLevel,
    quadroInterativoCampoEspecifico: formData.quadroInterativoCampoEspecifico,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    interactiveElements: [
      {
        type: "drag-drop",
        title: "Atividade de Arrastar e Soltar",
        description: "Arraste os elementos para as posições corretas"
      },
      {
        type: "click-reveal",
        title: "Clique para Revelar",
        description: "Clique nos elementos para descobrir informações"
      }
    ],
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generateQuizInterativo(formData: ActivityFormData) {
  const numberOfQuestions = parseInt(formData.numberOfQuestions) || 10;
  
  const content = {
    title: formData.title,
    description: formData.description,
    subject: formData.subject,
    theme: formData.theme,
    schoolYear: formData.schoolYear,
    difficultyLevel: formData.difficultyLevel,
    questionModel: formData.questionModel,
    format: formData.format || formData.questionModel,
    timePerQuestion: parseInt(formData.timePerQuestion) || 60,
    numberOfQuestions: numberOfQuestions,
    questions: Array.from({ length: numberOfQuestions }, (_, i) => ({
      id: i + 1,
      question: `Questão ${i + 1}: Sobre ${formData.theme || formData.subject}, qual conceito é mais importante?`,
      type: 'multipla-escolha',
      options: [
        `A) Conceito básico de ${formData.theme || formData.subject}`,
        `B) Aplicação prática`,
        `C) Teoria avançada`,
        `D) Exercícios práticos`
      ],
      correctAnswer: `A) Conceito básico de ${formData.theme || formData.subject}`,
      explanation: `O conceito básico é fundamental para o entendimento em ${formData.subject}.`
    })),
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generateFlashCards(formData: ActivityFormData) {
  const numberOfCards = parseInt(formData.numberOfFlashcards) || 10;
  const topicos = formData.topicos?.split('\n').filter(t => t.trim()) || [];
  
  // Garantir que temos pelo menos alguns tópicos
  const finalTopicos = topicos.length > 0 ? topicos : [
    formData.theme || 'Conceito Principal',
    `Aplicação de ${formData.theme || 'Conceito'}`,
    `Importância de ${formData.theme || 'Conceito'}`,
    `Exercícios sobre ${formData.theme || 'Conceito'}`,
    `Exemplos de ${formData.theme || 'Conceito'}`
  ];
  
  const content = {
    title: formData.title,
    description: formData.description,
    theme: formData.theme,
    subject: formData.subject,
    schoolYear: formData.schoolYear,
    topicos: formData.topicos,
    numberOfFlashcards: numberOfCards,
    context: formData.context,
    difficultyLevel: formData.difficultyLevel,
    objectives: formData.objectives,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    cards: finalTopicos.slice(0, numberOfCards).map((topic, i) => ({
      id: i + 1,
      front: `O que é ${topic.trim()}?`,
      back: `${topic.trim()} é um conceito importante em ${formData.subject || 'Geral'} que deve ser compreendido por estudantes do ${formData.schoolYear || 'ensino médio'}. É essencial para o desenvolvimento acadêmico nesta área.`,
      category: formData.subject || 'Geral',
      difficulty: formData.difficultyLevel || 'Médio'
    })),
    totalCards: Math.min(numberOfCards, finalTopicos.length),
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: false, // Corrigir o valor cortado
    isFallback: true
  };

  return { success: true, data: content };
}ue
  };

  return { success: true, data: content };
}

async function generateMapaMental(formData: ActivityFormData) {
  const content = {
    title: formData.title,
    description: formData.description,
    centralTheme: formData.centralTheme,
    mainCategories: formData.mainCategories,
    generalObjective: formData.generalObjective,
    evaluationCriteria: formData.evaluationCriteria,
    branches: formData.mainCategories?.split('\n').filter(c => c.trim()).map((category, i) => ({
      id: i + 1,
      title: category.trim(),
      subtopics: [`Subtópico 1 de ${category}`, `Subtópico 2 de ${category}`]
    })) || [],
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}

async function generateGenericActivity(formData: ActivityFormData, activityType: string) {
  const content = {
    title: formData.title,
    description: formData.description,
    objectives: formData.objectives,
    materials: formData.materials,
    instructions: formData.instructions,
    evaluation: formData.evaluation,
    activityType: activityType,
    generatedAt: new Date().toISOString(),
    isGeneratedByAI: true
  };

  return { success: true, data: content };
}
