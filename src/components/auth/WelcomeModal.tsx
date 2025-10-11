import React, { useState } from 'react';
import { X, Check, ArrowRight, Sparkles, BookOpen, Target, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  userName?: string;
}

const WelcomeModal: React.FC<WelcomeModalProps> = ({ isOpen, onClose, userName = 'Estudante' }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      icon: Sparkles,
      title: 'Conta criada com sucesso!',
      subtitle: `Estamos muito felizes em ter você na Ponto. School!`,
      description: 'Bem-vindo à plataforma educacional mais completa do Brasil.',
      color: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    {
      icon: BookOpen,
      title: 'Configure sua conta',
      subtitle: 'Personalize seu perfil e preferências para melhorar sua experiência.',
      description: 'Adicione suas informações básicas, foto de perfil e áreas de interesse.',
      color: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    {
      icon: Target,
      title: 'Tour pela plataforma',
      subtitle: 'Conheça os recursos e funcionalidades da Ponto. School.',
      description: 'Descubra como usar o Epictus IA, School Power, Biblioteca Digital e muito mais.',
      color: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    },
    {
      icon: Users,
      title: 'Comece a aprender',
      subtitle: 'Vá direto para o dashboard e comece sua jornada de aprendizado.',
      description: 'Acesse seus estudos, atividades e conecte-se com outros estudantes.',
      color: 'from-orange-500 to-orange-600',
      bgGradient: 'from-orange-50 to-orange-100'
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const handleSkip = () => {
    onClose();
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={handleSkip}
          />

          {/* Modal */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-2xl"
          >
            {/* Card Container */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden border-4 border-orange-500">
              {/* Header Background Gradient */}
              <div className={`absolute top-0 left-0 right-0 h-48 bg-gradient-to-br ${currentStepData.bgGradient} opacity-30`} />

              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 transition-all shadow-lg"
              >
                <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Content */}
              <div className="relative p-8 sm:p-12">
                {/* Icon */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="mb-6"
                >
                  <div className={`w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br ${currentStepData.color} flex items-center justify-center shadow-xl`}>
                    <Icon className="w-10 h-10 text-white" />
                  </div>
                </motion.div>

                {/* Title & Subtitle */}
                <motion.div
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-8"
                >
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                    {currentStepData.title}
                  </h2>
                  <p className="text-lg text-orange-600 dark:text-orange-400 font-medium mb-2">
                    {currentStepData.subtitle}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">
                    {currentStepData.description}
                  </p>
                </motion.div>

                {/* Progress Indicator */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? 'w-8 bg-orange-500'
                          : index < currentStep
                          ? 'w-2 bg-orange-300'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  {currentStep < steps.length - 1 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="px-6 py-3 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
                      >
                        Pular tutorial
                      </Button>
                      <Button
                        onClick={handleNext}
                        className="px-8 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                      >
                        Próximo
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className="px-12 py-3 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white shadow-lg"
                    >
                      Ir para o Dashboard
                      <Check className="ml-2 w-5 h-5" />
                    </Button>
                  )}
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;