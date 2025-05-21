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
        <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

          <div className="flex items-start mb-2">
            <div className="p-2 rounded-full bg-blue-400/10 mr-3">
              <Clock className="h-5 w-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">18h 42m</h3>
              <p className="text-xs text-gray-400">Tempo de estudo</p>
            </div>
          </div>

          <Progress value={68} className="h-1.5 bg-white/20" indicatorColor="bg-blue-400" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Meta semanal</span>
            <span>68%</span>
          </div>
        </div>

        {/* Aulas concluídas card */}
        <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

          <div className="flex items-start mb-2">
            <div className="p-2 rounded-full bg-green-400/10 mr-3">
              <Zap className="h-5 w-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">23</h3>
              <p className="text-xs text-gray-400">Aulas concluídas</p>
            </div>
          </div>

          <Progress value={44} className="h-1.5 bg-white/20" indicatorColor="bg-green-400" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Esta semana</span>
            <span>+12</span>
          </div>
        </div>

        {/* Posição ranking card */}
        <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

          <div className="flex items-start mb-2">
            <div className="p-2 rounded-full bg-purple-400/10 mr-3">
              <Award className="h-5 w-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">#42</h3>
              <p className="text-xs text-gray-400">Posição ranking</p>
            </div>
          </div>

          <Progress value={90} className="h-1.5 bg-white/20" indicatorColor="bg-purple-400" />
          <div className="flex justify-between text-xs text-gray-400 mt-1.5">
            <span>Top 10%</span>
            <span>+3 posições</span>
          </div>
        </div>

        {/* School Points card */}
        <div className="group backdrop-blur-md bg-[#001e3a] rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

          <div className="flex items-start mb-2">
            <div className="p-2 rounded-full bg-amber-400/10 mr-3">
              <Coins className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white">1.280</h3>
              <p className="text-xs text-gray-400">School Points</p>
            </div>
          </div>

          <Progress value={73} className="h-1.5 bg-white/20" indicatorColor="bg-amber-400" />
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