
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';

interface QuizStepsProps {
  step: number;
  question: string;
  options: string[];
  onSelectOption: (option: string) => void;
  onNext: () => void;
  selectedOption?: string;
}

export const QuizSteps: React.FC<QuizStepsProps> = ({
  step,
  question,
  options,
  onSelectOption,
  onNext,
  selectedOption
}) => {
  const handleOptionSelect = (option: string) => {
    onSelectOption(option);
    // Avançar automaticamente para a próxima etapa após seleção
    setTimeout(() => {
      onNext();
    }, 500); // Delay de 500ms para mostrar feedback visual da seleção
  };

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center"
      >
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-8 leading-tight">
          {question}
        </h2>
      </motion.div>

      <div className="space-y-4">
        {options.map((option, index) => (
          <motion.div
            key={option}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Button
              onClick={() => handleOptionSelect(option)}
              variant={selectedOption === option ? "default" : "outline"}
              className={`w-full py-4 px-6 text-lg font-semibold rounded-xl transition-all duration-300 ${
                selectedOption === option
                  ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transform scale-105'
                  : 'bg-white border-2 border-gray-200 text-gray-700 hover:border-orange-300 hover:bg-orange-50'
              }`}
            >
              {option}
            </Button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
