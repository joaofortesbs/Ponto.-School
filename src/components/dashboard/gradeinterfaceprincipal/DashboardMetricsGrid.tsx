
import React from "react";
import { Clock, BookOpen, Trophy, Award } from "lucide-react";

export default function DashboardMetricsGrid() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      {/* Tempo de estudo card */}
      <div className="bg-[#0A2540] rounded-lg p-4 border border-[#1A365D]/20 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <Clock className="h-5 w-5 text-[#FF6B00]" />
          <span className="text-xs text-[#FF6B00]">+1.2%</span>
        </div>
        <p className="text-sm text-gray-400 mb-1">Tempo de estudo</p>
        <div className="flex items-end">
          <h3 className="text-2xl font-bold text-white">32</h3>
          <span className="text-sm text-gray-400 ml-1">horas</span>
        </div>
      </div>

      {/* Aulas concluídas card */}
      <div className="bg-[#0A2540] rounded-lg p-4 border border-[#1A365D]/20 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <BookOpen className="h-5 w-5 text-[#FF6B00]" />
          <span className="text-xs invisible">+0%</span>
        </div>
        <p className="text-sm text-gray-400 mb-1">Aulas concluídas</p>
        <div className="flex items-end">
          <h3 className="text-2xl font-bold text-white">24</h3>
          <span className="text-sm text-gray-400 ml-1">aulas</span>
        </div>
      </div>

      {/* Posição ranking card */}
      <div className="bg-[#0A2540] rounded-lg p-4 border border-[#1A365D]/20 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <Trophy className="h-5 w-5 text-[#FF6B00]" />
          <span className="text-xs invisible">+0%</span>
        </div>
        <p className="text-sm text-gray-400 mb-1">Posição ranking</p>
        <div className="flex items-end">
          <h3 className="text-2xl font-bold text-white">#42</h3>
          <span className="text-sm text-gray-400 ml-1">/ ranking</span>
        </div>
      </div>

      {/* School Points card */}
      <div className="bg-[#0A2540] rounded-lg p-4 border border-[#1A365D]/20 shadow-sm relative overflow-hidden transition-all duration-300 hover:shadow-md">
        <div className="flex justify-between items-start mb-2">
          <Award className="h-5 w-5 text-[#FF6B00]" />
          <div className="flex items-center space-x-1">
            <span className="text-xs text-[#FF6B00]">+</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#FF6B00] h-3 w-3">
              <path d="M2 12h20M12 2v20" />
            </svg>
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-1">School Points</p>
        <div className="flex items-end">
          <h3 className="text-2xl font-bold text-white">1250</h3>
          <span className="text-sm text-gray-400 ml-1">sp</span>
        </div>
      </div>
    </div>
  );
}
