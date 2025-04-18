
import React from "react";

interface EssayQuestionProps {
  question: {
    text: string;
  };
  questionNumber: number;
}

const EssayQuestion: React.FC<EssayQuestionProps> = ({ question }) => {
  return (
    <div className="mt-4">
      <p className="text-sm text-gray-700 dark:text-gray-300 mb-4">
        {question.text}
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

export default EssayQuestion;
