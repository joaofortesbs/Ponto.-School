
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
import { useTurboMode } from "../context/TurboModeContext";
import { motion } from "framer-motion";

export default function ChatInteligente() {
  const { theme } = useTheme();
  const { isTurboMode } = useTurboMode();
  
  console.log("ChatInteligente renderizado - Modo Turbo:", isTurboMode);

  const renderHeader = () => (
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
  );

  const renderTurboMode = () => (
    <div className="flex flex-col items-center justify-center h-[calc(100vh-300px)]">
      <motion.h1 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-bold text-center mb-8 font-montserrat bg-gradient-to-r from-[#FF6B00] to-[#FF9B50] text-transparent bg-clip-text"
      >
        <Zap className="inline-block mr-2 h-8 w-8 text-[#FF6B00]" />
        Epictus Turbo
      </motion.h1>
      
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className={`text-2xl text-center ${theme === "dark" ? "text-gray-300" : "text-gray-600"} max-w-xl`}
      >
        Esta seção está em desenvolvimento
      </motion.div>
    </div>
  );

  const renderDefaultContent = () => (
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
  );

  return (
    <div className="h-full flex flex-col">
      {renderHeader()}
      {isTurboMode ? renderTurboMode() : renderDefaultContent()}
    </div>
  );
}
