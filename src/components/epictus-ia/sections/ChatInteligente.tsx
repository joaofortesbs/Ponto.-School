
import React from "react";
import { Card } from "@/components/ui/card";
import { useTheme } from "@/components/ThemeProvider";
import { 
  MessageSquare,
  Zap
} from "lucide-react";
import { 
  EpictusTurboCard,
  EpictusIACard, 
  TutorInteligenteCard, 
  BrainstormCard 
} from "./components/chat-inteligente";
import { TurboModeProvider, useTurboMode } from "../context/TurboModeContext";

const ChatInteligenteContent: React.FC = () => {
  const { theme } = useTheme();
  const { isTurboModeActive, deactivateTurboMode } = useTurboMode();

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <h2 className={`text-2xl font-bold ${theme === "dark" ? "text-white" : "text-gray-900"}`}>
            Chat Inteligente
          </h2>
        </div>
        <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"} ml-[60px]`}>
          Escolha o assistente ideal para suas necessidades de aprendizado
        </p>
      </div>

      {isTurboModeActive ? (
        <div className="flex-1 overflow-auto">
          <div className="flex flex-col items-center justify-center py-8">
            <h1 className="text-4xl font-bold mb-6 text-center bg-gradient-to-r from-[#1E3A8A] to-[#F97316] text-transparent bg-clip-text font-sans" style={{ textShadow: "0 0 10px rgba(249, 115, 22, 0.5)" }}>
              Epictus Turbo
            </h1>
            <p className="text-2xl text-gray-300 text-center mb-6">
              Esta seção está em desenvolvimento
            </p>
            <button 
              onClick={deactivateTurboMode}
              className="px-6 py-2.5 bg-gradient-to-r from-[#1E3A8A] to-[#F97316] text-white rounded-full hover:opacity-90 transition-opacity"
            >
              Voltar
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <EpictusTurboCard />
          <EpictusIACard />
          <TutorInteligenteCard />
          <BrainstormCard />
        </div>
      )}
    </div>
  );
};

export default function ChatInteligente() {
  return (
    <TurboModeProvider>
      <ChatInteligenteContent />
    </TurboModeProvider>
  );
}
