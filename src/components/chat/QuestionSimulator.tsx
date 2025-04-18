
import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { generateAIResponse } from "@/services/aiChatService";

interface QuestionSimulatorProps {
  onClose: () => void;
  sessionId: string;
  messages: any[];
}

const QuestionSimulator: React.FC<QuestionSimulatorProps> = ({ onClose, sessionId, messages }) => {
  const [isLoading, setIsLoading] = useState(false);

  // Função para gerar questões de prova
  const generateExamQuestions = async (totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number) => {
    setIsLoading(true);

    try {
      // Encontrar a última mensagem do assistente para usar como contexto
      const lastAIMessage = messages
        .filter(msg => msg.sender === 'assistant')
        .pop();
        
      const messageContent = lastAIMessage?.content || 'Conteúdo sobre o tema estudado';

      // Analisar a resposta que a IA gerou e o contexto da pergunta
      const analysisPrompt = `
      Analise a seguinte conversa:
      
      Minha resposta anterior: "${messageContent}"
      
      Com base nesta resposta e no contexto da conversa, gere ${totalQuestions} questões de avaliação, sendo:
      - ${multipleChoice} questões de múltipla escolha
      - ${essay} questões discursivas
      - ${trueFalse} questões de verdadeiro ou falso
      
      As questões devem avaliar os conceitos principais abordados na conversa e estar diretamente relacionadas ao tema.
      Formate a saída em JSON com a seguinte estrutura:
      [
        {
          "id": "q1",
          "type": "multiple-choice",
          "text": "Enunciado da pergunta",
          "options": [
            { "id": "q1-a", "text": "Alternativa A", "isCorrect": false },
            { "id": "q1-b", "text": "Alternativa B", "isCorrect": true },
            { "id": "q1-c", "text": "Alternativa C", "isCorrect": false },
            { "id": "q1-d", "text": "Alternativa D", "isCorrect": false }
          ],
          "explanation": "Explicação da resposta correta"
        }
      ]
      `;

      // Chamar a API para gerar as questões
      const questionsResponse = await generateAIResponse(
        analysisPrompt,
        sessionId || 'default_session',
        {
          intelligenceLevel: 'advanced',
          languageStyle: 'formal'
        }
      );

      // Criar função global para mostrar detalhes das questões
      window.showQuestionDetails = (questionType, questionNumber) => {
        showQuestionDetailModal(questionType, questionNumber, totalQuestions, multipleChoice, essay, trueFalse, messageContent);
      };

      // Criar o modal de resultados
      showResultsModal(totalQuestions, multipleChoice, essay, trueFalse, messageContent);

    } catch (error) {
      console.error('Erro ao gerar questões de prova:', error);
      toast({
        title: "Erro ao gerar questões",
        description: "Ocorreu um problema ao gerar as questões da prova.",
        variant: "destructive",
        duration: 3000,
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para mostrar o modal de detalhes da questão
  const showQuestionDetailModal = (questionType: string, questionNumber: number, totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number, messageContent: string) => {
    // Remover qualquer modal de detalhes de questão existente
    const existingDetailModal = document.getElementById('question-detail-modal');
    if (existingDetailModal) {
      existingDetailModal.remove();
    }
    
    // Determinar o título e conteúdo com base no tipo de questão e no contexto da mensagem
    let questionTitle = `Questão ${questionNumber}`;
    let questionTag = '';
    let questionContent = '';
    let questionOptions = '';
    
    // Questões de múltipla escolha
    const multipleChoiceQuestions = [
      "Qual é o principal conceito abordado no texto?",
      "De acordo com o conteúdo, qual alternativa está correta?",
      "Qual das seguintes afirmações melhor representa o tema estudado?",
      "Baseado no texto, qual opção descreve corretamente o assunto?",
      "Considerando o material apresentado, qual item é verdadeiro?",
      "Com base na explicação, qual é a melhor definição para o tema?"
    ];
    
    // Questões discursivas
    const essayQuestions = [
      "Explique com suas palavras os principais aspectos do tema apresentado.",
      "Disserte sobre a importância deste conteúdo para sua área de estudo.",
      "Descreva como você aplicaria estes conceitos em uma situação prática.",
      "Elabore uma análise crítica sobre o tema abordado.",
      "Compare os diferentes aspectos apresentados no material."
    ];
    
    // Questões de verdadeiro ou falso
    const trueFalseQuestions = [
      "Os conceitos apresentados são aplicáveis apenas em contextos teóricos.",
      "Este tema é considerado fundamental na área de estudo.",
      "Existem diferentes abordagens para este assunto.",
      "A aplicação prática deste conteúdo é limitada.",
      "Os princípios discutidos são universalmente aceitos na comunidade acadêmica."
    ];
    
    // Extrai possíveis termos e conceitos do conteúdo
    const extractTerms = (content: string) => {
      const terms: string[] = [];
      const words = content.split(/\s+/);
      for (let i = 0; i < words.length; i++) {
        if (words[i].length > 5 && /^[A-Z]/.test(words[i])) {
          terms.push(words[i].replace(/[,.;:?!]$/g, ''));
        }
      }
      return terms.length > 0 ? terms : ["conceito", "tema", "assunto", "método", "técnica"];
    };
    
    const terms = extractTerms(messageContent);
    
    if (questionType === 'multiple-choice') {
      questionTag = '<span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Múltipla escolha</span>';
      
      // Usar uma das questões pré-definidas ou gerar uma baseada no contexto
      const questionIndex = (questionNumber - 1) % multipleChoiceQuestions.length;
      questionContent = multipleChoiceQuestions[questionIndex];
      
      // Gerar alternativas baseadas no contexto
      questionOptions = `
        <div class="mt-4 space-y-3">
          <div class="flex items-center space-x-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <span class="text-xs font-medium">A</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">É um ${terms[0 % terms.length]} fundamental para compreensão do tema.</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <span class="text-xs font-medium">B</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Representa uma abordagem inovadora sobre o ${terms[1 % terms.length]}.</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <span class="text-xs font-medium">C</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Demonstra a aplicação prática do ${terms[2 % terms.length]} em contextos reais.</span>
          </div>
          <div class="flex items-center space-x-2">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
              <span class="text-xs font-medium">D</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Exemplifica como o ${terms[3 % terms.length]} pode ser utilizado em diferentes situações.</span>
          </div>
        </div>
      `;
    } else if (questionType === 'essay') {
      questionTag = '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>';
      
      // Usar uma das questões pré-definidas ou gerar uma baseada no contexto
      const questionIndex = (questionNumber - 1) % essayQuestions.length;
      questionContent = essayQuestions[questionIndex];
      
      questionOptions = `
        <div class="mt-4">
          <textarea placeholder="Digite sua resposta aqui..." class="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
        </div>
      `;
    } else if (questionType === 'true-false') {
      questionTag = '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>';
      
      // Usar uma das questões pré-definidas ou gerar uma baseada no contexto
      const questionIndex = (questionNumber - 1) % trueFalseQuestions.length;
      questionContent = trueFalseQuestions[questionIndex];
      
      questionOptions = `
        <div class="mt-4 space-y-3">
          <div class="flex items-center space-x-4">
            <button class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Verdadeiro
            </button>
            <button class="px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
              Falso
            </button>
          </div>
        </div>
      `;
    }
    
    // Criar HTML para o modal de detalhes da questão
    const detailModalHTML = `
      <div id="question-detail-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-xl animate-fadeIn">
          <div class="flex justify-between items-center mb-4">
            <div class="flex flex-col">
              <div class="flex items-center gap-2">
                <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-200">
                  ${questionTitle}
                </h3>
                ${questionTag}
              </div>
              <p class="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Baseado no conteúdo estudado
              </p>
            </div>
            <button 
              id="close-detail-modal"
              class="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
          
          <div class="border-t border-b border-gray-200 dark:border-gray-700 py-4 my-2">
            <p class="text-sm text-gray-700 dark:text-gray-300">
              ${questionContent}
            </p>
            ${questionOptions}
          </div>
          
          <div class="flex justify-between mt-4">
            <button 
              id="back-to-list-button"
              class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
              Voltar para lista
            </button>
            
            <div class="flex gap-2">
              <button 
                id="prev-question-button" 
                class="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg text-sm font-medium transition-colors flex items-center"
                ${questionNumber === 1 ? 'disabled style="opacity: 0.5; cursor: not-allowed;"' : ''}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="15 18 9 12 15 6"></polyline>
                </svg>
                Anterior
              </button>
              
              <button 
                id="next-question-button" 
                class="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center"
              >
                Próxima
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="9 18 15 12 9 6"></polyline>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    // Adicionar o modal ao DOM
    document.body.insertAdjacentHTML('beforeend', detailModalHTML);
    
    // Adicionar event listeners ao modal de detalhes
    setTimeout(() => {
      const detailModal = document.getElementById('question-detail-modal');
      const closeDetailButton = document.getElementById('close-detail-modal');
      const backToListButton = document.getElementById('back-to-list-button');
      const prevQuestionButton = document.getElementById('prev-question-button');
      const nextQuestionButton = document.getElementById('next-question-button');
      
      // Função para fechar o modal de detalhes
      const closeDetailModal = () => {
        if (detailModal) {
          detailModal.classList.add('animate-fadeOut');
          setTimeout(() => detailModal.remove(), 200);
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
      if (prevQuestionButton && questionNumber > 1) {
        prevQuestionButton.addEventListener('click', () => {
          closeDetailModal();
          // Determinar o tipo da questão anterior com base no número
          let prevType = questionType;
          let prevNumber = questionNumber - 1;
          
          if (questionType === 'true-false' && prevNumber === multipleChoice + essay) {
            prevType = 'essay';
          } else if (questionType === 'essay' && prevNumber === multipleChoice) {
            prevType = 'multiple-choice';
          }
          
          // Mostrar a questão anterior
          setTimeout(() => {
            window.showQuestionDetails(prevType, prevNumber);
          }, 210);
        });
      }
      
      // Event listener para o botão de próxima questão
      if (nextQuestionButton) {
        nextQuestionButton.addEventListener('click', () => {
          const totalQuestionsCount = multipleChoice + essay + trueFalse;
          
          if (questionNumber < totalQuestionsCount) {
            closeDetailModal();
            // Determinar o tipo da próxima questão com base no número
            let nextType = questionType;
            let nextNumber = questionNumber + 1;
            
            if (questionType === 'multiple-choice' && nextNumber > multipleChoice) {
              nextType = 'essay';
            } else if (questionType === 'essay' && nextNumber > multipleChoice + essay) {
              nextType = 'true-false';
            }
            
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
    }, 50);
  };

  // Função para mostrar o modal de resultados com questões geradas
  const showResultsModal = (totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number, messageContent: string) => {
    // Função para gerar os mini-cards das questões
    const generateQuestionCards = (total: number, multipleChoice: number, essay: number, trueFalse: number) => {
      let cardsHTML = '';
      
      // Questões de múltipla escolha
      const multipleChoiceQuestions = [
        "Qual é o principal conceito abordado no texto?",
        "De acordo com o conteúdo, qual alternativa está correta?",
        "Qual das seguintes afirmações melhor representa o tema estudado?",
        "Baseado no texto, qual opção descreve corretamente o assunto?",
        "Considerando o material apresentado, qual item é verdadeiro?",
        "Com base na explicação, qual é a melhor definição para o tema?"
      ];
      
      // Questões discursivas
      const essayQuestions = [
        "Explique com suas palavras os principais aspectos do tema apresentado.",
        "Disserte sobre a importância deste conteúdo para sua área de estudo.",
        "Descreva como você aplicaria estes conceitos em uma situação prática.",
        "Elabore uma análise crítica sobre o tema abordado.",
        "Compare os diferentes aspectos apresentados no material."
      ];
      
      // Questões de verdadeiro ou falso
      const trueFalseQuestions = [
        "Os conceitos apresentados são aplicáveis apenas em contextos teóricos.",
        "Este tema é considerado fundamental na área de estudo.",
        "Existem diferentes abordagens para este assunto.",
        "A aplicação prática deste conteúdo é limitada.",
        "Os princípios discutidos são universalmente aceitos na comunidade acadêmica."
      ];
      
      // Gerar cards de múltipla escolha
      for (let i = 0; i < multipleChoice; i++) {
        if (i < total) {
          const questionIndex = i % multipleChoiceQuestions.length;
          cardsHTML += `
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer" 
                 onclick="showQuestionDetails('multiple-choice', ${i + 1})">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${i + 1}</h4>
                <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full">Múltipla escolha</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                ${multipleChoiceQuestions[questionIndex]}
              </p>
            </div>
          `;
        }
      }
      
      // Gerar cards de questões discursivas
      for (let i = 0; i < essay; i++) {
        if (i + multipleChoice < total) {
          const questionIndex = i % essayQuestions.length;
          cardsHTML += `
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer"
                 onclick="showQuestionDetails('essay', ${i + multipleChoice + 1})">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${i + multipleChoice + 1}</h4>
                <span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                ${essayQuestions[questionIndex]}
              </p>
            </div>
          `;
        }
      }
      
      // Gerar cards de verdadeiro ou falso
      for (let i = 0; i < trueFalse; i++) {
        if (i + multipleChoice + essay < total) {
          const questionIndex = i % trueFalseQuestions.length;
          cardsHTML += `
            <div class="bg-white dark:bg-gray-700 rounded-lg shadow-md border border-gray-200 dark:border-gray-600 p-3 hover:shadow-lg transition-shadow cursor-pointer"
                 onclick="showQuestionDetails('true-false', ${i + multipleChoice + essay + 1})">
              <div class="flex justify-between items-start mb-2">
                <h4 class="text-sm font-medium text-gray-800 dark:text-gray-200">Questão ${i + multipleChoice + essay + 1}</h4>
                <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>
              </div>
              <p class="text-xs text-gray-600 dark:text-gray-300 line-clamp-3">
                ${trueFalseQuestions[questionIndex]}
              </p>
            </div>
          `;
        }
      }
      
      return cardsHTML;
    };

    // Criar o modal de resultado com mini-cards
    const resultsModalHTML = `
      <div id="questions-results-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
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
              ${generateQuestionCards(totalQuestions, multipleChoice, essay, trueFalse)}
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
      </div>
    `;

    // Remover qualquer modal de resultados existente
    const existingResultsModal = document.getElementById('questions-results-modal');
    if (existingResultsModal) {
      existingResultsModal.remove();
    }
    
    // Adicionar o modal de resultados ao DOM
    document.body.insertAdjacentHTML('beforeend', resultsModalHTML);
    
    // Adicionar event listeners ao modal de resultados
    setTimeout(() => {
      const resultsModal = document.getElementById('questions-results-modal');
      const closeResultsButton = document.getElementById('close-results-modal');
      const doneButton = document.getElementById('done-button');
      
      // Função para fechar o modal de resultados
      const closeResultsModal = () => {
        if (resultsModal) {
          resultsModal.classList.add('animate-fadeOut');
          setTimeout(() => resultsModal.remove(), 200);
        }
      };
      
      // Event listener para fechar o modal
      if (closeResultsButton) {
        closeResultsButton.addEventListener('click', closeResultsModal);
      }
      
      // Event listener para o botão de concluído
      if (doneButton) {
        doneButton.addEventListener('click', closeResultsModal);
      }
      
      // Event listener para clicar fora e fechar
      if (resultsModal) {
        resultsModal.addEventListener('click', (e) => {
          if (e.target === resultsModal) {
            closeResultsModal();
          }
        });
      }
    }, 50);
  };

  return (
    <div id="see-questions-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Ver possíveis questões
          </h3>
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
        
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Quantidade total de questões
            </label>
            <input 
              id="total-questions-input"
              type="number" 
              min="1" 
              max="50" 
              defaultValue="10"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Tipos de questões
            </label>
            <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Múltipla escolha</span>
                <input 
                  id="multiple-choice-input"
                  type="number" 
                  min="0" 
                  defaultValue="6"
                  className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Discursivas</span>
                <input 
                  id="essay-input"
                  type="number" 
                  min="0" 
                  defaultValue="2"
                  className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Verdadeiro ou Falso</span>
                <input 
                  id="true-false-input"
                  type="number" 
                  min="0" 
                  defaultValue="2"
                  className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
                />
              </div>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
              Competências BNCC (opcional)
            </label>
            <select 
              id="bncc-select"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option>Selecione uma competência</option>
              <option>Competência 1 - Conhecimento</option>
              <option>Competência 2 - Pensamento científico</option>
              <option>Competência 3 - Repertório cultural</option>
              <option>Competência 4 - Comunicação</option>
              <option>Competência 5 - Cultura digital</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={() => {
            const totalQuestionsInput = document.getElementById('total-questions-input') as HTMLInputElement;
            const multipleChoiceInput = document.getElementById('multiple-choice-input') as HTMLInputElement;
            const essayInput = document.getElementById('essay-input') as HTMLInputElement;
            const trueFalseInput = document.getElementById('true-false-input') as HTMLInputElement;
            
            // Pegar valores dos inputs
            const totalQuestions = parseInt(totalQuestionsInput?.value || '10');
            const multipleChoice = parseInt(multipleChoiceInput?.value || '6');
            const essay = parseInt(essayInput?.value || '2');
            const trueFalse = parseInt(trueFalseInput?.value || '2');
            
            // Gerar questões
            generateExamQuestions(totalQuestions, multipleChoice, essay, trueFalse);
          }}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <svg className="animate-spin h-4 w-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Gerando Questões...
            </>
          ) : (
            <>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Gerar Questões
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default QuestionSimulator;
