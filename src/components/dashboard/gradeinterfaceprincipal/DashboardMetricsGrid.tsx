import React from "react";
import { Clock, Zap, Award, Coins } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import FocoDoDiaCard from "./FocoDoDiaCard";
import AtalhoSchoolCard from "./AtalhoSchoolCard";

const DashboardMetricsGrid = () => {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        {/* Tempo de estudo card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-md">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-blue-500/10 mr-3">
              <Clock className="h-5 w-5 text-blue-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">18h 42m</h3>
              <p className="text-xs text-gray-400">Tempo de estudo</p>
            </div>
          </div>

          <Progress value={68} className="h-1.5 mt-3 bg-gray-700" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Meta semanal</span>
            <span>68%</span>
          </div>
        </div>

        {/* Aulas concluídas card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-md">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-green-500/10 mr-3">
              <Zap className="h-5 w-5 text-green-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">23</h3>
              <p className="text-xs text-gray-400">Aulas concluídas</p>
            </div>
          </div>

          <Progress value={44} className="h-1.5 mt-3 bg-gray-700" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Esta semana</span>
            <span>+12</span>
          </div>
        </div>

        {/* Posição ranking card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-md">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-purple-500/10 mr-3">
              <Award className="h-5 w-5 text-purple-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">#42</h3>
              <p className="text-xs text-gray-400">Posição ranking</p>
            </div>
          </div>

          <Progress value={90} className="h-1.5 mt-3 bg-gray-700" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Top 10%</span>
            <span>+3 posições</span>
          </div>
        </div>

        {/* School Points card */}
        <div className="bg-white/5 rounded-xl p-4 border border-white/10 shadow-md">
          <div className="flex items-start">
            <div className="p-2 rounded-full bg-amber-500/10 mr-3">
              <Coins className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">1.280</h3>
              <p className="text-xs text-gray-400">School Points</p>
            </div>
          </div>

          <Progress value={73} className="h-1.5 mt-3 bg-gray-700" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Meta mensal</span>
            <span>+320 esta semana</span>
          </div>
        </div>
      </div>

      {/* Novos cards de Foco do Dia e Atalhos School */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <FocoDoDiaCard />
        <AtalhoSchoolCard />
      </div>
    </>
  );
};

export default DashboardMetricsGrid;