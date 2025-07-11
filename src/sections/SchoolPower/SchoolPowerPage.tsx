
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
        
        {/* Conteúdo principal da School Power */}
        <main className="flex-1 ml-64 pt-[72px]">
          <div className="relative h-[calc(100vh-72px)] overflow-hidden" style={{ background: 'transparent' }}>
            <ParticlesCanvas>
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 z-10 pointer-events-auto">
                <AvatarCentral />
              </div>
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 z-10">
                <AIMessageBox />
              </div>
            </ParticlesCanvas>
          </div>
        </main>
      </div>
    </div>
  );
}
