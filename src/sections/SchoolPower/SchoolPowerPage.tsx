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
import useSchoolPowerFlow from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { ContextualizationCard } from "../../features/schoolpower/contextualization/ContextualizationCard";
import { ActionPlanCard } from "../../features/schoolpower/actionplan/ActionPlanCard";
import { CardDeConstrucao } from "../../features/schoolpower/construction/CardDeConstrucao";
import { useIsMobile } from "../../hooks/useIsMobile";
import DebugPanel from './components/DebugPanel';
import GeminiApiMonitor from './components/GeminiApiMonitor';

interface SchoolPowerPageProps {
  isQuizMode?: boolean;
}

export function SchoolPowerPage({ isQuizMode = false }: SchoolPowerPageProps) {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);
  const isMobile = useIsMobile();
  const [refreshTrigger, setRefreshTrigger] = useState(0); // Estado para forçar re-renderização

  // Hook para gerenciar o fluxo do School Power
  const {
    flowState,
    flowData,
    sendInitialMessage: handleSendInitialMessage,
    submitContextualization: handleSubmitContextualizationHook,
    approveActionPlan: handleApproveActionPlanHook,
    resetFlow: handleResetFlowHook,
    isLoading
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
    console.log("🔄 Voltando ao início do School Power");

    // Reset IMEDIATO e COMPLETO do hook
    handleResetFlowHook();

    console.log("🏠 Reset executado - interface deve voltar ao estado inicial IMEDIATAMENTE");
  };

  // Determina se os componentes padrão devem estar visíveis
  const componentsVisible = flowState === 'idle';

  // Log e forçar re-render quando o estado muda para idle
  React.useEffect(() => {
    console.log('👁️ Componentes padrão visíveis:', componentsVisible);
    console.log('🏗️ Estado atual do fluxo:', flowState);

    if (flowState === 'idle') {
      console.log('🏠 Estado IDLE detectado - interface inicial deve aparecer AGORA');
    }
  }, [componentsVisible, flowState]);

  // Listener para mudanças no fluxo
  useEffect(() => {
    const handleFlowChange = () => {
      console.log('🔄 Mudança no fluxo detectada - recarregando dados...');
      if (refreshTrigger < 10) {
        setRefreshTrigger(prev => prev + 1);
      }
    };

    const handleSchoolPowerReset = (event: CustomEvent) => {
      console.log('🏠 [RESET EVENT] Recebido evento de reset do School Power:', event.detail);

      // Forçar atualização imediata da interface para estado inicial
      setTimeout(() => {
        console.log('⚡ Forçando refresh para estado inicial...');
        setRefreshTrigger(prev => prev + 1);

        // Disparar evento adicional para garantir sincronização
        window.dispatchEvent(new CustomEvent('schoolpower-interface-reset', {
          detail: { timestamp: Date.now() }
        }));
      }, 50);
    };

    // Escutar por mudanças nas atividades construídas
    window.addEventListener('activity-built', handleFlowChange);
    window.addEventListener('schoolpower-activities-updated', handleFlowChange);

    // Escutar por eventos de reset do School Power
    window.addEventListener('schoolpower-flow-reset', handleSchoolPowerReset as EventListener);
    window.addEventListener('schoolpower-reset-complete', handleSchoolPowerReset as EventListener);
    window.addEventListener('schoolpower-force-refresh', handleSchoolPowerReset as EventListener);
    window.addEventListener('construction-grid-reset-complete', handleSchoolPowerReset as EventListener);
    window.addEventListener('schoolpower-interface-force-update', handleSchoolPowerReset as EventListener);

    return () => {
      window.removeEventListener('activity-built', handleFlowChange);
      window.removeEventListener('schoolpower-activities-updated', handleFlowChange);
      window.removeEventListener('schoolpower-flow-reset', handleSchoolPowerReset as EventListener);
      window.removeEventListener('schoolpower-reset-complete', handleSchoolPowerReset as EventListener);
      window.removeEventListener('schoolpower-force-refresh', handleSchoolPowerReset as EventListener);
      window.removeEventListener('construction-grid-reset-complete', handleSchoolPowerReset as EventListener);
      window.removeEventListener('schoolpower-interface-force-update', handleSchoolPowerReset as EventListener);
    };
  }, [refreshTrigger]);


  return (
    <div
      className={`relative flex ${isMobile && isQuizMode ? 'h-screen min-h-screen' : 'h-[90vh] min-h-[650px]'} w-full flex-col items-center justify-center overflow-hidden rounded-lg`}
      style={{ backgroundColor: "transparent" }}
    >
      {/* Background de estrelas - sempre visível */}
      <ParticlesBackground isDarkTheme={isDarkTheme} />

      {/* Componentes padrões - só aparecem quando flowState é 'idle' */}
      {componentsVisible && (
        <>
          {/* Vertical dock positioned at right side - hidden on mobile quiz mode */}
          {!(isMobile && isQuizMode) && (
            <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
              <SideMenu />
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
                />
              </div>
            </div>
          </div>
        </>
      )}

      {/* Card de Construção unificado - aparece baseado no flowState e DESAPARECE quando idle */}
      {flowState !== 'idle' && (flowState === 'contextualizing' || flowState === 'actionplan' || flowState === 'generating' || flowState === 'generatingActivities' || flowState === 'activities') && (
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