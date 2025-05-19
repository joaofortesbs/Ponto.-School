
import React from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Clock, 
  BarChart2, 
  Calendar, 
  Target, 
  TrendingUp,
  BookOpen
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import useFlowSessions from "@/hooks/useFlowSessions";

interface FlowPerformanceDetailsModalProps {
  open: boolean;
  onClose: () => void;
}

const FlowPerformanceDetailsModal: React.FC<FlowPerformanceDetailsModalProps> = ({
  open,
  onClose
}) => {
  const { sessions, getStats } = useFlowSessions();
  const stats = getStats();
  
  // Meta semanal em minutos (5 horas)
  const weeklyGoalMinutes = 300;
  
  // Cálculos de estatísticas
  const totalMinutes = Math.round(stats.totalTimeInSeconds / 60);
  const goalProgress = Math.min(Math.round((totalMinutes / weeklyGoalMinutes) * 100), 100);
  
  // Formatar minutos para exibição
  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours === 0) {
      return `${mins} minutos`;
    } else if (mins === 0) {
      return hours === 1 ? `${hours} hora` : `${hours} horas`;
    } else {
      return `${hours}h ${mins}min`;
    }
  };
  
  // Dias da semana
  const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  
  // Calcula minutos por dia da semana
  const getMinutosPorDia = () => {
    const hoje = new Date();
    const minutesByDay = Array(7).fill(0);
    
    // Preencher com dados dos últimos 7 dias
    sessions.forEach(session => {
      if (session.timestamp) {
        const sessionDate = new Date(session.timestamp);
        const diffTime = Math.abs(hoje.getTime() - sessionDate.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays <= 7) {
          const dayIndex = sessionDate.getDay();
          minutesByDay[dayIndex] += (session.elapsedTimeSeconds || 0) / 60;
        }
      }
    });
    
    return minutesByDay;
  };
  
  const minutosPorDia = getMinutosPorDia();
  const maxMinutos = Math.max(...minutosPorDia, 60); // Mínimo de 60 min para escala
  
  // Principais assuntos estudados
  const topSubjects = Object.entries(stats.subjectStats)
    .map(([subject, seconds]) => ({
      subject,
      minutes: Math.round(seconds / 60),
      percentage: stats.totalTimeInSeconds > 0 
        ? Math.round((seconds / stats.totalTimeInSeconds) * 100) 
        : 0
    }))
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 3);

  return (
    <Dialog open={open} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[660px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <BarChart2 className="h-5 w-5 text-[#FF6B00]" />
            Detalhes de Desempenho do Flow
          </DialogTitle>
          <DialogDescription>
            Visualize e acompanhe seu progresso nas sessões de Flow
          </DialogDescription>
        </DialogHeader>
        
        <div className="mt-2 space-y-6">
          {/* Resumo do desempenho */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Tempo total</span>
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-white">{formatMinutes(totalMinutes)}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Últimos 30 dias</span>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Sessões</span>
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-white">{stats.sessionsCount}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Completadas no período</span>
            </div>
            
            <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4 flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-gray-600 dark:text-gray-300 text-sm">Eficiência média</span>
              </div>
              <span className="text-xl font-semibold text-gray-800 dark:text-white">{stats.avgEfficiency}%</span>
              <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Base nas auto-avaliações</span>
            </div>
          </div>
          
          {/* Meta semanal */}
          <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <Target className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-gray-700 dark:text-white font-medium">Meta semanal de tempo</span>
            </div>
            
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {formatMinutes(totalMinutes)} de {formatMinutes(weeklyGoalMinutes)}
              </span>
              <span className="text-sm font-medium text-[#FF6B00]">{goalProgress}%</span>
            </div>
            
            <Progress 
              value={goalProgress} 
              className="h-2.5 bg-gray-200 dark:bg-[#0D2238]/70" 
              indicatorClassName="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]" 
            />
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
              {goalProgress >= 100 
                ? "Parabéns! Você atingiu sua meta semanal de tempo de estudo."
                : `Você precisa de mais ${formatMinutes(weeklyGoalMinutes - totalMinutes)} para atingir sua meta.`
              }
            </p>
          </div>
          
          {/* Gráfico de distribuição por dia da semana */}
          <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BarChart2 className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-gray-700 dark:text-white font-medium">Distribuição semanal</span>
            </div>
            
            <div className="flex items-end h-36 gap-1 px-1">
              {diasSemana.map((dia, index) => (
                <div key={index} className="flex-1 flex flex-col items-center">
                  <div 
                    className="w-full bg-gradient-to-t from-[#FF6B00] to-[#FF8C40] rounded-t-md"
                    style={{ 
                      height: `${(minutosPorDia[index] / maxMinutos) * 100}%`,
                      minHeight: minutosPorDia[index] > 0 ? '4px' : '0px'
                    }}
                  ></div>
                  <div className="text-xs text-gray-600 dark:text-gray-300 mt-1">{dia}</div>
                </div>
              ))}
            </div>
            
            <div className="text-center text-xs text-gray-500 dark:text-gray-400 mt-3">
              Minutos de estudo por dia da semana
            </div>
          </div>
          
          {/* Principais disciplinas */}
          <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-4">
              <BookOpen className="h-4 w-4 text-[#FF6B00]" />
              <span className="text-gray-700 dark:text-white font-medium">Principais disciplinas</span>
            </div>
            
            {topSubjects.length > 0 ? (
              <div className="space-y-3">
                {topSubjects.map((subject, index) => (
                  <div key={index}>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-gray-700 dark:text-gray-200">{subject.subject}</span>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                          {formatMinutes(subject.minutes)}
                        </span>
                        <span className="text-xs font-medium text-[#FF6B00]">
                          {subject.percentage}%
                        </span>
                      </div>
                    </div>
                    <Progress 
                      value={subject.percentage} 
                      className="h-2 bg-gray-200 dark:bg-[#0D2238]/70" 
                      indicatorClassName="bg-[#FF6B00]" 
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                Nenhuma disciplina registrada ainda
              </div>
            )}
          </div>
          
          {/* Histórico recente */}
          {sessions.length > 0 && (
            <div className="bg-gray-50 dark:bg-[#001a2f]/40 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="h-4 w-4 text-[#FF6B00]" />
                <span className="text-gray-700 dark:text-white font-medium">Histórico recente</span>
              </div>
              
              <div className="space-y-2 max-h-[240px] overflow-y-auto pr-1">
                {sessions.slice(0, 5).map((session, index) => {
                  const formattedDate = session.timestamp 
                    ? new Date(session.timestamp).toLocaleDateString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    : session.date;
                  
                  return (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-2 rounded-lg bg-white/50 dark:bg-[#0D2238]/20"
                    >
                      <div>
                        <div className="text-sm font-medium text-gray-700 dark:text-white">
                          {session.session_title || `Sessão de Flow`}
                        </div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <Calendar className="h-3 w-3" /> {formattedDate}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-medium text-[#FF6B00]">{session.duration}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {session.progress}% eficiência
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlowPerformanceDetailsModal;
