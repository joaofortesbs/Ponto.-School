import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
      {/* Fundo animado */}
      <AnimatedBackground />
      
      {/* Conteúdo */}
      <div
        className={cn(
          "w-full max-w-[480px] rounded-2xl bg-white dark:bg-[#0A2540] p-8 shadow-xl shadow-brand-primary/5 backdrop-blur-sm border border-white/10 relative z-10",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
