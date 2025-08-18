"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import {
  TopHeader,
  ProfileSelector,
  ChatInput,
  Particles3D,
  SideMenu,
  ParticlesBackground,
} from "./components";
import useSchoolPowerFlow from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { ContextualizationCard } from "../../features/schoolpower/contextualization/ContextualizationCard";
import { ActionPlanCard } from "../../features/schoolpower/actionplan/ActionPlanCard";
import { CardDeConstrucao } from "../../features/schoolpower/construction/CardDeConstrucao";
import { useIsMobile } from "../../hooks/useIsMobile";

interface SchoolPowerPageProps {
  isQuizMode?: boolean;
}

export const SchoolPowerPage: React.FC<SchoolPowerPageProps> = ({
  isQuizMode = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMobile = useIsMobile();
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);

  // Hook para gerenciar o fluxo do School Power
  const {
    flowState,
    flowData,
    sendInitialMessage: handleSendInitialMessage,
    submitContextualization: handleSubmitContextualizationHook,
    approveActionPlan: handleApproveActionPlanHook,
    resetFlow: handleResetFlowHook,
    isLoading,
    currentMessage,
    actionPlan,
    constructionActivities
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

  // Função para enviar mensagem inicial
  const handleSendMessage = (message: string) => {
    console.log("📤 Enviando mensagem inicial do SchoolPowerPage:", message);
    handleSendInitialMessage(message);
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
    handleResetFlowHook();
  };

  // Determina se os componentes padrão devem estar visíveis
  const componentsVisible = flowState === 'idle';
  console.log('👁️ Componentes padrão visíveis:', componentsVisible);
  console.log('🏗️ Estado atual do fluxo:', flowState);

  return (
    <div
      ref={containerRef}
      className="relative min-h-screen bg-gradient-to-br from-slate-900 to-slate-800 overflow-hidden"
    >
      {/* Fundo estrelado sempre visível */}
      <ParticlesBackground />

      {/* Header fixo */}
      <AnimatePresence>
        {componentsVisible && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40"
          >
            <TopHeader isMobile={isMobile} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Componentes padrões - só aparecem quando flowState é 'idle' */}
      {componentsVisible && (
        <>
          {/* Vertical dock positioned at right side */}
          <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
            <SideMenu />
          </div>

          {/* Container Ripple fixo e centralizado no background */}
          <div className="absolute top-[57%] left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none">
            <div className="relative" style={{ width: "900px", height: "617px" }}>
              {/* TechCircle posicionado no topo do container Ripple */}
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-full z-30 pointer-events-none"
                style={{ marginTop: "7px" }}
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
              <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 translate-y-full z-40 pointer-events-auto" style={{ marginTop: "-150px" }}>
                <ChatInput
                  isDarkTheme={isDarkTheme}
                  onSend={handleSendMessage}
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Input de chat fixo na parte inferior */}
      <AnimatePresence>
        {componentsVisible && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            transition={{ duration: 0.3 }}
            className="fixed bottom-0 left-0 right-0 z-40"
          >
            <ChatInput
              onSendMessage={handleSendMessage}
              isLoading={flowState === 'contextualizing'}
              isMobile={isMobile}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Card de Construção unificado - aparece baseado no flowState e nunca some */}
      {(flowState === 'contextualizing' || flowState === 'actionplan' || flowState === 'generating' || flowState === 'generatingActivities' || flowState === 'activities') && (
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-50"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{
            background: 'rgba(15, 23, 42, 0.95)'
          }}
        >
          <div className={`flex items-center justify-center w-full h-full ${isMobile ? 'p-2' : 'p-4'}`}>
            <CardDeConstrucao
              flowState={flowState}
              currentMessage={currentMessage}
              actionPlan={actionPlan}
              constructionActivities={constructionActivities}
              isMobile={isMobile}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}