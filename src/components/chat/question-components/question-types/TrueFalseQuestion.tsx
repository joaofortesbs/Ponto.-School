
import React from "react";

interface TrueFalseQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
  onOptionSelect: (optionId: string) => void;
  selectedOption: string | null;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent,
  onOptionSelect,
  selectedOption
}) => {
  // Questões padrão por tipo (para fallback)
  const trueFalseQuestions = [
    "Os conceitos apresentados são aplicáveis apenas em contextos teóricos.",
    "Este tema é considerado fundamental na área de estudo.",
    "Existem diferentes abordagens para este assunto.",
    "A aplicação prática deste conteúdo é limitada.",
    "Os princípios discutidos são universalmente aceitos na comunidade acadêmica."
  ];

  const questionContent = selectedQuestion 
    ? selectedQuestion.text 
    : trueFalseQuestions[(questionNumber - 1) % trueFalseQuestions.length];
    
  // Verificar se o usuário já selecionou uma opção e se temos informação sobre a resposta correta
  const showCorrectAnswer = selectedOption !== null && selectedQuestion?.answer !== undefined;
  const trueIsCorrect = selectedQuestion?.answer === true;
  const falseIsCorrect = selectedQuestion?.answer === false;

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionContent}
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center space-x-4">
          <button 
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              selectedOption === "true" 
                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300" 
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            } ${
              showCorrectAnswer && trueIsCorrect
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                : ""
            }`}
            onClick={() => onOptionSelect("true")}
            disabled={selectedOption !== null}
          >
            Verdadeiro
          </button>
          <button 
            className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
              selectedOption === "false" 
                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300" 
                : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
            } ${
              showCorrectAnswer && falseIsCorrect
                ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                : ""
            }`}
            onClick={() => onOptionSelect("false")}
            disabled={selectedOption !== null}
          >
            Falso
          </button>
        </div>
      </div>
    </div>
  );
};
