/**
 * CHAT LAYOUT - Interface Principal de Chat em Produção
 * 
 * Layout completo do chat que aparece após o usuário enviar o primeiro prompt.
 * Gerencia toda a interação entre usuário e Agente Jota.
 * 
 * REFATORADO: Agora usa useChatState (Zustand) para manter cards ancorados no chat
 */

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Bot, User, Loader2, LogOut } from 'lucide-react';
import { MessageStream } from './components/MessageStream';
import { ContextModal } from './ContextModal';
import { useChatState } from './state/chatState';
import { processUserPrompt, executeAgentPlan } from '../agente-jota/orchestrator';
import { generateSessionId } from '../agente-jota/memory-manager';

import type { 
  ExecutionPlan, 
  WorkingMemoryItem, 
  ProgressUpdate 
} from './types';

import { ChatInputJota } from './chat-input-jota';
import { CardSuperiorSuasCriacoes } from './card-superior-suas-criacoes-input';
import { ProgressBadge } from './components/ProgressBadge';

let globalExecutionLock = false;

interface ChatLayoutProps {
  initialMessage: string;
  userId?: string;
  onBack: () => void;
}

const CHAT_CONFIG = {
  maxWidth: '95%',
  widthPx: '1600px',
};

export function ChatLayout({ initialMessage, userId = 'user-default', onBack }: ChatLayoutProps) {
  const [sessionId, setSessionId] = useState(() => generateSessionId());
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [workingMemory, setWorkingMemory] = useState<WorkingMemoryItem[]>([]);
  const [isExecuting, setIsExecutingLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  
  const [showContextModal, setShowContextModal] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const hasProcessedInitialMessage = useRef(false);
  const isExecutingPlanRef = useRef(false);

  const { 
    messages,
    addTextMessage, 
    addPlanCard, 
    addDevModeCard,
    setExecuting,
    clearMessages,
    activeDevModeCardId
  } = useChatState();

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (initialMessage && !hasProcessedInitialMessage.current) {
      hasProcessedInitialMessage.current = true;
      handleUserPrompt(initialMessage);
    }
  }, [initialMessage]);

  const addMemory = useCallback((item: Omit<WorkingMemoryItem, 'id' | 'timestamp'>) => {
    const newItem: WorkingMemoryItem = {
      ...item,
      id: `mem-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };
    setWorkingMemory(prev => [...prev, newItem]);
  }, []);

  const handleUserPrompt = async (userInput: string) => {
    if (!userInput.trim()) return;

    console.log('📨 [ChatLayout] Processando prompt do usuário:', userInput);

    addTextMessage('user', userInput);
    setIsLoading(true);

    try {
      const { plan, initialMessage: aiMessage } = await processUserPrompt(
        userInput,
        sessionId,
        userId,
        workingMemory
      );

      addTextMessage('assistant', aiMessage);

      if (plan) {
        setExecutionPlan(plan);
        
        addPlanCard({
          objetivo: plan.objetivo,
          etapas: plan.etapas.map((e, idx) => ({
            ordem: idx,
            titulo: e.titulo || e.descricao,
            descricao: e.descricao
          }))
        });

        addMemory({
          tipo: 'objetivo',
          conteudo: plan.objetivo,
        });
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ [ChatLayout] Erro ao processar prompt:', error);
      addTextMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!executionPlan) return;

    if (globalExecutionLock) {
      console.warn('⚠️ [ChatLayout] Execução bloqueada por globalExecutionLock! Ignorando chamada duplicada.');
      return;
    }

    if (isExecutingPlanRef.current) {
      console.warn('⚠️ [ChatLayout] Execução já em andamento (ref)! Ignorando chamada duplicada.');
      return;
    }

    globalExecutionLock = true;
    isExecutingPlanRef.current = true;

    const existingDevModeCards = messages.filter(m => m.type === 'dev_mode_card');
    console.log('▶️ [ChatLayout] Iniciando execução do plano');
    console.log('🔍 [ChatLayout] DevMode cards existentes ANTES:', existingDevModeCards.length);
    console.log('🔍 [ChatLayout] Total de mensagens:', messages.length);

    if (existingDevModeCards.length > 0) {
      console.warn('⚠️ [ChatLayout] DevMode card já existe! Abortando criação duplicada.');
      globalExecutionLock = false;
      isExecutingPlanRef.current = false;
      return;
    }

    setIsExecutingLocal(true);
    setExecuting(true);
    
    const updatedPlan = {
      ...executionPlan,
      status: 'em_execucao' as const
    };
    setExecutionPlan(updatedPlan);

    addTextMessage('assistant', 'Vou executar o seu plano de ação agora');

    addDevModeCard({
      plano: executionPlan,
      status: 'executando',
      etapaAtual: 0,
      etapas: executionPlan.etapas.map((e, idx) => ({
        ordem: idx,
        titulo: e.titulo || e.descricao,
        descricao: e.descricao,
        status: idx === 0 ? 'executando' : 'pendente',
        capabilities: []
      }))
    });

    addTextMessage('assistant', `Iniciando execução do plano com ${executionPlan.etapas.length} etapas...`);

    const handleProgress = (update: ProgressUpdate & { 
      capabilityId?: string; 
      capabilityStatus?: string;
      capabilityResult?: any;
      capabilityDuration?: number;
    }) => {
      console.log('📊 [ChatLayout] Progresso:', update);

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: update.status === 'etapa_concluida' ? 'execution:step:completed' : 
                update.status === 'executando' ? 'capability:iniciou' : 
                update.status === 'concluido' ? 'execution:completed' : update.status,
          stepIndex: update.etapaAtual,
          stepTitle: update.descricao,
          capability_id: update.capabilityId,
          capability_name: update.descricao,
          mensagem: update.resultado ? `Concluído: ${update.descricao}` : undefined
        }
      }));

      if (update.status === 'executando' && update.etapaAtual !== undefined) {
        setCurrentStep(update.etapaAtual);
        
        if (update.descricao && !update.capabilityId) {
          addMemory({
            tipo: 'acao',
            conteudo: update.descricao,
            etapa: update.etapaAtual,
          });
        }
      }

      if (update.status === 'etapa_concluida' && update.etapaAtual !== undefined) {
        addTextMessage('assistant', `Etapa ${update.etapaAtual + 1} concluída com sucesso!`);
        
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
        executionPlan,
        sessionId,
        handleProgress
      );

      setIsExecutingLocal(false);
      setExecuting(false);
      setCurrentStep(null);
      setExecutionPlan(prev => prev ? { ...prev, status: 'concluido' } : null);
      isExecutingPlanRef.current = false;
      globalExecutionLock = false;

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: { type: 'execution:completed' }
      }));

      addTextMessage('assistant', relatorio);

      addMemory({
        tipo: 'resultado',
        conteudo: 'Plano executado com sucesso',
        resultado: relatorio,
      });

    } catch (error) {
      console.error('❌ [ChatLayout] Erro na execução:', error);
      setIsExecutingLocal(false);
      setExecuting(false);
      setExecutionPlan(prev => prev ? { ...prev, status: 'erro' } : null);
      isExecutingPlanRef.current = false;
      globalExecutionLock = false;

      addTextMessage('assistant', 'Ocorreu um erro durante a execução. Por favor, tente novamente.');
    }
  };

  const handleExit = () => {
    clearMessages();
    setSessionId(generateSessionId());
    setExecutionPlan(null);
    setWorkingMemory([]);
    setIsExecutingLocal(false);
    setIsLoading(false);
    setCurrentStep(null);
    setShowContextModal(false);
    setIsCardExpanded(false);
    hasProcessedInitialMessage.current = false;
    isExecutingPlanRef.current = false;
    globalExecutionLock = false;
    
    onBack();
  };

  return (
    <div 
      className="flex flex-col h-full w-full mx-auto bg-transparent overflow-hidden relative"
      style={{ maxWidth: '100%', width: '100%' }}
    >
      <button
        onClick={handleExit}
        className="absolute top-6 right-6 z-[1002] flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-4 py-2 rounded-full transition-all duration-200 group shadow-lg"
      >
        <LogOut className="w-4 h-4 group-hover:rotate-12 transition-transform" />
        <span className="text-xs font-bold uppercase tracking-wider">Sair</span>
      </button>

      <div className="flex-1 overflow-y-auto p-6 space-y-4 pb-64 relative">
        <div className="max-w-[1200px] mx-auto w-full">
          <MessageStream onApplyPlan={handleExecutePlan} />
        </div>
        <div ref={messagesEndRef} />
      </div>

      <ProgressBadge />

      <div className="fixed bottom-12 left-1/2 -translate-x-1/2 z-[1001] pointer-events-auto">
        <div className="flex flex-col items-center" style={{ width: '600px' }}>
          <CardSuperiorSuasCriacoes 
            plan={executionPlan}
            currentStep={currentStep}
            isExpanded={isCardExpanded}
            onToggleExpand={() => setIsCardExpanded(!isCardExpanded)}
            onOpenContext={() => setShowContextModal(true)}
          />
          <ChatInputJota 
            onSend={(msg) => {
              if (msg.trim() && !isLoading && !isExecuting) {
                handleUserPrompt(msg);
              }
            }}
            isLoading={isLoading}
            isDisabled={isExecuting}
            placeholder="Digite sua mensagem ou comando..."
          />
        </div>
      </div>

      <AnimatePresence>
        {showContextModal && (
          <ContextModal
            workingMemory={workingMemory}
            onClose={() => setShowContextModal(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default ChatLayout;
