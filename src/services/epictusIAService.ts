import { v4 as uuidv4 } from 'uuid';

// Interface de mensagem para o chat
export interface ChatMessage {
  id?: string;
  sender: 'user' | 'ai' | 'system';
  content: string;
  timestamp?: Date;
}

// Histórico de conversas por sessão
const conversationHistory: Record<string, ChatMessage[]> = {};

// Função para criar uma nova mensagem
export const createMessage = (content: string, sender: 'user' | 'ai' | 'system'): ChatMessage => {
  return {
    id: uuidv4(),
    sender,
    content,
    timestamp: new Date()
  };
};

// Função para adicionar mensagem ao histórico
export const addMessageToHistory = (sessionId: string, message: ChatMessage): void => {
  if (!conversationHistory[sessionId]) {
    conversationHistory[sessionId] = [];
  }

  conversationHistory[sessionId].push(message);

  // Salvar no localStorage
  try {
    localStorage.setItem(`epictus_ia_history_${sessionId}`, JSON.stringify(conversationHistory[sessionId]));
  } catch (error) {
    console.error("Erro ao salvar histórico de conversa:", error);
  }
};

// Função para obter histórico de conversas
export const getChatHistory = (sessionId: string): ChatMessage[] => {
  if (conversationHistory[sessionId]) {
    return conversationHistory[sessionId];
  }

  // Tentar recuperar do localStorage
  try {
    const savedHistory = localStorage.getItem(`epictus_ia_history_${sessionId}`);
    if (savedHistory) {
      const parsedHistory = JSON.parse(savedHistory) as ChatMessage[];
      conversationHistory[sessionId] = parsedHistory;
      return parsedHistory;
    }
  } catch (error) {
    console.error("Erro ao recuperar histórico do localStorage:", error);
  }

  return [];
};

// Função para limpar histórico da conversa
export const clearChatHistory = (sessionId: string): void => {
  conversationHistory[sessionId] = [];
  try {
    localStorage.removeItem(`epictus_ia_history_${sessionId}`);
  } catch (error) {
    console.error("Erro ao limpar histórico do localStorage:", error);
  }
};

// Função para gerar resposta da IA
export const generateAIResponse = async (message: string, sessionId?: string): Promise<string> => {
  try {
    // Aqui poderia ser integrada a chamada para uma API externa de IA
    // Por enquanto vamos usar uma lista de respostas pré-definidas

    const responses = [
      "Entendi! Como posso te ajudar mais com isso?",
      "Interessante perspectiva. Vamos explorar mais esse conceito?",
      "Ótima pergunta! Vou explicar de forma detalhada.",
      "Isso é um excelente ponto. Deixe-me expandir um pouco mais...",
      "Baseado no que você disse, acho que podemos abordar isso de várias maneiras.",
      "Compreendo sua dúvida. Vamos dividir esse problema em partes menores.",
      "Vamos analisar isso passo a passo para garantir uma compreensão completa.",
      "Essa é uma questão complexa. Vou fornecer uma explicação abrangente.",
      "Obrigado por compartilhar isso. Aqui está o que penso sobre o assunto...",
      "Sua abordagem é interessante! Posso sugerir algumas alternativas também?"
    ];

    // Adicionar contexto específico baseado em palavras-chave
    if (message.toLowerCase().includes("vibe code")) {
      return "Vibe Code é uma poderosa linguagem de programação orientada a objetos que combina a sintaxe intuitiva do Python com a tipagem forte do TypeScript. Ela é especialmente projetada para aplicações de IA e desenvolvimento web moderno. Quer aprender os conceitos básicos ou tem alguma dúvida específica sobre como implementar algo em Vibe Code?";
    }

    if (message.toLowerCase().includes("programar") || message.toLowerCase().includes("programação")) {
      return "A programação é uma habilidade essencial no mundo digital de hoje! Para começar, recomendo entender os conceitos fundamentais como variáveis, loops, condicionais e funções. Que linguagem de programação você está interessado em aprender? Posso te dar uma introdução personalizada.";
    }

    if (message.toLowerCase().includes("matemática") || message.toLowerCase().includes("cálculo")) {
      return "A matemática é fascinante! Desde conceitos básicos até tópicos avançados como cálculo, álgebra linear ou estatística, há muito a explorar. Em que área específica você gostaria de focar? Posso ajudar com explicações, exemplos ou exercícios práticos.";
    }

    if (message.toLowerCase().includes("fluxograma")) {
      return "Fluxogramas são representações visuais poderosas de processos ou algoritmos. Eles usam símbolos como retângulos (processos), losangos (decisões) e setas (fluxo) para ilustrar sequências lógicas. Você gostaria de aprender como criar um fluxograma eficaz ou precisa de ajuda com um fluxograma específico?";
    }

    // Resposta aleatória se não houver contexto específico
    const randomIndex = Math.floor(Math.random() * responses.length);
    return responses[randomIndex];

  } catch (error) {
    console.error("Erro ao gerar resposta da IA:", error);
    return "Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente mais tarde.";
  }
};

// React component usando as funções acima
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Sparkles, Bot, User, Loader2 } from 'lucide-react';

const EpictusChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const sessionId = `epictus-ia-${Date.now()}`;

  // Carrega mensagens iniciais
  useEffect(() => {
    try {
      const savedMessages = getChatHistory(sessionId);
      setMessages(savedMessages);
    } catch (error) {
      console.error("Erro ao carregar mensagens iniciais:", error);
      const welcomeMessage = createMessage(
        "Olá! Eu sou a Epictus IA, seu assistente de estudos. Como posso ajudar você hoje?",
        'ai'
      );
      setMessages([welcomeMessage]);
    }
  }, []);

  // Rola para a última mensagem
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    try {
      // Cria e adiciona mensagem do usuário
      const userMessage = createMessage(input, 'user');
      setMessages(prev => [...prev, userMessage]);
      addMessageToHistory(sessionId, userMessage);
      setInput('');

      // Processa a resposta
      setIsLoading(true);

      // Simulação simplificada
      const aiResponse = await generateAIResponse(input, sessionId);

      const aiMessage = createMessage(aiResponse, 'ai');
      setMessages(prev => [...prev, aiMessage]);
      addMessageToHistory(sessionId, aiMessage);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = createMessage(
        "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        'ai'
      );
      setMessages(prev => [...prev, errorMessage]);
      addMessageToHistory(sessionId, errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full border rounded-lg overflow-hidden bg-white dark:bg-[#011C3B] shadow-sm">
      <div className="p-4 border-b bg-gray-50 dark:bg-[#001C3B]/80 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-indigo-500" />
        <h2 className="font-medium text-gray-900 dark:text-white">Chat Epictus IA</h2>
      </div>

      {/* Área de mensagens */}
      <div 
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
      >
        {messages.map((message, index) => (
          <div
            key={message.id || index}
            className={`flex items-start gap-3 ${
              message.sender === 'ai' ? 'justify-start' : 'justify-end'
            }`}
          >
            {message.sender === 'ai' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center">
                <Bot className="h-4 w-4 text-white" />
              </div>
            )}

            <div
              className={`rounded-lg p-3 max-w-[80%] ${
                message.sender === 'ai'
                  ? 'bg-gray-100 text-gray-800 dark:bg-[#122C4B] dark:text-gray-100'
                  : 'bg-indigo-500 text-white ml-auto'
              }`}
            >
              <p className="whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-50 mt-1">
                {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {message.sender === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
                <User className="h-4 w-4 text-indigo-600 dark:text-indigo-300" />
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 flex items-center justify-center">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <div className="rounded-lg p-3 bg-gray-100 text-gray-800 dark:bg-[#122C4B] dark:text-gray-100">
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processando...</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Área de input */}
      <div className="p-3 border-t flex items-end gap-2">
        <Textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Digite sua mensagem..."
          className="resize-none min-h-[50px] max-h-[150px] flex-1"
          disabled={isLoading}
        />
        <Button 
          onClick={handleSendMessage}
          disabled={isLoading || !input.trim()} 
          size="icon"
        >
          <SendIcon className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default EpictusChatInterface;