/**
 * MESSAGE STREAM - Stream de Mensagens em Tempo Real
 * 
 * Componente que renderiza as mensagens do chat com animações suaves
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Bot, User } from 'lucide-react';
import type { ChatMessage } from './types';

interface MessageStreamProps {
  messages: ChatMessage[];
}

export function MessageStream({ messages }: MessageStreamProps) {
  const formatTime = (timestamp: number) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="space-y-4">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05, duration: 0.3 }}
          className={`flex items-start gap-3 ${
            message.role === 'user' ? 'flex-row-reverse' : ''
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
              message.role === 'user'
                ? 'bg-gradient-to-br from-blue-400 to-blue-600'
                : 'bg-gradient-to-br from-purple-500 to-blue-500'
            }`}
          >
            {message.role === 'user' ? (
              <User className="w-4 h-4 text-white" />
            ) : (
              <Bot className="w-4 h-4 text-white" />
            )}
          </div>

          <div
            className={`max-w-[80%] ${
              message.role === 'user' ? 'text-right' : 'text-left'
            }`}
          >
            <div
              className={`inline-block px-4 py-3 rounded-2xl ${
                message.role === 'user'
                  ? 'bg-blue-500/20 border border-blue-500/30 text-white'
                  : 'bg-white/10 border border-white/10 text-white'
              }`}
            >
              <p className="whitespace-pre-wrap leading-relaxed">
                {message.content}
              </p>
            </div>
            <span className="text-xs text-white/40 mt-1 block px-2">
              {formatTime(message.timestamp)}
            </span>
          </div>
        </motion.div>
      ))}

      {messages.length === 0 && (
        <div className="text-center py-12">
          <Bot className="w-16 h-16 mx-auto text-white/20 mb-4" />
          <p className="text-white/40">
            Aguardando sua primeira mensagem...
          </p>
        </div>
      )}
    </div>
  );
}

export default MessageStream;
