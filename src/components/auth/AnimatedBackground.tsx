
import React, { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const fgLayerRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !bgLayerRef.current || !fgLayerRef.current) return;
      
      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calcula a posição relativa do mouse dentro do container (0-1)
      const relX = (clientX - rect.left) / rect.width;
      const relY = (clientY - rect.top) / rect.height;
      
      // Calcular o deslocamento a partir do centro (valores -0.5 a 0.5)
      const offsetX = relX - 0.5;
      const offsetY = relY - 0.5;
      
      // Aplicar movimentos com diferentes intensidades para cada camada
      // Movimento mais intenso para bg, movimento contrário para fg
      const bgStrength = 30; // Intensidade do movimento da camada de fundo
      const fgStrength = -15; // Intensidade do movimento da camada frontal (negativo para direção oposta)
      
      // Aplicar transformação com animação suave
      requestAnimationFrame(() => {
        bgLayerRef.current!.style.transform = `translate3d(${offsetX * bgStrength}px, ${offsetY * bgStrength}px, 0)`;
        fgLayerRef.current!.style.transform = `translate3d(${offsetX * fgStrength}px, ${offsetY * fgStrength}px, 0)`;
      });
    };

    // Adicionar listener para movimento do mouse
    window.addEventListener('mousemove', handleMouseMove);
    
    // Inicialização das camadas no centro
    if (bgLayerRef.current && fgLayerRef.current) {
      bgLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
      fgLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
    }
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="banner absolute inset-0 overflow-hidden perspective-1000 z-0"
    >
      <div 
        ref={bgLayerRef} 
        className="layer layer-bg absolute w-full h-full bg-cover bg-center transition-transform duration-300 ease-out"
      ></div>
      <div 
        ref={fgLayerRef} 
        className="layer layer-fg absolute w-full h-full bg-cover bg-center transition-transform duration-300 ease-out"
      ></div>
      {children}
    </div>
  );
}
