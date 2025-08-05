import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

interface ActivityViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ConstructionActivity | null;
}

const ActivityViewModal: React.FC<ActivityViewModalProps> = ({ isOpen, onClose, activity }) => {
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
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="relative w-full max-w-7xl max-h-[90vh] mx-4 bg-white rounded-lg shadow-xl overflow-hidden"
            style={{
              borderTopLeftRadius: '12px',
              borderTopRightRadius: '12px',
              borderBottomLeftRadius: '12px',
              borderBottomRightRadius: '12px',
            }}
          >
            {/* Bordas laranjas nos cantos */}
            <div className="absolute top-0 left-0 w-16 h-16 border-l-4 border-t-4 border-orange-500 rounded-tl-lg pointer-events-none" />
            <div className="absolute top-0 right-0 w-16 h-16 border-r-4 border-t-4 border-orange-500 rounded-tr-lg pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-16 h-16 border-l-4 border-b-4 border-orange-500 rounded-bl-lg pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-16 h-16 border-r-4 border-b-4 border-orange-500 rounded-br-lg pointer-events-none" />

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

            <div className="flex h-[calc(90vh-100px)]">
              {renderQuestionsSidebar()}

              <div className="flex-1 p-6 overflow-y-auto">
                {renderActivityPreview()}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default ActivityViewModal;