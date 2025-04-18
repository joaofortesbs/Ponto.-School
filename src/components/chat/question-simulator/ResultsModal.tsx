
import React from "react";

type Question = {
  id: string;
  type: string;
  text: string;
  options?: any[];
  explanation?: string;
};

interface ResultsModalProps {
  totalQuestions: number;
  multipleChoice: number;
  essay: number;
  trueFalse: number;
  messageContent: string;
  questionsData: Question[];
  onClose: () => void;
}

const ResultsModal: React.FC<ResultsModalProps> = ({ 
  totalQuestions, 
  multipleChoice, 
  essay, 
  trueFalse, 
  messageContent, 
  questionsData, 
  onClose 
}) => {
  // Função para gerar os mini-cards das questões
  const generateQuestionCards = () => {
    let cardsHTML = '';

    // Verificar se temos questões geradas pela IA
    const hasGeneratedQuestions = Array.isArray(questionsData) && questionsData.length > 0;

    // Tentar extrair informações relevantes do conteúdo para gerar questões personalizadas (fallback)
    const extractKeyTopics = (content: string) => {
      // Encontrar títulos ou palavras-chave em negrito
      const boldPattern = /\*\*(.*?)\*\*/g;
      const headingPattern = /^#+\s+(.+)$/gm;

      let matches = [];
      let match;

      // Extrair texto em negrito
      while ((match = boldPattern.exec(content)) !== null) {
        if (match[1].length > 3) {
          matches.push(match[1]);
        }
      }

      // Extrair títulos
      while ((match = headingPattern.exec(content)) !== null) {
        matches.push(match[1]);
      }

      // Se não encontrou suficientes, extrair frases iniciais de parágrafos
      if (matches.length < 5) {
        const paragraphs = content.split('\n\n');
        paragraphs.forEach(p => {
          const firstSentence = p.split('.')[0];
          if (firstSentence && firstSentence.length > 15 && firstSentence.length < 100) {
            matches.push(firstSentence);
          }
        });
      }

      return matches.slice(0, 10); // Limitar a 10 tópicos
    };

    // Questões personalizadas baseadas no conteúdo (fallback)
    const generatePersonalizedQuestions = (topics: string[], type: string) => {
      const questions = [];

      if (type === 'multiple-choice') {
        topics.forEach((topic) => {
          questions.push(`Qual é o principal aspecto de ${topic} abordado no texto?`);
          questions.push(`De acordo com o conteúdo, qual alternativa sobre ${topic} está correta?`);
          questions.push(`Qual das seguintes afirmações relacionadas a ${topic} é verdadeira?`);
        });
      } else if (type === 'essay') {
        topics.forEach((topic) => {
          questions.push(`Disserte sobre a importância de ${topic} no contexto apresentado.`);
          questions.push(`Explique como ${topic} se relaciona com outros conceitos do material.`);
          questions.push(`Elabore uma análise crítica sobre ${topic} e suas aplicações.`);
        });
      } else if (type === 'true-false') {
        topics.forEach((topic) => {
          questions.push(`${topic} pode ser aplicado em múltiplos contextos diferentes.`);
          questions.push(`A teoria apresentada sobre ${topic} é universalmente aceita na comunidade acadêmica.`);
          questions.push(`As limitações de ${topic} foram claramente abordadas no material.`);
        });
      }

      return questions;
    };

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

  React.useEffect(() => {
    // Adicionar event listeners quando o componente montar
    setTimeout(() => {
      const closeResultsButton = document.getElementById('close-results-modal');
      const doneButton = document.getElementById('done-button');

      if (closeResultsButton) {
        closeResultsButton.addEventListener('click', onClose);
      }

      if (doneButton) {
        doneButton.addEventListener('click', onClose);
      }

      const resultsModal = document.getElementById('questions-results-modal');
      if (resultsModal) {
        resultsModal.addEventListener('click', (e) => {
          if (e.target === resultsModal) {
            onClose();
          }
        });
      }
    }, 50);
  }, [onClose]);

  return (
    <div id="questions-results-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]" 
         dangerouslySetInnerHTML={{ 
           __html: `
            <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-4xl max-h-[80vh] animate-fadeIn">
              <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-orange-500">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                  </svg>
                  Questões Geradas
                </h3>
                <button 
                  id="close-results-modal"
                  class="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M18 6 6 18"></path>
                    <path d="m6 6 12 12"></path>
                  </svg>
                </button>
              </div>

              <div class="overflow-y-auto max-h-[calc(80vh-120px)] p-2">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4" id="questions-container">
                  ${generateQuestionCards()}
                </div>
              </div>

              <div class="mt-4 flex justify-end gap-3">
                <button 
                  id="export-questions-button"
                  class="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                    <polyline points="7 10 12 15 17 10"></polyline>
                    <line x1="12" y1="15" x2="12" y2="3"></line>
                  </svg>
                  Exportar Questões
                </button>
                <button 
                  id="done-button"
                  class="px-4 py-2 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg text-sm font-medium"
                >
                  Concluído
                </button>
              </div>
            </div>
           `
         }}
    />
  );
};

export default ResultsModal;
