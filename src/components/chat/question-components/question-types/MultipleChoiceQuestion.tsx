import React from "react";
import { extractTerms } from "../questionUtils";

interface MultipleChoiceQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
  onOptionSelect: (optionId: string) => void;
  selectedOption: string | null;
  showExplanation?: boolean;
}

export const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent,
  onOptionSelect,
  selectedOption,
  showExplanation = false
}) => {
  const renderDefaultOptions = () => {
    const terms = extractTerms(messageContent);
    const defaultOptions = [
      { id: "A", text: `É um ${terms[0 % terms.length]} fundamental para compreensão do tema.` },
      { id: "B", text: `Representa uma abordagem inovadora sobre o ${terms[1 % terms.length]}.` },
      { id: "C", text: `Demonstra a aplicação prática do ${terms[2 % terms.length]} em contextos reais.` },
      { id: "D", text: `Exemplifica como o ${terms[3 % terms.length]} pode ser utilizado em diferentes situações.` }
    ];

    return defaultOptions.map(option => (
      <div 
        key={option.id}
        className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
          selectedOption === option.id ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700' : ''
        }`}
        onClick={() => onOptionSelect(option.id)}
      >
        <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${
          selectedOption === option.id 
            ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
            : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
        }`}>
          <span className="text-xs font-medium">{option.id}</span>
        </div>
        <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
      </div>
    ));
  };

  const renderGeneratedOptions = () => {
    if (!selectedQuestion || !selectedQuestion.options) {
      return renderDefaultOptions();
    }

    return selectedQuestion.options.map((option: any, idx: number) => {
      const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
      const letter = letters[idx % letters.length];

      // Verificar se esta opção é a correta
      const isCorrect = option.isCorrect === true;
      // Mostrar a resposta correta apenas se o usuário clicou em "Ver resposta"
      const showCorrectAnswer = showExplanation && selectedOption !== null;

      return (
        <div 
          key={option.id}
          className={`flex items-center space-x-2 p-2 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 ${
            selectedOption === letter 
              ? 'bg-blue-50 dark:bg-blue-900/20 border border-blue-300 dark:border-blue-700' 
              : ''
          } ${
            showCorrectAnswer && isCorrect 
              ? 'bg-green-50 dark:bg-green-900/20 border border-green-300 dark:border-green-700' 
              : ''
          }`}
          onClick={() => onOptionSelect(letter)}
        >
          <div className={`flex items-center justify-center w-6 h-6 rounded-full border ${
            selectedOption === letter 
              ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' 
              : showCorrectAnswer && isCorrect
                ? 'border-green-500 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300'
                : 'border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800'
          }`}>
            <span className="text-xs font-medium">{letter}</span>
          </div>
          <span className="text-sm text-gray-700 dark:text-gray-300">{option.text}</span>
        </div>
      );
    });
  };

  // Questões padrão por tipo (para fallback)
  const multipleChoiceQuestions = [
    "Qual é o principal conceito abordado no texto?",
    "De acordo com o conteúdo, qual alternativa está correta?",
    "Qual das seguintes afirmações melhor representa o tema estudado?",
    "Baseado no texto, qual opção descreve corretamente o assunto?",
    "Considerando o material apresentado, qual item é verdadeiro?",
    "Com base na explicação, qual é a melhor definição para o tema?"
  ];

  const questionContent = selectedQuestion 
    ? selectedQuestion.text 
    : multipleChoiceQuestions[(questionNumber - 1) % multipleChoiceQuestions.length];

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionContent}
      </p>
      <div className="mt-4 space-y-3">
        {selectedQuestion ? renderGeneratedOptions() : renderDefaultOptions()}
      </div>
    </div>
  );
};