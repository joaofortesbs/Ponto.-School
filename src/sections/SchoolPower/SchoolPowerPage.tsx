"use client";
import React, { useState } from "react";
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

export function SchoolPowerPage() {
  const [isDarkTheme] = useState(true);
  const [isCentralExpanded, setIsCentralExpanded] = useState(false);
  
  // Hook para gerenciar o fluxo do School Power
  const {
    flowState,
    sendInitialMessage,
    submitContextualization,
    resetFlow
  } = useSchoolPowerFlow();

  const handleCentralExpandedChange = (expanded: boolean) => {
    setIsCentralExpanded(expanded);
  };

  // Função para enviar mensagem inicial
  const handleSendMessage = (message: string) => {
    console.log("📤 Enviando mensagem para School Power:", message);
    sendInitialMessage(message);
  };

  // Função para submeter contextualização
  const handleSubmitContextualization = (data: any) => {
    console.log("📝 Submetendo contextualização:", data);
    submitContextualization(data);
  };

  // Determina se os componentes devem estar visíveis
  const componentsVisible = flowState === 'idle';

  return (
    <div
      className="relative flex h-[90vh] min-h-[650px] w-full flex-col items-center justify-center overflow-hidden rounded-lg"
      style={{ backgroundColor: "transparent" }}
    >
      {/* Background de estrelas */}
      <ParticlesBackground isDarkTheme={isDarkTheme} />

      {/* Vertical dock positioned at right side - apenas visível no estado idle */}
      {componentsVisible && (
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <SideMenu />
        </div>
      )}

      {/* Container Ripple fixo e centralizado no background - apenas visível no estado idle */}
      {componentsVisible && (
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
      )}

      {/* Card de Contextualização - aparece quando flowState é 'contextualizing' */}
      {flowState === 'contextualizing' && (
        <ContextualizationCard 
          onSubmit={handleSubmitContextualization}
        />
      )}

      {/* Estado de geração - aparece quando flowState é 'generating' */}
      {flowState === 'generating' && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#FF6B00] mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Gerando Plano de Ação
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              A IA está processando sua solicitação e criando um plano personalizado...
            </p>
            <button 
              onClick={resetFlow}
              className="mt-4 px-4 py-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}