
import React from 'react';
import { toast } from "@/components/ui/use-toast";

interface QuestionsConfigModalProps {
  onClose: () => void;
  onGenerateQuestions: (config: QuestionsConfig) => void;
}

export interface QuestionsConfig {
  totalQuestions: string;
  multipleChoice: string;
  discursive: string;
  trueFalse: string;
  bnccCompetence: string;
}

const QuestionsConfigModal: React.FC<QuestionsConfigModalProps> = ({ onClose, onGenerateQuestions }) => {
  const handleGenerateQuestions = () => {
    const totalQuestionsInput = document.getElementById('total-questions') as HTMLInputElement;
    const multiplesChoiceInput = document.getElementById('multiple-choice') as HTMLInputElement;
    const discursiveInput = document.getElementById('discursive') as HTMLInputElement;
    const trueFalseInput = document.getElementById('true-false') as HTMLInputElement;
    const bnccSelect = document.getElementById('bncc-competence') as HTMLSelectElement;
    
    const config: QuestionsConfig = {
      totalQuestions: totalQuestionsInput?.value || "10",
      multipleChoice: multiplesChoiceInput?.value || "6",
      discursive: discursiveInput?.value || "2",
      trueFalse: trueFalseInput?.value || "2",
      bnccCompetence: bnccSelect?.value !== "Selecione uma competência" ? bnccSelect?.value : ""
    };
    
    onGenerateQuestions(config);
  };

  return (
    <div id="see-questions-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-orange-500">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Ver possíveis questões
          </h3>
          <button 
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
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
              id="total-questions"
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
                  id="multiple-choice"
                  type="number" 
                  min="0" 
                  defaultValue="6"
                  className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Discursivas</span>
                <input 
                  id="discursive"
                  type="number" 
                  min="0" 
                  defaultValue="2"
                  className="w-16 p-1 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-center"
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700 dark:text-gray-300">Verdadeiro ou Falso</span>
                <input 
                  id="true-false"
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
              id="bncc-competence"
              className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-800 dark:text-white"
            >
              <option>Selecione uma competência</option>
              <option value="EM13LGG101">EM13LGG101</option>
              <option value="EM13MAT101">EM13MAT101</option>
              <option value="EM13CNT101">EM13CNT101</option>
              <option value="EM13CHS101">EM13CHS101</option>
              <option value="EM13LP01">EM13LP01</option>
            </select>
          </div>
        </div>
        
        <button 
          onClick={handleGenerateQuestions}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="16"></line>
            <line x1="8" y1="12" x2="16" y2="12"></line>
          </svg>
          Gerar Questões
        </button>
      </div>
    </div>
  );
};

export default QuestionsConfigModal;
