import React, { useState } from "react";
import { toast } from "@/components/ui/use-toast";
import { generateAIResponse } from "@/services/aiChatService";

// Tipos para as questões geradas
type QuestionOption = {
  id: string;
  text: string;
  isCorrect: boolean;
};

type Question = {
  id: string;
  type: string;
  text: string;
  options?: QuestionOption[];
  explanation?: string;
};

// Estender a interface Window para incluir funções globais necessárias
declare global {
  interface Window {
    showQuestionDetails: (questionType: string, questionNumber: number) => void;
    generatedQuestions: Question[];
  }
}

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

      // Tentar extrair o JSON de questões da resposta
      let questionsData = [];
      try {
        // Extrair apenas o JSON da resposta (que pode conter texto adicional)
        const jsonMatch = questionsResponse.match(/\[\s*\{.*\}\s*\]/s);
        if (jsonMatch) {
          questionsData = JSON.parse(jsonMatch[0]);
          console.log('Questões geradas com sucesso:', questionsData);
        } else {
          throw new Error('Formato de resposta inválido');
        }
      } catch (jsonError) {
        console.error('Erro ao parsear as questões JSON:', jsonError);
        questionsData = [];
      }

      // Armazenar as questões geradas em uma variável global para acesso posterior
      window.generatedQuestions = questionsData;

      // Criar função global para mostrar detalhes das questões
      window.showQuestionDetails = (questionType, questionNumber) => {
        showQuestionDetailModal(questionType, questionNumber, totalQuestions, multipleChoice, essay, trueFalse, messageContent, questionsData);
      };

      // Criar o modal de resultados
      showResultsModal(totalQuestions, multipleChoice, essay, trueFalse, messageContent, questionsData);

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
  const showQuestionDetailModal = (questionType: string, questionNumber: number, totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number, messageContent: string, questionsData = []) => {
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

    // Questões padrão por tipo (para fallback)
    const multipleChoiceQuestions = [
      "Qual é o principal conceito abordado no texto?",
      "De acordo com o conteúdo, qual alternativa está correta?",
      "Qual das seguintes afirmações melhor representa o tema estudado?",
      "Baseado no texto, qual opção descreve corretamente o assunto?",
      "Considerando o material apresentado, qual item é verdadeiro?",
      "Com base na explicação, qual é a melhor definição para o tema?"
    ];

    const essayQuestions = [
      "Explique com suas palavras os principais aspectos do tema apresentado.",
      "Disserte sobre a importância deste conteúdo para sua área de estudo.",
      "Descreva como você aplicaria estes conceitos em uma situação prática.",
      "Elabore uma análise crítica sobre o tema abordado.",
      "Compare os diferentes aspectos apresentados no material."
    ];

    const trueFalseQuestions = [
      "Os conceitos apresentados são aplicáveis apenas em contextos teóricos.",
      "Este tema é considerado fundamental na área de estudo.",
      "Existem diferentes abordagens para este assunto.",
      "A aplicação prática deste conteúdo é limitada.",
      "Os princípios discutidos são universalmente aceitos na comunidade acadêmica."
    ];

    // Extrair possíveis termos e conceitos do conteúdo (para fallback)
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

      if (selectedQuestion) {
        // Usar a questão gerada pela IA
        questionContent = selectedQuestion.text;
        questionExplanation = selectedQuestion.explanation || '';

        // Gerar as opções de múltipla escolha
        const optionsHTML = selectedQuestion.options.map((option, idx) => {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const letter = letters[idx % letters.length];
          const isCorrectClass = option.isCorrect ? 'border-green-500 bg-green-50 dark:bg-green-900/20' : '';

          return `
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md hover:bg-orange-50 dark:hover:bg-orange-900/20 border border-transparent hover:border-orange-300 dark:hover:border-orange-700 transition-colors active:bg-orange-50 active:dark:bg-orange-900/20 active:border-orange-300 active:dark:border-orange-700" data-correct="${option.isCorrect}" data-letter="${letter}" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">${letter}</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">${option.text}</span>
            </div>
          `;
        }).join('');

        questionOptions = `
          <div class="mt-4 space-y-3">
            ${optionsHTML}
          </div>
          <div id="check-answer-btn-container" class="mt-4 hidden">
            <button 
              id="check-answer-btn" 
              class="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              onclick="window.checkSelectedAnswer()"
            >
              Ver resposta
            </button>
          </div>
          <script>
            // Definir as funções no escopo global para acessibilidade
            window.selectedOption = null;

            window.selectOption = function(element) {
              // Remover destaque de todas as opções
              document.querySelectorAll('.option-selection').forEach(opt => {
                opt.classList.remove('bg-orange-50', 'dark:bg-orange-900/20');
                opt.classList.remove('border-orange-300', 'dark:border-orange-700');
                opt.classList.add('border-transparent');
                const letterContainerInOpt = opt.querySelector('.option-letter-container');
                if (letterContainerInOpt) {
                  letterContainerInOpt.classList.remove('bg-orange-500', 'text-white');
                  letterContainerInOpt.classList.add('bg-white', 'dark:bg-gray-800');
                }
                opt.style.fontWeight = 'normal';
              });

              // Destacar a opção clicada com classes permanentes (não apenas hover)
              element.classList.add('bg-orange-50', 'dark:bg-orange-900/20');
              element.classList.remove('border-transparent');
              element.classList.add('border-orange-300', 'dark:border-orange-700');
              element.style.fontWeight = 'bold';

              // Destacar o indicador de letra
              const letterContainer = element.querySelector('.option-letter-container');
              if (letterContainer) {
                letterContainer.classList.remove('bg-white', 'dark:bg-gray-800');
                letterContainer.classList.add('bg-orange-500', 'text-white');
              }

              // Guardar a referência da opção selecionada
              window.selectedOption = element;

              // Mostrar o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn-container');
              if (checkAnswerBtn) {
                checkAnswerBtn.classList.remove('hidden');
              }
            };

            window.checkSelectedAnswer = function() {
              if (!window.selectedOption) return;

              // Desativar todas as opções para evitar mudanças após verificação
              document.querySelectorAll('.option-selection').forEach(opt => {
                opt.style.pointerEvents = 'none';
                opt.style.opacity = '0.7';
              });

              // Destacar a opção selecionada
              window.selectedOption.style.opacity = '1';

              // Verificar se a resposta está correta
              const isCorrect = window.selectedOption.getAttribute('data-correct') === 'true';
              const resultContainer = document.getElementById('answer-result');
              const explanationContainer = document.getElementById('explanation-container');

              // Aplicar cores baseadas na resposta
              if (isCorrect) {
                window.selectedOption.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border-orange-300', 'dark:border-orange-700');
                window.selectedOption.classList.add('bg-green-50', 'dark:bg-green-900/20', 'border', 'border-green-300', 'dark:border-green-700');
              } else {
                window.selectedOption.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border-orange-300', 'dark:border-orange-700');
                window.selectedOption.classList.add('bg-red-50', 'dark:bg-red-900/20', 'border', 'border-red-300', 'dark:border-red-700');

                // Destacar a opção correta
                document.querySelectorAll('.option-selection').forEach(opt => {
                  if (opt.getAttribute('data-correct') === 'true') {
                    opt.style.opacity = '1';
                    opt.classList.add('bg-green-50', 'dark:bg-green-900/20', 'border', 'border-green-300', 'dark:border-green-700');
                  }
                });
              }

              // Mostrar o resultado
              if (resultContainer) {
                resultContainer.classList.remove('hidden');

                if (isCorrect) {
                  resultContainer.innerHTML = '<p class="text-green-600 dark:text-green-400 font-medium">✓ Resposta correta!</p>';
                  resultContainer.classList.add('bg-green-100', 'dark:bg-green-900/20', 'border', 'border-green-200', 'dark:border-green-700');
                } else {
                  resultContainer.innerHTML = '<p class="text-red-600 dark:text-red-400 font-medium">✗ Resposta incorreta!</p>';
                  resultContainer.classList.add('bg-red-100', 'dark:bg-red-900/20', 'border', 'border-red-200', 'dark:border-red-700');
                }
              }

              // Mostrar a explicação
              if (explanationContainer) {
                explanationContainer.classList.remove('hidden');
              }

              // Esconder o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn-container');
              if (checkAnswerBtn) {
                checkAnswerBtn.classList.add('hidden');
              }
            };

            // Função para aplicar os event listeners necessários
            function applyEventListeners() {
              console.log("Aplicando event listeners às alternativas");

              // Adicionar listeners para todas as opções
              const options = document.querySelectorAll('.option-selection');
              if (options.length > 0) {
                options.forEach(opt => {
                  // Remover eventos antigos (se existirem)
                  const newOpt = opt.cloneNode(true);
                  opt.parentNode.replaceChild(newOpt, opt);
                  
                  // Adicionar múltiplos eventos para garantir a interatividade
                  newOpt.style.cursor = 'pointer';
                  
                  // Função para selecionar a opção
                  const selectThisOption = function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log("Alternativa clicada", this);
                    window.selectOption(this);
                    return false;
                  };
                  
                  // Adicionar eventos múltiplos para maior compatibilidade
                  newOpt.onclick = selectThisOption;
                  newOpt.addEventListener('click', selectThisOption);
                  newOpt.addEventListener('mousedown', function(e) {
                    e.preventDefault(); // Prevenir comportamento padrão
                  });
                  newOpt.addEventListener('touchstart', selectThisOption, {passive: false});
                });
                console.log("Event listeners aplicados a", options.length, "alternativas");
              } else {
                console.log("Nenhuma alternativa encontrada para aplicar event listeners");
              }

              // Adicionar listener para o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn');
              if (checkAnswerBtn) {
                const newBtn = checkAnswerBtn.cloneNode(true);
                checkAnswerBtn.parentNode.replaceChild(newBtn, checkAnswerBtn);
                newBtn.onclick = window.checkSelectedAnswer;
                console.log("Event listener aplicado ao botão de verificar resposta");
              }
            }

            // Aplicar os event listeners após criação do DOM
            setTimeout(applyEventListeners, 100);

            // Se o DOM já estiver carregado, aplicar imediatamente
            if (document.readyState === 'complete' || document.readyState === 'interactive') {
              applyEventListeners();
            } else {
              document.addEventListener('DOMContentLoaded', applyEventListeners);
            }

            // Aplicar novamente após um tempo maior para garantir
            setTimeout(applyEventListeners, 500);
            // Aplicar mais uma vez depois de 1 segundo para ter certeza
            setTimeout(applyEventListeners, 1000);
          </script>
        `;
      } else {
        // Fallback para questões pré-definidas
        const questionIndex = (questionNumber - 1) % multipleChoiceQuestions.length;
        questionContent = multipleChoiceQuestions[questionIndex];

        questionOptions = `
          <div class="mt-4 space-y-3">
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" data-correct="false" data-letter="A" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">A</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">É um ${terms[0 % terms.length]} fundamental para compreensão do tema.</span>
            </div>
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" data-correct="true" data-letter="B" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">B</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Representa uma abordagem inovadora sobre o ${terms[1 % terms.length]}.</span>
            </div>
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" data-correct="false" data-letter="C" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">C</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Demonstra a aplicação prática do ${terms[2 % terms.length]} em contextos reais.</span>
            </div>
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors" data-correct="false" data-letter="D" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">D</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">Exemplifica como o ${terms[3 % terms.length]} pode ser utilizado em diferentes situações.</span>
            </div>
          </div>
          <div id="check-answer-btn-container" class="mt-4 hidden">
            <button 
              id="check-answer-btn" 
              class="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
              onclick="window.checkSelectedAnswer()"
            >
              Ver resposta
            </button>
          </div>
          <script>
            // Definir as funções no escopo global para acessibilidade
            window.selectedOption = null;

            window.selectOption = function(element) {
              // Remover destaque de todas as opções
              document.querySelectorAll('.option-selection').forEach(opt => {
                opt.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border', 'border-orange-300', 'dark:border-orange-700');
                opt.querySelector('.option-letter-container')?.classList.remove('bg-orange-500', 'text-white');
                opt.querySelector('.option-letter-container')?.classList.add('bg-white', 'dark:bg-gray-800');
                opt.style.fontWeight = 'normal';
              });

              // Destacar a opção clicada
              element.classList.add('bg-orange-50', 'dark:bg-orange-900/20', 'border', 'border-orange-300', 'dark:border-orange-700');
              element.style.fontWeight = 'bold';

              // Destacar o indicador de letra
              const letterContainer = element.querySelector('.option-letter-container');
              if (letterContainer) {
                letterContainer.classList.remove('bg-white', 'dark:bg-gray-800');
                letterContainer.classList.add('bg-orange-500', 'text-white');
              }

              // Guardar a referência da opção selecionada
              window.selectedOption = element;

              // Mostrar o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn-container');
              if (checkAnswerBtn) {
                checkAnswerBtn.classList.remove('hidden');
              }
            };

            window.checkSelectedAnswer = function() {
              if (!window.selectedOption) return;

              // Desativar todas as opções para evitar mudanças após verificação
              document.querySelectorAll('.option-selection').forEach(opt => {
                opt.style.pointerEvents = 'none';
                opt.style.opacity = '0.7';
              });

              // Destacar a opção selecionada
              window.selectedOption.style.opacity = '1';

              // Verificar se a resposta está correta
              const isCorrect = window.selectedOption.getAttribute('data-correct') === 'true';
              const resultContainer = document.getElementById('answer-result');
              const explanationContainer = document.getElementById('explanation-container');

              // Aplicar cores baseadas na resposta
              if (isCorrect) {
                window.selectedOption.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border-orange-300', 'dark:border-orange-700');
                window.selectedOption.classList.add('bg-green-50', 'dark:bg-green-900/20', 'border', 'border-green-300', 'dark:border-green-700');
              } else {
                window.selectedOption.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border-orange-300', 'dark:border-orange-700');
                window.selectedOption.classList.add('bg-red-50', 'dark:bg-red-900/20', 'border', 'border-red-300', 'dark:border-red-700');

                // Destacar a opção correta
                document.querySelectorAll('.option-selection').forEach(opt => {
                  if (opt.getAttribute('data-correct') === 'true') {
                    opt.style.opacity = '1';
                    opt.classList.add('bg-green-50', 'dark:bg-green-900/20', 'border', 'border-green-300', 'dark:border-green-700');
                  }
                });
              }

              // Mostrar o resultado
              if (resultContainer) {
                resultContainer.classList.remove('hidden');

                if (isCorrect) {
                  resultContainer.innerHTML = '<p class="text-green-600 dark:text-green-400 font-medium">✓ Resposta correta!</p>';
                  resultContainer.classList.add('bg-green-100', 'dark:bg-green-900/20', 'border', 'border-green-200', 'dark:border-green-700');
                } else {
                  resultContainer.innerHTML = '<p class="text-red-600 dark:text-red-400 font-medium">✗ Resposta incorreta!</p>';
                  resultContainer.classList.add('bg-red-100', 'dark:bg-red-900/20', 'border', 'border-red-200', 'dark:border-red-700');
                }
              }

              // Mostrar a explicação
              if (explanationContainer) {
                explanationContainer.classList.remove('hidden');
              }

              // Esconder o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn-container');
              if (checkAnswerBtn) {
                checkAnswerBtn.classList.add('hidden');
              }
            };

            // Adicionar event listeners após criação do DOM
            setTimeout(() => {
              // Adicionar listeners para todas as opções
              document.querySelectorAll('.option-selection').forEach(opt => {
                opt.addEventListener('click', function() {
                  window.selectOption(this);
                });
              });

              // Adicionar listener para o botão de verificar resposta
              const checkAnswerBtn = document.getElementById('check-answer-btn');
              if (checkAnswerBtn) {
                checkAnswerBtn.addEventListener('click', window.checkSelectedAnswer);
              }
            }, 100);
          </script>
        `;
      }
    } else if (questionType === 'essay') {
      questionTag = '<span class="px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 text-xs rounded-full">Discursiva</span>';

      if (selectedQuestion) {
        // Usar a questão gerada pela IA
        questionContent = selectedQuestion.text;
      } else {
        // Fallback para questões pré-definidas
        const questionIndex = (questionNumber - 1) % essayQuestions.length;
        questionContent = essayQuestions[questionIndex];
      }

      questionOptions = `
        <div class="mt-4">
          <textarea placeholder="Digite sua resposta aqui..." class="w-full h-32 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-orange-500"></textarea>
        </div>
      `;
    } else if (questionType === 'true-false') {
      questionTag = '<span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300 text-xs rounded-full">Verdadeiro ou Falso</span>';

      if (selectedQuestion) {
        // Usar a questão gerada pela IA
        questionContent = selectedQuestion.text;
        questionExplanation = selectedQuestion.explanation || '';
      } else {
        // Fallback para questões pré-definidas
        const questionIndex = (questionNumber - 1) % trueFalseQuestions.length;
        questionContent = trueFalseQuestions[questionIndex];
      }

      questionOptions = `
        <div class="mt-4 space-y-3">
          <div class="flex items-center space-x-4 cursor-pointer option-selection" data-correct="false" data-option="verdadeiro" onclick="window.selectOption(this)">
            <button class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onclick="event.preventDefault(); window.selectOption(this.parentNode);">
              Verdadeiro
            </button>
          </div>
          <div class="flex items-center space-x-4 cursor-pointer option-selection" data-correct="true" data-option="falso" onclick="window.selectOption(this)">
            <button class="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors" onclick="event.preventDefault(); window.selectOption(this.parentNode);">
              Falso
            </button>
          </div>
        </div>
        <div id="check-answer-btn-container" class="mt-4 hidden">
          <button 
            id="check-answer-btn" 
            class="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
            onclick="window.checkSelectedAnswer()"
          >
            Ver resposta
          </button>
        </div>
        <script>
          // Definir as funções no escopo global para acessibilidade
          window.selectedOption = null;

          window.selectOption = function(element) {
            // Remover destaque de todas as opções
            document.querySelectorAll('.option-selection').forEach(opt => {
              const btn = opt.querySelector('button');
              if (btn) {
                btn.classList.remove('bg-orange-100', 'dark:bg-orange-900/30');
                btn.classList.add('bg-white', 'dark:bg-gray-700');
              }
            });

            // Destacar a opção clicada
            const selectedBtn = element.querySelector('button');
            if (selectedBtn) {
              selectedBtn.classList.remove('bg-white', 'dark:bg-gray-700');
              selectedBtn.classList.add('bg-orange-100', 'dark:bg-orange-900/30');
            }

            // Guardar a referência da opção selecionada
            window.selectedOption = element;

            // Mostrar o botão de verificar resposta
            const checkAnswerBtn = document.getElementById('check-answer-btn-container');
            if (checkAnswerBtn) {
              checkAnswerBtn.classList.remove('hidden');
            }
          };

          window.checkSelectedAnswer = function() {
            if (!window.selectedOption) return;

            // Desativar todas as opções para evitar mudanças após verificação
            document.querySelectorAll('.option-selection').forEach(opt => {
              opt.style.pointerEvents = 'none';
              opt.style.opacity = '0.7';
            });

            // Destacar a opção selecionada
            window.selectedOption.style.opacity = '1';

            // Verificar se a resposta está correta
            const isCorrect = window.selectedOption.getAttribute('data-correct') === 'true';
            const resultContainer = document.getElementById('answer-result');
            const explanationContainer = document.getElementById('explanation-container');

            // Aplicar cores baseadas na resposta
            const selectedBtn = window.selectedOption.querySelector('button');
            if (selectedBtn) {
              if (isCorrect) {
                selectedBtn.classList.remove('bg-orange-100', 'dark:bg-orange-900/30');
                selectedBtn.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-300', 'dark:border-green-700');
              } else {
                selectedBtn.classList.remove('bg-orange-100', 'dark:bg-orange-900/30');
                selectedBtn.classList.add('bg-red-100', 'dark:bg-red-900/30', 'border-red-300', 'dark:border-red-700');

                // Destacar a opção correta
                document.querySelectorAll('.option-selection').forEach(opt => {
                  if (opt.getAttribute('data-correct') === 'true') {
                    const correctBtn = opt.querySelector('button');
                    if (correctBtn) {
                      opt.style.opacity = '1';
                      correctBtn.classList.remove('bg-white', 'dark:bg-gray-700');
                      correctBtn.classList.add('bg-green-100', 'dark:bg-green-900/30', 'border-green-300', 'dark:border-green-700');
                    }
                  }
                });
              }
            }

            // Mostrar o resultado
            if (resultContainer) {
              resultContainer.classList.remove('hidden');

              if (isCorrect) {
                resultContainer.innerHTML = '<p class="text-green-600 dark:text-green-400 font-medium">✓ Resposta correta!</p>';
                resultContainer.classList.add('bg-green-100', 'dark:bg-green-900/20', 'border', 'border-green-200', 'dark:border-green-700');
              } else {
                resultContainer.innerHTML = '<p class="text-red-600 dark:text-red-400 font-medium">✗ Resposta incorreta!</p>';
                resultContainer.classList.add('bg-red-100', 'dark:bg-red-900/20', 'border', 'border-red-200', 'dark:border-red-700');
              }
            }

            // Mostrar a explicação
            if (explanationContainer) {
              explanationContainer.classList.remove('hidden');
            }

            // Esconder o botão de verificar resposta
            const checkAnswerBtn = document.getElementById('check-answer-btn-container');
            if (checkAnswerBtn) {
              checkAnswerBtn.classList.add('hidden');
            }
          };

          // Adicionar event listeners após criação do DOM
          setTimeout(() => {
            //            // Adicionar listeners para todas as opções
            document.querySelectorAll('.option-selection').forEach(opt => {
              opt.addEventListener('click', function() {
                window.selectOption(this);
              });
            });

            // Adicionar listener para o botão de verificar resposta
            const checkAnswerBtn = document.getElementById('check-answer-btn');
            if (checkAnswerBtn) {
              checkAnswerBtn.addEventListener('click', window.checkSelectedAnswer);
            }
          }, 100);
        </script>
      `;
    }

    // Criar uma explicação padrão se não tiver uma explicação fornecida
    let explanation = questionExplanation;
    if (!explanation) {
      // Explicações padrão baseadas no tipo de questão
      if (questionType === 'multiple-choice') {
        explanation = `Esta questão avalia a compreensão do conceito principal abordado no conteúdo. A resposta correta é aquela que melhor sintetiza as informações apresentadas no material de estudo.`;
      } else if (questionType === 'true-false') {
        explanation = `Esta questão verifica seu entendimento sobre a aplicabilidade dos conceitos discutidos. A análise crítica das afirmações é essencial para determinar sua validade no contexto apresentado.`;
      } else if (questionType === 'essay') {
        explanation = `Esta questão discursiva permite demonstrar sua compreensão profunda do tema, aplicando conceitos e elaborando conexões entre diferentes aspectos do conteúdo estudado.`;
      }
    }

    // A explicação será mostrada apenas após a resposta
    const explanationHTML = `
      <div id="explanation-container" class="mt-4 hidden">
        <div class="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div id="answer-result" class="mb-2 p-2 rounded-lg hidden"></div>
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Explicação:</p>
          <p class="text-sm text-gray-700 dark:text-gray-300">${explanation}</p>
        </div>
      </div>
    `;

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
            ${explanationHTML}
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
  const showResultsModal = (totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number, messageContent: string, questionsData = []) => {
    // Função para gerar os mini-cards das questões
    const generateQuestionCards = (total: number, multipleChoice: number, essay: number, trueFalse: number) => {
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
          topics.forEach((topic, index) => {
            questions.push(`Qual é o principal aspecto de ${topic} abordado no texto?`);
            questions.push(`De acordo com o conteúdo, qual alternativa sobre ${topic} está correta?`);
            questions.push(`Qual das seguintes afirmações relacionadas a ${topic} é verdadeira?`);
          });
        } else if (type === 'essay') {
          topics.forEach((topic, index) => {
            questions.push(`Disserte sobre a importância de ${topic} no contexto apresentado.`);
            questions.push(`Explique como ${topic} se relaciona com outros conceitos do material.`);
            questions.push(`Elabore uma análise crítica sobre ${topic} e suas aplicações.`);
          });
        } else if (type === 'true-false') {
          topics.forEach((topic, index) => {
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
        if (questionCounter <= total) {
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
                 onclick="showQuestionDetails('multiple-choice', ${questionCounter})">
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
        if (questionCounter <= total) {
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
                 onclick="showQuestionDetails('essay', ${questionCounter})">
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
        if (questionCounter <= total) {
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
                 onclick="showQuestionDetails('true-false', ${questionCounter})">
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