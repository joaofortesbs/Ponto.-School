/**
 * CHAT LAYOUT - Interface Principal de Chat em Produção
 * 
 * Layout completo do chat que aparece após o usuário enviar o primeiro prompt.
 * Gerencia toda a interação entre usuário e Agente Jota.
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, User, Loader2 } from 'lucide-react';
import { MessageStream } from './MessageStream';
import { ExecutionPlanCard } from './ExecutionPlanCard';
import { ContextModal } from './ContextModal';
import { processUserPrompt, executeAgentPlan } from '../agente-jota/orchestrator';
import { generateSessionId } from '../agente-jota/memory-manager';
import type { 
  ChatMessage, 
  ExecutionPlan, 
  WorkingMemoryItem, 
  ChatSessionState,
  ProgressUpdate 
} from './types';
import { ChatInputJota } from './chat-input-jota';
import { CardSuperiorSuasCriacoes } from './card-superior-suas-criacoes-input';

interface ChatLayoutProps {
  initialMessage: string;
  userId?: string;
  onBack: () => void;
}
// Configuração de dimensões e proporções do chat
const CHAT_CONFIG = {
  maxWidth: '95%', // Largura relativa ao container pai
  widthPx: '1600px', // Largura máxima em pixels
};

export function ChatLayout({ initialMessage, userId = 'user-default', onBack }: ChatLayoutProps) {
  const [sessionState, setSessionState] = useState<ChatSessionState>({
    sessionId: generateSessionId(),
    userId,
    messages: [],
    executionPlan: null,
    workingMemory: [],
    isExecuting: false,
    isLoading: false,
    currentStep: null,
  });

  const [inputValue, setInputValue] = useState('');
  const [showContextModal, setShowContextModal] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const hasProcessedInitialMessage = useRef(false);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [sessionState.messages, scrollToBottom]);

  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      handleUserPrompt(initialMessage);
    }
  }, [initialMessage]);

  const addMessage = useCallback((message: Omit<ChatMessage, 'id' | 'timestamp'>) => {
    const newMessage: ChatMessage = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setSessionState(prev => ({
      ...prev,
      messages: [...prev.messages, newMessage],
    }));
    return newMessage;
  }, []);

  const addMemory = useCallback((item: Omit<WorkingMemoryItem, 'id' | 'timestamp'>) => {
    const newItem: WorkingMemoryItem = {
      ...item,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setSessionState(prev => ({
      ...prev,
      workingMemory: [...prev.workingMemory, newItem],
    }));
  }, []);

  const handleUserPrompt = async (userInput: string) => {
    if (!userInput.trim()) return;

    console.log('📨 [ChatLayout] Processando prompt do usuário:', userInput);

    addMessage({ role: 'user', content: userInput });

    setSessionState(prev => ({ ...prev, isLoading: true }));

    try {
      const { plan, initialMessage: aiMessage } = await processUserPrompt(
        userInput,
        sessionState.sessionId,
        sessionState.userId,
        sessionState.workingMemory
      );

      addMessage({ role: 'assistant', content: aiMessage });

      if (plan) {
        setSessionState(prev => ({
          ...prev,
          executionPlan: plan,
          isLoading: false,
        }));

        addMemory({
          tipo: 'objetivo',
          conteudo: plan.objetivo,
        });
      } else {
        setSessionState(prev => ({ ...prev, isLoading: false }));
      }
    } catch (error) {
      console.error('❌ [ChatLayout] Erro ao processar prompt:', error);
      addMessage({
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.',
      });
      setSessionState(prev => ({ ...prev, isLoading: false }));
    }
  };

  const handleExecutePlan = async () => {
    if (!sessionState.executionPlan) return;

    console.log('▶️ [ChatLayout] Iniciando execução do plano');

    setSessionState(prev => ({
      ...prev,
      isExecuting: true,
      executionPlan: {
        ...prev.executionPlan!,
        status: 'em_execucao',
      },
    }));

    addMessage({
      role: 'assistant',
      content: `Iniciando execução do plano com ${sessionState.executionPlan.etapas.length} etapas...`,
    });

    const handleProgress = (update: ProgressUpdate) => {
      console.log('📊 [ChatLayout] Progresso:', update);

      if (update.status === 'executando' && update.etapaAtual !== undefined) {
        setSessionState(prev => ({
          ...prev,
          currentStep: update.etapaAtual!,
          executionPlan: prev.executionPlan ? {
            ...prev.executionPlan,
            etapas: prev.executionPlan.etapas.map(e =>
              e.ordem === update.etapaAtual
                ? { ...e, status: 'executando' }
                : e
            ),
          } : null,
        }));

        if (update.descricao) {
          addMemory({
            tipo: 'acao',
            conteudo: update.descricao,
            etapa: update.etapaAtual,
          });
        }
      }

      if (update.status === 'etapa_concluida' && update.etapaAtual !== undefined) {
        setSessionState(prev => ({
          ...prev,
          executionPlan: prev.executionPlan ? {
            ...prev.executionPlan,
            etapas: prev.executionPlan.etapas.map(e =>
              e.ordem === update.etapaAtual
                ? { ...e, status: 'concluida', resultado: update.resultado }
                : e
            ),
          } : null,
        }));

        if (update.resultado) {
          addMemory({
            tipo: 'descoberta',
            conteudo: typeof update.resultado === 'string' 
              ? update.resultado 
              : JSON.stringify(update.resultado),
            etapa: update.etapaAtual,
            resultado: update.resultado,
          });
        }
      }
    };

    try {
      const relatorio = await executeAgentPlan(
        sessionState.executionPlan,
        sessionState.sessionId,
        handleProgress
      );

      setSessionState(prev => ({
        ...prev,
        isExecuting: false,
        currentStep: null,
        executionPlan: prev.executionPlan ? {
          ...prev.executionPlan,
          status: 'concluido',
        } : null,
      }));

      addMessage({
        role: 'assistant',
        content: relatorio,
      });

      addMemory({
        tipo: 'resultado',
        conteudo: 'Plano executado com sucesso',
        resultado: relatorio,
      });

    } catch (error) {
      console.error('❌ [ChatLayout] Erro na execução:', error);
      setSessionState(prev => ({
        ...prev,
        isExecuting: false,
        executionPlan: prev.executionPlan ? {
          ...prev.executionPlan,
          status: 'erro',
        } : null,
      }));

      addMessage({
        role: 'assistant',
        content: 'Ocorreu um erro durante a execução. Por favor, tente novamente.',
      });
    }
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim() && !sessionState.isLoading && !sessionState.isExecuting) {
      handleUserPrompt(inputValue);
      setInputValue('');
    }
  };

  return (
    <div 
      className="flex flex-col h-full w-full mx-auto bg-[#050a18] overflow-hidden"
      style={{ maxWidth: '100%', width: '100%' }}
    >
      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-80 relative">
        <div className="max-w-[1200px] mx-auto w-full">
          <MessageStream messages={sessionState.messages} />

          <AnimatePresence>
            {sessionState.executionPlan && 
             sessionState.executionPlan.status === 'aguardando_aprovacao' && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="max-w-2xl mx-auto mt-4"
              >
                <ExecutionPlanCard
                  plan={sessionState.executionPlan}
                  onExecute={handleExecutePlan}
                  isExecuting={sessionState.isExecuting}
                  currentStep={sessionState.currentStep}
                />
              </motion.div>
            )}
          </AnimatePresence>

          {sessionState.executionPlan && 
           sessionState.executionPlan.status === 'em_execucao' && (
            <div className="max-w-2xl mx-auto mt-4">
              <ExecutionPlanCard
                plan={sessionState.executionPlan}
                onExecute={handleExecutePlan}
                isExecuting={sessionState.isExecuting}
                currentStep={sessionState.currentStep}
              />
            </div>
          )}
        </div>
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-32 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
        <div className="flex flex-col items-center" style={{ width: '600px' }}>
          <CardSuperiorSuasCriacoes 
            plan={sessionState.executionPlan}
            currentStep={sessionState.currentStep}
            isExpanded={isCardExpanded}
            onToggleExpand={() => setIsCardExpanded(!isCardExpanded)}
            onOpenContext={() => setShowContextModal(true)}
          />
          <ChatInputJota 
            onSend={(msg) => {
              if (msg.trim() && !sessionState.isLoading && !sessionState.isExecuting) {
                handleUserPrompt(msg);
              }
            }}
            isLoading={sessionState.isLoading}
            isDisabled={sessionState.isExecuting}
            placeholder="Digite sua mensagem ou comando..."
          />
        </div>
      </div>

      <AnimatePresence>
        {showContextModal && (
          <ContextModal
            workingMemory={sessionState.workingMemory}
            onClose={() => setShowContextModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatLayout;
