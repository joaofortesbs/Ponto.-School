import { ActivityFormData } from './types/ActivityTypes';

// Função principal para gerar conteúdo de atividades
export async function generateActivityContent(activityType: string, formData: ActivityFormData): Promise<any> {
  console.log(`🚀 Gerando conteúdo para tipo: ${activityType}`, formData);

  try {
    if (activityType === 'flash-cards') {
      // Importar e usar o gerador específico de Flash Cards
      const { FlashCardsGenerator } = await import('../activities/flash-cards/FlashCardsGenerator');

      const flashCardsData = {
        title: formData.title?.trim() || 'Flash Cards',
        description: formData.description?.trim() || `Flash Cards sobre ${formData.theme}`,
        theme: formData.theme?.trim() || 'Tema Geral',
        topicos: formData.topicos?.trim() || 'Tópicos gerais',
        numberOfFlashcards: formData.numberOfFlashcards?.trim() || '10',
        context: formData.context?.trim() || 'Contexto educacional geral'
      };

      console.log('🃏 Dados estruturados para geração:', flashCardsData);

      const generator = new FlashCardsGenerator();
      const generatedContent = await generator.generateFlashCardsContent(flashCardsData);

      console.log('✅ Conteúdo gerado:', generatedContent);

      // Retornar no formato esperado pelo sistema
      return {
        success: true,
        data: {
          title: formData.title,
          description: formData.description || generatedContent.description,
          theme: formData.theme,
          topicos: formData.topicos,
          numberOfFlashcards: generatedContent.cards.length,
          context: formData.context,
          cards: generatedContent.cards,
          totalCards: generatedContent.cards.length,
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
          isFallback: false
        }
      };

    } else if (activityType === 'quiz-interativo') {
      // Importar e usar o gerador específico de Quiz Interativo
      const { QuizInterativoGenerator } = await import('../activities/quiz-interativo/QuizInterativoGenerator');

      const quizData = {
        subject: formData.subject?.trim() || 'Matemática',
        schoolYear: formData.schoolYear?.trim() || '6º Ano - Ensino Fundamental',
        theme: formData.theme?.trim() || formData.title?.trim() || 'Tema Geral',
        objectives: formData.objectives?.trim() || formData.description?.trim() || `Avaliar o conhecimento sobre ${formData.theme}`,
        difficultyLevel: formData.difficultyLevel?.trim() || 'Médio',
        format: formData.questionModel?.trim() || 'Múltipla Escolha',
        numberOfQuestions: formData.numberOfQuestions?.trim() || '10',
        timePerQuestion: formData.timePerQuestion?.trim() || '60',
        instructions: formData.instructions?.trim() || 'Leia cada questão com atenção e selecione a resposta correta.',
        evaluation: formData.evaluation?.trim() || 'Avaliação baseada no número de respostas corretas.'
      };

      const generator = new QuizInterativoGenerator();
      const generatedContent = await generator.generateQuizContent(quizData);

      return {
        success: true,
        data: {
          title: formData.title || generatedContent.title,
          description: formData.description || generatedContent.description,
          questions: generatedContent.questions,
          timePerQuestion: generatedContent.timePerQuestion || parseInt(quizData.timePerQuestion) || 60,
          totalQuestions: generatedContent.questions.length,
          subject: quizData.subject,
          schoolYear: quizData.schoolYear,
          theme: quizData.theme,
          format: quizData.format,
          difficultyLevel: quizData.difficultyLevel,
          objectives: quizData.objectives,
          instructions: quizData.instructions,
          evaluation: quizData.evaluation,
          generatedByAI: true,
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
          isFallback: false
        }
      };

    } else {
      // Para outros tipos de atividade, retornar estrutura genérica
      return {
        success: true,
        data: {
          title: formData.title,
          description: formData.description,
          content: 'Conteúdo gerado automaticamente',
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: true,
          formData: formData
        }
      };
    }

  } catch (error) {
    console.error(`❌ Erro ao gerar conteúdo para ${activityType}:`, error);

    // Retornar fallback específico para cada tipo
    if (activityType === 'flash-cards') {
      const numberOfCards = parseInt(formData.numberOfFlashcards) || 5;
      const topicsList = formData.topicos ? formData.topicos.split(',').map(t => t.trim()) : ['Conceitos básicos'];

      return {
        success: false,
        data: {
          title: formData.title || `Flash Cards: ${formData.theme}`,
          description: formData.description || `Flash Cards sobre ${formData.theme} (Modo Demonstração)`,
          theme: formData.theme || 'Tema Geral',
          topicos: formData.topicos || 'Tópicos gerais',
          numberOfFlashcards: numberOfCards,
          context: formData.context || 'Contexto educacional',
          cards: Array.from({ length: numberOfCards }, (_, index) => {
            const topic = topicsList[index % topicsList.length];
            return {
              id: index + 1,
              question: `O que você sabe sobre ${topic} em ${formData.theme}?`,
              answer: `${topic} é um conceito importante em ${formData.theme}. ${formData.context ? `No contexto: ${formData.context}` : 'É fundamental para o entendimento do tema.'}`,
              category: formData.theme || 'Geral'
            };
          }),
          totalCards: numberOfCards,
          generatedAt: new Date().toISOString(),
          isGeneratedByAI: false,
          isFallback: true
        }
      };
    }

    // Fallback genérico para outros tipos
    return {
      success: false,
      data: {
        title: formData.title || 'Atividade',
        description: formData.description || 'Descrição da atividade',
        content: `Conteúdo de exemplo para ${activityType}`,
        error: error.message,
        generatedAt: new Date().toISOString(),
        isGeneratedByAI: false,
        isFallback: true
      }
    };
  }
}

// Handlers específicos para cada tipo de atividade
const handleListaExercicios = async (formData: ActivityFormData) => {
  console.log('📝 Gerando Lista de Exercícios:', formData);
  // Implementação fictícia para lista de exercícios
  return { success: true, data: { content: 'Lista de Exercícios Gerada' }, activityType: 'lista-exercicios' };
};

const handlePlanoAula = async (formData: ActivityFormData) => {
  console.log('🗓️ Gerando Plano de Aula:', formData);
  // Implementação fictícia para plano de aula
  return { success: true, data: { content: 'Plano de Aula Gerado' }, activityType: 'plano-aula' };
};

const handleSequenciaDidatica = async (formData: ActivityFormData) => {
  console.log('📚 Gerando Sequência Didática:', formData);
  // Implementação fictícia para sequência didática
  return { success: true, data: { content: 'Sequência Didática Gerada' }, activityType: 'sequencia-didatica' };
};

const handleQuadroInterativo = async (formData: ActivityFormData) => {
  console.log('🖼️ Gerando Quadro Interativo:', formData);
  // Implementação fictícia para quadro interativo
  return { success: true, data: { content: 'Quadro Interativo Gerado' }, activityType: 'quadro-interativo' };
};

// Handler para Quiz Interativo
const handleQuizInterativo = async (formData: ActivityFormData) => {
  console.log('🎯 Gerando Quiz Interativo:', formData);

  try {
    // Importar o gerador específico
    const { QuizInterativoGenerator } = await import('../activities/quiz-interativo/QuizInterativoGenerator');

    const generator = new QuizInterativoGenerator();
    const result = await generator.generateQuizContent({
      subject: formData.subject || 'Matemática',
      schoolYear: formData.schoolYear || '6º Ano',
      theme: formData.theme || 'Matemática Básica',
      objectives: formData.objectives || 'Avaliar conhecimentos básicos',
      difficultyLevel: formData.difficultyLevel || 'Médio',
      format: formData.questionModel || 'Múltipla Escolha',
      numberOfQuestions: formData.numberOfQuestions || '10',
      timePerQuestion: formData.timePerQuestion || '60',
      instructions: formData.instructions || 'Leia cada questão com atenção',
      evaluation: formData.evaluation || 'Baseado em respostas corretas'
    });

    console.log('✅ Quiz Interativo gerado:', result);
    return {
      success: true,
      data: result,
      activityType: 'quiz-interativo'
    };
  } catch (error) {
    console.error('❌ Erro ao gerar Quiz Interativo:', error);
    throw error;
  }
};

// Handler para Flash Cards
const handleFlashCards = async (formData: ActivityFormData) => {
  console.log('🃏 Gerando Flash Cards via generateActivityContent:', formData);

  try {
    // Importar o gerador específico
    const { FlashCardsGenerator } = await import('../activities/flash-cards/FlashCardsGenerator');

    const generator = new FlashCardsGenerator();
    const result = await generator.generateFlashCardsContent({
      title: formData.title || 'Flash Cards',
      description: formData.description || `Flash Cards sobre ${formData.theme}`,
      theme: formData.theme || 'Tema Geral',
      topicos: formData.topicos || 'Conceitos básicos',
      numberOfFlashcards: formData.numberOfFlashcards || '10',
      context: formData.context || 'Contexto educacional'
    });

    // Estruturar resultado no formato esperado
    const finalContent = {
      title: formData.title,
      description: formData.description || result.description,
      theme: formData.theme,
      topicos: formData.topicos,
      numberOfFlashcards: result.totalCards,
      context: formData.context,
      cards: result.cards.map((card, index) => ({
        id: card.id || index + 1,
        question: card.question,
        answer: card.answer,
        category: card.category || formData.theme || 'Geral'
      })),
      totalCards: result.totalCards,
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: result.isGeneratedByAI,
      isFallback: !result.isGeneratedByAI
    };

    console.log('✅ Flash Cards gerado via generateActivityContent:', finalContent);

    // Salvar também na chave específica do flash-cards
    const storageKey = `constructed_flash-cards_${Date.now()}`;
    localStorage.setItem(storageKey, JSON.stringify({
      success: true,
      data: finalContent
    }));

    // Disparar evento para notificar o Preview
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('flash-cards-auto-build', {
        detail: { data: finalContent, source: 'generateActivityContent' }
      }));
    }, 100);

    return {
      success: true,
      data: finalContent,
      activityType: 'flash-cards'
    };
  } catch (error) {
    console.error('❌ Erro ao gerar Flash Cards via generateActivityContent:', error);

    // Fallback mais robusto
    const fallbackContent = {
      title: formData.title || 'Flash Cards',
      description: formData.description || `Flash Cards sobre ${formData.theme}`,
      theme: formData.theme || 'Tema Geral',
      topicos: formData.topicos || 'Conceitos básicos',
      numberOfFlashcards: parseInt(formData.numberOfFlashcards || '5'),
      context: formData.context || 'Contexto educacional',
      cards: Array.from({ length: parseInt(formData.numberOfFlashcards || '5') }, (_, index) => ({
        id: index + 1,
        question: `Pergunta ${index + 1} sobre ${formData.theme || 'o tema'}`,
        answer: `Resposta ${index + 1} explicando conceitos importantes sobre ${formData.theme || 'o tema'}.`,
        category: formData.theme || 'Geral'
      })),
      totalCards: parseInt(formData.numberOfFlashcards || '5'),
      generatedAt: new Date().toISOString(),
      isGeneratedByAI: false,
      isFallback: true,
      error: error.message
    };

    // Disparar evento mesmo para fallback
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('flash-cards-auto-build', {
        detail: { data: fallbackContent, source: 'generateActivityContent-fallback' }
      }));
    }, 100);

    return {
      success: true,
      data: fallbackContent,
      activityType: 'flash-cards'
    };
  }
};

const handleDefaultActivity = async (activityType: string, formData: ActivityFormData) => {
  console.log(`❓ Gerando atividade padrão para ${activityType}:`, formData);
  // Implementação fictícia para atividades não reconhecidas
  return { success: true, data: { content: `Atividade padrão gerada para ${activityType}` }, activityType: 'default' };
};

export default generateActivityContent;