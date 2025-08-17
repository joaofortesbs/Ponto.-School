import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowLeft, Home } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { useQuizSchoolPower } from '../../hooks/useQuizSchoolPower';
import { CarrosselDoresSolucoes } from './CarrosselDoresSolucoes';
import { QuizSteps } from './QuizSteps';

export const QuizWithSchoolPower: React.FC = () => {
  const { 
    state, 
    goToQuizStep2, 
    goToQuizStep3, 
    goToQuizStep4, 
    goToQuizFinal, 
    goToSchoolPower, 
    goToIntro, 
    saveQuizAnswer, 
    resetQuiz 
  } = useQuizSchoolPower();

  console.log('🔄 QuizWithSchoolPower renderizado:', { 
    currentStep: state.currentStep, 
    progress: state.progressPercentage, 
    answers: state.quizAnswers 
  });

  const renderQuizSteps = () => (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-3xl"
          >
            <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
              {/* Barra de Progresso */}
              <div className="h-2 bg-gray-200 overflow-hidden rounded-full">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${state.progressPercentage}%` }}
                  transition={{ duration: 1.0, ease: "easeInOut" }}
                />
              </div>

              <CardContent className="p-12 md:p-16">
                <AnimatePresence mode="wait">
                  {state.currentStep === 'quiz-step-2' && (
                    <motion.div
                      key="step-2"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <QuizSteps
                        step={2}
                        question="Você gasta mais de 5 horas por semana planejando aulas?"
                        options={["Sim", "Muito mais", "Não"]}
                        onSelectOption={(option) => saveQuizAnswer('step2', option)}
                        onNext={goToQuizStep3}
                        selectedOption={state.quizAnswers.step2}
                      />
                    </motion.div>
                  )}

                  {state.currentStep === 'quiz-step-3' && (
                    <motion.div
                      key="step-3"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <QuizSteps
                        step={3}
                        question="Você acredita que ter alunos engajados na sua aula é fundamental?"
                        options={["Claro!", "Um pouco", "Não"]}
                        onSelectOption={(option) => saveQuizAnswer('step3', option)}
                        onNext={goToQuizStep4}
                        selectedOption={state.quizAnswers.step3}
                      />
                    </motion.div>
                  )}

                  {state.currentStep === 'quiz-step-4' && (
                    <motion.div
                      key="step-4"
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -50 }}
                      transition={{ duration: 0.5, ease: "easeInOut" }}
                    >
                      <QuizSteps
                        step={4}
                        question="Se você pudesse acessar uma plataforma que cria todas as atividades/materiais interativos do semestre em 2 minutos, você acessaria?"
                        options={["Com certeza!", "Talvez", "Não"]}
                        onSelectOption={(option) => saveQuizAnswer('step4', option)}
                        onNext={goToQuizFinal}
                        selectedOption={state.quizAnswers.step4}
                      />
                    </motion.div>
                  )}

                  {state.currentStep === 'quiz-final' && (
                    <motion.div
                      key="quiz-final"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5 }}
                      className="text-center space-y-8"
                    >
                      <div className="space-y-4">
                        <Sparkles className="w-16 h-16 text-orange-500 mx-auto" />
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                          Perfeito! 🎉
                        </h2>
                        <p className="text-lg text-gray-600 leading-relaxed">
                          Você está pronto para descobrir como a Ponto. School pode revolucionar seu planejamento de aulas!
                        </p>
                      </div>

                      <motion.div
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      >
                        <Button 
                          onClick={goToSchoolPower}
                          size="lg"
                          className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-12 py-4 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
                        >
                          <Sparkles className="mr-3 h-6 w-6" />
                          ACESSAR PLATAFORMA TESTE
                        </Button>
                      </motion.div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );

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
              <CardContent className="p-12 md:p-16">
                <motion.div 
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                  className="text-center space-y-8"
                >
                  <div className="text-center space-y-8 mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
                    </h1>

                    {/* Botão Quero Testar Agora - Reposicionado acima do carrossel */}
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: "spring", stiffness: 400, damping: 17 }}
                      className="my-8"
                    >
                      <Button 
                        onClick={() => {
                          console.log('🚀 Botão "Quero testar agora" clicado');
                          goToQuizStep2();
                        }}
                        size="lg"
                        className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-16 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
                      >
                        <Play className="mr-3 h-7 w-7" />
                        QUERO TESTAR AGORA
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
      {(state.currentStep === 'quiz-step-2' || 
        state.currentStep === 'quiz-step-3' || 
        state.currentStep === 'quiz-step-4' || 
        state.currentStep === 'quiz-final') && (
        <motion.div
          key="quiz-steps"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          {renderQuizSteps()}
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