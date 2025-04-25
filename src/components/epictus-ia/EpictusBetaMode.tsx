import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Send, User, MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
import EpictusIAHeader from './EpictusIAHeader';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

const EpictusBetaMode: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Rolar automaticamente para a última mensagem
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Focar no input quando o componente montar
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;

    // Adicionar mensagem do usuário
    const userMessage: Message = {
      id: Date.now().toString(),
      sender: 'user',
      text: input,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simular resposta da IA
    setIsTyping(true);
    setTimeout(() => {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: `Recebido! Você disse: "${input}"`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, aiMessage]);
      setIsTyping(false);
    }, 1500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#001427] text-white">
      {/* Cabeçalho */}
      <div className="p-4">
        <EpictusIAHeader />
      </div>

      {/* Área principal com menu dropdown e chat */}
      <div className="flex-1 px-4 pb-4 flex flex-col">
        {/* Menu dropdown de personalidades */}
        <div className="relative mb-4 z-10">
          <div className="flex items-center bg-[#0D1A30] rounded-lg p-2 w-48">
            <span className="text-sm font-medium mr-2">Personalidades</span>
            <MoreHorizontal className="h-4 w-4 text-white/60" />
          </div>
        </div>

        {/* Chat */}
        <div className="flex-1 flex flex-col">
          {/* Área de conversas */}
          <div 
            className="flex-1 bg-[#1A2634] rounded-lg overflow-y-auto mb-4 scroll-smooth"
            style={{
              maxWidth: '900px',
              width: '80%',
              margin: '0 auto',
              scrollbarWidth: 'thin',
              scrollbarColor: '#4A90E2 #2F3B4C'
            }}
          >
            <div className="p-4 space-y-4">
              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div 
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.sender === 'user' 
                        ? 'bg-[#4A90E2] text-white' 
                        : 'bg-[#2F3B4C] text-white'
                    }`}
                  >
                    <p>{message.text}</p>
                    <span className="text-xs text-[#A0A0A0] block mt-1">{message.timestamp}</span>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-[#2F3B4C] text-white rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '600ms' }}></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Caixa de envio de mensagens */}
          <div 
            className="bg-[#2F3B4C] rounded-lg p-2 flex items-center"
            style={{
              maxWidth: '900px',
              width: '80%',
              margin: '0 auto',
              height: '50px'
            }}
          >
            <input
              ref={inputRef}
              type="text"
              className="flex-1 bg-[#1A2634] text-white placeholder-[#A0A0A0] rounded p-2 mr-2 outline-none"
              placeholder="Digite sua mensagem para a IA..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
            />
            <motion.button
              className="bg-[#4A90E2] text-white rounded-full w-10 h-10 flex items-center justify-center"
              whileHover={{ scale: 1.05, backgroundColor: '#5AAEFF' }}
              whileTap={{ scale: 0.9 }}
              onClick={handleSendMessage}
            >
              <Send className="h-5 w-5" />
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EpictusBetaMode;