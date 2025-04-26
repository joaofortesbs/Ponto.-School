import React, { useState, useEffect, useRef } from "react";
import { Send, Plus, Mic, Loader2, Brain, BookOpen, AlignJustify, RotateCw, Search, Image, Lightbulb, PenLine, X, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/ui/use-toast";
import QuickActionButton from "./QuickActionButton";


interface EpictusMessageBoxProps {
  onClose: () => void;
  sessionId: string;
  onNewSession: () => void;
  inputMessage: string;
  setInputMessage: (value: string) => void;
  handleSendMessage: () => void;
  isTyping: boolean;
  charCount: number;
  MAX_CHARS: number;
  handleKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  handleButtonClick: (action: string) => void;
}

const EpictusMessageBox: React.FC<EpictusMessageBoxProps> = ({
  onClose,
  sessionId,
  onNewSession,
  inputMessage,
  setInputMessage,
  handleSendMessage,
  isTyping,
  charCount,
  MAX_CHARS,
  handleKeyDown,
  handleButtonClick
}) => {
  const [messages, setMessages] = useState<any[]>([]); // Initialize messages state
  const [currentMessage, setCurrentMessage] = useState('');
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);


  useEffect(() => {
    // Focar no input de mensagem ao abrir
    if (inputRef.current) {
      inputRef.current.focus();
    }

    // Carregar histórico de conversa se for uma conversa existente
    const loadConversationHistory = async () => {
      try {
        const history = getConversationHistory(sessionId);
        if (history.length > 1) { // Se tem mais que só a mensagem do sistema
          const messagesForDisplay = history.slice(1).map(msg => ({
            id: Math.random().toString(),
            content: msg.content,
            sender: msg.role === 'user' ? 'user' : 'ai',
            type: 'text',
            timestamp: new Date()
          }));
          setMessages(messagesForDisplay);
        }
      } catch (error) {
        console.error("Erro ao carregar histórico da conversa:", error);
      }
    };

    loadConversationHistory();
  }, [sessionId]);

  const generateResponse = async () => {
    if (!currentMessage.trim()) return;

    // Criar novo ID para a mensagem
    const messageId = Math.random().toString();

    // Adicionar mensagem do usuário
    const userMessage = {
      id: messageId,
      content: currentMessage,
      sender: 'user' as const,
      type: 'text' as const,
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setCurrentMessage('');
    setIsTyping(true);

    try {
      // Gerar resposta da IA usando o sessionId fornecido
      const response = await generateAIResponse(userMessage.content, sessionId, {
        intelligenceLevel: 'advanced',
        detailedResponse: true,
        maximumLength: true
      });

      // Adicionar resposta da IA
      const aiMessage = {
        id: Math.random().toString(),
        content: response,
        sender: 'ai' as const,
        type: 'text' as const,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, aiMessage]);
      setIsTyping(false);

      // Atualiza a barra de rolagem
      setTimeout(() => {
        messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      setIsTyping(false);

      // Mensagem de erro
      const errorMessage = {
        id: Math.random().toString(),
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.',
        sender: 'ai' as const,
        type: 'text' as const,
        timestamp: new Date()
      };

      setMessages((prev) => [...prev, errorMessage]);
    }
  };

  return (
    <motion.div 
      className="relative w-[60%] h-auto mx-auto bg-transparent rounded-2xl shadow-xl 
                border border-white/5 backdrop-blur-sm overflow-hidden flex-shrink-0"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      style={{ minHeight: '120px' }}
    >
      {/* Partículas de fundo */}
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
      </div>

      {/* Container principal */}
      <div className="relative z-10 p-4">
        {/* Cabeçalho */}
        <div className="bg-gradient-to-r from-[#1F2739]/90 to-[#1A2036]/90 backdrop-blur-md border-b border-white/10 p-3 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-blue-400" />
            <h3 className="text-white font-medium">Epictus IA</h3>
          </div>
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-gray-400 hover:text-blue-400 text-xs flex items-center gap-1.5"
              onClick={() => {
                // Criar nova sessão
                onNewSession();
                // Limpar mensagens
                setMessages([]);
              }}
            >
              <Plus className="h-3.5 w-3.5" />
              Nova conversa
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-gray-400 hover:text-white" 
              onClick={onClose}
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>


        {/* Opções superiores */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-hide">
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 
                       rounded-lg border border-white/10 backdrop-blur-sm hover:bg-gradient-to-r 
                       hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-blue-500/30
                       hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
              onClick={() => handleButtonClick('Buscar')}
            >
              <Search size={14} className="text-blue-300" />
              <span>Buscar</span>
            </button>
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 
                       rounded-lg border border-white/10 backdrop-blur-sm hover:bg-gradient-to-r 
                       hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-purple-500/30
                       hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
              onClick={() => handleButtonClick('Pensar')}
            >
              <Brain size={14} className="text-purple-300" />
              <span>Pensar</span>
            </button>
            <button 
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#0a1625]/70 to-[#182c4d]/70 text-gray-200 
                       rounded-lg border border-white/10 backdrop-blur-sm hover:bg-gradient-to-r 
                       hover:from-[#0D23A0]/40 hover:to-[#5B21BD]/40 hover:border-emerald-500/30
                       hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
              onClick={() => handleButtonClick('Gerar Imagem')}
            >
              <Image size={14} className="text-emerald-300" />
              <span>Gerar Imagem</span>
            </button>
          </div>

          {/* Espaços de Aprendizagem no canto direito */}
          <button 
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-gradient-to-r from-[#001427] to-[#002447] text-gray-200 
                    rounded-lg border border-white/10 backdrop-blur-sm hover:bg-gradient-to-r 
                    hover:from-[#001e3b] hover:to-[#002e5c] hover:border-blue-500/30
                    hover:text-white transition-all duration-300 flex-shrink-0 shadow-sm"
            onClick={() => handleButtonClick('Espaços de Aprendizagem')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300">
              <rect x="3" y="3" width="7" height="7"></rect>
              <rect x="14" y="3" width="7" height="7"></rect>
              <rect x="14" y="14" width="7" height="7"></rect>
              <rect x="3" y="14" width="7" height="7"></rect>
            </svg>
            <span>Espaços de Aprendizagem</span>
          </button>
        </div>

        {/* Área de input */}
        <div className="flex items-center gap-2">
          <motion.button
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                     flex items-center justify-center shadow-lg text-white"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {}}
          >
            <Plus size={18} />
          </motion.button>

          <div className={`relative flex-grow overflow-hidden 
                          bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                          rounded-xl border ${isTyping ? 'border-[#1230CC]/70' : 'border-white/10'} 
                          transition-all duration-300`}>
            <Textarea
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
              className="w-full bg-transparent text-white py-3 px-3 text-sm outline-none placeholder:text-gray-400"
              disabled={isTyping}
              ref={inputRef} // Add ref to the Textarea
            />
          </div>

          {/* Botão de Prompt Aprimorado - visível apenas quando o usuário começar a digitar */}
          {inputMessage.trim().length > 0 && (
            <motion.button
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleButtonClick('PromptAprimorado')}
              title="Prompt Aprimorado com IA"
            >
              <PenLine size={16} />
            </motion.button>
          )}

          {/* Botão de sugestão de prompts inteligentes - sempre visível */}
          <motion.button
            className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                     flex items-center justify-center shadow-lg text-white"
            whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleButtonClick('SugestaoPrompts')}
            title="Sugestão de Prompts Inteligentes"
          >
            <Lightbulb size={16} />
          </motion.button>

          {/* Botão de microfone (quando não há texto) */}
          {!inputMessage.trim() ? (
            <motion.button 
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
            >
              <Mic size={16} />
            </motion.button>
          ) : (
            /* Botão de enviar - Visível apenas quando há conteúdo no input */
            <motion.button
              className="flex-shrink-0 w-9 h-9 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                       flex items-center justify-center shadow-lg text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              animate={{ 
                boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
              }}
              transition={{ duration: 2, repeat: Infinity }}
              onClick={generateResponse} // Changed to generateResponse
              disabled={isTyping}
            >
              {isTyping ? (
                <Loader2 className="h-4 w-4 animate-spin text-white" />
              ) : (
                <Send size={16} />
              )}
            </motion.button>
          )}
        </div>

        {/* Ações rápidas */}
        <motion.div 
          className="quick-actions mt-2 pb-1 flex gap-1.5 overflow-x-auto scrollbar-hide"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          {/* Área de quick actions foi removida conforme solicitado */}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default EpictusMessageBox;

// Placeholder functions -  REPLACE THESE WITH YOUR ACTUAL IMPLEMENTATIONS
async function generateAIResponse(prompt: string, sessionId: string, options: any): Promise<string> {
  // Your AI response generation logic here...  This is a placeholder.
  console.log("Generating AI response for:", prompt, sessionId, options);
  return "This is a placeholder AI response.";
}

async function getConversationHistory(sessionId: string): Promise<any[]> {
  // Your Supabase interaction logic here... This is a placeholder.
  console.log("Fetching conversation history for:", sessionId);
  return [{ role: 'system', content: 'System message' }]; // Placeholder return value
}