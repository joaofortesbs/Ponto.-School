import React, { useEffect, useState } from "react";
import { CoinsIcon, TrophyIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFlowSessions from "@/hooks/useFlowSessions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PontosProps {
  onViewChallenges?: () => void;
}

interface FlowSessionWithXP {
  id: string;
  date: Date;
  duration: string;
  elapsedTimeSeconds?: number;
  progress?: number;
  xpGained: number;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  const { sessions, getStats } = useFlowSessions();
  const [totalXp, setTotalXp] = useState(0);
  const [sessionsWithXP, setSessionsWithXP] = useState<FlowSessionWithXP[]>([]);

  useEffect(() => {
    // Calcular o total de XP baseado nas sessões de flow concluídas
    const calcularXpTotal = () => {
      let xp = 0;
      const sessionsXP: FlowSessionWithXP[] = [];
      
      sessions.forEach(session => {
        // Calcular XP baseado no tempo da sessão e progresso
        let sessionXP = 0;
        
        // Se o elapsedTimeSeconds estiver disponível, use-o para o cálculo
        if (session.elapsedTimeSeconds) {
          // 1 ponto para cada minuto, com bônus para progresso alto
          const minutos = Math.floor(session.elapsedTimeSeconds / 60);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          sessionXP = Math.round(minutos * progressoBonus);
        } else if (session.duration) {
          // Fallback para duração em formato de string (exemplo: "01:30:00")
          const parts = session.duration.split(':').map(Number);
          const minutos = (parts[0] || 0) * 60 + (parts[1] || 0);
          const progressoBonus = session.progress ? (session.progress / 100) : 1;
          sessionXP = Math.round(minutos * progressoBonus);
        }
        
        // Se tiver data, format para dd/MM
        sessionXP = Math.max(sessionXP, 5); // Mínimo de 5 pontos por sessão
        
        if (sessionXP > 0) {
          xp += sessionXP;
          
          sessionsXP.push({
            id: session.id || `session-${Math.random().toString(36).substr(2, 9)}`,
            date: session.date || new Date(),
            duration: session.duration || "00:00:00",
            elapsedTimeSeconds: session.elapsedTimeSeconds,
            progress: session.progress,
            xpGained: sessionXP
          });
        }
      });
      
      // Ordenar por data, do mais recente ao mais antigo
      sessionsXP.sort((a, b) => b.date.getTime() - a.date.getTime());
      
      setSessionsWithXP(sessionsXP);
      return xp;
    };
    
    setTotalXp(calcularXpTotal());
  }, [sessions]);

  return (
    <div className="h-full rounded-xl border border-gray-200 dark:border-[#0D2238]/40 bg-white dark:bg-gradient-to-b dark:from-[#001427]/80 dark:to-[#001427] shadow-sm overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center gap-2">
        <div className="bg-white/10 p-1.5 rounded-lg">
          <CoinsIcon className="h-4 w-4 text-white" />
        </div>
        <h3 className="font-bold text-white text-lg">Pontos</h3>
      </div>
      
      <div className="flex-1 p-4 flex flex-col">
        <div className="text-center mb-4">
          <div className="text-[#FF6B00] text-5xl font-bold mb-4">{totalXp}</div>
        </div>
        
        <div className="flex-1 overflow-auto">
          {sessionsWithXP.length > 0 ? (
            <div className="space-y-2">
              {sessionsWithXP.map((session) => (
                <div key={session.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-[#0D2238]/20 last:border-0">
                  <div className="flex items-center space-x-2">
                    <Clock className="h-4 w-4 text-[#FF6B00]" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Sessão de Flow: {session.duration}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className="text-xs text-gray-500 dark:text-gray-400 mr-1">
                      {format(session.date, "dd/MM", { locale: ptBR })}
                    </span>
                    <span className="text-sm font-medium text-green-600 dark:text-green-400">
                      +{session.xpGained}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400 text-sm">
              Complete sessões de Flow para ganhar pontos.
            </p>
          )}
        </div>
        
        <div className="mt-4">
          <Button 
            onClick={onViewChallenges}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
          >
            <TrophyIcon className="h-4 w-4 mr-2" /> Conquistas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pontos;