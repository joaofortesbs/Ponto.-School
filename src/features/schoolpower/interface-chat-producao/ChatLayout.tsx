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
import { ActivityViewModal } from '../construction/ActivityViewModal';
import { ContextModal } from './ContextModal';
import { useChatState } from './state/chatState';
import { processUserPrompt, executeAgentPlan } from '../agente-jota/orchestrator';
import type { ExecuteAgentPlanResult } from '../agente-jota/orchestrator';
import { generateSessionId } from '../agente-jota/memory-manager';
import type { ArtifactData } from '../agente-jota/capabilities/CRIAR_ARQUIVO/types';
import { parseStructuredResponse } from './utils/structured-response-parser';
import { useChosenActivitiesStore } from './stores/ChosenActivitiesStore';
import { getActivityContent } from '../services/activity-content-registry';
import { ContentSyncService } from '../services/content-sync-service';
import { writeActivityContent, readActivityContent, hasRealContent } from '../services/activity-storage-contract';
import type { ConstructionActivity } from '../construction/types';
import { isTextVersionActivity } from '../config/activityVersionConfig';
import { retrieveTextVersionContent } from '../activities/text-version/TextVersionGenerator';

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
  const [selectedViewActivity, setSelectedViewActivity] = useState<ConstructionActivity | null>(null);
  const [showActivityViewModal, setShowActivityViewModal] = useState(false);
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

  const handleCloseActivityView = useCallback(() => {
    setShowActivityViewModal(false);
    setTimeout(() => setSelectedViewActivity(null), 300);
  }, []);

  const handleOpenActivity = useCallback(async (activity: any) => {
    console.log('📋 [ChatLayout] Abrindo atividade:', activity.titulo, 'tipo:', activity.tipo, 'id:', activity.id, 'db_id:', activity.db_id);
    
    const activityId = activity.id || activity.db_id || `fallback-${Date.now()}`;
    const activityTipo = activity.tipo || '';
    
    const syncContent = ContentSyncService.getContent(activityId, activityTipo);
    const syncHasReal = ContentSyncService.hasRealContent(activityId, activityTipo);
    console.log(`📡 [ChatLayout] ContentSync: found=${!!syncContent}, hasReal=${syncHasReal}, fields=${syncContent ? Object.keys(syncContent).length : 0}`);

    const contentResult = getActivityContent(activityId, activityTipo, activity.titulo);
    console.log(`📋 [ChatLayout] ContentRegistry: found=${contentResult.found}, source=${contentResult.source}, fields=${Object.keys(contentResult.customFields).length}`);

    const storedContent = activityTipo ? readActivityContent(activityId, activityTipo) : null;
    console.log(`📦 [ChatLayout] StorageContract: found=${!!storedContent}, hasReal=${storedContent ? hasRealContent(storedContent) : false}`);

    const messageContentSnapshot = activity._contentSnapshot || {};
    let mergedContent: Record<string, any> = { 
      ...messageContentSnapshot, 
      ...contentResult.customFields,
      ...(storedContent || {}),
      ...(syncHasReal && syncContent ? syncContent : {}),
    };
    let mergedContentKeys = Object.keys(mergedContent).filter(k => 
      mergedContent[k] !== undefined && mergedContent[k] !== null && mergedContent[k] !== ''
    );

    if (!hasRealContent(mergedContent) && activityTipo) {
      console.log(`🔄 [ChatLayout] Fontes locais vazias para ${activityId} — buscando do banco de dados...`);
      try {
        let dbContent: Record<string, any> | null = null;

        const byOriginalRes = await fetch(`/api/atividades-neon/by-original-id/${encodeURIComponent(activityId)}`);
        if (byOriginalRes.ok) {
          const byOriginalData = await byOriginalRes.json();
          if (byOriginalData.success && byOriginalData.data?.id_json?.campos) {
            dbContent = byOriginalData.data.id_json.campos;
            console.log(`✅ [ChatLayout] DB fetch por original_id: ${Object.keys(dbContent!).length} campos`);
          }
        }

        if (!dbContent || !hasRealContent(dbContent)) {
          const userId = localStorage.getItem('user_id');
          if (userId) {
            const byTypeRes = await fetch(`/api/atividades-neon/by-type-user/${encodeURIComponent(userId)}/${encodeURIComponent(activityTipo)}`);
            if (byTypeRes.ok) {
              const byTypeData = await byTypeRes.json();
              if (byTypeData.success && byTypeData.data?.id_json?.campos) {
                dbContent = byTypeData.data.id_json.campos;
                console.log(`✅ [ChatLayout] DB fetch por tipo+user: ${Object.keys(dbContent!).length} campos`);
              }
            }
          }
        }

        if (dbContent && hasRealContent(dbContent)) {
          mergedContent = { ...mergedContent, ...dbContent };
          mergedContentKeys = Object.keys(mergedContent).filter(k => 
            mergedContent[k] !== undefined && mergedContent[k] !== null && mergedContent[k] !== ''
          );
          console.log(`✅ [ChatLayout] Conteúdo DB integrado: ${mergedContentKeys.length} campos totais`);

          try {
            writeActivityContent(activityId, activityTipo, mergedContent, true);
            ContentSyncService.setContent(activityId, activityTipo, mergedContent);
            console.log(`💾 [ChatLayout] Conteúdo DB persistido no cache local`);
          } catch (cacheErr) {
            console.warn(`⚠️ [ChatLayout] Erro ao cachear conteúdo DB:`, cacheErr);
          }
        } else {
          console.warn(`⚠️ [ChatLayout] Banco de dados também não retornou conteúdo real para ${activityId}`);
        }
      } catch (fetchError) {
        console.error(`❌ [ChatLayout] Erro ao buscar do banco:`, fetchError);
      }
    }

    if (mergedContentKeys.length > 2 && activityTipo) {
      try {
        writeActivityContent(activityId, activityTipo, mergedContent);
        console.log(`🔗 [LAYER3-BRIDGE] ${activityTipo} via StorageContract: ${mergedContentKeys.length} campos`);
      } catch (e) {
        console.warn('⚠️ [LAYER3-BRIDGE] Erro:', e);
      }
    }

    const constructionActivity: ConstructionActivity = {
      id: activityId,
      title: contentResult.titulo || activity.titulo || 'Atividade',
      description: contentResult.originalData?.description || contentResult.originalData?.descricao || '',
      categoryId: activityTipo,
      categoryName: activityTipo?.replace(/[-_]/g, ' ') || '',
      icon: '📋',
      tags: contentResult.originalData?.tags || [],
      difficulty: contentResult.originalData?.nivel_dificuldade || 'medio',
      estimatedTime: '15 min',
      type: activityTipo,
      customFields: mergedContent,
      originalData: {
        type: activityTipo,
        campos: mergedContent,
        ...contentResult.originalData,
      },
      isBuilt: true,
      status: 'completed',
      progress: 100,
    };

    console.log('📋 [ChatLayout] ConstructionActivity montada:', constructionActivity.title, 'type:', constructionActivity.type, 'customFields:', mergedContentKeys.length);

    const isTextByConfig = isTextVersionActivity(activityTipo);
    const isTextBySignal = mergedContent?.versionType === 'text' ||
      mergedContent?.isTextVersion === true ||
      activity?.versionType === 'text' ||
      activity?.isTextVersion === true ||
      activity?.pipeline === 'criar_arquivo_textual';
    
    if (activityTipo === 'atividade-textual' || isTextByConfig || isTextBySignal) {
      console.log('📄 [ChatLayout] Atividade textual detectada, redirecionando para ArtifactViewModal', { activityTipo, isTextByConfig, isTextBySignal });
      
      let textData = retrieveTextVersionContent(activityId, activityTipo);
      if (!textData?.textContent && activityTipo !== 'atividade-textual') {
        textData = retrieveTextVersionContent(activityId, 'atividade-textual');
      }
      if (!textData?.textContent) {
        try {
          const allKeys = Object.keys(localStorage);
          const matchingKey = allKeys.find(k => k.startsWith('text_content_') && k.includes(activityId));
          if (matchingKey) {
            const raw = localStorage.getItem(matchingKey);
            if (raw) textData = JSON.parse(raw);
            console.log(`📄 [ChatLayout] TextContent via busca direta: ${matchingKey}`);
          }
        } catch (e) {
          console.warn('⚠️ [ChatLayout] Erro busca direta text_content:', e);
        }
      }
      const textContent = textData?.textContent || mergedContent?.textContent || messageContentSnapshot?.textContent || '';
      const sections = textData?.sections || mergedContent?.sections || messageContentSnapshot?.sections || [];
      
      const artifactSections = Array.isArray(sections) ? sections.map((sec: any, idx: number) => ({
        id: sec.id || `section-${idx}`,
        titulo: sec.titulo || sec.title || `Seção ${idx + 1}`,
        conteudo: sec.conteudo || sec.content || '',
        icone: sec.icone || sec.icon || '',
        ordem: sec.ordem ?? idx,
      })) : [];
      
      if (artifactSections.length === 0 && textContent) {
        const markdownSections = textContent.split(/^##\s+/m).filter(Boolean);
        markdownSections.forEach((block: string, idx: number) => {
          const lines = block.split('\n');
          const title = lines[0]?.trim() || `Seção ${idx + 1}`;
          const content = lines.slice(1).join('\n').trim();
          artifactSections.push({
            id: `section-${idx}`,
            titulo: title,
            conteudo: content,
            icone: '',
            ordem: idx,
          });
        });
      }
      
      if (artifactSections.length === 0) {
        artifactSections.push({
          id: 'section-0',
          titulo: constructionActivity.title || 'Conteúdo',
          conteudo: textContent || 'Conteúdo não disponível. Tente gerar novamente.',
          icone: '',
          ordem: 0,
        });
      }
      
      const artifact: ArtifactData = {
        id: activityId,
        metadata: {
          tipo: 'atividade_textual',
          titulo: constructionActivity.title || 'Atividade em Texto',
          subtitulo: constructionActivity.description || '',
          geradoEm: Date.now(),
          sessaoId: activityId,
          versao: '2.0',
          tags: constructionActivity.tags || [],
          estatisticas: {
            palavras: textContent.split(/\s+/).length,
            secoes: artifactSections.length,
            tempoGeracao: 0,
          },
        },
        secoes: artifactSections,
        resumoPreview: textContent.substring(0, 200) + '...',
      };
      
      setSelectedArtifact(artifact);
      setShowArtifactModal(true);
      return;
    }

    setSelectedViewActivity(constructionActivity);
    setShowActivityViewModal(true);
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

      {selectedViewActivity && (
        <ActivityViewModal
          activity={selectedViewActivity}
          isOpen={showActivityViewModal}
          onClose={handleCloseActivityView}
        />
      )}
    </div>
  );
}

export default ChatLayout;
