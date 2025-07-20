
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
import { useSchoolPowerFlow } from "../../features/schoolpower/hooks/useSchoolPowerFlow";
import { ContextualizationCard } from "../../features/schoolpower/contextualization/ContextualizationCard";
import { ActionPlanCard } from "../../features/schoolpower/actionplan/ActionPlanCard";

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

      {/* Card de Contextualização - aparece quando flowState é 'contextualizing' */}
      {flowState === 'contextualizing' && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-30 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5 }}
        >
          <ContextualizationCard 
            onSubmit={handleSubmitContextualization}
          />
        </motion.div>
      )}

      {/* Card de Action Plan - aparece quando flowState é 'actionplan' */}
      {flowState === 'actionplan' && (
        <motion.div 
          className="absolute inset-0 flex items-center justify-center z-30 px-4"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        >
          <ActionPlanCard 
            actionPlan={flowData.actionPlan || []}
            onApprove={handleApproveActionPlan}
            isLoading={isLoading || !flowData.actionPlan}
          />
        </motion.div>
      )}

      {/* Estado de geração - aparece quando flowState é 'generating' */}
      {flowState === 'generating' && (
        <motion.div 
          className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-lg w-full mx-4 text-center shadow-2xl border border-white/30"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="relative mb-6">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto"></div>
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#FF6B00]/10 to-transparent animate-pulse"></div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🤖 Analisando com IA Gemini
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              A IA está processando sua mensagem e contexto para criar um plano de ação personalizado...
            </p>
            <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#29335C]/10 rounded-lg p-4 mb-6 border border-[#FF6B00]/20">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✨ Consultando 137 atividades disponíveis<br/>
                🎯 Personalizando para seu contexto específico<br/>
                📝 Gerando sugestões inteligentes<br/>
                🔍 Validando compatibilidade das atividades
              </p>
            </div>
            <div className="flex gap-3 justify-center">
              <button 
                onClick={handleResetFlow}
                className="px-6 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}

      {/* Estado de geração de atividades - aparece quando flowState é 'generatingActivities' */}
      {flowState === 'generatingActivities' && (
        <motion.div 
          className="absolute inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div 
            className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl rounded-2xl p-8 max-w-md w-full mx-4 text-center shadow-2xl border border-white/20"
            initial={{ opacity: 0, scale: 0.8, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          >
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto mb-6"></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
              🎯 Gerando Atividades
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              As atividades aprovadas estão sendo geradas automaticamente pelo School Power...
            </p>
            <div className="bg-gradient-to-r from-[#FF6B00]/10 to-[#29335C]/10 rounded-lg p-4 mb-6 border border-[#FF6B00]/20">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ✅ Personalizando conteúdo das atividades<br/>
                🎨 Criando materiais visuais<br/>
                📝 Formatando atividades finais<br/>
                🚀 Preparando download
              </p>
            </div>
            <button 
              onClick={handleResetFlow}
              className="px-6 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors duration-200"
            >
              Cancelar
            </button>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
