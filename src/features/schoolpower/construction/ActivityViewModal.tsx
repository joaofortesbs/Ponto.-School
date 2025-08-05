
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
      completed: false // Pode ser expandido para rastrear progresso
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
    
    console.log('🎯 Renderizando preview para tipo:', activityType);
    console.log('🎯 Dados da atividade:', activity);
    console.log('🎯 Dados originais:', activity.originalData);
    console.log('🎯 Campos customizados:', activity.customFields);

    // Tentar recuperar dados do localStorage se não estiverem disponíveis
    const storedData = JSON.parse(localStorage.getItem(`activity_${activity.id}`) || '{}');
    const storedFields = JSON.parse(localStorage.getItem(`activity_fields_${activity.id}`) || '{}');
    
    console.log('🎯 Dados do localStorage:', storedData);
    console.log('🎯 Campos do localStorage:', storedFields);

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

    console.log('🎯 Dados finais para preview:', previewData);

    switch (activityType) {
      case 'lista-exercicios':
        return (
          <ExerciseListPreview 
            data={previewData}
            customFields={previewData.customFields}
            onQuestionRender={(questionId) => {
              // Callback para quando uma questão é renderizada
            }}
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
          className="relative w-[90%] h-[90%] bg-white rounded-lg shadow-2xl overflow-hidden"
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

          {/* Header com botão de fechar */}
          <div className="flex justify-end p-4 relative z-10">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content Layout */}
          <div className="flex h-full" style={{ height: 'calc(100% - 60px)' }}>
            {/* Question Navigation Sidebar - Only for Exercise Lists */}
            {isExerciseList && questionsForSidebar.length > 0 && (
              <div className="w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
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

                  {/* Question List */}
                  <div className="space-y-2">
                    {questionsForSidebar.map((questao) => (
                      <Card 
                        key={questao.id}
                        className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                          selectedQuestionId === questao.id 
                            ? 'ring-2 ring-blue-500 bg-blue-50' 
                            : 'bg-white hover:bg-gray-50'
                        }`}
                        onClick={() => scrollToQuestion(questao.id)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-sm font-semibold ${
                                questao.dificuldade === 'facil' || questao.dificuldade === 'fácil' 
                                  ? 'bg-green-100 text-green-800'
                                  : questao.dificuldade === 'medio' || questao.dificuldade === 'médio'
                                  ? 'bg-yellow-100 text-yellow-800'  
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {questao.numero}
                              </div>
                              <div>
                                <Badge 
                                  variant="outline" 
                                  className={`text-xs ${getDifficultyColor(questao.dificuldade)}`}
                                >
                                  {questao.dificuldade.charAt(0).toUpperCase() + questao.dificuldade.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="w-4 h-4 rounded-full border-2 border-gray-300">
                              {questao.completed && (
                                <div className="w-full h-full bg-green-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Main Content Area */}
            <div 
              ref={contentRef}
              className="flex-1 overflow-y-auto px-6 pb-6"
            >
              {renderActivityPreview()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
