
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

interface XpBySession {
  duration: string;
  date: string;
  xp: number;
  formattedDate: string;
}

const Pontos: React.FC<PontosProps> = ({ onViewChallenges }) => {
  const { sessions } = useFlowSessions();
  const [totalXp, setTotalXp] = useState(0);
  const [xpBySessions, setXpBySessions] = useState<XpBySession[]>([]);

  useEffect(() => {
    // Calcular o total de XP baseado nas sessões de flow concluídas
    const calcularXpTotal = () => {
      let xp = 0;
      const sessionsWithXp: XpBySession[] = [];
      
      sessions.forEach(session => {
        // Calcular XP baseado no tempo da sessão
        let sessionXp = 5; // Valor padrão de XP para cada sessão
        
        // Formatar duração
        let duration = "00:00:00";
        if (session.elapsedTimeSeconds) {
          const hours = Math.floor(session.elapsedTimeSeconds / 3600);
          const minutes = Math.floor((session.elapsedTimeSeconds % 3600) / 60);
          const seconds = session.elapsedTimeSeconds % 60;
          duration = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        } else if (session.duration) {
          duration = session.duration;
        }
        
        // Formatar data
        const timestamp = session.timestamp 
          ? new Date(session.timestamp)
          : session.date 
            ? new Date(session.date.split('/').reverse().join('-'))
            : new Date();
        
        const formattedDate = format(timestamp, 'dd/MM', { locale: ptBR });
        
        // Adicionar ao total
        xp += sessionXp;
        
        // Adicionar ao histórico por sessão
        sessionsWithXp.push({
          duration,
          date: timestamp.toISOString(),
          xp: sessionXp,
          formattedDate
        });
      });
      
      // Ordenar por data (mais recente primeiro)
      sessionsWithXp.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      
      setXpBySessions(sessionsWithXp);
      return xp === 0 ? 20 : xp; // Valor demonstrativo de 20 se não houver sessões
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
          <h3 className="text-white font-semibold text-sm">Pontos XP</h3>
        </div>
      </div>
      
      {/* Conteúdo principal com scroll */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Área de conteúdo com scroll */}
        <div className="flex-1 overflow-hidden">
          {/* Total XP em destaque */}
          <div className="text-center py-4">
            <div className="text-[#FF6B00] text-4xl font-bold">
              {totalXp}
            </div>
          </div>
          
          {/* Lista de sessões com XP - com scroll */}
          <ScrollArea className="flex-1 px-4" style={{ height: "calc(100% - 70px)" }}>
            <div className="space-y-2">
              {xpBySessions.length > 0 ? (
                xpBySessions.map((session, idx) => (
                  <div 
                    key={idx} 
                    className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800"
                  >
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Sessão de Flow: {session.duration}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">{session.formattedDate}</span>
                      <span className="text-sm font-medium text-[#FF6B00]">+{session.xp}</span>
                    </div>
                  </div>
                ))
              ) : (
                // Conteúdo demonstrativo baseado na imagem
                <>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Sessão de Flow: 00:00:10
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">18/05</span>
                      <span className="text-sm font-medium text-[#FF6B00]">+5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Sessão de Flow: 00:01:24
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">18/05</span>
                      <span className="text-sm font-medium text-[#FF6B00]">+5</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-2">
                      <ClockIcon className="h-4 w-4 text-[#FF6B00]" />
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        Sessão de Flow: 00:00:03
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500 dark:text-gray-400">17/05</span>
                      <span className="text-sm font-medium text-[#FF6B00]">+5</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </ScrollArea>
        </div>
        
        {/* Botão de Conquistas fixo na parte inferior */}
        <div className="mt-auto p-4 pt-2">
          <Button 
            onClick={onViewChallenges}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300 h-10"
          >
            <TrophyIcon className="h-4 w-4 mr-2" /> Conquistas
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Pontos;
