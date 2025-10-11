
import React, { useState } from 'react';
import { X, ArrowRight, Sparkles, BookOpen, Target, Users, Zap, CheckCircle, Brain, Lightbulb, Rocket } from 'lucide-react';
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
      title: 'Bem-vindo ao School Power',
      subtitle: `Olá, ${userName}! Sua conta está pronta.`,
      description: 'A inteligência artificial que revoluciona a criação de atividades educacionais.',
      gradient: 'from-orange-500 via-orange-600 to-red-500',
      examples: [
        { icon: Zap, text: 'Crie planos de aula completos em minutos' },
        { icon: Brain, text: 'Gere atividades personalizadas com IA' },
        { icon: Target, text: 'Adapte para qualquer disciplina ou turma' }
      ]
    },
    {
      icon: BookOpen,
      title: 'Configure seu Perfil',
      subtitle: 'Personalize sua experiência School Power',
      description: 'Defina suas preferências para receber sugestões inteligentes e atividades sob medida.',
      gradient: 'from-blue-500 via-indigo-600 to-purple-500',
      examples: [
        { icon: Users, text: 'Disciplinas que você leciona' },
        { icon: Target, text: 'Níveis de ensino preferidos' },
        { icon: Lightbulb, text: 'Objetivos educacionais' }
      ]
    },
    {
      icon: Rocket,
      title: 'Explore o School Power',
      subtitle: 'Descubra todas as funcionalidades',
      description: 'Conheça as ferramentas que vão transformar sua forma de criar conteúdo educacional.',
      gradient: 'from-green-500 via-emerald-600 to-teal-500',
      examples: [
        { icon: Sparkles, text: '137+ tipos de atividades disponíveis' },
        { icon: Zap, text: 'Geração automática com IA Gemini' },
        { icon: BookOpen, text: 'Exportação em múltiplos formatos' }
      ]
    },
    {
      icon: Target,
      title: 'Comece Agora',
      subtitle: 'Tudo pronto para criar!',
      description: 'Acesse o dashboard e crie sua primeira atividade com o poder da IA.',
      gradient: 'from-orange-500 via-pink-600 to-purple-500',
      examples: [
        { icon: Rocket, text: 'Plano de aula em 2 minutos' },
        { icon: Brain, text: 'Atividades 100% personalizadas' },
        { icon: CheckCircle, text: 'Materiais prontos para usar' }
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
          {/* Backdrop com blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
            onClick={handleSkip}
          />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="relative z-10 w-full max-w-4xl"
          >
            {/* Card Principal */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl shadow-2xl overflow-hidden">
              {/* Gradiente de fundo animado */}
              <div className={`absolute top-0 left-0 right-0 h-64 bg-gradient-to-br ${currentStepData.gradient} opacity-10`} />
              
              {/* Close Button */}
              <button
                onClick={handleSkip}
                className="absolute top-6 right-6 z-20 w-10 h-10 flex items-center justify-center rounded-full bg-white/10 dark:bg-gray-800/50 backdrop-blur-sm hover:bg-white/20 dark:hover:bg-gray-800/70 transition-all shadow-lg group"
              >
                <X className="w-5 h-5 text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors" />
              </button>

              {/* Content */}
              <div className="relative p-8 sm:p-12">
                {/* Icon com animação */}
                <motion.div
                  key={currentStep}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                  className="mb-8"
                >
                  <div className={`w-24 h-24 mx-auto rounded-2xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-2xl`}>
                    <Icon className="w-12 h-12 text-white" />
                  </div>
                </motion.div>

                {/* Title & Subtitle */}
                <motion.div
                  key={`title-${currentStep}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="text-center mb-6"
                >
                  <h2 className="text-4xl sm:text-5xl font-bold text-gray-900 dark:text-white mb-3 bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                    {currentStepData.title}
                  </h2>
                  <p className="text-xl text-gray-600 dark:text-gray-400 font-medium mb-2">
                    {currentStepData.subtitle}
                  </p>
                  <p className="text-base text-gray-500 dark:text-gray-500 max-w-2xl mx-auto">
                    {currentStepData.description}
                  </p>
                </motion.div>

                {/* Examples Grid */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 mt-8"
                >
                  {currentStepData.examples.map((example, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-750 rounded-2xl p-6 hover:shadow-xl transition-all duration-300 group cursor-pointer border border-gray-200 dark:border-gray-700"
                    >
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                        <example.icon className="w-6 h-6 text-white" />
                      </div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white leading-relaxed">
                        {example.text}
                      </p>
                    </motion.div>
                  ))}
                </motion.div>

                {/* Progress Dots */}
                <div className="flex items-center justify-center gap-2 mb-8">
                  {steps.map((_, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0.8 }}
                      animate={{ scale: index === currentStep ? 1.2 : 1 }}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        index === currentStep
                          ? `w-8 bg-gradient-to-r ${currentStepData.gradient}`
                          : index < currentStep
                          ? 'w-2 bg-orange-300 dark:bg-orange-600'
                          : 'w-2 bg-gray-300 dark:bg-gray-600'
                      }`}
                    />
                  ))}
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  {currentStep < steps.length - 1 ? (
                    <>
                      <Button
                        variant="outline"
                        onClick={handleSkip}
                        className="px-8 py-6 text-gray-700 dark:text-gray-300 border-2 border-gray-200 dark:border-gray-700 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl font-semibold text-base transition-all"
                      >
                        Pular Tutorial
                      </Button>
                      <Button
                        onClick={handleNext}
                        className={`px-12 py-6 bg-gradient-to-r ${currentStepData.gradient} hover:opacity-90 text-white shadow-xl rounded-xl font-bold text-base transition-all transform hover:scale-105`}
                      >
                        Próximo
                        <ArrowRight className="ml-2 w-5 h-5" />
                      </Button>
                    </>
                  ) : (
                    <Button
                      onClick={handleNext}
                      className={`px-16 py-6 bg-gradient-to-r ${currentStepData.gradient} hover:opacity-90 text-white shadow-2xl rounded-xl font-bold text-lg transition-all transform hover:scale-105`}
                    >
                      Ir para o Dashboard
                      <CheckCircle className="ml-3 w-6 h-6" />
                    </Button>
                  )}
                </div>

                {/* School Power Branding */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-8 text-center"
                >
                  <p className="text-sm text-gray-500 dark:text-gray-600 flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-orange-500" />
                    Powered by <span className="font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">School Power IA</span>
                  </p>
                </motion.div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-br from-orange-500/20 to-transparent rounded-full blur-3xl -translate-x-1/2 translate-y-1/2" />
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-pink-500/20 to-transparent rounded-full blur-3xl translate-x-1/2 -translate-y-1/2" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
