
import React from 'react';
import { toast } from "@/components/ui/use-toast";
import { Question } from './QuestionGenerator';

interface QuestionsResultModalProps {
  questions: Question[];
  onClose: () => void;
  onExport: () => void;
}

const QuestionsResultModal: React.FC<QuestionsResultModalProps> = ({ 
  questions, 
  onClose,
  onExport
}) => {
  if (!questions.length) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] overflow-hidden">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[95%] h-[90%] max-w-3xl animate-fadeIn flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-500">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
            </svg>
            Questões Possíveis
          </h3>
          <div className="flex gap-2">
            <button 
              onClick={onExport}
              className="h-8 flex items-center justify-center px-3 rounded-lg bg-orange-100 hover:bg-orange-200 dark:bg-orange-800/30 dark:hover:bg-orange-800/50 text-orange-700 dark:text-orange-300 text-sm font-medium transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Exportar
            </button>
            <button 
              onClick={onClose}
              className="h-8 w-8 flex items-center justify-center rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18"></path>
                <path d="m6 6 12 12"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
          <div className="space-y-6">
            {questions.map((question, index) => (
              <div key={index} className="bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-6 w-6 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-xs font-medium text-orange-700 dark:text-orange-300">
                    {question.number}
                  </div>
                  <span className="text-sm bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 px-2 py-0.5 rounded-md">
                    {question.type}
                  </span>
                </div>
                
                <div className="space-y-3">
                  <div className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
                    <h4 className="font-medium">Enunciado:</h4>
                    <p className="text-sm mt-1">{question.statement}</p>
                  </div>
                  
                  {question.answer && (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-100 dark:border-green-800 rounded-md p-3">
                      <h4 className="font-medium text-green-800 dark:text-green-300 text-sm">Gabarito:</h4>
                      <p className="text-sm text-green-700 dark:text-green-200 mt-1">{question.answer}</p>
                    </div>
                  )}
                  
                  {question.explanation && (
                    <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-md p-3">
                      <h4 className="font-medium text-blue-800 dark:text-blue-300 text-sm">Explicação:</h4>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">{question.explanation}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Estas questões foram geradas com base no conteúdo da conversa e podem ser usadas para estudo e revisão.
          </p>
        </div>
      </div>
    </div>
  );
};

export default QuestionsResultModal;
