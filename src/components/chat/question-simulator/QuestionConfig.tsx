
import React from "react";

interface QuestionConfigProps {
  isLoading: boolean;
  onGenerateQuestions: (totalQuestions: number, multipleChoice: number, essay: number, trueFalse: number) => void;
}

const QuestionConfig: React.FC<QuestionConfigProps> = ({ isLoading, onGenerateQuestions }) => {
  return (
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
          onClick={() => {}}
          id="close-config-button"
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
          onGenerateQuestions(totalQuestions, multipleChoice, essay, trueFalse);
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
  );
};

export default QuestionConfig;
