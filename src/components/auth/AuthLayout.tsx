
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
              "w-full max-w-[480px] rounded-2xl bg-white/40 dark:bg-[#0A2540]/30 p-8 shadow-xl shadow-brand-primary/15 backdrop-blur-xl border border-white/30 dark:border-white/10 transition-all duration-300",
              "hover:shadow-2xl hover:shadow-brand-primary/25 animate-fadeIn",
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "before:content-[''] before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-white/10 before:to-white/5 dark:before:from-brand-primary/10 dark:before:to-white/5 before:opacity-80 before:-z-10",
              "after:content-[''] after:absolute after:inset-0 after:rounded-2xl after:backdrop-blur-xl after:-z-10",
              className,
            )}
            style={{
              boxShadow: "0 10px 40px rgba(0, 0, 0, 0.1), 0 2px 10px rgba(255, 107, 0, 0.1)",
            }}
          >
            {children}
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
}
