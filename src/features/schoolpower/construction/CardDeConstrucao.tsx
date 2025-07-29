
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Play, CheckCircle, Clock, BookOpen, Users, Target, Lightbulb, X, Edit3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ContextualizationCard } from '../contextualization/ContextualizationCard';
import { ActionPlanCard } from '../actionplan/ActionPlanCard';
import { EditActivityModal } from './EditActivityModal';
import type { FlowData, ContextualizationData, ActionPlanItem, ManualActivity } from '../construction/types/ActivityTypes';

interface CardDeConstrucaoProps {
  flowData: FlowData;
  onBack: () => void;
  step: 'contextualization' | 'actionPlan' | 'generating' | 'generatingActivities' | 'activities';
  contextualizationData?: ContextualizationData | null;
  actionPlan?: ActionPlanItem[];
  manualActivities?: ManualActivity[];
}

export const CardDeConstrucao: React.FC<CardDeConstrucaoProps> = ({
  flowData,
  onBack,
  step,
  contextualizationData,
  actionPlan = [],
  manualActivities = []
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState<ActionPlanItem | null>(null);

  console.log('🎯 ActionPlan recebido no CardDeConstrucao:', actionPlan);

  // Salvar dados no localStorage quando houver mudanças
  useEffect(() => {
    if (selectedActivity) {
      const activityDataForModal = {
        title: selectedActivity.title,
        description: selectedActivity.description,
        customFields: selectedActivity.customFields || {}
      };
      
      localStorage.setItem('selectedActivityData', JSON.stringify(activityDataForModal));
      console.log('💾 Dados da atividade salvos no localStorage:', activityDataForModal);
    }
  }, [selectedActivity]);

  const handleEditActivity = (activity: ActionPlanItem) => {
    console.log('🎯 Atividade selecionada para edição:', activity);
    
    // Preparar dados completos para o modal
    const completeActivityData = {
      title: activity.title || '',
      description: activity.description || '',
      customFields: activity.customFields || {}
    };
    
    setSelectedActivity(activity);
    localStorage.setItem('selectedActivityData', JSON.stringify(completeActivityData));
    console.log('💾 Dados salvos no localStorage antes de abrir modal:', completeActivityData);
    setShowEditModal(true);
  };

  const handleCloseModal = () => {
    setShowEditModal(false);
    setSelectedActivity(null);
    localStorage.removeItem('selectedActivityData');
  };

  const renderContextualizationStep = () => (
    <ContextualizationCard 
      onNext={() => {}} 
      data={contextualizationData}
    />
  );

  const renderActionPlanStep = () => (
    <ActionPlanCard 
      actionPlan={actionPlan}
      onNext={() => {}}
      onEditActivity={handleEditActivity}
    />
  );

  const renderGeneratingStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-orange-200 border-t-orange-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <Lightbulb className="w-6 h-6 text-orange-500" />
        </div>
      </motion.div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Gerando seu plano personalizado...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          A IA está analisando suas necessidades e criando sugestões de atividades
        </p>
      </div>
      
      <Progress value={75} className="w-full max-w-md" />
    </div>
  );

  const renderGeneratingActivitiesStep = () => (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-6">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
        className="relative"
      >
        <div className="w-16 h-16 rounded-full border-4 border-blue-200 border-t-blue-500"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <BookOpen className="w-6 h-6 text-blue-500" />
        </div>
      </motion.div>
      
      <div className="text-center space-y-2">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
          Criando atividades detalhadas...
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Preparando o conteúdo completo de cada atividade selecionada
        </p>
      </div>
      
      <Progress value={90} className="w-full max-w-md" />
    </div>
  );

  const renderActivitiesStep = () => (
    <ActionPlanCard 
      actionPlan={actionPlan}
      onNext={() => {}}
      onEditActivity={handleEditActivity}
    />
  );

  const getStepContent = () => {
    switch (step) {
      case 'contextualization':
        return renderContextualizationStep();
      case 'actionPlan':
        return renderActionPlanStep();
      case 'generating':
        return renderGeneratingStep();
      case 'generatingActivities':
        return renderGeneratingActivitiesStep();
      case 'activities':
        return renderActivitiesStep();
      default:
        return renderContextualizationStep();
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="w-full max-w-4xl mx-auto"
      >
        <Card className="w-full bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border shadow-xl">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="flex items-center gap-2 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Voltar
              </Button>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-orange-500"></div>
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    School Power
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6">
            <AnimatePresence mode="wait">
              {getStepContent()}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      {showEditModal && selectedActivity && (
        <EditActivityModal
          isOpen={showEditModal}
          onClose={handleCloseModal}
          activity={selectedActivity}
        />
      )}
    </>
  );
};

export default CardDeConstrucao;
