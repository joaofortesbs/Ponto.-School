import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CardSelecaoPerfilTopoMenuProps {
  isCollapsed: boolean;
}

export const CardSelecaoPerfilTopoMenu: React.FC<CardSelecaoPerfilTopoMenuProps> = ({
  isCollapsed,
}) => {
  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300 relative z-20",
        isCollapsed ? "px-2 mt-3 mb-3.5" : "px-4 mt-4 mb-3.5"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between border border-gray-200 dark:border-gray-800/50 rounded-full transition-all duration-300 backdrop-blur-sm relative z-20",
          "bg-white dark:bg-[#29335C]/20",
          isCollapsed 
            ? "w-12 h-12 p-1 justify-center" 
            : "w-full h-auto py-3 px-4"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          isCollapsed ? "w-full" : "flex-1"
        )}>
          <img
            src="/lovable-uploads/Logo-Ponto. School.webp"
            alt="Ponto School Logo"
            className={cn(
              "object-contain transition-all duration-300",
              isCollapsed ? "h-12 w-12" : "h-14 w-auto"
            )}
            loading="eager"
            onError={(e) => {
              console.error("Erro ao renderizar logo no CardSelecaoPerfilTopoMenu");
              e.currentTarget.style.display = "none";
              const fallbackText = document.createElement("span");
              fallbackText.className = "font-bold text-xs text-[#001427] dark:text-white";
              fallbackText.innerHTML = 'Ponto<span class="text-[#FF6B00]">.</span>School';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
        </div>
        
        {!isCollapsed && (
          <div className="flex items-center justify-center ml-2">
            <ChevronDown className="h-4 w-4 text-[#FF6B00]" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSelecaoPerfilTopoMenu;
