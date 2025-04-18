
import React from "react";
import { X } from "lucide-react";

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AprofundarModal: React.FC<AprofundarModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999]" onClick={onClose}>
      <div 
        className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-4 shadow-xl w-[280px] animate-fadeIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-base font-semibold text-gray-800 dark:text-gray-200">
            Aprofundar no tema
          </h3>
          <button 
            onClick={onClose}
            className="h-6 w-6 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        
        <div className="space-y-2">
          <button className="w-full text-left p-2 flex items-center gap-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors opacity-70 cursor-not-allowed">
            <span className="text-blue-500">🔍</span> Explicação Avançada
          </button>
          <button className="w-full text-left p-2 flex items-center gap-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors opacity-70 cursor-not-allowed">
            <span className="text-orange-500">📌</span> Tópicos Relacionados
          </button>
          <button className="w-full text-left p-2 flex items-center gap-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors opacity-70 cursor-not-allowed">
            <span className="text-green-500">📖</span> Exemplos Práticos
          </button>
          <button className="w-full text-left p-2 flex items-center gap-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors opacity-70 cursor-not-allowed">
            <span className="text-amber-500">⚠️</span> Erros Comuns e Dicas
          </button>
          <button className="w-full text-left p-2 flex items-center gap-2 text-sm rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700/50 transition-colors opacity-70 cursor-not-allowed">
            <span className="text-purple-500">📚</span> Explore Fontes
          </button>
        </div>
      </div>
    </div>
  );
};

export default AprofundarModal;
