import React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

interface CardSelecaoPerfilTopoMenuProps {
  isCollapsed: boolean;
  customLogo?: string | null;
}

export const CardSelecaoPerfilTopoMenu: React.FC<CardSelecaoPerfilTopoMenuProps> = ({
  isCollapsed,
  customLogo,
}) => {
  const collapsedLogoSrc = "/lovable-uploads/Logo-Ponto.School-Icone.webp";
  const expandedLogoSrc = customLogo || "/lovable-uploads/Logo-Ponto.School.webp";

  return (
    <div
      className={cn(
        "flex items-center justify-center transition-all duration-300",
        isCollapsed ? "px-2" : "px-3"
      )}
    >
      <div
        className={cn(
          "flex items-center justify-between bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] rounded-full transition-all duration-300 shadow-lg",
          isCollapsed 
            ? "w-12 h-12 p-1 justify-center" 
            : "w-full h-11 px-4"
        )}
      >
        <div className={cn(
          "flex items-center justify-center",
          isCollapsed ? "w-full" : "flex-1"
        )}>
          <img
            src={isCollapsed ? collapsedLogoSrc : expandedLogoSrc}
            alt="Ponto School Logo"
            className={cn(
              "object-contain transition-all duration-300",
              isCollapsed ? "h-8 w-8" : "h-7 w-auto"
            )}
            loading="eager"
            onError={(e) => {
              console.error("Erro ao renderizar logo no CardSelecaoPerfilTopoMenu");
              e.currentTarget.style.display = "none";
              const fallbackText = document.createElement("span");
              fallbackText.className = "font-bold text-sm text-white";
              fallbackText.innerHTML = 'Ponto<span class="text-white">.</span><span class="text-white">School</span>';
              e.currentTarget.parentNode?.appendChild(fallbackText);
            }}
          />
        </div>
        
        {!isCollapsed && (
          <div className="flex items-center justify-center ml-2">
            <ChevronDown className="h-4 w-4 text-white" strokeWidth={2.5} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CardSelecaoPerfilTopoMenu;
