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
import { ChatInput } from '../../../sections/SchoolPower/components';

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
      className="flex flex-col h-full w-full mx-auto bg-transparent backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden"
      style={{ maxWidth: CHAT_CONFIG.maxWidth, width: CHAT_CONFIG.widthPx }}
    >
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/10 bg-black/10">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span>Voltar</span>
        </button>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
            <Bot className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-white font-semibold">Agente Jota</h2>
            <p className="text-white/50 text-sm">Assistente School Power</p>
          </div>
        </div>

        <button
          onClick={() => setShowContextModal(!showContextModal)}
          className="px-3 py-1.5 text-sm bg-white/10 hover:bg-white/20 text-white rounded-lg transition-colors"
        >
          Contexto
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-64">
        <MessageStream messages={sessionState.messages} />

        <AnimatePresence>
          {sessionState.executionPlan && 
           sessionState.executionPlan.status === 'aguardando_aprovacao' && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
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
          <ExecutionPlanCard
            plan={sessionState.executionPlan}
            onExecute={handleExecutePlan}
            isExecuting={sessionState.isExecuting}
            currentStep={sessionState.currentStep}
          />
        )}

        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
        <div className="relative" style={{ width: '900px' }}>
          <ChatInput 
            onSend={(msg) => {
              if (msg.trim() && !sessionState.isLoading && !sessionState.isExecuting) {
                handleUserPrompt(msg);
              }
            }}
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
