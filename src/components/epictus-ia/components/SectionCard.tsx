
import React from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

interface SectionCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  isActive: boolean;
  badge?: string | null;
  color: string;
  onClick: () => void;
}

export default function SectionCard({
  title,
  description,
  icon,
  isActive,
  badge,
  color,
  onClick
}: SectionCardProps) {
  const { theme } = useTheme();
  
  return (
    <Card
      onClick={onClick}
      className={cn(
        "p-5 h-full border cursor-pointer overflow-hidden transition-all duration-300 group",
        isActive 
          ? `border-2 ${color.replace("from-", "border-").split(" ")[0]} shadow-lg` 
          : "border-transparent",
        theme === "dark" ? "bg-gray-800/80" : "bg-white/80",
        "backdrop-blur-md"
      )}
      style={{
        transform: isActive ? "scale(1.05)" : "scale(1)",
      }}
    >
      <div className="relative h-full flex flex-col justify-between">
        {/* Efeito de brilho quando é ativo */}
        {isActive && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute -inset-[50px] bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 rotate-45 translate-x-[-120%] group-hover:translate-x-[120%] duration-1500 transition-all ease-in-out"></div>
          </div>
        )}

        <div className="flex justify-between items-start">
          <div 
            className={`w-12 h-12 rounded-full flex items-center justify-center bg-gradient-to-br ${color}`}
          >
            {icon}
          </div>

          {badge && (
            <Badge 
              className={`bg-white/90 text-xs font-medium ${
                badge === "Novo" 
                  ? "text-emerald-600" 
                  : badge === "Beta" 
                  ? "text-purple-600" 
                  : badge === "Popular" 
                  ? "text-blue-600"
                  : "text-amber-600"
              }`}
            >
              {badge}
            </Badge>
          )}
        </div>

        <div className="mt-4">
          <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            {title}
          </h3>
          <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
            {description}
          </p>
        </div>
      </div>
    </Card>
  );
}
