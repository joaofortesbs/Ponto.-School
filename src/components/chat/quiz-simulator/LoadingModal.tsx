
import React from 'react';

interface LoadingModalProps {
  message?: string;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ message = "Gerando questões" }) => {
  return (
    <div id="questions-loading-modal" className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-orange-200 dark:border-orange-700 p-5 shadow-xl w-[90%] max-w-sm animate-fadeIn flex flex-col items-center">
        <div className="w-16 h-16 mb-4">
          <div className="w-full h-full rounded-full border-4 border-orange-100 dark:border-orange-900/30 border-t-orange-500 animate-spin"></div>
        </div>
        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-2">{message}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
          Aguarde enquanto criamos questões personalizadas com base no conteúdo estudado...
        </p>
      </div>
    </div>
  );
};

export default LoadingModal;
