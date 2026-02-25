import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChatState } from '../state/chatState';
import { UserMessage } from './UserMessage';
import { AssistantMessage } from './AssistantMessage';
import { PlanActionCard } from './PlanActionCard';
import { DeveloperModeCard } from './DeveloperModeCard';
import { ActivityConstructionCard } from './ActivityConstructionCard';
import { ArtifactCard } from './ArtifactCard';
import { StructuredResponseMessage } from './StructuredResponseMessage';
import { FileProcessingCard } from './FileProcessingCard';
import type { ArtifactData } from '../../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import type { ActivitySummaryUI } from '../types/message-types';

interface MessageStreamProps {
  onApplyPlan?: () => void;
  onOpenArtifact?: (artifact: ArtifactData) => void;
  onOpenActivity?: (activity: ActivitySummaryUI) => void;
}

export function MessageStream({ onApplyPlan, onOpenArtifact, onOpenActivity }: MessageStreamProps) {
  const messages = useChatState((state) => state.messages);
  const isLoading = useChatState((state) => state.isLoading);
  const fileProcessingStatus = useChatState((state) => state.fileProcessingStatus);
  const fileDebugEntries = useChatState((state) => state.fileDebugEntries);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading, fileProcessingStatus]);

  useEffect(() => {
    const devModeCards = messages.filter(m => m.type === 'dev_mode_card');
    const planCards = messages.filter(m => m.type === 'plan_card');
    console.log('📊 [MessageStream] Total mensagens:', messages.length);
    console.log('📊 [MessageStream] DevModeCards:', devModeCards.length, devModeCards.map(c => c.id));
    console.log('📊 [MessageStream] PlanCards:', planCards.length, planCards.map(c => c.id));
  }, [messages]);

  const showFileProcessing = isLoading && fileProcessingStatus.active && fileProcessingStatus.status === 'processing';
  const showFileComplete = fileProcessingStatus.active && fileProcessingStatus.status === 'complete';
  const showThinking = isLoading && !showFileProcessing;

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
              <UserMessage content={message.content} attachments={message.attachments} />
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

            {message.type === 'artifact_card' && message.metadata?.cardData && (
              <ArtifactCard
                artifact={message.metadata.cardData}
                onOpen={onOpenArtifact}
              />
            )}

            {message.type === 'structured_response' && message.metadata?.cardData && (
              <StructuredResponseMessage
                blocks={message.metadata.cardData.blocks || []}
                onOpenArtifact={onOpenArtifact}
                onOpenActivity={onOpenActivity}
              />
            )}
          </motion.div>
        ))}

        {showFileProcessing && (
          <motion.div
            key="file-processing-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col"
          >
            <FileProcessingCard
              fileNames={fileProcessingStatus.fileNames}
              status="processing"
              processedCount={fileProcessingStatus.processedCount}
              debugEntries={fileDebugEntries}
            />
          </motion.div>
        )}

        {showFileComplete && (
          <motion.div
            key="file-complete-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col"
          >
            <FileProcessingCard
              fileNames={fileProcessingStatus.fileNames}
              status="complete"
              processedCount={fileProcessingStatus.processedCount}
              debugEntries={fileDebugEntries}
            />
          </motion.div>
        )}
        
        {showThinking && (
          <motion.div
            key="thinking-indicator"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="w-full flex flex-col"
          >
            <AssistantMessage content="" isThinking={true} />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="h-4" />
    </div>
  );
}

export default MessageStream;
