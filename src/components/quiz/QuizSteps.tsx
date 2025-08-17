import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizStep } from '@/hooks/useQuizSchoolPower';

interface QuizStepsProps {
  currentStep: QuizStep | undefined;
  progressPercentage: number;
  onAnswerSelect: (stepId: number, answer: string) => void;
}

export const QuizSteps: React.FC<QuizStepsProps> = ({
  currentStep,
  progressPercentage,
  onAnswerSelect
}) => {
  if (!currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  // Adicionando uma verificação de segurança caso currentStep.id ou options não estejam definidos
  if (currentStep.id === undefined || !currentStep.options) {
    console.error("Erro: currentStep está malformado ou faltando dados essenciais.");
    return null; // Ou exiba uma mensagem de erro apropriada
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-5xl"
    >
      <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-12 md:p-16">
          {/* Barra de Progresso */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-600">
                Etapa {currentStep.id} de 4
              </span>
              <span className="text-sm font-medium text-gray-600">
                {Math.round(progressPercentage)}%
              </span>
            </div>
            <Progress
              value={progressPercentage}
              className="h-2 bg-gray-200"
              indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-600"
            />
          </div>

          {/* Pergunta */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-8"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight mb-12">
              {currentStep.question}
            </h2>

            {/* Opções */}
            <div className="space-y-4 max-w-2xl mx-auto">
              {currentStep.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      console.log(`🎯 Usuário selecionou opção "${option}" na etapa ${currentStep.id}`);
                      onAnswerSelect(currentStep.id, option);
                    }}
                    variant="outline"
                    size="lg"
                    className="w-full p-6 text-lg font-medium border-2 border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-all duration-300 rounded-xl transform hover:scale-105 active:scale-95"
                  >
                    {option}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizSteps;