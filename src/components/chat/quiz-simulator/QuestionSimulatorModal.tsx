
import React from 'react';
import { toast } from "@/components/ui/use-toast";
import { generateAIResponse } from "@/services/aiChatService";

interface QuestionSimulatorModalProps {
  onClose: () => void;
  onQuizSelect: () => void;
  onQuestionsSelect: () => void;
}

const QuestionSimulatorModal: React.FC<QuestionSimulatorModalProps> = ({ 
  onClose, 
  onQuizSelect, 
  onQuestionsSelect 
}) => {
  return (
    <div id="question-simulator-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-6 shadow-xl w-[90%] max-w-md animate-fadeIn">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-orange-500">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
              <path d="M12 17h.01"></path>
            </svg>
            Simulador de Questões
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
        
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-5">
          Escolha uma opção para continuar:
        </p>
        
        <div className="grid grid-cols-1 gap-3 mb-2">
          <button 
            onClick={onQuizSelect}
            className="p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 flex items-center gap-3 group hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-orange-600 dark:text-orange-400">
                <path d="M9 11l3 3L22 4"></path>
                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Fazer Quiz</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Teste seus conhecimentos com perguntas interativas</p>
            </div>
          </button>
          
          <button 
            onClick={onQuestionsSelect}
            className="p-4 border border-orange-200 dark:border-orange-700 rounded-lg bg-gradient-to-r from-white to-orange-50 dark:from-gray-800 dark:to-orange-900/20 flex items-center gap-3 group hover:shadow-md transition-all"
          >
            <div className="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" className="text-orange-600 dark:text-orange-400">
                <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h4 className="font-medium text-gray-800 dark:text-gray-200 mb-1">Ver possíveis questões da prova</h4>
              <p className="text-xs text-gray-500 dark:text-gray-400">Explore questões baseadas no conteúdo estudado</p>
            </div>
          </button>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400 italic">
            As questões são geradas com base no conteúdo da conversa
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionSimulatorModal;
