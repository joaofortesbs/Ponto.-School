import React from 'react';
import Header from '@/components/layout/Header';
import Sidebar from '@/components/layout/Sidebar';
import ParticlesCanvas from './components/ParticlesCanvas';
import AIMessageBox from './components/AIMessageBox';
import AvatarCentral from './components/AvatarCentral';

export function SchoolPowerPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#001427]">
      {/* Header fixo */}
      <Header />
      
      <div className="flex">
        {/* Sidebar fixa */}
        <Sidebar />
        
        {/* Conteúdo principal da School Power - sempre centralizado */}
        <main className="flex-1 pt-[72px] min-h-screen flex items-center justify-center">
          <div className="w-full h-[calc(100vh-72px)] relative overflow-hidden flex items-center justify-center" style={{ background: 'transparent' }}>
            <div className="w-full max-w-[1200px] h-full relative flex items-center justify-center">
              <ParticlesCanvas>
                <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
                  <AvatarCentral />
                </div>
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                  <AIMessageBox />
                </div>
              </ParticlesCanvas>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}