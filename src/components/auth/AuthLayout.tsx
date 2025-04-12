import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#001427] p-4 relative overflow-hidden">
      <AnimatedBackground />
      
      {/* Elementos decorativos adicionais para reforçar o efeito visual */}
      <div className="absolute top-10 left-10 w-20 h-20 bg-[#FF6B00]/5 blur-3xl rounded-full"></div>
      <div className="absolute bottom-10 right-10 w-32 h-32 bg-[#FF6B00]/5 blur-3xl rounded-full"></div>

      <div
        className={cn(
          "w-full max-w-[480px] rounded-2xl bg-white/5 dark:bg-[#0A2540]/90 p-8 shadow-2xl backdrop-blur-md border border-white/10 relative z-10",
          className,
        )}
      >
        {/* Brilho sutil na borda superior */}
        <div className="absolute -inset-[1px] rounded-2xl z-[-1] bg-gradient-to-b from-[#FF6B00]/20 to-transparent opacity-50"></div>
        {children}
      </div>
    </div>
  );
}