
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { generateAIResponse } from '@/services/aiChatService';
import TypewriterEffect from '@/components/ui/typewriter-effect';

interface AprofundarModalProps {
  isOpen: boolean;
  onClose: () => void;
  messages: any[];
  sessionId: string;
  setShowAprofundarModal: (value: boolean) => void;
  toast?: any;
}

const AprofundarModal = ({ isOpen, onClose, messages, sessionId, setShowAprofundarModal, toast }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExploring, setIsExploring] = useState(false);
  const [aprofundadoContent, setAprofundadoContent] = useState('');
  const [currentTab, setCurrentTab] = useState('historia');

  // Encontrar a última mensagem do assistente para aprofundar
  const getLastAssistantMessage = () => {
    const assistantMessages = messages.filter(msg => msg.sender === 'assistant');
    if (assistantMessages.length > 0) {
      return assistantMessages[assistantMessages.length - 1].content;
    }
    return null;
  };

  useEffect(() => {
    // Quando o modal é aberto, gera automaticamente o conteúdo aprofundado
    if (isOpen) {
      generateDeepContent();
    }
  }, [isOpen]);

  const generateDeepContent = async () => {
    setIsLoading(true);
    try {
      const lastMessageContent = getLastAssistantMessage();
      
      if (!lastMessageContent) {
        setAprofundadoContent("Não foi possível encontrar uma resposta recente da IA para aprofundar.");
        setIsLoading(false);
        return;
      }
      
      const prompt = `
      Analise profundamente o tema contido na mensagem a seguir e crie uma explicação muito mais detalhada e educativa. 
      Enriqueça o conteúdo com:
      
      1. Explicações conceituais mais profundas
      2. Contexto histórico e evolução do tema
      3. Aplicações práticas e exemplos detalhados
      4. Referências a estudos/pesquisas relevantes
      5. Conexões interdisciplinares
      
      Use formatação Markdown para melhorar a legibilidade.
      Organize o conteúdo em seções claras e bem estruturadas.
      Escreva em tom educacional mas acessível.
      
      Mensagem original: "${lastMessageContent}"
      `;
      
      const deepContent = await generateAIResponse(prompt, sessionId);
      setAprofundadoContent(deepContent);
    } catch (error) {
      console.error("Erro ao gerar conteúdo aprofundado:", error);
      setAprofundadoContent("Ocorreu um erro ao gerar o conteúdo aprofundado. Por favor, tente novamente.");
      
      if (toast) {
        toast({
          title: "Erro",
          description: "Não foi possível gerar o conteúdo aprofundado",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Se o modal não estiver aberto, não renderize nada
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col animate-fadeIn">
        {/* Cabeçalho */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Explicação Avançada</h2>
          <Button variant="ghost" onClick={onClose} className="h-8 w-8 p-0 rounded-full">
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </Button>
        </div>
        
        {/* Navegação por abas */}
        <div className="flex border-b border-gray-200 dark:border-gray-700 px-6">
          <button
            className={`px-4 py-2 font-medium text-sm ${currentTab === 'historia' ? 
              'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400' : 
              'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => setCurrentTab('historia')}
          >
            Contexto Aprofundado
          </button>
          <button
            className={`px-4 py-2 font-medium text-sm ${currentTab === 'cientifico' ? 
              'text-orange-600 dark:text-orange-400 border-b-2 border-orange-600 dark:border-orange-400' : 
              'text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200'}`}
            onClick={() => setCurrentTab('cientifico')}
          >
            Recursos Educacionais
          </button>
        </div>
        
        {/* Conteúdo */}
        <ScrollArea className="flex-grow p-6">
          {currentTab === 'historia' && (
            <div className="prose prose-sm dark:prose-invert max-w-none">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="typewriter mb-4">
                    <div className="slide"></div>
                    <div className="paper"></div>
                    <div className="keyboard"></div>
                  </div>
                  <p className="text-gray-500 dark:text-gray-400 animate-pulse">Preparando conteúdo...</p>
                </div>
              ) : (
                <div 
                  className="formatted-content" 
                  dangerouslySetInnerHTML={{ 
                    __html: aprofundadoContent
                      // Headers
                      .replace(/^# (.*?)$/gm, '<h1 class="text-2xl font-bold text-gray-900 dark:text-gray-100 border-b pb-1 border-gray-200 dark:border-gray-700 mb-4">$1</h1>')
                      .replace(/^## (.*?)$/gm, '<h2 class="text-xl font-semibold text-gray-800 dark:text-gray-200 mt-6 mb-3">$1</h2>')
                      .replace(/^### (.*?)$/gm, '<h3 class="text-lg font-medium text-gray-800 dark:text-gray-200 mt-4 mb-2">$1</h3>')

                      // Text formatting
                      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900 dark:text-white">$1</strong>')
                      .replace(/\_(.*?)\_/g, '<em class="text-gray-700 dark:text-gray-300 italic">$1</em>')
                      .replace(/\~\~(.*?)\~\~/g, '<del class="text-gray-500 dark:text-gray-400">$1</del>')
                      .replace(/\`(.*?)\`/g, '<code class="bg-gray-100 dark:bg-gray-800 text-orange-600 dark:text-orange-400 px-1.5 py-0.5 rounded text-sm font-mono">$1</code>')

                      // Lists
                      .replace(/^- (.*?)$/gm, '<ul class="list-disc pl-5 my-2"><li>$1</li></ul>').replace(/<\/ul>\s?<ul class="list-disc pl-5 my-2">/g, '')
                      .replace(/^[0-9]+\. (.*?)$/gm, '<ol class="list-decimal pl-5 my-2"><li>$1</li></ol>').replace(/<\/ol>\s?<ol class="list-decimal pl-5 my-2">/g, '')

                      // Blockquotes
                      .replace(/^> (.*?)$/gm, '<blockquote class="pl-3 border-l-4 border-orange-400 dark:border-orange-600 italic bg-orange-50 dark:bg-orange-900/20 py-1 px-2 rounded-r my-2 text-gray-700 dark:text-gray-300">$1</blockquote>')

                      // Separators
                      .replace(/^---$/gm, '<hr class="border-t border-gray-200 dark:border-gray-700 my-3" />')

                      // Line breaks
                      .replace(/\n/g, '<br />')

                      // Links
                      .replace(/\[(.*?)\]\((https?:\/\/[^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-orange-600 dark:text-orange-400 hover:underline inline-flex items-center gap-0.5">$1<svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="ml-0.5"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg></a>')
                  }} 
                />
              )}
            </div>
          )}
          
          {currentTab === 'cientifico' && (
            <div className="space-y-6">
              <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">Recursos Recomendados</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Livros e Artigos</p>
                      <p className="text-gray-600 dark:text-gray-400">Materiais selecionados da Biblioteca para aprofundamento no tema.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Vídeos Explicativos</p>
                      <p className="text-gray-600 dark:text-gray-400">Conteúdo visual que facilita a compreensão de conceitos complexos.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Grupos de Estudo</p>
                      <p className="text-gray-600 dark:text-gray-400">Encontre alunos com interesses similares para discutir este tema.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">Atividades Práticas</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Exercícios Resolvidos</p>
                      <p className="text-gray-600 dark:text-gray-400">Exemplos práticos passo a passo para fixação do conteúdo.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Desafios e Problemas</p>
                      <p className="text-gray-600 dark:text-gray-400">Questões que estimulam o pensamento crítico e aprofundam o aprendizado.</p>
                    </div>
                  </li>
                </ul>
              </div>
              
              <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                <h3 className="text-base font-medium text-gray-800 dark:text-gray-200 mb-2">Ferramentas Complementares</h3>
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Simuladores Interativos</p>
                      <p className="text-gray-600 dark:text-gray-400">Explore conceitos em ambiente virtual para melhor visualização.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-2">
                    <svg className="h-5 w-5 text-green-500 flex-shrink-0 mt-0.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                    </svg>
                    <div>
                      <p className="font-medium text-gray-800 dark:text-gray-200">Mapas Mentais</p>
                      <p className="text-gray-600 dark:text-gray-400">Organizadores visuais que conectam conceitos e ideias principais.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          )}
        </ScrollArea>
        
        {/* Rodapé com botões de ação */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <Button
            variant="outline"
            onClick={() => {
              if (toast) {
                toast({
                  title: "Conteúdo Salvo",
                  description: "O material aprofundado foi salvo na sua biblioteca",
                });
              }
            }}
            className="text-gray-600 dark:text-gray-400"
          >
            <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
            Salvar na Biblioteca
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={onClose}
              className="text-gray-600 dark:text-gray-400"
            >
              Fechar
            </Button>
            
            <Button
              onClick={() => {
                setIsExploring(true);
                setTimeout(() => {
                  setIsExploring(false);
                  if (toast) {
                    toast({
                      title: "Modo Exploração",
                      description: "Você está explorando o tema em uma nova seção",
                    });
                  }
                }, 1500);
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
              disabled={isExploring}
            >
              {isExploring ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processando...
                </>
              ) : (
                <>
                  <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  Explorar Mais
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AprofundarModal;
