
import React from "react";
import { Clock, BookOpen, Trophy, Award } from "lucide-react";

export default function DashboardMetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {/* Tempo de estudo card */}
      <div className="group backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

        <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#0A2540]/60 p-1.5 rounded-lg shadow-inner border border-[#2A4D6E]/50 mr-2">
              <Clock className="h-4 w-4 text-[#FF6B00]" />
            </div>
            <p className="text-sm text-gray-300 font-medium">Tempo de estudo</p>
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/20 text-[#FF6B00] py-0.5 px-2 rounded-full">+1.2%</span>
        </div>

        <div className="flex items-end mt-2">
          <h3 className="text-2xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">32</h3>
          <span className="text-xs text-gray-400 ml-1 mb-0.5">horas</span>
        </div>
      </div>

      {/* Aulas concluídas card */}
      <div className="group backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

        <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#0A2540]/60 p-1.5 rounded-lg shadow-inner border border-[#2A4D6E]/50 mr-2">
              <BookOpen className="h-4 w-4 text-[#FF6B00]" />
            </div>
            <p className="text-sm text-gray-300 font-medium">Aulas concluídas</p>
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/20 text-[#FF6B00] py-0.5 px-2 rounded-full">+4 aulas</span>
        </div>

        <div className="flex items-end mt-2">
          <h3 className="text-2xl font-bold text-white">24</h3>
          <span className="text-xs text-gray-400 ml-1 mb-0.5">aulas</span>
        </div>
      </div>

      {/* Posição ranking card */}
      <div className="group backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

        <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#0A2540]/60 p-1.5 rounded-lg shadow-inner border border-[#2A4D6E]/50 mr-2">
              <Trophy className="h-4 w-4 text-[#FF6B00]" />
            </div>
            <p className="text-sm text-gray-300 font-medium">Posição ranking</p>
          </div>
          <span className="text-xs font-medium bg-green-500/20 text-green-400 py-0.5 px-2 rounded-full">↑ 3 posições</span>
        </div>

        <div className="flex items-end mt-2">
          <h3 className="text-2xl font-bold text-white">#42</h3>
          <span className="text-xs text-gray-400 ml-1 mb-0.5">/ ranking</span>
        </div>
        
        <p className="text-[10px] text-gray-500 mt-0.5">Top 25%</p>
      </div>

      {/* School Points card */}
      <div className="group backdrop-blur-md bg-white/5 rounded-xl p-3 border border-white/20 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>

        <div className="flex justify-between items-start mb-1 relative z-10">
          <div className="flex items-center">
            <div className="bg-[#0A2540]/60 p-1.5 rounded-lg shadow-inner border border-[#2A4D6E]/50 mr-2">
              <Award className="h-4 w-4 text-[#FF6B00]" />
            </div>
            <p className="text-sm text-gray-300 font-medium">School Points</p>
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/20 text-[#FF6B00] py-0.5 px-2 rounded-full">+250 pontos</span>
        </div>

        <div className="flex items-end mt-2">
          <h3 className="text-2xl font-bold text-white">1250</h3>
          <span className="text-xs text-gray-400 ml-1 mb-0.5">sp</span>
        </div>

        <p className="text-[10px] text-gray-500 mt-0.5">Próximo nível: 1500</p>
      </div>
    </div>
  );
}
