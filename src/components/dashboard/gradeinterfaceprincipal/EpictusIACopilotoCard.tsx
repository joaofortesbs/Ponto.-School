import React, { useState, useEffect } from "react";
import { Brain, Lightbulb, Send, ArrowRight, BarChart2, Sparkles, Calendar, BookOpen, FileText, CheckCircle2, Zap, X } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function EpictusIACopilotoCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const [pergunta, setPergunta] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showChatBox, setShowChatBox] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [welcomeState, setWelcomeState] = useState("initial");
  const [showTypingIndicator, setShowTypingIndicator] = useState(false);
  const [currentSuggestions, setCurrentSuggestions] = useState([]);
  const navigate = useNavigate();

  // Nome do usuário (poderia vir de um contexto/hook global)
  const userName = localStorage.getItem("userName") || "Estudante";
  
  // Simular obtenção de dados contextuais
  const [contextData, setContextData] = useState({
    nextEvent: null,
    pendingTasks: 0,
    recentSubject: "",
    hasUpcomingTest: false
  });

  // Sugestões de ferramentas do Epictus IA
  const toolSuggestions = [
    {
      id: "resumo",
      icon: <FileText className="h-4 w-4 text-white" />,
      text: "Gerar Resumo Rápido",
      action: () => handleToolAction("resumo")
    },
    {
      id: "planejamento",
      icon: <Calendar className="h-4 w-4 text-white" />,
      text: "Planejar Minha Semana",
      action: () => handleToolAction("planejamento")
    },
    {
      id: "dica",
      icon: <Lightbulb className="h-4 w-4 text-white" />,
      text: "Dica de Estudo",
      action: () => handleToolAction("dica")
    },
    {
      id: "quiz",
      icon: <CheckCircle2 className="h-4 w-4 text-white" />,
      text: "Gerar Quiz Rápido",
      action: () => handleToolAction("quiz")
    }
  ];

  // Efeito para simular obtenção de dados contextuais
  useEffect(() => {
    // Simulação - em produção, isso viria de APIs/serviços reais
    const loadContextData = () => {
      // Simular diferentes cenários baseados na hora do dia
      const hour = new Date().getHours();
      
      if (hour < 12) {
        setContextData({
          nextEvent: { title: "Aula de Matemática", time: "10:00" },
          pendingTasks: 3,
          recentSubject: "Álgebra Linear",
          hasUpcomingTest: true
        });
        setWelcomeState("morning");
      } else if (hour < 18) {
        setContextData({
          nextEvent: { title: "Entrega de Trabalho", time: "18:00" },
          pendingTasks: 2,
          recentSubject: "História",
          hasUpcomingTest: false
        });
        setWelcomeState("afternoon");
      } else {
        setContextData({
          nextEvent: null,
          pendingTasks: 5,
          recentSubject: "Física",
          hasUpcomingTest: false
        });
        setWelcomeState("evening");
      }
    };

    loadContextData();
  }, []);

  // Efeito para configurar sugestões com base no contexto
  useEffect(() => {
    let suggestions = [];
    
    switch (welcomeState) {
      case "morning":
        // Manhã - Foco em preparação para o dia
        suggestions = [toolSuggestions[0], toolSuggestions[1], toolSuggestions[2]];
        if (contextData.hasUpcomingTest) {
          suggestions = [toolSuggestions[3], ...suggestions.slice(0, 2)];
        }
        break;
      case "afternoon":
        // Tarde - Foco em reforço de aprendizado
        suggestions = [toolSuggestions[0], toolSuggestions[3], toolSuggestions[2]];
        break;
      case "evening":
        // Noite - Foco em organização para o dia seguinte
        suggestions = [toolSuggestions[1], toolSuggestions[0], toolSuggestions[2]];
        break;
      default:
        suggestions = [toolSuggestions[0], toolSuggestions[1], toolSuggestions[2]];
    }
    
    setCurrentSuggestions(suggestions.slice(0, 3));
  }, [welcomeState, contextData]);

  // Gerar a mensagem de boas-vindas contextual
  const getWelcomeMessage = () => {
    const greetings = {
      morning: `Bom dia, ${userName}!`,
      afternoon: `Boa tarde, ${userName}!`,
      evening: `Boa noite, ${userName}!`,
      initial: `Olá, ${userName}!`
    };

    const contextMessages = {
      morning: contextData.hasUpcomingTest 
        ? `Vejo que você tem uma prova chegando. Que tal revisar ${contextData.recentSubject}?`
        : `Como posso te ajudar a começar bem o dia?`,
      afternoon: contextData.pendingTasks > 0 
        ? `Você tem ${contextData.pendingTasks} tarefas pendentes. Posso te ajudar a organizar seu tempo?`
        : `Como posso te ajudar a aproveitar a tarde?`,
      evening: `Vamos planejar seus estudos para amanhã?`,
      initial: `Estou aqui para turbinar seus estudos. Como posso te ajudar?`
    };

    return {
      greeting: greetings[welcomeState],
      message: contextMessages[welcomeState]
    };
  };

  // Tratar ação de ferramenta selecionada
  const handleToolAction = (toolId) => {
    setIsProcessing(true);
    
    // Simular processamento
    setTimeout(() => {
      setIsProcessing(false);
      setShowChatBox(true);
      
      // Adicionar mensagem contextual com base na ferramenta
      let aiMessage = "";
      
      switch (toolId) {
        case "resumo":
          aiMessage = `Vamos criar um resumo rápido! Sobre qual tema ou conteúdo você precisa de um resumo hoje?`;
          break;
        case "planejamento":
          aiMessage = `Vamos planejar sua semana de estudos! Quais são suas principais prioridades ou metas para esta semana?`;
          break;
        case "dica":
          aiMessage = `Aqui vai uma dica para otimizar seus estudos: Utilize a técnica Pomodoro - 25 minutos de foco total, seguidos de 5 minutos de descanso. Isso ajuda a manter a concentração e evitar o cansaço mental. Você gostaria de mais dicas específicas para alguma matéria?`;
          break;
        case "quiz":
          aiMessage = `Vamos criar um quiz rápido sobre ${contextData.recentSubject || "um tema de sua escolha"}! Qual assunto específico você gostaria de revisar?`;
          break;
        default:
          aiMessage = "Como posso te ajudar hoje?";
      }
      
      setChatMessages([
        { role: "assistant", content: aiMessage }
      ]);
      
      // Mostrar indicador de digitação brevemente para efeito visual
      setShowTypingIndicator(false);
    }, 1200);
    
    // Mostrar indicador de digitação enquanto "processa"
    setShowTypingIndicator(true);
  };

  // Tratar envio de pergunta rápida para a IA
  const handleEnviarPergunta = (e) => {
    e.preventDefault();
    if (pergunta.trim()) {
      // Adicionar mensagem do usuário ao chat
      setChatMessages([
        ...chatMessages,
        { role: "user", content: pergunta }
      ]);
      
      // Simular processamento da IA
      setIsProcessing(true);
      setShowTypingIndicator(true);
      
      // Em produção, aqui seria feita uma chamada à API da IA
      setTimeout(() => {
        // Simular resposta da IA
        setChatMessages(prev => [
          ...prev,
          { 
            role: "assistant", 
            content: `Aqui está uma resposta para sua pergunta sobre "${pergunta}". Em um ambiente de produção, esta resposta viria da API da Epictus IA e seria muito mais contextualizada e personalizada. Posso ajudar com algo mais?` 
          }
        ]);
        
        setIsProcessing(false);
        setShowTypingIndicator(false);
        setPergunta("");
      }, 1500);
      
      // Garantir que a caixa de chat esteja visível
      setShowChatBox(true);
    }
  };

  // Abrir a página completa do Epictus IA
  const handleOpenFullMode = () => {
    navigate("/epictus-ia");
  };

  // Fechar a caixa de chat e voltar às sugestões
  const handleCloseChat = () => {
    setShowChatBox(false);
    setChatMessages([]);
  };

  // Detectar quando o usuário está digitando
  const handleInputChange = (e) => {
    setPergunta(e.target.value);
    setIsTyping(true);

    // Desativar o estado de digitação após um tempo
    setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  // Renderizar mensagem do chat
  const renderChatMessage = (message, index) => {
    const isUser = message.role === "user";
    
    return (
      <div 
        key={index}
        className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-2`}
      >
        <div 
          className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${
            isUser 
              ? `${isLightMode ? 'bg-blue-100 text-blue-900' : 'bg-blue-900/40 text-blue-100'}`
              : `${isLightMode ? 'bg-gray-100 text-gray-800' : 'bg-gray-800/50 text-gray-100'}`
          }`}
        >
          {message.content}
        </div>
      </div>
    );
  };

  // Renderizar indicador de digitação da IA
  const renderTypingIndicator = () => {
    return (
      <div className="flex justify-start mb-2">
        <div className={`rounded-lg px-3 py-2 text-sm ${isLightMode ? 'bg-gray-100' : 'bg-gray-800/50'}`}>
          <div className="flex space-x-1">
            <div className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '0ms' }}></div>
            <div className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '150ms' }}></div>
            <div className={`w-2 h-2 rounded-full ${isLightMode ? 'bg-gray-400' : 'bg-gray-400'} animate-bounce`} style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    );
  };

  const welcomeMessage = getWelcomeMessage();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="rounded-xl overflow-hidden border border-gray-100 dark:border-gray-800 shadow-xl bg-white dark:bg-gradient-to-br dark:from-[#0c1425] dark:to-[#0a1a2e] h-full w-full relative flex flex-col"
    >
      {/* Elementos decorativos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#FF6B00]/5 dark:bg-[#FF6B00]/10 rounded-full blur-2xl"></div>
        <div className="absolute -left-20 -bottom-20 w-72 h-72 bg-blue-500/5 dark:bg-blue-500/5 rounded-full blur-3xl"></div>

        {/* Partículas decorativas */}
        <div className="absolute top-1/4 right-10 w-2 h-2 bg-[#FF6B00]/40 rounded-full"></div>
        <div className="absolute top-1/3 left-10 w-3 h-3 bg-blue-400/30 dark:bg-blue-400/20 rounded-full"></div>
        <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-purple-400/30 dark:bg-purple-400/20 rounded-full"></div>
      </div>

      {/* Header elegante com gradiente - estilo igual ao FocoDoDiaCard */}
      <div className={`p-5 ${isLightMode ? 'bg-gradient-to-r from-orange-50 to-orange-100/50' : 'bg-gradient-to-r from-[#0A2540]/80 to-[#001427]'} border-b ${isLightMode ? 'border-orange-100' : 'border-[#FF6B00]/20'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-lg flex items-center justify-center ${isLightMode ? 'bg-white shadow-sm border border-orange-200' : 'bg-[#FF6B00]/10 border border-[#FF6B00]/30'}`}>
              <Brain className={`h-5 w-5 text-[#FF6B00]`} />
            </div>
            <div>
              <h3 className={`font-semibold text-lg ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
                Epictus IA: Seu Copiloto
              </h3>
              <p className={`text-sm ${isLightMode ? 'text-gray-500' : 'text-gray-300'}`}>
                <span className="font-medium">Assistente inteligente</span>
              </p>
            </div>
          </div>

          <Button 
            variant="ghost" 
            size="sm" 
            className={`text-xs font-medium ${isLightMode ? 'text-gray-500 hover:text-gray-700 hover:bg-gray-100' : 'text-gray-300 hover:text-white hover:bg-white/5'}`}
            onClick={handleOpenFullMode}
          >
            <span>Modo completo</span>
            <ArrowRight className="h-3 w-3 ml-1" />
          </Button>
        </div>
      </div>

      {/* Conteúdo principal com design premium */}
      <div className="p-5 flex-grow flex flex-col justify-between relative z-10">
        <AnimatePresence mode="wait">
          {!showChatBox ? (
            <motion.div 
              key="welcome-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col"
            >
              {/* Mensagem de boas-vindas dinâmica */}
              <div className="mb-4">
                <h4 className={`text-base font-medium ${isLightMode ? 'text-gray-900' : 'text-white'} mb-1`}>
                  {welcomeMessage.greeting}
                </h4>
                <p className={`text-sm ${isLightMode ? 'text-gray-600' : 'text-gray-300'}`}>
                  {welcomeMessage.message}
                </p>
              </div>
              
              {/* Sugestões de ferramentas */}
              <div className="space-y-2.5 mb-6">
                {currentSuggestions.map((suggestion, index) => (
                  <motion.button
                    key={suggestion.id}
                    whileHover={{ scale: 1.02, x: 5 }}
                    whileTap={{ scale: 0.98 }}
                    className={`w-full flex items-center gap-3 py-2.5 px-3 rounded-lg ${
                      isLightMode 
                        ? 'bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 text-gray-800' 
                        : 'bg-gradient-to-r from-[#FF6B00]/10 to-[#FF6B00]/5 hover:from-[#FF6B00]/15 hover:to-[#FF6B00]/10 text-white'
                    } transition-all duration-200`}
                    onClick={suggestion.action}
                    disabled={isProcessing}
                  >
                    <div className={`p-2 rounded-full ${isLightMode ? 'bg-[#FF6B00]' : 'bg-[#FF6B00]'}`}>
                      {suggestion.icon}
                    </div>
                    <span className="text-sm font-medium">{suggestion.text}</span>
                  </motion.button>
                ))}
              </div>

              {/* Campo de pergunta rápida */}
              <form onSubmit={handleEnviarPergunta}>
                <div className={`relative overflow-hidden rounded-xl border ${
                  isLightMode ? 'border-gray-200 shadow-sm' : 'border-gray-700'
                } transition-all duration-300 ${
                  isTyping ? (isLightMode ? 'ring-2 ring-[#FF6B00]/30' : 'ring-2 ring-[#FF6B00]/30') : ''
                }`}>
                  <input
                    type="text"
                    value={pergunta}
                    onChange={handleInputChange}
                    placeholder="Pergunte ao Epictus IA..."
                    className={`w-full py-3 px-4 pr-12 ${
                      isLightMode ? 'bg-white text-gray-800' : 'bg-gray-800/50 text-white backdrop-blur-sm'
                    } placeholder-gray-400 focus:outline-none text-sm`}
                    disabled={isProcessing}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!pergunta.trim() || isProcessing}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${
                      pergunta.trim() && !isProcessing
                        ? (isLightMode ? 'bg-[#FF6B00] text-white' : 'bg-[#FF6B00] text-white')
                        : (isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-700 text-gray-400')
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </form>
              
              {/* Rodapé informativo */}
              <div className="mt-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`h-2 w-2 rounded-full ${isLightMode ? 'bg-green-400' : 'bg-green-500'} animate-pulse`}></div>
                  <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'}`}>IA pronta para ajudar</span>
                </div>

                {contextData.pendingTasks > 0 && (
                  <span className={`text-xs ${isLightMode ? 'text-amber-600' : 'text-amber-400'}`}>
                    {contextData.pendingTasks} tarefas pendentes
                  </span>
                )}
              </div>
              
              {/* Link para ferramentas */}
              <Button
                variant="ghost"
                size="sm"
                className={`mt-4 text-xs w-full ${
                  isLightMode 
                    ? 'text-[#FF6B00] hover:text-[#FF6B00] border border-[#FF6B00]/20 hover:bg-[#FF6B00]/5' 
                    : 'text-[#FF6B00] hover:text-[#FF6B00] border border-[#FF6B00]/20 hover:bg-[#FF6B00]/10'
                }`}
                onClick={handleOpenFullMode}
              >
                <Zap className="h-3.5 w-3.5 mr-1.5" />
                <span>Explorar todas as ferramentas Epictus IA</span>
              </Button>
            </motion.div>
          ) : (
            <motion.div 
              key="chat-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-grow flex flex-col"
            >
              {/* Cabeçalho da área de chat */}
              <div className="flex items-center justify-between mb-3">
                <h4 className={`text-sm font-medium ${isLightMode ? 'text-gray-800' : 'text-gray-200'}`}>
                  Conversando com Epictus IA
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  className={`p-1 h-auto ${isLightMode ? 'hover:bg-gray-100' : 'hover:bg-gray-800'}`}
                  onClick={handleCloseChat}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              
              {/* Área de mensagens do chat com scroll */}
              <div className="flex-grow overflow-y-auto mb-3 pr-1 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 max-h-[150px]">
                {chatMessages.map((message, index) => renderChatMessage(message, index))}
                {showTypingIndicator && renderTypingIndicator()}
              </div>
              
              {/* Campo de entrada para o chat */}
              <form onSubmit={handleEnviarPergunta} className="mt-auto">
                <div className={`relative overflow-hidden rounded-xl border ${
                  isLightMode ? 'border-gray-200 shadow-sm' : 'border-gray-700'
                } transition-all duration-300 ${
                  isTyping ? (isLightMode ? 'ring-2 ring-[#FF6B00]/30' : 'ring-2 ring-[#FF6B00]/30') : ''
                }`}>
                  <input
                    type="text"
                    value={pergunta}
                    onChange={handleInputChange}
                    placeholder="Envie sua mensagem..."
                    className={`w-full py-3 px-4 pr-12 ${
                      isLightMode ? 'bg-white text-gray-800' : 'bg-gray-800/50 text-white backdrop-blur-sm'
                    } placeholder-gray-400 focus:outline-none text-sm`}
                    disabled={isProcessing}
                  />

                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    disabled={!pergunta.trim() || isProcessing}
                    className={`absolute right-2 top-1/2 transform -translate-y-1/2 p-1.5 rounded-md ${
                      pergunta.trim() && !isProcessing
                        ? (isLightMode ? 'bg-[#FF6B00] text-white' : 'bg-[#FF6B00] text-white')
                        : (isLightMode ? 'bg-gray-100 text-gray-400' : 'bg-gray-700 text-gray-400')
                    }`}
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </form>
              
              {/* Botões de ação */}
              <div className="flex items-center gap-2 mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-1 text-xs ${
                    isLightMode 
                      ? 'text-[#FF6B00] border border-[#FF6B00]/20 hover:bg-[#FF6B00]/5' 
                      : 'text-[#FF6B00] border border-[#FF6B00]/20 hover:bg-[#FF6B00]/10'
                  }`}
                  onClick={() => setShowChatBox(false)}
                >
                  <ArrowRight className="h-3.5 w-3.5 mr-1.5 rotate-180" />
                  <span>Voltar às sugestões</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  className={`flex-1 text-xs ${
                    isLightMode 
                      ? 'bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20' 
                      : 'bg-[#FF6B00]/10 text-[#FF6B00] hover:bg-[#FF6B00]/20'
                  }`}
                  onClick={handleOpenFullMode}
                >
                  <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                  <span>Modo completo</span>
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}