"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TopHeader,
  JotaAvatar,
  ChatInput,
  Particles3D,
  SideMenu,
  ParticlesBackground,
} from "./components";
import { QuickAccessCards } from "./components/4-cards-pré-prompts";
import { PresetBlocksGrid, parsePromptToNodes } from "./components/preset-blocks";
import type { PromptNode } from "./components/preset-blocks";
import useSchoolPowerFlow from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { CardDeConstrucao } from "../../features/schoolpower/construction/CardDeConstrucao";
import { HistoricoAtividadesCriadas } from "../../features/schoolpower/construction/HistoricoAtividadesCriadas";
import { ChatLayout } from "../../features/schoolpower/interface-chat-producao/ChatLayout";
import { useIsMobile } from "../../hooks/useIsMobile";
import { 
  getPendingMessage, 
  clearPendingMessage, 
  clearRedirectToSchoolPower 
} from "../../lib/message-sync";

// PERFORMANCE: DebugPanel and GeminiApiMonitor only loaded in development mode
const DebugPanel = import.meta.env.DEV 
  ? React.lazy(() => import('./components/DebugPanel'))
  : (() => null) as React.FC;
const GeminiApiMonitor = import.meta.env.DEV 
  ? React.lazy(() => import('./components/GeminiApiMonitor'))
  : (() => null) as React.FC;

const PRESET_GRID_POSITION = {
  desktop: {
    bottomOffset: -105,
  },
  mobile: {
    bottomOffset: -110,
  },
} as const;

interface SchoolPowerPageProps {
  isQuizMode?: boolean;
}

export function SchoolPowerPage({ isQuizMode = false }: SchoolPowerPageProps) {
  const [isDarkTheme] = useState(true);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const [presetMessage, setPresetMessage] = useState<string | null>(null);
  const [templateNodes, setTemplateNodes] = useState<PromptNode[] | null>(null);
  const isMobile = useIsMobile();
  const pendingMessageProcessed = useRef(false);

  const {
    flowState,
    flowData,
    sendInitialMessage: handleSendInitialMessage,
    submitContextualization: handleSubmitContextualizationHook,
    approveActionPlan: handleApproveActionPlanHook,
    resetFlow: handleResetFlowHook,
    isLoading,
  } = useSchoolPowerFlow();

  useEffect(() => {
    if (pendingMessageProcessed.current) return;
    
    const pendingMessage = getPendingMessage();
    
    if (pendingMessage && pendingMessage.message) {
      console.log('📨 Processando mensagem pendente da página de vendas:', pendingMessage.message);
      
      pendingMessageProcessed.current = true;
      
      clearPendingMessage();
      clearRedirectToSchoolPower();
      
      setTimeout(() => {
        handleSendInitialMessage(pendingMessage.message);
        console.log('✅ Mensagem pendente enviada automaticamente!');
      }, 500);
    }
  }, [handleSendInitialMessage]);

  useEffect(() => {
    if (flowState !== 'idle') {
      console.log('🔄 School Power - Estado alterado:', flowState);
    }
  }, [flowState]);

  const handleSendMessage = async (message: string, files?: any[]) => {
    console.log('📨 Mensagem recebida:', message);
    console.log('📎 Arquivos recebidos:', files?.length || 0);

    if (message.trim()) {
      handleSendInitialMessage(message);
    }
  };

  const handleSubmitContextualization = (data: any) => {
    console.log("📝 Submetendo contextualização do SchoolPowerPage:", data);
    handleSubmitContextualizationHook(data);
  };

  const handleApproveActionPlan = (approvedItems: any) => {
    console.log("✅ Aprovando action plan do SchoolPowerPage:", approvedItems);
    handleApproveActionPlanHook(approvedItems);
  };

  const handleResetFlow = () => {
    console.log("🔄 Resetando fluxo do SchoolPowerPage");
    handleResetFlowHook();
  };

  const handleBack = () => {
    console.log("🔄 Voltando ao início");
    setShowHistorico(false);
    handleResetFlowHook();
  };

  const handleOpenHistorico = () => {
    console.log("📚 Abrindo histórico de atividades");
    setShowHistorico(true);
  };

  const handleCardClick = (cardName: string) => {
    setSelectedCard(cardName);
  };

  const componentsVisible = flowState === 'idle' && !showHistorico;

  return (
    <div
      className={`relative flex ${isMobile && isQuizMode ? 'h-screen min-h-screen' : 'h-[90vh] min-h-[650px]'} w-full flex-col items-center justify-center overflow-hidden rounded-lg`}
      style={{ 
        backgroundColor: "transparent",
        scrollbarWidth: 'none',
        msOverflowStyle: 'none'
      }}
    >
      <style>{`
        div:has(> *)::-webkit-scrollbar {
          display: none;
        }
        html, body {
          overflow-x: hidden;
          overflow-y: hidden;
          scrollbar-width: none;
        }
        html::-webkit-scrollbar,
        body::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      <div className="absolute inset-0 z-0">
        <ParticlesBackground isDarkTheme={isDarkTheme} />
      </div>

      {componentsVisible && (
        <>
          {!(isMobile && isQuizMode) && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <SideMenu onHistoricoClick={handleOpenHistorico} />
            </div>
          )}

          <div className={`absolute ${isMobile && isQuizMode ? 'top-[42%]' : 'top-[48%]'} left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none`}>
            <div
              className="relative"
              style={{
                width: isMobile && isQuizMode ? "350px" : "900px",
                height: isMobile && isQuizMode ? "450px" : "617px"
              }}
            >
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
                style={{ marginTop: isMobile && isQuizMode ? "2px" : "3px" }}
              >
                <TopHeader isDarkTheme={isDarkTheme} isQuizMode={isQuizMode} />
              </div>

              <div className="absolute inset-0">
                <Particles3D isDarkTheme={isDarkTheme} isBlurred={false} />
              </div>

              <div
                className="absolute z-50 pointer-events-auto"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <JotaAvatar />
              </div>

              <div
                className={`absolute left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto`}
                style={{
                  bottom: isMobile && isQuizMode ? "95px" : "90px",
                  width: isMobile && isQuizMode ? "110%" : "auto"
                }}
              >
                <ChatInput
                  isDarkTheme={isDarkTheme}
                  onSend={handleSendMessage}
                  externalSelectedCard={selectedCard}
                  onCardClick={handleCardClick}
                  externalMessage={presetMessage}
                  onExternalMessageConsumed={() => setPresetMessage(null)}
                  templateNodes={templateNodes}
                  onTemplateNodesChange={setTemplateNodes}
                />
              </div>

              <div
                className="absolute left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto"
                style={{
                  bottom: isMobile && isQuizMode ? '10px' : '25px',
                  width: isMobile && isQuizMode ? "110%" : "auto"
                }}
              >
                <QuickAccessCards
                  selectedCard={selectedCard}
                  onCardClick={handleCardClick}
                />
              </div>

              <div
                className="absolute left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto"
                style={{
                  bottom: `${isMobile && isQuizMode ? PRESET_GRID_POSITION.mobile.bottomOffset : PRESET_GRID_POSITION.desktop.bottomOffset}px`,
                  width: isMobile && isQuizMode ? "110%" : "737px"
                }}
              >
                <PresetBlocksGrid
                  onBlockClick={(prompt) => {
                    const nodes = parsePromptToNodes(prompt);
                    const hasSlots = nodes.some(n => n.type === 'slot');
                    if (hasSlots) {
                      setTemplateNodes(nodes);
                      setPresetMessage(null);
                    } else {
                      setPresetMessage(prompt);
                      setTemplateNodes(null);
                    }
                  }}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {showHistorico && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className="w-full h-full">
            <HistoricoAtividadesCriadas onBack={handleBack} />
          </div>
        </motion.div>
      )}

      {flowState === 'chat' && flowData.initialMessage && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ChatLayout
            initialMessage={flowData.initialMessage}
            onBack={handleBack}
          />
        </motion.div>
      )}

      {(flowState === 'contextualizing' || flowState === 'actionplan' || flowState === 'generating' || flowState === 'generatingActivities' || flowState === 'activities') && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-10"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <div className={`flex items-center justify-center w-full h-full ${isMobile ? 'p-2' : 'p-4'}`}>
            <div className={`w-full ${isMobile ? 'max-w-sm' : 'max-w-7xl'} mx-auto`}>
              <CardDeConstrucao
                flowData={{
                  ...flowData,
                  actionPlan: (flowData?.actionPlan && Array.isArray(flowData.actionPlan)) ? flowData.actionPlan : [],
                  contextualizationData: flowData?.contextualizationData || null,
                  manualActivities: flowData?.manualActivities || []
                }}
                onBack={handleBack}
                step={flowState === 'contextualizing' ? 'contextualization' :
                      flowState === 'actionplan' ? 'actionPlan' :
                      flowState === 'generating' ? 'generating' :
                      flowState === 'generatingActivities' ? 'generatingActivities' : 'activities'}
                contextualizationData={flowData?.contextualizationData || null}
                actionPlan={(flowData?.actionPlan && Array.isArray(flowData.actionPlan)) ? flowData.actionPlan : []}
                onSubmitContextualization={handleSubmitContextualization}
                onApproveActionPlan={handleApproveActionPlan}
                onResetFlow={handleResetFlow}
                isLoading={isLoading}
              />
            </div>
          </div>
        </motion.div>
      )}

      {import.meta.env.DEV && (
        <React.Suspense fallback={null}>
          <DebugPanel />
          <GeminiApiMonitor />
        </React.Suspense>
      )}
    </div>
  );
}
