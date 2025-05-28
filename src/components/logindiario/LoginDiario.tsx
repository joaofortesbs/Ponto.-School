
import React from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Award } from "lucide-react";

interface LoginDiarioProps {
  onClick?: () => void;
}

const LoginDiario: React.FC<LoginDiarioProps> = ({ onClick }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative hover:bg-brand-card dark:hover:bg-white/5 group transition-all duration-300"
            aria-label="Login Diário"
            onClick={onClick || (() => {
              console.log("Login diário realizado!");
            })}
          >
            <Award className="h-5 w-5 text-brand-black dark:text-white group-hover:text-[#FF6B00] transition-colors duration-300 group-hover:animate-pulse" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <p className="font-semibold">Login Diário</p>
            <p className="text-xs text-muted-foreground">Marque sua presença diária</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default LoginDiario;
