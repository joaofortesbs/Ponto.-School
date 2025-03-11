import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Calendar, CheckSquare } from "lucide-react";

const QuickStats: React.FC = () => {
  return (
    <div className="grid grid-cols-3 gap-4">
      <Card className="bg-gradient-to-br from-[#FF6B00] to-[#FF8C40] text-white border-none shadow-md">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm">Eventos Hoje</h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">3</div>
          <div className="text-xs text-white/70">2 aulas, 1 tarefa</div>
          <div className="mt-auto pt-2">
            <Progress value={33} className="h-1.5 bg-white/20" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-white/70">1/3 concluídos</span>
              <span className="text-white">33%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#4A89DC] to-[#5D5FEF] text-white border-none shadow-md">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <CheckSquare className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm">
              Tarefas Pendentes
            </h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">5</div>
          <div className="text-xs text-white/70">
            2 para hoje, 3 para esta semana
          </div>
          <div className="mt-auto pt-2">
            <Progress value={40} className="h-1.5 bg-white/20" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-white/70">2/5 em progresso</span>
              <span className="text-white">40%</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-[#00FFFF] to-[#4A89DC] text-white border-none shadow-md">
        <CardContent className="p-4 flex flex-col">
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="h-5 w-5" />
            <h3 className="font-semibold text-white text-sm">
              Tempo de Estudo
            </h3>
          </div>
          <div className="text-3xl font-bold text-white mb-2">4h 30m</div>
          <div className="text-xs text-white/70">Meta diária: 6h</div>
          <div className="mt-auto pt-2">
            <Progress value={75} className="h-1.5 bg-white/20" />
            <div className="flex justify-between text-xs mt-1">
              <span className="text-white/70">4h 30m / 6h</span>
              <span className="text-white">75%</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default QuickStats;
