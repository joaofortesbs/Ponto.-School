
import React, { useEffect, useState } from "react";
import { 
  BarChart2, 
  Clock, 
  Target, 
  Calendar, 
  TrendingUp, 
  Award, 
  X
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlowSessions } from "@/hooks/useFlowSessions";

interface FlowPerformanceDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

interface WeeklyData {
  day: string;
  minutes: number;
}

const FlowPerformanceDetailsModal: React.FC<FlowPerformanceDetailsModalProps> = ({
  open,
  onClose
}) => {
  const { sessions, getStats } = useFlowSessions();
  const [weeklyData, setWeeklyData] = useState<WeeklyData[]>([]);
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [totalTimeSpent, setTotalTimeSpent] = useState<string>("0h 0m");
  const [sessionsCount, setSessionsCount] = useState<number>(0);
  const [avgEfficiency, setAvgEfficiency] = useState<number>(0);
  const [subjectsData, setSubjectsData] = useState<{name: string, progress: number, minutes: number}[]>([]);

  // Meta semanal de 300 minutos (5 horas)
  const weeklyGoalInMinutes = 300;

  useEffect(() => {
    if (open && sessions && sessions.length > 0) {
      calculatePerformanceData();
    }
  }, [open, sessions]);

  const calculatePerformanceData = () => {
    // Estatísticas gerais
    const stats = getStats();
    
    // Calcular tempo total em minutos
    const totalMinutes = Math.round(stats.totalTimeInSeconds / 60);
    setTotalTimeSpent(formatMinutesToHoursAndMinutes(totalMinutes));
    
    // Definir contagem de sessões
    setSessionsCount(stats.sessionsCount);
    
    // Definir eficiência média
    setAvgEfficiency(stats.avgEfficiency);
    
    // Calcular progresso geral
    const overallPercentage = Math.min(Math.round((totalMinutes / weeklyGoalInMinutes) * 100), 100);
    setOverallProgress(overallPercentage);
    
    // Processar dados por disciplina
    const subjects: {name: string, progress: number, minutes: number}[] = [];
    const subjectStats = stats.subjectStats;
    
    for (const subject in subjectStats) {
      // Converter segundos em minutos por assunto
      const subjectMinutes = Math.round(subjectStats[subject] / 60);
      
      // Calcular meta por assunto (proporcional ao tempo total)
      const subjectGoal = weeklyGoalInMinutes / Object.keys(subjectStats).length;
      const progress = Math.min(Math.round((subjectMinutes / subjectGoal) * 100), 100);
      
      // Traduzir nomes de disciplinas comuns
      let displayName = subject;
      if (subject.toLowerCase() === "math") displayName = "Matemática";
      if (subject.toLowerCase() === "physics") displayName = "Física";
      if (subject.toLowerCase() === "chemistry") displayName = "Química";
      if (subject.toLowerCase() === "biology") displayName = "Biologia";
      if (subject.toLowerCase() === "history") displayName = "História";
      if (subject.toLowerCase() === "geography") displayName = "Geografia";
      if (subject.toLowerCase() === "portuguese") displayName = "Português";
      if (subject.toLowerCase() === "english") displayName = "Inglês";
      if (subject.toLowerCase() === "programming") displayName = "Programação";

      subjects.push({
        name: displayName,
        progress,
        minutes: subjectMinutes
      });
    }
    
    // Ordenar por progresso (maior para menor)
    subjects.sort((a, b) => b.progress - a.progress);
    setSubjectsData(subjects);
    
    // Calcular dados por dia da semana
    const today = new Date();
    const dayNames = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
    const weekData: WeeklyData[] = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(today.getDate() - i);
      
      // Filtrar sessões para o dia atual
      const dayMinutes = sessions
        .filter(session => {
          let sessionDate;
          if (session.timestamp) {
            sessionDate = new Date(session.timestamp);
          } else {
            // Tentar converter do formato de data DD/MM/YYYY
            const parts = session.date.split(/[\/,-]/);
            if (parts.length >= 3) {
              // Formato pode ser DD/MM/YYYY
              sessionDate = new Date(
                parseInt(parts[2]), // ano
                parseInt(parts[1]) - 1, // mês (0-11)
                parseInt(parts[0]) // dia
              );
            } else {
              return false;
            }
          }
          
          return (
            sessionDate.getDate() === date.getDate() &&
            sessionDate.getMonth() === date.getMonth() &&
            sessionDate.getFullYear() === date.getFullYear()
          );
        })
        .reduce((total, session) => {
          return total + (session.elapsedTimeSeconds || 0);
        }, 0) / 60; // Converter para minutos
      
      weekData.push({
        day: i === 0 ? "Hoje" : dayNames[date.getDay()],
        minutes: Math.round(dayMinutes)
      });
    }
    
    setWeeklyData(weekData);
  };

  const formatMinutesToHoursAndMinutes = (totalMinutes: number): string => {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours}h ${minutes}m`;
  };

  const getMaxBarHeight = (): number => {
    const maxMinutes = Math.max(...weeklyData.map(d => d.minutes), 60);
    return maxMinutes;
  };

  return (
    <Dialog open={open} onOpenChange={isOpen => !isOpen && onClose()}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-xl font-bold text-[#29335C] dark:text-white">
            <BarChart2 className="h-5 w-5 mr-2 text-[#FF6B00]" />
            Desempenho Semanal Detalhado
          </DialogTitle>
        </DialogHeader>
        
        <div className="py-1">
          {/* Resumo geral */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
              Resumo da Semana
            </h3>
            
            <div className="grid grid-cols-3 gap-3 mb-3">
              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="h-4 w-4 text-[#FF6B00]" />
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Tempo Total
                  </h5>
                </div>
                <p className="text-xl font-bold text-[#FF6B00]">{totalTimeSpent}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Meta: 5h 0m</p>
              </div>
              
              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="h-4 w-4 text-[#FF6B00]" />
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Sessões
                  </h5>
                </div>
                <p className="text-xl font-bold text-[#FF6B00]">{sessionsCount}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Últimos 7 dias</p>
              </div>
              
              <div className="bg-[#F8F9FA] dark:bg-[#29335C]/30 rounded-lg p-3 shadow-sm">
                <div className="flex items-center gap-2 mb-1">
                  <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
                  <h5 className="text-sm font-medium text-[#29335C] dark:text-white">
                    Eficiência
                  </h5>
                </div>
                <p className="text-xl font-bold text-[#FF6B00]">{avgEfficiency}%</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Média das sessões</p>
              </div>
            </div>
            
            <div className="mb-4">
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Target className="h-4 w-4 text-[#FF6B00] mr-2" />
                  <span className="text-sm font-medium text-[#29335C] dark:text-white">
                    Progresso para meta semanal
                  </span>
                </div>
                <span className="text-sm font-semibold text-[#FF6B00]">{overallProgress}%</span>
              </div>
              <Progress 
                className="h-3" 
                value={overallProgress} 
                indicatorClassName="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]"
              />
            </div>
          </div>
          
          {/* Gráfico de tempo por dia */}
          <div className="mb-5">
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
              Distribuição Semanal
            </h3>
            
            <div className="h-[150px] flex items-end space-x-2">
              {weeklyData.map((day, index) => {
                const maxHeight = getMaxBarHeight();
                const barHeight = day.minutes > 0 ? (day.minutes / maxHeight) * 100 : 0;
                
                return (
                  <div key={index} className="flex-1 flex flex-col items-center">
                    <div className="w-full h-[130px] flex flex-col justify-end">
                      {day.minutes > 0 && (
                        <div className="text-xs font-medium text-[#FF6B00] mb-1">
                          {day.minutes}m
                        </div>
                      )}
                      <div 
                        className="w-full bg-gradient-to-t from-[#FF6B00] to-[#FF8C40] rounded-t-md"
                        style={{ height: `${barHeight}%` }}
                      ></div>
                    </div>
                    <div className="text-xs mt-1 text-gray-500 dark:text-gray-400">
                      {day.day.substring(0, 3)}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
          
          {/* Progresso por disciplina */}
          <div>
            <h3 className="text-lg font-semibold text-[#29335C] dark:text-white mb-3">
              Disciplinas
            </h3>
            
            <div className="space-y-3">
              {subjectsData.map((subject, index) => (
                <div key={index} className="mb-2">
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <Award className="h-4 w-4 text-[#FF6B00] mr-2" />
                      <span className="text-sm font-medium text-[#29335C] dark:text-white">
                        {subject.name}
                      </span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                        {subject.minutes} min
                      </span>
                      <span className="text-sm font-semibold text-[#FF6B00]">
                        {subject.progress}%
                      </span>
                    </div>
                  </div>
                  <Progress 
                    className="h-2.5" 
                    value={subject.progress} 
                    indicatorClassName="bg-[#FF6B00]"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <DialogFooter className="mt-4">
          <Button 
            onClick={onClose}
            className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white"
          >
            Fechar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default FlowPerformanceDetailsModal;
