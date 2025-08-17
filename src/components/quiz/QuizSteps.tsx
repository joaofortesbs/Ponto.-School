import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { QuizStep } from '@/hooks/useQuizSchoolPower';
import { CheckCircle, Star, Sparkles } from 'lucide-react';

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
          <p className="text-lg font-medium">Carregando experiência personalizada...</p>
        </div>
      </div>
    );
  }

  // Adicionando uma verificação de segurança caso currentStep.id ou options não estejam definidos
  if (currentStep.id === undefined || !currentStep.options) {
    console.error("Erro: currentStep está malformado ou faltando dados essenciais.");
    return null;
  }

  const stepCircles = [1, 2, 3, 4];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="w-full max-w-6xl relative"
    >
      {/* Efeitos de fundo */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-100/20 via-purple-100/20 to-blue-100/20 rounded-3xl blur-3xl -z-10"></div>
      
      <Card className="backdrop-blur-xl bg-white/98 border-0 shadow-3xl rounded-3xl overflow-hidden relative">
        {/* Gradiente sutil no topo */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-400 via-purple-500 to-blue-500"></div>
        
        <CardContent className="p-8 md:p-12 lg:p-16">
          {/* Barra de Progresso Aprimorada */}
          <div className="mb-12">
            {/* Header da Progress Bar */}
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center space-x-3">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 flex items-center justify-center"
                >
                  <Sparkles className="w-4 h-4 text-white" />
                </motion.div>
                <span className="text-lg font-bold text-gray-800">
                  Descobrindo seu perfil
                </span>
              </div>
              <div className="text-right">
                <div className="text-sm text-gray-500 font-medium">Progresso</div>
                <div className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                  {Math.round(progressPercentage)}%
                </div>
              </div>
            </div>

            {/* Progress Bar Visual */}
            <div className="relative">
              <div className="flex justify-between items-center mb-4">
                {stepCircles.map((step, index) => (
                  <motion.div
                    key={step}
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: index * 0.1 + 0.3 }}
                    className="relative z-10 flex flex-col items-center"
                  >
                    <div
                      className={`
                        relative flex items-center justify-center w-12 h-12 rounded-full border-3 transition-all duration-500
                        ${step < currentStep.id 
                          ? 'bg-gradient-to-r from-green-500 to-emerald-500 border-green-500 text-white shadow-lg shadow-green-500/30' 
                          : step === currentStep.id 
                            ? 'bg-gradient-to-r from-orange-500 to-orange-600 border-orange-500 text-white shadow-lg shadow-orange-500/30 animate-pulse' 
                            : 'bg-white border-gray-300 text-gray-400'
                        }
                      `}
                    >
                      {step < currentStep.id ? (
                        <CheckCircle className="w-6 h-6" />
                      ) : step === currentStep.id ? (
                        <Star className="w-6 h-6" />
                      ) : (
                        <span className="font-bold">{step}</span>
                      )}
                    </div>
                    <span className={`text-xs font-medium mt-2 ${step <= currentStep.id ? 'text-gray-700' : 'text-gray-400'}`}>
                      Etapa {step}
                    </span>
                  </motion.div>
                ))}
              </div>

              {/* Linha de conexão */}
              <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full -z-10">
                <motion.div
                  initial={{ width: '0%' }}
                  animate={{ width: `${(progressPercentage / 100) * 100}%` }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                ></motion.div>
              </div>
            </div>
          </div>

          {/* Pergunta Aprimorada */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="text-center space-y-10"
          >
            <div className="space-y-4">
              <motion.div
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200"
              >
                <span className="text-sm font-medium text-orange-700">
                  Pergunta {currentStep.id} de 4
                </span>
              </motion.div>
              
              <h2 className="text-3xl md:text-5xl font-bold text-gray-900 leading-tight">
                <span className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent">
                  {currentStep.question}
                </span>
              </h2>
            </div>

            {/* Opções Sofisticadas */}
            <div className="space-y-4 max-w-3xl mx-auto">
              {currentStep.options.map((option, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.15 + 0.4 }}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Button
                    onClick={() => {
                      console.log(`🎯 Usuário selecionou opção "${option}" na etapa ${currentStep.id}`);
                      onAnswerSelect(currentStep.id, option);
                    }}
                    variant="outline"
                    size="lg"
                    className="
                      w-full p-8 text-xl font-semibold 
                      border-2 border-gray-200 
                      hover:border-orange-400 hover:bg-gradient-to-r hover:from-orange-50 hover:to-orange-100
                      transition-all duration-300 
                      rounded-2xl 
                      transform hover:scale-[1.02] active:scale-[0.98]
                      shadow-lg hover:shadow-xl hover:shadow-orange-500/10
                      bg-white/80 backdrop-blur-sm
                      group relative overflow-hidden
                    "
                  >
                    {/* Efeito de brilho no hover */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                    
                    <span className="relative z-10 text-gray-700 group-hover:text-orange-700 transition-colors duration-300">
                      {option}
                    </span>
                  </Button>
                </motion.div>
              ))}
            </div>

            {/* Informação adicional */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-center text-gray-500 text-sm mt-8"
            >
              <p>Suas respostas nos ajudam a personalizar sua experiência ✨</p>
            </motion.div>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default QuizSteps;