import React, { useEffect, useState } from "react";
import { ExternalLinkIcon, TrophyIcon, Clock, Target, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import useFlowSessions from "@/hooks/useFlowSessions";

interface PontosProps {
  onViewDetails?: () => void;
  onViewChallenges?: () => void;
}

const Pontos: React.FC<PontosProps> = ({ onViewDetails, onViewChallenges }) => {
  const { sessions } = useFlowSessions();
  const [totalPoints, setTotalPoints] = useState(0);
  const [recentPoints, setRecentPoints] = useState<{date: string, points: number, reason: string}[]>([]);

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      // Calcular pontos baseado nas sessões de Flow
      let total = 0;
      const recent: {date: string, points: number, reason: string}[] = [];

      // Regras para ganhar pontos:
      // - 5 pontos base por sessão concluída
      // - 1 ponto adicional para cada 10 minutos de estudo
      // - 1 ponto adicional para cada 10% de eficiência acima de 50%

      sessions.slice(0, 5).forEach(session => {
        const minutes = session.elapsedTimeSeconds ? Math.floor(session.elapsedTimeSeconds / 60) : 0;
        const timePoints = Math.floor(minutes / 10);
        const efficiencyPoints = session.progress > 50 ? Math.floor((session.progress - 50) / 10) : 0;
        const sessionPoints = 5 + timePoints + efficiencyPoints;

        total += sessionPoints;

        const formattedDate = session.timestamp 
          ? new Date(session.timestamp).toLocaleDateString('pt-BR', {
              day: '2-digit',
              month: '2-digit'
            })
          : session.date;

        recent.push({
          date: formattedDate,
          points: sessionPoints,
          reason: `Sessão de Flow: ${session.duration}`
        });
      });

      setTotalPoints(total);
      setRecentPoints(recent);
    }
  }, [sessions]);

  return (
    <div className="h-full rounded-xl border border-gray-200 dark:border-[#0D2238]/40 bg-white dark:bg-gradient-to-b dark:from-[#001427]/80 dark:to-[#001427] shadow-sm overflow-hidden flex flex-col">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-white">
          <path d="m12 8-9.04 9.06a2.82 2.82 0 1 0 3.98 3.98L16 12"></path>
          <circle cx="17" cy="7" r="5"></circle>
        </svg>
        <h3 className="font-bold text-white text-lg">Pontos</h3>
      </div>

      <div className="flex-1 p-4 flex flex-col">
        <div className="flex items-center justify-center mb-4">
          <div className="text-4xl font-bold text-[#FF6B00]">{totalPoints}</div>
        </div>

        <div className="overflow-y-auto flex-1">
          {recentPoints.length > 0 ? (
            <div className="space-y-2">
              {recentPoints.map((point, index) => (
                <div key={index} className="flex justify-between items-center p-2 rounded-lg bg-gray-50 dark:bg-[#0D2238]/20">
                  <div className="flex items-center gap-2">
                    {point.reason.includes('Flow') ? (
                      <Clock className="h-4 w-4 text-[#FF6B00]" />
                    ) : point.reason.includes('Desafio') ? (
                      <Target className="h-4 w-4 text-[#FF6B00]" />
                    ) : (
                      <BookOpen className="h-4 w-4 text-[#FF6B00]" />
                    )}
                    <div className="text-sm text-gray-700 dark:text-gray-300">
                      {point.reason}
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-500 dark:text-gray-400">{point.date}</span>
                    <span className="font-medium text-[#FF6B00]">+{point.points}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-sm text-gray-500 dark:text-gray-400">
              Complete sessões de Flow para ganhar pontos XP
            </div>
          )}
        </div>
      </div>

      <div className="p-4 bg-white dark:bg-gradient-to-b dark:from-[#001427]/80 dark:to-[#001427] border-t border-gray-100 dark:border-[#0D2238]/40">
        <Button 
          className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md shadow-md transition-all duration-300"
          onClick={onViewChallenges || onViewDetails}
          size="sm"
        >
          <span>Ver desafios</span>
          <ExternalLinkIcon className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default Pontos;