import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | null>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [questoesExpandidas, setQuestoesExpandidas] = useState<{ [key: string]: boolean }>({});
  const [respostas, setRespostas] = useState<{ [key: string]: any }>({});
  const [questionOrder, setQuestionOrder] = useState<string[]>([]);
  const [draggedQuestion, setDraggedQuestion] = useState<string | null>(null);

  if (!isOpen || !activity) return null;

  // Função para rolar para uma questão específica
  const scrollToQuestion = (questionId: string) => {
    setSelectedQuestionId(questionId);
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

  const baseQuestionsForSidebar = getQuestionsForSidebar();
  const isExerciseList = (activity.originalData?.type || activity.categoryId || activity.type) === 'lista-exercicios';

  // Initialize question order when questions change
  React.useEffect(() => {
    if (baseQuestionsForSidebar.length > 0 && questionOrder.length === 0) {
      setQuestionOrder(baseQuestionsForSidebar.map(q => q.id));
    }
  }, [baseQuestionsForSidebar, questionOrder.length]);

  // Create ordered questions for sidebar
  const questionsForSidebar = React.useMemo(() => {
    if (questionOrder.length === 0) return baseQuestionsForSidebar;
    return questionOrder.map(id => baseQuestionsForSidebar.find(q => q.id === id)).filter(Boolean);
  }, [baseQuestionsForSidebar, questionOrder]);

  // Drag and drop handlers
  const handleDragStart = (questionId: string) => {
    setDraggedQuestion(questionId);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetQuestionId: string) => {
    if (!draggedQuestion) return;

    const newOrder = [...questionOrder];
    const draggedIndex = newOrder.indexOf(draggedQuestion);
    const targetIndex = newOrder.indexOf(targetQuestionId);

    // Remove dragged item and insert at new position
    newOrder.splice(draggedIndex, 1);
    newOrder.splice(targetIndex, 0, draggedQuestion);

    setQuestionOrder(newOrder);
    setDraggedQuestion(null);
  };

  const handleDragEnd = () => {
    setDraggedQuestion(null);
  };

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

          {/* Blue Header Card - Always on top for Exercise Lists */}
          {isExerciseList && (
            <div className="bg-blue-50 border-b border-blue-200 px-6 py-4 mb-0 z-10">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h2 className="text-xl font-bold text-blue-900">
                      {activity?.personalizedTitle || activity?.title || 'Lista de Exercícios'}
                    </h2>
                    <p className="text-blue-700 text-sm">
                      {activity?.personalizedDescription || activity?.description || 'Exercícios práticos para fixação do conteúdo'}
                    </p>
                  </div>
                </div>

                {/* Tags and Close Button Container */}
                <div className="flex items-center gap-4">
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

                  {/* Close Button */}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClose}
                    className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
                  >
                    <X className="w-5 h-5" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Header com botão de fechar para atividades não-exercicios */}
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
            {/* Question Navigation Sidebar - Only for Exercise Lists */}
            {isExerciseList && questionsForSidebar.length > 0 && (
              <div className="w-72 border-r border-gray-300 bg-gradient-to-b from-blue-50 to-white overflow-y-auto flex-shrink-0 shadow-lg">
                <div className="p-6">
                  {/* Header */}
                  <div className="mb-6">
                    <h3 className="text-lg font-bold text-blue-900 mb-2">Navegação de Questões</h3>
                    <div className="h-1 w-16 bg-blue-500 rounded-full"></div>
                  </div>

                  {/* Summary Stats */}
                  <div className="bg-white rounded-xl p-4 mb-6 shadow-md border border-blue-100">
                    <div className="grid grid-cols-2 gap-4 text-center">
                      <div>
                        <div className="text-2xl font-bold text-blue-600">{questionsForSidebar.length}</div>
                        <div className="text-xs text-gray-600">Questões</div>
                      </div>
                      <div>
                        <div className="text-2xl font-bold text-green-600">{questionsForSidebar.length}</div>
                        <div className="text-xs text-gray-600">Pontos</div>
                      </div>
                    </div>
                  </div>

                  {/* Questions List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-sm font-semibold text-gray-700">Lista de Questões</h4>
                      <div className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                        Arraste para reordenar
                      </div>
                    </div>
                    
                    {questionsForSidebar.map((question, index) => {
                      const questionIndex = questionOrder.indexOf(question.id);
                      const actualIndex = questionIndex !== -1 ? questionIndex : index;
                      
                      return (
                        <div
                          key={question.id}
                          draggable
                          onDragStart={() => handleDragStart(question.id)}
                          onDragOver={handleDragOver}
                          onDrop={() => handleDrop(question.id)}
                          onDragEnd={handleDragEnd}
                          onClick={() => scrollToQuestion(question.id)}
                          className={`group relative cursor-grab active:cursor-grabbing transition-all duration-200 ${
                            draggedQuestion === question.id 
                              ? 'opacity-50 scale-95' 
                              : 'hover:scale-[1.02]'
                          } ${
                            selectedQuestionId === question.id
                              ? 'ring-2 ring-blue-400 ring-offset-2'
                              : ''
                          }`}
                        >
                          <div className={`p-4 rounded-xl border-2 transition-all duration-200 ${
                            selectedQuestionId === question.id
                              ? 'bg-blue-50 border-blue-300 shadow-lg'
                              : 'bg-white border-gray-200 hover:border-blue-200 hover:shadow-md'
                          }`}>
                            {/* Question Header */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold ${
                                  selectedQuestionId === question.id
                                    ? 'bg-blue-500 text-white'
                                    : 'bg-gray-100 text-gray-700'
                                }`}>
                                  {actualIndex + 1}
                                </div>
                                <div className="text-sm font-semibold text-gray-800">
                                  Questão {actualIndex + 1}
                                </div>
                              </div>
                              
                              {/* Drag Handle */}
                              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                                </svg>
                              </div>
                            </div>

                            {/* Question Preview */}
                            <div className="text-xs text-gray-600 line-clamp-2 mb-3">
                              {question.enunciado?.substring(0, 80)}
                              {question.enunciado?.length > 80 ? '...' : ''}
                            </div>

                            {/* Question Info */}
                            <div className="flex items-center justify-between">
                              <div className="flex gap-2">
                                <span className={`px-2 py-1 text-xs rounded-full font-medium ${getDifficultyColor(question.dificuldade)}`}>
                                  {question.dificuldade || 'Médio'}
                                </span>
                              </div>
                              
                              <div className="text-xs text-gray-500">
                                {question.tipo?.replace('-', ' ') || 'Multiple Choice'}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
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