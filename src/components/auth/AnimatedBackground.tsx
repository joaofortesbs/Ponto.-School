import React, { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface AnimatedBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export function AnimatedBackground({ children, className }: AnimatedBackgroundProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  // Efeito para marcar quando o componente é carregado
  useEffect(() => {
    // Apenas definir como carregado uma vez
    if (!isLoaded) {
      setIsLoaded(true);
    }

    // Disparar evento personalizado para notificar que o background foi renderizado
    const event = new CustomEvent('WebTeiasProntas');
    document.dispatchEvent(event);
  }, [isLoaded]);

  return (
    <div className={cn("absolute inset-0 z-0 overflow-hidden", className)}>
      {/* Fundo com efeito gradiente */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#001427] via-[#00265A] to-[#29335C] opacity-85 z-0"></div>

      {/* Efeitos de luz */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden">
        {/* Luz principal no canto direito */}
        <div className="absolute -top-[10%] -right-[10%] w-[60%] h-[60%] rounded-full bg-[#001427]/40 blur-3xl"></div>

        {/* Luz secundária no canto inferior */}
        <div className="absolute bottom-0 right-0 w-[40%] h-[70%] rounded-tl-full bg-gradient-to-tl from-[#001427]/50 via-[#001427]/30 to-transparent blur-3xl"></div>
      </div>

      {/* Conteúdo principal */}
      {children}
    </div>
  );
}