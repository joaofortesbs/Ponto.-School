import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BarChart3, Clock, Play, Sparkles, Flame } from "lucide-react";

interface FlowSummaryCardProps {
  weeklyData?: {
    total: number;
    goal: number;
    progress: number;
    byDay: { day: string; hours: number }[];
  };
  isNewUser?: boolean;
}

const FlowSummaryCard: React.FC<FlowSummaryCardProps> = ({ weeklyData, isNewUser = true }) => {
  // Default data if not provided
  const data = weeklyData || {
    total: 0,
    goal: 40,
    progress: 0,
    byDay: [
      { day: "Seg", hours: 0 },
      { day: "Ter", hours: 0 },
      { day: "Qua", hours: 0 },
      { day: "Qui", hours: 0 },
      { day: "Sex", hours: 0 },
      { day: "Sáb", hours: 0 },
      { day: "Dom", hours: 0 },
    ],
  };

  // Get max hours for scaling the chart
  const maxHours = Math.max(...data.byDay.map((d) => d.hours), 5); // minimum 5 for scale

  if (isNewUser) {
    return (
      <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5 h-full overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold flex items-center text-[#001427] dark:text-white">
            <BarChart3 className="w-5 h-5 mr-2 text-[#FF6B00]" />
            Desempenho Semanal
          </h3>
        </div>

        <div className="text-center py-6 flex flex-col items-center">
          <div className="w-16 h-16 bg-[#FF6B00]/10 rounded-full flex items-center justify-center mb-3">
            <Flame className="w-6 h-6 text-[#FF6B00]" />
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium">Acompanhe seu desempenho</p>
          <p className="text-sm mt-1 text-gray-500 dark:text-gray-400 max-w-xs">
            Seu progresso e horas de estudo serão exibidos aqui conforme você usa a plataforma
          </p>
          <Button 
            className="mt-4 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white"
          >
            <Play className="h-4 w-4 mr-1" /> Iniciar Fluxo de Estudo
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-[#001427] rounded-xl border border-[#29335C]/10 shadow-sm p-5 h-full overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center text-[#001427] dark:text-white">
          <BarChart3 className="w-5 h-5 mr-2 text-[#FF6B00]" />
          Desempenho Semanal
        </h3>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-1 text-gray-700 dark:text-gray-300">
            <Clock className="h-4 w-4 text-[#FF6B00]" />
            <span>
              <span className="font-semibold">{data.total}</span> de{" "}
              <span className="font-semibold">{data.goal}</span> horas
            </span>
          </div>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Meta semanal: {data.progress}%
          </span>
        </div>
        <Progress
          value={data.progress}
          className="h-2 bg-gray-100 dark:bg-gray-800"
          indicatorClassName="bg-[#FF6B00]"
        />
      </div>

      <div className="w-full flex items-end justify-between h-24 gap-1 mb-4">
        {data.byDay.map((day, index) => (
          <div
            key={day.day}
            className="flex flex-col items-center justify-end h-full flex-1"
          >
            <div
              className={`w-full rounded-t-md ${
                new Date().getDay() === index + 1
                  ? "bg-[#FF6B00]"
                  : "bg-gray-200 dark:bg-gray-700"
              } transition-all duration-300`}
              style={{
                height: `${Math.max((day.hours / maxHours) * 100, 2)}%`,
              }}
            ></div>
            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
              {day.day}
            </div>
          </div>
        ))}
      </div>

      <div className="flex space-x-2">
        <Button
          variant="outline"
          className="flex-1 border-[#FF6B00] text-[#FF6B00] hover:bg-[#FF6B00]/10"
        >
          <BarChart3 className="h-4 w-4 mr-1" />
          Análise
        </Button>
        <Button className="flex-1 bg-gradient-to-r from-[#FF6B00] to-[#FF8C40] hover:from-[#FF8C40] hover:to-[#FF6B00] text-white">
          <Play className="h-4 w-4 mr-1" />
          Iniciar Fluxo
        </Button>
      </div>
    </div>
  );
};

export default FlowSummaryCard;