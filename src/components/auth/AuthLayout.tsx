import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  // Estado para controlar quando o conteúdo principal deve ser exibido
  const [contentReady, setContentReady] = React.useState(false);

  // Efeito para garantir que as teias sejam carregadas antes do conteúdo principal
  React.useEffect(() => {
    // Força renderização do conteúdo após um curto tempo
    // mesmo que as teias ainda não estejam prontas (para falha segura)
    const timer = setTimeout(() => {
      setContentReady(true);
    }, 50);

    // Escuta o evento personalizado que indica que as teias estão prontas
    const handleTeiasReady = () => {
      clearTimeout(timer);
      setContentReady(true);
    };

    document.addEventListener('WebTeiasProntas', handleTeiasReady);

    // Dispara um evento para solicitar atualização imediata das teias
    document.dispatchEvent(new CustomEvent('ForceWebTeiaUpdate'));

    return () => {
      clearTimeout(timer);
      document.removeEventListener('WebTeiasProntas', handleTeiasReady);
    };
  }, []);

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f9fa] dark:bg-[#001427] p-4 relative overflow-hidden">
      {/* AnimatedBackground como primeiro componente a ser renderizado */}
      <AnimatedBackground>
        {/* Conteúdo principal com renderização condicionada */}
        <div className="flex items-center justify-center w-full">
          <div
            className={cn(
              "w-full max-w-[480px] rounded-2xl bg-white/50 dark:bg-[#0A2540]/50 p-8 shadow-xl shadow-brand-primary/10 backdrop-blur-lg border border-white/20 dark:border-white/10 transition-all duration-300",
              "hover:shadow-2xl hover:shadow-brand-primary/15 animate-fadeIn",
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              !contentReady && "opacity-0", // Inicialmente invisível até as teias estarem prontas
              contentReady && "opacity-100", // Aparece quando as teias estiverem prontas
              className,
            )}
            style={{ 
              transition: "opacity 0.3s ease-in-out",
              backdropFilter: "blur(12px)"  // Mais realista e moderno
            }}
          >
            {children}
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
}