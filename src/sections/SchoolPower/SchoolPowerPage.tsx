
import React, { useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { useSchoolPowerStore } from '@/store/schoolPowerStore';
import { ChatInput } from './components/ChatInput';
import { ContextualizationForm } from './components/ContextualizationForm';
import { ChecklistPlanner } from './components/ChecklistPlanner';
import { IAExecutionDashboard } from './components/IAExecutionDashboard';
import { TopHeader } from './components/TopHeader';
import { ProfileSelector } from './components/ProfileSelector';
import { SideMenu } from './components/SideMenu';
import { ParticlesBackground } from './components/ParticlesBackground';

export const SchoolPowerPage: React.FC = () => {
  const { stage, error, setError } = useSchoolPowerStore();

  useEffect(() => {
    // Limpar erros quando o componente monta
    if (error) {
      const timeout = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timeout);
    }
  }, [error, setError]);

  const renderCurrentStage = () => {
    switch (stage) {
      case 'start':
        return (
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8">
            <div className="text-center space-y-4 mb-8">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                School Power
              </h1>
              <p className="text-xl text-white/80 max-w-2xl">
                Transforme suas ideias em materiais educacionais completos com o poder da IA
              </p>
            </div>
            <ChatInput />
          </div>
        );
      
      case 'contextualization':
        return <ContextualizationForm />;
      
      case 'planning':
        return <ChecklistPlanner />;
      
      case 'execution':
        return <IAExecutionDashboard />;
      
      default:
        return (
          <div className="flex flex-col items-center justify-center min-h-screen">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-bold text-white">Estado Desconhecido</h2>
              <p className="text-white/80">
                Ocorreu um erro inesperado. Recarregue a página.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0D2238] via-[#1A365D] to-[#2D3748] relative overflow-hidden">
      {/* Background Effects */}
      <ParticlesBackground />
      
      {/* Header */}
      <TopHeader />
      
      {/* Side Menu */}
      <SideMenu />
      
      {/* Profile Selector */}
      <ProfileSelector />
      
      {/* Main Content */}
      <main className="relative z-10 container mx-auto px-4 py-8">
        {/* Error Display */}
        {error && (
          <div className="fixed top-4 right-4 z-50 max-w-md">
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-4 text-red-200">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                <span className="font-medium">Erro</span>
              </div>
              <p className="mt-1 text-sm">{error}</p>
            </div>
          </div>
        )}
        
        {/* Stage Content */}
        <AnimatePresence mode="wait">
          {renderCurrentStage()}
        </AnimatePresence>
      </main>
    </div>
  );
};
