import React, { useState, useEffect } from "react";
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

// Definir função global para visualizar progresso
if (typeof window !== 'undefined') {
  window.handleMyProgressClick = () => {
    const progressButton = document.getElementById('my-progress-button');
    if (progressButton) {
      progressButton.click();
    }
  };
}

interface QuizHistory {
  date: Date;
  type: string;
  topic: string;
  totalQuestions: number;
  correctAnswers: number;
  settings: any;
  bnccCompetence?: string;
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
  const [showProgressView, setShowProgressView] = useState(false);
  const [quizHistory, setQuizHistory] = useState<QuizHistory[]>([]);

  useEffect(() => {
    // Adicionar event listeners quando o componente for montado
    const closeButton = document.getElementById('close-results-modal');
    const doneButton = document.getElementById('done-button');
    const myProgressButton = document.getElementById('my-progress-button');
    const modal = document.getElementById('questions-results-modal');

    const handleModalClose = () => {
      onClose();
      setShowProgressView(false); // added to close progress view on main modal close
    };

    const handleMyProgressClick = () => {
      setShowProgressView(true);
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

    if (modal) {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          handleModalClose();
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
      if (modal) {
        modal.removeEventListener('click', handleModalClose);
      }
    };
  }, [onClose]);

  useEffect(() => {
    if (showProgressView && messageContent) {
      const keyTopics = extractKeyTopics(messageContent);
      // Placeholder - Replace with actual API call to fetch quiz history
      const mockHistory: QuizHistory[] = [
          { date: new Date(), type: "Quiz", topic: keyTopics[0] || "Geral", totalQuestions: 10, correctAnswers: 8, settings: {}, bnccCompetence: "EM13MAT301" },
          { date: new Date(Date.now() - 86400000), type: "Quiz", topic: keyTopics[0] || "Geral", totalQuestions: 10, correctAnswers: 6, settings: {}, bnccCompetence: "EM13MAT301" },
          { date: new Date(Date.now() - 172800000), type: "Quiz", topic: keyTopics[0] || "Geral", totalQuestions: 10, correctAnswers: 7, settings: {}, bnccCompetence: "EM13MAT301" }
      ];

      setQuizHistory(mockHistory);
    }
  }, [showProgressView, messageContent]);

  // Gerar os mini-cards das questões
  const generateQuestionCards = () => {
    let cardsHTML = '';

    // Verificar se temos questões geradas pela IA
    const hasGeneratedQuestions = Array.isArray(questionsData) && questionsData.length > 0;
    
    console.log("Questões geradas:", questionsData);

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

    // Filtrar questões por tipo ou usar todas as questões disponíveis
    let multipleChoiceQuestionsFromAI = [];
    let essayQuestionsFromAI = [];
    let trueFalseQuestionsFromAI = [];
    
    if (hasGeneratedQuestions) {
      // Garantir que estamos trabalhando com um array real
      const questionsArray = Array.isArray(questionsData) ? questionsData : [];
      
      // Log para verificar as questões recebidas
      console.log("Processando questões:", questionsArray);
      
      // Verificar cada questão para garantir que tenha os campos necessários
      const processedQuestions = questionsArray.map((q, idx) => {
        // Se a questão for undefined ou null, criar uma questão de fallback
        if (!q) {
          return {
            id: `q${idx+1}`,
            type: 'multiple-choice',
            text: `Questão ${idx+1} (gerada automaticamente)`,
            options: [
              { id: `q${idx+1}-a`, text: "Primeira opção", isCorrect: true },
              { id: `q${idx+1}-b`, text: "Segunda opção", isCorrect: false },
              { id: `q${idx+1}-c`, text: "Terceira opção", isCorrect: false },
              { id: `q${idx+1}-d`, text: "Quarta opção", isCorrect: false },
              { id: `q${idx+1}-e`, text: "Quinta opção", isCorrect: false }
            ],
            explanation: "Explicação padrão para esta questão."
          };
        }
        
        // Garantir que a questão tenha um tipo definido
        const questionType = q.type || 
          (q.options && Array.isArray(q.options) && q.options.length > 0 
            ? 'multiple-choice' 
            : typeof q.answer === 'boolean' 
              ? 'true-false' 
              : 'essay');
        
        // Garantir que a questão tenha um texto
        const questionText = q.text || `Questão ${idx+1}`;
        
        // Criar um objeto de questão completo
        return {
          ...q,
          id: q.id || `q${idx+1}`,
          type: questionType,
          text: questionText,
          options: questionType === 'multiple-choice' 
            ? (Array.isArray(q.options) && q.options.length > 0 
                ? q.options.map((opt, i) => ({
                    id: opt.id || `q${idx+1}-${String.fromCharCode(97+i)}`,
                    text: opt.text || `Opção ${i+1}`,
                    isCorrect: typeof opt.isCorrect === 'boolean' ? opt.isCorrect : i === 0
                  }))
                : [
                    { id: `q${idx+1}-a`, text: "Primeira opção", isCorrect: true },
                    { id: `q${idx+1}-b`, text: "Segunda opção", isCorrect: false },
                    { id: `q${idx+1}-c`, text: "Terceira opção", isCorrect: false },
                    { id: `q${idx+1}-d`, text: "Quarta opção", isCorrect: false },
                    { id: `q${idx+1}-e`, text: "Quinta opção", isCorrect: false }
                  ]
            ) : undefined,
          answer: questionType === 'true-false' 
            ? (typeof q.answer === 'boolean' ? q.answer : true) 
            : undefined,
          explanation: q.explanation || "Explicação não disponível para esta questão."
        };
      });
      
      console.log("Questões processadas:", processedQuestions);
      
      // Classificar as questões processadas por tipo
      multipleChoiceQuestionsFromAI = processedQuestions.filter(q => 
        q.type === 'multiple-choice' || 
        (q.options && Array.isArray(q.options) && q.options.length > 0)
      ).slice(0, multipleChoice);
      
      essayQuestionsFromAI = processedQuestions.filter(q => 
        q.type === 'essay' || 
        q.type === 'discursive' || 
        (!q.options && q.type !== 'true-false')
      ).slice(0, essay);
      
      trueFalseQuestionsFromAI = processedQuestions.filter(q => 
        q.type === 'true-false' || 
        q.type === 'verdadeiro-falso' || 
        (typeof q.answer === 'boolean')
      ).slice(0, trueFalse);
      
      // Se não conseguimos encontrar suficientes pelo tipo, vamos distribuir as questões disponíveis
      if (multipleChoiceQuestionsFromAI.length === 0 && essayQuestionsFromAI.length === 0 && trueFalseQuestionsFromAI.length === 0) {
        // Distribuir questões disponíveis baseado na configuração solicitada
        processedQuestions.forEach((question, index) => {
          if (index < totalQuestions) {
            if (index < multipleChoice) {
              multipleChoiceQuestionsFromAI.push({
                ...question, 
                type: 'multiple-choice',
                options: question.options || [
                  { id: `q${index+1}-a`, text: "Primeira opção", isCorrect: true },
                  { id: `q${index+1}-b`, text: "Segunda opção", isCorrect: false },
                  { id: `q${index+1}-c`, text: "Terceira opção", isCorrect: false },
                  { id: `q${index+1}-d`, text: "Quarta opção", isCorrect: false },
                  { id: `q${index+1}-e`, text: "Quinta opção", isCorrect: false }
                ]
              });
            } else if (index < multipleChoice + essay) {
              essayQuestionsFromAI.push({...question, type: 'essay'});
            } else {
              trueFalseQuestionsFromAI.push({
                ...question, 
                type: 'true-false',
                answer: typeof question.answer === 'boolean' ? question.answer : true
              });
            }
          }
        });
      }
      
      // Se ainda não temos questões suficientes, criar algumas de fallback
      if (multipleChoiceQuestionsFromAI.length < multipleChoice) {
        for (let i = multipleChoiceQuestionsFromAI.length; i < multipleChoice; i++) {
          multipleChoiceQuestionsFromAI.push({
            id: `q${questionCounter}`,
            type: 'multiple-choice',
            text: multipleChoiceQuestions[i % multipleChoiceQuestions.length],
            options: [
              { id: `q${questionCounter}-a`, text: "Primeira opção", isCorrect: true },
              { id: `q${questionCounter}-b`, text: "Segunda opção", isCorrect: false },
              { id: `q${questionCounter}-c`, text: "Terceira opção", isCorrect: false },
              { id: `q${questionCounter}-d`, text: "Quarta opção", isCorrect: false },
              { id: `q${questionCounter}-e`, text: "Quinta opção", isCorrect: false }
            ],
            explanation: "Explicação padrão para esta questão."
          });
          questionCounter++;
        }
      }
      
      if (essayQuestionsFromAI.length < essay) {
        for (let i = essayQuestionsFromAI.length; i < essay; i++) {
          essayQuestionsFromAI.push({
            id: `q${questionCounter}`,
            type: 'essay',
            text: essayQuestions[i % essayQuestions.length],
            explanation: "Esta é uma questão discursiva para testar sua compreensão do tema."
          });
          questionCounter++;
        }
      }
      
      if (trueFalseQuestionsFromAI.length < trueFalse) {
        for (let i = trueFalseQuestionsFromAI.length; i < trueFalse; i++) {
          trueFalseQuestionsFromAI.push({
            id: `q${questionCounter}`,
            type: 'true-false',
            text: trueFalseQuestions[i % trueFalseQuestions.length],
            answer: i % 2 === 0,
            explanation: "Esta é uma afirmação para você avaliar com base no conteúdo estudado."
          });
          questionCounter++;
        }
      }
      
      // Atualizar window.generatedQuestions para garantir que todas as questões estão disponíveis globalmente
      window.generatedQuestions = [
        ...multipleChoiceQuestionsFromAI,
        ...essayQuestionsFromAI,
        ...trueFalseQuestionsFromAI
      ];
    }

    // Processar questões para garantir que elas estão em um formato utilizável
    // Função para processar e sanitizar o texto
    const sanitizeText = (text) => {
      if (!text) return "Questão não disponível";
      // Remove caracteres especiais e limita o comprimento para evitar problemas de renderização
      return String(text)
        .replace(/[<>]/g, '')  // Remove tags HTML por segurança
        .trim();
    };

    // Gerar cards de múltipla escolha
    const mcCount = multipleChoiceQuestionsFromAI.length > 0 ? multipleChoiceQuestionsFromAI.length : multipleChoice;
    for (let i = 0; i < mcCount; i++) {
      if (questionCounter <= totalQuestions) {
        let questionText = '';
        let questionId = `q${questionCounter}`;

        if (multipleChoiceQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          const question = multipleChoiceQuestionsFromAI[i];
          questionText = sanitizeText(question.text || `Questão de múltipla escolha ${questionCounter}`);
          
          // Garantir que a questão tenha um ID e esteja na coleção global de questões
          window.generatedQuestions = window.generatedQuestions || [];
          
          // Encontrar a questão na coleção global ou adicionar se não existir
          const existingQuestionIndex = window.generatedQuestions.findIndex(q => q.id === question.id);
          
          if (existingQuestionIndex >= 0) {
            // Atualizar a questão existente
            window.generatedQuestions[existingQuestionIndex] = {
              ...question,
              text: questionText,
              options: Array.isArray(question.options) && question.options.length > 0 
                ? question.options
                : [
                    { id: `${questionId}-a`, text: "Primeira opção", isCorrect: true },
                    { id: `${questionId}-b`, text: "Segunda opção", isCorrect: false },
                    { id: `${questionId}-c`, text: "Terceira opção", isCorrect: false },
                    { id: `${questionId}-d`, text: "Quarta opção", isCorrect: false },
                    { id: `${questionId}-e`, text: "Quinta opção", isCorrect: false }
                  ],
              explanation: question.explanation || "Explicação para esta questão não disponível."
            };
          } else {
            // Adicionar à coleção global
            window.generatedQuestions.push({
              ...question,
              id: question.id || questionId,
              type: 'multiple-choice',
              text: questionText,
              options: Array.isArray(question.options) && question.options.length > 0 
                ? question.options
                : [
                    { id: `${questionId}-a`, text: "Primeira opção", isCorrect: true },
                    { id: `${questionId}-b`, text: "Segunda opção", isCorrect: false },
                    { id: `${questionId}-c`, text: "Terceira opção", isCorrect: false },
                    { id: `${questionId}-d`, text: "Quarta opção", isCorrect: false },
                    { id: `${questionId}-e`, text: "Quinta opção", isCorrect: false }
                  ],
              explanation: question.explanation || "Explicação para esta questão não disponível."
            });
          }
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % multipleChoiceQuestions.length;
          questionText = multipleChoiceQuestions[questionIndex];
          
          // Adicionar à coleção global
          window.generatedQuestions = window.generatedQuestions || [];
          window.generatedQuestions.push({
            id: questionId,
            type: 'multiple-choice',
            text: questionText,
            options: [
              { id: `${questionId}-a`, text: "Primeira opção", isCorrect: true },
              { id: `${questionId}-b`, text: "Segunda opção", isCorrect: false },
              { id: `${questionId}-c`, text: "Terceira opção", isCorrect: false },
              { id: `${questionId}-d`, text: "Quarta opção", isCorrect: false },
              { id: `${questionId}-e`, text: "Quinta opção", isCorrect: false }
            ],
            explanation: "Explicação para esta questão não disponível."
          });
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
        let questionId = `q${questionCounter}`;

        if (essayQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          const question = essayQuestionsFromAI[i];
          questionText = sanitizeText(question.text || `Questão discursiva ${questionCounter}`);
          
          // Garantir que a questão tenha um ID e esteja na coleção global de questões
          window.generatedQuestions = window.generatedQuestions || [];
          
          // Encontrar a questão na coleção global ou adicionar se não existir
          const existingQuestionIndex = window.generatedQuestions.findIndex(q => q.id === question.id);
          
          if (existingQuestionIndex >= 0) {
            // Atualizar a questão existente
            window.generatedQuestions[existingQuestionIndex] = {
              ...question,
              text: questionText,
              explanation: question.explanation || "Esta é uma questão discursiva onde você deve apresentar sua compreensão sobre o tema."
            };
          } else {
            // Adicionar à coleção global
            window.generatedQuestions.push({
              ...question,
              id: question.id || questionId,
              type: 'essay',
              text: questionText,
              explanation: question.explanation || "Esta é uma questão discursiva onde você deve apresentar sua compreensão sobre o tema."
            });
          }
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % essayQuestions.length;
          questionText = essayQuestions[questionIndex];
          
          // Adicionar à coleção global
          window.generatedQuestions = window.generatedQuestions || [];
          window.generatedQuestions.push({
            id: questionId,
            type: 'essay',
            text: questionText,
            explanation: "Esta é uma questão discursiva onde você deve apresentar sua compreensão sobre o tema."
          });
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
        let questionId = `q${questionCounter}`;

        if (trueFalseQuestionsFromAI.length > i) {
          // Usar questão gerada pela IA
          const question = trueFalseQuestionsFromAI[i];
          questionText = sanitizeText(question.text || `Afirmação ${questionCounter}`);
          
          // Determinar o valor verdadeiro/falso
          const isTrue = typeof question.answer === 'boolean' ? question.answer : true;
          
          // Garantir que a questão tenha um ID e esteja na coleção global de questões
          window.generatedQuestions = window.generatedQuestions || [];
          
          // Encontrar a questão na coleção global ou adicionar se não existir
          const existingQuestionIndex = window.generatedQuestions.findIndex(q => q.id === question.id);
          
          if (existingQuestionIndex >= 0) {
            // Atualizar a questão existente
            window.generatedQuestions[existingQuestionIndex] = {
              ...question,
              text: questionText,
              answer: isTrue,
              explanation: question.explanation || (isTrue 
                ? "Esta afirmação é verdadeira com base no conteúdo estudado."
                : "Esta afirmação é falsa de acordo com o conteúdo estudado.")
            };
          } else {
            // Adicionar à coleção global
            window.generatedQuestions.push({
              ...question,
              id: question.id || questionId,
              type: 'true-false',
              text: questionText,
              answer: isTrue,
              explanation: question.explanation || (isTrue
                ? "Esta afirmação é verdadeira com base no conteúdo estudado."
                : "Esta afirmação é falsa de acordo com o conteúdo estudado.")
            });
          }
        } else {
          // Fallback para questão pré-definida
          const questionIndex = i % trueFalseQuestions.length;
          questionText = trueFalseQuestions[questionIndex];
          const isTrue = i % 2 === 0; // alternar entre verdadeiro e falso
          
          // Adicionar à coleção global
          window.generatedQuestions = window.generatedQuestions || [];
          window.generatedQuestions.push({
            id: questionId,
            type: 'true-false',
            text: questionText,
            answer: isTrue,
            explanation: isTrue
              ? "Esta afirmação é verdadeira com base no conteúdo estudado."
              : "Esta afirmação é falsa de acordo com o conteúdo estudado."
          });
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

    // Verificar se conseguimos gerar todas as questões solicitadas
    if (questionCounter <= totalQuestions) {
      console.log(`Aviso: Foram geradas apenas ${questionCounter-1} questões das ${totalQuestions} solicitadas.`);
    }

    return cardsHTML;
  };

  const QuizProgressView = ({ quizHistory, currentQuiz }: { quizHistory: QuizHistory[], currentQuiz: QuizHistory }) => {
    return (
      <div>
        <h2>My Progress</h2>
        {/* Add your logic to display quizHistory and compare with currentQuiz here */}
        <pre>{JSON.stringify(quizHistory, null, 2)}</pre> {/* Temporary display of quizHistory */}
        <pre>{JSON.stringify(currentQuiz, null, 2)}</pre> {/* Temporary display of currentQuiz */}
      </div>
    );
  };


  if (showProgressView) {
    return (
      <div id="questions-results-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
        <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-4xl max-h-[80vh] animate-fadeIn">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
              Meu Progresso
            </h3>
            <button 
              id="close-results-modal"
              className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
              onClick={() => setShowProgressView(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>

          <QuizProgressView quizHistory={quizHistory} currentQuiz={{ date: new Date(), type: "Quiz", topic: "Geral", totalQuestions, correctAnswers: 0, settings: {}, bnccCompetence: "" }} />

          <div className="mt-6 flex justify-end">
            <button 
              onClick={() => setShowProgressView(false)}
              className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              Voltar
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          <button 
            id="my-progress-button"
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-medium flex items-center gap-1.5"
            onClick={handleMyProgressClick}
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