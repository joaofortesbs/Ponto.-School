import React from "react";

interface TrueFalseQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
  onOptionSelect: (option: string) => void;
  selectedOption: string | null;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent,
  onOptionSelect,
  selectedOption
}) => {
  // Verificar se temos uma questão gerada pela IA
  const hasGeneratedQuestion = selectedQuestion && selectedQuestion.text;

  // Gerar texto de questão padrão se não tiver da IA
  const questionText = hasGeneratedQuestion 
    ? selectedQuestion.text 
    : `Os conceitos apresentados são aplicáveis em diferentes contextos? (Questão ${questionNumber})`;

  // Verificar se temos resposta gerada pela IA
  const correctAnswer = hasGeneratedQuestion && typeof selectedQuestion.answer === 'boolean'
    ? selectedQuestion.answer
    : true; // valor padrão

  // Função auxiliar para determinar classe de estilo com base na seleção
  const getOptionClass = (isTrue: boolean) => {
    const optionValue = isTrue ? 'true' : 'false';

    if (!selectedOption) {
      return "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600";
    }

    if (selectedOption === optionValue) {
      return (isTrue === correctAnswer)
        ? "border-green-500 bg-green-50 dark:bg-green-900/20" 
        : "border-red-500 bg-red-50 dark:bg-red-900/20";
    }

    if (isTrue === correctAnswer && selectedOption) {
      return "border-green-500 bg-green-50 dark:bg-green-900/20";
    }

    return "border-gray-200 dark:border-gray-700 opacity-70";
  };

  // Garantir que temos uma explicação válida
  const explanation = (hasGeneratedQuestion && selectedQuestion.explanation) 
    ? selectedQuestion.explanation
    : correctAnswer 
      ? "Esta afirmação é verdadeira pois os conceitos fundamentais discutidos possuem aplicações diversas em diferentes contextos."
      : "Esta afirmação é falsa pois os conceitos apresentados têm aplicabilidade limitada apenas a contextos específicos.";

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionText}
      </p>

      <div className="space-y-2 mt-2">
        <div 
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${getOptionClass(true)}`}
          onClick={() => onOptionSelect('true')}
        >
          <div className="w-5 h-5 border rounded-full mr-3 flex items-center justify-center">
            {selectedOption === 'true' && (
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Verdadeiro
            </p>
          </div>
        </div>

        <div 
          className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${getOptionClass(false)}`}
          onClick={() => onOptionSelect('false')}
        >
          <div className="w-5 h-5 border rounded-full mr-3 flex items-center justify-center">
            {selectedOption === 'false' && (
              <div className="w-3 h-3 bg-blue-500 dark:bg-blue-400 rounded-full"></div>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Falso
            </p>
          </div>
        </div>
      </div>

      {selectedOption && (
        <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Explicação:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">
            {explanation}
          </p>
        </div>
      )}
    </div>
  );
};