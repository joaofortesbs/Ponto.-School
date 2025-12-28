import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { PlanActionCard } from './PlanActionCard';
import { DeveloperModeCard } from './DeveloperModeCard';
import { ActivityConstructionCard } from './ActivityConstructionCard';

export function MessageStream() {
  const messages = useChatState((state) => state.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div 
      ref={scrollRef}
      className="flex flex-col gap-4 p-6 overflow-y-auto h-full scroll-smooth"
      style={{ scrollBehavior: 'smooth' }}
    >
      <AnimatePresence initial={false}>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col"
          >
            {message.type === 'user' && (
              <UserMessage content={message.content} />
            )}

            {message.type === 'assistant' && (
              <AssistantMessage content={message.content} />
            )}

            {message.type === 'plan_card' && (
              <PlanActionCard 
                cardId={message.id}
                data={message.metadata?.cardData}
                isStatic={message.metadata?.isStatic}
              />
            )}

            {message.type === 'dev_mode_card' && (
              <DeveloperModeCard 
                cardId={message.id}
                data={message.metadata?.cardData}
                isStatic={message.metadata?.isStatic}
              />
            )}

            {message.type === 'construction_card' && (
              <ActivityConstructionCard 
                sessionId=""
                atividades={message.metadata?.cardData?.atividades || []}
              />
            )}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}

export default MessageStream;
