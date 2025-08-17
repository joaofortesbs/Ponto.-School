import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowLeft, Home } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { useQuizSchoolPower } from '../../hooks/useQuizSchoolPower';
import { CarrosselDoresSolucoes } from '../../sections/SchoolPower/CarrosselDoresSolucoes';

export const QuizWithSchoolPower: React.FC = () => {
  const { state, goToSchoolPower, goToIntro, resetQuiz } = useQuizSchoolPower();

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
                    <motion.div
                      className="inline-block bg-orange-100 text-orange-700 px-4 py-2 rounded-full text-sm font-medium"
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      🤖 IA Pedagógica Avançada
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight">
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600">2 minutos</span> como a IA da Ponto. School pode economizar até 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600"> 15 horas</span> do seu planejamento semanal
                    </h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                      Teste agora gratuitamente a IA pedagógica que cria todas as suas atividades personalizadas com 1 comando.
                    </p>

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