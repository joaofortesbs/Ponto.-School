import React, { useState, useEffect } from "react";
import { BarChart3, Clock, ExternalLink, Settings, Target, Zap, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useFlowSessions from "@/hooks/useFlowSessions";
import { useNavigate } from "react-router-dom";

const TempoEstudo = () => {
  const navigate = useNavigate();

  // Estados para armazenar dados de tempo de estudo
  const [totalHours, setTotalHours] = useState<number>(0);
  const [goalHours, setGoalHours] = useState<number>(40);
  const [progress, setProgress] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; percentage: number }[]>([]);
  const [monthlyData, setMonthlyData] = useState<{ day: string; hours: number; percentage: number }[]>([]);
  const [yearlyData, setYearlyData] = useState<{ month: string; hours: number; percentage: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<{ subject: string; hours: number; percentage: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoData, setIsNoData] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"semana" | "mes" | "ano">("semana");
  const [changePercentage, setChangePercentage] = useState<number>(1.2); // Valor padrão para exibição

  // Usar hook de sessões de Flow para integração com agenda
  const { sessions, loading, getStats } = useFlowSessions();

  // Efeito para carregar e processar dados das sessões de Flow
  useEffect(() => {
    if (!loading) {
      setIsLoading(false);

      // Obter estatísticas das sessões de Flow
      const stats = getStats(viewMode);

      // Verificar se existem dados
      if (stats.sessionsCount === 0) {
        setIsNoData(true);
        return;
      }

      setIsNoData(false);

      // Calcular horas totais (converter segundos para horas)
      const hoursTotal = Math.round(stats.totalTimeInSeconds / 3600);
      setTotalHours(hoursTotal);

      // Calcular porcentagem de progresso em relação à meta
      const calculatedProgress = Math.min(100, Math.round((hoursTotal / goalHours) * 100));
      setProgress(calculatedProgress);

      // Definir dados semanais
      if (stats.trends && stats.trends.timeChangePct) {
        setChangePercentage(stats.trends.timeChangePct);
      }

      // Processar dados de disciplinas
      if (stats.subjectStats) {
        const colors = ["#FF6B00", "#FF8C40", "#E85D04", "#DC2F02", "#9D0208"];

        const totalSubjectTime = Object.values(stats.subjectStats).reduce((sum: number, time: number) => sum + time, 0);

        const formattedSubjects = Object.entries(stats.subjectStats)
          .map(([subject, seconds], index) => {
            const hours = seconds / 3600;
            const percentage = totalSubjectTime > 0 ? Math.round((seconds / totalSubjectTime) * 100) : 0;

            return {
              subject,
              hours,
              percentage,
              color: colors[index % colors.length]
            };
          })
          .sort((a, b) => b.hours - a.hours)
          .slice(0, 5);

        setTopSubjects(formattedSubjects);
      }
    }
  }, [loading, sessions, viewMode, goalHours]);

  // Componente de estado vazio para novos usuários
  const EmptyState = () => (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="w-16 h-16 rounded-full bg-[#FF6B00]/10 flex items-center justify-center mb-4">
        <Clock className="h-8 w-8 text-[#FF6B00]" />
      </div>
      <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-2">
        Sem registros de estudo
      </h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 max-w-[250px]">
        Registre seu tempo de estudo utilizando o Flow para visualizar suas estatísticas aqui.
      </p>
      <Button
        onClick={() => navigate("/agenda?view=flow")}
        className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
      >
        <Zap className="h-4 w-4 mr-2" /> Iniciar Flow
      </Button>
    </div>
  );

  // Componente de carregamento
  const LoadingState = () => (
    <div className="flex items-center justify-center h-full">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FF6B00]"></div>
    </div>
  );

  // Conteúdo principal quando há dados
  const MainContent = () => (
    <div className="p-3">
      {/* Cabeçalho com tempo total e meta */}
      <div className="flex justify-between items-center mb-2">
        <div>
          <div className="flex items-end">
            <h3 className="text-2xl font-bold text-[#29335C] dark:text-white">{totalHours}</h3>
            <span className="text-xs text-gray-500 dark:text-gray-400 ml-1 mb-1">horas</span>
          </div>
          <div className="flex items-center">
            <span className={`text-xs font-medium py-0.5 px-1.5 rounded ${changePercentage >= 0 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
              {changePercentage >= 0 ? '+' : ''}{changePercentage}%
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-7 w-7 rounded-full hover:bg-[#FF6B00]/10"
                  onClick={() => navigate("/agenda?view=flow")}
                >
                  <ExternalLink className="h-4 w-4 text-[#FF6B00]" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Ver detalhes no Flow</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      {/* Meta de estudos */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
            <Target className="h-3 w-3 mr-1 text-[#FF6B00]" /> 
            Meta: {goalHours} horas
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">{progress}%</span>
        </div>
        <Progress value={progress} className="h-1.5 bg-gray-200 dark:bg-gray-700" />
      </div>

      {/* Disciplinas mais estudadas - para usuários com dados */}
      {topSubjects.length > 0 && (
        <div className="mt-3">
          <h4 className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
            <BarChart3 className="h-3 w-3 mr-1 text-[#FF6B00]" /> 
            Disciplinas mais estudadas
          </h4>
          <div className="space-y-2">
            {topSubjects.map((subject, index) => (
              <div key={index} className="flex items-center text-xs">
                <div className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: subject.color }}></div>
                <span className="text-gray-700 dark:text-gray-300 truncate max-w-[120px]">{subject.subject}</span>
                <div className="flex-1 mx-2">
                  <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ 
                        width: `${subject.percentage}%`,
                        backgroundColor: subject.color 
                      }}
                    ></div>
                  </div>
                </div>
                <span className="text-gray-500 dark:text-gray-400 w-8 text-right">{Math.round(subject.hours)}h</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-md hover:shadow-md transition-shadow flex flex-col bg-white dark:bg-gradient-to-b dark:from-[#001427] dark:to-[#001a2f] rounded-xl">
      {/* Título dentro do card com o mesmo estilo do EventosDoDia */}
      <div className="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] p-3 flex items-center justify-between shadow-md">
        <div className="flex items-center">
          <div className="bg-white/10 p-1.5 rounded-lg mr-2">
            <Clock className="h-4 w-4 text-white" />
          </div>
          <h3 className="text-white font-semibold text-sm">Tempo de Estudo</h3>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "semana" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("semana")}
          >
            Semana
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "mes" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("mes")}
          >
            Mês
          </span>
          <span 
            className={`px-2 py-0.5 rounded-md cursor-pointer transition-colors ${viewMode === "ano" ? "bg-white/20 font-medium" : "hover:bg-white/30"}`}
            onClick={() => setViewMode("ano")}
          >
            Ano
          </span>
        </div>
      </div>

      <CardContent className="p-0 flex-1 flex flex-col">
        {isLoading ? (
          <LoadingState />
        ) : isNoData ? (
          <EmptyState />
        ) : (
          <MainContent />
        )}
      </CardContent>
    </Card>
  );
};

export default TempoEstudo;