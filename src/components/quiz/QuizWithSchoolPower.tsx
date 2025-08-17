import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowLeft, Home } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { useQuizSchoolPower } from '../../hooks/useQuizSchoolPower';
import { CarrosselDoresSolucoes } from './CarrosselDoresSolucoes';
import { QuizSteps } from './QuizSteps';

export const QuizWithSchoolPower: React.FC = () => {
  const { state, quizSteps, goToQuiz, goToSchoolPower, goToIntro, goToFinal, answerQuizStep, resetQuiz } = useQuizSchoolPower();

  const currentQuizStep = quizSteps.find(step => step.id === state.quizStepNumber);

  const renderIntro = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Barra de Progresso - sempre visível no topo */}
              <div className="w-full px-6 pt-6 pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Progresso do Quiz</span>
                    <span>{Math.round(state.progressPercentage)}%</span>
                  </div>
                  <Progress
                    value={state.progressPercentage}
                    className="w-full h-2 bg-gray-200"
                    indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  />
                </div>
              </div>

              <CardContent className="p-12 md:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8"
                >
                  <div className="space-y-6">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-orange-100 to-orange-50 border border-orange-200 rounded-2xl mb-4"
                    >
                      <Sparkles className="h-5 w-5 text-orange-500 mr-2" />
                      <span className="text-orange-700 font-semibold text-sm">IA Pedagógica Avançada</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      Teste agora gratuitamente a IA pedagógica que cria todas as suas atividades personalizadas com 1 comando.
                    </p>

                    {/* Carrossel de Dores e Soluções - Logo após o headline */}
                    <motion.div
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.6 }}
                      className="w-full max-w-6xl mx-auto pt-8"
                    >
                      <CarrosselDoresSolucoes />
                    </motion.div>
                  </div>

                  {/* Botão de Ação */}
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button
                      onClick={goToQuiz}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
                    >
                      <Play className="mr-3 h-6 w-6" />
                      QUERO TESTAR AGORA
                    </Button>
                  </motion.div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-white/80 text-lg backdrop-blur-sm bg-black/20 rounded-2xl px-6 py-3 inline-block border border-white/20">
                Powered by <span className="text-orange-400 font-bold">Ponto. School</span> IA
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );

  const renderQuiz = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden min-h-[600px]">
              {currentQuizStep && (
                <QuizSteps
                  currentStep={currentQuizStep}
                  stepNumber={state.quizStepNumber}
                  totalSteps={quizSteps.length}
                  progressPercentage={state.progressPercentage}
                  onAnswerSelect={answerQuizStep}
                />
              )}
            </Card>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-white/80 text-lg backdrop-blur-sm bg-black/20 rounded-2xl px-6 py-3 inline-block border border-white/20">
                Powered by <span className="text-orange-400 font-bold">Ponto. School</span> IA
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );

  const renderFinal = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden min-h-[600px]">
              {/* Barra de Progresso - sempre visível no topo */}
              <div className="w-full px-6 pt-6 pb-2">
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-sm text-gray-600">
                    <span>Progresso do Quiz</span>
                    <span>100%</span>
                  </div>
                  <Progress
                    value={100}
                    className="w-full h-2 bg-gray-200"
                    indicatorClassName="bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-500"
                  />
                </div>
              </div>

              <CardContent className="p-12 md:p-16">
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8"
                >
                  <div className="space-y-6">
                    <motion.div
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.2, duration: 0.6 }}
                      className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-100 to-green-50 border border-green-200 rounded-2xl mb-4"
                    >
                      <Sparkles className="h-5 w-5 text-green-500 mr-2" />
                      <span className="text-green-700 font-semibold text-sm">Quiz Concluído!</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Perfeito! Agora é hora de <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">testar na prática</span>
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      Acesse nossa plataforma de teste e crie todos os seus materiais interativos em minutos. Veja como a IA da Ponto.School pode transformar seu planejamento!
                    </p>
                  </div>

                  {/* Botões de Ação */}
                  <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={goToSchoolPower}
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-4 rounded-2xl font-bold text-lg shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
                      >
                        <Play className="mr-3 h-6 w-6" />
                        ACESSAR PLATAFORMA TESTE
                      </Button>
                    </motion.div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                    >
                      <Button
                        onClick={resetQuiz}
                        variant="outline"
                        size="lg"
                        className="border-2 border-gray-300 text-gray-700 hover:bg-gray-50 px-8 py-4 rounded-2xl font-semibold text-lg"
                      >
                        <Home className="mr-3 h-5 w-5" />
                        Refazer Quiz
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              </CardContent>
            </Card>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="text-center mt-8"
            >
              <p className="text-white/80 text-lg backdrop-blur-sm bg-black/20 rounded-2xl px-6 py-3 inline-block border border-white/20">
                Powered by <span className="text-orange-400 font-bold">Ponto. School</span> IA
              </p>
            </motion.div>
          </motion.div>
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

  return (
    <AnimatePresence mode="wait">
      {state.currentStep === 'intro' && (
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
      {state.currentStep === 'quiz' && (
        <motion.div
          key="quiz"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderQuiz()}
        </motion.div>
      )}
      {state.currentStep === 'final' && (
        <motion.div
          key="final"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderFinal()}
        </motion.div>
      )}
      {state.currentStep === 'schoolpower' && (
        <motion.div
          key="schoolpower"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderSchoolPower()}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuizWithSchoolPower;