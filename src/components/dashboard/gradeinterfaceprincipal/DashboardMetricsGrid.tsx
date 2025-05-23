import React from "react";
import { BookOpen, Trophy, Award } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import FocoDoDiaCard from "./FocoDoDiaCard";
import AtalhoSchoolCard from "./AtalhoSchoolCard";
import SequenciaEstudosCard from "./SequenciaEstudosCard";
import EpictusIACopilotoCard from "./EpictusIACopilotoCard";
import TempoEstudoCard from "./TempoEstudoCard";

export default function DashboardMetricsGrid() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  return (
    <div className="space-y-6 mt-8">
      {/* Cards de métricas rápidas - 4 cards em linha */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Tempo de estudo card */}
        <TempoEstudoCard theme={theme} />

        {/* Aulas concluídas card */}
        <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

          <div className="flex justify-between items-start mb-1 relative z-10">
            <div className="flex items-center">
              <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
                <BookOpen className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
              </div>
              <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Aulas concluídas</p>
            </div>
            <span className={`text-xs font-medium ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'} ${isLightMode ? 'text-orange-700' : 'text-[#FF6B00]'} py-0.5 px-2 rounded-full`}>+4 aulas</span>
          </div>

          <div className="flex items-end mt-2">
            <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>24</h3>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>aulas</span>
          </div>
        </div>

        {/* Posição ranking card */}
        <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

          <div className="flex justify-between items-start mb-1 relative z-10">
            <div className="flex items-center">
              <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
                <Trophy className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
              </div>
              <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Posição ranking</p>
            </div>
            <span className={`text-xs font-medium ${isLightMode ? 'bg-green-100' : 'bg-green-500/20'} ${isLightMode ? 'text-green-700' : 'text-green-400'} py-0.5 px-2 rounded-full`}>↑ 3 posições</span>
          </div>

          <div className="flex items-end mt-2">
            <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>#42</h3>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>/ ranking</span>
          </div>

          <p className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>Top 25%</p>
        </div>

        {/* School Points card */}
        <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
          <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

          <div className="flex justify-between items-start mb-1 relative z-10">
            <div className="flex items-center">
              <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
                <Award className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
              </div>
              <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>School Points</p>
            </div>
            <span className={`text-xs font-medium ${isLightMode ? 'bg-orange-100' : 'bg-[#FF6B00]/20'} ${isLightMode ? 'text-orange-700' : 'text-[#FF6B00]'} py-0.5 px-2 rounded-full`}>+250 pontos</span>
          </div>

          <div className="flex items-end mt-2">
            <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>1250</h3>
            <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>sp</span>
          </div>

          <p className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-gray-500'} mt-0.5`}>Próximo nível: 1500</p>
        </div>
      </div>

      {/* Cards maiores - Foco do Dia e Atalhos School */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Foco do Dia */}
        <FocoDoDiaCard />
        
        {/* Card de Atalhos School */}
        <AtalhoSchoolCard />
      </div>
      
      {/* Cards maiores adicionais - Sequência de Estudos e Epictus IA Copiloto */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card de Sequência de Estudos */}
        <SequenciaEstudosCard />
        
        {/* Card de Epictus IA Copiloto */}
        <EpictusIACopilotoCard />
      </div>
    </div>
  );
}