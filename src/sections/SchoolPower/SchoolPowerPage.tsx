import React from 'react';
import ParticlesCanvas from './components/ParticlesCanvas';
import AIMessageBox from './components/AIMessageBox';

export function SchoolPowerPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'transparent' }}>
      <ParticlesCanvas />
      <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 z-10">
        <AIMessageBox />
      </div>
    </div>
  );
}