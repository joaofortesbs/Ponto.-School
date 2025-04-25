
import React, { useState, useRef, useEffect } from "react";
import { 
  Send, 
  Bot, 
  User, 
  Trash2, 
  Loader2,
  Star,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { v4 as uuidv4 } from 'uuid';
import { generateAIResponse } from "@/services/epictusIAService";

interface Message {
  id: string;
  sender: "user" | "ia";
  content: string;
  timestamp: Date;
}

const EpictusBetaMode: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>(() => {
    try {
      const savedMessages = localStorage.getItem('epictus_beta_chat');
      if (savedMessages) {
        const parsedMessages = JSON.parse(savedMessages) as Message[];
        return parsedMessages.map(msg => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar histórico do chat:", error);
    }
    
    // Mensagem inicial padrão
    return [{
      id: uuidv4(),
      sender: "ia",
      content: "Olá, João! Eu sou o Epicus IA, seu assistente para aprendizado e programação. Como posso te ajudar hoje?",
      timestamp: new Date()
    }];
  });
  
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charCount, setCharCount] = useState(0);
  const MAX_CHARS = 1000;
  const [sessionId] = useState(() => localStorage.getItem('epictus_beta_session_id') || uuidv4());
  
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Autofoco no campo de texto ao carregar
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  // Persistir mensagens no localStorage
  useEffect(() => {
    if (messages.length > 0) {
      localStorage.setItem('epictus_beta_chat', JSON.stringify(messages));
      localStorage.setItem('epictus_beta_session_id', sessionId);
    }
  }, [messages, sessionId]);

  // Rolar para o final quando novas mensagens são adicionadas
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTo({
        top: chatContainerRef.current.scrollHeight,
        behavior: "smooth"
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= MAX_CHARS) {
      setInputMessage(value);
      setCharCount(value.length);
    }
  };

  const handleSendMessage = async () => {
    const trimmedMessage = inputMessage.trim();
    
    if (!trimmedMessage) {
      setError("Por favor, digite uma mensagem.");
      setTimeout(() => setError(null), 3000);
      return;
    }
    
    if (isTyping) return; // Prevenir duplicação
    
    const userMessage: Message = {
      id: uuidv4(),
      sender: "user",
      content: trimmedMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage("");
    setCharCount(0);
    setIsTyping(true);
    
    try {
      // Simulação de resposta (1-2 segundos)
      setTimeout(async () => {
        try {
          const response = await generateAIResponse(trimmedMessage, sessionId);
          
          const aiMessage: Message = {
            id: uuidv4(),
            sender: "ia",
            content: response,
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, aiMessage]);
        } catch (err) {
          console.error("Erro ao gerar resposta:", err);
          const errorMessage: Message = {
            id: uuidv4(),
            sender: "ia",
            content: "Desculpe, algo deu errado. Tente novamente!",
            timestamp: new Date()
          };
          setMessages(prev => [...prev, errorMessage]);
        } finally {
          setIsTyping(false);
        }
      }, Math.random() * 1000 + 1000); // 1-2 segundos
    } catch (err) {
      console.error("Erro ao enviar mensagem:", err);
      setIsTyping(false);
      setError("Houve um erro ao processar sua mensagem. Tente novamente.");
      setTimeout(() => setError(null), 3000);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    const initialMessage: Message = {
      id: uuidv4(),
      sender: "ia",
      content: "Olá, João! Eu sou o Epicus IA, seu assistente para aprendizado e programação. Como posso te ajudar hoje?",
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    setIsConfirmOpen(false);
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  // Simulação de funcionalidades dos botões existentes
  const handleButtonClick = (action: string) => {
    const actionMap: Record<string, string> = {
      "buscar": "Iniciando busca com base na conversa atual...",
      "pensar": "Analisando a conversa para gerar insights...",
      "gerarImagem": "Gerando imagem baseada no contexto da conversa...",
      "simuladorProvas": "Preparando simulado com base no conteúdo discutido...",
      "gerarCaderno": "Criando caderno com o conteúdo da nossa conversa...",
      "criarFluxograma": "Gerando fluxograma visual do conteúdo...",
      "reescreverExplicacao": "Reescrevendo a última explicação em formato diferente...",
      "analiseRedacao": "Pronto para analisar sua redação. Por favor, envie o texto...",
      "resumirConteudo": "Resumindo o conteúdo da nossa conversa...",
      "espacosAprendizagem": "Abrindo espaços de aprendizagem relacionados..."
    };

    const responseMessage = actionMap[action] || "Executando ação...";
    
    const botMessage: Message = {
      id: uuidv4(),
      sender: "ia",
      content: responseMessage,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, botMessage]);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Cabeçalho igual ao do Modo Epictus Turbo */}
      <div className="border-b bg-[#0A1625] p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C00] flex items-center justify-center">
              <Bot className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold flex items-center gap-2 text-white">
                Epictus BETA
                <Badge className="bg-[#FF6B00] text-white text-xs">#Beta IA</Badge>
              </h2>
              <p className="text-sm text-white/60">Versão beta avançada com recursos experimentais</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              className="bg-[#1A2634] text-white text-sm rounded-md p-2 border border-gray-700"
              aria-label="Selecionar personalidade"
            >
              <option value="default">Personalidades</option>
              <option value="teacher">Professor</option>
              <option value="programmer">Programador</option>
              <option value="scientist">Cientista</option>
            </select>
          </div>
        </div>
      </div>
      
      {/* Área principal do chat */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 overflow-hidden bg-[#0A1625]">
        {/* Área de conversas */}
        <div className="w-[80%] h-[60%] relative mb-4">
          <div className="absolute top-0 right-0 z-10 p-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-full text-[#A0A0A0] hover:text-[#FF4D4D] hover:bg-transparent"
              onClick={() => setIsConfirmOpen(true)}
              aria-label="Limpar chat"
            >
              <Trash2 size={24} />
            </Button>
          </div>
          
          <ScrollArea 
            className="w-full h-full bg-[#1A2634] rounded-lg overflow-hidden"
            ref={chatContainerRef}
          >
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ia" && (
                    <div className="w-8 h-8 rounded-full bg-[#2F3B4C] flex items-center justify-center mr-2">
                      <Bot size={16} className="text-white" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-md p-3 ${
                      message.sender === "user"
                        ? "bg-[#4A90E2] text-white"
                        : "bg-[#2F3B4C] text-white"
                    }`}
                  >
                    <p className="whitespace-pre-wrap break-words">{message.content}</p>
                    <p className="text-right text-[12px] text-[#A0A0A0] mt-1">
                      {formatTimestamp(new Date(message.timestamp))}
                    </p>
                  </div>
                  
                  {message.sender === "user" && (
                    <div className="w-8 h-8 rounded-full bg-[#4A90E2] flex items-center justify-center ml-2">
                      <User size={16} className="text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="w-8 h-8 rounded-full bg-[#2F3B4C] flex items-center justify-center mr-2">
                    <Bot size={16} className="text-white" />
                  </div>
                  <div className="bg-[#2F3B4C] p-3 rounded-md flex items-center">
                    <div className="flex space-x-2">
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "0ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "300ms" }}></div>
                      <div className="w-2 h-2 rounded-full bg-[#4A90E2] animate-pulse" style={{ animationDelay: "600ms" }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Barra de ferramentas (botões existentes) */}
        <div className="w-[80%] flex flex-wrap justify-end gap-2 mb-2">
          <Button 
            onClick={() => handleButtonClick("buscar")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Buscar
          </Button>
          <Button 
            onClick={() => handleButtonClick("pensar")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Pensar
          </Button>
          <Button 
            onClick={() => handleButtonClick("gerarImagem")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Gerar Imagem
          </Button>
          <Button 
            onClick={() => handleButtonClick("simuladorProvas")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Simulador de Provas
          </Button>
          <Button 
            onClick={() => handleButtonClick("gerarCaderno")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Gerar Caderno
          </Button>
          <Button 
            onClick={() => handleButtonClick("criarFluxograma")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Criar Fluxograma
          </Button>
          <Button 
            onClick={() => handleButtonClick("reescreverExplicacao")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Reescrever Explicação
          </Button>
          <Button 
            onClick={() => handleButtonClick("analiseRedacao")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Análise de Redação
          </Button>
          <Button 
            onClick={() => handleButtonClick("resumirConteudo")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Resumir Conteúdo
          </Button>
          <Button 
            onClick={() => handleButtonClick("espacosAprendizagem")}
            variant="outline" 
            className="h-10 px-3 text-[12px] bg-[#1A2634] text-white border-gray-700 hover:bg-[#2F3B4C]"
          >
            Espaços de Aprendizagem
          </Button>
        </div>
        
        {/* Caixa de envio de mensagens */}
        <div className="w-[80%] h-[50px] bg-[#2F3B4C] rounded-lg flex items-center p-2 relative">
          {error && (
            <Alert className="absolute -top-12 left-0 right-0 bg-red-500 text-white border-none">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <div className="flex-1 h-full flex items-center relative">
            <Textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Digite sua mensagem para a IA..."
              className="resize-none h-full bg-[#1A2634] border-none rounded-md text-white text-[14px] placeholder:text-[#A0A0A0] focus:ring-1 focus:ring-[#4A90E2] flex-1 py-2 pl-3 pr-16"
              maxLength={MAX_CHARS}
              disabled={isTyping}
              aria-label="Campo de mensagem"
            />
            <div className="absolute right-3 bottom-1 text-xs text-[#A0A0A0]">
              {charCount}/{MAX_CHARS}
            </div>
            
            <Button
              className="absolute right-0 top-0 bottom-0 w-[40px] h-[40px] rounded-full bg-[#4A90E2] hover:bg-[#5AAEFF] text-white mr-1 flex items-center justify-center transition-transform active:scale-90"
              onClick={handleSendMessage}
              disabled={isTyping || !inputMessage.trim()}
              aria-label="Enviar mensagem"
            >
              {isTyping ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Send className="h-5 w-5" />
              )}
            </Button>
          </div>
          
          <Button
            className="ml-2 h-[40px] w-[40px] rounded-full bg-[#1A2634] hover:bg-[#2F3B4C] text-[#A0A0A0] flex items-center justify-center"
            variant="ghost"
            aria-label="Dar feedback"
          >
            <Star className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Modal de confirmação */}
      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="bg-[#1A2634] text-white border-gray-700">
          <DialogHeader>
            <DialogTitle>Limpar chat</DialogTitle>
            <DialogDescription className="text-gray-400">
              Deseja limpar o chat? Isso não pode ser desfeito.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              className="bg-transparent text-white border-gray-700 hover:bg-[#2F3B4C]"
            >
              Cancelar
            </Button>
            <Button
              onClick={clearChat}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default EpictusBetaMode;
