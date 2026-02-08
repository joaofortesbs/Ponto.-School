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
import { ArtifactViewModal } from './components/ArtifactViewModal';
import { ContextModal } from './ContextModal';
import { useChatState } from './state/chatState';
import { processUserPrompt, executeAgentPlan } from '../agente-jota/orchestrator';
import type { ExecuteAgentPlanResult } from '../agente-jota/orchestrator';
import { generateSessionId } from '../agente-jota/memory-manager';
import type { ArtifactData } from '../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { parseStructuredResponse } from './utils/structured-response-parser';

import type { 
  ExecutionPlan, 
  WorkingMemoryItem, 
  ProgressUpdate 
} from './types';

import { ChatInputJota } from './chat-input-jota';
import { CardSuperiorSuasCriacoes } from './card-superior-suas-criacoes-input';
import { ProgressBadge } from './components/ProgressBadge';

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
  const [selectedArtifact, setSelectedArtifact] = useState<ArtifactData | null>(null);
  const [showArtifactModal, setShowArtifactModal] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isExecutingPlanRef = useRef(false);
  const hasProcessedInitialMessageRef = useRef(false);
  const isMountedRef = useRef(true);
  const autoExecTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { 
    messages,
    addTextMessage, 
    addPlanCard, 
    addDevModeCard,
    addArtifactCard,
    addStructuredResponse,
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

  const sessionId = storedSessionId || generateSessionId();
  
  useEffect(() => {
    if (!storedSessionId) {
      setStoredSessionId(sessionId);
      console.log('🆔 [ChatLayout] Nova sessão criada:', sessionId);
    } else {
      console.log('🔄 [ChatLayout] Sessão restaurada:', storedSessionId);
    }
  }, [storedSessionId, sessionId, setStoredSessionId]);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (autoExecTimerRef.current) {
        clearTimeout(autoExecTimerRef.current);
        autoExecTimerRef.current = null;
      }
    };
  }, []);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const pendingArtifactsRef = useRef<ArtifactData[]>([]);

  useEffect(() => {
    const handleArtifactGenerated = (event: Event) => {
      const artifactData = (event as CustomEvent).detail as ArtifactData;
      if (artifactData) {
        console.log('📄 [ChatLayout] Artefato recebido via evento (enfileirado):', artifactData.metadata.titulo);
        pendingArtifactsRef.current.push(artifactData);
      }
    };

    window.addEventListener('artifact:generated', handleArtifactGenerated);
    return () => {
      window.removeEventListener('artifact:generated', handleArtifactGenerated);
    };
  }, []);

  const handleOpenArtifact = useCallback((artifact: ArtifactData) => {
    console.log('📄 [ChatLayout] Abrindo artefato:', artifact.metadata.titulo);
    setSelectedArtifact(artifact);
    setShowArtifactModal(true);
  }, []);

  const handleCloseArtifact = useCallback(() => {
    setShowArtifactModal(false);
    setTimeout(() => setSelectedArtifact(null), 300);
  }, []);

  const handleOpenActivity = useCallback((activity: any) => {
    console.log('📋 [ChatLayout] Abrindo atividade:', activity.titulo, 'db_id:', activity.db_id);
    if (activity.db_id) {
      window.dispatchEvent(new CustomEvent('open-activity-modal', {
        detail: { activityId: activity.db_id, activityTitle: activity.titulo }
      }));
    }
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

      if (plan) {
        setExecutionPlan(plan);
        
        addMemory({
          tipo: 'objetivo',
          conteudo: plan.objetivo,
        });

        console.log('🧠 [ChatLayout] Mente Orquestradora: Iniciando execução automática do plano');
        setIsLoading(false);
        
        autoExecTimerRef.current = setTimeout(() => {
          autoExecTimerRef.current = null;
          if (!isMountedRef.current) {
            console.warn('⚠️ [ChatLayout] Componente desmontado — execução automática cancelada');
            return;
          }
          handleExecutePlanAuto(plan);
        }, 100);
        return;
      }
      
      setIsLoading(false);
    } catch (error) {
      console.error('❌ [ChatLayout] Erro ao processar prompt:', error);
      setLoading(false);
      addTextMessage('assistant', 'Desculpe, ocorreu um erro ao processar sua solicitação. Por favor, tente novamente.');
      setIsLoading(false);
    }
  };

  /**
   * Execução automática do plano — chamada pela Mente Orquestradora
   * Recebe o plano diretamente para não depender do state assíncrono
   */
  const handleExecutePlanAuto = async (plan: ExecutionPlan) => {
    if (!plan) return;

    if (!acquireExecutionLock(sessionId)) {
      console.warn('⚠️ [ChatLayout] Execução automática bloqueada pelo sessionStorage!');
      setExecutionPlan(null);
      return;
    }

    const canStart = startExecution();
    if (!canStart) {
      console.warn('⚠️ [ChatLayout] Execução automática bloqueada pelo Zustand!');
      releaseExecutionLock();
      setExecutionPlan(null);
      return;
    }

    console.log('🧠 [ChatLayout] Mente Orquestradora: Execução automática iniciada');
    await executeAgentPlanInternal(plan);
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

    console.log('▶️ [ChatLayout] Iniciando execução do plano (manual)');
    await executeAgentPlanInternal(executionPlan);
  };

  const executeAgentPlanInternal = async (planToExecute: ExecutionPlan) => {
    isExecutingPlanRef.current = true;

    setIsExecutingLocal(true);
    setExecuting(true);
    
    const updatedPlan = {
      ...planToExecute,
      status: 'em_execucao' as const
    };
    setExecutionPlan(updatedPlan);

    addDevModeCard({
      plano: planToExecute,
      status: 'executando',
      etapaAtual: 0,
      etapas: planToExecute.etapas.map((e, idx) => ({
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
    }) => {
      console.log('📊 [ChatLayout] Progresso:', JSON.stringify({
        status: update.status,
        etapaAtual: update.etapaAtual,
        capabilityId: update.capabilityId,
        capabilityStatus: update.capabilityStatus,
      }));

      const rawType = (update as any).type;
      if (!update.status && rawType) {
        console.log(`🔀 [ChatLayout] Pass-through event: ${rawType}`);
        const normalizedDetail: any = { ...update, type: rawType };
        if (normalizedDetail.capabilityId && !normalizedDetail.capability_id) {
          normalizedDetail.capability_id = normalizedDetail.capabilityId;
        }
        if (normalizedDetail.activityId && !normalizedDetail.activity_id) {
          normalizedDetail.activity_id = normalizedDetail.activityId;
        }
        window.dispatchEvent(new CustomEvent('agente-jota-progress', { detail: normalizedDetail }));
        return;
      }

      const stepIndex = update.etapaAtual !== undefined ? update.etapaAtual - 1 : 0;

      let eventType: string = update.status;
      
      if (update.status === 'etapa_concluida') {
        eventType = 'execution:step:completed';
      } else if (update.status === 'narrative' as any) {
        eventType = 'execution:narrative';
      } else if (update.status === 'replan' as any) {
        eventType = 'execution:replan';
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

      const capabilityName = (update as any).capabilityName;
      
      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: {
          type: eventType,
          stepIndex: stepIndex,
          stepTitle: update.descricao,
          capability_id: update.capabilityId,
          capability_name: capabilityName || update.descricao,
          displayName: capabilityName ? update.descricao : undefined,
          mensagem: update.resultado ? `Concluído: ${update.descricao}` : undefined,
          narrativeText: eventType === 'execution:narrative' ? update.descricao : undefined,
          replanReason: eventType === 'execution:replan' ? update.descricao : undefined,
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
      const conversationHistory = messages
        .filter(m => m.type === 'user' || m.type === 'assistant')
        .map(m => `${m.role === 'user' ? 'Usuário' : 'Assistente'}: ${m.content}`)
        .join('\n\n');
      
      console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 🧠 MENTE ORQUESTRADORA - executeAgentPlanInternal()
║════════════════════════════════════════════════════════════════════════║
║ sessionId: ${sessionId}
║ planId: ${planToExecute.planId}
║ etapas: ${planToExecute.etapas.length}
║ capabilities: ${planToExecute.etapas.flatMap(e => e.capabilities?.map(c => c.nome) || []).join(', ')}
║════════════════════════════════════════════════════════════════════════║
      `);
      
      const result = await executeAgentPlan(
        planToExecute,
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
      
      console.log('🔄 [ChatLayout] Execução finalizada — próximos prompts passam por IntentClassifier no orchestrator');

      window.dispatchEvent(new CustomEvent('agente-jota-progress', {
        detail: { type: 'execution:completed' }
      }));

      const collectedActivities = result.collectedItems?.activities || [];
      const collectedArtifacts = result.collectedItems?.artifacts || [];
      
      console.error(`
╔════════════════════════════════════════════════════════════════════════╗
║ 📊 [ChatLayout] STRUCTURED RESPONSE — DADOS COLETADOS
║════════════════════════════════════════════════════════════════════════║
║ Atividades coletadas: ${collectedActivities.length}
║ Artifacts coletados: ${collectedArtifacts.length}
║ Pending artifacts: ${pendingArtifactsRef.current.length}
║ Resposta length: ${result.resposta?.length || 0}
║ Tem marcadores [[: ${result.resposta?.includes('[[') || false}
╚════════════════════════════════════════════════════════════════════════╝`);

      if (collectedActivities.length > 0) {
        collectedActivities.forEach((a: any, i: number) => {
          console.error(`   Atividade ${i + 1}: "${a.titulo}" (${a.tipo}) id=${a.id}`);
        });
      }

      const allArtifacts = [
        ...collectedArtifacts,
        ...pendingArtifactsRef.current,
      ];
      pendingArtifactsRef.current = [];

      const seenArtifactIds = new Set<string>();
      const uniqueArtifacts = allArtifacts.filter(a => {
        if (!a?.id) return true;
        if (seenArtifactIds.has(a.id)) return false;
        seenArtifactIds.add(a.id);
        return true;
      });

      const blocks = parseStructuredResponse(result.resposta, {
        activities: collectedActivities,
        artifacts: uniqueArtifacts,
      });

      console.error(`📦 [ChatLayout] Parsed blocks: ${blocks.length} — types: ${blocks.map(b => b.type).join(', ')}`);

      addStructuredResponse({ blocks, rawText: result.resposta });

      addMemory({
        tipo: 'resultado',
        conteudo: 'Plano executado com sucesso',
        resultado: result.resposta,
      });

    } catch (error) {
      console.error('❌ [ChatLayout] Erro na execução:', error);
      setIsExecutingLocal(false);
      setExecuting(false);
      setExecutionPlan(prev => prev ? { ...prev, status: 'erro' } : null);
      isExecutingPlanRef.current = false;
      releaseExecutionLock();
      pendingArtifactsRef.current = [];

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
          <MessageStream onApplyPlan={handleExecutePlan} onOpenArtifact={handleOpenArtifact} onOpenActivity={handleOpenActivity} />
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

      {selectedArtifact && (
        <ArtifactViewModal
          artifact={selectedArtifact}
          isOpen={showArtifactModal}
          onClose={handleCloseArtifact}
        />
      )}
    </div>
  );
}

export default ChatLayout;
