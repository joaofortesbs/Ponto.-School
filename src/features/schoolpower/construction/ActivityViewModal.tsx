import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, BookOpen, ChevronLeft, ChevronRight, FileText, Clock, Star, Users, Calendar, GraduationCap, Calculator, Beaker, PenTool, GamepadIcon } from "lucide-react"; // Import Eye component
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
import { UniversalActivityHeader } from './components/UniversalActivityHeader';
import { useUserInfo } from './hooks/useUserInfo';

// Helper function to get activity icon based on activity type
const getActivityIcon = (activityId: string) => {
  const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    'lista-exercicios': BookOpen,
    'plano-aula': FileText,
    'sequencia-didatica': Calendar,
    'quiz-interativo': GamepadIcon,
    'flash-cards': Star,
    'quadro-interativo': Eye,
    'mapa-mental': Users,
    'prova': BookOpen,
    'jogo': GamepadIcon,
    'apresentacao': Eye,
    'redacao': PenTool,
    'matematica': Calculator,
    'ciencias': Beaker,
    'default': GraduationCap
  };

  return iconMap[activityId] || iconMap['default'];
};


interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const [selectedQuestionIndex, setSelectedQuestionIndex] = useState<number | null>(null);
  const userInfo = useUserInfo();
  const contentRef = useRef<HTMLDivElement>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const [isInQuestionView, setIsInQuestionView] = useState<boolean>(false);
  const isLightMode = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
  const [quizInterativoContent, setQuizInterativoContent] = useState<any>(null);
  const [flashCardsContent, setFlashCardsContent] = useState<any>(null);


  // Função específica para carregar dados do Plano de Aula
  const loadPlanoAulaData = (activityId: string) => {
    console.log('🔍 ActivityViewModal: Carregando dados específicos do Plano de Aula para:', activityId);

    const cacheKeys = [
      `constructed_plano-aula_${activity.id}`, // Use activity.id for specificity
      `schoolpower_plano-aula_content`,
      `activity_${activity.id}`,
      `activity_fields_${activity.id}`
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
  };

  // Resetar estado do sidebar quando o modal abre - com dependência estável
  React.useEffect(() => {
    if (isOpen && activity) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);
      setQuizInterativoContent(null);
      setFlashCardsContent(null);

      // Se for plano-aula, tentar carregar dados específicos
      if (activity?.type === 'plano-aula' || activity?.id === 'plano-aula') {
        const planoData = loadPlanoAulaData(activity.id);
        if (planoData) {
          console.log('📚 Dados do plano-aula carregados com sucesso:', planoData);
        }
      }
    }
  }, [isOpen, activity?.id]); // Usar apenas activity.id para evitar loops

  if (!isOpen || !activity) return null;

  // Função para lidar com seleção de questão
  const handleQuestionSelect = (questionIndex: number, questionId: string) => {
    setSelectedQuestionIndex(questionIndex);
    setSelectedQuestionId(questionId);
    setIsInQuestionView(true);
  };

  // Função para rolar para uma questão específica
  const scrollToQuestion = (questionId: string, questionIndex?: number) => {
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
  };

  // Obter questões para o sidebar
  const getQuestionsForSidebar = () => {
    const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

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

    // Buscar questões em diferentes possíveis localizações
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

    // Aplicar filtro de exclusões
    try {
      const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
      if (deletedQuestionsJson) {
        const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
        questoes = questoes.filter(questao => !deletedQuestionIds.includes(questao.id || `questao-${questoes.indexOf(questao) + 1}`));
        console.log(`🔍 Sidebar: Questões filtradas para navegação. ${questoes.length} questões restantes após exclusões`);
      }
    } catch (error) {
      console.warn('⚠️ Erro ao aplicar filtro de exclusões no sidebar:', error);
    }

    return questoes.map((questao, index) => ({
      id: questao.id || `questao-${index + 1}`,
      numero: index + 1,
      dificuldade: (questao.dificuldade || questao.difficulty || 'medio').toLowerCase(),
      tipo: questao.type || questao.tipo || 'multipla-escolha',
      completed: false, // Pode ser expandido para rastrear progresso
      enunciado: questao.enunciado || questao.statement || 'Sem enunciado' // Adicionado para exibição no sidebar
    }));
  };

  const questionsForSidebar = getQuestionsForSidebar();
  const isExerciseList = (activity.originalData?.type || activity.categoryId || activity.type) === 'lista-exercicios';
  const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

  // Função para obter o título da atividade
  const getActivityTitle = () => {
    if (activityType === 'plano-aula') {
      const planoTitle = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.titulo || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.title || activity.title || activity.personalizedTitle || 'Plano de Aula' : activity.title || activity.personalizedTitle || 'Plano de Aula';
      const tema = localStorage.getItem(`activity_${activity.id}`) ? JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.tema || JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}')?.['Tema ou Tópico Central'] || '' : '';
      return tema ? `${planoTitle}: ${tema}` : planoTitle;
    }
    return activity.title || activity.personalizedTitle || 'Atividade';
  };

  // Função para obter informações adicionais do Plano de Aula para o cabeçalho
  const getPlanoAulaHeaderInfo = () => {
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
  };

  const getDifficultyColor = (dificuldade: string) => {
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
  };

  const renderActivityPreview = () => {
    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_${activity.id}_fields`) || '{}');

    console.log('💾 ActivityViewModal: Dados armazenados:', storedData);
    console.log('🗂️ ActivityViewModal: Campos armazenados:', storedFields);

    // Preparar dados para o preview EXATAMENTE como no modal de edição
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
      // Incluir todos os campos que podem estar no originalData
      exercicios: activity.originalData?.exercicios || storedData.exercicios,
      questions: activity.originalData?.questions || storedData.questions,
      content: activity.originalData?.content || storedData.content
    };

    let contentToLoad = null;

    // --- Carregamento de Conteúdo Específico por Tipo de Atividade ---

    // 1. Quiz Interativo
    if (activityType === 'quiz-interativo') {
      const quizInterativoSavedContent = localStorage.getItem(`constructed_quiz-interativo_${activity.id}`);
      console.log(`🔍 Quiz Interativo: Verificando conteúdo salvo para ${activity.id}. Existe?`, !!quizInterativoSavedContent);

      if (quizInterativoSavedContent) {
        try {
          const parsedContent = JSON.parse(quizInterativoSavedContent);
          contentToLoad = parsedContent.data || parsedContent;

          // Validar estrutura das questões
          if (contentToLoad && contentToLoad.questions && Array.isArray(contentToLoad.questions) && contentToLoad.questions.length > 0) {
            // Validar cada questão individualmente
            const validQuestions = contentToLoad.questions.filter(q =>
              q && (q.question || q.text) && (q.options || q.type === 'verdadeiro-falso') && q.correctAnswer
            );

            if (validQuestions.length > 0) {
              contentToLoad.questions = validQuestions;
              console.log(`✅ Quiz Interativo carregado com ${validQuestions.length} questões válidas para: ${activity.id}`);
              setQuizInterativoContent(contentToLoad); // Define o estado específico para Quiz Interativo
            } else {
              console.warn('⚠️ Nenhuma questão válida encontrada no Quiz');
              contentToLoad = null;
            }
          } else {
            console.warn('⚠️ Estrutura de dados inválida para Quiz Interativo');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao processar conteúdo do Quiz Interativo:', error);
          contentToLoad = null;
        }
      } else {
        console.log('ℹ️ Nenhum conteúdo específico encontrado para Quiz Interativo. Usando dados gerais.');
      }
    }
    // 1.5. Flash Cards
    else if (activityType === 'flash-cards') {
      const flashCardsSavedContent = localStorage.getItem(`constructed_flash-cards_${activity.id}`);
      console.log(`🃏 Flash Cards: Verificando conteúdo salvo para ${activity.id}. Existe?`, !!flashCardsSavedContent);

      if (flashCardsSavedContent) {
        try {
          const parsedContent = JSON.parse(flashCardsSavedContent);
          contentToLoad = parsedContent.data || parsedContent;

          console.log('🃏 Flash Cards - Conteúdo parseado no modal de visualização:', contentToLoad);

          // Validar se o conteúdo tem cards válidos
          if (contentToLoad?.cards && Array.isArray(contentToLoad.cards) && contentToLoad.cards.length > 0) {
            // Validar estrutura de cada card
            const validCards = contentToLoad.cards.filter(card => 
              card && typeof card === 'object' && card.front && card.back
            );
            
            if (validCards.length > 0) {
              console.log(`✅ Flash Cards carregado com ${validCards.length} cards válidos para: ${activity.id}`);
              contentToLoad.cards = validCards; // Garantir apenas cards válidos
              // Não usar setFlashCardsContent aqui para evitar loops
            } else {
              console.warn('⚠️ Nenhum card válido encontrado');
              contentToLoad = null;
            }
          } else {
            console.warn('⚠️ Conteúdo de Flash Cards sem cards válidos');
            contentToLoad = null;
          }
        } catch (error) {
          console.error('❌ Erro ao processar conteúdo de Flash Cards:', error);
          contentToLoad = null;
        }
      } else {
        console.log('ℹ️ Nenhum conteúdo específico encontrado para Flash Cards. Usando dados gerais.');
      }
    }
    // 2. Lista de Exercícios (com filtro de exclusão)
    else if (activityType === 'lista-exercicios') {
      try {
        const deletedQuestionsJson = localStorage.getItem(`activity_deleted_questions_${activity.id}`);
        if (deletedQuestionsJson) {
          const deletedQuestionIds = JSON.parse(deletedQuestionsJson);
          console.log(`🔍 ActivityViewModal: Aplicando filtro de exclusões. IDs excluídos:`, deletedQuestionIds);

          // Filtrar questões excluídas em todas as possíveis localizações
          if (previewData.questoes && Array.isArray(previewData.questoes)) {
            previewData.questoes = previewData.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questões filtradas na raiz: ${previewData.questoes.length} restantes`);
          }

          if (previewData.content?.questoes && Array.isArray(previewData.content.questoes)) {
            previewData.content.questoes = previewData.content.questoes.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questões filtradas no content: ${previewData.content.questoes.length} restantes`);
          }

          if (previewData.questions && Array.isArray(previewData.questions)) {
            previewData.questions = previewData.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Questions filtradas: ${previewData.questions.length} restantes`);
          }

          if (previewData.content?.questions && Array.isArray(previewData.content.questions)) {
            previewData.content.questions = previewData.content.questions.filter(questao => !deletedQuestionIds.includes(questao.id));
            console.log(`🗑️ Content questions filtradas: ${previewData.content.questions.length} restantes`);
          }

          // Adicionar os IDs excluídos aos dados para referência
          previewData.deletedQuestionIds = deletedQuestionIds;
        }
      } catch (error) {
        console.warn('⚠️ Erro ao aplicar filtro de exclusões no ActivityViewModal:', error);
      }
    }
    // 3. Sequência Didática (com carregamento de dados da IA)
    else if (activityType === 'sequencia-didatica') {
      console.log('📚 ActivityViewModal: Processando Sequência Didática');

      // Verificar múltiplas fontes de dados em ordem de prioridade
      const sequenciaCacheKeys = [
        `constructed_sequencia-didatica_${activity.id}`,
        `schoolpower_sequencia-didatica_content`,
        `activity_${activity.id}`,
        `activity_fields_${activity.id}`
      ];

      let sequenciaContent = null;
      for (const key of sequenciaCacheKeys) {
        const data = localStorage.getItem(key);
        if (data) {
          try {
            const parsedData = JSON.parse(data);
            // Verificar se tem estrutura válida de sequência didática
            if (parsedData.sequenciaDidatica ||
                parsedData.aulas ||
                parsedData.diagnosticos ||
                parsedData.avaliacoes ||
                parsedData.data?.sequenciaDidatica ||
                parsedData.success) {
              sequenciaContent = parsedData;
              console.log(`✅ Dados da Sequência Didática encontrados em ${key}:`, parsedData);
              break;
            }
          } catch (error) {
            console.warn(`⚠️ Erro ao parsear dados de ${key}:`, error);
          }
        }
      }

      if (sequenciaContent) {
        // Processar dados de acordo com a estrutura encontrada
        let processedData = sequenciaContent;

        // Se os dados estão dentro de 'data' (resultado da API)
        if (sequenciaContent.data) {
          processedData = sequenciaContent.data;
        }

        // Se tem sucesso e dados estruturados
        if (sequenciaContent.success && sequenciaContent.data) {
          processedData = sequenciaContent.data;
        }

        // Mesclar dados da sequência didática com dados existentes
        contentToLoad = {
          ...previewData,
          ...processedData,
          id: activity.id,
          type: activityType,
          title: processedData.sequenciaDidatica?.titulo ||
                 processedData.titulo ||
                 processedData.title ||
                 previewData.title,
          description: processedData.sequenciaDidatica?.descricaoGeral ||
                      processedData.descricaoGeral ||
                      processedData.description ||
                      previewData.description,
          // Garantir estrutura completa para visualização
          sequenciaDidatica: processedData.sequenciaDidatica || processedData,
          metadados: processedData.metadados || {
            totalAulas: processedData.aulas?.length || 0,
            totalDiagnosticos: processedData.diagnosticos?.length || 0,
            totalAvaliacoes: processedData.avaliacoes?.length || 0,
            isGeneratedByAI: true,
            generatedAt: processedData.generatedAt || new Date().toISOString()
          }
        };
        console.log('📚 Dados da Sequência Didática processados para visualização:', contentToLoad);
      } else {
        console.log('⚠️ Nenhum conteúdo específico da Sequência Didática encontrado');
        // Criar estrutura básica a partir dos dados do formulário
        contentToLoad = {
          ...previewData,
          sequenciaDidatica: {
            titulo: previewData.title || 'Sequência Didática',
            descricaoGeral: previewData.description || 'Descrição da sequência didática',
            aulas: [],
            diagnosticos: [],
            avaliacoes: []
          },
          metadados: {
            totalAulas: 0,
            totalDiagnosticos: 0,
            totalAvaliacoes: 0,
            isGeneratedByAI: false,
            generatedAt: new Date().toISOString()
          }
        };
      }
    }

    // Atualizar previewData com o conteúdo carregado, se aplicável
    if (contentToLoad) {
      if (activityType === 'quiz-interativo') {
        previewData = { ...previewData, ...contentToLoad };
      } else if (activityType === 'flash-cards') {
        previewData = { ...previewData, ...contentToLoad };
      } else if (activityType === 'sequencia-didatica') {
        previewData = contentToLoad; // Sequência didática substitui tudo
      } else {
        // Para outros tipos, mesclar campos relevantes
        previewData = { ...previewData, ...contentToLoad };
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
        console.log('📚 Renderizando PlanoAulaPreview com dados:', previewData);
        return (
          <PlanoAulaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'sequencia-didatica':
        console.log('📚 Renderizando SequenciaDidaticaPreview com dados:', previewData);
        return (
          <SequenciaDidaticaPreview
            data={previewData}
            activityData={activity}
          />
        );

      case 'quiz-interativo':
        console.log('📚 Renderizando QuizInterativoPreview com dados:', previewData);
        return (
          <QuizInterativoPreview
            content={previewData}
            isLoading={false}
          />
        );

      case 'flash-cards':
        console.log('🃏 Renderizando FlashCardsPreview com dados:', previewData);
        return (
          <FlashCardsPreview
            content={previewData}
            isLoading={false}
          />
        );

      default:
        return (
          <ActivityPreview
            data={previewData}
            activityType={activityType}
            customFields={previewData.customFields}
          />
        );
    }
  };

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
          {/* Aplicar background laranja no cabeçalho quando for Plano de Aula */}
          <style jsx>{`
            .modal-header {
              background: ${activityType === 'plano-aula'
                ? 'linear-gradient(135deg, #ff8c42 0%, #ff6b1a 100%)'
                : 'transparent'
              };
            }
          `}</style>

          {/* Cabeçalho Universal para todas as atividades */}
          <UniversalActivityHeader
            activityTitle={getActivityTitle()}
            activityIcon={getActivityIcon(activityType)}
            userName={userInfo.displayName || userInfo.name}
            userAvatar={userInfo.avatar}
            schoolPoints={100}
            onMoreOptions={() => {
              // TODO: Implementar menu de opções
              console.log('Menu de opções clicado');
            }}
          />

          {/* Botão de fechar fixo no canto superior direito */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-50 p-2 bg-white/80 dark:bg-gray-800/80 hover:bg-white dark:hover:bg-gray-700 rounded-full shadow-lg transition-all duration-200"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>


          {/* Content Layout */}
          <div className="flex flex-1 overflow-hidden" style={{ height: isExerciseList ? 'calc(100% - 140px)' : 'calc(100% - 100px)' }}>
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

// Default export for compatibility
export default ActivityViewModal;