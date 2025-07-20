
"use client";
import React, { useState, useEffect } from "react";
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

  console.log('🏠 SchoolPowerPage: Componente inicializado');

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

  // Log detalhado do estado atual
  useEffect(() => {
    console.log('🏠 SchoolPowerPage: Estado atual do fluxo atualizado');
    console.log('📊 Flow State:', flowState);
    console.log('📊 Is Loading:', isLoading);
    console.log('📊 Flow Data:', {
      hasInitialMessage: !!flowData.initialMessage,
      hasContextualizationData: !!flowData.contextualizationData,
      hasActionPlan: !!flowData.actionPlan,
      actionPlanCount: flowData.actionPlan?.length || 0,
      messagePreview: flowData.initialMessage?.substring(0, 50) + '...'
    });
  }, [flowState, flowData, isLoading]);

  const handleCentralExpandedChange = (expanded: boolean) => {
    console.log('🎛️ Central expansion changed:', expanded);
    setIsCentralExpanded(expanded);
  };

  // Função para enviar mensagem inicial
  const handleSendMessage = (message: string) => {
    console.log("🏠 SchoolPowerPage: Recebeu mensagem para envio");
    console.log("📤 Mensagem recebida:", message);
    console.log("📊 Estado atual antes do envio:", flowState);
    
    if (!message || message.trim().length === 0) {
      console.error("❌ Mensagem vazia recebida");
      return;
    }
    
    console.log("✅ Enviando mensagem para School Power Flow...");
    sendInitialMessage(message);
  };

  // Função para submeter contextualização
  const handleSubmitContextualization = (data: any) => {
    console.log("🏠 SchoolPowerPage: Recebeu dados de contextualização");
    console.log("📝 Dados de contextualização:", data);
    console.log("📊 Estado atual antes da submissão:", flowState);
    console.log("📊 Mensagem inicial disponível:", !!flowData.initialMessage);
    
    if (!data) {
      console.error("❌ Dados de contextualização vazios");
      return;
    }
    
    console.log("✅ Submetendo contextualização para School Power Flow...");
    submitContextualization(data);
  };

  // Função para aprovar action plan
  const handleApproveActionPlan = (approvedItems: any[]) => {
    console.log("🏠 SchoolPowerPage: Recebeu itens aprovados do action plan");
    console.log("✅ Itens aprovados:", approvedItems);
    console.log("📊 Número de itens aprovados:", approvedItems.length);
    console.log("📋 IDs dos itens aprovados:", approvedItems.map(item => item.id));
    
    if (!approvedItems || approvedItems.length === 0) {
      console.error("❌ Nenhum item aprovado recebido");
      return;
    }
    
    console.log("✅ Enviando itens aprovados para School Power Flow...");
    approveActionPlan(approvedItems);
  };

  // Determinar qual componente renderizar baseado no estado do fluxo
  const renderCurrentStep = () => {
    console.log('🎨 Determinando componente a renderizar baseado no estado:', flowState);
    
    switch (flowState) {
      case 'idle':
        console.log('🎨 Renderizando: Estado inicial (ChatInput)');
        return (
          <ChatInput
            onSendMessage={handleSendMessage}
            onCentralExpandedChange={handleCentralExpandedChange}
          />
        );
        
      case 'contextualizing':
        console.log('🎨 Renderizando: Card de contextualização');
        console.log('📝 Mensagem inicial para contextualização:', flowData.initialMessage);
        return (
          <ContextualizationCard
            initialMessage={flowData.initialMessage || ''}
            onSubmit={handleSubmitContextualization}
            isLoading={isLoading}
          />
        );
        
      case 'generating':
        console.log('🎨 Renderizando: Estado de geração (loading)');
        return (
          <ActionPlanCard
            actionPlan={[]}
            onApprove={handleApproveActionPlan}
            isLoading={true}
          />
        );
        
      case 'actionplan':
        console.log('🎨 Renderizando: Card do action plan');
        console.log('📋 Action plan para renderização:', flowData.actionPlan);
        console.log('📊 Número de atividades no action plan:', flowData.actionPlan?.length || 0);
        return (
          <ActionPlanCard
            actionPlan={flowData.actionPlan || []}
            onApprove={handleApproveActionPlan}
            isLoading={false}
          />
        );
        
      case 'generatingActivities':
        console.log('🎨 Renderizando: Estado de geração de atividades');
        return (
          <motion.div 
            className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl p-8 max-w-4xl w-full mx-4 shadow-2xl border border-white/30"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-[#FF6B00]/20 border-t-[#FF6B00] mx-auto mb-6"></div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                🚀 Gerando Atividades
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Suas atividades estão sendo criadas. Isso pode levar alguns momentos...
              </p>
            </div>
          </motion.div>
        );
        
      default:
        console.warn('🎨 Estado de fluxo desconhecido:', flowState);
        console.log('🔄 Renderizando estado padrão (ChatInput)');
        return (
          <ChatInput
            onSendMessage={handleSendMessage}
            onCentralExpandedChange={handleCentralExpandedChange}
          />
        );
    }
  };

  console.log('🎨 SchoolPowerPage: Renderizando componente principal');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 relative overflow-hidden">
      {/* Background Effects */}
      <ParticlesBackground />
      <Particles3D />

      {/* Header */}
      <TopHeader />

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Profile Selector (sempre visível no topo) */}
          {flowState === 'idle' && (
            <div className="mb-8">
              <ProfileSelector />
            </div>
          )}

          {/* Componente principal baseado no estado do fluxo */}
          <div className="flex items-center justify-center">
            {renderCurrentStep()}
          </div>

          {/* Debug Panel - remover em produção */}
          {process.env.NODE_ENV === 'development' && (
            <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-xs max-w-sm">
              <h4 className="font-bold mb-2">Debug - School Power</h4>
              <p><strong>Estado:</strong> {flowState}</p>
              <p><strong>Loading:</strong> {isLoading ? 'Sim' : 'Não'}</p>
              <p><strong>Mensagem:</strong> {flowData.initialMessage ? 'Sim' : 'Não'}</p>
              <p><strong>Contextualização:</strong> {flowData.contextualizationData ? 'Sim' : 'Não'}</p>
              <p><strong>Action Plan:</strong> {flowData.actionPlan?.length || 0} atividades</p>
              <button 
                onClick={resetFlow}
                className="mt-2 px-2 py-1 bg-red-600 rounded text-xs"
              >
                Reset Flow
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Side Menu */}
      <SideMenu />
    </div>
  );
}
