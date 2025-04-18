import React from "react";
import { extractKeyTopics } from "../questionUtils";

interface MultipleChoiceQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
  onOptionSelect: (option: string) => void;
  selectedOption: string | null;
  showExplanation: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent,
  onOptionSelect,
  selectedOption,
  showExplanation
}) => {
  // Verificar se temos uma questão gerada pela IA
  const hasGeneratedQuestion = selectedQuestion && selectedQuestion.text;

  // Gerar texto de questão padrão se não tiver da IA
  const questionText = hasGeneratedQuestion 
    ? selectedQuestion.text 
    : `Qual é o principal conceito abordado nos tópicos? (Questão ${questionNumber})`;

  // Verificar se temos opções geradas pela IA
  const hasGeneratedOptions = hasGeneratedQuestion && selectedQuestion.options && selectedQuestion.options.length > 0;

  // Gerar opções padrão se não tiver da IA
  const fallbackOptions = [
    { id: `q${questionNumber}-a`, text: "Primeiro conceito-chave mencionado", isCorrect: true },
    { id: `q${questionNumber}-b`, text: "Segundo conceito relacionado ao tema", isCorrect: false },
    { id: `q${questionNumber}-c`, text: "Terceiro aspecto relevante discutido", isCorrect: false },
    { id: `q${questionNumber}-d`, text: "Quarto elemento importante do conteúdo", isCorrect: false },
    { id: `q${questionNumber}-e`, text: "Quinto componente significativo da discussão", isCorrect: false }
  ];

  // Personalizar opções com base no conteúdo, se disponível
  const keyTopics = extractKeyTopics(messageContent);
  if (keyTopics.length > 2 && !hasGeneratedOptions) {
    fallbackOptions.forEach((option, index) => {
      if (index < keyTopics.length) {
        option.text = `${keyTopics[index]} e seus principais aspectos`;
      }
    });
  }

  // Validar e corrigir as opções geradas pela IA
  let options = hasGeneratedOptions ? [...selectedQuestion.options] : fallbackOptions;

  // Verificar se as opções têm as propriedades necessárias
  options = options.map((option, index) => {
    // Garantir que cada opção tenha um ID
    if (!option.id) {
      option.id = `q${questionNumber}-${String.fromCharCode(97 + index)}`;
    }

    // Garantir que cada opção tenha o campo isCorrect
    if (typeof option.isCorrect !== 'boolean') {
      option.isCorrect = index === 0; // Primeira opção é a correta por padrão
    }

    // Garantir que cada opção tenha um texto
    if (!option.text) {
      option.text = `Opção ${index + 1}`;
    }

    return option;
  });

  // Garantir que há pelo menos uma opção correta
  const hasCorrectOption = options.some(option => option.isCorrect);
  if (!hasCorrectOption && options.length > 0) {
    options[0].isCorrect = true;
  }

  // Função auxiliar para determinar classe de estilo com base na seleção
  const getOptionClass = (optionId: string, isCorrect: boolean) => {
    if (!selectedOption) {
      return "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
    }

    if (selectedOption === optionId) {
      return isCorrect 
        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
        : "border-red-500 bg-red-50 dark:bg-red-900/20";
    }

    if (isCorrect && showExplanation) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }

    return "border-gray-200 dark:border-gray-700 opacity-70";
  };

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionText}
      </p>

      <div className="space-y-2 mt-2">
        {options.map((option: any, index: number) => (
          <div 
            key={option.id || `option-${index}`}
            className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${getOptionClass(option.id, option.isCorrect)}`}
            onClick={() => onOptionSelect(option.id)}
          >
            <div className="mr-3 font-medium mt-0.5">
              {String.fromCharCode(65 + index)}.
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {option.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};