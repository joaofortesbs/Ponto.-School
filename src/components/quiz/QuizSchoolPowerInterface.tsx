
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles, Play, ArrowLeft } from 'lucide-react';
import { AnimatedBackground } from '@/components/auth/AnimatedBackground';
import { SchoolPowerPage } from '../../sections/SchoolPower/SchoolPowerPage';

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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 relative">
        {/* Botão de voltar */}
        <div className="absolute top-6 left-6 z-50">
          <Button
            onClick={handleBack}
            variant="outline"
            size="sm"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20"
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
            <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
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
                  </div>
                  
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: "spring", stiffness: 400, damping: 17 }}
                  >
                    <Button 
                      onClick={handleStartTest}
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
};

export default QuizSchoolPowerInterface;
