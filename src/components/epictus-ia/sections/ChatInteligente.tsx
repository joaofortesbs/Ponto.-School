
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
import EpictusChatHeader from "@/components/epictus-ia/EpictusChatHeader";

export default function ChatInteligente() {
  const { theme } = useTheme();
  const [epictusMode, setEpictusMode] = useState(false);
  
  // Manipular o evento personalizado do EpictusIACard
  useEffect(() => {
    const handleActivateEpictus = () => {
      setEpictusMode(true);
    };
    
    window.addEventListener('activateEpictusMode', handleActivateEpictus);
    
    return () => {
      window.removeEventListener('activateEpictusMode', handleActivateEpictus);
    };
  }, []);

  return (
    <div className="h-full flex flex-col">
      {epictusMode ? (
        <div className="w-full h-full flex flex-col">
          {/* Barra de navegação para voltar */}
          <div className="flex items-center mb-4">
            <Button 
              variant="ghost" 
              size="sm" 
              className="flex items-center gap-1 text-sm" 
              onClick={() => setEpictusMode(false)}
            >
              <ArrowLeft className="h-4 w-4" /> Voltar para Chat Inteligente
            </Button>
          </div>
          
          {/* Área de conteúdo do Epictus IA */}
          <div className="flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-transparent to-orange-50/10 dark:to-orange-950/10 rounded-lg border border-orange-100/20 dark:border-orange-900/20">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] flex items-center justify-center mb-4">
              <span className="text-white font-bold text-2xl">IA</span>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-center">Epictus IA ativado</h2>
            <p className="text-center text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              Experimente como é receber uma aula de conteúdos que nem as instituições mais renomadas do Brasil conseguiriam te entregar, personalizado para você!
            </p>
            <div className="flex space-x-4">
              <Button className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FFA366] text-white">
                Iniciar conversa
              </Button>
              <Button variant="outline" className="border-orange-300 dark:border-orange-800 hover:bg-orange-50 dark:hover:bg-orange-950/50">
                Ver tutoriais
              </Button>
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
            <EpictusIACard onActivateEpictus={() => setEpictusMode(true)} />
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
