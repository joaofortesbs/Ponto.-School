import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { generateAIResponse, createMessage, addMessageToHistory, getChatHistory, ChatMessage } from '@/services/epictusIAService';

const EpictusChatInterface: React.FC = () => {
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Carrega mensagens iniciais
  useEffect(() => {
    try {
      const welcomeMessage = createMessage(
        "Olá! Eu sou a Epictus IA, seu assistente de estudos. Como posso ajudar você hoje?",
        'ai'
      );
      setMessages([welcomeMessage]);
    } catch (error) {
      console.error("Erro ao carregar mensagens iniciais:", error);
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
      setInput('');

      // Processa a resposta
      setIsLoading(true);

      // Simulação simplificada
      const aiResponse = await generateAIResponse(input);

      const aiMessage = createMessage(aiResponse, 'ai');
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Erro ao gerar resposta:', error);
      const errorMessage = createMessage(
        "Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.",
        'ai'
      );
      setMessages(prev => [...prev, errorMessage]);
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
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { SendIcon, Sparkles, Bot, User, Loader2 } from 'lucide-react';
import { 
  ChatMessage, 
  createMessage, 
  addMessageToHistory, 
  getChatHistory, 
  generateAIResponse 
} from '@/services/epictusIAService';

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
      if (savedMessages && savedMessages.length > 0) {
        setMessages(savedMessages);
      } else {
        // Inicializa com um array vazio em vez de adicionar uma mensagem de boas-vindas
        setMessages([]);
      }
    } catch (error) {
      console.error("Erro ao carregar mensagens iniciais:", error);
      // Inicializa com um array vazio em caso de erro
      setMessages([]);
    }
  }, [sessionId]);

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
