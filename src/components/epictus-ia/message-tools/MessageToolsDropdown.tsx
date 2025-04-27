import React, { useState, useRef, useEffect } from "react";
import { Wrench, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { FerramentasEmDesenvolvimentoModal } from "./index";
import { generateAIResponse } from "@/services/aiChatService";

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
        setModalOpen(false);
        setShowDevModal(true);
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
      onClick: (e) => {
        e.stopPropagation();

        // Fechar menu de contexto
        onToggleTools();

        // Obter a mensagem para converter para formato de caderno
        if (content) {
          // Mostrar notificação de processamento
          toast({
            title: "Caderno de Anotações",
            description: "Convertendo conteúdo para formato de caderno...",
            duration: 2000,
          });

          // Gerar prompt para conversão para formato de caderno
          const notebookPrompt = `
          A partir da explicação abaixo, crie uma versão resumida no formato de caderno de anotações estudantil.

          Siga estas diretrizes OBRIGATÓRIAS:
          - Comece com um título direto sobre o tema (sem introduções ou saudações)
          - Liste apenas os pontos principais usando marcadores (•)
          - Destaque palavras-chave usando **asteriscos duplos** 
          - Organize o conteúdo com títulos em maiúsculas seguidos de dois pontos
          - Use uma linguagem técnica e direta
          - Inclua fórmulas, regras e definições com linguagem precisa
          - NÃO INCLUA LINKS PARA NENHUM SITE OU PLATAFORMA
          - NÃO FAÇA REFERÊNCIAS A RECURSOS EXTERNOS OU PLATAFORMAS ESPECÍFICAS
          - NÃO MENCIONE A PONTO.SCHOOL OU QUALQUER OUTRA PLATAFORMA
          - NÃO INCLUA SAUDAÇÕES, INTRODUÇÕES OU CONCLUSÕES
          - NÃO TERMINE COM MENSAGENS MOTIVACIONAIS OU CHAMADAS PARA AÇÃO
          - FOQUE APENAS NO CONTEÚDO EDUCACIONAL
          - Limite a explicação a no máximo 250 palavras

          Explicação original:
          "${content}"
          `;

          // Fechar modal de ferramentas
          setModalOpen(false);

          try {
            // Chamar serviço para converter conteúdo
            generateAIResponse(notebookPrompt, 'notebook_conversion_session', {
              intelligenceLevel: 'advanced',
              languageStyle: 'formal'
            })
            .then(notebookContent => {
              if (!notebookContent) {
                throw new Error("Conteúdo vazio recebido do serviço");
              }

              // Criar e adicionar o modal diretamente ao DOM
              const modalHTML = `
                <div id="notebook-modal" class="fixed inset-0 flex items-center justify-center z-[1000]">
                  <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                  <div class="relative bg-[#fffdf0] dark:bg-[#1e1e18] w-[95%] max-w-3xl max-h-[80vh] rounded-lg border border-gray-400 dark:border-gray-600 shadow-2xl overflow-hidden">
                    <!-- Cabeçalho do caderno -->
                    <div class="flex justify-between items-center px-4 py-2 bg-amber-100 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-600">
                      <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#FF6B00]">
                          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                          <polyline points="14 2 14 8 20 8"></polyline>
                          <line x1="16" y1="13" x2="8" y2="13"></line>
                          <line x1="16" y1="17" x2="8" y2="17"></line>
                          <polyline points="10 9 9 9 8 9"></polyline>
                        </svg>
                        Caderno de Anotações
                      </h3>
                      <button
                        id="close-notebook-modal"
                        class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>

                    <!-- Conteúdo do caderno com linhas -->
                    <div class="h-[50vh] bg-[#fffdf0] dark:bg-[#1e1e18] p-4 notebook-lines overflow-y-auto">
                      <div class="notebook-simulation p-4">
                        <div 
                          class="w-full text-gray-800 dark:text-gray-200 whitespace-pre-line leading-loose px-3"
                          style="background-image: linear-gradient(#aaa 1px, transparent 1px); background-size: 100% 28px; line-height: 28px; font-family: 'Architects Daughter', cursive, system-ui; letter-spacing: 0.5px; font-size: 1.05rem; text-shadow: 0px 0px 0.3px rgba(0,0,0,0.3);"
                          id="notebook-content"
                        ></div>
                      </div>
                    </div>

                    <!-- Rodapé com ações -->
                    <div class="p-3 border-t border-gray-400 dark:border-gray-600 bg-amber-100 dark:bg-gray-800 flex justify-between">
                      <button 
                        id="copy-notebook-content"
                        class="px-3 py-1.5 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700 rounded-md flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                        Copiar texto
                      </button>

                      <button 
                        id="download-notebook-content"
                        class="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-md flex items-center gap-1.5"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                          <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                          <polyline points="7 10 12 15 17 10"></polyline>
                          <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                        Baixar
                      </button>
                    </div>
                  </div>
                </div>
              `;

              // Remover qualquer modal existente
              const existingModal = document.getElementById('notebook-modal');
              if (existingModal) {
                existingModal.remove();
              }

              // Adicionar o novo modal ao DOM
              document.body.insertAdjacentHTML('beforeend', modalHTML);

              // Processar o conteúdo para o formato do caderno
              const processNotebookContent = (content) => {
                return content
                  .replace(/•/g, '<span class="text-[#FF6B00] text-lg">✎</span>')
                  .replace(/(\*\*|__)([^*_]+)(\*\*|__)/g, '<span class="underline decoration-wavy decoration-[#FF6B00]/70 font-bold">$2</span>')
                  .replace(/(^|\n)([A-Z][^:\n]+:)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold">$2</span>');
              };

              // Adicionar o conteúdo ao modal
              const notebookContentElement = document.getElementById('notebook-content');
              if (notebookContentElement) {
                notebookContentElement.innerHTML = processNotebookContent(notebookContent);
              }

              // Adicionar event listeners
              const closeButton = document.getElementById('close-notebook-modal');
              const copyButton = document.getElementById('copy-notebook-content');
              const downloadButton = document.getElementById('download-notebook-content');
              const modal = document.getElementById('notebook-modal');

              if (closeButton) {
                closeButton.addEventListener('click', () => {
                  if (modal) modal.remove();
                });
              }

              if (modal) {
                modal.addEventListener('click', (e) => {
                  if (e.target === modal.querySelector('.absolute')) {
                    modal.remove();
                  }
                });
              }

              if (copyButton) {
                copyButton.addEventListener('click', () => {
                  navigator.clipboard.writeText(notebookContent);
                  toast({
                    title: "Conteúdo copiado!",
                    description: "As anotações foram copiadas para a área de transferência",
                    duration: 3000,
                  });
                });
              }

              if (downloadButton) {
                downloadButton.addEventListener('click', () => {
                  const blob = new Blob([notebookContent], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `caderno-anotacoes-${Date.now()}.txt`;
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                  URL.revokeObjectURL(url);

                  toast({
                    title: "Download iniciado",
                    description: "Seu caderno de anotações está sendo baixado",
                    duration: 3000,
                  });
                });
              }
            })
            .catch(error => {
              console.error("Erro ao converter para formato de caderno:", error);
              toast({
                title: "Erro",
                description: "Não foi possível converter o conteúdo para o formato de caderno.",
                variant: "destructive",
                duration: 3000,
              });
            });
          } catch (error) {
            console.error("Erro ao processar a conversão para caderno:", error);
            toast({
              title: "Erro",
              description: "Ocorreu um erro ao processar a conversão para o caderno.",
              variant: "destructive",
              duration: 3000,
            });
          }
        } else {
          toast({
            title: "Aviso",
            description: "Nenhum conteúdo disponível para converter.",
            duration: 3000,
          });
        }
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
                // Fechar menu de contexto
                onToggleTools();

                // Obter a mensagem para converter para formato de caderno
                if (content) {
                  // Mostrar notificação de processamento
                  toast({
                    title: "Caderno de Anotações",
                    description: "Convertendo conteúdo para formato de caderno...",
                    duration: 2000,
                  });

                  // Gerar prompt para conversão para formato de caderno
                  const notebookPrompt = `
                  A partir da explicação abaixo, crie uma versão resumida no formato de caderno de anotações estudantil.

                  Siga estas diretrizes OBRIGATÓRIAS:
                  - Comece com um título direto sobre o tema (sem introduções ou saudações)
                  - Liste apenas os pontos principais usando marcadores (•)
                  - Destaque palavras-chave usando **asteriscos duplos** 
                  - Organize o conteúdo com títulos em maiúsculas seguidos de dois pontos
                  - Use uma linguagem técnica e direta
                  - Inclua fórmulas, regras e definições com linguagem precisa
                  - NÃO INCLUA LINKS PARA NENHUM SITE OU PLATAFORMA
                  - NÃO FAÇA REFERÊNCIAS A RECURSOS EXTERNOS OU PLATAFORMAS ESPECÍFICAS
                  - NÃO MENCIONE A PONTO.SCHOOL OU QUALQUER OUTRA PLATAFORMA
                  - NÃO INCLUA SAUDAÇÕES, INTRODUÇÕES OU CONCLUSÕES
                  - NÃO TERMINE COM MENSAGENS MOTIVACIONAIS OU CHAMADAS PARA AÇÃO
                  - FOQUE APENAS NO CONTEÚDO EDUCACIONAL
                  - Limite a explicação a no máximo 250 palavras

                  Explicação original:
                  "${content}"
                  `;

                  // Mostrar modal de carregamento
                  setModalOpen(false);

                  // Chamar serviço para converter conteúdo
                  generateAIResponse(notebookPrompt, 'notebook_conversion_session', {
                    intelligenceLevel: 'advanced',
                    languageStyle: 'formal'
                  })
                  .then(notebookContent => {
                    // Criar e adicionar o modal diretamente ao DOM
                    const modalHTML = `
                      <div id="notebook-modal" class="fixed inset-0 flex items-center justify-center z-50">
                        <div class="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>
                        <div class="relative bg-[#fffdf0] dark:bg-[#1e1e18] w-[95%] max-w-3xl max-h-[70vh] rounded-lg border border-gray-400 dark:border-gray-600 shadow-2xl overflow-hidden">
                          <!-- Cabeçalho do caderno -->
                          <div class="flex justify-between items-center px-4 py-2 bg-amber-100 dark:bg-gray-800 border-b border-gray-400 dark:border-gray-600">
                            <h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center gap-2">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-[#FF6B00]">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                <polyline points="14 2 14 8 20 8"></polyline>
                                <line x1="16" y1="13" x2="8" y2="13"></line>
                                <line x1="16" y1="17" x2="8" y2="17"></line>
                                <polyline points="10 9 9 9 8 9"></polyline>
                              </svg>
                              Caderno de Anotações
                            </h3>
                            <button
                              id="close-notebook-modal"
                              class="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                              </svg>
                            </button>
                          </div>

                          <!-- Conteúdo do caderno com linhas -->
                          <div class="h-[50vh] bg-[#fffdf0] dark:bg-[#1e1e18] p-4 notebook-lines overflow-y-auto">
                            <div class="notebook-simulation p-4">
                              <div 
                                class="w-full text-gray-800 dark:text-gray-200 whitespace-pre-line leading-loose px-3"
                                style="background-image: linear-gradient(#aaa 1px, transparent 1px); background-size: 100% 28px; line-height: 28px; font-family: 'Architects Daughter', cursive, system-ui; letter-spacing: 0.5px; font-size: 1.05rem; text-shadow: 0px 0px 0.3px rgba(0,0,0,0.3);"
                                id="notebook-content"
                              ></div>
                            </div>
                          </div>

                          <!-- Rodapé com ações -->
                          <div class="p-3 border-t border-gray-400 dark:border-gray-600 bg-amber-100 dark:bg-gray-800 flex justify-between">
                            <button 
                              id="copy-notebook-content"
                              class="px-3 py-1.5 text-gray-800 dark:text-gray-200 border border-gray-400 dark:border-gray-600 hover:bg-amber-200 dark:hover:bg-gray-700 rounded-md flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                              </svg>
                              Copiar texto
                            </button>

                            <button 
                              id="download-notebook-content"
                              class="px-3 py-1.5 bg-[#FF6B00] hover:bg-[#FF6B00]/90 text-white rounded-md flex items-center gap-1.5"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                <polyline points="7 10 12 15 17 10"></polyline>
                                <line x1="12" y1="15" x2="12" y2="3"></line>
                              </svg>
                              Baixar
                            </button>
                          </div>
                        </div>
                      </div>
                    `;

                    // Remover qualquer modal existente
                    const existingModal = document.getElementById('notebook-modal');
                    if (existingModal) {
                      existingModal.remove();
                    }

                    // Adicionar o novo modal ao DOM
                    document.body.insertAdjacentHTML('beforeend', modalHTML);

                    // Processar o conteúdo para o formato do caderno
                    const processNotebookContent = (content) => {
                      if (!content) return '';
                      return content
                        .replace(/•/g, '<span class="text-[#FF6B00] text-lg">✎</span>')
                        .replace(/(\*\*|__)([^*_]+)(\*\*|__)/g, '<span class="underline decoration-wavy decoration-[#FF6B00]/70 font-bold">$2</span>')
                        .replace(/(^|\n)([A-Z][^:\n]+:)/g, '$1<span class="text-[#3a86ff] dark:text-[#4cc9f0] font-bold">$2</span>');
                    };

                    // Adicionar o conteúdo ao modal
                    setTimeout(() => {
                      const notebookContentElement = document.getElementById('notebook-content');
                      if (notebookContentElement) {
                        notebookContentElement.innerHTML = processNotebookContent(notebookContent);
                      }
                    }, 100); // Pequeno atraso para garantir que o DOM esteja pronto

                    // Adicionar event listeners
                    setTimeout(() => {
                      const closeButton = document.getElementById('close-notebook-modal');
                      const copyButton = document.getElementById('copy-notebook-content');
                      const downloadButton = document.getElementById('download-notebook-content');
                      const modal = document.getElementById('notebook-modal');
  
                      if (closeButton && modal) {
                        closeButton.addEventListener('click', () => {
                          modal.remove();
                        });
                      }

                    if (modal) {
                      const backdropElement = modal.querySelector('.absolute');
                      if (backdropElement) {
                        modal.addEventListener('click', (e) => {
                          if (e.target === backdropElement) {
                            modal.remove();
                          }
                        });
                      }
                    }

                    if (copyButton) {
                      copyButton.addEventListener('click', () => {
                        navigator.clipboard.writeText(notebookContent);
                        toast({
                          title: "Conteúdo copiado!",
                          description: "As anotações foram copiadas para a área de transferência",
                          duration: 3000,
                        });
                      });
                    }

                    if (downloadButton) {
                      downloadButton.addEventListener('click', () => {
                        const blob = new Blob([notebookContent], { type: 'text/plain' });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = `caderno-anotacoes-${Date.now()}.txt`;
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);

                        toast({
                          title: "Download iniciado",
                          description: "Seu caderno de anotações está sendo baixado",
                          duration: 3000,
                        });
                      });
                    }
                    }, 200); // Fim do setTimeout
                  })
                  .catch(error => {
                    console.error("Erro ao converter para formato de caderno:", error);
                    toast({
                      title: "Erro",
                      description: "Não foi possível converter o conteúdo para o formato de caderno.",
                      variant: "destructive",
                      duration: 3000,
                    });
                  });
                } else {
                  toast({
                    title: "Aviso",
                    description: "Nenhum conteúdo disponível para converter.",
                    duration: 3000,
                  });
                }
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

      {/* Modal de funcionalidade em desenvolvimento */}
      <FerramentasEmDesenvolvimentoModal 
        open={showDevModal} 
        onClose={() => setShowDevModal(false)} 
      />
    </>
  );
};

export default MessageToolsDropdown;