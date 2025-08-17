
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowRight } from 'lucide-react';

interface QuizStepProps {
  step: number;
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
  onNext: () => void;
  selectedOption?: string;
}

export const QuizStep: React.FC<QuizStepProps> = ({
  step,
  question,
  options,
  onSelectOption,
  onNext,
  selectedOption
}) => {
  const handleOptionSelect = (option: string) => {
    onSelectOption(option);
    // Aguarda um pequeno delay para mostrar a seleção e depois avança
    setTimeout(() => {
      onNext();
    }, 500);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-12">
          {/* Indicador de progresso */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-2">
              {[1, 2, 3, 4].map((stepNumber) => (
                <div
                  key={stepNumber}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    stepNumber <= step
                      ? 'bg-orange-500'
                      : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Etapa atual */}
          <div className="text-center mb-6">
            <span className="text-sm font-medium text-orange-500 uppercase tracking-wide">
              Etapa {step} de 4
            </span>
          </div>

          {/* Pergunta */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-2xl md:text-3xl font-bold text-gray-900 text-center mb-8 leading-tight"
          >
            {question}
          </motion.h2>

          {/* Opções */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="space-y-4"
          >
            {options.map((option, index) => (
              <motion.div
                key={option}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.5 + index * 0.1 }}
              >
                <Button
                  onClick={() => handleOptionSelect(option)}
                  variant="outline"
                  className={`w-full p-6 text-left justify-start text-lg font-medium transition-all duration-300 rounded-2xl border-2 hover:scale-105 ${
                    selectedOption === option
                      ? 'bg-orange-500 text-white border-orange-500'
                      : 'bg-white hover:bg-orange-50 border-gray-200 hover:border-orange-300 text-gray-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span>{option}</span>
                    <ArrowRight className="h-5 w-5 opacity-50" />
                  </div>
                </Button>
              </motion.div>
            ))}
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

interface QuizFinalStepProps {
  onAccessPlatform: () => void;
}

export const QuizFinalStep: React.FC<QuizFinalStepProps> = ({
  onAccessPlatform
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-2xl mx-auto"
    >
      <Card className="backdrop-blur-xl bg-white/95 border-0 shadow-2xl rounded-3xl overflow-hidden">
        <CardContent className="p-12 text-center">
          {/* Ícone de sucesso */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mb-8"
          >
            <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mx-auto">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </motion.div>

          {/* Título */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-3xl md:text-4xl font-bold text-gray-900 mb-6"
          >
            Perfeito! 🎉
          </motion.h2>

          {/* Descrição */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-lg text-gray-600 mb-8 leading-relaxed"
          >
            Agora você pode acessar a plataforma teste e descobrir como criar todos os seus materiais educacionais em poucos minutos!
          </motion.p>

          {/* Botão de ação */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              onClick={onAccessPlatform}
              size="lg"
              className="bg-gradient-to-r from-orange-500 via-orange-600 to-orange-700 hover:from-orange-600 hover:via-orange-700 hover:to-orange-800 text-white px-16 py-5 rounded-2xl font-bold text-xl shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 border-0"
            >
              <ArrowRight className="mr-3 h-7 w-7" />
              ACESSAR PLATAFORMA TESTE
            </Button>
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
};
