
import React, { useEffect } from "react";

export function AnimatedBackground() {
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 30;
      const y = (e.clientY / window.innerHeight - 0.5) * 30;

      const layerBg = document.querySelector('.layer-bg') as HTMLElement;
      const layerFg = document.querySelector('.layer-fg') as HTMLElement;
      
      if (layerBg && layerFg) {
        layerBg.style.transform = `translate(${x}px, ${y}px) scale(1.05)`;
        layerFg.style.transform = `translate(${-x}px, ${-y}px) scale(1.1)`;
      }
    };

    document.addEventListener('mousemove', handleMouseMove);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="banner absolute inset-0 overflow-hidden z-0">
      <div className="layer layer-bg absolute w-full h-full bg-cover bg-center"></div>
      <div className="layer layer-fg absolute w-full h-full bg-cover bg-center"></div>
    </div>
  );
}
