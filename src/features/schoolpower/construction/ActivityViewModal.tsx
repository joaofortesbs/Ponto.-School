import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

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

  // Resetar estado do sidebar quando o modal abre
  React.useEffect(() => {
    if (isOpen) {
      setShowSidebar(false);
      setSelectedQuestionId(null);
      setSelectedQuestionIndex(null);
      setIsInQuestionView(false);
    }
  }, [isOpen]);

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
        ...JSON.parse(localStorage.getItem(`activity_fields_${activity.id}`) || '{}')
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

  const getDifficultyColor = (dificuldade: string) => {
    switch (dificuldade.toLowerCase()) {
      case 'facil':
      case 'fácil':
      case 'básico':
      case 'basico':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medio':
      case 'médio':
      case 'intermediário':
      case 'intermediario':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'dificil':
      case 'difícil':
      case 'avançado':
      case 'avancado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const renderActivityPreview = () => {
    const activityType = activity.originalData?.type || activity.categoryId || activity.type || 'lista-exercicios';

    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_fields_${activity.id}`) || '{}');

    // Preparar dados para o preview EXATAMENTE como no modal de edição
    const previewData = {
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

    switch (activityType) {
      case 'lista-exercicios':
        return (
          <ExerciseListPreview
            data={previewData}
            customFields={previewData.customFields}
            onQuestionSelect={handleQuestionSelect}
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
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="relative w-[90%] h-[90%] bg-white rounded-lg shadow-2xl overflow-hidden flex flex-col"
          onClick={(e) => e.stopPropagation()}
          style={{
            borderTopLeftRadius: '12px',
            borderTopRightRadius: '12px',
            borderBottomLeftRadius: '12px',
            borderBottomRightRadius: '12px',
          }}
        >
          {/* Bordas laranjas nos cantos */}
          <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-orange-500 rounded-tl-lg pointer-events-none z-10" />
          <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-orange-500 rounded-tr-lg pointer-events-none z-10" />
          <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-orange-500 rounded-bl-lg pointer-events-none z-10" />
          <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-orange-500 rounded-br-lg pointer-events-none z-10" />

          {/* Header with Close button */}
          {isExerciseList && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 mb-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    {isInQuestionView && selectedQuestionIndex !== null ? (
                      <span className="text-white font-bold text-sm">
                        {selectedQuestionIndex + 1}
                      </span>
                    ) : (
                      <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    {isInQuestionView && selectedQuestionIndex !== null ? (
                      <>
                        <h2 className="text-xl font-bold text-blue-900">
                          Questão {selectedQuestionIndex + 1} de {questionsForSidebar.length}
                        </h2>
                        <p className="text-blue-700 text-sm">
                          {activity?.personalizedTitle || activity?.title || 'Lista de Exercícios'} - {activity?.originalData?.tema || 'Nível Introdutório'}
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-xl font-bold text-blue-900">
                          {activity?.personalizedTitle || activity?.title || 'Lista de Exercícios'}
                        </h2>
                        <p className="text-blue-700 text-sm">
                          {activity?.personalizedDescription || activity?.description || 'Exercícios práticos para fixação do conteúdo'}
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Tags and Info */}
                  <div className="flex flex-wrap gap-2">
                    {activity?.originalData?.disciplina && (
                      <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        {activity.originalData.disciplina}
                      </Badge>
                    )}
                    {activity?.originalData?.tema && (
                      <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h2m4-8h6m0 0v6m0-6l-6 6" />
                        </svg>
                        {activity.originalData.tema}
                      </Badge>
                    )}
                    {questionsForSidebar.length > 0 && (
                      <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                        </svg>
                        {questionsForSidebar.length} questões
                      </Badge>
                    )}
                  
                  </div>
                </div>

                {/* Close button - positioned in the extreme right */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onClose}
                  className="text-blue-700 hover:text-blue-900 hover:bg-blue-100 rounded-full ml-4 flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* Non-Exercise List Header */}
          {!isExerciseList && (
            <div className="flex justify-end p-4 relative z-20">
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          )}


          {/* Content Layout */}
          <div className="flex flex-1 overflow-hidden" style={{ height: isExerciseList ? 'calc(100% - 140px)' : 'calc(100% - 60px)' }}>
            {/* Question Navigation Sidebar - Only for Exercise Lists and when showSidebar is true */}
            {isExerciseList && questionsForSidebar.length > 0 && showSidebar && (
              <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto flex-shrink-0">
                <div className="p-4 space-y-4">
                  {/* Summary Card */}
                  <Card className="bg-white shadow-sm">
                    <CardContent className="p-3">
                      <div className="text-sm">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-600">Questões:</span>
                          <span className="font-semibold">{questionsForSidebar.length}</span>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-gray-600">Total de pontos:</span>
                          <span className="font-semibold">{questionsForSidebar.length}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Questions List */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-gray-700">Navegação</h4>
                    {questionsForSidebar.map((question, index) => (
                      <button
                        key={question.id}
                        onClick={() => scrollToQuestion(question.id, index)}
                        className={`w-full text-left p-2 text-xs rounded transition-colors ${
                          selectedQuestionId === question.id
                            ? 'bg-blue-50 border border-blue-200 font-medium text-blue-800'
                            : 'bg-white border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        <div className="font-medium">Questão {index + 1}</div>
                        <div className="text-gray-500 truncate mt-1">
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
              <div className="h-full overflow-y-auto p-6" ref={contentRef}>
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