
import React, { useEffect, useState } from "react";
import { extractKeyTopics, generatePersonalizedQuestions } from "./questionUtils";

interface QuestionsResultsModalProps {
  totalQuestions: number;
  multipleChoice: number;
  essay: number;
  trueFalse: number;
  messageContent: string;
  questionsData: any[];
  onClose: () => void;
}

const QuestionsResultsModal: React.FC<QuestionsResultsModalProps> = ({
  totalQuestions,
  multipleChoice,
  essay,
  trueFalse,
  messageContent,
  questionsData,
  onClose
}) => {
  const [showExportOptions, setShowExportOptions] = useState(false);
  
  const handleExportClick = () => {
    setShowExportOptions(prev => !prev);
  };
  useEffect(() => {
    // Adicionar event listeners quando o componente for montado
    const closeButton = document.getElementById('close-results-modal');
    const doneButton = document.getElementById('done-button');
    const myProgressButton = document.getElementById('my-progress-button');
    const exportQuestionsButton = document.getElementById('export-questions-button');
    const modal = document.getElementById('questions-results-modal');

    const handleModalClose = () => {
      onClose();
    };

    const handleMyProgressClick = () => {
      // Redirecionar para a aba "Meu Progresso"
      window.location.href = '/meu-progresso';
    };

    if (closeButton) {
      closeButton.addEventListener('click', handleModalClose);
    }

    if (doneButton) {
      doneButton.addEventListener('click', handleModalClose);
    }

    if (myProgressButton) {
      myProgressButton.addEventListener('click', handleMyProgressClick);
    }
    
    if (exportQuestionsButton) {
      exportQuestionsButton.addEventListener('click', handleExportClick);
    }

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleModalClose();
        }
        if (showExportOptions) {
          setShowExportOptions(false);
        }
      });
    }

    // Limpar os event listeners quando o componente for desmontado
    return () => {
      if (closeButton) {
        closeButton.removeEventListener('click', handleModalClose);
      }
      if (doneButton) {
        doneButton.removeEventListener('click', handleModalClose);
      }
      if (myProgressButton) {
        myProgressButton.removeEventListener('click', handleMyProgressClick);
      }
      if (exportQuestionsButton) {
        exportQuestionsButton.removeEventListener('click', handleExportClick);
      }
      if (modal) {
        modal.removeEventListener('click', handleModalClose);
      }
    };
  }, [onClose]);

  // Gerar os mini-cards das questões
  const generateQuestionCards = () => {
    let cardsHTML = '';

    // Verificar se temos questões geradas pela IA
    const hasGeneratedQuestions = Array.isArray(questionsData) && questionsData.length > 0;

    // Questões padronizadas como fallback
    const defaultQuestions = {
      'multiple-choice': [
        "Qual é o principal conceito abordado no texto?",
        "De acordo com o conteúdo, qual alternativa está correta?",
        "Qual das seguintes afirmações melhor representa o tema estudado?",
        "Baseado no texto, qual opção descreve corretamente o assunto?",
        "Considerando o material apresentado, qual item é verdadeiro?",
        "Com base na explicação, qual é a melhor definição para o tema?"
      ],
      'essay': [
        "Explique com suas palavras os principais aspectos do tema apresentado.",
        "Disserte sobre a importância deste conteúdo para sua área de estudo.",
        "Descreva como você aplicaria estes conceitos em uma situação prática.",
        "Elabore uma análise crítica sobre o tema abordado.",
        "Compare os diferentes aspectos apresentados no material."
      ],
      'true-false': [
        "Os conceitos apresentados são aplicáveis apenas em contextos teóricos.",
        "Este tema é considerado fundamental na área de estudo.",
        "Existem diferentes abordagens para este assunto.",
        "A aplicação prática deste conteúdo é limitada.",
        "Os princípios discutidos são universalmente aceitos na comunidade acadêmica."
      ]
    };

    const keyTopics = extractKeyTopics(messageContent);

    // Usar questões personalizadas se tiver tópicos-chave, senão usar as padrões
    const multipleChoiceQuestions = keyTopics.length > 2 
      ? generatePersonalizedQuestions(keyTopics, 'multiple-choice') 
      : defaultQuestions['multiple-choice'];

    const essayQuestions = keyTopics.length > 2 
      ? generatePersonalizedQuestions(keyTopics, 'essay') 
      : defaultQuestions['essay'];

    const trueFalseQuestions = keyTopics.length > 2 
      ? generatePersonalizedQuestions(keyTopics, 'true-false') 
      : defaultQuestions['true-false'];

    // Contador global de questões
    let questionCounter = 1;

    // Filtrar questões por tipo
    const multipleChoiceQuestionsFromAI = hasGeneratedQuestions 
      ? questionsData.filter(q => q.type === 'multiple-choice').slice(0, multipleChoice)
      : [];

    const essayQuestionsFromAI = hasGeneratedQuestions 
      ? questionsData.filter(q => q.type === 'essay' || q.type === 'discursive').slice(0, essay)
      : [];

    const trueFalseQuestionsFromAI = hasGeneratedQuestions 
      ? questionsData.filter(q => q.type === 'true-false' || q.type === 'verdadeiro-falso').slice(0, trueFalse)
      : [];

    // Gerar cards de múltipla escolha
    const mcCount = multipleChoiceQuestionsFromAI.length > 0 ? multipleChoiceQuestionsFromAI.length : multipleChoice;
    for (let i = 0; i < mcCount; i++) {
      if (questionCounter <= totalQuestions) {
        let questionText = '';

        if (multipleChoiceQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          questionText = multipleChoiceQuestionsFromAI[i].text;
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % multipleChoiceQuestions.length;
          questionText = multipleChoiceQuestions[questionIndex];
        }

        cardsHTML += `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer" 
               onclick="window.showQuestionDetails('multiple-choice', ${questionCounter})">
            <div class="flex justify-between items-start mb-2">
              <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${questionCounter}</h4>
              <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Múltipla escolha</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
              ${questionText}
            </p>
          </div>
        `;
        questionCounter++;
      }
    }

    // Gerar cards de questões discursivas
    const essayCount = essayQuestionsFromAI.length > 0 ? essayQuestionsFromAI.length : essay;
    for (let i = 0; i < essayCount; i++) {
      if (questionCounter <= totalQuestions) {
        let questionText = '';

        if (essayQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          questionText = essayQuestionsFromAI[i].text;
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % essayQuestions.length;
          questionText = essayQuestions[questionIndex];
        }

        cardsHTML += `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer"
               onclick="window.showQuestionDetails('essay', ${questionCounter})">
            <div class="flex justify-between items-start mb-2">
              <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${questionCounter}</h4>
              <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
              ${questionText}
            </p>
          </div>
        `;
        questionCounter++;
      }
    }

    // Gerar cards de verdadeiro ou falso
    const tfCount = trueFalseQuestionsFromAI.length > 0 ? trueFalseQuestionsFromAI.length : trueFalse;
    for (let i = 0; i < tfCount; i++) {
      if (questionCounter <= totalQuestions) {
        let questionText = '';

        if (trueFalseQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          questionText = trueFalseQuestionsFromAI[i].text;
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % trueFalseQuestions.length;
          questionText = trueFalseQuestions[questionIndex];
        }

        cardsHTML += `
          <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer"
               onclick="window.showQuestionDetails('true-false', ${questionCounter})">
            <div class="flex justify-between items-start mb-2">
              <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${questionCounter}</h4>
              <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>
            </div>
            <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
              ${questionText}
            </p>
          </div>
        `;
        questionCounter++;
      }
    }

    return cardsHTML;
  };

  return (
    <div id="questions-results-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-4xl max-h-[80vh] animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Questões Geradas
          </h3>
          <button 
            id="close-results-modal"
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
        </div>

        <div className="overflow-y-auto max-h-[calc(80vh-120px)] p-2">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" 
               id="questions-container"
               dangerouslySetInnerHTML={{ __html: generateQuestionCards() }}>
          </div>
        </div>

        <div className="mt-4 flex justify-end gap-3">
          <div className="relative">
            <button 
              id="export-questions-button"
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar Questões
            </button>
            
            {showExportOptions && (
              <div className="absolute right-0 bottom-12 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 w-48 py-1 z-50 animate-fadeIn">
                <button className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 opacity-70 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                  Exportar em PDF
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 opacity-70 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 22h14a2 2 0 0 0 2-2V7.5L14.5 2H6a2 2 0 0 0-2 2v4"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <path d="M2 15h10"></path>
                    <path d="M9 18l3-3-3-3"></path>
                  </svg>
                  Exportar para Word
                </button>
                <button className="w-full px-4 py-2 text-sm text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center gap-2 opacity-70 cursor-not-allowed">
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3Z"></path>
                  </svg>
                  Exportar em Bloco de Notas
                </button>
              </div>
            )}
          </div>
          <button 
            id="my-progress-button"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 12h-4l-3 9L9 3l-3 9H2"></path>
            </svg>
            Meu Progresso
          </button>
          <button 
            id="done-button"
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium"
          >
            Concluído
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionsResultsModal;
