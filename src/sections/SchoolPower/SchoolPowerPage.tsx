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
  DebugPanel,
} from "./components";
import { useSchoolPowerFlow } from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { ContextualizationCard } from "../../features/schoolpower/contextualization/ContextualizationCard";
import { ActionPlanCard } from "../../features/schoolpower/actionplan/ActionPlanCard";
import { CardDeConstrucao } from "../../features/schoolpower/construction/CardDeConstrucao";

export function SchoolPowerPage() {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);

  // Hook para gerenciar o fluxo do School Power
  const {
    flowState,
    flowData,
    sendInitialMessage,
    submitContextualization,
    approveActionPlan,
    resetFlow,
    isLoading
  } = useSchoolPowerFlow();

  console.log('🏠 SchoolPowerPage renderizada com estado:', { flowState, flowData, isLoading });

  const handleCentralExpandedChange = (expanded: boolean) => {
    setIsCentralExpanded(expanded);
    console.log('🔄 Central expanded alterado:', expanded);
  };

  // Função para enviar mensagem inicial
  const handleSendMessage = (message: string) => {
    console.log("📤 Enviando mensagem inicial do SchoolPowerPage:", message);
    sendInitialMessage(message);
  };

  // Função para submeter contextualização
  const handleSubmitContextualization = (data: any) => {
    console.log("📝 Submetendo contextualização do SchoolPowerPage:", data);
    submitContextualization(data);
  };

  // Função para aprovar action plan
  const handleApproveActionPlan = (approvedItems: any) => {
    console.log("✅ Aprovando action plan do SchoolPowerPage:", approvedItems);
    approveActionPlan(approvedItems);
  };

  // Função para resetar o fluxo
  const handleResetFlow = () => {
    console.log("🔄 Resetando fluxo do SchoolPowerPage");
    resetFlow();
  };

  // Determina se os componentes padrão devem estar visíveis
  const componentsVisible = flowState === 'idle';
  console.log('👁️ Componentes padrão visíveis:', componentsVisible);

  return (
    <div
      className="relative flex h-[90vh] min-h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-lg"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Debug Panel - sempre visível no canto superior direito */}
      <DebugPanel />

      {/* Background de estrelas - sempre visível */}
      <ParticlesBackground isDarkTheme={isDarkTheme} />

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
                <TopHeader isDarkTheme={isDarkTheme} />
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
                  isDarkTheme={isDarkTheme}
                  onExpandedChange={handleCentralExpandedChange}
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

      {/* Card de Construção unificado - aparece baseado no flowState e nunca some */}
      {(flowState === 'contextualizing' || flowState === 'actionplan' || flowState === 'generating' || flowState === 'generatingActivities') && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          style={{ background: 'transparent' }}
        >
          <div className="w-full max-w-4xl mx-4">
            <CardDeConstrucao
              step={
                flowState === 'contextualizing' ? 'contextualization' :
                flowState === 'actionplan' ? 'actionPlan' :
                flowState === 'generating' ? 'generating' : 'generatingActivities'
              }
              contextualizationData={flowData.contextualizationData}
              actionPlan={flowData.actionPlan}
              onSubmitContextualization={handleSubmitContextualization}
              onApproveActionPlan={handleApproveActionPlan}
              onResetFlow={handleResetFlow}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}
    </div>
  );
}