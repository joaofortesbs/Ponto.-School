"use client";
import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  TopHeader,
  ProfileSelector,
  ChatInput,
  Particles3D,
  SideMenu,
  ParticlesBackground,
} from "./components";
import { QuickAccessCards } from "./components/4-cards-pré-prompts";
import useSchoolPowerFlow from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { ContextualizationCard } from "../../features/schoolpower/contextualization/ContextualizationCard";
import { ActionPlanCard } from "../../features/schoolpower/actionplan/ActionPlanCard";
import { CardDeConstrucao } from "../../features/schoolpower/construction/CardDeConstrucao";
import { HistoricoAtividadesCriadas } from "../../features/schoolpower/construction/HistoricoAtividadesCriadas";
import { useIsMobile } from "../../hooks/useIsMobile";
import DebugPanel from './components/DebugPanel';
import GeminiApiMonitor from './components/GeminiApiMonitor';

interface SchoolPowerPageProps {
  isQuizMode?: boolean;
}

export function SchoolPowerPage({ isQuizMode = false }: SchoolPowerPageProps) {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);
  const [showHistorico, setShowHistorico] = useState(false);
  const [selectedCard, setSelectedCard] = useState<string | null>(null);
  const isMobile = useIsMobile();

  // Hook para gerenciar o fluxo do School Power
  const {
    flowState,
    flowData,
    sendInitialMessage: handleSendInitialMessage,
    submitContextualization: handleSubmitContextualizationHook,
    approveActionPlan: handleApproveActionPlanHook,
    resetFlow: handleResetFlowHook,
    isLoading,
    currentState,
    initialMessage,
    setInitialMessage,
    generatePersonalizedPlan
  } = useSchoolPowerFlow();

  // Log apenas mudanças importantes de estado
  React.useEffect(() => {
    if (flowState !== 'idle') {
      console.log('🔄 School Power - Estado alterado:', flowState);
    }
  }, [flowState]);

  const handleCentralExpandedChange = (expanded: boolean) => {
    setIsCentralExpanded(expanded);
    console.log('🔄 Central expanded alterado:', expanded);
  };

  const [uploadedFiles, setUploadedFiles] = React.useState<any[]>([]);

  // Função para enviar mensagem inicial
  const handleSendMessage = async (message: string, files?: any[]) => {
    console.log('📨 Mensagem recebida:', message);
    console.log('📎 Arquivos recebidos:', files?.length || 0);

    if (message.trim()) {
      // Armazenar arquivos se houver
      if (files && files.length > 0) {
        setUploadedFiles(files);
      }
      
      // Enviar mensagem para o hook
      handleSendInitialMessage(message);
    }
  };

  // Função para submeter contextualização
  const handleSubmitContextualization = (data: any) => {
    console.log("📝 Submetendo contextualização do SchoolPowerPage:", data);
    handleSubmitContextualizationHook(data);
  };

  // Função para aprovar action plan
  const handleApproveActionPlan = (approvedItems: any) => {
    console.log("✅ Aprovando action plan do SchoolPowerPage:", approvedItems);
    handleApproveActionPlanHook(approvedItems);
  };

  // Função para resetar o fluxo
  const handleResetFlow = () => {
    console.log("🔄 Resetando fluxo do SchoolPowerPage");
    handleResetFlowHook();
  };

  // Função para voltar
  const handleBack = () => {
    console.log("🔄 Voltando ao início");
    setShowHistorico(false);
    handleResetFlowHook();
  };

  // Função para abrir histórico
  const handleOpenHistorico = () => {
    console.log("📚 Abrindo histórico de atividades");
    setShowHistorico(true);
  };

  // Função para lidar com clique nos cards
  const handleCardClick = (cardName: string) => {
    setSelectedCard(cardName);
  };

  // Determina se os componentes padrão devem estar visíveis
  const componentsVisible = flowState === 'idle' && !showHistorico;
  console.log('👁️ Componentes padrão visíveis:', componentsVisible);
  console.log('🏗️ Estado atual do fluxo:', flowState);
  console.log('📚 Mostrar histórico:', showHistorico);

  return (
    <div
      className={`relative flex ${isMobile && isQuizMode ? 'h-screen min-h-screen' : 'h-[90vh] min-h-[650px]'} w-full flex-col items-center justify-center overflow-hidden rounded-lg`}
      style={{ backgroundColor: "transparent" }}
    >
      {/* Background de estrelas - SEMPRE visível em todos os estados */}
      <div className="absolute inset-0 z-0">
        <ParticlesBackground isDarkTheme={isDarkTheme} />
      </div>

      {/* Componentes padrões - só aparecem quando flowState é 'idle' */}
      {componentsVisible && (
        <>
          {/* Vertical dock positioned at right side - hidden on mobile quiz mode */}
          {!(isMobile && isQuizMode) && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <SideMenu onHistoricoClick={handleOpenHistorico} />
            </div>
          )}

          {/* Container Ripple fixo e centralizado no background */}
          <div className={`absolute ${isMobile && isQuizMode ? 'top-[45%]' : 'top-[57%]'} left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none`}>
            <div
              className="relative"
              style={{
                width: isMobile && isQuizMode ? "350px" : "900px",
                height: isMobile && isQuizMode ? "450px" : "617px"
              }}
            >
              {/* TechCircle posicionado no topo do container Ripple */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
                style={{ marginTop: isMobile && isQuizMode ? "4px" : "7px" }}
              >
                <TopHeader isDarkTheme={isDarkTheme} isQuizMode={isQuizMode} />
              </div>

              {/* Ripple centralizado */}
              <div className="absolute inset-0">
                <Particles3D isDarkTheme={isDarkTheme} isBlurred={isCentralExpanded} />
              </div>

              {/* Ícone Central no centro do Ripple */}
              <div
                className="absolute z-50 pointer-events-auto"
                style={{
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                <ProfileSelector
                  isQuizMode={isQuizMode}
                />
              </div>

              {/* Caixa de Mensagem dentro do mesmo container Ripple */}
              <div
                className={`absolute ${isMobile && isQuizMode ? 'bottom-16' : 'bottom-24'} left-1/2 transform -translate-x-1/2 translate-y-full z-40 pointer-events-auto`}
                style={{
                  marginTop: isMobile && isQuizMode ? "-80px" : "-150px",
                  width: isMobile && isQuizMode ? "110%" : "auto"
                }}
              >
                <ChatInput
                  isDarkTheme={isDarkTheme}
                  onSend={handleSendMessage}
                  externalSelectedCard={selectedCard}
                  onCardClick={handleCardClick}
                />
              </div>

              {/* 4 Cards Retangulares abaixo da caixa de mensagens */}
              <div
                className="absolute left-1/2 transform -translate-x-1/2 z-40 pointer-events-auto"
                style={{
                  bottom: isMobile && isQuizMode ? '-20px' : '-35px',
                  width: isMobile && isQuizMode ? "110%" : "auto"
                }}
              >
                <QuickAccessCards
                  selectedCard={selectedCard}
                  onCardClick={handleCardClick}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Histórico de Atividades Criadas */}
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

      {/* Card de Construção unificado - aparece baseado no flowState com fundo estrelado visível */}
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

      {/* Debug Panel - apenas em desenvolvimento */}
      <DebugPanel />

      {/* Monitor API Gemini - apenas em desenvolvimento */}
      <GeminiApiMonitor />
    </div>
  );
}