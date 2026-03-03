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
          "flex items-center justify-between border border-gray-200 dark:border-gray-800/50 transition-all duration-300 backdrop-blur-sm relative z-20",
          "bg-white dark:bg-[#29335C]/20",
          isCollapsed
            ? "w-12 h-12 p-0 justify-center rounded-2xl"
            : "w-full h-auto py-0 px-4 rounded-full"
        )}
      >
        {/* Image container — both images always in DOM, opacity-toggled for instant swap */}
        <div className={cn(
          "relative flex items-center justify-center overflow-hidden",
          isCollapsed ? "w-full h-full" : "flex-1"
        )}>
          {/* Ícone — visível apenas no estado collapsed */}
          <img
            src="/lovable-uploads/Logo-Ponto.School-Icone.webp"
            alt="Ponto School Ícone"
            className={cn(
              "object-contain transition-opacity duration-150",
              isCollapsed
                ? "opacity-100 relative h-8 w-8"
                : "opacity-0 pointer-events-none absolute inset-0 h-8 w-8 m-auto"
            )}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              if (isCollapsed) {
                const fallback = document.createElement("span");
                fallback.className = "font-bold text-sm text-[#FF6B00]";
                fallback.textContent = "S";
                e.currentTarget.parentNode?.appendChild(fallback);
              }
            }}
          />

          {/* Logo completo — visível apenas no estado expandido */}
          <img
            src="/lovable-uploads/Logo-Ponto. School.webp"
            alt="Ponto School Logo"
            className={cn(
              "object-contain transition-opacity duration-150",
              !isCollapsed
                ? "opacity-100 relative h-16 w-auto"
                : "opacity-0 pointer-events-none absolute inset-0 h-16 w-auto m-auto"
            )}
            loading="eager"
            fetchPriority="high"
            onError={(e) => {
              e.currentTarget.style.display = "none";
              if (!isCollapsed) {
                const fallbackText = document.createElement("span");
                fallbackText.className = "font-bold text-xs text-[#001427] dark:text-white";
                fallbackText.innerHTML = 'Ponto<span class="text-[#FF6B00]">.</span>School';
                e.currentTarget.parentNode?.appendChild(fallbackText);
              }
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
