
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Award } from "lucide-react";
import RoletaRecompensasModal from "./RoletaRecompensasModal";

interface LoginDiarioProps {
  onClick?: () => void;
}

const LoginDiario: React.FC<LoginDiarioProps> = ({ onClick }) => {
  const [showModal, setShowModal] = useState(false);

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
    setShowModal(true);
  };

  return (
    <>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="relative group transition-all duration-300 bg-gradient-to-r from-orange-100/80 to-orange-200/60 dark:from-orange-900/30 dark:to-orange-800/20 hover:from-orange-200/90 hover:to-orange-300/70 dark:hover:from-orange-800/40 dark:hover:to-orange-700/30 border border-orange-200/50 dark:border-orange-700/30 hover:border-orange-300/70 dark:hover:border-orange-600/50 rounded-lg backdrop-blur-sm"
              aria-label="Login Diário"
              onClick={handleClick}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#FF6B00]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
              <Award className="h-5 w-5 text-[#FF6B00] group-hover:text-[#FF8C40] transition-all duration-300 group-hover:scale-110 group-hover:drop-shadow-lg relative z-10" />
              
              {/* Indicador de giro disponível */}
              <div className="absolute -top-1 -right-1 h-3 w-3 bg-[#FF6B00] rounded-full animate-pulse"></div>
              
              {/* Efeito de brilho sutil */}
              <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-[#FF6B00]/10 via-transparent to-[#FF8C40]/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              
              {/* Efeito de partículas pequenas */}
              <div className="absolute -top-0.5 -right-0.5 h-1 w-1 bg-[#FF6B00] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-300 animate-pulse"></div>
              <div className="absolute -bottom-0.5 -left-0.5 h-0.5 w-0.5 bg-[#FF8C40] rounded-full opacity-0 group-hover:opacity-100 transition-all duration-500 animate-pulse delay-200"></div>
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="text-center">
              <p className="font-semibold text-[#FF6B00]">Login Diário</p>
              <p className="text-xs text-muted-foreground">Gire a roleta e ganhe recompensas!</p>
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <RoletaRecompensasModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
      />
    </>
  );
};

export default LoginDiario;
