
import React, { useEffect, useState } from 'react';

export function AnimatedBackground({ children }: { children: React.ReactNode }) {
  const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; size: number; opacity: number }>>([]);

  useEffect(() => {
    const initialParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 4 + 1,
      opacity: Math.random() * 0.5 + 0.1
    }));
    
    setParticles(initialParticles);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Partículas de fundo */}
      <div className="absolute inset-0">
        {particles.map((particle) => (
          <div
            key={particle.id}
            className="absolute bg-white rounded-full animate-pulse"
            style={{
              left: `${particle.x}%`,
              top: `${particle.y}%`,
              width: `${particle.size}px`,
              height: `${particle.size}px`,
              opacity: particle.opacity,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      {/* Grid de fundo */}
      <div 
        className="absolute inset-0 opacity-20"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}
      />

      {/* Overlay gradiente */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />

      {/* Conteúdo */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        {children}
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
      `}</style>
    </div>
  );
}
