
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

export default generateActivityContent;
