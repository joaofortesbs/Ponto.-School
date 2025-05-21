
import React from "react";
import { Clock, BookOpen, Trophy, Award } from "lucide-react";

export default function DashboardMetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
      {/* Tempo de estudo card */}
      <div className="group bg-gradient-to-br from-[#0A2540] to-[#0D2B4A] rounded-xl p-5 border border-[#2A4D6E]/30 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="bg-[#0A2540]/90 p-2 rounded-lg shadow-inner border border-[#2A4D6E]/50">
            <Clock className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/20 text-[#FF6B00] py-1 px-2 rounded-full">+1.2%</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-2 font-medium">Tempo de estudo</p>
        
        <div className="flex items-end mt-4">
          <h3 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">32</h3>
          <span className="text-sm text-gray-400 ml-1 mb-0.5">horas</span>
        </div>
        
        <div className="w-full h-1 bg-[#1A365D]/30 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D5C] w-[65%] rounded-full"></div>
        </div>
      </div>

      {/* Aulas concluídas card */}
      <div className="group bg-gradient-to-br from-[#0A2540] to-[#0D2B4A] rounded-xl p-5 border border-[#2A4D6E]/30 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="bg-[#0A2540]/90 p-2 rounded-lg shadow-inner border border-[#2A4D6E]/50">
            <BookOpen className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/10 text-[#FF6B00]/70 py-1 px-2 rounded-full opacity-0">+0%</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-2 font-medium">Aulas concluídas</p>
        
        <div className="flex items-end mt-4">
          <h3 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">24</h3>
          <span className="text-sm text-gray-400 ml-1 mb-0.5">aulas</span>
        </div>
        
        <div className="w-full h-1 bg-[#1A365D]/30 rounded-full mt-4 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D5C] w-[42%] rounded-full"></div>
        </div>
      </div>

      {/* Posição ranking card */}
      <div className="group bg-gradient-to-br from-[#0A2540] to-[#0D2B4A] rounded-xl p-5 border border-[#2A4D6E]/30 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="bg-[#0A2540]/90 p-2 rounded-lg shadow-inner border border-[#2A4D6E]/50">
            <Trophy className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <span className="text-xs font-medium bg-[#FF6B00]/10 text-[#FF6B00]/70 py-1 px-2 rounded-full opacity-0">+0%</span>
        </div>
        
        <p className="text-sm text-gray-400 mb-2 font-medium">Posição ranking</p>
        
        <div className="flex items-end mt-4">
          <h3 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">#42</h3>
          <span className="text-sm text-gray-400 ml-1 mb-0.5">/ ranking</span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
          <span>Top 25%</span>
          <span>▲ 3 posições</span>
        </div>
        
        <div className="w-full h-1 bg-[#1A365D]/30 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D5C] w-[75%] rounded-full"></div>
        </div>
      </div>

      {/* School Points card */}
      <div className="group bg-gradient-to-br from-[#0A2540] to-[#0D2B4A] rounded-xl p-5 border border-[#2A4D6E]/30 shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]">
        <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#FF6B00]/5 rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500"></div>
        
        <div className="flex justify-between items-start mb-3 relative z-10">
          <div className="bg-[#0A2540]/90 p-2 rounded-lg shadow-inner border border-[#2A4D6E]/50">
            <Award className="h-5 w-5 text-[#FF6B00]" />
          </div>
          <div className="flex items-center space-x-1 bg-[#FF6B00]/20 py-1 px-2 rounded-full">
            <span className="text-xs font-medium text-[#FF6B00]">+</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF6B00] h-3 w-3">
              <path d="M2 12h20M12 2v20" />
            </svg>
          </div>
        </div>
        
        <p className="text-sm text-gray-400 mb-2 font-medium">School Points</p>
        
        <div className="flex items-end mt-4">
          <h3 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-white/80">1250</h3>
          <span className="text-sm text-gray-400 ml-1 mb-0.5">sp</span>
        </div>
        
        <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
          <span>Próximo nível: 1500</span>
          <span>+250 pontos</span>
        </div>
        
        <div className="w-full h-1 bg-[#1A365D]/30 rounded-full mt-2 overflow-hidden">
          <div className="h-full bg-gradient-to-r from-[#FF6B00] to-[#FF9D5C] w-[83%] rounded-full"></div>
        </div>
      </div>
    </div>
  );
}
