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
import { useDossieStore, generateDossieContent, DossieViewModal } from './dossie-system';

const EXECUTION_LOCK_KEY = 'agente-jota-execution-lock';

function acquireExecutionLock(sessionId: string): boolean {
  const lockData = sessionStorage.getItem(EXECUTION_LOCK_KEY);
  if (lockData) {
    const { session, timestamp } = JSON.parse(lockData);
    const age = Date.now() - timestamp;
    if (session === sessionId && age < 60000) {
      console.warn('⚠️ [ExecutionLock] Lock já existe para esta sessão! Bloqueando.');
      return false;
    }
  }
  sessionStorage.setItem(EXECUTION_LOCK_KEY, JSON.stringify({ session: sessionId, timestamp: Date.now() }));
  console.log('✅ [ExecutionLock] Lock adquirido com sucesso.');
  return true;
}

function releaseExecutionLock(): void {
  sessionStorage.removeItem(EXECUTION_LOCK_KEY);
  console.log('🔓 [ExecutionLock] Lock liberado.');
}

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
  const [executionPlan, setExecutionPlan] = useState<ExecutionPlan | null>(null);
  const [workingMemory, setWorkingMemory] = useState<WorkingMemoryItem[]>([]);
  const [isExecuting, setIsExecutingLocal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState<number | null>(null);
  
  const [showContextModal, setShowContextModal] = useState(false);
  const [isCardExpanded, setIsCardExpanded] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isExecutingPlanRef = useRef(false);
  const hasProcessedInitialMessageRef = useRef(false);

  const { 
    messages,
    addTextMessage, 
    addPlanCard, 
    addDevModeCard,
    addDossieCard,
    setExecuting,
    setLoading,
    clearMessages,
    activeDevModeCardId,
    startExecution,
    sessionId: storedSessionId,
    setSessionId: setStoredSessionId,
    initialMessageProcessed,
    setInitialMessageProcessed,
    lastProcessedInitialMessage,
    setLastProcessedInitialMessage,
    hasActiveSession,
    _hasHydrated
  } = useChatState();

  const dossieStore = useDossieStore();

  const sessionId = storedSessionId || generateSessionId();
  
  useEffect(() => {
    if (!storedSessionId) {
      setStoredSessionId(sessionId);
      dossieStore.initSession(sessionId);
      console.log('🆔 [ChatLayout] Nova sessão criada:', sessionId);
    } else {
      console.log('🔄 [ChatLayout] Sessão restaurada:', storedSessionId);
    }
  }, [storedSessionId, sessionId, setStoredSessionId]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    const handleActivityBuilt = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        const id = detail.id || detail.activityId;
        const titulo = detail.titulo || detail.title || detail.nome || '';
        const tipo = detail.tipo || detail.type || '';
        if (id && titulo) {
          dossieStore.addActivity({
            id,
            titulo,
            tipo,
            tema: detail.tema,
            materia: detail.materia,
            status: 'criada',
          });
        }
      }
    };

    const handleActivitySaved = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      const id = detail?.id || detail?.activityId;
      if (id) {
        dossieStore.updateActivityStatus(id, 'salva_bd');
      }
    };

    window.addEventListener('construction:activity_built', handleActivityBuilt);
    window.addEventListener('construction:activity_completed', handleActivityBuilt);
    window.addEventListener('activityBuilt', handleActivityBuilt);
    window.addEventListener('activity-auto-saved', handleActivitySaved);

    return () => {
      window.removeEventListener('construction:activity_built', handleActivityBuilt);
      window.removeEventListener('construction:activity_completed', handleActivityBuilt);
      window.removeEventListener('activityBuilt', handleActivityBuilt);
      window.removeEventListener('activity-auto-saved', handleActivitySaved);
    };
  }, []);

  useEffect(() => {
    if (!_hasHydrated) {
      console.log('⏳ [ChatLayout] Aguardando hidratação do sessionStorage...');
      return;
    }
    
    if (hasProcessedInitialMessageRef.current) {
      console.log('🛡️ [ChatLayout] Ref bloqueou reprocessamento (StrictMode protection)');
      return;
    }
    
    if (lastProcessedInitialMessage === initialMessage) {
      console.log('🔒 [ChatLayout] Mesma mensagem já processada anteriormente - NÃO reenviando');
      hasProcessedInitialMessageRef.current = true;
      return;
    }
    
    const messageAlreadyExists = messages.some(
      msg => msg.type === 'user' && msg.content === initialMessage
    );
    
    if (messageAlreadyExists) {
      console.log('🔒 [ChatLayout] Mensagem já existe no histórico - NÃO reenviando');
      hasProcessedInitialMessageRef.current = true;
      setLastProcessedInitialMessage(initialMessage);
      return;
    }
    
    if (initialMessage && !initialMessageProcessed) {
      console.log('📨 [ChatLayout] Processando mensagem inicial (primeira vez):', initialMessage);
      hasProcessedInitialMessageRef.current = true;
      setLastProcessedInitialMessage(initialMessage);
      handleUserPrompt(initialMessage);
    } else if (initialMessageProcessed) {
      console.log('🔄 [ChatLayout] Sessão restaurada - NÃO reenviando mensagem inicial');
      hasProcessedInitialMessageRef.current = true;
    }
  }, [initialMessage, initialMessageProcessed, lastProcessedInitialMessage, setLastProcessedInitialMessage, _hasHydrated, messages]);

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
    dossieStore.addUserMessage(userInput);
    setIsLoading(true);
    setLoading(true);

    try {
      const { plan, initialMessage: aiMessage } = await processUserPrompt(
        userInput,
        sessionId,
        userId,
        workingMemory
      );

      setLoading(false);
      addTextMessage('assistant', aiMessage);
      dossieStore.addAiResponse(aiMessage);

      if (plan) {
        setExecutionPlan(plan);
        
        dossieStore.setPlanInfo(
          plan.objetivo,
          plan.etapas.map((e: any) => e.titulo || e.descricao)
        );
        
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
      setLoading(false);
      addTextMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  const handleExecutePlan = async () => {
    if (!executionPlan) return;

    if (!acquireExecutionLock(sessionId)) {
      console.warn('⚠️ [ChatLayout] Execução bloqueada pelo sessionStorage! Ignorando.');
      return;
    }

    const canStart = startExecution();
    if (!canStart) {
      console.warn('⚠️ [ChatLayout] Execução bloqueada pelo Zustand startExecution! Ignorando.');
      releaseExecutionLock();
      return;
    }

    console.log('▶️ [ChatLayout] Iniciando execução do plano (aprovado)');

    isExecutingPlanRef.current = true;

    setIsExecutingLocal(true);
    setExecuting(true);
    
    const updatedPlan = {
      ...executionPlan,
      status: 'em_execucao' as const
    };
    setExecutionPlan(updatedPlan);

    addDevModeCard({
      plano: executionPlan,
      status: 'executando',
      etapaAtual: 0,
      etapas: executionPlan.etapas.map((e, idx) => ({
        ordem: idx,
        titulo: e.titulo || e.descricao,
        descricao: e.descricao,
        status: idx === 0 ? 'executando' : 'pendente',
        capabilities: (e.capabilities || []).map((cap, capIdx) => ({
          id: cap.id || `cap-${idx}-${capIdx}-${Date.now()}`,
          nome: cap.nome,
          displayName: cap.displayName || cap.nome,
          status: idx === 0 && capIdx === 0 ? 'executando' : 'pendente'
        }))
      }))
    });

    const handleProgress = (update: ProgressUpdate & { 
      capabilityId?: string; 
      capabilityStatus?: string;
      capabilityResult?: any;
      capabilityDuration?: number;
      reflectionLoading?: boolean;
      reflection?: any;
    }) => {
      console.log('📊 [ChatLayout] Progresso:', JSON.stringify({
        status: update.status,
        etapaAtual: update.etapaAtual,
        capabilityId: update.capabilityId,
        capabilityStatus: update.capabilityStatus,
        reflectionLoading: update.reflectionLoading,
        hasReflection: !!update.reflection,
      }));

      if (update.capabilityId && update.capabilityStatus === 'completed') {
        dossieStore.addEvent({
          type: 'capability_executed',
          data: { capabilityId: update.capabilityId, result: update.capabilityResult },
          description: update.descricao || update.capabilityId,
        });

        if (update.capabilityResult?.atividades) {
          const atividades = update.capabilityResult.atividades;
          if (Array.isArray(atividades)) {
            atividades.forEach((a: any) => {
              if (a.id && a.titulo && a.tipo) {
                dossieStore.addActivity({
                  id: a.id,
                  titulo: a.titulo,
                  tipo: a.tipo,
                  tema: a.tema,
                  materia: a.materia,
                  status: a.status || 'criada',
                });
              }
            });
          }
        }
      }

      const stepIndex = update.etapaAtual !== undefined ? update.etapaAtual - 1 : 0;

      if (update.reflectionLoading === true) {
        console.log(`💭 [ChatLayout] Emitindo evento: reflection:loading | stepIndex: ${stepIndex}`);
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'reflection:loading',
            stepIndex: stepIndex,
          }
        }));
        return;
      }

      if (update.reflection) {
        console.log(`💡 [ChatLayout] Emitindo evento: reflection:ready | stepIndex: ${stepIndex}`);
        window.dispatchEvent(new CustomEvent('agente-jota-progress', {
          detail: {
            type: 'reflection:ready',
            stepIndex: stepIndex,
            reflection: update.reflection,
          }
        }));
        return;
      }

      let eventType: string = update.status;
      
      if (update.status === 'etapa_concluida') {
        eventType = 'execution:step:completed';
      } else if (update.status === 'executando') {
        if (update.capabilityId && update.capabilityStatus === 'executing') {
          eventType = 'capability:iniciou';
        } else if (update.capabilityId && update.capabilityStatus === 'completed') {
          eventType = 'capability:concluiu';
        } else if (update.capabilityId && update.capabilityStatus === 'failed') {
          eventType = 'capability:erro';
        } else if (!update.capabilityId) {
          eventType = 'execution:step:started';
        }
      } else if (update.status === 'concluido') {
        eventType = 'execution:completed';
      }

      console.log(`🎯 [ChatLayout] Emitindo evento: ${eventType} | stepIndex: ${stepIndex} | capabilityId: ${update.capabilityId}`);

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: eventType,
          stepIndex: stepIndex,
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
      // Formatar histórico da conversa para passar ao executor
      const conversationHistory = messages
        .filter(m => m.type === 'user' || m.type === 'assistant')
        .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
        .join('\n\n');
      
      console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🚀 CHAT LAYOUT - handleExecutePlan() CALLING executeAgentPlan
║════════════════════════════════════════════════════════════════════════║
║ sessionId: ${sessionId}
║ executionPlan.planId: ${executionPlan.planId}
║ executionPlan.etapas: ${executionPlan.etapas.length}
║ conversationHistory length: ${conversationHistory.length}
║ handleProgress callback: ${typeof handleProgress === 'function' ? 'YES' : 'NO'}
║════════════════════════════════════════════════════════════════════════║
      `);
      
      const relatorio = await executeAgentPlan(
        executionPlan,
        sessionId,
        handleProgress,
        conversationHistory
      );
      
      console.error('✅ [ChatLayout] executeAgentPlan() retornou com sucesso');

      setIsExecutingLocal(false);
      setExecuting(false);
      setCurrentStep(null);
      setExecutionPlan(null);
      isExecutingPlanRef.current = false;
      releaseExecutionLock();
      
      console.log('🔄 [ChatLayout] Execução finalizada - estado limpo para permitir nova interação');

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: { type: 'execution:completed' }
      }));

      addTextMessage('assistant', relatorio);

      addMemory({
        tipo: 'resultado',
        conteudo: 'Plano executado com sucesso',
        resultado: relatorio,
      });

      try {
        console.log('📋 [ChatLayout] Gerando Dossiê da sessão...');
        dossieStore.addEvent({ type: 'step_completed', data: { relatorio }, description: 'Execução concluída' });
        dossieStore.setGenerating(true);
        
        const summary = dossieStore.getSessionSummary();
        const dossieData = await generateDossieContent(summary);
        
        if (dossieData) {
          dossieStore.setDossie(dossieData);
          dossieStore.setGenerating(false);
          addDossieCard(dossieData);
          console.log('✅ [ChatLayout] Dossiê gerado com sucesso');
        } else {
          dossieStore.setGenerating(false);
        }
      } catch (dossieError) {
        console.warn('⚠️ [ChatLayout] Falha ao gerar dossiê (não-crítico):', dossieError);
        dossieStore.setGenerating(false);
      }

    } catch (error) {
      console.error('❌ [ChatLayout] Erro na execução:', error);
      setIsExecutingLocal(false);
      setExecuting(false);
      setExecutionPlan(prev => prev ? { ...prev, status: 'erro' } : null);
      isExecutingPlanRef.current = false;
      releaseExecutionLock();

      addTextMessage('assistant', 'Ocorreu um erro durante a execução. Por favor, tente novamente.');
    }
  };

  const handleExit = () => {
    clearMessages();
    releaseExecutionLock();
    setExecutionPlan(null);
    setWorkingMemory([]);
    setIsExecutingLocal(false);
    setIsLoading(false);
    setCurrentStep(null);
    setShowContextModal(false);
    setIsCardExpanded(false);
    isExecutingPlanRef.current = false;
    
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

      <DossieViewModal />
    </div>
  );
}

export default ChatLayout;
