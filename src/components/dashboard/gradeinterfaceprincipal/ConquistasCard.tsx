
import React from "react";
import { Trophy, Star, Clock, Zap, BookOpen, Award } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { Badge } from "@/components/ui/badge";

export default function ConquistasCard() {
  const { theme } = useTheme();
  const isLightMode = theme === "light";

  // Mock data for achievements (in a real app, this would come from API/backend)
  const achievements = [
    {
      id: 1,
      name: "Primeiro Passo",
      icon: <Clock className="h-3.5 w-3.5" />,
      description: "1 hora de estudo",
      progress: 100,
      unlocked: true,
      category: "Tempo"
    },
    {
      id: 2,
      name: "Estudante Dedicado",
      icon: <Zap className="h-3.5 w-3.5" />,
      description: "5 dias consecutivos",
      progress: 80,
      unlocked: false,
      category: "Dedicação"
    },
    {
      id: 3,
      name: "Multidisciplinar",
      icon: <BookOpen className="h-3.5 w-3.5" />,
      description: "3 disciplinas estudadas",
      progress: 100,
      unlocked: true,
      category: "Aprendizado"
    },
    {
      id: 4,
      name: "Explorador",
      icon: <Star className="h-3.5 w-3.5" />,
      description: "Explorou todas as seções",
      progress: 30,
      unlocked: false,
      category: "Exploração"
    }
  ];

  // Calculate total achievements and unlocked achievements
  const totalAchievements = achievements.length;
  const unlockedAchievements = achievements.filter(a => a.unlocked).length;
  
  // Sort achievements - unlocked first
  const sortedAchievements = [...achievements].sort((a, b) => {
    if (a.unlocked && !b.unlocked) return -1;
    if (!a.unlocked && b.unlocked) return 1;
    return 0;
  });

  return (
    <div className={`group backdrop-blur-md ${isLightMode ? 'bg-white/90' : 'bg-[#001e3a]'} rounded-xl p-3 ${isLightMode ? 'border border-gray-200' : 'border border-white/20'} shadow-lg relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:border-[#FF6B00]/30 hover:translate-y-[-4px]`}>
      <div className="absolute inset-0 bg-gradient-to-tr from-[#FF6B00]/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      <div className={`absolute -right-4 -top-4 w-24 h-24 ${isLightMode ? 'bg-[#FF6B00]/5' : 'bg-[#FF6B00]/5'} rounded-full blur-xl group-hover:bg-[#FF6B00]/10 transition-all duration-500`}></div>

      <div className="flex justify-between items-start mb-3 relative z-10">
        <div className="flex items-center">
          <div className={`${isLightMode ? 'bg-orange-50' : 'bg-[#0A2540]/60'} p-1.5 rounded-lg ${isLightMode ? 'shadow' : 'shadow-inner'} ${isLightMode ? 'border border-orange-100' : 'border border-[#2A4D6E]/50'} mr-2`}>
            <Trophy className={`h-4 w-4 ${isLightMode ? 'text-[#FF6B00]' : 'text-[#FF6B00]'}`} />
          </div>
          <p className={`text-sm ${isLightMode ? 'text-gray-700' : 'text-gray-300'} font-medium`}>Conquistas</p>
        </div>
        <Badge variant={isLightMode ? "outline" : "secondary"} className={`text-xs font-medium ${isLightMode ? 'bg-orange-100 text-orange-700' : 'bg-[#FF6B00]/20 text-[#FF6B00]'} py-0.5 px-2 rounded-full`}>
          {unlockedAchievements}/{totalAchievements}
        </Badge>
      </div>

      {/* Simplified medal badges for achievements - now with improved styling */}
      <div className="flex flex-wrap gap-3 justify-center">
        {sortedAchievements.map((achievement) => (
          <div 
            key={achievement.id}
            className="relative group/medal"
            title={`${achievement.name}: ${achievement.description}`}
          >
            <div className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 ${
              achievement.unlocked 
                ? `${isLightMode ? 'bg-gradient-to-br from-orange-50 to-orange-100 shadow-md' : 'bg-gradient-to-br from-[#FF6B00]/20 to-[#FF6B00]/30'} border-2 border-[#FF6B00]` 
                : `${isLightMode ? 'bg-gray-100 opacity-60' : 'bg-gray-800/40 opacity-60'} border-2 ${isLightMode ? 'border-gray-300' : 'border-gray-700'}`
            }`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                achievement.unlocked 
                  ? `${isLightMode ? 'bg-[#FF6B00]/20' : 'bg-[#FF6B00]/30'}`
                  : `${isLightMode ? 'bg-gray-200' : 'bg-gray-700'}`
              }`}>
                <div className={`${
                  achievement.unlocked 
                    ? `text-[#FF6B00]` 
                    : `${isLightMode ? 'text-gray-400' : 'text-gray-500'}`
                }`}>
                  {achievement.icon}
                </div>
              </div>
            </div>

            {/* Category badge */}
            <Badge className={`absolute -bottom-1 left-1/2 transform -translate-x-1/2 text-[9px] px-1.5 py-0 ${
              achievement.unlocked 
                ? `bg-[#FF6B00] text-white` 
                : `${isLightMode ? 'bg-gray-200 text-gray-500' : 'bg-gray-700 text-gray-400'}`
            }`}>
              {achievement.category}
            </Badge>

            {/* Name tooltip */}
            <div className="absolute opacity-0 group-hover/medal:opacity-100 bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs rounded bg-black/80 text-white whitespace-nowrap pointer-events-none transition-opacity duration-200">
              {achievement.name}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
