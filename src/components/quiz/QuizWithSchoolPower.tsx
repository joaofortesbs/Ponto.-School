
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Play, ArrowLeft, Home, CheckCircle2 } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { useQuizSchoolPower } from '../../hooks/useQuizSchoolPower';
import { CarrosselDoresSolucoes } from './CarrosselDoresSolucoes';
import { QuizSteps } from './QuizSteps';
import { useIsMobile } from '../../hooks/useIsMobile';

export const QuizWithSchoolPower: React.FC = () => {
  const { state, quizSteps, goToQuiz, goToSchoolPower, goToIntro, goToFinal, answerQuizStep, resetQuiz } = useQuizSchoolPower();
  const isMobile = useIsMobile();

  // Log apenas quando há mudança de estado importante
  React.useEffect(() => {
    if (state.currentStep === 'schoolpower') {
      console.log('✅ School Power carregado com sucesso!');
    }
  }, [state.currentStep]);

  const currentQuizStep = quizSteps.find(step => step.id === state.quizStepNumber);

  const renderIntro = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className={`relative z-20 min-h-screen flex items-center justify-center ${isMobile ? 'p-2' : 'p-6'}`}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-5xl'}`}
          >
            <Card className={`backdrop-blur-xl bg-white/95 border-0 shadow-2xl ${isMobile ? 'rounded-2xl' : 'rounded-3xl'} overflow-hidden`}>
              <CardContent className={isMobile ? 'p-4' : 'p-8 md:p-12'}>
                {/* Barra de Progresso Simplificada na Intro */}
                <div className="mb-10">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-semibold text-gray-500">
                      Aguardando início...
                    </span>
                    <span className="text-sm font-bold text-gray-400">
                      0%
                    </span>
                  </div>
                  
                  <div className="relative">
                    <Progress
                      value={0}
                      className="h-2 bg-gray-200 rounded-full overflow-hidden"
                      indicatorClassName="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 rounded-full transition-all duration-1000 ease-out"
                    />
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className={`text-center ${isMobile ? 'space-y-4' : 'space-y-8'}`}
                >
                  <div className={`text-center ${isMobile ? 'space-y-4 mb-6' : 'space-y-8 mb-12'}`}>
                    <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-gray-900 leading-tight`}>
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
                    </h1>

                    {/* Botão Quero Testar Agora - Agora vai para o quiz */}
                    <motion.div
                      whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className={isMobile ? 'my-4' : 'my-8'}
                    >
                      <Button 
                        onClick={goToQuiz}
                        size={isMobile ? 'default' : 'lg'}
                        className={`bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white ${isMobile ? 'px-8 py-3 text-base' : 'px-16 py-5 text-xl'} rounded-2xl font-bold shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0`}
                      >
                        <Play className={`mr-3 ${isMobile ? 'h-5 w-5' : 'h-7 w-7'}`} />
                        QUERO TESTAR AGORA
                      </Button>
                    </motion.div>

                    {/* Carrossel de Dores e Soluções */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.4 }}
                      className={isMobile ? 'max-w-xs mx-auto' : 'max-w-4xl mx-auto'}
                    >
                      <CarrosselDoresSolucoes className={isMobile ? 'mt-4' : 'mt-8'} />
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );

  const renderQuiz = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className={`relative z-20 min-h-screen flex items-center justify-center ${isMobile ? 'p-2' : 'p-6'}`}>
          <QuizSteps
            currentStep={currentQuizStep}
            progressPercentage={state.progressPercentage}
            onAnswerSelect={answerQuizStep}
            isMobile={isMobile}
          />
        </div>
      </AnimatedBackground>
    </div>
  );

  const renderSchoolPower = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Interface completa do School Power */}
      <SchoolPowerPage isQuizMode={true} />
    </div>
  );

  // Garantir que sempre haja um fallback
  const currentStepToRender = state.currentStep || 'intro';
  
  return (
    <AnimatePresence mode="wait">
      {currentStepToRender === 'intro' && (
        <motion.div
          key="intro"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderIntro()}
        </motion.div>
      )}
      {currentStepToRender === 'quiz' && currentQuizStep && (
        <motion.div
          key="quiz"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4, ease: "easeInOut" }}
        >
          {renderQuiz()}
        </motion.div>
      )}
      {currentStepToRender === 'schoolpower' && (
        <motion.div
          key="schoolpower"
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.98 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {renderSchoolPower()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizWithSchoolPower;
