import React from "react";
import { cn } from "@/lib/utils";

interface AuthLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export function AuthLayout({ children, className }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#f7f9fa] dark:bg-[#001427] p-4">
      <div
        className={cn(
          "w-full max-w-[480px] rounded-2xl bg-white dark:bg-[#0A2540] p-8 shadow-xl shadow-brand-primary/5 backdrop-blur-sm border border-white/10",
          className,
        )}
      >
        {children}
      </div>
    </div>
  );
}
