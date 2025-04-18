import React, { useState, useEffect } from "react";
import { MultipleChoiceQuestion } from "./question-types/MultipleChoiceQuestion";
import { EssayQuestion } from "./question-types/EssayQuestion";
import { TrueFalseQuestion } from "./question-types/TrueFalseQuestion";

interface QuestionDetailModalProps {
  questionType: string;
  questionNumber: number;
  totalQuestions: number;
  multipleChoice: number;
  essay: number;
  trueFalse: number;
  messageContent: string;
  questionsData: any[];
  onClose: () => void;
}

const QuestionDetailModal: React.FC<QuestionDetailModalProps> = ({
  questionType,
  questionNumber,
  totalQuestions,
  multipleChoice,
  essay,
  trueFalse,
  messageContent,
  questionsData,
  onClose
}) => {
  const [showExplanation, setShowExplanation] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Determinar o título e conteúdo com base no tipo de questão e no contexto da mensagem
  let questionTitle = `Questão ${questionNumber}`;
  let questionTag = '';
  let questionExplanation = '';

  // Verificar se temos questões geradas pela IA
  const hasGeneratedQuestions = Array.isArray(questionsData) && questionsData.length > 0;

  // Se temos questões geradas, vamos encontrar a questão específica
  let selectedQuestion = null;

  if (hasGeneratedQuestions) {
    // Encontrar a questão correspondente ao número e tipo
    selectedQuestion = questionsData.find((q, index) => {
      // O número da questão começa em 1, por isso (questionNumber - 1) para o índice
      return ((index + 1) === questionNumber) && 
            ((questionType === 'multiple-choice' && q.type === 'multiple-choice') || 
             (questionType === 'essay' && (q.type === 'essay' || q.type === 'discursive')) || 
             (questionType === 'true-false' && (q.type === 'true-false' || q.type === 'verdadeiro-falso')));
    });

    // Se não encontrou pela correspondência exata, pegar pela posição
    if (!selectedQuestion) {
      selectedQuestion = questionsData[questionNumber - 1];
    }
  }


  // Buscar a questão selecionada
  const findSelectedQuestion = () => {
    console.log("Buscando questão:", questionType, questionNumber);
    console.log("Questões disponíveis:", questionsData);

    if (!questionsData || !Array.isArray(questionsData)) {
      console.error("Questões não encontradas ou formato inválido");
      return null;
    }

    // Primeiro, tentar encontrar a questão pelo número diretamente
    // (questionNumber começa em 1, mas array começa em 0)
    const indexBasedQuestion = questionsData[questionNumber - 1];

    // Se a questão existe e corresponde ao tipo, retornar
    if (indexBasedQuestion && (
      (questionType === 'multiple-choice' && indexBasedQuestion.type === 'multiple-choice') ||
      (questionType === 'essay' && indexBasedQuestion.type === 'essay') ||
      (questionType === 'true-false' && indexBasedQuestion.type === 'true-false')
    )) {
      console.log("Questão encontrada pelo índice:", indexBasedQuestion);
      return indexBasedQuestion;
    }

    // Se não encontrou pelo índice direto ou o tipo não corresponde,
    // filtrar todas as questões do tipo desejado
    const typeQuestions = questionsData.filter(q => {
      if (questionType === 'multiple-choice') {
        return q.type === 'multiple-choice' || (q.options && Array.isArray(q.options));
      } else if (questionType === 'essay') {
        return q.type === 'essay' || q.type === 'discursive' || (!q.options && !q.answer);
      } else if (questionType === 'true-false') {
        return q.type === 'true-false' || q.type === 'verdadeiro-falso' || (typeof q.answer === 'boolean');
      }
      return false;
    });

    // Buscar por questões que tenham um texto que inclua o número da questão
    const questionByNumber = questionsData.find(q => 
      q.text && q.text.includes(`${questionNumber}`) || 
      q.id && q.id.includes(`${questionNumber}`)
    );

    if (questionByNumber && questionByNumber.type === questionType) {
      console.log("Questão encontrada pelo número no texto/id:", questionByNumber);
      return questionByNumber;
    }

    // Se existem questões do tipo desejado, pegar pela ordem
    let relativeIndex = 0;
    let countByType = 0;

    // Contar quantas questões de cada tipo já passamos até chegar no questionNumber
    for (let i = 0; i < questionsData.length && i < questionNumber; i++) {
      const q = questionsData[i];
      if ((questionType === 'multiple-choice' && (q.type === 'multiple-choice' || (q.options && Array.isArray(q.options)))) || 
          (questionType === 'essay' && (q.type === 'essay' || q.type === 'discursive' || (!q.options && !q.answer))) ||
          (questionType === 'true-false' && (q.type === 'true-false' || q.type === 'verdadeiro-falso' || (typeof q.answer === 'boolean')))) {
        countByType++;
      }
    }

    // Pegar a questão pelo índice relativo ao tipo
    if (typeQuestions.length > 0 && countByType <= typeQuestions.length) {
      console.log("Questão encontrada pelo tipo e contagem:", typeQuestions[countByType - 1]);
      return typeQuestions[Math.min(countByType - 1, typeQuestions.length - 1)];
    }

    // Se ainda não encontrou, usar a primeira questão do tipo
    if (typeQuestions.length > 0) {
      console.log("Usando primeira questão do tipo:", typeQuestions[0]);
      return typeQuestions[0];
    }

    // Em último caso, criar uma questão fallback
    console.warn(`Questão ${questionNumber} (${questionType}) não encontrada, criando fallback`);

    if (questionType === 'multiple-choice') {
      return {
        id: `q${questionNumber}`,
        type: 'multiple-choice',
        text: `Questão de múltipla escolha ${questionNumber}`,
        options: [
          { id: `q${questionNumber}-a`, text: "Primeira opção", isCorrect: true },
          { id: `q${questionNumber}-b`, text: "Segunda opção", isCorrect: false },
          { id: `q${questionNumber}-c`, text: "Terceira opção", isCorrect: false },
          { id: `q${questionNumber}-d`, text: "Quarta opção", isCorrect: false },
          { id: `q${questionNumber}-e`, text: "Quinta opção", isCorrect: false }
        ],
        explanation: "Explicação para esta questão não disponível."
      };
    } else if (questionType === 'essay') {
      return {
        id: `q${questionNumber}`,
        type: 'essay',
        text: `Questão discursiva ${questionNumber}: Explique com suas palavras os principais conceitos abordados neste tema.`,
        explanation: "Esta questão avalia sua capacidade de explicar o conteúdo com suas próprias palavras."
      };
    } else { // true-false
      return {
        id: `q${questionNumber}`,
        type: 'true-false',
        text: `Afirmação ${questionNumber}: Os conceitos abordados neste tema são aplicáveis em diferentes contextos.`,
        answer: true,
        explanation: "Esta afirmação é verdadeira pois os conceitos fundamentais discutidos possuem aplicações diversas."
      };
    }
  };

  selectedQuestion = findSelectedQuestion();

  useEffect(() => {
    // Adicionar event listeners depois que o componente é montado
    const closeDetailButton = document.getElementById('close-detail-modal');
    const backToListButton = document.getElementById('back-to-list-button');
    const prevQuestionButton = document.getElementById('prev-question-button');
    const nextQuestionButton = document.getElementById('next-question-button');
    const detailModal = document.getElementById('question-detail-modal');

    // Função para fechar o modal de detalhes
    const closeDetailModal = () => {
      if (detailModal) {
        detailModal.classList.add('animate-fadeOut');
        setTimeout(() => onClose(), 200);
      }
    };

    // Função para determinar o tipo de questão com base no número
    const getQuestionTypeByNumber = (num: number) => {
      if (num <= multipleChoice) {
        return 'multiple-choice';
      } else if (num <= multipleChoice + essay) {
        return 'essay';
      } else {
        return 'true-false';
      }
    };

    // Event listener para fechar o modal
    if (closeDetailButton) {
      closeDetailButton.addEventListener('click', closeDetailModal);
    }

    // Event listener para o botão de voltar para a lista
    if (backToListButton) {
      backToListButton.addEventListener('click', closeDetailModal);
    }

    // Event listener para o botão de questão anterior
    if (prevQuestionButton) {
      prevQuestionButton.addEventListener('click', () => {
        if (questionNumber > 1) {
          closeDetailModal();
          const prevNumber = questionNumber - 1;
          const prevType = getQuestionTypeByNumber(prevNumber);

          // Mostrar a questão anterior
          setTimeout(() => {
            window.showQuestionDetails(prevType, prevNumber);
          }, 210);
        }
      });
    }

    // Event listener para o botão de próxima questão
    if (nextQuestionButton) {
      nextQuestionButton.addEventListener('click', () => {
        const totalQuestionsCount = multipleChoice + essay + trueFalse;

        if (questionNumber < totalQuestionsCount) {
          closeDetailModal();
          const nextNumber = questionNumber + 1;
          const nextType = getQuestionTypeByNumber(nextNumber);

          // Mostrar a próxima questão
          setTimeout(() => {
            window.showQuestionDetails(nextType, nextNumber);
          }, 210);
        }
      });
    }

    // Event listener para clicar fora e fechar
    if (detailModal) {
      detailModal.addEventListener('click', (e) => {
        if (e.target === detailModal) {
          closeDetailModal();
        }
      });
    }

    // Limpar os event listeners quando o componente é desmontado
    return () => {
      if (closeDetailButton) {
        closeDetailButton.removeEventListener('click', closeDetailModal);
      }
      if (backToListButton) {
        backToListButton.removeEventListener('click', closeDetailModal);
      }
      if (prevQuestionButton) {
        prevQuestionButton.removeEventListener('click', () => {});
      }
      if (nextQuestionButton) {
        nextQuestionButton.removeEventListener('click', () => {});
      }
      if (detailModal) {
        detailModal.removeEventListener('click', () => {});
      }
    };
  }, [onClose, questionNumber, questionType, multipleChoice, essay, trueFalse]);

  if (questionType === 'multiple-choice') {
    questionTag = '<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Múltipla escolha</span>';
    questionExplanation = selectedQuestion?.explanation || '';
  } else if (questionType === 'essay') {
    questionTag = '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>';
    questionExplanation = selectedQuestion?.explanation || '';
  } else if (questionType === 'true-false') {
    questionTag = '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>';
    questionExplanation = selectedQuestion?.explanation || '';
  }

  // Renderizar o tipo de questão apropriado
  const renderQuestionType = () => {
    if (questionType === 'multiple-choice') {
      return (
        <MultipleChoiceQuestion 
          selectedQuestion={selectedQuestion} 
          questionNumber={questionNumber}
          messageContent={messageContent}
          onOptionSelect={setSelectedOption}
          selectedOption={selectedOption}
          showExplanation={showExplanation}
        />
      );
    } else if (questionType === 'essay') {
      return (
        <EssayQuestion 
          selectedQuestion={selectedQuestion} 
          questionNumber={questionNumber}
          messageContent={messageContent}
        />
      );
    } else if (questionType === 'true-false') {
      return (
        <TrueFalseQuestion 
          selectedQuestion={selectedQuestion} 
          questionNumber={questionNumber}
          messageContent={messageContent}
          onOptionSelect={setSelectedOption}
          selectedOption={selectedOption}
        />
      );
    }
    return null;
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
            id="close-detail-modal"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div className="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-2">
          {renderQuestionType()}

          {selectedOption && (
            <div className="mt-4">
              <button 
                className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Ocultar Explicação' : 'Ver Resposta'}
              </button>
            </div>
          )}

          {showExplanation && selectedOption && (
            <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Explicação:</p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {questionExplanation || "Esta é a resposta correta de acordo com o conteúdo apresentado."}
              </p>
            </div>
          )}
        </div>

        <div className="flex justify-between mt-4">
          <button 
            id="back-to-list-button"
            className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Voltar para lista
          </button>

          <div className="flex gap-2">
            <button 
              id="prev-question-button" 
              className={`px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center ${questionNumber === 1 ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={questionNumber === 1}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Anterior
            </button>

            <button 
              id="next-question-button" 
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

export default QuestionDetailModal;