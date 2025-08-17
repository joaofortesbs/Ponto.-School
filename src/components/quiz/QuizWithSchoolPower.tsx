
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, ArrowLeft, Home } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { useQuizSchoolPower } from '../../hooks/useQuizSchoolPower';
import { CarrosselDoresSolucoes } from './CarrosselDoresSolucoes';
import { QuizSteps } from './QuizSteps';

export const QuizWithSchoolPower: React.FC = () => {
  const { state, quizSteps, goToQuiz, goToSchoolPower, goToIntro, goToFinal, answerQuizStep, resetQuiz } = useQuizSchoolPower();

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
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
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
                {/* Barra de Progresso Universal - Vazia no início */}
                <div className="mb-12">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center space-x-3">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: 0.2 }}
                        className="w-8 h-8 rounded-full bg-gradient-to-r from-gray-400 to-gray-500 flex items-center justify-center"
                      >
                        <Play className="w-4 h-4 text-white" />
                      </motion.div>
                      <span className="text-lg font-bold text-gray-800">
                        Pronto para começar?
                      </span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 font-medium">Progresso</div>
                      <div className="text-2xl font-bold text-gray-400">
                        0%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar Visual - Vazia */}
                  <div className="relative">
                    <div className="flex justify-between items-center mb-4">
                      {[1, 2, 3, 4].map((step, index) => (
                        <motion.div
                          key={step}
                          initial={{ scale: 0, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={{ delay: index * 0.1 + 0.3 }}
                          className="relative z-10 flex flex-col items-center"
                        >
                          <div className="relative flex items-center justify-center w-12 h-12 rounded-full border-3 bg-white border-gray-300 text-gray-400 transition-all duration-500">
                            <span className="font-bold">{step}</span>
                          </div>
                          <span className="text-xs font-medium mt-2 text-gray-400">
                            Etapa {step}
                          </span>
                        </motion.div>
                      ))}
                    </div>

                    {/* Linha de conexão - Vazia */}
                    <div className="absolute top-6 left-6 right-6 h-1 bg-gray-200 rounded-full -z-10">
                      <div className="h-full w-0 bg-gradient-to-r from-orange-500 to-orange-600 rounded-full transition-all duration-800"></div>
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8"
                >
                  <div className="text-center space-y-8 mb-12">
                    <motion.div
                      initial={{ scale: 0.9 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 mb-6"
                    >
                      <span className="text-sm font-medium text-orange-700">
                        ✨ Avaliação Personalizada - 2 minutos
                      </span>
                    </motion.div>

                    <h1 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
                    </h1>

                    {/* Botão Quero Testar Agora - Aprimorado */}
                    <motion.div
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="my-10"
                    >
                      <Button 
                        onClick={goToQuiz}
                        size="lg"
                        className="
                          bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 
                          hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 
                          text-white px-20 py-6 rounded-2xl font-bold text-2xl 
                          shadow-2xl hover:shadow-orange-500/30 
                          transition-all duration-300 border-0
                          group relative overflow-hidden
                        "
                      >
                        {/* Efeito de brilho no hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
                        
                        <Play className="mr-4 h-8 w-8 relative z-10" />
                        <span className="relative z-10">QUERO TESTAR AGORA</span>
                      </Button>
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
      {/* Barra de navegação superior */}
      <div className="absolute top-0 left-0 right-0 z-50 bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center space-x-4">
            <Button
              onClick={goToIntro}
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar ao Quiz
            </Button>
            <div className="h-4 w-px bg-white/20" />
            <span className="text-white/80 text-sm">
              School Power - Modo Quiz
            </span>
          </div>
          <Button
            onClick={resetQuiz}
            variant="ghost"
            size="sm"
            className="text-white hover:bg-white/10"
          >
            <Home className="h-4 w-4 mr-2" />
            Início
          </Button>
        </div>
      </div>

      {/* Interface completa do School Power com padding top para a barra de navegação */}
      <div className="pt-16">
        <SchoolPowerPage />
      </div>
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
