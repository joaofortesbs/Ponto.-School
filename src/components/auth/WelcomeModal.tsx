
import React, { useState } from 'react';
import { X, Sparkles, Wand2, GraduationCap, Zap, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
  userType?: 'professor' | 'aluno' | 'coordenador';
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ 
  isOpen, 
  onClose, 
  userName = 'Educador',
  userType = 'professor' 
}) => {
  const [currentStep, setCurrentStep] = useState(0);

  const isProfessor = userType === 'professor' || userType === 'coordenador';

  const steps = [
    {
      icon: GraduationCap,
      title: isProfessor ? `Bem-vindo, Professor ${userName}!` : `Bem-vindo à Ponto. School!`,
      subtitle: 'Primeiro Agente IA Educacional',
      description: isProfessor 
        ? 'Sua jornada de transformação educacional começa aqui' 
        : 'Sua jornada educacional começa agora',
      gradient: 'from-orange-500 via-orange-600 to-orange-700',
      bgGlow: 'orange'
    },
    {
      icon: Wand2,
      title: 'School Power',
      subtitle: isProfessor ? 'Crie atividades pedagógicas em minutos' : 'Atividades personalizadas para você',
      description: 'Use a ferramenta School Power para criar todas as atividades do semestre personalizadas e interativas!',
      gradient: 'from-orange-500 via-amber-500 to-yellow-500',
      limit: 'Você pode criar 5/137 atividades atualmente!',
      features: isProfessor ? [
        'Planos de aula automatizados com IA',
        'Atividades alinhadas à BNCC',
        'Economia de horas de preparação'
      ] : [
        'Atividades personalizadas com IA',
        'Conteúdo interativo e engajador',
        'Tudo pronto em minutos'
      ],
      bgGlow: 'amber'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with orange glow */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Glowing orange orbs background */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.5, 0.3],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-32 -right-32 w-96 h-96 bg-orange-500/30 rounded-full blur-3xl"
            />
            <motion.div
              animate={{
                scale: [1.2, 1, 1.2],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1
              }}
              className="absolute -bottom-32 -left-32 w-96 h-96 bg-amber-500/20 rounded-full blur-3xl"
            />
          </div>

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-lg"
          >
            {/* Main Card with premium glass effect */}
            <div className="relative bg-gradient-to-br from-white/95 via-orange-50/90 to-amber-50/95 dark:from-gray-900/95 dark:via-orange-950/90 dark:to-gray-900/95 rounded-3xl shadow-2xl overflow-hidden border border-orange-200/50 dark:border-orange-500/30">
              
              {/* Animated top border */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-orange-500 to-transparent">
                <motion.div
                  className="h-full bg-gradient-to-r from-orange-400 to-amber-400"
                  animate={{
                    x: ['-100%', '100%'],
                  }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                />
              </div>

              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-5 right-5 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-orange-100/80 dark:bg-orange-900/30 hover:bg-orange-200 dark:hover:bg-orange-800/50 transition-all duration-300 group backdrop-blur-sm"
              >
                <X className="w-5 h-5 text-orange-600 dark:text-orange-400 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              {/* Content */}
              <div className="p-8 sm:p-10">
                {/* Icon with premium animation */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 200 }}
                  className="mb-8 flex justify-center"
                >
                  <div className={`relative w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                    {/* Pulsing glow */}
                    <motion.div
                      animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.5, 0, 0.5],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${currentStepData.gradient} blur-xl`}
                    />
                  </div>
                </motion.div>

                {/* Title & Description */}
                <div className="text-center mb-8">
                  <motion.h2 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3"
                  >
                    {currentStepData.title}
                  </motion.h2>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.1 }}
                    className="text-lg bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent font-semibold mb-2"
                  >
                    {currentStepData.subtitle}
                  </motion.p>
                  
                  <motion.p 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    {currentStepData.description}
                  </motion.p>
                </div>

                {/* Features */}
                {currentStepData.features && (
                  <div className="space-y-3 mb-6">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 * index }}
                        className="flex items-center gap-3 p-3 bg-gradient-to-r from-orange-50/50 to-transparent dark:from-orange-900/20 dark:to-transparent rounded-xl border border-orange-100 dark:border-orange-800/30"
                      >
                        <div className="flex-shrink-0 w-6 h-6 rounded-full bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center">
                          <Sparkles className="w-4 h-4 text-white" />
                        </div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {feature}
                        </p>
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Limit Badge */}
                {currentStepData.limit && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mb-8 p-4 bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/10 border border-orange-300/40 dark:border-orange-500/40 rounded-2xl backdrop-blur-sm"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-5 h-5 text-orange-500" />
                      <p className="text-sm font-bold bg-gradient-to-r from-orange-600 to-amber-600 dark:from-orange-400 dark:to-amber-400 bg-clip-text text-transparent">
                        {currentStepData.limit}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={false}
                      animate={{
                        width: index === currentStep ? 32 : 8,
                        backgroundColor: index === currentStep 
                          ? 'rgb(249 115 22)' 
                          : index < currentStep 
                            ? 'rgb(251 146 60)'
                            : 'rgb(254 215 170)'
                      }}
                      className="h-2 rounded-full transition-all duration-300"
                    />
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleNext}
                  className={`w-full py-6 bg-gradient-to-r ${currentStepData.gradient} hover:opacity-90 text-white shadow-lg hover:shadow-xl rounded-2xl font-bold text-base transition-all duration-300 transform hover:scale-[1.02]`}
                >
                  {currentStep < steps.length - 1 ? (
                    <span className="flex items-center justify-center gap-2">
                      Continuar
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        →
                      </motion.div>
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <BookOpen className="w-5 h-5" />
                      Começar Jornada
                    </span>
                  )}
                </Button>
              </div>

              {/* Footer with branding */}
              <div className="bg-gradient-to-r from-orange-500 via-amber-500 to-orange-500 px-8 py-4">
                <p className="text-sm text-center text-white font-medium flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  Powered by School Power IA
                  <Sparkles className="w-4 h-4" />
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
