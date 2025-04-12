
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
      <AnimatedBackground>
        <div className="flex items-center justify-center w-full">
          <div
            className={cn(
              "w-full max-w-[480px] rounded-2xl bg-white/30 dark:bg-[#0A2540]/25 p-8 shadow-xl shadow-brand-primary/15 backdrop-blur-xl border border-white/20 dark:border-white/10 transition-all duration-300",
              "hover:shadow-2xl hover:shadow-brand-primary/20 animate-fadeIn",
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "backdrop-filter backdrop-blur-xl glass-effect animate-border-glow",
              className,
            )}
          >
            {children}
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
}
