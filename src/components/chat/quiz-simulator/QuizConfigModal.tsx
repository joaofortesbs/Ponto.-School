
import React from 'react';
import { toast } from "@/components/ui/use-toast";

interface QuizConfigModalProps {
  onClose: () => void;
  onStartQuiz: (smartDifficulty: boolean, studyMode: boolean) => void;
}

const QuizConfigModal: React.FC<QuizConfigModalProps> = ({ onClose, onStartQuiz }) => {
  const handleStartQuiz = () => {
    const smartDifficultyInput = document.getElementById('smart-difficulty') as HTMLInputElement;
    const studyModeInput = document.getElementById('study-mode') as HTMLInputElement;
    
    const useSmartDifficulty = smartDifficultyInput?.checked || false;
    const useStudyMode = studyModeInput?.checked || false;
    
    onStartQuiz(useSmartDifficulty, useStudyMode);
  };

  return (
    <div id="quiz-config-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-sm animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-orange-500">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Configurações do Quiz
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
        
        <div className="space-y-4 mb-6">
          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
            <div>
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Dificuldade Inteligente</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Ajusta o nível das perguntas com base nas suas respostas</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" id="smart-difficulty" className="sr-only peer" defaultChecked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-orange-500"></div>
            </label>
          </div>
          
          <div className="flex items-center p-3 bg-gray-50 dark:bg-gray-800/50 rounded-lg">
            <input type="checkbox" id="study-mode" className="h-4 w-4 rounded text-orange-500 border-gray-300 focus:ring-orange-500 cursor-pointer" />
            <label htmlFor="study-mode" className="ml-2 block cursor-pointer">
              <p className="font-medium text-sm text-gray-800 dark:text-gray-200">Modo Estudo</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Mostra explicações após cada pergunta</p>
            </label>
          </div>
        </div>
        
        <button 
          onClick={handleStartQuiz}
          className="w-full py-2.5 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="5 3 19 12 5 21 5 3"></polygon>
          </svg>
          Iniciar Quiz
        </button>
      </div>
    </div>
  );
};

export default QuizConfigModal;
