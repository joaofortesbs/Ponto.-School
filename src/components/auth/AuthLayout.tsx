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
              "w-full max-w-[480px] rounded-2xl bg-white/50 dark:bg-[#0A2540]/40 p-8 backdrop-blur-md border border-white/30 dark:border-white/10 transition-all duration-300",
              "shadow-xl shadow-brand-primary/10 hover:shadow-2xl hover:shadow-brand-primary/15 animate-fadeIn",
              "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2",
              "glass-effect", 
              className,
            )}
            style={{
              backdropFilter: "blur(12px)",
              WebkitBackdropFilter: "blur(12px)",
              boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1), inset 0 0 0 1px rgba(255, 255, 255, 0.1)"
            }}
          >
            {children}
          </div>
        </div>
      </AnimatedBackground>
    </div>
  );
}