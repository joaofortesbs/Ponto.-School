import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Plus, Mic, Send, Brain, BookOpen, FileText, 
  RotateCw, AlignJustify, Zap, X, Lightbulb, Square, 
  Clock, Download, Copy, Loader2
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { generateAIResponse } from "@/services/epictusIAService";
import ReactMarkdown from 'react-markdown';
import { v4 as uuidv4 } from 'uuid';

// Interfaces
interface QuickActionProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface ChatMessage {
  id: string;
  content: string;
  sender: 'user' | 'ai';
  timestamp: Date;
  type: 'text' | 'audio';
  audioUrl?: string;
}

// Componente para ações rápidas
const QuickAction: React.FC<QuickActionProps> = ({ icon, label, onClick }) => {
  return (
    <motion.button
      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-[#0c2341]/50 to-[#0f3562]/50 
                 text-white rounded-full whitespace-nowrap border border-white/10 backdrop-blur-md dark:from-[#0c2341]/50 dark:to-[#0f3562]/50 dark:text-white"
      whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
      onClick={onClick}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
};

// Componente para bolhas de mensagem
const MessageBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isAI = message.sender === 'ai';
  const formattedTime = new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`flex ${isAI ? 'justify-start' : 'justify-end'} mb-4`}>
      <div className={`max-w-[80%] rounded-2xl p-3 ${
        isAI 
          ? 'bg-gradient-to-r from-[#0c2341]/90 to-[#0f3562]/90 text-white' 
          : 'bg-gradient-to-r from-[#0D23A0]/70 to-[#5B21BD]/70 text-white'
      }`}>
        {message.type === 'audio' && message.audioUrl && (
          <audio controls className="w-full mb-2">
            <source src={message.audioUrl} type="audio/webm" />
            Seu navegador não suporta áudio.
          </audio>
        )}

        <div className="text-sm">
          {isAI ? (
            <ReactMarkdown className="prose prose-sm prose-invert max-w-none">
              {message.content}
            </ReactMarkdown>
          ) : (
            <p>{message.content}</p>
          )}
        </div>

        <div className="mt-1 text-xs text-gray-300 flex justify-end">
          <span>{formattedTime}</span>
        </div>
      </div>
    </div>
  );
};

// Componente do indicador de "digitando"
const TypingIndicator: React.FC = () => (
  <div className="flex justify-start mb-4">
    <div className="bg-gradient-to-r from-[#0c2341]/90 to-[#0f3562]/90 text-white rounded-2xl p-3 max-w-[80%]">
      <div className="flex space-x-2">
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
    </div>
  </div>
);

// Componente principal da caixa de mensagens
const TurboAdvancedMessageBox: React.FC = () => {
  // Estado para gerenciar a interface
  const { toast } = useToast();
  const [message, setMessage] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [audioRecorder, setAudioRecorder] = useState<MediaRecorder | null>(null);
  const [showWelcomeMessage, setShowWelcomeMessage] = useState(true);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Refs para elementos do DOM
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Efeito para scroll automático
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages, isAiTyping]);

  // Função para rolar para o final da conversa
  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Configuração das ações rápidas
  const quickActions = [
    { icon: <Brain size={16} className="text-blue-300 dark:text-blue-300" />, label: "Simulador de Provas" },
    { icon: <BookOpen size={16} className="text-emerald-300 dark:text-emerald-300" />, label: "Gerar Caderno" },
    { icon: <AlignJustify size={16} className="text-purple-300 dark:text-purple-300" />, label: "Criar Fluxograma" },
    { icon: <RotateCw size={16} className="text-indigo-300 dark:text-indigo-300" />, label: "Reescrever Explicação" },
    { icon: <FileText size={16} className="text-amber-300 dark:text-amber-300" />, label: "Análise de Redação" },
    { icon: <Zap size={16} className="text-rose-300 dark:text-rose-300" />, label: "Resumir Conteúdo" }
  ];

  // Efeito visual quando o input recebe texto
  const inputHasContent = message.trim().length > 0;

  // Função para enviar mensagem de texto
  const handleSendMessage = async () => {
    if (!message.trim()) return;

    // Ocultar a mensagem de boas-vindas
    setShowWelcomeMessage(false);

    // Criar e adicionar mensagem do usuário
    const userMessage: ChatMessage = {
      id: uuidv4(),
      content: message,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    };

    // Adicionar à lista de mensagens
    setChatMessages(prevMessages => [...prevMessages, userMessage]);

    // Limpar campo de input
    setMessage("");

    // Indicar que a IA está digitando
    setIsAiTyping(true);

    try {
      // Preparar contexto para enviar à API
      const contextMessages = chatMessages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.content
      }));

      // Adicionar a nova mensagem do usuário ao contexto
      contextMessages.push({
        role: 'user',
        content: userMessage.content
      });

      // Gerar resposta da IA
      let aiResponse: string;

      try {
        // Tentar usar a API do Gemini
        const { generateAIResponse: geminiGenerateResponse } = await import('@/services/aiChatService');
        const sessionId = `epictus-chat-${Date.now()}`;

        aiResponse = await geminiGenerateResponse(
          userMessage.content,
          sessionId,
          {
            intelligenceLevel: 'advanced',
            languageStyle: 'formal',
            detailedResponse: true,
            context: contextMessages
          }
        );
      } catch (error) {
        console.error("Erro ao acessar API Gemini, usando fallback local:", error);

        // Fallback para o serviço local
        aiResponse = await generateAIResponse(
          userMessage.content, 
          localStorage.getItem('gemini_api_key') || undefined
        );
      }

      // Pequeno delay para simular a digitação
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Adicionar resposta da IA
      const aiMessageObject: ChatMessage = {
        id: uuidv4(),
        content: aiResponse,
        sender: 'ai',
        timestamp: new Date(),
        type: 'text'
      };

      setChatMessages(prevMessages => [...prevMessages, aiMessageObject]);
    } catch (error) {
      console.error("Erro ao processar mensagem:", error);
      toast({
        title: "Erro de comunicação",
        description: "Não foi possível processar sua mensagem. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsAiTyping(false);
    }
  };

  // Keydown handler para submeter com Enter
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Função para iniciar a gravação de áudio
  const startRecording = useCallback(async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        setAudioRecorder(recorder);

        const chunks: Blob[] = [];

        recorder.ondataavailable = (e) => {
          if (e.data.size > 0) {
            chunks.push(e.data);
          }
        };

        recorder.onstop = async () => {
          // Ocultar a mensagem de boas-vindas
          setShowWelcomeMessage(false);

          // Criar um blob com o áudio gravado
          const audioBlob = new Blob(chunks, { type: 'audio/webm' });
          const audioUrl = URL.createObjectURL(audioBlob);

          // Criar uma mensagem de áudio
          const audioMessage: ChatMessage = {
            id: uuidv4(),
            content: "🎤 Mensagem de áudio",
            sender: 'user',
            timestamp: new Date(),
            type: 'audio',
            audioUrl
          };

          // Adicionar à lista de mensagens
          setChatMessages(prevMessages => [...prevMessages, audioMessage]);

          // Limpar dados de áudio
          setAudioChunks([]);

          // Parar tracks do stream
          stream.getTracks().forEach(track => track.stop());

          // Indicar que a IA está "pensando"
          setIsAiTyping(true);

          // Simular processamento do áudio
          setTimeout(() => {
            // Resposta simulada da IA para áudio
            const aiResponse: ChatMessage = {
              id: uuidv4(),
              content: "Recebi seu áudio. No momento, estou limitado ao processamento básico de áudio. Posso ajudar com algo específico baseado nessa gravação?",
              sender: 'ai',
              timestamp: new Date(),
              type: 'text'
            };

            setChatMessages(prevMessages => [...prevMessages, aiResponse]);
            setIsAiTyping(false);
          }, 2000);
        };

        // Iniciar gravação
        recorder.start();
        setIsRecording(true);

        toast({
          title: "Gravação iniciada",
          description: "Fale sua mensagem e clique no botão para enviar.",
          duration: 3000,
        });
      } catch (error) {
        console.error("Erro ao acessar microfone:", error);
        toast({
          title: "Acesso ao microfone negado",
          description: "Verifique as permissões do seu navegador.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "Gravação não suportada",
        description: "Seu navegador não suporta gravação de áudio.",
        variant: "destructive",
      });
    }
  }, [toast]);

  // Função para parar a gravação
  const stopRecording = useCallback(() => {
    if (audioRecorder && audioRecorder.state !== 'inactive') {
      audioRecorder.stop();
      setIsRecording(false);
    }
  }, [audioRecorder]);

  // Componente de caixa de mensagens do chat
  const ChatContainer = () => (
    <div 
      className="bg-[#0c2341]/50 rounded-xl border border-white/10 p-3 h-[300px] mb-4 overflow-y-auto flex flex-col"
      ref={chatContainerRef}
    >
      {chatMessages.map(msg => (
        <MessageBubble key={msg.id} message={msg} />
      ))}

      {isAiTyping && <TypingIndicator />}

      <div ref={messagesEndRef} />
    </div>
  );

  return (
    <>
      {showWelcomeMessage ? (
        <>
          {/* Espaço calculado para posicionar a frase perfeitamente centralizada */}
          <div className="w-full h-32"></div>

          {/* Frase de boas-vindas exatamente centralizada entre o cabeçalho e a caixa de mensagens */}
          <div className="text-center my-auto w-full hub-connected-width mx-auto flex flex-col justify-center" style={{ height: "25vh" }}>
            <h2 className="text-4xl text-white dark:text-white">
              <span className="font-bold">Como a IA mais <span className="text-[#0049e2] bg-gradient-to-r from-[#0049e2] to-[#0049e2]/80 bg-clip-text text-transparent relative after:content-[''] after:absolute after:h-[3px] after:bg-[#0049e2] after:w-0 after:left-0 after:bottom-[-5px] after:transition-all after:duration-300 group-hover:after:w-full hover:after:w-full dark:text-[#0049e2]">Inteligente do mundo</span>
              </span><br />
              <span className="font-light text-3xl text-gray-800 dark:text-gray-300">pode te ajudar hoje {localStorage.getItem('username') || 'João Marcelo'}?</span>
            </h2>
          </div>

          {/* Pequeno espaço adicional antes da caixa de mensagens */}
          <div className="w-full h-6"></div>
        </>
      ) : null}

      <div className="w-full mx-auto mb-2 p-1 hub-connected-width"> {/* Usando a mesma classe de largura do cabeçalho */}
      <motion.div 
        className="relative bg-gradient-to-r from-[#050e1d]/90 to-[#0d1a30]/90 rounded-2xl shadow-xl 
                   border border-white/5 backdrop-blur-sm overflow-hidden dark:bg-gradient-to-r dark:from-[#050e1d]/90 dark:to-[#0d1a30]/90 dark:border-white/5"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Partículas de fundo */}
        <div className="absolute inset-0 opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>
        </div>

        {/* Container principal */}
        <div className="relative z-10 p-3">

          {/* Botões de ação na parte superior */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 pl-1">
              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-blue-300 dark:text-blue-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8"></circle>
                  <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                </svg>
                <span className="text-sm font-medium">Buscar</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-300 dark:text-purple-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16z"></path>
                  <path d="M12 16v.01"></path>
                  <path d="M12 12a2.5 2.5 0 0 0 2.5-2.5c0-1.5-2.5-2.5-2.5-4"></path>
                </svg>
                <span className="text-sm font-medium">Pensar</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-green-300 dark:text-green-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                  <circle cx="8.5" cy="8.5" r="1.5"></circle>
                  <polyline points="21 15 16 10 5 21"></polyline>
                </svg>
                <span className="text-sm font-medium">Gerar Imagem</span>
              </motion.button>
            </div>

            {/* Componente Espaços de Aprendizagem no canto direito */}
            <div className="pr-1">
              <motion.button
                className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r dark:from-[#0c2341]/60 dark:to-[#0f3562]/60 from-[#f1f5f9]/70 to-[#e9f0fa]/70
                         dark:text-white text-gray-800 rounded-lg whitespace-nowrap dark:border-white/10 border-gray-300/50 backdrop-blur-md"
                whileHover={{ y: -2, scale: 1.05, boxShadow: "0 10px 25px -5px rgba(13, 35, 160, 0.4)" }}
                whileTap={{ scale: 0.98 }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-amber-300 dark:text-amber-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"></path>
                  <circle cx="10" cy="10" r="1"></circle>
                  <path d="M13 10h4"></path>
                  <circle cx="10" cy="14" r="1"></circle>
                  <path d="M13 14h4"></path>
                </svg>
                <span className="text-sm font-medium">Espaços de Aprendizagem</span>
              </motion.button>
            </div>
          </div>

          {/* Área de chat - Aparece quando a welcome message é removida */}
          {!showWelcomeMessage && <ChatContainer />}

          {/* Área de input */}
          <div className="flex items-center gap-2">
            <motion.button
              className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white dark:text-white"
              whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <Plus size={18} />
            </motion.button>

            <div className={`relative flex-grow overflow-hidden 
                            bg-gradient-to-r from-[#0c2341]/30 to-[#0f3562]/30 
                            rounded-xl border ${isInputFocused ? 'border-[#1230CC]/70' : 'border-white/10'} 
                            transition-all duration-300 dark:bg-gradient-to-r dark:from-[#0c2341]/30 dark:to-[#0f3562]/30 dark:border-[#1230CC]/70`}>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                onFocus={() => setIsInputFocused(true)}
                onBlur={() => setIsInputFocused(false)}
                placeholder="Digite um comando ou pergunta para o Epictus Turbo..."
                className="w-full bg-transparent text-white py-3 px-3 outline-none placeholder:text-gray-400 text-sm dark:text-white dark:placeholder-gray-400"
              />
            </div>

            {/* Área dos botões de ação (lâmpada e áudio/enviar) */}
            <div className="flex items-center gap-2">
              {/* Botão de melhoria de prompts - visível apenas quando digitando */}
              {message.trim().length > 0 && (
                <motion.button
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                           flex items-center justify-center shadow-lg text-white dark:text-white"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    // Mostrar toast de análise
                    toast({
                      title: "Melhorando seu prompt",
                      description: "Analisando e aprimorando sua mensagem...",
                      duration: 3000,
                    });

                    try {
                      // Aqui adicionamos a chamada real para a API de IA para melhorar o prompt
                      // Utilizamos a função do serviço aiChatService para acessar a API Gemini
                      let improvedPromptText = "";

                      if (message.trim().length > 0) {
                        // Criar um ID de sessão único para esta interação
                        const sessionId = `prompt-improvement-${Date.now()}`;

                        try {
                          // Importamos a função do serviço aiChatService
                          const { generateAIResponse: generateGeminiResponse } = await import('@/services/aiChatService');

                          // Chamar a API Gemini para melhorar o prompt
                          improvedPromptText = await generateGeminiResponse(
                            `Você é um assistente especializado em melhorar prompts educacionais. 
                            Analise o seguinte prompt e melhore-o para obter uma resposta mais detalhada, completa e educacional.

                            Melhore o seguinte prompt para obter uma resposta mais detalhada, completa e educacional. 
                            NÃO responda a pergunta, apenas melhore o prompt adicionando:
                            1. Mais contexto e especificidade
                            2. Solicite exemplos, comparações e aplicações práticas
                            3. Peça explicações claras de conceitos fundamentais
                            4. Solicite visualizações ou analogias quando aplicável
                            5. Adicione pedidos para que sejam mencionadas curiosidades ou fatos históricos relevantes

                            Original: "${message}"

                            Retorne APENAS o prompt melhorado, sem comentários adicionais.`,
                            sessionId,
                            {
                              intelligenceLevel: 'advanced',
                              languageStyle: 'formal',
                              detailedResponse: true
                            }
                          );
                        } catch (error) {
                          console.error("Erro ao chamar API Gemini:", error);
                          // Fallback para o serviço local caso a API Gemini falhe
                          improvedPromptText = await generateAIResponse(
                            `Melhore o seguinte prompt para obter uma resposta mais detalhada, completa e educacional. 
                            NÃO responda a pergunta, apenas melhore o prompt adicionando:
                            1. Mais contexto e especificidade
                            2. Solicite exemplos, comparações e aplicações práticas
                            3. Peça explicações claras de conceitos fundamentais
                            4. Solicite visualizações ou analogias quando aplicável
                            5. Adicione pedidos para que sejam mencionadas curiosidades ou fatos históricos relevantes

                            Original: "${message}"

                            Retorne APENAS o prompt melhorado, sem comentários adicionais.`
                          );
                        }
                      } else {
                        improvedPromptText = "Por favor, forneça uma explicação detalhada, incluindo exemplos práticos e conceitos fundamentais. Considere mencionar as principais teorias relacionadas e aplicações no mundo real.";
                      }

                      // Limpar formatação extra que possa ter vindo na resposta
                      improvedPromptText = improvedPromptText
                        .replace(/^(Prompt melhorado:|Aqui está uma versão melhorada:|Versão melhorada:|Melhorado:)/i, '')
                        .replace(/^["']|["']$/g, '')
                        .trim();

                      // Criar um elemento para o modal de melhoria de prompt
                      const modalHTML = `
                        <div id="improve-prompt-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
                          <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-blue-200 dark:border-blue-700 p-5 shadow-xl w-[90%] max-w-md animate-fadeIn">
                            <div class="flex justify-between items-center mb-4">
                              <h3 class="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                                  <circle cx="12" cy="12" r="10"/>
                                  <path d="m4.9 4.9 14.2 14.2"/>
                                  <path d="M9 9a3 3 0 0 1 5.12-2.136"/>
                                  <path d="M14 9.3a3 3 0 0 0-5.12 2.136"/>
                                  <path d="M16 14a2 2 0 0 1-2 2"/>
                                  <path d="M12 16a2 2 0 0 1-2-2"/>
                                </svg>
                                Aprimoramento de Prompt
                              </h3>
                              <button 
                                id="close-improve-prompt-modal"
                                class="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="M18 6 6 18"></path>
                                  <path d="m6 6 12 12"></path>
                                </svg>
                              </button>
                            </div>

                            <div class="mb-4">
                              <div class="mb-3">
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Sua mensagem original:</p>
                                <div class="p-3 bg-gray-100 dark:bg-gray-700 rounded-lg text-sm text-gray-700 dark:text-gray-300">
                                  ${message}
                                </div>
                              </div>

                              <div>
                                <p class="text-sm text-gray-500 dark:text-gray-400 mb-2">Versão aprimorada pela Epictus IA:</p>
                                <div class="p-3 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-800 rounded-lg text-sm text-gray-800 dark:text-gray-200 max-h-[150px] overflow-y-auto scrollbar-hide">
                                  ${improvedPromptText}
                                </div>
                              </div>
                            </div>

                            <div class="flex justify-end gap-3">
                              <button 
                                id="cancel-improved-prompt"
                                class="px-4 py-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg transition-colors"
                              >
                                Cancelar
                              </button>
                              <button 
                                id="use-improved-prompt"
                                class="px-4 py-2 text-sm bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-lg transition-colors flex items-center gap-1"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                  <path d="m5 12 5 5 9-9"></path>
                                </svg>
                                Usar versão melhorada
                              </button>
                            </div>
                          </div>
                        </div>
                      `;

                      // Remover qualquer modal existente
                      const existingModal = document.getElementById('improve-prompt-modal');
                      if (existingModal) {
                        existingModal.remove();
                      }

                      // Adicionar o novo modal ao DOM
                      document.body.insertAdjacentHTML('beforeend', modalHTML);

                      // Adicionar event listeners
                      setTimeout(() => {
                        const modal = document.getElementById('improve-prompt-modal');
                        const closeButton = document.getElementById('close-improve-prompt-modal');
                        const cancelButton = document.getElementById('cancel-improved-prompt');
                        const useImprovedButton = document.getElementById('use-improved-prompt');

                        // Função para fechar o modal
                        const closeModal = () => {
                          if (modal) {
                            modal.classList.add('animate-fadeOut');
                            setTimeout(() => modal.remove(), 200);
                          }
                        };

                        // Event listener para fechar o modal
                        if (closeButton) {
                          closeButton.addEventListener('click', closeModal);
                        }

                        // Event listener para cancelar
                        if (cancelButton) {
                          cancelButton.addEventListener('click', closeModal);
                        }

                        // Event listener para usar o prompt melhorado
                        if (useImprovedButton) {
                          useImprovedButton.addEventListener('click', () => {
                            // Atualizar o input com o prompt melhorado
                            setMessage(improvedPromptText);

                            // Fechar o modal
                            closeModal();

                            // Mostrar toast de confirmação
                            toast({
                              title: "Prompt aprimorado",
                              description: "Seu prompt foi aprimorado com sucesso!",
                              duration: 2000,
                            });
                          });
                        }

                        // Event listener para clicar fora e fechar
                        if (modal) {
                          modal.addEventListener('click', (e) => {
                            if (e.target === modal) {
                              closeModal();
                            }
                          });
                        }
                      }, 50);
                    } catch (error) {
                      console.error("Erro ao melhorar prompt:", error);
                      toast({
                        title: "Erro",
                        description: "Não foi possível melhorar seu prompt. Tente novamente.",
                        variant: "destructive",
                        duration: 3000,
                      });
                    }
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 20h9"/>
                    <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
                  </svg>
                </motion.button>
              )}

              {/* Botão de sugestão de prompts inteligentes */}
              <motion.button 
                className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                         flex items-center justify-center shadow-lg text-white dark:text-white"
                whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  // Exibir modal ou dropdown com sugestões de prompts
                  toast({
                    title: "Sugestões de Prompts",
                    description: "Carregando sugestões inteligentes personalizadas...",
                    duration: 2000,
                  });

                  // Criar um elemento para o modal de sugestão de prompts
                  const modalHTML = `
                    <div id="prompt-suggestions-modal" class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
                      <div class="bg-white/95 dark:bg-gray-800/95 backdrop-blur-lg rounded-xl border border-blue-200 dark:border-blue-700 p-5 shadow-xl w-[90%] max-w-md animate-fadeIn">
                        <div class="flex justify-between items-center mb-4">
                          <h3 class="text-lg font-semibold flex items-center gap-2 text-gray-800 dark:text-gray-200">
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-500">
                              <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path>
                            </svg>
                            Sugestões de Prompts
                          </h3>
                          <button 
                            id="close-prompt-suggestions-modal"
                            class="h-7 w-7 flex items-center justify-center rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M18 6 6 18"></path>
                              <path d="m6 6 12 12"></path>
                            </svg>
                          </button>
                        </div>

                        <div class="mb-4">
                          <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
                            Selecione uma sugestão ou insira um contexto para obter ideias personalizadas:
                          </p>
                          <div class="relative">
                            <input
                              type="text"
                              id="context-input"
                              placeholder="Digite um tema ou contexto..."
                              class="w-full p-2.5 pr-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                            />
                            <button
                              id="generate-suggestions-button"
                              class="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 flex items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/30 hover:bg-blue-200 dark:hover:bg-blue-800/50 transition-colors"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-blue-600 dark:text-blue-400">
                                <path d="m22 2-7 20-4-9-9-4Z"></path>
                                <path d="M22 2 11 13"></path>
                              </svg>
                            </button>
                          </div>
                        </div>

                        <div id="suggestions-container" class="space-y-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
                          <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Como posso melhorar meu desempenho no ENEM?</p>
                          </button>
                          <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Crie um resumo detalhado sobre termodinâmica</p>
                          </button>
                          <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Explique o teorema de Pitágoras com exemplos práticos</p>
                          </button>
                          <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Quais são os eventos mais importantes do Modernismo Brasileiro?</p>
                          </button>
                          <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                            <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Crie um plano de estudos semanal para vestibular</p>
                          </button>
                        </div>
                      </div>
                    </div>
                  `;

                  // Remover qualquer modal existente
                  const existingModal = document.getElementById('prompt-suggestions-modal');
                  if (existingModal) {
                    existingModal.remove();
                  }

                  // Adicionar o novo modal ao DOM
                  document.body.insertAdjacentHTML('beforeend', modalHTML);

                  // Adicionar event listeners
                  setTimeout(() => {
                    const modal = document.getElementById('prompt-suggestions-modal');
                    const closeButton = document.getElementById('close-prompt-suggestions-modal');
                    const generateButton = document.getElementById('generate-suggestions-button');
                    const contextInput = document.getElementById('context-input');
                    const suggestionsContainer = document.getElementById('suggestions-container');

                    // Função para fechar o modal
                    const closeModal = () => {
                      if (modal) {
                        modal.classList.add('animate-fadeOut');
                        setTimeout(() => modal.remove(), 200);
                      }
                    };

                    // Event listener para fechar o modal
                    if (closeButton) {
                      closeButton.addEventListener('click', closeModal);
                    }

                    // Event listener para clicar fora e fechar
                    if (modal) {
                      modal.addEventListener('click', (e) => {
                        if (e.target === modal) {
                          closeModal();
                        }
                      });
                    }

                    // Event listener para os botões de sugestão
                    if (suggestionsContainer) {
                      const suggestionButtons = suggestionsContainer.querySelectorAll('button');
                      suggestionButtons.forEach(button => {
                        button.addEventListener('click', () => {
                          // Pegar o texto da sugestão
                          const promptText = button.querySelector('p')?.textContent || '';

                          // Definir o texto no input da mensagem
                          setMessage(promptText);

                          // Fechar o modal
                          closeModal();
                        });
                      });
                    }

                    // Event listener para o botão de gerar sugestões
                    if (generateButton && contextInput && suggestionsContainer) {
                      generateButton.addEventListener('click', () => {
                        const context = (contextInput as HTMLInputElement).value.trim();
                        if (!context) return;

                        // Mostrar indicador de carregamento
                        const loadingHTML = `
                          <div class="flex items-center justify-center p-4">
                            <div class="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                            <p class="text-sm text-gray-600 dark:text-gray-400">Gerando sugestões personalizadas...</p>
                          </div>
                        `;
                        suggestionsContainer.innerHTML = loadingHTML;

                        // Simular geração de sugestões personalizadas
                        setTimeout(() => {
                          // Lista de sugestões baseadas no contexto
                          const customSuggestions = [
                            `Me explique de forma detalhada o que é ${context}?`,
                            `Quais são os principais conceitos relacionados a ${context}?`,
                            `Crie um resumo didático sobre ${context} para estudantes do ensino médio`,
                            `Quais são as aplicações práticas de ${context} no mundo real?`,
                            `Como o assunto ${context} costuma ser abordado em provas do ENEM?`
                          ];

                          // Criar HTML para as sugestões personalizadas
                          const suggestionsHTML = customSuggestions.map(suggestion => `
                            <button class="w-full text-left p-3 bg-gradient-to-r from-white to-blue-50 dark:from-gray-800 dark:to-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-900/30 hover:border-blue-300 dark:hover:border-blue-700 transition-all duration-200 group">
                              <p class="text-sm font-medium text-gray-800 dark:text-gray-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">${suggestion}</p>
                            </button>
                          `).join('');

                          // Atualizar container com as novas sugestões
                          suggestionsContainer.innerHTML = suggestionsHTML;

                          // Adicionar event listeners às novas sugestões
                          const newSuggestionButtons = suggestionsContainer.querySelectorAll('button');
                          newSuggestionButtons.forEach(button => {
                            button.addEventListener('click', () => {
                              // Pegar o texto da sugestão
                              const promptText = button.querySelector('p')?.textContent || '';

                              // Definir o texto no input da mensagem
                              setMessage(promptText);

                              // Fechar o modal
                              closeModal();
                            });
                          });
                        }, 1500);
                      });
                    }
                  }, 50);
                }}
              >
                <Lightbulb size={16} />
              </motion.button>

              {/* Botão de áudio/enviar ao lado direito do botão de sugestões */}
              {!inputHasContent ? (
                <motion.button 
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                           flex items-center justify-center shadow-lg text-white dark:text-white"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startRecording}
                >
                  {isRecording ? <Square size={16} /> : <Mic size={16} />}
                </motion.button>
              ) : (
                /* Botão de enviar - Visível apenas quando há conteúdo no input */
                <motion.button
                  className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD] 
                           flex items-center justify-center shadow-lg text-white dark:text-white"
                  whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                  whileTap={{ scale: 0.95 }}
                  animate={{ 
                    boxShadow: ["0 0 0px rgba(13, 35, 160, 0)", "0 0 15px rgba(13, 35, 160, 0.5)", "0 0 0px rgba(13, 35, 160, 0)"],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                  onClick={handleSendMessage}
                >
                  <Send size={16} />
                </motion.button>
              )}
            </div>
          </div>

          {/* Interface de gravação de áudio */}
          <AnimatePresence>
            {isRecording && (
              <motion.div 
                className="recording-interface mt-2 p-2 bg-[#0c2341]/40 rounded-xl border border-red-500/30 flex items-center justify-between dark:bg-[#0c2341]/40 dark:border-red-500/30"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500 animate-pulse"></div>
                  <span className="text-sm text-white/80 dark:text-white/80">Gravando áudio...</span>
                </div>
                <div className="flex gap-2">
                  <motion.button
                    className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white dark:text-white"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setIsRecording(false)}
                  >
                    <X size={16} />
                  </motion.button>
                  <motion.button
                    className="p-1.5 rounded-full bg-gradient-to-br from-[#0D23A0] to-[#5B21BD]"
                    whileHover={{ scale: 1.05, boxShadow: "0 0 15px rgba(13, 35, 160, 0.5)" }}
                    whileTap={{ scale: 0.95 }}
                    onClick={stopRecording}
                  >
                    <Send size={16} className="text-white dark:text-white" />
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Ações rápidas */}
          <AnimatePresence>
            <motion.div 
              className="quick-actions mt-3 pb-1 flex gap-2 overflow-x-auto scrollbar-hide"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              {quickActions.map((action, index) => (
                <QuickAction 
                  key={index} 
                  icon={action.icon} 
                  label={action.label} 
                  onClick={() => {
                    setMessage(action.label);
                    console.log(`Ação rápida: ${action.label}`);
                  }}
                />
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Painel expandido (opcional) */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                className="expanded-panel mt-3 p-3 bg-[#0c2341]/40 rounded-xl border border-white/10 dark:bg-[#0c2341]/40 dark:border-white/10"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex flex-wrap gap-2">
                  <div className="text-xs text-white/70 mb-1 w-full dark:text-white/70">Opções avançadas:</div>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Escolher competência
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Modo resposta rápida
                  </motion.button>
                  <motion.button 
                    className="px-3 py-1.5 text-sm bg-gradient-to-r from-[#0c2341]/70 to-[#0f3562]/70 
                               text-white rounded-lg border border-white/10 dark:text-white"
                    whileHover={{ scale: 1.02, boxShadow: "0 0 10px rgba(13, 35, 160, 0.3)" }}
                  >
                    Adicionar mídia
                  </motion.button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Botões de ação para a conversa - aparecem somente quando há mensagens */}
          {chatMessages.length > 0 && (
            <div className="flex justify-end gap-2 mt-2">
              <motion.button
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-[#0c2341]/60 to-[#0f3562]/60
                          text-white rounded-md border border-white/10"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  // Copiar conversa para área de transferência
                  const conversationText = chatMessages
                    .map(msg => `${msg.sender === 'user' ? 'Você' : 'Epictus IA'}: ${msg.content}`)
                    .join('\n\n');

                  navigator.clipboard.writeText(conversationText);

                  toast({
                    title: "Conversa copiada",
                    description: "O conteúdo da conversa foi copiado para a área de transferência",
                    duration: 2000,
                  });
                }}
              >
                <Copy size={14} />
                <span>Copiar conversa</span>
              </motion.button>

              <motion.button
                className="flex items-center gap-1 px-2 py-1 text-xs bg-gradient-to-r from-[#0c2341]/60 to-[#0f3562]/60
                          text-white rounded-md border border-white/10"
                whileHover={{ scale: 1.05 }}
                onClick={() => {
                  // Limpar conversa
                  setChatMessages([]);
                  setShowWelcomeMessage(true);

                  toast({
                    title: "Conversa limpa",
                    description: "O histórico da conversa foi apagado",
                    duration: 2000,
                  });
                }}
              >
                <X size={14} />
                <span>Limpar conversa</span>
              </motion.button>
            </div>
          )}
        </div>
      </motion.div>
      </div>
    </>
  );
};

export default TurboAdvancedMessageBox;