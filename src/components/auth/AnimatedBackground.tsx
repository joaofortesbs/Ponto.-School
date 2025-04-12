
import React, { useEffect, useRef } from "react";

interface AnimatedBackgroundProps {
  children?: React.ReactNode;
}

export function AnimatedBackground({ children }: AnimatedBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bgLayerRef = useRef<HTMLDivElement>(null);
  const midLayerRef = useRef<HTMLDivElement>(null);
  const fgLayerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Função para gerenciar o efeito de paralaxe
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current || !bgLayerRef.current || !midLayerRef.current || !fgLayerRef.current) return;
      
      const { clientX, clientY } = e;
      const rect = containerRef.current.getBoundingClientRect();
      
      // Calcular posição relativa do mouse (de -0.5 a 0.5)
      const xRelative = ((clientX - rect.left) / rect.width) - 0.5;
      const yRelative = ((clientY - rect.top) / rect.height) - 0.5;
      
      // Aplicar transformação com diferentes intensidades para criar efeito de profundidade
      const bgStrength = 20;   // Movimento mais suave para o fundo
      const midStrength = 35;  // Movimento médio para a camada do meio
      const fgStrength = -15;  // Movimento oposto para a camada da frente
      
      // Aplicar transformações com animação suave usando translateX/Y
      requestAnimationFrame(() => {
        bgLayerRef.current!.style.transform = `translate3d(${xRelative * bgStrength}px, ${yRelative * bgStrength}px, 0)`;
        midLayerRef.current!.style.transform = `translate3d(${xRelative * midStrength}px, ${yRelative * midStrength}px, 0)`;
        fgLayerRef.current!.style.transform = `translate3d(${xRelative * fgStrength}px, ${yRelative * fgStrength}px, 0)`;
      });
    };

    // Função para aplicar efeito suave de "descanso" quando o mouse estiver fora da área
    const handleMouseLeave = () => {
      if (!bgLayerRef.current || !midLayerRef.current || !fgLayerRef.current) return;
      
      // Retorna suavemente para a posição central quando o mouse sai
      bgLayerRef.current.style.transition = "transform 0.8s ease-out";
      midLayerRef.current.style.transition = "transform 0.8s ease-out";
      fgLayerRef.current.style.transition = "transform 0.8s ease-out";
      
      bgLayerRef.current.style.transform = "translate3d(0, 0, 0)";
      midLayerRef.current.style.transform = "translate3d(0, 0, 0)";
      fgLayerRef.current.style.transform = "translate3d(0, 0, 0)";
    };

    // Função para remover a transição suave ao mover o mouse novamente
    const handleMouseEnter = () => {
      if (!bgLayerRef.current || !midLayerRef.current || !fgLayerRef.current) return;
      
      // Remove a transição para movimento imediato quando o mouse entra novamente
      bgLayerRef.current.style.transition = "transform 0.1s ease-out";
      midLayerRef.current.style.transition = "transform 0.1s ease-out";
      fgLayerRef.current.style.transition = "transform 0.1s ease-out";
    };

    // Adicionar event listeners
    document.addEventListener('mousemove', handleMouseMove);
    containerRef.current?.addEventListener('mouseleave', handleMouseLeave);
    containerRef.current?.addEventListener('mouseenter', handleMouseEnter);
    
    // Inicialização das camadas
    if (bgLayerRef.current && midLayerRef.current && fgLayerRef.current) {
      bgLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
      midLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
      fgLayerRef.current.style.transform = 'translate3d(0, 0, 0)';
      
      // Aplicar transição inicial
      bgLayerRef.current.style.transition = 'transform 0.1s ease-out';
      midLayerRef.current.style.transition = 'transform 0.1s ease-out';
      fgLayerRef.current.style.transition = 'transform 0.1s ease-out';
    }
    
    // Limpeza dos event listeners
    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      containerRef.current?.removeEventListener('mouseleave', handleMouseLeave);
      containerRef.current?.removeEventListener('mouseenter', handleMouseEnter);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="banner absolute inset-0 overflow-hidden perspective-1500 z-0"
    >
      {/* Camada de fundo - movimento mais lento */}
      <div 
        ref={bgLayerRef} 
        className="layer layer-bg absolute w-full h-full bg-cover bg-center"
      ></div>
      
      {/* Camada intermediária - movimento médio */}
      <div 
        ref={midLayerRef} 
        className="layer layer-mid absolute w-full h-full"
        style={{
          background: `
            radial-gradient(circle at 20% 30%, rgba(255, 107, 0, 0.05), transparent 80%), 
            radial-gradient(circle at 80% 40%, rgba(255, 107, 0, 0.05), transparent 80%),
            radial-gradient(circle at 50% 70%, rgba(255, 107, 0, 0.03), transparent 80%)
          `,
          zIndex: 2
        }}
      ></div>
      
      {/* Camada frontal - movimento na direção oposta */}
      <div 
        ref={fgLayerRef} 
        className="layer layer-fg absolute w-full h-full"
      ></div>
      
      {children}
    </div>
  );
}
