
import React, { useEffect, useState } from "react";
import { BarChart2Icon, ExternalLinkIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useFlowSessions } from "@/hooks/useFlowSessions";

interface DesempenhoSemanalProps {
  onViewDetails?: () => void;
}

interface SubjectProgress {
  name: string;
  progress: number;
}

const DesempenhoSemanal: React.FC<DesempenhoSemanalProps> = ({ onViewDetails }) => {
  const { sessions, getStats } = useFlowSessions();
  const [overallProgress, setOverallProgress] = useState<number>(0);
  const [subjectsProgress, setSubjectsProgress] = useState<SubjectProgress[]>([]);
  const [hasData, setHasData] = useState<boolean>(false);

  // A meta semanal é de 300 minutos (5 horas)
  const weeklyGoalInMinutes = 300;

  useEffect(() => {
    if (sessions && sessions.length > 0) {
      calculateProgress();
    }
  }, [sessions]);

  const calculateProgress = () => {
    // Obter estatísticas das sessões
    const stats = getStats();
    
    // Verificar se há dados
    if (stats.totalTimeInSeconds > 0) {
      setHasData(true);
      
      // Calcular progresso geral (tempo total em minutos / meta semanal)
      const totalMinutes = Math.round(stats.totalTimeInSeconds / 60);
      const overallPercentage = Math.min(Math.round((totalMinutes / weeklyGoalInMinutes) * 100), 100);
      setOverallProgress(overallPercentage);
      
      // Processar progresso por disciplina
      const subjects: SubjectProgress[] = [];
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
          progress
        });
      }
      
      // Ordenar por progresso (maior para menor)
      subjects.sort((a, b) => b.progress - a.progress);
      
      // Limitar a no máximo 5 disciplinas
      setSubjectsProgress(subjects.slice(0, 5));
    } else {
      setHasData(false);
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
      
      <div className="flex-1 p-4">
        {hasData ? (
          <div className="flex flex-col h-full">
            <div className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">Progresso Geral</span>
                <span className="text-sm font-medium text-[#FF6B00]">{overallProgress}%</span>
              </div>
              <Progress className="h-2" value={overallProgress} indicatorClassName="bg-gradient-to-r from-[#FF6B00] to-[#FF8C40]" />
            </div>
            
            <div className="flex-1 space-y-2 mb-4">
              {subjectsProgress.map((subject, index) => (
                <div key={index}>
                  <div className="flex justify-between items-center mb-1">
                    <div className="flex items-center">
                      <span className="w-2 h-2 rounded-full bg-[#FF6B00] mr-2"></span>
                      <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{subject.name}</span>
                    </div>
                    <span className="text-xs font-medium text-gray-600 dark:text-gray-300">{subject.progress}%</span>
                  </div>
                  <Progress className="h-1.5" value={subject.progress} indicatorClassName="bg-[#FF6B00]" />
                </div>
              ))}
            </div>
            
            <Button 
              onClick={onViewDetails}
              className="mt-auto bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF7B20] hover:to-[#FF9C50] text-white rounded-md w-full shadow-md transition-all duration-300"
            >
              <ExternalLinkIcon className="h-4 w-4 mr-2" /> Ver Detalhes
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center">
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
    </div>
  );
};

export default DesempenhoSemanal;
