import React from "react";
import {
  BarChart3,
  LineChart,
  BookOpen,
  Trophy,
  Zap,
  Star,
  Check,
  Clock,
  Flame,
  RocketIcon,
  BarChart,
  Target,
  PieChart,
  Plus,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface TopMetricsProps {
  rankingData?: {
    position: number;
    total: number;
    points: number;
    nextReward: number;
    progress: number;
    trend: string;
  };
  subjectProgressData?: {
    subject: string;
    progress: number;
    goal: number;
    color: string;
  }[];
  studyTimeData?: {
    total: number;
    goal: number;
    progress: number;
  };
  isNewUser?: boolean;
}

const TopMetrics: React.FC<TopMetricsProps> = ({
  rankingData,
  subjectProgressData,
  studyTimeData,
  isNewUser = true,
}) => {
  // Default data if not provided
  const ranking = rankingData || {
    position: 0,
    total: 0,
    points: 0,
    nextReward: 1000,
    progress: 0,
    trend: "+0",
  };

  const subjectProgress = subjectProgressData || [
    { subject: "Matemática", progress: 0, goal: 100, color: "#FF6B00" },
    { subject: "Física", progress: 0, goal: 100, color: "#FF8C40" },
    { subject: "Química", progress: 0, goal: 100, color: "#E85D04" },
    { subject: "Biologia", progress: 0, goal: 100, color: "#DC2F02" },
    { subject: "História", progress: 0, goal: 100, color: "#9D0208" },
  ];

  const studyTime = studyTimeData || {
    total: 0,
    goal: 40,
    progress: 0,
  };

  // Filter to top 3 subjects
  const top3Subjects = subjectProgress.slice(0, 3);

  if (isNewUser) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        {/* Ranking Card - New User State */}
        <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
              <Trophy className="w-4 h-4 mr-2 text-[#FF6B00]" />
              Ranking
            </h3>
          </div>

          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
              <Trophy className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Participe e conquiste pontos</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs mb-4">
              Seus avanços nos estudos serão refletidos no ranking
            </p>
            <Button 
              variant="outline"
              className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              Ver Ranking
            </Button>
          </div>
        </div>

        {/* Study Time Card - New User State */}
        <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
              <Clock className="w-4 h-4 mr-2 text-[#FF6B00]" />
              Tempo de Estudo
            </h3>
          </div>

          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
              <Flame className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Acompanhe seu tempo de estudo</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs mb-4">
              Defina metas e monitore seu progresso semanal
            </p>
            <Button 
              className="w-full bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
            >
              <Target className="h-4 w-4 mr-1" /> Definir Meta
            </Button>
          </div>
        </div>

        {/* Subject Progress Card - New User State */}
        <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
              <BookOpen className="w-4 h-4 mr-2 text-[#FF6B00]" />
              Progresso por Disciplina
            </h3>
          </div>

          <div className="text-center py-4 flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
              <BarChart className="w-6 h-6 text-[#FF6B00]" />
            </div>
            <p className="text-gray-700 dark:text-gray-300 font-medium">Acompanhe seu desempenho</p>
            <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs mb-4">
              Visualize seu progresso em cada disciplina
            </p>
            <Button 
              variant="outline"
              className="w-full border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
            >
              <Plus className="h-4 w-4 mr-1" /> Adicionar Disciplinas
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
      {/* Ranking Card */}
      <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
            <Trophy className="w-4 h-4 mr-2 text-[#FF6B00]" />
            Ranking
          </h3>
          <span
            className={`text-xs px-2 py-0.5 rounded-full ${
              ranking.trend.startsWith("+")
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300"
            }`}
          >
            {ranking.trend}
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-2">
              <Star className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <div className="text-3xl font-bold text-[#FF6B00]">
              {ranking.position}º
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              de {ranking.total} alunos
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">
              {ranking.points} pontos
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              Próxima recompensa: {ranking.nextReward}
            </span>
          </div>
          <Progress
            value={ranking.progress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800"
            indicatorClassName="bg-[#FF6B00]"
          />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-center text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
        >
          Ver Conquistas
        </Button>
      </div>

      {/* Study Time Card */}
      <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
            <Clock className="w-4 h-4 mr-2 text-[#FF6B00]" />
            Tempo de Estudo
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
            Semana
          </span>
        </div>

        <div className="text-center mb-4">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-2">
              <Flame className="w-8 h-8 text-[#FF6B00]" />
            </div>
            <div className="text-3xl font-bold text-[#FF6B00]">
              {studyTime.total}h
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              de {studyTime.goal}h semanais
            </div>
          </div>
        </div>

        <div className="mb-3">
          <div className="flex justify-between items-center text-xs mb-1">
            <span className="text-gray-600 dark:text-gray-400">Progresso</span>
            <span className="text-gray-600 dark:text-gray-400">
              {studyTime.progress}%
            </span>
          </div>
          <Progress
            value={studyTime.progress}
            className="h-1.5 bg-gray-100 dark:bg-gray-800"
            indicatorClassName="bg-[#FF6B00]"
          />
        </div>

        <Button
          variant="ghost"
          className="w-full justify-center text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
        >
          Ver Estatísticas
        </Button>
      </div>

      {/* Subject Progress Card */}
      <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold flex items-center text-[#001427] dark:text-white">
            <BookOpen className="w-4 h-4 mr-2 text-[#FF6B00]" />
            Progresso por Disciplina
          </h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
            Top 3
          </span>
        </div>

        <div className="space-y-3 mb-4">
          {top3Subjects.map((subject, index) => (
            <div key={index}>
              <div className="flex justify-between items-center text-xs mb-1">
                <span className="text-gray-600 dark:text-gray-400">
                  {subject.subject}
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  {subject.progress}% / {subject.goal}%
                </span>
              </div>
              <Progress
                value={(subject.progress / subject.goal) * 100}
                className="h-1.5 bg-gray-100 dark:bg-gray-800"
                indicatorClassName={`bg-[${subject.color}]`}
              />
            </div>
          ))}
        </div>

        <Button
          variant="ghost"
          className="w-full justify-center text-[#FF6B00] hover:text-[#FF6B00] hover:bg-[#FF6B00]/10 text-sm"
        >
          Ver Todas Disciplinas
        </Button>
      </div>
    </div>
  );
};

export default TopMetrics;