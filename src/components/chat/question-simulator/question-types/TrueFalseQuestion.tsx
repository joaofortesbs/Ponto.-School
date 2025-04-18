
import React from "react";

interface TrueFalseQuestionProps {
  question: {
    text: string;
    explanation?: string;
  };
  questionNumber: number;
}

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = ({ question }) => {
  const generateScriptContent = () => {
    return `
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
    `;
  };

  const explanation = question.explanation || "Esta questão verifica seu entendimento sobre a aplicabilidade dos conceitos discutidos. A análise crítica das afirmações é essencial para determinar sua validade no contexto apresentado.";

  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-gray-700 dark:text-gray-300">
        {question.text}
      </p>
      
      <div className="mt-4 space-y-3">
        <div className="flex items-center space-x-4 cursor-pointer option-selection" data-correct="false" data-option="verdadeiro" onClick={() => window.selectOption(this)}>
          <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Verdadeiro
          </button>
        </div>
        <div className="flex items-center space-x-4 cursor-pointer option-selection" data-correct="true" data-option="falso" onClick={() => window.selectOption(this)}>
          <button className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
            Falso
          </button>
        </div>
      </div>
      
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

export default TrueFalseQuestion;
