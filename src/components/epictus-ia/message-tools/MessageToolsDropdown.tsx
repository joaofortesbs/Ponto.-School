
import React, { useState, useRef, useEffect } from "react";
import { Wrench } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

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

  const tools = [
    {
      id: "deep-dive",
      title: "Aprofundar no tema",
      description: "Explorar o tema com explicações detalhadas e avançadas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-500 dark:text-blue-400">
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="12" y1="8" x2="12" y2="16"></line>
          <line x1="8" y1="12" x2="16" y2="12"></line>
        </svg>
      ),
      onClick: () => {
        toast({
          title: "Aprofundando no tema",
          description: "Gerando conteúdo mais detalhado sobre este tópico...",
          duration: 3000,
        });
        setModalOpen(false);
      }
    },
    {
      id: "question-simulator",
      title: "Simulador de questões",
      description: "Teste seu conhecimento com questões personalizadas",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-500 dark:text-orange-400">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
      ),
      onClick: () => {
        toast({
          title: "Simulador de questões",
          description: "Iniciando simulador de questões para este tema...",
          duration: 3000,
        });
        setModalOpen(false);
      }
    },
    {
      id: "notebook",
      title: "Escrever no Caderno",
      description: "Salve este conteúdo em seu caderno de estudos",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-green-500 dark:text-green-400">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
          <polyline points="14 2 14 8 20 8"></polyline>
          <line x1="16" y1="13" x2="8" y2="13"></line>
          <line x1="16" y1="17" x2="8" y2="17"></line>
          <polyline points="10 9 9 9 8 9"></polyline>
        </svg>
      ),
      onClick: () => {
        toast({
          title: "Caderno de Anotações",
          description: "Convertendo conteúdo para formato de caderno...",
          duration: 2000,
        });
        setModalOpen(false);
      }
    },
    {
      id: "presentation",
      title: "Simular Apresentação",
      description: "Transforme este conteúdo em slides para apresentação",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-500 dark:text-purple-400">
          <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
          <line x1="8" y1="21" x2="16" y2="21"></line>
          <line x1="12" y1="17" x2="12" y2="21"></line>
        </svg>
      ),
      onClick: () => {
        toast({
          title: "Modo Apresentação",
          description: "Iniciando simulação de apresentação deste conteúdo...",
          duration: 3000,
        });
        setModalOpen(false);
      }
    }
  ];

  return (
    <>
      <div className="relative" onClick={(e) => e.stopPropagation()}>
        <button 
          onClick={openModal}
          className="p-1 rounded-full transition-colors hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00]"
          title="Ferramentas"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-3.5 w-3.5 text-gray-500 dark:text-gray-400">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"></path>
          </svg>
        </button>
        
        {showTools && (
          <div className="absolute z-50 top-full right-0 mt-1 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg py-1 border border-gray-200 dark:border-gray-700">
            <button 
              className="w-full text-left px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-[#FF6B00] dark:hover:text-[#FF6B00] flex items-center"
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Aprofundando no tema",
                  description: "Gerando conteúdo mais detalhado sobre este tópico...",
                  duration: 3000,
                });
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
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Simulador de questões",
                  description: "Iniciando simulador de questões para este tema...",
                  duration: 3000,
                });
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Caderno de Anotações",
                  description: "Convertendo conteúdo para formato de caderno...",
                  duration: 2000,
                });
              }}
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
              onClick={(e) => {
                e.stopPropagation();
                toast({
                  title: "Modo Apresentação",
                  description: "Iniciando simulação de apresentação deste conteúdo...",
                  duration: 3000,
                });
              }}
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-md bg-gradient-to-b from-[#1A2634] to-[#253245] border-[#3A4B5C]/50 text-white p-0 overflow-hidden">
          <div className="bg-gradient-to-r from-[#0D23A0] to-[#5B21BD] p-4">
            <h2 className="text-lg font-semibold flex items-center space-x-2">
              <Wrench className="h-5 w-5 mr-2" />
              Ferramentas Epictus IA
            </h2>
            <p className="text-sm text-white/70 mt-1">
              Transforme este conteúdo com nossas ferramentas inteligentes
            </p>
          </div>

          <div className="p-4 grid grid-cols-1 gap-3">
            {tools.map((tool) => (
              <button
                key={tool.id}
                onClick={(e) => {
                  e.stopPropagation();
                  tool.onClick();
                }}
                className="flex items-start space-x-3 p-3 rounded-lg transition-all hover:bg-[#2A3645]/70 border border-[#3A4B5C]/30 hover:border-[#FF6B00]/30 group"
              >
                <div className="bg-[#1E293B]/70 rounded-full p-2 group-hover:bg-[#0D23A0]/20">
                  {tool.icon}
                </div>
                <div className="flex-1 text-left">
                  <h3 className="font-medium text-white group-hover:text-[#FF6B00]">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-white/60 mt-1">
                    {tool.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="bg-[#1A2634]/70 border-t border-[#3A4B5C]/30 p-3 flex justify-end">
            <button
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 rounded text-sm bg-[#2A3645] hover:bg-[#3A4B5C] text-white transition-colors"
            >
              Fechar
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default MessageToolsDropdown;
