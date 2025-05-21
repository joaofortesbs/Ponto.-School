
import React from "react";
import { Award } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";

// In a real implementation, this would be fetched from a backend
// or calculated based on user activity
interface SchoolPointsData {
  totalPoints: number;
  recentEarned: number;
  nextLevel: number;
  hasRecentPoints: boolean;
}

const useSchoolPointsData = (): SchoolPointsData => {
  // This would normally fetch data from a service
  // For new users, starting with zero
  return {
    totalPoints: 0,
    recentEarned: 0,
    nextLevel: 500,
    hasRecentPoints: false
  };
};

export default function SchoolPointsCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";
  const pointsData = useSchoolPointsData();

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FFD700]/30 hover:translate-y-[-4px]`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#29335C]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#29335C]/5' : 'bg-[#29335C]/5'} rounded-full blur-xl group-hover:bg-[#29335C]/10 transition-all duration-500`}></div>

      <div className="flex justify-between items-start mb-1 relative z-10">
        <div className="flex items-center">
          <div className={`${isLightMode ? 'bg-[#FFD700]/10' : 'bg-[#FFD700]/10'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-[#FFD700]/20' : 'border border-[#FFD700]/20'} mr-2`}>
            <Award className={`h-4 w-4 ${isLightMode ? 'text-[#FFD700]' : 'text-[#FFD700]'}`} />
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>School Points</p>
        </div>
        {pointsData.hasRecentPoints && (
          <span className={`text-xs font-medium bg-[#FFD700]/20 text-[#FFD700] py-0.5 px-2 rounded-full`}>
            +{pointsData.recentEarned} pontos
          </span>
        )}
      </div>

      <div className="flex items-end mt-2">
        <h3 className={`text-2xl font-bold ${isLightMode ? 'text-gray-800' : 'text-white'}`}>
          {pointsData.totalPoints}
        </h3>
        <span className={`text-xs ${isLightMode ? 'text-gray-500' : 'text-gray-400'} ml-1 mb-0.5`}>sp</span>
      </div>

      <p className={`text-[10px] ${isLightMode ? 'text-gray-500' : 'text-gray-400'} mt-0.5`}>
        Próximo nível: {pointsData.nextLevel}
      </p>
    </div>
  );
}
