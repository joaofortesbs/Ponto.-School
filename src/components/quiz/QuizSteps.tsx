import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizStep } from '@/hooks/useQuizSchoolPower';
import { CheckCircle2, ArrowRight } from 'lucide-react';

interface QuizStepsProps {
  currentStep: QuizStep | undefined;
  progressPercentage: number;
  onAnswerSelect: (stepId: number, answer: string) => void;
  isMobile?: boolean;
}

export const QuizSteps: React.FC<QuizStepsProps> = ({
  currentStep,
  progressPercentage,
  onAnswerSelect,
  isMobile = false
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
      className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}
    >
      <Card className={`backdrop-blur-xl bg-white/95 border-0 shadow-2xl ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} overflow-hidden`}>
        <CardContent className={isMobile ? 'p-4' : 'p-8 md:p-12'}>
          {/* Barra de Progresso Simplificada */}
          <div className={isMobile ? 'mb-6' : 'mb-10'}>
            <div className="flex justify-between items-center mb-3">
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700`}>
                Etapa {currentStep.id} de 4
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-600`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>

            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-2 bg-gray-200 rounded-full overflow-hidden"
                indicatorClassName="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out transform"
              />

              {/* Efeito de brilho na barra */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-full transition-all duration-1000 ease-out"
                style={{ 
                  width: `${progressPercentage}%`,
                  animation: progressPercentage > 0 ? 'shimmer 2s ease-in-out infinite' : 'none'
                }}
              />
            </div>
          </div>

          {/* Pergunta Redesenhada */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`text-center ${isMobile ? 'space-y-6' : 'space-y-10'}`}
          >
            <div className={isMobile ? 'space-y-3' : 'space-y-4'}>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`inline-flex items-center ${isMobile ? 'px-3 py-1.5' : 'px-4 py-2'} bg-gradient-to-r from-orange-100 to-orange-50 rounded-full border border-orange-200`}
              >
                <span className={`text-orange-600 font-semibold ${isMobile ? 'text-xs' : 'text-sm'}`}>
                  Pergunta {currentStep.id}
                </span>
              </motion.div>

              <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 leading-tight ${isMobile ? 'max-w-xs' : 'max-w-4xl'} mx-auto`}>
                {currentStep.question}
              </h2>
            </div>

            {/* Opções Redesenhadas */}
            <div className={`${isMobile ? 'space-y-3 max-w-xs' : 'space-y-4 max-w-3xl'} mx-auto`}>
              {currentStep.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.4 }}
                  whileHover={{ scale: isMobile ? 1.01 : 1.02, x: isMobile ? 4 : 8 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      console.log(`🎯 Usuário selecionou opção "${option}" na etapa ${currentStep.id}`);
                      onAnswerSelect(currentStep.id, option);
                    }}
                    variant="outline"
                    size={isMobile ? 'default' : 'lg'}
                    className={`group w-full ${isMobile ? 'p-4 text-sm' : 'p-6 text-lg'} text-left font-medium border-2 border-gray-200 hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-25 transition-all duration-300 ${isMobile ? 'rounded-xl' : 'rounded-2xl'} bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 group-hover:text-orange-700 transition-colors duration-300">
                        {option}
                      </span>
                      <ArrowRight className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'} text-gray-400 group-hover:text-orange-500 transform group-hover:translate-x-1 transition-all duration-300`} />
                    </div>
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