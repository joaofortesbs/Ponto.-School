import React, { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      // Calcular a posição do mouse em relação ao centro da tela
      const x = (e.clientX / window.innerWidth - 0.5) * 2; // Valor de -1 a 1
      const y = (e.clientY / window.innerHeight - 0.5) * 2; // Valor de -1 a 1

      setPosition({ x, y });
    };

    // Adicionar listener de mouse move
    window.addEventListener('mousemove', handleMouseMove);

    // Garantir que o efeito seja aplicado mesmo sem movimento do mouse
    const bgLayer = document.querySelector('.layer-bg') as HTMLElement;
    const midLayer = document.querySelector('.layer-mid') as HTMLElement;
    const fgLayer = document.querySelector('.layer-fg') as HTMLElement;

    if (bgLayer && midLayer && fgLayer) {
      bgLayer.style.transition = "transform 0.1s ease-out";
      midLayer.style.transition = "transform 0.1s ease-out";
      fgLayer.style.transition = "transform 0.1s ease-out";
    }

    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  // Aplicar transformações com base na posição do mouse
  useEffect(() => {
    const bgLayer = document.querySelector('.layer-bg') as HTMLElement;
    const midLayer = document.querySelector('.layer-mid') as HTMLElement;
    const fgLayer = document.querySelector('.layer-fg') as HTMLElement;

    if (bgLayer && midLayer && fgLayer) {
      // Camada de fundo - movimento mais intenso
      const bgX = position.x * -30; // Movimento oposto ao mouse
      const bgY = position.y * -30;
      bgLayer.style.transform = `translate3d(${bgX}px, ${bgY}px, 0)`;

      // Camada do meio - movimento moderado
      const midX = position.x * 15;
      const midY = position.y * 15;
      midLayer.style.transform = `translate3d(${midX}px, ${midY}px, 0)`;

      // Camada da frente - movimento mais sutil
      const fgX = position.x * -8;
      const fgY = position.y * -8;
      fgLayer.style.transform = `translate3d(${fgX}px, ${fgY}px, 0)`;
    }
  }, [position]);

  return (
    <div className="banner absolute inset-0 overflow-hidden z-0">
      <div className="layer layer-bg absolute w-full h-full"></div>
      <div className="layer layer-mid absolute w-full h-full"></div>
      <div className="layer layer-fg absolute w-full h-full"></div>
      {children}
    </div>
  );
}