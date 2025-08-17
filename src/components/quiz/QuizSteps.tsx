
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { QuizStep } from '@/hooks/useQuizSchoolPower';

interface QuizStepsProps {
  currentStep: QuizStep;
  stepNumber: number;
  totalSteps: number;
  progressPercentage: number;
  onAnswerSelect: (stepId: number, answer: string) => void;
}

export const QuizSteps: React.FC<QuizStepsProps> = ({
  currentStep,
  stepNumber,
  totalSteps,
  progressPercentage,
  onAnswerSelect,
}) => {
  const handleOptionClick = (answer: string) => {
    onAnswerSelect(currentStep.id, answer);
  };

  return (
    <div className="w-full h-full flex flex-col">
      {/* Barra de Progresso */}
      <div className="w-full px-6 pt-6 pb-4">
        <div className="space-y-2">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>Progresso do Quiz</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <Progress 
            value={progressPercentage} 
            className="w-full h-2 bg-gray-200" 
            indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
          />
        </div>
      </div>

      {/* Conteúdo da Etapa */}
      <motion.div 
        key={currentStep.id}
        initial={{ opacity: 0, x: 30 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -30 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className="flex-1 px-6 pb-6 flex flex-col justify-center"
      >
        <div className="text-center space-y-8">
          {/* Indicador da Etapa */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, duration: 0.4 }}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-full mb-6"
          >
            <span className="text-orange-700 font-semibold text-sm">
              Etapa {stepNumber} de {totalSteps}
            </span>
          </motion.div>

          {/* Pergunta */}
          <motion.h2 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight mb-8"
          >
            {currentStep.question}
          </motion.h2>

          {/* Opções */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4 max-w-md mx-auto"
          >
            {currentStep.options.map((option, index) => (
              <motion.div
                key={option.value}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + (index * 0.1), duration: 0.3 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  onClick={() => handleOptionClick(option.value)}
                  variant="outline"
                  size="lg"
                  className="w-full py-4 px-6 text-left bg-white border-2 border-gray-200 hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 text-gray-700 hover:text-orange-700 font-medium text-lg rounded-xl"
                >
                  {option.text}
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default QuizSteps;
