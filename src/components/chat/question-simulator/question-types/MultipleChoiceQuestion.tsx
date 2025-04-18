
import React from "react";

interface MultipleChoiceQuestionProps {
  question: {
    text: string;
    options?: {
      id: string;
      text: string;
      isCorrect: boolean;
    }[];
    explanation?: string;
  };
  questionNumber: number;
}

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = ({ question, questionNumber }) => {
  const generateScriptContent = () => {
    return `
      window.selectedOption = null;

      window.selectOption = function(element) {
        if (!element) return;
        
        // Remover a classe de todas as alternativas
        document.querySelectorAll('.option-selection').forEach(opt => {
          // Remover todos os estilos de seleção
          opt.classList.remove('bg-orange-50', 'dark:bg-orange-900/20', 'border-orange-300', 'dark:border-orange-700');
          // Garantir que a borda transparente seja aplicada às opções não selecionadas
          opt.classList.add('border-transparent');
          
          const letterContainer = opt.querySelector('.option-letter-container');
          if (letterContainer) {
            letterContainer.classList.remove('bg-orange-500', 'text-white'); // Remover destaque da letra
            letterContainer.classList.add('bg-white', 'dark:bg-gray-800');
          }
          opt.style.fontWeight = 'normal';
        });

        // Destacar a opção clicada
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
    `;
  };

  const generateOptions = () => {
    if (!question.options || question.options.length === 0) {
      const terms = ["conceito", "tema", "assunto", "método", "técnica"];
      
      return `
        <div class="mt-4 space-y-3">
          <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md border border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors" data-correct="false" data-letter="A" onclick="window.selectOption(this)">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
              <span class="text-xs font-medium">A</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">É um ${terms[0]} fundamental para compreensão do tema.</span>
          </div>
          <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md border border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors" data-correct="true" data-letter="B" onclick="window.selectOption(this)">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
              <span class="text-xs font-medium">B</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Representa uma abordagem inovadora sobre o ${terms[1]}.</span>
          </div>
          <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md border border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors" data-correct="false" data-letter="C" onclick="window.selectOption(this)">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
              <span class="text-xs font-medium">C</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Demonstra a aplicação prática do ${terms[2]} em contextos reais.</span>
          </div>
          <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md border border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors" data-correct="false" data-letter="D" onclick="window.selectOption(this)">
            <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
              <span class="text-xs font-medium">D</span>
            </div>
            <span class="text-sm text-gray-700 dark:text-gray-300">Exemplifica como o ${terms[3]} pode ser utilizado em diferentes situações.</span>
          </div>
        </div>
      `;
    }

    return `
      <div class="mt-4 space-y-3">
        ${question.options.map((option, idx) => {
          const letters = ['A', 'B', 'C', 'D', 'E', 'F'];
          const letter = letters[idx % letters.length];
          
          return `
            <div class="flex items-center space-x-2 cursor-pointer option-selection p-2 rounded-md border border-transparent hover:bg-orange-50 dark:hover:bg-orange-900/20 hover:border-orange-300 dark:hover:border-orange-700 transition-colors" data-correct="${option.isCorrect}" data-letter="${letter}" onclick="window.selectOption(this)">
              <div class="flex items-center justify-center w-6 h-6 rounded-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 option-letter-container">
                <span class="text-xs font-medium">${letter}</span>
              </div>
              <span class="text-sm text-gray-700 dark:text-gray-300">${option.text}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  };

  const explanation = question.explanation || "Esta questão avalia a compreensão do conceito principal abordado no conteúdo. A resposta correta é aquela que melhor sintetiza as informações apresentadas no material de estudo.";

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {question.text}
      </p>
      
      <div dangerouslySetInnerHTML={{ __html: generateOptions() }} />
      
      <div id="check-answer-btn-container" className="mt-4 hidden">
        <button 
          id="check-answer-btn" 
          className="w-full py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg text-sm font-medium transition-colors cursor-pointer"
        >
          Ver resposta
        </button>
      </div>
      
      <div id="explanation-container" className="mt-4 hidden">
        <div className="p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg border border-gray-200 dark:border-gray-700">
          <div id="answer-result" className="mb-2 p-2 rounded-lg hidden"></div>
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Explicação:</p>
          <p className="text-sm text-gray-700 dark:text-gray-300">{explanation}</p>
        </div>
      </div>
      
      <script dangerouslySetInnerHTML={{ __html: generateScriptContent() }} />
    </div>
  );
};

export default MultipleChoiceQuestion;
