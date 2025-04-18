
import React from "react";
import MultipleChoiceQuestion from "./question-types/MultipleChoiceQuestion";
import EssayQuestion from "./question-types/EssayQuestion";
import TrueFalseQuestion from "./question-types/TrueFalseQuestion";

type Question = {
  id: string;
  type: string;
  text: string;
  options?: {
    id: string;
    text: string;
    isCorrect: boolean;
  }[];
  explanation?: string;
};

interface QuestionDetailProps {
  questionType: string;
  questionNumber: number;
  totalQuestions: number;
  multipleChoice: number;
  essay: number;
  trueFalse: number;
  questionsData: Question[];
  onClose: () => void;
  onNavigateToQuestion: (type: string, number: number) => void;
}

const QuestionDetail: React.FC<QuestionDetailProps> = ({
  questionType,
  questionNumber,
  totalQuestions,
  multipleChoice,
  essay,
  trueFalse,
  questionsData,
  onClose,
  onNavigateToQuestion
}) => {
  const [selectedQuestion, setSelectedQuestion] = React.useState<Question | null>(null);

  React.useEffect(() => {
    // Encontrar a questão correspondente ao número e tipo
    const question = questionsData.find((q, index) => {
      return ((index + 1) === questionNumber) && 
            ((questionType === 'multiple-choice' && q.type === 'multiple-choice') || 
             (questionType === 'essay' && (q.type === 'essay' || q.type === 'discursive')) || 
             (questionType === 'true-false' && (q.type === 'true-false' || q.type === 'verdadeiro-falso')));
    });

    setSelectedQuestion(question || null);
  }, [questionType, questionNumber, questionsData]);

  // Determinar o título e conteúdo com base no tipo de questão
  let questionTitle = `Questão ${questionNumber}`;
  let questionTag = '';

  if (questionType === 'multiple-choice') {
    questionTag = '<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Múltipla escolha</span>';
  } else if (questionType === 'essay') {
    questionTag = '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>';
  } else if (questionType === 'true-false') {
    questionTag = '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>';
  }

  const handlePrevQuestion = () => {
    if (questionNumber > 1) {
      // Determinar o tipo da questão anterior com base no número
      let prevType = questionType;
      let prevNumber = questionNumber - 1;

      if (questionType === 'true-false' && prevNumber === multipleChoice + essay) {
        prevType = 'essay';
      } else if (questionType === 'essay' && prevNumber === multipleChoice) {
        prevType = 'multiple-choice';
      }

      onNavigateToQuestion(prevType, prevNumber);
    }
  };

  const handleNextQuestion = () => {
    const totalQuestionsCount = multipleChoice + essay + trueFalse;

    if (questionNumber < totalQuestionsCount) {
      // Determinar o tipo da próxima questão com base no número
      let nextType = questionType;
      let nextNumber = questionNumber + 1;

      if (questionType === 'multiple-choice' && nextNumber > multipleChoice) {
        nextType = 'essay';
      } else if (questionType === 'essay' && nextNumber > multipleChoice + essay) {
        nextType = 'true-false';
      }

      onNavigateToQuestion(nextType, nextNumber);
    }
  };

  const renderQuestionContent = () => {
    if (!selectedQuestion) {
      // Fallback para questão padrão se não encontrada
      const defaultQuestion = {
        text: "Questão não encontrada ou ainda não carregada."
      };

      if (questionType === 'multiple-choice') {
        return <MultipleChoiceQuestion question={defaultQuestion} questionNumber={questionNumber} />;
      } else if (questionType === 'essay') {
        return <EssayQuestion question={defaultQuestion} questionNumber={questionNumber} />;
      } else {
        return <TrueFalseQuestion question={defaultQuestion} questionNumber={questionNumber} />;
      }
    }

    if (questionType === 'multiple-choice') {
      return <MultipleChoiceQuestion question={selectedQuestion} questionNumber={questionNumber} />;
    } else if (questionType === 'essay') {
      return <EssayQuestion question={selectedQuestion} questionNumber={questionNumber} />;
    } else {
      return <TrueFalseQuestion question={selectedQuestion} questionNumber={questionNumber} />;
    }
  };

  return (
    <div id="question-detail-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-xl animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <div className="flex flex-col">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                {questionTitle}
              </h3>
              <div dangerouslySetInnerHTML={{ __html: questionTag }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Baseado no conteúdo estudado
            </p>
          </div>
          <button 
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-2">
          {renderQuestionContent()}
        </div>

        <div className="flex justify-between mt-4">
          <button 
            onClick={onClose}
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Voltar para lista
          </button>

          <div className="flex gap-2">
            <button 
              onClick={handlePrevQuestion}
              className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center"
              disabled={questionNumber === 1}
              style={{opacity: questionNumber === 1 ? 0.5 : 1, cursor: questionNumber === 1 ? 'not-allowed' : 'pointer'}}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Anterior
            </button>

            <button 
              onClick={handleNextQuestion}
              className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
            >
              Próxima
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetail;
