import React, { useEffect } from "react";
import { Zap, ZapOff } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useTurboMode } from "../../../context/TurboModeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export const EpictusTurboCard: React.FC = () => {
  const { activateTurboMode, isTurboMode } = useTurboMode();
  const { theme } = useTheme();

  // Versão aprimorada com feedback visual
  const handleTurboClick = () => {
    console.log("🚀 TURBO: Botão Usar Turbo clicado! Ativando modo turbo...");

    // Efeito visual antes de ativar
    const button = document.getElementById("button-usar-turbo");
    if (button) {
      button.classList.add("animate-pulse");
      setTimeout(() => {
        button.classList.remove("animate-pulse");
        // Ativando o modo turbo após o efeito visual
        activateTurboMode();
      }, 300);
    } else {
      // Fallback caso o botão não seja encontrado
      activateTurboMode();
    }
  };

  const handleActivateTurboClick = () => {
    console.log("🔥 TURBO: Botão Ativar Turbo clicado! Ativando modo turbo alternativo...");
    activateTurboMode();
  };

  const assistantData = {
    id: "epictus-turbo",
    title: "Epictus Turbo",
    description: "O único Agente de IA que você precisa para ter o boletim e desempenho dos sonhos, com apenas um comando, a revolução da educação começa aqui!",
    icon: <Zap className="h-6 w-6 text-white" />,
    badge: "Único",
    buttonText: "Usar Turbo",
    highlight: true,
    buttonId: "button-usar-turbo", // ID único para o botão principal
    onButtonClick: handleTurboClick,
    secondaryButton: (
      <Button
        id="button-activate-turbo"
        className={cn(
          "w-full mt-2 transition-all duration-300",
          theme === "dark"
            ? "bg-amber-600 text-white hover:bg-amber-500"
            : "bg-amber-500 text-white hover:bg-amber-400"
        )}
        onClick={handleActivateTurboClick}
      >
        Ativar Turbo
      </Button>
    )
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-xl pointer-events-none"></div>
      <ChatCard assistant={assistantData} />
    </div>
  );
};