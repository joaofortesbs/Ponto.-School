import React, { useState, useEffect } from "react";
import { toast } from "@/components/ui/use-toast";
import { FerramentasEmDesenvolvimentoModal } from "./index";
import { FerramentasModal } from "./ferramentas";

interface MessageToolsDropdownProps {
  messageId: number;
  content: string;
  showTools: boolean;
  onToggleTools: (e?: React.MouseEvent) => void;
}

const MessageToolsDropdown: React.FC<MessageToolsDropdownProps> = ({
  messageId,
  content,
  showTools,
  onToggleTools
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [showDevModal, setShowDevModal] = useState(false);

  const openModal = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModalOpen(true);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (showTools) {
        onToggleTools();
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showTools, onToggleTools]);

  const handleAprofundarClick = () => {
    setShowDevModal(true);
  };

  const handleSimuladorQuestoes = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Simulador de questões",
      description: "Iniciando simulador de questões para este tema...",
      duration: 3000,
    });
  };

  const handleEscreverNoCaderno = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Caderno de Anotações",
      description: "Convertendo conteúdo para formato de caderno...",
      duration: 2000,
    });
  };

  const handleSimularApresentacao = (e: React.MouseEvent) => {
    e.stopPropagation();
    toast({
      title: "Modo Apresentação",
      description: "Iniciando simulação de apresentação deste conteúdo...",
      duration: 3000,
    });
  };

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={openModal}
          className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
          title="Ferramentas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3 w-3 text-gray-500 dark:text-gray-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </button>

        {showTools && (
          <div className="absolute z-50 top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                setShowDevModal(true);
              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5 text-blue-500 dark:text-blue-400">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="16"></line>
                <line x1="8" y1="12" x2="16" y2="12"></line>
              </svg>
              Aprofundar no tema
            </button>

            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center"
              onClick={handleSimuladorQuestoes}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5 text-orange-500 dark:text-orange-400">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              Simulador de questões
            </button>

            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center"
              onClick={handleEscreverNoCaderno}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5 text-green-500 dark:text-green-400">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                <polyline points="14 2 14 8 20 8"></polyline>
                <line x1="16" y1="13" x2="8" y2="13"></line>
                <line x1="16" y1="17" x2="8" y2="17"></line>
                <polyline points="10 9 9 9 8 9"></polyline>
              </svg>
              Escrever no Caderno
            </button>

            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center"
              onClick={handleSimularApresentacao}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 mr-1.5 text-purple-500 dark:text-purple-400">
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
                <line x1="8" y1="21" x2="16" y2="21"></line>
                <line x1="12" y1="17" x2="12" y2="21"></line>
              </svg>
              Simular Apresentação
            </button>
          </div>
        )}
      </div>

      {/* Modal principal de ferramentas */}
      <FerramentasModal 
        open={modalOpen} 
        onOpenChange={setModalOpen}
        onAprofundarClick={handleAprofundarClick}
        currentContent={content} // Passando o conteúdo para o modal
      />

      {/* Modal de funcionalidade em desenvolvimento */}
      <FerramentasEmDesenvolvimentoModal 
        open={showDevModal} 
        onClose={() => setShowDevModal(false)} 
      />
    </>
  );
};

export default MessageToolsDropdown;