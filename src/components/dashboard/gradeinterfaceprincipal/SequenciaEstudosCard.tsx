
import React from "react";
import { Flame, Award, TrendingUp, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useTheme } from "@/components/ThemeProvider";
import { Button } from "@/components/ui/button";

export default function SequenciaEstudosCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  
  // Dados de exemplo - Em produção viriam da API ou context
  const diasConsecutivos = 5;
  const recordeDias = 15;
  const proximaRecompensa = "Badge Explorador Dedicado";
  const diasParaProximoNivel = 2;

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="h-full w-full rounded-xl overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-xl transition-all duration-300 bg-white dark:bg-gradient-to-b dark:from-[#0c1425] dark:to-[#0a1a2e]"
    >
      {/* Cabeçalho estilizado */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-4 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <Flame className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Sua Sequência de Estudos!</h3>
        </div>
        <Button 
          variant="link" 
          size="sm" 
          className="text-white/80 hover:text-white p-0 h-6"
        >
          <span className="text-xs">Detalhes</span>
          <ExternalLink className="h-3 w-3 ml-1" />
        </Button>
      </div>

      {/* Conteúdo do card */}
      <div className="p-5 relative z-10 flex flex-col h-[calc(100%-60px)] justify-between">
        {/* Ilustração de fundo */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 w-20 h-20 opacity-10 pointer-events-none">
          <div className="w-full h-full rounded-full bg-gradient-radial from-orange-500 via-red-500 to-transparent animate-pulse" style={{ animationDuration: '3s' }}></div>
        </div>
        
        {/* Estatísticas principais */}
        <div className="flex flex-col items-center mb-4 mt-2 relative">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#FF6B00]/20 to-[#FF8C40]/20 blur-md"></div>
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] mb-2 relative">
              <Flame className="h-8 w-8 text-white animate-pulse" style={{ animationDuration: '2s' }} />
            </div>
          </div>
          
          <div className="text-center mt-3">
            <p className="text-gray-500 dark:text-gray-400 text-sm mb-1">Você está há</p>
            <p className="text-4xl font-bold text-[#FF6B00] mb-1">{diasConsecutivos}</p>
            <p className="text-gray-500 dark:text-gray-400 text-sm">dias consecutivos estudando!</p>
          </div>
        </div>
        
        {/* Informações adicionais */}
        <div className="space-y-4 mt-1">
          {/* Progresso para o próximo nível */}
          <div className="bg-gray-100 dark:bg-[#14253d] rounded-lg p-3">
            <div className="flex justify-between items-center mb-1.5">
              <span className="text-xs text-gray-500 dark:text-gray-400">Próximo nível</span>
              <span className="text-xs font-medium text-[#FF6B00]">+{diasParaProximoNivel} dias</span>
            </div>
            <div className="w-full h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]" 
                style={{ width: `${(diasConsecutivos / (diasConsecutivos + diasParaProximoNivel)) * 100}%` }}
              />
            </div>
          </div>
          
          {/* Recorde e recompensa */}
          <div className="flex flex-col gap-2 text-center">
            <div className="flex items-center justify-center text-xs text-gray-500 dark:text-gray-400">
              <Award className="h-3.5 w-3.5 mr-1 text-yellow-400" />
              <span>Seu recorde: <span className="font-medium text-gray-600 dark:text-gray-300">{recordeDias} dias</span></span>
            </div>
            
            <div className="flex items-center justify-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <TrendingUp className="h-3 w-3 text-emerald-500" />
              <span>Próxima recompensa:</span>
            </div>
            <span className="text-xs font-medium text-[#FF6B00]">{proximaRecompensa}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
