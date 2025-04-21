import React from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { 
  MessageSquare,
  Brain,
  Sparkles,
  Zap
} from "lucide-react";
import { 
  EpictusTurboCard,
  EpictusIACard, 
  TutorInteligenteCard, 
  BrainstormCard 
} from "./components/chat-inteligente";
import { TurboModeProvider, useTurboMode } from "../context/TurboModeContext";

// Wrapper component that provides the TurboModeContext
export default function ChatInteligente() {
  return (
    <TurboModeProvider>
      <ChatInteligentContent />
    </TurboModeProvider>
  );
}

// Inner component that uses the TurboModeContext
const ChatInteligentContent: React.FC = () => {
  const { theme } = useTheme();
  const { isTurboMode, setTurboMode } = useTurboMode();

  return (
    <div className="h-full flex flex-col">
      {isTurboMode ? (
        <div className="flex-1 flex flex-col items-center">
          <h1 className="text-4xl font-bold mt-8 mb-6 text-center font-montserrat bg-gradient-to-r from-[#1E3A8A] to-[#F97316] text-transparent bg-clip-text" style={{ 
            textShadow: "0 0 10px rgba(249, 115, 22, 0.5)",
            fontSize: "40px",
            paddingBottom: "20px"
          }}>
            Epictus Turbo
          </h1>
          <div className="flex items-center gap-3 justify-center">
            <Zap className="h-10 w-10 text-[#F97316]" />
          </div>
          <p className="text-2xl text-center mt-8 text-gray-200 font-poppins">
            Esta seção está em desenvolvimento
          </p>
          <button 
            onClick={() => setTurboMode(false)}
            className="mt-8 px-4 py-2 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-md hover:from-blue-600 hover:to-indigo-700 transition-all"
          >
            Voltar
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <EpictusTurboCard />
            <EpictusIACard />
            <TutorInteligenteCard />
            <BrainstormCard />
          </div>
        </>
      )}
    </div>
  );
};