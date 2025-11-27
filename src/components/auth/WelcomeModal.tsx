
import React, { useState, useEffect } from 'react';
import { X, Sparkles, Wand2, GraduationCap, Zap, BookOpen } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

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
  const [isClosing, setIsClosing] = useState(false);
  const [fullUserName, setFullUserName] = useState('Educador');
  const navigate = useNavigate();

  const isProfessor = userType === 'professor' || userType === 'coordenador';

  // Buscar nome completo do usuário do Neon DB
  useEffect(() => {
    const fetchUserName = () => {
      try {
        const neonUser = localStorage.getItem("neon_user");
        if (neonUser) {
          const userData = JSON.parse(neonUser);
          const nomeCompleto = userData.nome_completo || userData.nome_usuario || userData.email;
          
          if (nomeCompleto) {
            setFullUserName(nomeCompleto);
          }
        }
      } catch (error) {
        console.error("Erro ao buscar nome do usuário:", error);
      }
    };

    if (isOpen) {
      fetchUserName();
    }
  }, [isOpen]);

  const steps = [
    {
      icon: GraduationCap,
      title: isProfessor ? `Bem-vindo, Professor ${fullUserName}!` : `Bem-vindo à Ponto. School!`,
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
      // Navegar para School Power
      setIsClosing(true);
      // Remover classes de scroll bloqueado
      document.body.classList.remove('modal-open');
      setTimeout(() => {
        onClose();
        navigate('/dashboard/school-power');
      }, 300);
    }
  };

  const handleSkip = () => {
    // Fechar com animação suave
    setIsClosing(true);
    // Remover classes de scroll bloqueado
    document.body.classList.remove('modal-open');
    setTimeout(() => {
      onClose();
    }, 300);
  };

  if (!isOpen) return null;

  const currentStepData = steps[currentStep];
  const Icon = currentStepData.icon;

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
          {/* Backdrop with orange glow and medium blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/20 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Subtle background glow */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <motion.div
              animate={{
                opacity: [0.02, 0.04, 0.02],
              }}
              transition={{
                duration: 6,
                repeat: Infinity,
                ease: "easeInOut"
              }}
              className="absolute -top-32 -right-32 w-48 h-48 bg-orange-400/8 rounded-full blur-3xl"
            />
          </div>

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ 
              scale: isClosing ? 0.95 : 1, 
              opacity: isClosing ? 0 : 1, 
              y: isClosing ? 10 : 0 
            }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ 
              type: 'spring', 
              damping: 25, 
              stiffness: 300,
              duration: isClosing ? 0.3 : 0.5
            }}
            className="relative z-10 w-full max-w-lg"
          >
            {/* Main Card with premium glass effect */}
            <div className="relative bg-gradient-to-br from-white/60 via-orange-50/50 to-amber-50/60 dark:from-gray-900/60 dark:via-orange-950/50 dark:to-gray-900/60 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden border border-orange-200/50 dark:border-orange-500/30">

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
                  <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${currentStepData.gradient} flex items-center justify-center shadow-lg`}>
                    <Icon className="w-10 h-10 text-white" />
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

                {/* Action Buttons */}
                <div className="space-y-3">
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
                        Criar atividades agora
                      </span>
                    )}
                  </Button>
                  
                  {currentStep === steps.length - 1 && (
                    <Button
                      onClick={handleSkip}
                      variant="ghost"
                      className="w-full text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                    >
                      Seguir sozinho
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default WelcomeModal;
