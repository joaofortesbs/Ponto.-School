import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { PlanActionCard } from './PlanActionCard';
import { DeveloperModeCard } from './DeveloperModeCard';
import { ActivityConstructionCard } from './ActivityConstructionCard';

interface MessageStreamProps {
  onApplyPlan?: () => void;
}

export function MessageStream({ onApplyPlan }: MessageStreamProps) {
  const messages = useChatState((state) => state.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    const devModeCards = messages.filter(m => m.type === 'dev_mode_card');
    const planCards = messages.filter(m => m.type === 'plan_card');
    console.log('📊 [MessageStream] Total mensagens:', messages.length);
    console.log('📊 [MessageStream] DevModeCards:', devModeCards.length, devModeCards.map(c => c.id));
    console.log('📊 [MessageStream] PlanCards:', planCards.length, planCards.map(c => c.id));
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
                onApplyPlan={onApplyPlan}
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
                sessionId={message.metadata?.cardData?.sessionId || ""}
                atividades={message.metadata?.cardData?.atividades || []}
              />
            )}

            {/* 
              content_generation_card type DESATIVADO - geração de conteúdo agora 
              aparece apenas como sub-card retangular dentro do tópico "Decidir quais 
              atividades criar" via capability gerar_conteudo_atividades 
            */}
          </motion.div>
        ))}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}

export default MessageStream;
