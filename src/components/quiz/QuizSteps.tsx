import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizStep } from '@/hooks/useQuizSchoolPower';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  const isMobile = useIsMobile();
  if (!currentStep) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center text-gray-800 dark:text-gray-200">
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
      className={`w-full ${isMobile ? 'max-w-sm mx-4' : 'max-w-5xl'}`}
    >
      <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className={`${isMobile ? 'p-4' : 'p-8 md:p-12'}`}>
          {/* Barra de Progresso Simplificada */}
          <div className={`${isMobile ? 'mb-6' : 'mb-10'}`}>
            <div className="flex justify-between items-center mb-3">
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-semibold text-gray-700 dark:text-gray-300`}>
                Etapa {currentStep.id} de 4
              </span>
              <span className={`${isMobile ? 'text-xs' : 'text-sm'} font-bold text-orange-600 dark:text-orange-400`}>
                {Math.round(progressPercentage)}%
              </span>
            </div>

            <div className="relative">
              <Progress
                value={progressPercentage}
                className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner"
                indicatorClassName="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 dark:from-orange-500 dark:via-orange-600 dark:to-orange-700 rounded-full transition-all duration-1000 ease-out transform"
              />

              {/* Efeito de brilho na barra - melhorado para dark mode */}
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-transparent via-white/40 dark:via-white/20 to-transparent rounded-full transition-all duration-1000 ease-out"
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
            <div className={`${isMobile ? 'space-y-3' : 'space-y-4'}`}>
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`inline-flex items-center ${isMobile ? 'px-4 py-2' : 'px-6 py-3'} bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 rounded-2xl border-2 border-orange-200 dark:border-orange-700 shadow-lg`}
              >
                <span className={`text-orange-600 dark:text-orange-400 font-bold ${isMobile ? 'text-sm' : 'text-base'}`}>
                  Pergunta {currentStep.id}
                </span>
              </motion.div>

              <h2 className={`${isMobile ? 'text-xl' : 'text-3xl md:text-4xl'} font-bold text-gray-900 dark:text-gray-100 leading-tight ${isMobile ? 'max-w-xs' : 'max-w-4xl'} mx-auto`}>
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
                    size={isMobile ? "default" : "lg"}
                    className={`group w-full ${isMobile ? 'p-5' : 'p-7'} text-left ${isMobile ? 'text-base' : 'text-xl'} font-semibold border-2 border-gray-200 dark:border-gray-700 hover:border-orange-400 dark:hover:border-orange-500 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100 dark:hover:from-orange-900/30 dark:hover:to-orange-800/20 transition-all duration-300 rounded-3xl bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm shadow-xl hover:shadow-2xl hover:shadow-orange-500/10`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-gray-800 dark:text-gray-200 group-hover:text-orange-700 dark:group-hover:text-orange-300 transition-colors duration-300">
                        {option}
                      </span>
                      <ArrowRight className={`${isMobile ? 'h-5 w-5' : 'h-6 w-6'} text-gray-400 dark:text-gray-500 group-hover:text-orange-500 dark:group-hover:text-orange-400 transform group-hover:translate-x-2 transition-all duration-300`} />
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