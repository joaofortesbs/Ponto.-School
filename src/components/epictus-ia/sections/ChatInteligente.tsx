import React, { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { 
  MessageSquare,
  Brain,
  Sparkles,
  ArrowLeft
} from "lucide-react";
import { 
  TutorInteligenteCard, 
  BrainstormCard,
  TutorInteligente2Card,
  EpictusIACard
} from "./components/chat-inteligente";
import EpictusIAMode from "@/components/epictus-ia/EpictusIAMode";

export default function ChatInteligente() {
  const { theme } = useTheme();
  const [epictusMode, setEpictusMode] = useState(false);

  // Verificar se o modo está ativado via URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('mode') === 'epictus') {
      setEpictusMode(true);
    }

    // Ouvir o evento de ativação do modo Epictus
    const handleEpictusActivation = (event: any) => {
      if (event.detail && event.detail.activated) {
        setEpictusMode(true);
      }
    };

    window.addEventListener('activateEpictusMode', handleEpictusActivation);

    return () => {
      window.removeEventListener('activateEpictusMode', handleEpictusActivation);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {epictusMode ? (
        <div className="w-full h-full flex flex-col">
          {/* Barra de navegação para voltar */}
          <div className="w-full p-2">
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-1 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => {
                setEpictusMode(false);
                window.history.pushState({}, "", "/epictus-ia");
              }}
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Cards
            </Button>
          </div>

          {/* Interface do modo Epictus IA sem cabeçalho fixo */}
          <div className="flex-grow overflow-hidden">
            <div className="h-full">
              <EpictusIAMode />
            </div>
          </div>
        </div>
      ) : (
        <>
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <TutorInteligente2Card />
            <EpictusIACard />
            <TutorInteligenteCard />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
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
}