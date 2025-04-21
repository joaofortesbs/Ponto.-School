import React, { useState, createContext, useContext } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "@/components/ThemeProvider";
import { ArrowRight } from "lucide-react";

const TurboModeContext = createContext(false);

export const TurboModeProvider = ({ children }: { children: React.ReactNode }) => {
  const [isTurboMode, setIsTurboMode] = useState(false);
  return (
    <TurboModeContext.Provider value={{ isTurboMode, setIsTurboMode }}>
      {children}
    </TurboModeContext.Provider>
  );
};

export const useTurboMode = () => useContext(TurboModeContext);

export interface ChatCardProps {
  assistant: {
    id: string;
    title: string;
    description: string;
    icon: React.ReactNode;
    badge: string | null;
    buttonText: string;
    highlight?: boolean;
    onButtonClick?: () => void;
  };
}

export const ChatCard: React.FC<ChatCardProps> = ({ assistant }) => {
  const { theme } = useTheme();
  const { setIsTurboMode } = useTurboMode();

  const handleButtonClick = () => {
    setIsTurboMode(true);
    const contentSection = document.getElementById(`content-${assistant.id}`);
    if (contentSection) {
      contentSection.innerHTML = `
        <h2 style="text-align: center;">Epictus Turbo</h2>
        <p style="text-align: center;">Esta seção está em desenvolvimento</p>
      `;
    }
  };

  return (
    <Card
      key={assistant.id}
      className={`p-5 h-full border overflow-hidden group relative ${theme === "dark" ? "bg-gray-800/70 border-gray-700" : "bg-white border-gray-200"} hover:shadow-lg transition-all duration-300 hover:translate-y-[-2px] ${assistant.highlight ? "glow-effect" : ""}`}
      onMouseMove={(e) => {
        if (assistant.highlight) {
          const card = e.currentTarget;
          const rect = card.getBoundingClientRect();
          const x = (e.clientX - rect.left) / rect.width * 100;
          const y = (e.clientY - rect.top) / rect.height * 100;
          card.style.setProperty("--x", `${x}%`);
          card.style.setProperty("--y", `${y}%`);
        }
      }}
    >
      {assistant.highlight && (
        <>
          <div className="absolute inset-0 z-0 animate-pulse-slow rounded-lg border-2 border-blue-500/50 shadow-[0_0_15px_5px_rgba(59,130,246,0.3)]"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
          <div className="particle"></div>
        </>
      )}
      <div className="absolute -top-20 -right-20 w-40 h-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition-all duration-700"></div>

      <div className="flex justify-between items-start mb-4">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500/90 to-indigo-600/90 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform duration-300">
          {assistant.icon}
        </div>

        {assistant.badge && (
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white text-xs shadow-sm">
            {assistant.badge}
          </Badge>
        )}
      </div>

      <h3 className={`text-lg font-semibold mb-2 ${theme === "dark" ? "text-white" : "text-gray-900"} inline-block`}>
        <span className="relative">
          {assistant.title}
          <span className="absolute bottom-0 left-0 w-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600 group-hover:w-full transition-all duration-300"></span>
        </span>
      </h3>

      <p className={`text-sm mb-4 ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
        {assistant.description}
      </p>
      <div id={`content-${assistant.id}`}>{/* Content to be replaced */}
      </div>
      <div className="mt-4">
        <Button
          id={`button-${assistant.id}`}
          className={cn(
            "w-full",
            assistant.highlight
              ? "bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] hover:from-[#FF9B50] hover:to-[#FF6B00] text-white"
              : theme === "dark"
              ? "bg-gray-700 text-white hover:bg-gray-600"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          )}
          onClick={() => {
            console.log(`Botão ${assistant.id} clicado`);
            if (assistant.onButtonClick) {
              assistant.onButtonClick();
            } else {
              handleButtonClick();
            }
          }}
        >
          {assistant.buttonText}
        </Button>
      </div>
    </Card>
  );
};