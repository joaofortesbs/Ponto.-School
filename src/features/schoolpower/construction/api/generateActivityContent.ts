
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
      
      case 'tese-redacao':
        return await generateTeseRedacao(formData);
      
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
  console.log('🃏 [generateFlashCards] Iniciando geração com dados:', formData);

  try {
    // Importar o gerador real de Flash Cards
    const { FlashCardsGenerator } = await import('@/features/schoolpower/activities/flash-cards/FlashCardsGenerator');
    
    // Validar dados obrigatórios
    if (!formData.theme || formData.theme.trim() === '') {
      throw new Error('Tema é obrigatório para gerar flash cards');
    }

    if (!formData.topicos || formData.topicos.trim() === '') {
      throw new Error('Tópicos são obrigatórios para gerar flash cards');
    }

    const numberOfCards = parseInt(formData.numberOfFlashcards?.toString() || '10');

    // Preparar dados para o gerador
    const flashCardsData = {
      title: formData.title || `Flash Cards: ${formData.theme}`,
      theme: formData.theme,
      subject: formData.subject || 'Geral',
      schoolYear: formData.schoolYear || 'Ensino Médio',
      topicos: formData.topicos,
      numberOfFlashcards: numberOfCards.toString(),
      context: formData.context || 'Estudos e revisão',
      difficultyLevel: formData.difficultyLevel || 'Médio',
      objectives: formData.objectives || `Facilitar o aprendizado sobre ${formData.theme}`,
      instructions: formData.instructions || 'Use os flash cards para estudar e revisar o conteúdo',
      evaluation: formData.evaluation || 'Avalie o conhecimento através da prática com os cards'
    };

    console.log('🃏 [generateFlashCards] Dados preparados para API Gemini:', flashCardsData);

    // Criar instância do gerador e gerar conteúdo com API Gemini
    const generator = new FlashCardsGenerator();
    const result = await generator.generateFlashCardsContent(flashCardsData);

    console.log('✅ [generateFlashCards] Conteúdo gerado com sucesso pela API Gemini:', result);

    return { success: true, data: result };

  } catch (error) {
    console.error('❌ [generateFlashCards] Erro ao gerar com API Gemini:', error);

    // Fallback apenas em caso de erro
    const numberOfCards = parseInt(formData.numberOfFlashcards) || 10;
    const topicos = formData.topicos?.split('\n').filter(t => t.trim()) || [];
    
    const finalTopicos = topicos.length > 0 ? topicos : [
      formData.theme || 'Conceito Principal',
      `Aplicação de ${formData.theme || 'Conceito'}`,
      `Importância de ${formData.theme || 'Conceito'}`,
      `Exercícios sobre ${formData.theme || 'Conceito'}`,
      `Exemplos de ${formData.theme || 'Conceito'}`
    ];
    
    const fallbackContent = {
      title: formData.title || `Flash Cards: ${formData.theme} (Fallback)`,
      description: formData.description || `Flash cards sobre ${formData.theme}`,
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
      isGeneratedByAI: false,
      isFallback: true
    };

    console.log('🛡️ [generateFlashCards] Usando conteúdo de fallback:', fallbackContent);

    return { success: true, data: fallbackContent };
  }
}

async function generateTeseRedacao(formData: ActivityFormData) {
  console.log('=====================================');
  console.log('📝 [generateTeseRedacao] FUNÇÃO CHAMADA!');
  console.log('=====================================');
  console.log('📥 [generateTeseRedacao] FormData COMPLETO recebido:');
  console.log(JSON.stringify(formData, null, 2));
  console.log('=====================================');

  try {
    console.log('📦 [generateTeseRedacao] Importando TeseRedacaoGenerator...');
    const { TeseRedacaoGenerator } = await import('@/features/schoolpower/activities/tese-redacao/TeseRedacaoGenerator');
    console.log('✅ [generateTeseRedacao] TeseRedacaoGenerator importado com sucesso');

    const teseData = {
      title: formData.title || 'Tese da Redação',
      temaRedacao: formData.temaRedacao || formData.theme || 'Tema da Redação',
      nivelDificuldade: formData.nivelDificuldade || formData.difficultyLevel || 'Médio',
      objetivo: formData.objetivo || formData.objectives || 'Elaborar teses consistentes para redação do ENEM',
      competenciasENEM: formData.competenciasENEM || 'Competência II e III (compreensão tema e argumentação)',
      contextoAdicional: formData.contextoAdicional || formData.context || ''
    };

    console.log('=====================================');
    console.log('📝 [generateTeseRedacao] Dados estruturados para o Generator:');
    console.log(JSON.stringify(teseData, null, 2));
    console.log('=====================================');

    console.log('🚀 [generateTeseRedacao] Criando instância do Generator...');
    const generator = new TeseRedacaoGenerator();
    
    console.log('🚀 [generateTeseRedacao] Chamando generateTeseRedacaoContent...');
    const generatedContent = await generator.generateTeseRedacaoContent(teseData);

    console.log('=====================================');
    console.log('✅✅✅ [generateTeseRedacao] CONTEÚDO GERADO COM SUCESSO!');
    console.log('=====================================');
    console.log('📦 [generateTeseRedacao] Conteúdo gerado pela API Gemini:');
    console.log(JSON.stringify(generatedContent, null, 2).substring(0, 1000) + '...');
    console.log('=====================================');

    const finalContent = {
      ...generatedContent,
      title: generatedContent.title || formData.title,
      temaRedacao: generatedContent.temaRedacao || formData.temaRedacao,
      generatedByAI: true,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: true,
      isFallback: generatedContent.isFallback || false,
      formDataUsed: teseData
    };

    // Validar que as teses foram geradas
    console.log('=====================================');
    console.log('🔍 [generateActivityContent] VALIDANDO TESES GERADAS');
    console.log('=====================================');
    
    if (!finalContent.etapa2_battleTeses?.tesesParaComparar || finalContent.etapa2_battleTeses.tesesParaComparar.length < 3) {
      console.error('❌ [generateActivityContent] ERRO: Teses não geradas corretamente!');
      console.error('📊 Teses recebidas:', finalContent.etapa2_battleTeses);
      console.error('🔧 Quantidade de teses:', finalContent.etapa2_battleTeses?.tesesParaComparar?.length || 0);
    } else {
      console.log('✅ [generateActivityContent] Teses validadas com sucesso!');
      console.log('📊 Quantidade:', finalContent.etapa2_battleTeses.tesesParaComparar.length);
      finalContent.etapa2_battleTeses.tesesParaComparar.forEach((tese: any, i: number) => {
        console.log(`  ✓ Tese ${i + 1}: ID=${tese.id}, ${tese.tese.length} caracteres`);
      });
    }
    console.log('=====================================');

    // Salvar no localStorage com múltiplas chaves para garantir persistência
    const timestamp = Date.now();
    const activityId = `tese_redacao_${timestamp}`;
    const storageKeys = [
      `constructed_tese-redacao_${activityId}`,
      `activity_${activityId}`,
      'latest_tese_redacao_activity',
      'tese_redacao_current'
    ];

    console.log('💾 [generateActivityContent] Salvando em múltiplas chaves do localStorage...');
    storageKeys.forEach(key => {
      try {
        const dataToSave = { success: true, data: finalContent, timestamp, activityId };
        localStorage.setItem(key, JSON.stringify(dataToSave));
        console.log(`  ✓ Salvo em: ${key}`);
      } catch (error) {
        console.error(`  ❌ Erro ao salvar em ${key}:`, error);
      }
    });

    // Salvar também com o ID da atividade se existir
    if ((window as any).currentActivityId) {
      const currentActivityKey = `constructed_tese-redacao_${(window as any).currentActivityId}`;
      try {
        localStorage.setItem(currentActivityKey, JSON.stringify({ success: true, data: finalContent }));
        console.log(`  ✓ Salvo com ID da atividade: ${currentActivityKey}`);
      } catch (error) {
        console.error(`  ❌ Erro ao salvar com ID da atividade:`, error);
      }
    }

    console.log('✅ [generateActivityContent] Conteúdo salvo com sucesso em todas as chaves!');
    console.log('=====================================');

    return { success: true, data: finalContent };

  } catch (error) {
    console.error('❌ Erro ao gerar Tese da Redação:', error);

    // Fallback
    const fallbackContent = {
      title: formData.title || 'Tese da Redação',
      temaRedacao: formData.temaRedacao || formData.theme || 'Tema da Redação',
      nivelDificuldade: formData.nivelDificuldade || 'Médio',
      objetivo: formData.objetivo || 'Elaborar teses consistentes',
      competenciasENEM: formData.competenciasENEM || 'Competência II e III',
      contextoAdicional: formData.contextoAdicional || '',
      tesesSugeridas: [
        {
          id: 1,
          tese: 'Tese de exemplo sobre o tema proposto',
          argumentos: ['Argumento 1', 'Argumento 2', 'Argumento 3'],
          explicacao: 'Explicação da tese',
          pontosFortres: ['Clara e objetiva'],
          pontosMelhorar: ['Adicionar dados']
        }
      ],
      dicasGerais: ['Leia atentamente o tema', 'Desenvolva tese clara'],
      criteriosAvaliacao: {
        competenciaII: 'Compreensão do tema',
        competenciaIII: 'Argumentação consistente'
      },
      isFallback: true,
      generatedAt: new Date().toISOString()
    };

    return { success: true, data: fallbackContent };
  }
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
