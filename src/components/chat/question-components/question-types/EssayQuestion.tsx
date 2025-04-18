
import React from "react";

interface EssayQuestionProps {
  selectedQuestion: any;
  questionNumber: number;
  messageContent: string;
}

export const EssayQuestion: React.FC<EssayQuestionProps> = ({
  selectedQuestion,
  questionNumber,
  messageContent
}) => {
  // Questões padrão por tipo (para fallback)
  const essayQuestions = [
    "Explique com suas palavras os principais aspectos do tema apresentado.",
    "Disserte sobre a importância deste conteúdo para sua área de estudo.",
    "Descreva como você aplicaria estes conceitos em uma situação prática.",
    "Elabore uma análise crítica sobre o tema abordado.",
    "Compare os diferentes aspectos apresentados no material."
  ];

  const questionContent = selectedQuestion 
    ? selectedQuestion.text 
    : essayQuestions[(questionNumber - 1) % essayQuestions.length];

  return (
    <div>
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {questionContent}
      </p>
      <div className="mt-4">
        <textarea 
          placeholder="Digite sua resposta aqui..." 
          className="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"
        ></textarea>
      </div>
    </div>
  );
};
