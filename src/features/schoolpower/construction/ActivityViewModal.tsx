import React, { useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, BookOpen, ChevronLeft, ChevronRight, FileText, Clock, Star, Users, Calendar, GraduationCap } from "lucide-react";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import PlanoAulaPreview from '@/features/schoolpower/activities/plano-aula/PlanoAulaPreview';
import SequenciaDidaticaPreview from '@/features/schoolpower/activities/sequencia-didatica/SequenciaDidaticaPreview';
import QuizInterativoPreview from '@/features/schoolpower/activities/quiz-interativo/QuizInterativoPreview';
import FlashCardsPreview from '@/features/schoolpower/activities/flash-cards/FlashCardsPreview';

// Helper function to get activity icon (assuming it's defined elsewhere or needs to be added)
// This is a placeholder, replace with actual implementation if needed.
const getActivityIcon = (activityId: string) => {
  // Example: return an icon component based on activityId
  return ({ className }: { className: string }) => (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c0-1.707.833-3.123 2.12-4.119C15.387 2.507 17.017 2 19 2s3.613.507 4.88-1.881C24.833 1.707 24 3.123 24 5v10a2 2 0 01-2 2H2a2 2 0 01-2-2V5c0-1.877.847-3.293 2.12-4.119C4.167 0.507 5.993 0 8 0s3.833.507 5.12 1.881C14.833 1.707 14 3.123 14 5v10z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v16M8 20h8" />
    </svg>
  );
};


interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isInQuestionView, setIsInQuestionView] = useState<boolean>(false);
  const isLightMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;

  // Estados para conteúdo específico - ESTÁVEIS
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [flashCardsContent, setFlashCardsContent] = useState<any>(null);
  const [generalContent, setGeneralContent] = useState<any>(null);

  // Memoizar o tipo de atividade para evitar recálculos
  const activityType = useMemo(() => {
    return activity?.originalData?.type || activity?.categoryId || activity?.type || 'lista-exercicios';
  }, [activity?.originalData?.type, activity?.categoryId, activity?.type]);

  // Função para carregar dados do Plano de Aula - MEMOIZADA
  const loadPlanoAulaData = useCallback((activityId: string) => {
    console.log('🔍 ActivityViewModal: Carregando dados específicos do Plano de Aula para:', activityId);

    const cacheKeys = [
      `constructed_plano-aula_${activityId}`,
      `schoolpower_plano-aula_content`,
      `activity_${activityId}`,
      `activity_fields_${activityId}`
    ];

    for (const key of cacheKeys) {
      const data = localStorage.getItem(key);
      if (data) {
        try {
          const parsedData = JSON.parse(data);
          console.log(`✅ Dados encontrados em ${key}:`, parsedData);
          return parsedData;
        } catch (error) {
          console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
        }
      }
    }

    console.log('⚠️ Nenhum dado específico encontrado para plano-aula');
    return null;
  }, []);

  // Carregar conteúdo construído quando o modal abrir - OTIMIZADO
  React.useEffect(() => {
    if (!activity || !isOpen) {
      // Reset states when modal closes
      setQuizInterativoContent(null);
      setFlashCardsContent(null);
      setGeneralContent(null);
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);
      return;
    }

    console.log(`🔍 Verificando conteúdo construído para atividade: ${activity.id} (${activityType})`);

    // Carregar conteúdo baseado no tipo de atividade
    let contentLoaded = false;

    // Quiz Interativo
    if (activityType === 'quiz-interativo') {
      const quizSavedContent = localStorage.getItem(`constructed_quiz-interativo_${activity.id}`);
      console.log(`🎯 Quiz Interativo: Verificando conteúdo para ${activity.id}. Existe?`, !!quizSavedContent);

      if (quizSavedContent) {
        try {
          const parsedContent = JSON.parse(quizSavedContent);
          const contentData = parsedContent.data || parsedContent;

          if (contentData && contentData.questions && Array.isArray(contentData.questions) && contentData.questions.length > 0) {
            const validQuestions = contentData.questions.filter(q =>
              q && (q.question || q.text) && (q.options || q.type === 'verdadeiro-falso') && q.correctAnswer
            );

            if (validQuestions.length > 0) {
              contentData.questions = validQuestions;
              console.log(`✅ Quiz Interativo carregado com ${validQuestions.length} questões válidas`);
              setQuizInterativoContent(contentData);
              contentLoaded = true;
            }
          }
        } catch (error) {
          console.error('❌ Erro ao processar conteúdo do Quiz Interativo:', error);
        }
      }
    }
    // Flash Cards
    else if (activityType === 'flash-cards') {
      const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
      console.log(`🃏 Flash Cards: Verificando conteúdo para ${activity.id}. Existe?`, !!flashCardsSavedContent);

      if (flashCardsSavedContent) {
        try {
          const parsedContent = JSON.parse(flashCardsSavedContent);
          const contentData = parsedContent.data || parsedContent;

          console.log('🃏 Flash Cards - Conteúdo parseado:', contentData);

          const hasValidCards = contentData &&
                               contentData.cards &&
                               Array.isArray(contentData.cards) &&
                               contentData.cards.length > 0 &&
                               contentData.cards.every(card =>
                                 card && card.front && card.back
                               );

          if (hasValidCards) {
            console.log(`✅ Flash Cards carregado com ${contentData.cards.length} cards válidos`);
            setFlashCardsContent(contentData);
            contentLoaded = true;
          } else {
            console.warn('⚠️ Conteúdo de Flash Cards sem cards válidos');
          }
        } catch (error) {
          console.error('❌ Erro ao processar conteúdo de Flash Cards:', error);
        }
      }

      // Se não há conteúdo construído, criar fallback usando customFields
      if (!contentLoaded && activity.customFields) {
        const customFields = activity.customFields;
        const topicos = customFields['Tópicos'] || customFields['Tópicos Principais'] || '';
        const theme = customFields['Tema'] || customFields['Tema dos Flash Cards'] || activity.title || 'Flash Cards';
        const subject = customFields['Disciplina'] || 'Geral';
        const numberOfCards = parseInt(customFields['Número de Flash Cards'] || '10');

        if (topicos && topicos.trim()) {
          const topicosList = topicos.split('\n').filter(t => t.trim());
          const fallbackCards = [];

          const cardsToGenerate = Math.min(numberOfCards, Math.max(topicosList.length * 2, 5));

          for (let i = 0; i < cardsToGenerate; i++) {
            const topicoIndex = i % topicosList.length;
            const topic = topicosList[topicoIndex].trim();
            const cardType = i % 3;

            let front: string;
            let back: string;

            switch (cardType) {
              case 0:
                front = `O que é ${topic}?`;
                back = `${topic} é um conceito importante sobre ${theme} em ${subject}.`;
                break;
              case 1:
                front = `Qual a importância de ${topic}?`;
                back = `${topic} é importante porque estabelece bases conceituais para ${theme}.`;
                break;
              default:
                front = `Como aplicar ${topic}?`;
                back = `${topic} pode ser aplicado através de exercícios práticos relacionados ao ${theme}.`;
            }

            fallbackCards.push({
              id: i + 1,
              front,
              back,
              category: subject,
              difficulty: customFields['Nível de Dificuldade'] || 'Médio'
            });
          }

          if (fallbackCards.length > 0) {
            const fallbackContent = {
              title: customFields['Título'] || activity.title || `Flash Cards: ${theme}`,
              description: customFields['Descrição'] || activity.description || `Flash cards sobre ${theme}`,
              cards: fallbackCards,
              totalCards: fallbackCards.length,
              theme,
              subject,
              topicos,
              numberOfFlashcards: fallbackCards.length,
              context: customFields['Contexto'] || customFields['Contexto de Uso'] || 'Revisão e fixação',
              difficultyLevel: customFields['Nível de Dificuldade'] || 'Médio',
              generatedAt: new Date().toISOString(),
              isGeneratedByAI: false,
              isFallback: true,
              type: 'flash-cards',
              activityType: 'flash-cards'
            };

            console.log('🃏 Flash Cards fallback criado:', fallbackContent);
            setFlashCardsContent(fallbackContent);
            contentLoaded = true;
          }
        }
      }
    }
    // Outros tipos de atividade
    else {
      const constructedActivities = JSON.parse(localStorage.getItem('constructedActivities') || '{}');
      const savedContent = localStorage.getItem(`activity_${activity.id}`);

      let content = null;
      if (constructedActivities[activity.id]?.generatedContent) {
        content = constructedActivities[activity.id].generatedContent;
        console.log(`✅ Conteúdo construído encontrado no cache para: ${activity.id}`);
      } else if (savedContent) {
        try {
          content = JSON.parse(savedContent);
          console.log(`✅ Conteúdo salvo encontrado para: ${activity.id}`);
        } catch (error) {
          console.error('❌ Erro ao parsear conteúdo salvo:', error);
        }
      }

      if (content) {
        setGeneralContent(content);
        contentLoaded = true;
      }
    }

    // Se for plano-aula, tentar carregar dados específicos
    if (activityType === 'plano-aula') {
      const planoData = loadPlanoAulaData(activity.id);
      if (planoData) {
        console.log('📚 Dados do plano-aula carregados com sucesso:', planoData);
        setGeneralContent(planoData);
        contentLoaded = true;
      }
    }

    console.log(`📊 Resultado do carregamento para ${activity.id}: ${contentLoaded ? 'Sucesso' : 'Nenhum conteúdo'}`);

  }, [activity?.id, isOpen, activityType, loadPlanoAulaData, activity?.originalData, activity?.customFields, activity.title, activity.personalizedTitle, activity.description, activity.personalizedDescription]); // Dependências específicas e estáveis

  // Resetar estado do sidebar quando o modal abre - SIMPLIFICADO
  React.useEffect(() => {
    if (isOpen) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);
    }
  }, [isOpen]);

  if (!isOpen || !activity) return null;

  // Função para lidar com seleção de questão - MEMOIZADA
  const handleQuestionSelect = useCallback((questionIndex: number, questionId: string) => {
    setSelectedQuestionIndex(questionIndex);
    setSelectedQuestionId(questionId);
    setIsInQuestionView(true);
  }, []);

  // Função para rolar para uma questão específica - MEMOIZADA
  const scrollToQuestion = useCallback((questionId: string, questionIndex?: number) => {
    setSelectedQuestionId(questionId);
    if (questionIndex !== undefined) {
      setSelectedQuestionIndex(questionIndex);
      setIsInQuestionView(true);
    }
    const questionElement = document.getElementById(`question-${questionId}`);
    if (questionElement && contentRef.current) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'nearest'
      });
    }
  }, []);

  // Obter questões para o sidebar - MEMOIZADA
  const getQuestionsForSidebar = useCallback(() => {
    if (activityType !== 'lista-exercicios') return [];

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const previewData = {
      ...activity.originalData,
      ...storedData,
      customFields: {
        ...activity.customFields,
        ...JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}')
      }
    };

    let questoes = [];
    if (previewData.questoes && Array.isArray(previewData.questoes)) {
      questoes = previewData.questoes;
    } else if (previewData.questions && Array.isArray(previewData.questions)) {
      questoes = previewData.questions;
    } else if (previewData.content && previewData.content.questoes) {
      questoes = previewData.content.questoes;
    } else if (previewData.content && previewData.content.questions) {
      questoes = previewData.content.questions;
    }

    try {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        questoes = questoes.filter(questao => !deletedQuestionIds.includes(questao.id || `questao-${questoes.indexOf(questao) + 1}`));
      }
    } catch (error) {
      console.warn('⚠️ Erro ao aplicar filtro de exclusões no sidebar:', error);
    }

    return questoes.map((questao, index) => ({
      id: questao.id || `questao-${index + 1}`,
      numero: index + 1,
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tipo: questao.type || questao.tipo || 'multipla-escolha',
      completed: false,
      enunciado: questao.enunciado || questao.statement || 'Sem enunciado'
    }));
  }, [activityType, activity.id, activity.originalData, activity.customFields]);

  const questionsForSidebar = useMemo(() => getQuestionsForSidebar(), [getQuestionsForSidebar]);
  const isExerciseList = activityType === 'lista-exercicios';

  // Função para obter o título da atividade - MEMOIZADA
  const getActivityTitle = useCallback(() => {
    if (activityType === 'plano-aula') {
      const storedData = localStorage.getItem(`activity_${activity.id}`);
      let planoTitle = activity.title || activity.personalizedTitle || 'Plano de Aula';
      let tema = '';

      if (storedData) {
        try {
          const parsed = JSON.parse(storedData);
          planoTitle = parsed.titulo || parsed.title || planoTitle;
          tema = parsed.tema || parsed['Tema ou Tópico Central'] || '';
        } catch (error) {
          console.warn('Erro ao parsear dados do plano:', error);
        }
      }

      return tema ? `${planoTitle}: ${tema}` : planoTitle;
    }
    return activity.title || activity.personalizedTitle || 'Atividade';
  }, [activityType, activity.id, activity.title, activity.personalizedTitle]);

  // Função para obter informações adicionais do Plano de Aula - MEMOIZADA
  const getPlanoAulaHeaderInfo = useCallback(() => {
    if (activityType !== 'plano-aula') return null;

    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');

    const disciplina = storedData?.disciplina || storedData?.['Componente Curricular'] || 'Matemática';
    const anoEscolar = storedData?.ano_escolar || storedData?.['Ano Escolar'] || '6° ano';
    const duracao = storedData?.duracao || storedData?.['Duração da Aula'] || '2 aulas de 50 minutos';

    return {
      disciplina,
      anoEscolar,
      duracao
    };
  }, [activityType, activity.id]);

  const getDifficultyColor = useCallback((dificuldade: string) => {
    switch (dificuldade.toLowerCase()) {
      case 'facil':
      case 'fácil':
      case 'básico':
      case 'basico':
        return 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 border-green-200 dark:border-green-700';
      case 'medio':
      case 'médio':
      case 'intermediário':
      case 'intermediario':
        return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-700';
      case 'dificil':
      case 'difícil':
      case 'avançado':
      case 'avancado':
        return 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 border-red-200 dark:border-red-700';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 border-gray-200 dark:border-gray-700';
    }
  }, []);

  const renderActivityPreview = useCallback(() => {
    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    console.log('💾 ActivityViewModal: Renderizando preview para tipo:', activityType);

    // Preparar dados para o preview
    let previewData = {
      ...activity.originalData,
      ...storedData,
      title: activity.personalizedTitle || activity.title || storedData.title,
      description: activity.personalizedDescription || activity.description || storedData.description,
      customFields: {
        ...activity.customFields,
        ...storedFields
      },
      type: activityType,
      exercicios: activity.originalData?.exercicios || storedData.exercicios,
      questions: activity.originalData?.questions || storedData.questions,
      content: activity.originalData?.content || storedData.content
    };

    // Aplicar filtro de exclusão para lista de exercícios
    if (activityType === 'lista-exercicios') {
      try {
        const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
        if (deletedQuestionsJson) {
          const deletedQuestionIds = JSON.parse(deletedQuestionsJson);

          if (previewData.questoes && Array.isArray(previewData.questoes)) {
            previewData.questoes = previewData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
          }
          if (previewData.content?.questoes && Array.isArray(previewData.content.questoes)) {
            previewData.content.questoes = previewData.content.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
          }
          if (previewData.questions && Array.isArray(previewData.questions)) {
            previewData.questions = previewData.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
          }
          if (previewData.content?.questions && Array.isArray(previewData.content.questions)) {
            previewData.content.questions = previewData.content.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
          }

          previewData.deletedQuestionIds = deletedQuestionIds;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao aplicar filtro de exclusões:', error);
      }
    }

    console.log('📊 ActivityViewModal: Dados finais para preview:', previewData);

    switch (activityType) {
      case 'lista-exercicios':
        return (
          <ExerciseListPreview
            data={previewData}
            customFields={previewData.customFields}
            onQuestionSelect={handleQuestionSelect}
          />
        );

      case 'plano-aula':
        return (
          <PlanoAulaPreview
            data={generalContent || previewData}
            activityData={activity}
          />
        );

      case 'sequencia-didatica':
        return (
          <SequenciaDidaticaPreview
            data={generalContent || previewData}
            activityData={activity}
          />
        );

      case 'quiz-interativo':
        return (
          <QuizInterativoPreview
            content={quizInterativoContent || previewData}
            isLoading={false}
          />
        );

      case 'flash-cards':
        return (
          <FlashCardsPreview
            content={flashCardsContent || previewData}
            isLoading={false}
          />
        );

      default:
        return (
          <ActivityPreview
            data={generalContent || previewData}
            activityType={activityType}
            customFields={previewData.customFields}
          />
        );
    }
  }, [
    activity.id,
    activity.originalData,
    activity.personalizedTitle,
    activity.title,
    activity.personalizedDescription,
    activity.description,
    activity.customFields,
    activityType,
    quizInterativoContent,
    flashCardsContent,
    generalContent,
    handleQuestionSelect
  ]);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          className={`${activityType === 'plano-aula' ? 'max-w-7xl' : 'max-w-6xl'} w-full max-h-[90vh] ${isLightMode ? 'bg-white' : 'bg-gray-800'} rounded-lg shadow-xl overflow-hidden flex flex-col`}
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header aplicado condicionalmente */}
          <div className={`${activityType === 'plano-aula' ? 'modal-header bg-gradient-to-r from-orange-500 to-orange-600' : ''} flex items-center justify-between p-6 border-b`}>
            <div className="flex items-center gap-3 flex-1">
              <div className={`p-2 rounded-lg ${
                activityType === 'plano-aula'
                  ? 'bg-orange-100'
                  : isLightMode ? 'bg-blue-100' : 'bg-blue-900/30'
              }`}>
                <BookOpen className={`h-6 w-6 ${
                  activityType === 'plano-aula'
                    ? 'text-orange-600'
                    : isLightMode ? 'text-blue-600' : 'text-blue-400'
                }`} />
              </div>
              <div className="flex-1">
                <h2 className={`text-xl font-semibold ${
                  activityType === 'plano-aula' ? 'text-white' : ''
                }`}>
                  {getActivityTitle()}
                </h2>
                {activityType === 'plano-aula' ? (
                  <div className="flex items-center gap-4 mt-1">
                    {(() => {
                      const headerInfo = getPlanoAulaHeaderInfo();
                      return headerInfo ? (
                        <>
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <BookOpen className="h-4 w-4" />
                            <span>{headerInfo.disciplina}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <GraduationCap className="h-4 w-4" />
                            <span>{headerInfo.anoEscolar}</span>
                          </div>
                          <div className="flex items-center gap-1 text-white/90 text-sm">
                            <Clock className="h-4 w-4" />
                            <span>{headerInfo.duracao}</span>
                          </div>
                        </>
                      ) : null;
                    })()}
                  </div>
                ) : (
                  <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-400'}`}>
                    {activity.description || activity.personalizedDescription || 'Visualizar atividade'}
                  </p>
                )}
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onClose}
              className={`${
                activityType === 'plano-aula'
                  ? 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                  : isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-700'
              }`}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Content Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Question Navigation Sidebar - Only for Exercise Lists and when showSidebar is true */}
            {isExerciseList && questionsForSidebar.length > 0 && showSidebar && (
              <div className="w-64 border-r border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 overflow-y-auto flex-shrink-0">
                <div className="p-4 space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-white dark:bg-gray-700 shadow-sm">
                    <CardContent className="p-3">
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600 dark:text-gray-300">Questões:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600 dark:text-gray-300">Total de pontos:</span>
                          <span className="font-semibold dark:text-white">{questionsForSidebar.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">Navegação</h4>
                    {questionsForSidebar.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => scrollToQuestion(question.id, index)}
                        className={`w-full text-left p-2 text-xs rounded transition-colors ${
                          selectedQuestionId === question.id
                            ? 'bg-orange-50 dark:bg-orange-900 border border-orange-200 dark:border-orange-700 font-medium text-orange-800 dark:text-orange-200'
                            : 'bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600'
                        }`}
                      >
                        <div className="font-medium dark:text-white">Questão {index + 1}</div>
                        <div className="text-gray-500 dark:text-gray-400 truncate mt-1">
                          {question.enunciado?.substring(0, 40)}...
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div className="flex-1 overflow-hidden">
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] bg-white dark:bg-gray-900" ref={contentRef}>
                {renderActivityPreview()}
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default ActivityViewModal;