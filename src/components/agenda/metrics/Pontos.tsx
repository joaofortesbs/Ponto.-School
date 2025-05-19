
import React, { useEffect, useState } from "react";
import { CoinsIcon, TrophyIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFlowSessions from "@/hooks/useFlowSessions";

interface PontosProps {
  onViewChallenges?: () => void;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  const { sessions, getStats } = useFlowSessions();
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    // Calcular o total de XP baseado nas sessões de flow concluídas
    const calcularXpTotal = () => {
      let xp = 0;
      
      sessions.forEach(session => {
        // Calcular XP baseado no tempo da sessão e progresso
        // Se o elapsedTimeSeconds estiver disponível, use-o para o cálculo
        if (session.elapsedTimeSeconds) {
          // 1 ponto para cada minuto, com bônus para progresso alto
          const minutos = Math.floor(session.elapsedTimeSeconds / 60);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          xp += Math.round(minutos * progressoBonus);
        } else if (session.duration) {
          // Fallback para duração em formato de string (exemplo: "01:30:00")
          const parts = session.duration.split(':').map(Number);
          const minutos = (parts[0] || 0) * 60 + (parts[1] || 0);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          xp += Math.round(minutos * progressoBonus);
        }
      });
      
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
      </div>
      
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
    </div>
  );
};

export default Pontos;
