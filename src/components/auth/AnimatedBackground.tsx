
import React, { useEffect, useState } from "react";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      // Calcular posição do mouse em porcentagem da tela
      const xPercent = e.clientX / width;
      const yPercent = e.clientY / height;
      
      setMousePosition({ x: xPercent, y: yPercent });
      
      // Aplicar o efeito de paralaxe nos elementos
      const bgLayer = document.querySelector('.layer-bg') as HTMLElement;
      const fgLayer = document.querySelector('.layer-fg') as HTMLElement;
      
      if (bgLayer && fgLayer) {
        // Movimento suave com diferentes velocidades para cada camada
        const xMovementBg = (xPercent - 0.5) * 40; // Movimento mais intenso para o fundo
        const yMovementBg = (yPercent - 0.5) * 40;
        
        const xMovementFg = (xPercent - 0.5) * -20; // Movimento na direção oposta para o primeiro plano
        const yMovementFg = (yPercent - 0.5) * -20;
        
        bgLayer.style.transform = `translate(${xMovementBg}px, ${yMovementBg}px)`;
        fgLayer.style.transform = `translate(${xMovementFg}px, ${yMovementFg}px)`;
      }
    };

    // Adicionar evento de movimento do mouse
    window.addEventListener('mousemove', handleMouseMove);
    
    // Função de cleanup
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="banner absolute inset-0 overflow-hidden perspective-1000 z-0">
      <div className="layer layer-bg absolute w-full h-full bg-cover bg-center"></div>
      <div className="layer layer-fg absolute w-full h-full bg-cover bg-center"></div>
      {children}
    </div>
  );
}
