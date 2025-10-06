
import React, { useEffect, useState } from "react";
import { BarChart2Icon, ExternalLinkIcon, Clock, Target, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import useFlowSessions from "@/hooks/useFlowSessions";

interface DesempenhoSemanalProps {
  onViewDetails?: () => void;
}

const DesempenhoSemanal: React.FC<DesempenhoSemanalProps> = ({ onViewDetails }) => {
  const { sessions, getStats } = useFlowSessions();
  const [loading, setLoading] = useState(true);
  
  // Estado para a meta semanal (em minutos)
  const [weeklyGoal] = useState(300); // 5 horas por semana como padrão
  
  // Dados de desempenho calculados
  const [weeklyData, setWeeklyData] = useState<{
    totalMinutes: number;
    goalProgress: number;
    avgEfficiency: number;
    sessionsCount: number;
    topSubject: string;
    topSubjectTime: string;
    hasData: boolean;
  }>({
    totalMinutes: 0,
    goalProgress: 0,
    avgEfficiency: 0,
    sessionsCount: 0,
    topSubject: "",
    topSubjectTime: "",
    hasData: false
  });

  useEffect(() => {
    // Calcula os dados de desempenho semanais
    if (sessions.length > 0) {
      const stats = getStats();
      
      // Converte segundos para minutos para exibição
      const totalMinutes = Math.round(stats.totalTimeInSeconds / 60);
      
      // Calcula o progresso em relação à meta semanal
      const goalProgress = Math.min(Math.round((totalMinutes / weeklyGoal) * 100), 100);
      
      // Determina o tópico com mais tempo
      let topSubject = "";
      let topSubjectTime = "";
      
      if (Object.keys(stats.subjectStats).length > 0) {
        const sortedSubjects = Object.entries(stats.subjectStats)
          .sort(([, a], [, b]) => b - a);
        
        if (sortedSubjects.length > 0) {
          topSubject = sortedSubjects[0][0];
          const seconds = sortedSubjects[0][1];
          const hours = Math.floor(seconds / 3600);
          const minutes = Math.floor((seconds % 3600) / 60);
          topSubjectTime = `${hours}h${minutes > 0 ? ` ${minutes}m` : ''}`;
        }
      }
      
      setWeeklyData({
        totalMinutes,
        goalProgress,
        avgEfficiency: stats.avgEfficiency,
        sessionsCount: stats.sessionsCount,
        topSubject,
        topSubjectTime,
        hasData: true
      });
    }
    
    setLoading(false);
  }, [sessions, weeklyGoal, getStats]);

  // Formata minutos para exibição em horas e minutos
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins}min`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl overflow-hidden shadow-md border border-gray-200 dark:border-[#0D2238]/50 metrics-card light-mode-card">
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <BarChart2Icon className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Desempenho Semanal</h3>
        </div>
      </div>
      
      {loading ? (
        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="h-4 w-32 bg-gray-200 dark:bg-[#0D2238] rounded animate-pulse mb-3"></div>
          <div className="h-3 w-24 bg-gray-200 dark:bg-[#0D2238] rounded animate-pulse"></div>
        </div>
      ) : weeklyData.hasData ? (
        <div className="flex-1 flex flex-col p-4 gap-3 text-sm">
          {/* Meta semanal */}
          <div className="mb-1">
            <div className="flex justify-between items-center mb-1">
              <div className="flex items-center gap-1.5">
                <Target className="h-3.5 w-3.5 text-[#FF6B00]" />
                <span className="text-gray-800 dark:text-white text-xs font-medium">Meta semanal</span>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                {formatMinutes(weeklyData.totalMinutes)} / {formatMinutes(weeklyGoal)}
              </span>
            </div>
            <Progress value={weeklyData.goalProgress} className="h-2 bg-gray-200 dark:bg-[#0D2238]/70" indicatorClassName="bg-[#FF6B00]" />
          </div>
          
          {/* Estatísticas adicionais */}
          <div className="grid grid-cols-2 gap-3 mt-1">
            <div className="bg-gray-50 dark:bg-[#0D2238]/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <Clock className="h-3.5 w-3.5 text-[#FF6B00]" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Sessões</span>
              </div>
              <span className="text-gray-800 dark:text-white font-medium">{weeklyData.sessionsCount}</span>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#0D2238]/30 rounded-lg p-2">
              <div className="flex items-center gap-1.5 mb-1">
                <TrendingUp className="h-3.5 w-3.5 text-[#FF6B00]" />
                <span className="text-xs text-gray-600 dark:text-gray-300">Eficiência</span>
              </div>
              <span className="text-gray-800 dark:text-white font-medium">{weeklyData.avgEfficiency}%</span>
            </div>
          </div>
          
          {/* Assunto mais estudado */}
          {weeklyData.topSubject && (
            <div className="bg-gray-50 dark:bg-[#0D2238]/30 rounded-lg p-2 mt-1">
              <span className="text-xs text-gray-600 dark:text-gray-300 block mb-1">Assunto mais estudado</span>
              <div className="flex justify-between">
                <span className="text-gray-800 dark:text-white font-medium">{weeklyData.topSubject}</span>
                <span className="text-[#FF6B00] font-medium">{weeklyData.topSubjectTime}</span>
              </div>
            </div>
          )}
          
          <div className="mt-auto">
            <Button 
              onClick={onViewDetails}
              className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300 mt-2"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Detalhes
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center">
          <div className="bg-gray-100 dark:bg-gradient-to-br dark:from-[#0D2238] dark:to-[#0D2238]/70 p-4 rounded-full mb-3 shadow-inner">
            <BarChart2Icon className="h-8 w-8 text-gray-400 dark:text-[#8393A0]" />
          </div>
          <p className="text-gray-800 dark:text-white text-sm font-medium mb-1">Sem dados de desempenho</p>
          <p className="text-gray-500 dark:text-[#8393A0] text-xs mb-4">
            Complete sessões de Flow para visualizar seu progresso
          </p>
          <Button 
            onClick={onViewDetails}
            className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
          >
            <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Detalhes
          </Button>
        </div>
      )}
    </div>
  );
};

export default DesempenhoSemanal;
