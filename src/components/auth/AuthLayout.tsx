import React from "react";
import { cn } from "@/lib/utils";
import { AnimatedBackground } from "./AnimatedBackground";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f9fa] dark:bg-[#001427] p-4 relative overflow-hidden">
      <AnimatedBackground />
      <div
        className={cn(
          "w-full max-w-[480px] rounded-2xl bg-white/90 dark:bg-[#0A2540]/90 p-8 shadow-xl shadow-brand-primary/5 backdrop-blur-md border border-white/10 relative z-10 animate-fade-in",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
