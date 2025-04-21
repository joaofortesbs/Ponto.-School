
import React from "react";
import { Zap } from "lucide-react";
import { ChatCard } from "./ChatCard";
import { useTurboMode } from "../../../context/TurboModeContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/ThemeProvider";

export const EpictusTurboCard: React.FC = () => {
  const { activateTurboMode } = useTurboMode();
  const { theme } = useTheme();

  const handleTurboClick = () => {
    console.log("🚀 TURBO: Botão Usar Turbo clicado! Ativando modo turbo...");
    activateTurboMode();
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
    onButtonClick: handleTurboClick,
    secondaryButton: (
      <Button
        id="button-activate-turbo"
        className={cn(
          "w-full mt-2",
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
