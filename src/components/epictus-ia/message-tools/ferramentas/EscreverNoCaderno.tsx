
import React, { useState } from 'react';
import { useToast } from '@/components/ui/use-toast';
import { convertToNotebookFormat } from '@/services/notebookService';
import { NotebookModal } from '@/components/epictus-ia/notebook-simulation';

interface EscreverNoCadernoProps {
  messageContent: string;
}

const EscreverNoCaderno: React.FC<EscreverNoCadernoProps> = ({ messageContent }) => {
  const { toast } = useToast();
  const [showNotebookModal, setShowNotebookModal] = useState(false);

  const handleClick = () => {
    setShowNotebookModal(true);
    toast({
      title: "Gerando anotações para o caderno",
      description: "Seu conteúdo está sendo transformado em formato de caderno",
    });
  };

  return (
    <>
      <button 
        onClick={handleClick}
        className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-md w-full"
      >
        <span className="w-5 h-5 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
          </svg>
        </span>
        <span>Escrever no Caderno</span>
      </button>

      {showNotebookModal && (
        <NotebookModal 
          isOpen={showNotebookModal}
          onClose={() => setShowNotebookModal(false)}
          content={messageContent}
        />
      )}
    </>
  );
};

export default EscreverNoCaderno;
