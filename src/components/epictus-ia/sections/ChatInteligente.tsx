
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

          <div className="mt-6 flex-1">
            <Card className={`p-5 border ${theme === "dark" ? "bg-gray-800/50 border-gray-700" : "bg-gray-50 border-gray-200"}`}>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-md">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className={`text-lg font-semibold ${theme === "dark" ? "text-white" : "text-gray-900"} flex items-center`}>
                    <span className="relative">
                      Novidade: Assistente com Memória Avançada
                      <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-blue-500 to-indigo-600"></span>
                    </span>
                  </h3>
                  <p className={`text-sm ${theme === "dark" ? "text-gray-400" : "text-gray-600"}`}>
                    Agora nossos assistentes aprendem com suas interações anteriores, lembrando de suas preferências e adaptando respostas de acordo com seu histórico de conversas.
                  </p>
                  <div className="mt-4 flex items-center gap-2">
                    <Button variant="outline" className={`${theme === "dark" ? "border-gray-700 hover:bg-gray-700" : "border-gray-200 hover:bg-gray-100"}`}>
                      Saiba mais
                    </Button>
                    <Button className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white">
                      Experimentar <Sparkles className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};
