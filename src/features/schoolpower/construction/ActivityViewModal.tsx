import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
}

export function ActivityViewModal({ isOpen, onClose, activity }: ActivityViewModalProps) {
  const questionsRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  if (!activity) return null;

  const scrollToQuestion = (questionId: string) => {
    const questionElement = questionsRefs.current[questionId];
    if (questionElement) {
      questionElement.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
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
            questionsRefs={questionsRefs}
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

  // Renderizar painel lateral apenas para lista de exercícios
  const renderQuestionsSidebar = () => {
    if (activity.id !== 'lista-exercicios' && activity.categoryId !== 'lista-exercicios') return null;

    const questoes = activity.originalData?.exercicios || activity.originalData?.questions || [];
    const numeroQuestoes = questoes.length;

    const getDifficultyColor = (dificuldade?: string) => {
      const nivel = dificuldade ? dificuldade.toLowerCase() : 'medio';
      switch (nivel) {
        case 'facil':
        case 'fácil':
        case 'básico':
        case 'basico':
          return 'bg-green-100 text-green-800';
        case 'medio':
        case 'médio':
        case 'intermediário':
        case 'intermediario':
          return 'bg-yellow-100 text-yellow-800';
        case 'dificil':
        case 'difícil':
        case 'avançado':
        case 'avancado':
          return 'bg-red-100 text-red-800';
        default:
          return 'bg-gray-100 text-gray-800';
      }
    };

    return (
      <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto flex-shrink-0">
        <div className="p-4 border-b border-gray-200">
          <div className="text-sm font-medium text-gray-900">Questões</div>
          <div className="text-xs text-gray-500">Total: {numeroQuestoes}</div>
        </div>

        <div className="p-3 space-y-2">
          {questoes.map((questao, index) => (
            <button
              key={questao.id || `questao-${index}`}
              onClick={() => scrollToQuestion(questao.id || `questao-${index}`)}
              className="w-full flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 group"
            >
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-800 font-semibold flex items-center justify-center text-sm group-hover:bg-blue-200">
                  {index + 1}
                </div>
                <div className="text-left">
                  <div className={`text-xs px-2 py-1 rounded-full font-medium ${getDifficultyColor(questao.dificuldade)}`}>
                    {questao.dificuldade ? questao.dificuldade.charAt(0).toUpperCase() + questao.dificuldade.slice(1) : 'Médio'}
                  </div>
                </div>
              </div>
              <div className="w-4 h-4 rounded-full border-2 border-gray-300 group-hover:border-blue-400"></div>
            </button>
          ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl max-h-[90vh] overflow-hidden p-0">
        <DialogHeader className="p-4 border-b border-gray-200">
          <DialogTitle className="text-lg font-semibold text-gray-900">
            {activity.personalizedTitle || activity.title || 'Visualizar Atividade'}
          </DialogTitle>
          <div className="absolute top-0 right-0 mt-4 mr-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </DialogHeader>
        <div className="flex h-[calc(90vh-80px)]">
          {renderQuestionsSidebar()}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderActivityPreview()}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ActivityViewModal;