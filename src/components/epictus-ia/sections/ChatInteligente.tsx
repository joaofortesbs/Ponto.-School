import React, { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useTheme } from "@/components/ThemeProvider";
import { useLocation } from "react-router-dom";
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

export default function ChatInteligente() {
  const { theme } = useTheme();
  const location = useLocation();
  const [isTurboMode, setIsTurboMode] = useState(false);

  useEffect(() => {
    // Check if turbo mode is activated via URL parameter or localStorage
    const urlParams = new URLSearchParams(location.search);
    const turboParam = urlParams.get('turbo');
    const storedTurboState = localStorage.getItem('epictus-turbo-active');

    if (turboParam === 'active' || storedTurboState === 'true') {
      setIsTurboMode(true);
    } else {
      setIsTurboMode(false);
      // Clear localStorage if turbo mode is not active
      localStorage.removeItem('epictus-turbo-active');
    }
  }, [location]);

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
        <div className="flex flex-col items-center">
          <h2 className="text-4xl font-bold mt-8 mb-6 text-center font-montserrat"
              style={{
                background: 'linear-gradient(to right, #1E3A8A, #F97316)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 10px rgba(249, 115, 22, 0.5)'
              }}>
            Epictus Turbo
          </h2>
          <div className="relative flex items-center justify-center h-[400px] w-full">
            <p className={`text-2xl ${theme === "dark" ? "text-gray-300" : "text-gray-700"}`}>
              Esta seção está em desenvolvimento
            </p>
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
}