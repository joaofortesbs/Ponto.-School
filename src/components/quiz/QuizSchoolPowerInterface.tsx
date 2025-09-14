import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';
import { CarrosselDoresSolucoes } from './CarrosselDoresSolucoes';

interface QuizSchoolPowerInterfaceProps {
  onBack?: () => void;
}

export const QuizSchoolPowerInterface: React.FC<QuizSchoolPowerInterfaceProps> = ({ onBack }) => {
  const [showIntro, setShowIntro] = useState(true);
  const [showSchoolPower, setShowSchoolPower] = useState(false);

  const handleStartTest = () => {
    setShowIntro(false);
    setShowSchoolPower(true);
  };

  const handleBack = () => {
    if (showSchoolPower) {
      setShowSchoolPower(false);
      setShowIntro(true);
    } else if (onBack) {
      onBack();
    }
  };

  if (showSchoolPower) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 dark:from-gray-900 dark:to-gray-800 relative">
        {/* Botão de voltar - melhorado */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="bg-white/15 dark:bg-gray-800/50 backdrop-blur-md border-2 border-white/30 dark:border-gray-600/50 text-white dark:text-gray-200 hover:bg-white/25 dark:hover:bg-gray-700/70 rounded-2xl px-4 py-2 font-semibold transition-all duration-300"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Voltar ao Quiz
          </Button>
        </div>

        {/* Interface completa do School Power */}
        <SchoolPowerPage />
      </div>
    );
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      <AnimatedBackground>
        <div className="relative z-20 min-h-screen flex items-center justify-center p-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="w-full max-w-5xl"
          >
            <Card className="backdrop-blur-xl bg-white/95 dark:bg-gray-900/95 border-2 border-gray-200/50 dark:border-gray-700/50 shadow-2xl rounded-3xl overflow-hidden">
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
                      className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-orange-100 to-orange-50 dark:from-orange-900/30 dark:to-orange-800/20 border-2 border-orange-200 dark:border-orange-700 rounded-3xl mb-6 shadow-lg"
                    >
                      <Sparkles className="h-6 w-6 text-orange-500 dark:text-orange-400 mr-3" />
                      <span className="text-orange-700 dark:text-orange-300 font-bold text-base">IA Pedagógica Avançada</span>
                    </motion.div>

                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
                      Descubra em <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500">2 minutos</span> como a IA da Ponto. School pode economizar até 
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-orange-600 dark:from-orange-400 dark:to-orange-500"> 15 horas</span> do seu planejamento semanal
                    </h1>
                    <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
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
                      onClick={handleStartTest}
                      size="lg"
                      className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 dark:from-orange-600 dark:via-orange-700 dark:to-orange-800 dark:hover:from-orange-700 dark:hover:via-orange-800 dark:hover:to-orange-900 text-white px-16 py-5 rounded-3xl font-bold text-xl shadow-2xl hover:shadow-orange-500/30 dark:hover:shadow-orange-400/25 transition-all duration-300 border-0"
                    >
                      <Play className="mr-4 h-7 w-7" />
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
              <p className="text-white/90 dark:text-gray-200 text-lg backdrop-blur-md bg-black/30 dark:bg-gray-800/60 rounded-3xl px-8 py-4 inline-block border-2 border-white/30 dark:border-gray-600/50 shadow-lg">
                Powered by <span className="text-orange-400 dark:text-orange-300 font-bold">Ponto. School</span> IA
              </p>
            </motion.div>
          </motion.div>
        </div>
      </AnimatedBackground>
    </div>
  );
};

export default QuizSchoolPowerInterface;