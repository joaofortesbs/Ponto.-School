
import { ActivityFormData } from '../types/ActivityTypes';
import { generateListaExerciciosContent } from '../../activities/lista-exercicios/ListaExerciciosGenerator';

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
  console.log('📝 [generateListaExercicios] Iniciando geração com IA...');
  
  try {
    const generatedContent = await generateListaExerciciosContent({
      titulo: formData.title,
      title: formData.title,
      descricao: formData.description,
      description: formData.description,
      disciplina: formData.subject,
      subject: formData.subject,
      tema: formData.theme,
      theme: formData.theme,
      anoEscolaridade: formData.schoolYear,
      schoolYear: formData.schoolYear,
      numeroQuestoes: formData.numberOfQuestions,
      numberOfQuestions: formData.numberOfQuestions,
      nivelDificuldade: formData.difficultyLevel,
      difficultyLevel: formData.difficultyLevel,
      modeloQuestoes: formData.questionModel,
      questionModel: formData.questionModel,
      objetivos: formData.objectives,
      objectives: formData.objectives,
      fontes: formData.sources,
      sources: formData.sources
    });

    console.log('✅ [generateListaExercicios] Conteúdo gerado com sucesso:', {
      titulo: generatedContent.titulo,
      questoesCount: generatedContent.questoes?.length || 0,
      isGeneratedByAI: generatedContent.isGeneratedByAI
    });

    // Log detalhado das primeiras questões para debug
    if (generatedContent.questoes && generatedContent.questoes.length > 0) {
      console.log('📋 [generateListaExercicios] Primeira questão:', JSON.stringify(generatedContent.questoes[0], null, 2));
    }

    // IMPORTANTE: Retornar dados diretamente (sem wrapper { success, data })
    // para consistência com o que o ExerciseListPreview espera
    const resultado = {
      ...generatedContent,
      title: generatedContent.titulo,
      description: formData.description || (generatedContent as unknown as Record<string, unknown>).descricao as string || '',
      subject: generatedContent.disciplina,
      theme: generatedContent.tema,
      schoolYear: generatedContent.anoEscolaridade,
      numberOfQuestions: generatedContent.numeroQuestoes,
      difficultyLevel: generatedContent.dificuldade,
      questionModel: generatedContent.tipoQuestoes,
      objectives: generatedContent.objetivos,
      materials: formData.materials,
      instructions: formData.instructions,
      evaluation: formData.evaluation,
      questoes: generatedContent.questoes,
      questions: generatedContent.questoes,
      content: {
        questoes: generatedContent.questoes,
        questions: generatedContent.questoes
      },
      isGeneratedByAI: true
    };

    console.log('✅ [generateListaExercicios] Retornando resultado com', resultado.questoes?.length, 'questões');
    return resultado;
  } catch (error) {
    console.error('❌ [generateListaExercicios] Erro na geração:', error);
    
    const fallbackQuestions = Array.from({ length: parseInt(formData.numberOfQuestions) || 10 }, (_, i) => ({
      id: `questao-${i + 1}`,
      enunciado: `Questão ${i + 1} sobre ${formData.theme || formData.title}: Considerando os conceitos fundamentais estudados, analise e responda a seguinte pergunta. [Erro na geração - clique em "Regenerar" para obter questões personalizadas com conteúdo real]`,
      type: 'multipla-escolha',
      alternativas: [
        `Primeira opção sobre ${formData.theme || 'o tema'} - clique em Regenerar`,
        `Segunda opção relacionada ao conteúdo - regeneração necessária`,
        `Terceira alternativa sobre o assunto - aguardando regeneração`,
        `Quarta opção do exercício - por favor, regenere`
      ],
      respostaCorreta: 0,
      explicacao: 'Este é um conteúdo de fallback. Por favor, clique em "Regenerar" para obter questões com conteúdo educativo real.',
      dificuldade: formData.difficultyLevel?.toLowerCase() || 'medio',
      tema: formData.theme
    }));

    const fallbackContent = {
      titulo: formData.title,
      title: formData.title,
      descricao: formData.description,
      description: formData.description,
      disciplina: formData.subject,
      subject: formData.subject,
      tema: formData.theme,
      theme: formData.theme,
      anoEscolaridade: formData.schoolYear,
      schoolYear: formData.schoolYear,
      numeroQuestoes: parseInt(formData.numberOfQuestions) || 10,
      numberOfQuestions: parseInt(formData.numberOfQuestions) || 10,
      dificuldade: formData.difficultyLevel,
      difficultyLevel: formData.difficultyLevel,
      tipoQuestoes: formData.questionModel,
      questionModel: formData.questionModel,
      objetivos: formData.objectives,
      objectives: formData.objectives,
      materials: formData.materials,
      instructions: formData.instructions,
      evaluation: formData.evaluation,
      questoes: fallbackQuestions,
      questions: fallbackQuestions,
      content: {
        questoes: fallbackQuestions
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };

    // Retornar diretamente (sem wrapper) para consistência
    console.log('⚠️ [generateListaExercicios] Retornando fallback com', fallbackContent.questoes?.length, 'questões');
    return fallbackContent;
  }
}

async function generatePlanoAula(formData: ActivityFormData) {
  console.log('📝 [generatePlanoAula] Iniciando geração com IA via TextVersionGenerator...');
  
  try {
    const { generateTextVersionContent, storeTextVersionContent } = await import('@/features/schoolpower/activities/text-version/TextVersionGenerator');
    
    const extendedData = formData as ActivityFormData & Record<string, unknown>;
    const activityId = (extendedData.id as string) || `plano-aula-${Date.now()}`;
    
    const textVersionInput = {
      activityType: 'plano-aula',
      activityId: activityId,
      context: {
        tema: formData.theme || formData.tema || '',
        theme: formData.theme || formData.tema || '',
        disciplina: formData.subject || formData.disciplina || '',
        subject: formData.subject || formData.disciplina || '',
        serie: formData.schoolYear || formData.anoSerie || '',
        schoolYear: formData.schoolYear || formData.anoSerie || '',
        objetivos: formData.objectives || formData.objetivo || '',
        objectives: formData.objectives || formData.objetivo || '',
        metodologia: formData.tipoAula || formData.difficultyLevel || '',
        duracao: formData.timeLimit || formData.cargaHoraria || '50 minutos',
        materiais: formData.materials || formData.materiaisRecursos || '',
        description: formData.description,
        title: formData.title
      },
      conversationContext: (extendedData.conversationContext as string) || '',
      userObjective: (extendedData.userObjective as string) || formData.objectives || ''
    };
    
    console.log('📝 [generatePlanoAula] Dados preparados para TextVersionGenerator:', textVersionInput);
    
    const generatedResult = await generateTextVersionContent(textVersionInput);
    
    console.log('✅ [generatePlanoAula] Conteúdo gerado pela IA:', {
      success: generatedResult.success,
      sectionsCount: generatedResult.sections?.length || 0,
      textContentLength: generatedResult.textContent?.length || 0
    });
    
    if (generatedResult.success) {
      storeTextVersionContent(activityId, 'plano-aula', generatedResult);
      console.log('💾 [generatePlanoAula] Conteúdo salvo via storeTextVersionContent para:', activityId);
      
      window.dispatchEvent(new CustomEvent('text-version:generated', {
        detail: {
          activityId: activityId,
          activityType: 'plano-aula',
          success: true,
          sectionsCount: generatedResult.sections?.length || 0
        }
      }));
      console.log('📡 [generatePlanoAula] Evento text-version:generated emitido');
      
      const content = {
        title: formData.title || generatedResult.sections?.[0]?.title || 'Plano de Aula',
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
        sections: generatedResult.sections,
        textContent: generatedResult.textContent,
        development: {
          introduction: generatedResult.sections?.find(s => s.title?.includes('Desenvolvimento'))?.content || 'Introdução ao tema',
          activities: generatedResult.sections?.filter(s => s.title?.includes('Atividade') || s.title?.includes('Metodologia'))?.map(s => s.content) || ['Atividade prática'],
          conclusion: generatedResult.sections?.find(s => s.title?.includes('Conclusão') || s.title?.includes('Avaliação'))?.content || 'Conclusão e avaliação'
        },
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false,
        isTextVersion: true
      };
      
      return { success: true, data: content, isTextVersion: true };
    }
    
    throw new Error('TextVersionGenerator retornou success: false');
    
  } catch (error) {
    console.error('❌ [generatePlanoAula] Erro na geração com IA:', error);
    
    const fallbackContent = {
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
        introduction: 'Introdução ao tema (regenere para conteúdo personalizado)',
        activities: ['Atividade prática', 'Discussão em grupo'],
        conclusion: 'Conclusão e avaliação'
      },
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };

    return { success: true, data: fallbackContent };
  }
}

async function generateSequenciaDidatica(formData: ActivityFormData) {
  console.log('📝 [generateSequenciaDidatica] Iniciando geração com IA via TextVersionGenerator...');
  
  try {
    const { generateTextVersionContent, storeTextVersionContent } = await import('@/features/schoolpower/activities/text-version/TextVersionGenerator');
    
    const extendedData = formData as ActivityFormData & Record<string, unknown>;
    const activityId = (extendedData.id as string) || `sequencia-didatica-${Date.now()}`;
    
    const textVersionInput = {
      activityType: 'sequencia-didatica',
      activityId: activityId,
      context: {
        tema: formData.tituloTemaAssunto || formData.theme || '',
        theme: formData.tituloTemaAssunto || formData.theme || '',
        disciplina: formData.disciplina || formData.subject || '',
        subject: formData.disciplina || formData.subject || '',
        serie: formData.anoSerie || formData.schoolYear || '',
        schoolYear: formData.anoSerie || formData.schoolYear || '',
        objetivos: formData.objetivosAprendizagem || formData.objectives || '',
        objectives: formData.objetivosAprendizagem || formData.objectives || '',
        numeroAulas: formData.quantidadeAulas || '4',
        description: formData.description,
        title: formData.title
      },
      conversationContext: (extendedData.conversationContext as string) || '',
      userObjective: (extendedData.userObjective as string) || formData.objetivosAprendizagem || ''
    };
    
    console.log('📝 [generateSequenciaDidatica] Dados preparados para TextVersionGenerator:', textVersionInput);
    
    const generatedResult = await generateTextVersionContent(textVersionInput);
    
    console.log('✅ [generateSequenciaDidatica] Conteúdo gerado pela IA:', {
      success: generatedResult.success,
      sectionsCount: generatedResult.sections?.length || 0,
      textContentLength: generatedResult.textContent?.length || 0
    });
    
    if (generatedResult.success) {
      storeTextVersionContent(activityId, 'sequencia-didatica', generatedResult);
      console.log('💾 [generateSequenciaDidatica] Conteúdo salvo via storeTextVersionContent para:', activityId);
      
      window.dispatchEvent(new CustomEvent('text-version:generated', {
        detail: {
          activityId: activityId,
          activityType: 'sequencia-didatica',
          success: true,
          sectionsCount: generatedResult.sections?.length || 0
        }
      }));
      console.log('📡 [generateSequenciaDidatica] Evento text-version:generated emitido');
      
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
        sections: generatedResult.sections,
        textContent: generatedResult.textContent,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: true,
        isFallback: false,
        isTextVersion: true
      };

      return { success: true, data: content, isTextVersion: true };
    }
    
    throw new Error('TextVersionGenerator retornou success: false');
    
  } catch (error) {
    console.error('❌ [generateSequenciaDidatica] Erro na geração com IA:', error);
    
    const fallbackContent = {
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
        conteudo: `Conteúdo da aula ${i + 1} (regenere para conteúdo personalizado)`,
        metodologia: "Metodologia ativa",
        recursos: "Recursos pedagógicos",
        avaliacao: "Avaliação formativa"
      })),
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true
    };

    return { success: true, data: fallbackContent };
  }
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
  console.log('🎯 [generateQuizInterativo] Iniciando geração com IA real...');

  try {
    const { QuizInterativoGenerator } = await import('@/features/schoolpower/activities/quiz-interativo/QuizInterativoGenerator');
    
    if (!formData.theme || formData.theme.trim() === '') {
      throw new Error('Tema é obrigatório para gerar quiz interativo');
    }

    const numberOfQuestions = parseInt(formData.numberOfQuestions?.toString() || '10');

    const quizData = {
      subject: formData.subject || 'Geral',
      schoolYear: formData.schoolYear || 'Ensino Fundamental',
      theme: formData.theme,
      objectives: formData.objectives || `Testar conhecimentos sobre ${formData.theme}`,
      difficultyLevel: formData.difficultyLevel || 'Médio',
      format: formData.format || formData.questionModel || 'Múltipla Escolha',
      numberOfQuestions: numberOfQuestions.toString(),
      timePerQuestion: formData.timePerQuestion?.toString() || '60',
      instructions: formData.instructions || 'Leia cada questão atentamente e selecione a resposta correta.',
      evaluation: formData.evaluation || 'Pontuação baseada no número de acertos.'
    };

    console.log('🎯 [generateQuizInterativo] Dados preparados para API:', quizData);

    const generator = new QuizInterativoGenerator();
    const result = await generator.generateQuizContent(quizData);

    console.log('✅ [generateQuizInterativo] Conteúdo gerado com sucesso pela IA:', {
      title: result.title,
      questionsCount: result.questions?.length || 0,
      firstQuestion: result.questions?.[0]?.question?.substring(0, 80)
    });

    return { success: true, data: result };

  } catch (error) {
    console.error('❌ [generateQuizInterativo] Erro ao gerar com IA:', error);

    const numberOfQuestions = parseInt(formData.numberOfQuestions?.toString() || '5');
    
    const fallbackContent = {
      title: formData.title || `Quiz Interativo: ${formData.theme || 'Conteúdo'}`,
      description: formData.description || `Quiz sobre ${formData.theme || 'diversos temas'}`,
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
        question: `Questão ${i + 1} sobre ${formData.theme || 'o tema estudado'}`,
        type: 'multipla-escolha' as const,
        options: [
          `A resposta correta para esta questão`,
          `Uma alternativa plausível`,
          `Outra alternativa possível`,
          `Uma distração comum`
        ],
        correctAnswer: `A resposta correta para esta questão`,
        explanation: `Esta é a explicação da questão ${i + 1}. Conteúdo gerado como fallback - a geração com IA falhou.`
      })),
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true,
      fallbackReason: error instanceof Error ? error.message : 'Erro desconhecido'
    };

    return { success: true, data: fallbackContent };
  }
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
      temaRedacao: formData.temaRedacao || formData.theme || formData['Tema da Redação'] || 'Tema da Redação',
      nivelDificuldade: formData.nivelDificuldade || formData.difficultyLevel || formData['Nível de Dificuldade'] || 'Médio',
      objetivo: formData.objetivo || formData.objectives || formData['Objetivos'] || 'Elaborar teses consistentes para redação do ENEM',
      competenciasENEM: formData.competenciasENEM || formData['Competências ENEM'] || 'Competência II e III (compreensão tema e argumentação)',
      contextoAdicional: formData.contextoAdicional || formData.context || formData['Contexto Adicional'] || ''
    };

    console.log('📊 [TeseRedacao] Dados completos enviados ao gerador:', teseData);

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
