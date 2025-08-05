
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ConstructionActivity } from './types';
import ActivityPreview from '@/features/schoolpower/activities/default/ActivityPreview';
import ExerciseListPreview from '@/features/schoolpower/activities/lista-exercicios/ExerciseListPreview';

interface ActivityViewModalProps {
  isOpen: boolean;
  activity: ConstructionActivity | null;
  onClose: () => void;
}

export function ActivityViewModal({ isOpen, activity, onClose }: ActivityViewModalProps) {
  if (!isOpen || !activity) return null;

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
          className="relative w-[85%] h-[85%] bg-white rounded-lg shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
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
          <div className="flex justify-end p-4 border-b">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex flex-1 overflow-hidden" style={{ height: 'calc(100% - 60px)' }}>
            {/* Sidebar de Navegação das Questões */}
            {(activity?.originalData?.type === 'lista-exercicios' || activity?.categoryId === 'lista-exercicios') && (
              <div className="w-64 bg-gray-50 border-r border-gray-200 overflow-y-auto">
                <div className="p-4">
                  <div className="bg-white rounded-lg p-3 mb-4 shadow-sm">
                    <div className="text-sm font-medium text-gray-600">Questões:</div>
                    <div className="text-lg font-bold text-gray-900">
                      {activity?.originalData?.questoes?.length || activity?.originalData?.questions?.length || 10}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Total de pontos: {activity?.originalData?.questoes?.length || activity?.originalData?.questions?.length || 10}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    {Array.from({ length: activity?.originalData?.questoes?.length || activity?.originalData?.questions?.length || 10 }, (_, index) => {
                      const questao = activity?.originalData?.questoes?.[index] || activity?.originalData?.questions?.[index];
                      const dificuldade = questao?.dificuldade || questao?.difficulty || 'Fácil';
                      
                      const getDifficultyColor = (diff: string) => {
                        const nivel = diff.toLowerCase();
                        if (nivel.includes('facil') || nivel.includes('fácil') || nivel.includes('básico') || nivel.includes('basico')) {
                          return 'bg-green-100 text-green-800 border-green-200';
                        } else if (nivel.includes('medio') || nivel.includes('médio') || nivel.includes('intermediário') || nivel.includes('intermediario')) {
                          return 'bg-yellow-100 text-yellow-800 border-yellow-200';
                        } else if (nivel.includes('dificil') || nivel.includes('difícil') || nivel.includes('avançado') || nivel.includes('avancado')) {
                          return 'bg-red-100 text-red-800 border-red-200';
                        }
                        return 'bg-gray-100 text-gray-800 border-gray-200';
                      };

                      return (
                        <button
                          key={index}
                          onClick={() => {
                            const questaoElement = document.getElementById(`questao-${index + 1}`);
                            if (questaoElement) {
                              questaoElement.scrollIntoView({ 
                                behavior: 'smooth', 
                                block: 'start',
                                inline: 'nearest'
                              });
                            }
                          }}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg border hover:shadow-sm transition-all duration-200 ${getDifficultyColor(dificuldade)}`}
                        >
                          <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
                            {index + 1}
                          </div>
                          <div className="flex-1 text-left">
                            <div className="font-medium text-sm capitalize">
                              {dificuldade}
                            </div>
                          </div>
                          <div className="w-4 h-4 rounded-full border-2 border-gray-400"></div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
            
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-6">
              {renderActivityPreview()}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
