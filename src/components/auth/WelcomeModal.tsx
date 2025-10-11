
import React, { useState } from 'react';
import { X, CheckCircle, Sparkles, Wand2, Zap } from 'lucide-react';
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
      title: 'Bem-vindo à Ponto. School!',
      subtitle: `Olá, ${userName}`,
      description: 'Primeiro Agente IA Educacional',
      gradient: 'from-orange-500 to-pink-500',
      highlight: 'Sua jornada educacional começa agora'
    },
    {
      icon: Wand2,
      title: 'School Power',
      subtitle: 'Crie atividades em minutos',
      description: 'Use a ferramenta School Power para criar todas as atividades do semestre personalizadas e interativas!',
      gradient: 'from-blue-500 to-purple-500',
      limit: 'Você pode criar 5/137 atividades atualmente!',
      features: [
        'Atividades personalizadas com IA',
        'Conteúdo interativo e engajador',
        'Tudo pronto em minutos'
      ]
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
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-md"
          >
            {/* Card Principal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-4 right-4 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
              >
                <X className="w-4 h-4 text-gray-600 dark:text-gray-300" />
              </button>

              {/* Content */}
              <div className="p-8">
                {/* Icon */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', damping: 20 }}
                  className="mb-6 flex justify-center"
                >
                  <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                </motion.div>

                {/* Title & Subtitle */}
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {currentStepData.title}
                  </h2>
                  <p className="text-base text-gray-600 dark:text-gray-400 mb-2">
                    {currentStepData.subtitle}
                  </p>
                  <p className="text-sm font-medium bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {currentStepData.description}
                  </p>
                  {currentStepData.highlight && (
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                      {currentStepData.highlight}
                    </p>
                  )}
                </div>

                {/* Features */}
                {currentStepData.features && (
                  <div className="space-y-3 mb-4">
                    {currentStepData.features.map((feature, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
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
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="mb-6 p-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 border border-orange-500/30 rounded-lg"
                  >
                    <div className="flex items-center justify-center gap-2">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
                        {currentStepData.limit}
                      </p>
                    </div>
                  </motion.div>
                )}

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-6">
                  {steps.map((_, index) => (
                    <div
                      key={index}
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? `w-6 bg-gradient-to-r ${currentStepData.gradient}`
                          : 'w-1.5 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Action Button */}
                <Button
                  onClick={handleNext}
                  className={`w-full py-6 bg-gradient-to-r ${currentStepData.gradient} hover:opacity-90 text-white shadow-lg rounded-xl font-semibold text-base transition-all`}
                >
                  {currentStep < steps.length - 1 ? (
                    <>Próximo</>
                  ) : (
                    <>
                      Começar Agora
                      <CheckCircle className="ml-2 w-5 h-5" />
                    </>
                  )}
                </Button>
              </div>

              {/* School Power Branding */}
              <div className="bg-gray-50 dark:bg-gray-800 px-8 py-4 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-center text-gray-500 dark:text-gray-600 flex items-center justify-center gap-2">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  Powered by <span className="font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">School Power IA</span>
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
