
import React, { useEffect, useState } from "react";
import { CoinsIcon, TrophyIcon, ClockIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFlowSessions from "@/hooks/useFlowSessions";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PontosProps {
  onViewChallenges?: () => void;
}

interface XpByHour {
  hour: string;
  xp: number;
  timestamp: number;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  const { sessions, getStats } = useFlowSessions();
  const [totalXp, setTotalXp] = useState(0);
  const [xpByHour, setXpByHour] = useState<XpByHour[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    // Calcular o total de XP baseado nas sessões de flow concluídas
    const calcularXpTotal = () => {
      let xp = 0;
      const xpPorHora: XpByHour[] = [];
      
      sessions.forEach(session => {
        // Timestamp da sessão
        const timestamp = session.timestamp 
          ? new Date(session.timestamp).getTime() 
          : session.date 
            ? new Date(session.date.split('/').reverse().join('-')).getTime()
            : Date.now();
            
        // Calcular XP baseado no tempo da sessão e progresso
        let sessionXp = 0;
        if (session.elapsedTimeSeconds) {
          // 1 ponto para cada minuto, com bônus para progresso alto
          const minutos = Math.floor(session.elapsedTimeSeconds / 60);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          sessionXp = Math.round(minutos * progressoBonus);
        } else if (session.duration) {
          // Fallback para duração em formato de string (exemplo: "01:30:00")
          const parts = session.duration.split(':').map(Number);
          const minutos = (parts[0] || 0) * 60 + (parts[1] || 0);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          sessionXp = Math.round(minutos * progressoBonus);
        }
        
        // Adicionar ao total
        xp += sessionXp;
        
        // Adicionar ao histórico por hora
        if (sessionXp > 0) {
          const hora = format(new Date(timestamp), 'HH:mm', { locale: ptBR });
          const data = format(new Date(timestamp), 'dd/MM/yyyy', { locale: ptBR });
          
          xpPorHora.push({
            hour: `${data} às ${hora}`,
            xp: sessionXp,
            timestamp
          });
        }
      });
      
      // Ordenar por timestamp (mais recente primeiro)
      xpPorHora.sort((a, b) => b.timestamp - a.timestamp);
      
      setXpByHour(xpPorHora);
      return xp;
    };
    
    setTotalXp(calcularXpTotal());
  }, [sessions]);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-[#0D2238]/50 metrics-card light-mode-card">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <CoinsIcon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Pontos</h3>
        </div>
        {xpByHour.length > 0 && (
          <Button 
            variant="ghost" 
            size="sm" 
            className="p-1 h-auto text-white hover:bg-white/10"
            onClick={() => setShowHistory(!showHistory)}
          >
            <ClockIcon className="h-3.5 w-3.5" />
            <span className="ml-1 text-xs">{showHistory ? "Esconder" : "Histórico"}</span>
          </Button>
        )}
      </div>
      
      {!showHistory ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-gray-100 dark:bg-gradient-to-br dark:from-[#0D2238] dark:to-[#0D2238]/70 p-4 rounded-full mb-3 shadow-inner">
            <CoinsIcon className="h-8 w-8 text-[#FF6B00] dark:text-[#FF6B00]" />
          </div>
          <p className="text-gray-800 dark:text-white text-sm font-medium mb-1">
            {totalXp} {totalXp === 1 ? 'ponto' : 'pontos'}
          </p>
          <p className="text-gray-500 dark:text-[#8393A0] text-xs mb-4">
            Complete sessões de Flow e ganhe pontos baseados no seu desempenho!
          </p>
          <Button 
            onClick={onViewChallenges}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
          >
            <TrophyIcon className="h-4 w-4 mr-2" /> Conquistas
          </Button>
        </div>
      ) : (
        <div className="flex-1 p-3">
          <div className="text-center mb-4">
            <p className="text-gray-800 dark:text-white font-medium">
              Total: {totalXp} XP
            </p>
          </div>
          
          <div className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5 px-1">
            Histórico de pontos ganhos:
          </div>
          
          <ScrollArea className="h-[calc(100%-4.5rem)]">
            <div className="space-y-2">
              {xpByHour.map((item, idx) => (
                <div 
                  key={idx} 
                  className="flex items-center justify-between bg-gray-50 dark:bg-[#0D2238]/50 p-2 rounded-md"
                >
                  <div className="flex items-center">
                    <div className="bg-orange-100 dark:bg-orange-900/30 p-1 rounded-md mr-2">
                      <CoinsIcon className="h-3 w-3 text-[#FF6B00]" />
                    </div>
                    <span className="text-xs text-gray-600 dark:text-gray-300">
                      {item.hour}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#FF6B00]">+{item.xp} XP</span>
                </div>
              ))}
              
              {xpByHour.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400 text-xs">
                  Nenhum ponto ganho recentemente
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default Pontos;
