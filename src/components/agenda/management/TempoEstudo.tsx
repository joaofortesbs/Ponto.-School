import React, { useState, useEffect } from "react";
import { BarChart3, Clock, ExternalLink, Settings, Target, Zap, Info } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import useFlowSessions from "@/hooks/useFlowSessions";

const TempoEstudo = () => {
  // Estados para armazenar dados de tempo de estudo
  const [totalHours, setTotalHours] = useState<number>(0);
  const [goalHours, setGoalHours] = useState<number>(40);
  const [progress, setProgress] = useState<number>(0);
  const [weeklyData, setWeeklyData] = useState<{ day: string; hours: number; percentage: number }[]>([]);
  const [topSubjects, setTopSubjects] = useState<{ subject: string; hours: number; percentage: number; color: string }[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isNoData, setIsNoData] = useState<boolean>(false);

  // Cores para os principais assuntos
  const subjectColors = ["#FF6B00", "#FF8C40", "#E85D04", "#DC2F02", "#9D0208"];

  // Usar hook de sessões de Flow
  const { sessions, loading, getStats } = useFlowSessions();

  // Efeito para carregar e processar dados das sessões de Flow
  useEffect(() => {
    if (!loading) {
      setIsLoading(false);

      // Obter estatísticas das sessões de Flow
      const stats = getStats();

      // Verificar se existem dados
      if (stats.sessionsCount === 0) {
        setIsNoData(true);
        return;
      }

      // Calcular total de horas
      const totalSeconds = stats.totalTimeInSeconds || 0;
      const hours = Math.floor(totalSeconds / 3600);
      setTotalHours(hours);

      // Calcular progresso em relação à meta
      const calculatedProgress = Math.min(Math.round((hours / goalHours) * 100), 100);
      setProgress(calculatedProgress);

      // Processar dados por disciplina
      const subjectData = Object.entries(stats.subjectStats || {}).map(([subject, seconds], index) => {
        const subjectHours = Math.floor(seconds / 3600);
        const percentage = totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0;

        return {
          subject,
          hours: subjectHours,
          percentage,
          color: subjectColors[index % subjectColors.length]
        };
      }).sort((a, b) => b.hours - a.hours).slice(0, 5);

      setTopSubjects(subjectData);

      // Processar dados por dia da semana
      const daysOfWeek = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const weeklyStats: { [key: string]: number } = {};

      // Inicializar com zeros
      daysOfWeek.forEach(day => {
        weeklyStats[day] = 0;
      });

      // Preencher com dados reais
      sessions.forEach(session => {
        try {
          const sessionDate = session.timestamp ? new Date(session.timestamp) : new Date(session.date);
          const dayOfWeek = daysOfWeek[sessionDate.getDay()];

          // Calcular horas da sessão em segundos
          const sessionSeconds = session.elapsedTimeSeconds || 0;

          // Adicionar ao dia correspondente
          weeklyStats[dayOfWeek] = (weeklyStats[dayOfWeek] || 0) + sessionSeconds;
        } catch (e) {
          console.error("Erro ao processar data da sessão:", e);
        }
      });

      // Converter segundos para horas e calcular percentagens para visualização
      const maxDaySeconds = Math.max(...Object.values(weeklyStats));
      const weekData = daysOfWeek.map(day => ({
        day,
        hours: Math.floor(weeklyStats[day] / 3600),
        percentage: maxDaySeconds > 0 ? Math.round((weeklyStats[day] / maxDaySeconds) * 100) : 0
      }));

      setWeeklyData(weekData);
    }
  }, [loading, sessions]);

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
        onClick={() => window.location.href = "/agenda?view=flow"}
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
    <>
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div className="w-full">
            {/* Título removido do CardHeader */}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-4">
          {/* Progresso em relação à meta */}
          <div>
            <div className="flex justify-between items-baseline mb-1">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center">
                <Target className="h-4 w-4 mr-1 text-[#FF6B00]" /> Meta semanal
              </h3>
              <span className="text-sm font-semibold text-[#29335C] dark:text-white">{totalHours}/{goalHours}h</span>
            </div>
            <div className="relative">
              <Progress 
                value={progress} 
                className="h-2.5 bg-[#FF6B00]/10" 
              />
              <span className="absolute text-[10px] text-[#FF6B00] font-medium right-0 bottom-4">
                {progress}%
              </span>
            </div>
          </div>

          {/* Gráfico de horas por dia */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
              <BarChart3 className="h-4 w-4 mr-1 text-[#FF6B00]" /> Horas por dia
            </h3>
            <div className="flex items-end justify-between h-[120px] mt-2 gap-1">
              {weeklyData.map((item, index) => (
                <div key={index} className="flex flex-col items-center flex-1">
                  <div className="relative w-full flex justify-center mb-1">
                    <div 
                      className="w-full bg-[#FF6B00]/80 hover:bg-[#FF6B00] rounded-sm transition-all"
                      style={{ height: `${Math.max(item.percentage, 5)}px` }}
                    ></div>
                    {item.hours > 0 && (
                      <span className="absolute -top-5 text-xs font-medium">
                        {item.hours}h
                      </span>
                    )}
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {item.day}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top disciplinas */}
          {topSubjects.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center mb-3">
                <Zap className="h-4 w-4 mr-1 text-[#FF6B00]" /> Top disciplinas
              </h3>
              <div className="space-y-2">
                {topSubjects.map((subject, index) => (
                  <div key={index} className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2" 
                      style={{ backgroundColor: subject.color }}
                    ></div>
                    <span className="text-xs flex-1 text-gray-700 dark:text-gray-300">
                      {subject.subject}
                    </span>
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400">
                      {subject.hours}h
                    </span>
                    <span className="text-xs ml-2 text-gray-400 dark:text-gray-500 w-8 text-right">
                      {subject.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ver detalhes */}
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full border-[#FF6B00]/30 text-[#FF6B00] hover:bg-[#FF6B00]/10"
              onClick={() => window.location.href = "/agenda?view=flow"}
            >
              <ExternalLink className="h-4 w-4 mr-2" /> Ver detalhes completos
            </Button>
          </div>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className="flex flex-col h-full">
      {/* Título preenchido acima do card */}
      <div className="flex items-center justify-between bg-[#FF6B00] text-white p-2 rounded-t-md mb-0 font-medium">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" /> Tempo de Estudo
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="bg-white/20 px-2 py-0.5 rounded-md cursor-pointer hover:bg-white/30 transition-colors">Semana</span>
          <span className="px-2 py-0.5 rounded-md cursor-pointer hover:bg-white/30 transition-colors">Mês</span>
          <span className="px-2 py-0.5 rounded-md cursor-pointer hover:bg-white/30 transition-colors">Ano</span>
          <button className="p-1 rounded-full hover:bg-white/30 transition-colors">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
      <Card className="h-full overflow-hidden border border-gray-200 dark:border-gray-800 shadow-sm hover:shadow-md transition-shadow rounded-t-none">
        {isLoading ? (
          <LoadingState />
        ) : isNoData ? (
          <EmptyState />
        ) : (
          <MainContent />
        )}
      </Card>
    </div>
  );
};

export default TempoEstudo;