import React from 'react';
import ParticlesCanvas from './components/ParticlesCanvas';
import AIMessageBox from './components/AIMessageBox';

export function SchoolPowerPage() {
  return (
    <div className="min-h-screen relative overflow-hidden" style={{ background: 'transparent' }}>
      <div className="absolute top-20 left-0 right-0 bottom-0">
        <ParticlesCanvas />
      </div>
      <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-10">
        <AIMessageBox />
      </div>
    </div>
  );
}