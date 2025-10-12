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
import { useIsMobile } from '@/hooks/useIsMobile';

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
    <AnimatedBackground>
      <div className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden bg-transparent">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className={`w-full ${isMobile ? 'max-w-sm mx-4' : 'max-w-5xl'}`}
        >
          <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden max-h-[90vh]">
            <CardContent className={`${isMobile ? 'p-4' : 'p-8 md:p-12'} overflow-y-auto max-h-[85vh]`}>
              {/* Barra de Progresso Simplificada na Intro */}
              <div className="mb-10">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                    Aguardando início...
                  </span>
                  <span className="text-sm font-bold text-gray-400 dark:text-gray-500">
                    0%
                  </span>
                </div>

                <div className="relative">
                  <Progress
                    value={0}
                    className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner"
                    indicatorClassName="bg-gradient-to-r from-orange-400 via-orange-500 to-orange-600 dark:from-orange-500 dark:via-orange-600 dark:to-orange-700 rounded-full transition-all duration-1000 ease-out"
                  />
                </div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="text-center space-y-8"
              >
                {/* Headline Centralizado */}
                <div className="w-full max-w-4xl mx-auto">
                  <h1 className={`${isMobile ? 'text-2xl' : 'text-4xl md:text-5xl'} font-bold text-gray-900 dark:text-gray-100 leading-tight`}>
                    Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500">2 minutos</span> como a IA da Ponto. School pode economizar até
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500"> 15 horas</span> do seu planejamento semanal
                  </h1>
                </div>

                {/* Vídeo Centralizado */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3, duration: 0.6 }}
                  className="w-full flex justify-center"
                >
                  <div className="w-full max-w-md">
                    <div
                      dangerouslySetInnerHTML={{
                        __html: `
                          <script type="text/javascript">
                            var s=document.createElement("script");
                            s.src="https://scripts.converteai.net/lib/js/smartplayer-wc/v4/sdk.js";
                            s.async=true;
                            document.head.appendChild(s);
                          </script>
                          <div id="ifr_68a540d0caaf2808dd7c0dec_wrapper" style="margin: 0 auto; width: 100%; max-width: 400px;">
                            <div style="position: relative; padding: 153.33333333333334% 0 0 0;" id="ifr_68a540d0caaf2808dd7c0dec_aspect">
                              <iframe frameborder="0" allowfullscreen src="about:blank" id="ifr_68a540d0caaf2808dd7c0dec" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%;" referrerpolicy="origin" onload="this.onload=null, this.src='https://scripts.converteai.net/6cc509b6-8017-4754-9738-1fdbf9989ab0/players/68a540d0caaf2808dd7c0dec/v4/embed.html' +(location.search||'?') +'&vl=' +encodeURIComponent(location.href)"></iframe>
                            </div>
                          </div>
                        `
                      }}
                    />
                  </div>
                </motion.div>

                {/* Botão Centralizado */}
                <motion.div
                  whileHover={{ scale: isMobile ? 1.02 : 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  className="w-full flex justify-center"
                >
                  <Button
                    onClick={goToQuiz}
                    size={isMobile ? "default" : "lg"}
                    className={`bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 dark:hover:from-orange-700 dark:hover:via-orange-800 dark:hover:to-orange-900 text-white ${isMobile ? 'px-10 py-4' : 'px-20 py-6'} rounded-3xl font-bold ${isMobile ? 'text-lg' : 'text-2xl'} shadow-2xl hover:shadow-orange-500/30 dark:hover:shadow-orange-400/25 transition-all duration-300 border-0`}
                  >
                    <Play className={`${isMobile ? 'mr-3 h-6 w-6' : 'mr-4 h-8 w-8'}`} />
                    {isMobile ? 'TESTAR AGORA' : 'QUERO TESTAR AGORA'}
                  </Button>
                </motion.div>
              </motion.div>

              {/* Carrossel de Dores e Soluções */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="max-w-4xl mx-auto"
              >
                <CarrosselDoresSolucoes className="mt-8" />
              </motion.div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </AnimatedBackground>
  );

  const renderQuiz = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <QuizSteps
            currentStep={currentQuizStep}
            progressPercentage={state.progressPercentage}
            onAnswerSelect={answerQuizStep}
          />
        </div>
      </AnimatedBackground>
    </div>
  );

  const renderSchoolPower = () => (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-gray-900 dark:to-gray-800 relative">
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