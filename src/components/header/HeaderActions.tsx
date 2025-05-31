
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserPlus } from "lucide-react";
import LoginDiario from "../logindiario/LoginDiario";

interface HeaderActionsProps {
  onAdicionarParceirosClick?: () => void;
}

const HeaderActions: React.FC<HeaderActionsProps> = ({ onAdicionarParceirosClick }) => {
  const handleAdicionarParceirosClick = () => {
    console.log("Adicionar Parceiros clicado!");
    if (onAdicionarParceirosClick) {
      onAdicionarParceirosClick();
    }
  };

  return (
    <div className="flex items-center gap-3">
      {/* Botão Adicionar Parceiros */}
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative group transition-all duration-300 bg-gradient-to-r from-blue-100/80 to-blue-200/60 dark:from-blue-900/30 dark:to-blue-800/20 hover:from-blue-200/90 hover:to-blue-300/70 dark:hover:from-blue-800/40 dark:hover:to-blue-700/30 border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-300/70 dark:hover:border-blue-600/50 rounded-lg backdrop-blur-sm"
              aria-label="Adicionar Parceiros"
              onClick={handleAdicionarParceirosClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <UserPlus className="h-5 w-5 text-blue-600 group-hover:text-blue-700 transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg relative z-10" />
              
              {/* Efeito de brilho sutil */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-blue-600/10 via-transparent to-blue-700/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Efeito de partículas pequenas */}
              <div className="absolute -top-0.5 -right-0.5 h-1 w-1 bg-blue-600 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="absolute -bottom-0.5 -left-0.5 h-0.5 w-0.5 bg-blue-700 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse delay-200"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold text-blue-600">Adicionar Parceiros</p>
              <p className="text-xs text-muted-foreground">Conecte-se com outros usuários</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {/* Login Diário */}
      <LoginDiario />
    </div>
  );
};

export default HeaderActions;
