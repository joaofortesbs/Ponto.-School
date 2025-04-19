import React from "react";

interface TrueFalseQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
  onOptionSelect: (optionId: string) => void;
  selectedOption: string | null;
  showExplanation?: boolean;
}

export const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent,
  onOptionSelect,
  selectedOption,
  showExplanation = false
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
  const showCorrectAnswer = showExplanation && selectedOption !== null && selectedQuestion?.answer !== undefined;
  const trueIsCorrect = selectedQuestion?.answer === true;
  const falseIsCorrect = selectedQuestion?.answer === false;

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionContent}
      </p>
      <div className="mt-4 space-y-3">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button 
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                selectedOption === "true" && !showCorrectAnswer
                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300" 
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              } ${
                showCorrectAnswer && trueIsCorrect
                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                  : ""
              } ${
                showCorrectAnswer && selectedOption === "true" && !trueIsCorrect
                  ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : ""
              }`}
              onClick={() => onOptionSelect("true")}
              disabled={selectedOption !== null}
            >
              Verdadeiro
            </button>
            {showCorrectAnswer && trueIsCorrect && (
              <svg className="w-5 h-5 text-green-500 absolute right-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {showCorrectAnswer && selectedOption === "true" && !trueIsCorrect && (
              <svg className="w-5 h-5 text-red-500 absolute right-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
          <div className="relative">
            <button 
              className={`px-4 py-2 border rounded-lg text-sm font-medium transition-colors ${
                selectedOption === "false" && !showCorrectAnswer
                  ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300" 
                  : "bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600"
              } ${
                showCorrectAnswer && falseIsCorrect
                  ? "bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 text-green-700 dark:text-green-300"
                  : ""
              } ${
                showCorrectAnswer && selectedOption === "false" && !falseIsCorrect
                  ? "bg-red-100 dark:bg-red-900/30 border-red-300 dark:border-red-700 text-red-700 dark:text-red-300"
                  : ""
              }`}
              onClick={() => onOptionSelect("false")}
              disabled={selectedOption !== null}
            >
              Falso
            </button>
            {showCorrectAnswer && falseIsCorrect && (
              <svg className="w-5 h-5 text-green-500 absolute right-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            )}
            {showCorrectAnswer && selectedOption === "false" && !falseIsCorrect && (
              <svg className="w-5 h-5 text-red-500 absolute right-2 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};