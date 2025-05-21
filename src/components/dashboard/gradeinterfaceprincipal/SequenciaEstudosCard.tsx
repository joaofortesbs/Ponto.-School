
import React from "react";
import { Flame, Award, ArrowRight } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

export default function SequenciaEstudosCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  // Dados de exemplo - Em produção viriam da API ou context
  const diasConsecutivos = 5;
  const recordeDias = 15;
  const proximaRecompensa = "Badge Explorador Dedicado";

  return (
    <div className={`rounded-xl overflow-hidden ${isLightMode ? 'bg-[#1E3A8A]' : 'bg-[#0A2144]'} shadow-lg relative h-full`}>
      {/* Ilustração de fundo - Representação da caverna */}
      <div className="absolute inset-0 overflow-hidden opacity-20">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-24">
          <div className="w-full h-full rounded-full bg-gradient-radial from-orange-500 via-red-500 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
        </div>
        <div className="absolute bottom-0 w-full h-40 bg-gradient-to-t from-black to-transparent"></div>
      </div>

      <div className="p-5 relative z-10 flex flex-col h-full">
        <div className="mb-6 flex-grow">
          <h3 className="font-bold text-xl text-white mb-6">
            Sua Sequência de Estudos!
          </h3>
          
          <div className="flex flex-col items-center mb-4">
            <div className="flex items-center justify-center p-4 rounded-full bg-[#FF6B00]/20 mb-2">
              <Flame className="h-8 w-8 text-[#FF6B00] animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
            <div className="text-center">
              <p className="text-gray-200 text-sm mb-1">Você está há</p>
              <p className="text-4xl font-bold text-[#FF6B00] mb-1">{diasConsecutivos}</p>
              <p className="text-gray-200 text-sm">dias consecutivos estudando!</p>
            </div>
          </div>
          
          <div className="space-y-2 text-center">
            <p className="text-xs text-gray-300 flex items-center justify-center">
              <Award className="h-3 w-3 mr-1 text-yellow-400" />
              <span>Seu recorde: <span className="font-medium">{recordeDias} dias</span></span>
            </p>
            <p className="text-xs text-gray-300">
              Continue assim para desbloquear: <span className="font-medium text-[#FF6B00]">{proximaRecompensa}</span>
            </p>
          </div>
        </div>
        
        <button className="flex items-center justify-center text-white text-sm bg-[#FF6B00]/80 hover:bg-[#FF6B00] py-2 px-4 rounded-md transition-colors mt-2 w-full">
          <span>Entrar no Modo Caverna</span>
          <ArrowRight className="h-4 w-4 ml-1" />
        </button>
      </div>
    </div>
  );
}
